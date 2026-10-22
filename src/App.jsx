import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientForm from "./pages/PatientForm";
import PatientProfile from "./pages/PatientProfile";
import Consultations from "./pages/Consultations";
import ConsultationWizard from "./pages/ConsultationWizard";
import VisitDetail from "./pages/VisitDetail";
import Billing from "./pages/Billing";
import BillDetail from "./pages/BillDetail";
import PrintPrescription from "./pages/PrintPrescription";
import PrintReceipt from "./pages/PrintReceipt";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Route Guard component
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--color-bg)",
          color: "var(--color-primary)",
          fontSize: "var(--font-size-sm)",
          fontWeight: "500",
        }}
      >
        Initializing clinical session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Redirect logged-in doctor away from login page to dashboard
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Public Login */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/patients"
              element={
                <ProtectedRoute>
                  <Patients />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients/new"
              element={
                <ProtectedRoute>
                  <PatientForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients/:id"
              element={
                <ProtectedRoute>
                  <PatientProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients/:id/edit"
              element={
                <ProtectedRoute>
                  <PatientForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/consultations"
              element={
                <ProtectedRoute>
                  <Consultations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/consultations/new"
              element={
                <ProtectedRoute>
                  <ConsultationWizard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/consultations/:id"
              element={
                <ProtectedRoute>
                  <VisitDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  <Billing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing/:id"
              element={
                <ProtectedRoute>
                  <BillDetail />
                </ProtectedRoute>
              }
            />

            {/* Print Templates (Rendered without app shell) */}
            <Route
              path="/print/prescription/:id"
              element={
                <ProtectedRoute>
                  <PrintPrescription />
                </ProtectedRoute>
              }
            />
            <Route
              path="/print/receipt/:id"
              element={
                <ProtectedRoute>
                  <PrintReceipt />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
