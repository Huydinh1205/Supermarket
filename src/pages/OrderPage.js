import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Button,
  IconButton,
  Stack,
  Divider,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { Add, Remove, Delete, Api, Diversity1 } from "@mui/icons-material";
import { fCurrency } from "../utils";
import { useAuth } from "../contexts/useAuth";
import apiService from "../app/apiService";

function OrderPage() {
  const navigate = useNavigate();
  const location = useLocation(); // Để lấy giỏ hàng từ state
  const { user } = useAuth(); // Giả sử bạn đã có hook useAuth để lấy thông tin người dùng
  const [cart, setCart] = useState(location.state?.cart || []); // Lấy giỏ hàng từ state, nếu không có sẽ là mảng rỗng
  const [orders, setOrders] = useState([]); // Danh sách đơn hàng
  const [loading, setLoading] = useState(false); // Trạng thái loading
  const [error, setError] = useState(""); // Trạng thái lỗi
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true); // Set loading to true when fetching starts
      setError(""); // Clear any previous errors

      try {
        const response = await apiService.get(`/todos/orders/${user.id}`); // Replace with your actual endpoint for fetching orders
        setOrders(response.data); // Assuming response.data contains the orders
      } catch (err) {
        setError(err.message); // Set error message if the fetch fails
      } finally {
        setLoading(false); // Set loading to false when done (whether successful or failed)
      }
    };

    fetchOrders();
  }, []);
  if (orders.length === 0) {
    return <Typography>Loading...</Typography>;
  }

  const { order, products } = orders;
  const handleQuantityChange = (product, change) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === product.id) {
          const newQuantity = item.quantity + change;
          if (newQuantity >= 1 && newQuantity <= 10) {
            return { ...item, quantity: newQuantity };
          }
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  return (
    <Container sx={{ py: 5, minHeight: "100vh" }}>
      <Button
        variant="contained"
        sx={{ mb: 3 }}
        onClick={() => navigate("/", { state: { cart } })}
      >
        Back to Homepage
      </Button>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Chart{" "}
        </Typography>

        {cart.length === 0 ? (
          <Typography>No products in your cart.</Typography>
        ) : (
          <Box>
            {cart.map((product) => (
              <Box
                key={product.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                  justifyContent: "space-between", // Đảm bảo các phần tử được căn đều
                }}
              >
                <Box sx={{ mr: 2 }}>
                  <img
                    onClick={() => navigate(`/product/${product.id}`)} // Chuyển hướng đến trang chi tiết sản phẩm
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      cursor: "pointer",
                    }}
                  />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1">{product.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {fCurrency(product.price * product.quantity)}
                  </Typography>
                </Box>

                {/* Điều chỉnh số lượng sản phẩm */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconButton
                    onClick={() => handleQuantityChange(product, -1)}
                    disabled={product.quantity <= 1}
                  >
                    <Remove />
                  </IconButton>

                  {/* Hiển thị số lượng sản phẩm */}
                  <Typography
                    variant="body1"
                    sx={{ width: 30, textAlign: "center" }}
                  >
                    {product.quantity}
                  </Typography>

                  <IconButton
                    onClick={() => handleQuantityChange(product, 1)}
                    disabled={product.quantity >= 10}
                  >
                    <Add />
                  </IconButton>
                </Stack>

                {/* Thùng rác để xóa sản phẩm */}
                <IconButton
                  onClick={() => handleRemoveItem(product.id)}
                  sx={{ ml: 2 }}
                >
                  <Delete />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </Box>
      {cart.length !== 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 4,
          }}
        >
          <Box>
            <Typography variant="h6">Total:</Typography>
            <Typography variant="h6">
              {fCurrency(
                cart.reduce(
                  (total, product) => total + product.price * product.quantity,
                  0
                )
              )}
            </Typography>

            <Button
              variant="contained"
              sx={{ mt: 4, mb: 4 }}
              onClick={() => navigate("/payment", { state: { cart } })}
            >
              Proceed to Order
            </Button>
          </Box>
        </Box>
      ) : (
        <></>
      )}
      <Divider sx={{ mb: 2 }} />
      <Box>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Orders List
        </Typography>
        {orders.map((orderData) => {
          const { order, products } = orderData;

          return (
            <Box key={order.id} sx={{ mb: 4 }}>
              <Typography variant="h5">Order #{order.id}</Typography>
              <Typography variant="h6">
                Customer: {order.customer_name}
              </Typography>
              <Typography variant="body1">Status: {order.status}</Typography>
              <Typography variant="body1">
                Total Cost: {order.total_cost}
              </Typography>
              <Typography variant="body1">
                Order Date: {new Date(order.order_date).toLocaleString()}
              </Typography>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6">Products</Typography>
                {Array.isArray(products) && products.length > 0 ? (
                  products.map((product) => (
                    <Box key={product.product_id} sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={2}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1">
                            {product.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Price: {product.price} x {product.quantity}
                          </Typography>
                        </Box>
                        <Typography variant="body1">
                          Total: {product.price * product.quantity}
                        </Typography>
                      </Stack>
                    </Box>
                  ))
                ) : (
                  <Typography>No products found.</Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Container>
  );
}

export default OrderPage;
