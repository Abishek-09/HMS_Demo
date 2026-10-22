import React from "react";
import { Loader2 } from "lucide-react";

export default function Button({
  children,
  type = "button",
  variant = "primary", // primary, secondary, outline, danger, text
  size = "md", // sm, md, lg
  loading = false,
  disabled = false,
  icon: Icon = null,
  onClick,
  className = "",
  ...props
}) {
  const baseStyles = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontWeight: "500",
    borderRadius: "var(--radius-md)",
    transition: "all var(--transition-fast)",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    border: "1px solid transparent",
    textDecoration: "none",
    whiteSpace: "nowrap",
  };

  const sizeStyles = {
    sm: {
      padding: "6px 12px",
      fontSize: "var(--font-size-xs)",
      height: "32px",
    },
    md: {
      padding: "8px 16px",
      fontSize: "var(--font-size-sm)",
      height: "40px",
    },
    lg: {
      padding: "10px 20px",
      fontSize: "var(--font-size-base)",
      height: "48px",
    },
  };

  const variantStyles = {
    primary: {
      backgroundColor: "var(--color-primary)",
      color: "#FFFFFF",
      borderColor: "var(--color-primary)",
    },
    secondary: {
      backgroundColor: "var(--color-primary-tint)",
      color: "var(--color-primary)",
      borderColor: "transparent",
    },
    outline: {
      backgroundColor: "transparent",
      color: "var(--color-primary)",
      borderColor: "var(--color-border)",
    },
    danger: {
      backgroundColor: "transparent",
      color: "var(--color-danger)",
      borderColor: "var(--color-border)",
    },
    dangerSolid: {
      backgroundColor: "var(--color-danger)",
      color: "#FFFFFF",
      borderColor: "var(--color-danger)",
    },
    text: {
      backgroundColor: "transparent",
      color: "var(--color-text-muted)",
      borderColor: "transparent",
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.primary;
  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        ...baseStyles,
        ...currentSize,
        ...currentVariant,
      }}
      className={`btn btn-${variant} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : Icon ? (
        <Icon size={16} />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
