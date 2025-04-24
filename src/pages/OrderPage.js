import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Alert, Container } from "@mui/material";
import apiService from "../app/apiService";
import { useAuth } from "../contexts/useAuth";

function OrderPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const response = await apiService.get(`/api/customers/${user.id}/orders`);
        setOrders(response.data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.id]);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Orders
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box>
          {orders.length === 0 ? (
            <Typography>No orders found.</Typography>
          ) : (
            orders.map((order) => (
              <Box key={order.orderid} sx={{ mb: 2, p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
                <Typography><strong>Order ID:</strong> {order.orderid}</Typography>
                <Typography><strong>Status:</strong> {order.status}</Typography>
                <Typography><strong>Address:</strong> {order.address}</Typography>
                <Typography><strong>Product Name:</strong> {order.productname}</Typography>
                <Typography><strong>Price:</strong> ${order.price}</Typography>
                <Typography><strong>Payment Method:</strong> {order.paymentmethod}</Typography>
                <Typography><strong>Order Date:</strong> {new Date(order.orderdate).toLocaleDateString()}</Typography>
              </Box>
            ))
          )}
        </Box>
      )}
    </Container>
  );
}

export default OrderPage;
