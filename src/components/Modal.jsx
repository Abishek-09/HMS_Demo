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
        backgroundColor: "rgba(30, 42, 36, 0.45)",
        backdropFilter: "blur(2px)",
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
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-modal)",
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
            padding: "16px 20px",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "var(--color-surface)",
          }}
        >
          <h3
            style={{
              fontSize: "var(--font-size-base)",
              fontWeight: "600",
              color: "var(--color-primary)",
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
                color: "var(--color-text-muted)",
                padding: "4px",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color var(--transition-fast)",
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div
          style={{
            padding: "20px",
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
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="420px">
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
        {isDestructive && (
          <div
            style={{
              backgroundColor: "#FDF2F2",
              color: "var(--color-danger)",
              padding: "10px",
              borderRadius: "var(--radius-full)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={24} />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text)", lineHeight: 1.5, margin: 0 }}>
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
        <Button variant="outline" onClick={onClose} disabled={loading}>
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
