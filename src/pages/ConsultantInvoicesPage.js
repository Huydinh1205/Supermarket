import React, { useEffect, useState, useCallback } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // <- new
import { useAuth } from "../contexts/useAuth";
import apiService from "../app/apiService";
import { useNavigate } from "react-router-dom"; // <- new

export default function ConsultantInvoicesPage() {
  const { user } = useAuth();
  const navigate = useNavigate(); // <- new
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadInvoices = useCallback(async () => {
    if (!user?.employeeId) return;
    setLoading(true);
    try {
      const res = await apiService.get(`/api/consultants/${user.employeeId}/invoices`);
      console.log("Invoices Data from API:", res.data);
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    console.log("Current user:", user);
    loadInvoices();
  }, [loadInvoices]);

  return (
    <Container sx={{ py: 5 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 4,
        }}
      >
        <Typography variant="h4" gutterBottom>
          My Invoices
        </Typography>

        {/* Back Button */}
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/consultant-dashboard")}
        >
          Back to Consulting
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ mt: 3 }}>
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={loadInvoices}
                startIcon={<RefreshIcon />}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </Box>
      ) : invoices.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 5 }}>
          <Typography variant="h6" gutterBottom>No invoices to show.</Typography>
          <Typography variant="body2" color="text.secondary">
            Once you start consulting and generating invoices, they will appear here.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {invoices.map((inv) => (
            <Grid item xs={12} sm={6} md={4} key={inv.invoiceid}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Invoice #{inv.invoiceid}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Date: {new Date(inv.exportingdate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Customer: {inv.customer_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quantity: {inv.quantity}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Cost: ${Number(inv.totalcost).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
