import React, { useState, useEffect } from "react";
import { Alert, Badge, Box, Button, Container, Stack } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import ProductFilter from "../components/ProductFilter";
import ProductSearch from "../components/ProductSearch";
import ProductSort from "../components/ProductSort";
import ProductList from "../components/ProductList";
import { FormProvider } from "../components/form";
import { useForm } from "react-hook-form";
import apiService from "../app/apiService";
import orderBy from "lodash/orderBy";
import LoadingScreen from "../components/LoadingScreen";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation(); // Để lấy giỏ hàng từ state

  const defaultValues = {
    category: "", // Khớp với giá trị của "All" trong categoryOptions
    priceRange: "", // Không chọn nút nào trong priceRange
    sortBy: "featured",
    searchQuery: "",
  };

  const methods = useForm({ defaultValues });
  const { watch } = methods;
  const filters = watch();
  const filterProducts = applyFilter(products, filters);
  const reset = () => {
    methods.reset(defaultValues);
    console.log("category", defaultValues.category);
  };
  const [cart, setCart] = useState(location.state?.cart || []); // Nếu có state thì lấy từ đó, nếu không có thì là mảng rỗng

  const handleAddToCart = (product) => {
    const productWithQuantity = { ...product, quantity: 1 }; // Thêm quantity vào sản phẩm
    setCart((prevCart) => [...prevCart, productWithQuantity]);
  };

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      try {
        const res = await apiService.get("/todos/products");
        setProducts(res.data);
        setError("");
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  return (
    <Container sx={{ display: "flex", minHeight: "100vh", mt: 3 }}>
      {/* Sidebar Filters */}
      <Stack>
        <FormProvider methods={methods}>
          <ProductFilter resetFilter={reset} />
        </FormProvider>
      </Stack>

      {/* Main Content Area */}
      <Stack sx={{ flexGrow: 1 }}>
        {/* Navigation Buttons */}
        <Stack direction="row" spacing={2} mb={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={() => navigate("/profile")}>
            Profile
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/orders", { state: { cart } })}
          >
            Orders
            <Badge
              badgeContent={cart.length}
              color="error"
              sx={{
                position: "absolute",
                top: -5,
                right: -5,
                borderRadius: "50%",
                width: 20,
                height: 20,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            />
          </Button>
        </Stack>

        {/* Filter bar: Search + Sort */}
        <FormProvider methods={methods}>
          <Stack
            spacing={2}
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ sm: "center" }}
            justifyContent="space-between"
            mb={2}
          >
            <ProductSearch />
            <ProductSort />
          </Stack>
        </FormProvider>

        {/* Product List */}
        <Box sx={{ position: "relative", height: 1 }}>
          {loading ? (
            <LoadingScreen />
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <ProductList
              products={filterProducts}
              onAddToCart={handleAddToCart}
            />
          )}
        </Box>
      </Stack>
    </Container>
  );
}

function applyFilter(products, filters) {
  const { sortBy, category, priceRange, searchQuery } = filters;
  let filteredProducts = [...products];

  // SORT BY
  if (sortBy === "featured") {
    filteredProducts = orderBy(filteredProducts, ["sold"], ["desc"]);
  }
  if (sortBy === "newest") {
    filteredProducts = orderBy(filteredProducts, ["createdat"], ["desc"]);
  }
  if (sortBy === "priceDesc") {
    filteredProducts = orderBy(filteredProducts, ["price"], ["desc"]);
  }
  if (sortBy === "priceAsc") {
    filteredProducts = orderBy(filteredProducts, ["price"], ["asc"]);
  }

  // FILTER BY CATEGORY
  if (category && category !== "") {
    // Chỉ lọc nếu category không phải "All"
    const categoryName = category;
    console.log("categoryName", categoryName);
    filteredProducts = filteredProducts.filter((product) => {
      console.log(product.type);
      return product.type === categoryName;
    });
  }

  // FILTER BY PRICE
  if (priceRange) {
    filteredProducts = filteredProducts.filter((product) => {
      if (priceRange === "below") return product.price < 25;
      if (priceRange === "between")
        return product.price >= 25 && product.price <= 75;
      return product.price > 75;
    });
  }

  // FILTER BY SEARCH QUERY
  if (searchQuery) {
    filteredProducts = filteredProducts.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return filteredProducts;
}

export default HomePage;
