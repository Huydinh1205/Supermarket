import React from "react";
import Typography from "@mui/material/Typography";
import { Box, Link } from "@mui/material";
import { AuthProvider } from "./contexts/useAuth";
import HomePage from "./pages/HomePage";
import ThemeProvider from "./contexts/ThemeProvider";
import Router from "./routes/index";
import { BrowserRouter } from "react-router-dom";
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
      <BrowserRouter>
        <ThemeProvider>
          <Router />
        </ThemeProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
