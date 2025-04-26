import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Container } from "@mui/material";

function PaymentSuccessPage() {
  const { productid } = useParams(); // Get productid from the URL
  const navigate = useNavigate();

  return (
    <Container sx={{ py: 5, minHeight: "100vh" }}>
      <Button variant="contained" sx={{ mb: 3 }} onClick={() => navigate("/")}>
        Back to Homepage
      </Button>
      
      <Box sx={{ textAlign: "center", padding: 2 }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Payment Successful!
        </Typography>
        <Typography variant="body1">
          Your payment for Product {productid} has been processed successfully.
        </Typography>
      </Box>
    </Container>
  );
}

export default PaymentSuccessPage;