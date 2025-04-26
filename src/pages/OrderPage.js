import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Alert, Container, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import apiService from "../app/apiService";
import { useAuth } from "../contexts/useAuth";

function OrderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        // Step 1: Get the customer info using the existing API endpoint
        const customerResponse = await apiService.get(`/api/customers/by-user/${user.id}`);
        
        if (!customerResponse.data || !customerResponse.data.customerid) {
          setError("Customer information not found");
          setLoading(false);
          return;
        }
        
        const customerId = customerResponse.data.customerid;
        
        // Step 2: Now fetch orders using the customerid
        const ordersResponse = await apiService.get(`/api/customers/${customerId}/orders`);
        setOrders(ordersResponse.data);
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
    <Container sx={{ py: 5, minHeight: "100vh" }}>
      <Button variant="contained" sx={{ mb: 3 }} onClick={() => navigate("/")}>
        Back to Homepage
      </Button>

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
                <Typography><strong>Product ID:</strong> {order.productid}</Typography>
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