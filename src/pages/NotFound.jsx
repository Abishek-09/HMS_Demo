import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Home } from "lucide-react";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--color-bg)",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "460px",
          width: "100%",
          backgroundColor: "var(--color-surface)",
          padding: "32px",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-sm)",
          textAlign: "center",
        }}
      >
        <EmptyState
          icon={AlertCircle}
          title="404 — Page Not Found"
          description="The clinical screen or document you are looking for does not exist or has been moved."
          actionText="Return to Dashboard"
          onAction={() => navigate("/")}
          actionIcon={Home}
        />
      </div>
    </div>
  );
}
