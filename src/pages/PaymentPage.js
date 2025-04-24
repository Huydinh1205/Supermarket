import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Box, Typography, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from "@mui/material";

function PaymentPage() {
  const { productid } = useParams(); // Get the productid from the URL
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = React.useState('');

  // Handle payment method change
  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  // Simulate payment based on method
  const handleProceedPayment = () => {
    if (paymentMethod === '') {
      alert('Please select a payment method!');
      return;
    }

    // Here you could add real payment logic based on the selected method.
    alert(`Proceeding with ${paymentMethod} payment for product ${productid}`);
    navigate(`/payment-success/${productid}`);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 400, margin: 'auto', padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Choose Payment Method for Product {productid}
      </Typography>

      <FormControl component="fieldset" fullWidth>
        <FormLabel component="legend">Payment Method</FormLabel>
        <RadioGroup
          aria-label="payment-method"
          name="payment-method"
          value={paymentMethod}
          onChange={handlePaymentMethodChange}
        >
          <FormControlLabel value="online" control={<Radio />} label="Online Payment" />
          <FormControlLabel value="offline" control={<Radio />} label="Offline Payment" />
        </RadioGroup>
      </FormControl>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleProceedPayment}
      >
        Proceed with Payment
      </Button>
    </Box>
  );
}

export default PaymentPage;
