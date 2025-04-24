import React, { useState, useEffect } from "react";
import { Alert, Box, Container, Stack } from "@mui/material";
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
  
  const defaultValues = {
    categoryid: "0",  // Changed to string "0" to match our updated ProductFilter
    priceRange: "",
    sortBy: "featured",
    searchQuery: "",
  };
  
  const methods = useForm({
    defaultValues,
  });
  
  const { watch, reset } = methods;
  const filters = watch();
  const filterProducts = applyFilter(products, filters);

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      try {
        const res = await apiService.get("/api/products");
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
      <Stack>
        <FormProvider methods={methods}>
          <ProductFilter resetFilter={reset} />
        </FormProvider>
      </Stack>
      <Stack sx={{ flexGrow: 1 }}>
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
        <Box sx={{ position: "relative", height: 1 }}>
          {loading ? (
            <LoadingScreen />
          ) : (
            <>
              {error ? (
                <Alert severity="error">{error}</Alert>
              ) : (
                <ProductList products={filterProducts} />
              )}
            </>
          )}
        </Box>
      </Stack>
    </Container>
  );
}

function applyFilter(products, filters) {
  const { sortBy, categoryid, priceRange, searchQuery } = filters;
  let filteredProducts = [...products];
  
  // For debugging - log the filter values
  console.log("Applied filters:", filters);

  // SORT BY
  if (sortBy === "featured") {
    filteredProducts = orderBy(filteredProducts, ["sold"], ["desc"]);
  }
  if (sortBy === "newest") {
    filteredProducts = orderBy(filteredProducts, ["createdAt"], ["desc"]);
  }
  if (sortBy === "priceDesc") {
    filteredProducts = orderBy(filteredProducts, ["price"], ["desc"]);
  }
  if (sortBy === "priceAsc") {
    filteredProducts = orderBy(filteredProducts, ["price"], ["asc"]);
  }

  // FILTER PRODUCTS
  if (categoryid && categoryid !== "0") { // Changed comparison to string "0"
    // Debug what's coming from the form
    console.log("Category filter type:", typeof categoryid);
    console.log("Category filter value:", categoryid);
    
    // Ensure we're working with a number for comparison
    const categoryIdNum = Number(categoryid);
    
    filteredProducts = filteredProducts.filter((product) => {
      return product.categoryid === categoryIdNum;
    });
  }
  
  if (priceRange) {
    filteredProducts = filteredProducts.filter((product) => {
      if (priceRange === "below") {
        return product.price < 25;
      }
      if (priceRange === "between") {
        return product.price >= 25 && product.price <= 75;
      }
      return product.price > 75;
    });
  }
  
  if (searchQuery) {
    filteredProducts = filteredProducts.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  // Debug the filter results
  console.log("Filtered products count:", filteredProducts.length);
  
  return filteredProducts;
}

export default HomePage;