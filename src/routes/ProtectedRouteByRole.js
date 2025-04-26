import React from "react";
import { useAuth } from "../contexts/useAuth";
import { Navigate } from "react-router-dom";

function ProtectedRouteByRole({ allowedRole, children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;

  if (user?.role !== allowedRole) return <Navigate to="/" />;

  return children;
}

export default ProtectedRouteByRole;
