import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useData } from "../context/DataContext";

export default function ToastContainer() {
  const { toasts, removeToast } = useData();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="toast-container"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "400px",
        width: "calc(100vw - 48px)",
        pointerEvents: "none",
      }}
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";

        return (
          <div
            key={toast.id}
            className={`toast ${isSuccess ? "toast-success" : isError ? "toast-error" : ""}`}
            style={{
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text)",
              borderRadius: "var(--radius-card)",
              border: "1px solid var(--color-border)",
              borderLeftWidth: "4px",
              borderLeftColor: isSuccess
                ? "var(--color-primary)"
                : isError
                ? "var(--color-error)"
                : "var(--color-text-secondary)",
              boxShadow: "0 4px 16px rgba(35, 52, 45, 0.10)",
              animation: "slideInBottom 0.2s ease-out",
            }}
          >
            <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
              {isSuccess && <CheckCircle2 size={18} color="var(--color-primary)" />}
              {isError && <AlertCircle size={18} color="var(--color-error)" />}
              {!isSuccess && !isError && <Info size={18} color="var(--color-text-secondary)" />}
            </div>

            <div
              style={{
                flex: 1,
                fontSize: "14px",
                fontWeight: "500",
                lineHeight: "20px",
                color: "var(--color-text)",
              }}
            >
              {toast.message}
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
              style={{
                color: "var(--color-text-secondary)",
                padding: "4px",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color var(--transition-fast)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
