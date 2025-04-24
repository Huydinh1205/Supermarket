import * as React from "react";
import { useParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";

function PaymentSuccessPage() {
  const { productid } = useParams(); // Get productid from the URL

  return (
    <Box sx={{ textAlign: "center", padding: 2 }}>
      <Typography variant="h4" color="primary" gutterBottom>
        Payment Successful!
      </Typography>
      <Typography variant="body1">
        Your payment for Product {productid} has been processed successfully.
      </Typography>
    </Box>
  );
}

export default PaymentSuccessPage;
