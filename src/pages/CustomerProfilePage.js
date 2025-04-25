import React, { useState, useEffect } from "react";
import { 
  Alert, 
  Box, 
  Container, 
  Stack, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  Grid,
  Divider
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import apiService from "../app/apiService";
import LoadingScreen from "../components/LoadingScreen";
import { useAuth } from "../contexts/useAuth";

export default function CustomerProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await apiService.get(`/api/profile/customer/${user.id}`);
        setCustomerInfo(res.data);
        setError("");
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return (
    <Container sx={{ py: 5, minHeight: "100vh" }}>
      <Button variant="contained" sx={{ mb: 3 }} onClick={() => navigate("/")}>
        Back to Homepage
      </Button>

      <Typography variant="h4" sx={{ mb: 4 }}>
        Customer Profile
      </Typography>

      {loading ? (
        <LoadingScreen />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Personal Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {customerInfo ? (
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Name
                      </Typography>
                      <Typography variant="body1">{customerInfo.name}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">{customerInfo.email}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body1">{customerInfo.phonenumber}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Address
                      </Typography>
                      <Typography variant="body1">{customerInfo.address}</Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      sx={{ alignSelf: "flex-start" }}
                      onClick={() => navigate("/profile/edit")}
                    >
                      Edit Information
                    </Button>
                  </Stack>
                ) : (
                  <Typography color="text.secondary">
                    No customer info available.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
