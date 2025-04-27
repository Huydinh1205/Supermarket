import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../contexts/useAuth";
import apiService from "../app/apiService";

export default function PaymentPageAll() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState("");
  const [error, setError] = useState("");
  const [cart, setCart] = useState(location.state?.cart || []); // Lấy giỏ hàng từ state
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(!location.state?.cart);

  // Fetch customer profile
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication required");
        setLoading(false);
        navigate("/login");
        return;
      }

      try {
        const res = await apiService.get(`/todos/profile/customer/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCustomer(res.data);
        setError("");
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchProfile();
    }
  }, [user, navigate]);

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleProceedPayment = async () => {
    setError("");

    if (!paymentMethod) {
      setError("Please select a payment method!");
      return;
    }
    if (!customer?.id) {
      setError("Could not determine your customer ID.");
      return;
    }

    setLoading(true);

    try {
      // Tạo payload cho nhiều sản phẩm
      const products = cart.map((item) => ({
        productID: item.id,
        quantity: item.quantity,
      }));

      const payload = {
        customerID: customer.id,
        products: products, // Gửi danh sách các sản phẩm và số lượng
        paymentmethod: paymentMethod, // gửi đúng ENUM: 'Cash', 'Credit Card', 'Debit Card', 'Online'
      };

      console.log("Placing order with payload:", payload);

      const res = await apiService.post("/todos/ordersAll", payload);

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
        Payment for {cart.length} Product{cart.length > 1 ? "s" : ""}
      </Typography>

      {loading && <CircularProgress sx={{ my: 2 }} />}

      {!loading && error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && cart.length > 0 && (
        <Box sx={{ mb: 2 }}>
          {cart.map((product) => (
            <Typography key={product.id}>
              <strong>{product.name}</strong> - ${product.price} x{" "}
              {product.quantity} = ${product.price * product.quantity}
            </Typography>
          ))}
        </Box>
      )}

      <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
        <FormLabel component="legend">Payment Method</FormLabel>
        <RadioGroup
          name="payment-method"
          value={paymentMethod}
          onChange={handlePaymentMethodChange}
        >
          <FormControlLabel value="Cash" control={<Radio />} label="Cash" />
          <FormControlLabel
            value="Credit Card"
            control={<Radio />}
            label="Credit Card"
          />
          <FormControlLabel
            value="Debit Card"
            control={<Radio />}
            label="Debit Card"
          />
          <FormControlLabel
            value="Online"
            control={<Radio />}
            label="Online Payment"
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
