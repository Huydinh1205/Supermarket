import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, CircularProgress, Alert, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import apiService from "../app/apiService";

function MemberAccountInfo() {
  const [memberInfo, setMemberInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Get username from localStorage
  const username = localStorage.getItem("username");

  useEffect(() => {
    const fetchMemberInfo = async () => {
      if (!username || username === "undefined") {
        console.log("No valid username found in localStorage.");
        setError("No user information found. Please log in.");
        return;
      }
  
      setLoading(true);
      try {
        // Make sure username is a string and properly encoded for URL
        const encodedUsername = encodeURIComponent(username);
        const res = await apiService.get(`/api/memberaccount/user/${encodedUsername}`);
        setMemberInfo(res.data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to load membership info.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchMemberInfo();
  }, [username]);
  
  
  
  // Rest of the component remains the same
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!memberInfo) {
    return (
      <Container>
        <Typography variant="h6" align="center" sx={{ mt: 5 }}>
          No Membership Info Found.
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ minHeight: "100vh", mt: 5 }}>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        Back
      </Button>

      <Card sx={{ maxWidth: 500, mx: "auto", boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Membership Details
          </Typography>

          <Typography variant="subtitle1">
            Type: <b>{memberInfo.type}</b>
          </Typography>

          <Typography variant="subtitle1">
            Points: <b>{memberInfo.points}</b>
          </Typography>

          <Typography variant="subtitle1">
            Start Date: <b>{new Date(memberInfo.startdate).toLocaleDateString()}</b>
          </Typography>

          <Typography variant="subtitle1">
            Due Date: <b>{new Date(memberInfo.duedate).toLocaleDateString()}</b>
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}

export default MemberAccountInfo;