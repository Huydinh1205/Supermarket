import React from "react";
import Typography from "@mui/material/Typography";
import { Box, Link } from "@mui/material";
import { AuthProvider } from "./contexts/useAuth";
import HomePage from "./pages/HomePage";
import ThemeProvider from "./contexts/ThemeProvider";
import Router from "./routes/index"; // Assuming your routes are in this component

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://www.coderschool.vn">
        CoderSchool
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
