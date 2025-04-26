import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import apiService from "../app/apiService";
import { useAuth } from "../contexts/useAuth"; // adjust path if needed

function CashierDashboard() {
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth(); // now 'user' is defined
  useEffect(() => {
    const fetchCashierData = async () => {
      if (!user?.id) return;
  
      try {
        setLoading(true);
  
        const res = await apiService.get(`/api/employee/by-user/${user.id}`);
        const employee = res.data;
  
        if (employee?.role !== "Cashier") {
          setError("Access denied: not a cashier.");
          return;
        }
  
        // Use employeeid to fetch this cashier's assigned counter data
        const cashierRes = await apiService.get(`/api/cashiers/${employee.employeeid}`);
        setCashiers([cashierRes.data]); // assuming one cashier per login
      } catch (err) {
        console.error("Error loading cashier data:", err);
        setError("Failed to load cashier data.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchCashierData();
  }, [user?.id]);
  
  return (
    <Container sx={{ py: 5 }}>
      <Typography variant="h4" gutterBottom>
        Cashier Dashboard
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Grid container spacing={3}>
          {cashiers.map((cashier) => (
            <Grid item xs={12} sm={6} md={4} key={cashier.employeeid}>
              <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h6">{cashier.name}</Typography>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {cashier.phonenumber}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Salary:</strong> ${cashier.salary}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Counter ID:</strong> {cashier.counterid}
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

export default CashierDashboard;
