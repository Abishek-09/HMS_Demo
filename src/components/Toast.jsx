import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useData } from "../context/DataContext";

export default function ToastContainer() {
  const { toasts, removeToast } = useData();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "380px",
        width: "100%",
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
            style={{
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text)",
              borderRadius: "var(--radius-md)",
              borderLeft: `4px solid ${
                isSuccess
                  ? "var(--color-primary)"
                  : isError
                  ? "var(--color-danger)"
                  : "var(--color-primary-mid)"
              }`,
              boxShadow: "var(--shadow-md)",
              animation: "slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div style={{ flexShrink: 0 }}>
              {isSuccess && <CheckCircle2 size={18} color="var(--color-primary)" />}
              {isError && <AlertCircle size={18} color="var(--color-danger)" />}
              {!isSuccess && !isError && <Info size={18} color="var(--color-primary-mid)" />}
            </div>

            <div style={{ flex: 1, fontSize: "var(--font-size-sm)", fontWeight: "500" }}>
              {toast.message}
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
              style={{
                color: "var(--color-text-muted)",
                padding: "2px",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
