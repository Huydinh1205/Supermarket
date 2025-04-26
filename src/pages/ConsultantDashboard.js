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

export default function ConsultantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate(); // <- new
  const [consultantData, setConsultantData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to load consultant data
  const loadConsultantData = useCallback(async () => {
    if (!user?.employeeId) {
      console.log("No employeeId available in user object");
      return;
    }
    setLoading(true);
    try {
      console.log("Fetching consultant data for employee:", user.employeeId);

      // Fetch consultant profile from the API
      const res = await apiService.get(`/api/employee/${user.employeeId}/profile`);
      console.log("Consultant Data from API:", res.data);
      setConsultantData(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load consultant profile");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    console.log("Current user:", user);
    loadConsultantData(); // Fetch data when component mounts
  }, [loadConsultantData]);

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
        <Typography variant="h4">Consultant Dashboard</Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/consultant-invoices")}
        >
          View My Invoices
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
                onClick={loadConsultantData}
                startIcon={<RefreshIcon />}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </Box>
      ) : consultantData ? (
        <Card>
          <CardContent>
            <Typography variant="h6">{consultantData.name}</Typography>
            <Typography>Phone: {consultantData.phonenumber}</Typography>
            <Typography>Role: {consultantData.role}</Typography>
            <Typography>Salary: ${consultantData.salary}</Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ textAlign: "center", mt: 5 }}>
          <Typography variant="h6" gutterBottom>No consultant profile found.</Typography>
          <Typography variant="body2" color="text.secondary">
            No profile information is available for this consultant.
          </Typography>
        </Box>
      )}
    </Container>
  );
}
