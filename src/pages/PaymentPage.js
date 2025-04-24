// src/pages/PaymentPage.js
import * as React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  CircularProgress
} from "@mui/material";
import { useAuth } from "../contexts/useAuth";
import apiService from "../app/apiService";

export default function PaymentPage() {
  const { productid } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState("");
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1) Fetch product details
  useEffect(() => {
    if (!productid) return;
    setLoading(true);
    apiService
      .get(`/api/products/${productid}`)
      .then(res => setProduct(res.data))
      .catch(() => setError("Failed to load product details"))
      .finally(() => setLoading(false));
  }, [productid]);

  // 2) Fetch customer record (to get CustomerID)
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    apiService
      .get(`/api/profile/customer/${user.id}`)
      .then(res => setCustomer(res.data))
      .catch(() => setError("Failed to load your customer profile"))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handlePaymentMethodChange = e => {
    setPaymentMethod(e.target.value);
  };

  const handleProceedPayment = async () => {
    setError("");

    if (!paymentMethod) {
      setError("Please select a payment method!");
      return;
    }
    if (!customer?.customerid) {
      setError("Could not determine your customer ID.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customerID: customer.customerid,
        productID: parseInt(productid, 10),
        paymentmethod: paymentMethod, // note lowercase to match your API
      };

      console.log("Placing order with payload:", payload);

      const res = await apiService.post("/api/orders", payload);

      // on success, navigate to success page
      if (res.status === 201 && res.data.orderID) {
        navigate(`/payment-success/${res.data.orderID}`);
      } else {
        setError("Unexpected server response.");
      }
    } catch (err) {
      console.error("Order creation failed:", err);
      setError(
        err.response?.data?.error ||
          "Failed to process your order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 400, mx: "auto", p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Payment for {product?.name || `Product #${productid}`}
      </Typography>

      {loading && <CircularProgress sx={{ my: 2 }} />}

      {!loading && error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && product && (
        <Box sx={{ mb: 2 }}>
          <Typography>
            <strong>Price:</strong> ${product.price}
          </Typography>
        </Box>
      )}

      <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
        <FormLabel component="legend">Payment Method</FormLabel>
        <RadioGroup
          name="payment-method"
          value={paymentMethod}
          onChange={handlePaymentMethodChange}
        >
          <FormControlLabel
            value="online"
            control={<Radio />}
            label="Online Payment"
          />
          <FormControlLabel
            value="offline"
            control={<Radio />}
            label="Offline Payment"
          />
        </RadioGroup>
      </FormControl>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        We'll use your saved address for delivery.
      </Typography>

      <Button
        variant="contained"
        fullWidth
        onClick={handleProceedPayment}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : "Proceed with Payment"}
      </Button>
    </Box>
  );
}
