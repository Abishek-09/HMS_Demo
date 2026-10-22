import React from "react";

export default function Chip({
  children,
  variant = "neutral", // "paid", "unpaid", "mode", "accent", "danger", "neutral"
  size = "md", // "sm", "md"
  className = "",
  style = {},
}) {
  const baseStyles = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    borderRadius: "var(--radius-chip)",
    fontWeight: "500",
    whiteSpace: "nowrap",
    textTransform: "none",
  };

  const sizeStyles = {
    sm: {
      padding: "2px 8px",
      fontSize: "12px",
      lineHeight: "16px",
    },
    md: {
      padding: "4px 10px",
      fontSize: "12px",
      lineHeight: "17px",
    },
  };

  const variantStyles = {
    // Paid chip: #E8F0EB bg, #245744 text, 1px #245744/20% border, 12px/500 label per §2
    paid: {
      backgroundColor: "var(--color-primary-tint)",
      color: "var(--color-primary)",
      border: "1px solid rgba(36, 87, 68, 0.20)",
    },
    // Unpaid chip: #F2E6A0 bg, #6B5A12 text, 12px/500 label per §2
    unpaid: {
      backgroundColor: "var(--color-accent)",
      color: "var(--color-accent-text)",
      border: "1px solid rgba(107, 90, 18, 0.20)",
    },
    // Mode chip (Cash/Online): neutral #E8F0EB with #245744 text per §2
    mode: {
      backgroundColor: "var(--color-primary-tint)",
      color: "var(--color-primary)",
      border: "1px solid transparent",
    },
    // Accent chip
    accent: {
      backgroundColor: "var(--color-accent)",
      color: "var(--color-text)",
      border: "1px solid rgba(35, 52, 45, 0.15)",
    },
    // Danger chip (destructive/error states only)
    danger: {
      backgroundColor: "var(--color-error-tint)",
      color: "var(--color-error)",
      border: "1px solid rgba(179, 38, 30, 0.20)",
    },
    neutral: {
      backgroundColor: "var(--color-primary-tint)",
      color: "var(--color-primary)",
      border: "1px solid transparent",
    },
  };

  // Determine variant automatically if children string matches common values
  let resolvedVariant = variant;
  if (typeof children === "string") {
    const lower = children.toLowerCase();
    if (lower === "paid") resolvedVariant = "paid";
    if (lower === "unpaid" || lower === "pending") resolvedVariant = "unpaid";
    if (lower === "cash" || lower === "online") resolvedVariant = "mode";
    if (lower === "completed" || lower === "done") resolvedVariant = "paid";
  }

  const currentVariant = variantStyles[resolvedVariant] || variantStyles.neutral;
  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      className={`chip chip-${resolvedVariant} ${className}`}
      style={{
        ...baseStyles,
        ...currentSize,
        ...currentVariant,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
