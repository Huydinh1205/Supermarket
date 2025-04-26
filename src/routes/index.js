import * as React from "react";
import { Routes, Route } from "react-router-dom";
import BlankLayout from "../layouts/BlankLayout";
import MainLayout from "../layouts/MainLayout";
import DetailPage from "../pages/DetailPage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import SignUpPage from "../pages/SignUpPage";
import NotFoundPage from "../pages/NotFoundPage";
import AuthRequire from "./AuthRequire";
import CustomerProfilePage from "../pages/CustomerProfilePage";
import OrderPage from "../pages/OrderPage";
// 👉 Import the new payment pages
import PaymentPage from "../pages/PaymentPage";
import PaymentSuccessPage from "../pages/PaymentSuccessPage";
import CashierDashboard from "../pages/CashierDashboard";
import ConsultantDashboard from "../pages/ConsultantDashboard";
import ProtectedRouteByRole from "./ProtectedRouteByRole"; // you'll create this
import ConsultantInvoicesPage from "../pages/ConsultantInvoicesPage";

function Router() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AuthRequire>
            <MainLayout />
          </AuthRequire>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="product/:id" element={<DetailPage />} />
        <Route path="profile" element={<CustomerProfilePage />} />
        <Route path="payment/:productid" element={<PaymentPage />} />
        <Route path="/orders" element={<OrderPage />} />
        <Route path="payment-success/:productid" element={<PaymentSuccessPage />} />
      </Route>

      <Route element={<BlankLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Cashier Dashboard Route */}
      <Route
        path="/cashier-dashboard"
        element={
          <ProtectedRouteByRole allowedRole="Cashier">
            <CashierDashboard />
          </ProtectedRouteByRole>
        }
      />

      {/* Consultant Dashboard Route */}
      <Route
        path="/consultant-dashboard"
        element={
          <ProtectedRouteByRole allowedRole="Consultant">
            <ConsultantDashboard />
          </ProtectedRouteByRole>
        }
      />

      {/* Consultant Invoices Route */}
      <Route
        path="/consultant-invoices"
        element={
          <ProtectedRouteByRole allowedRole="Consultant">
            <ConsultantInvoicesPage />
          </ProtectedRouteByRole>
        }
      />
    </Routes>
  );
}

export default Router;
