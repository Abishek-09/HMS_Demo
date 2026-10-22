import React, { useEffect, useRef } from "react";
import { X, AlertTriangle } from "lucide-react";
import Button from "./Button";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "520px",
  showClose = true,
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(35, 52, 45, 0.40)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        zIndex: 1000,
        animation: "fadeIn 0.15s ease-out",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        style={{
          backgroundColor: "var(--color-surface)",
          width: "100%",
          maxWidth,
          borderRadius: "16px", /* 16px radius per §6 */
          boxShadow: "0 8px 24px rgba(35, 52, 45, 0.10)", /* single allowed shadow per §2, §6 */
          border: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "var(--color-surface)",
          }}
        >
          <h3
            className="text-card-title"
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "var(--color-text)",
              margin: 0,
            }}
          >
            {title}
          </h3>
          {showClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              style={{
                color: "var(--color-text-secondary)",
                padding: "4px",
                borderRadius: "var(--radius-control)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color var(--transition-fast)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div
          style={{
            padding: "24px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// Reusable Confirmation Modal
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="440px">
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
        {isDestructive && (
          <div
            style={{
              backgroundColor: "var(--color-error-tint)",
              color: "var(--color-error)",
              padding: "10px",
              borderRadius: "var(--radius-control)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={22} />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "14px", color: "var(--color-text)", lineHeight: "21px", margin: 0 }}>
            {message}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          marginTop: "24px",
        }}
      >
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant={isDestructive ? "dangerSolid" : "primary"}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
