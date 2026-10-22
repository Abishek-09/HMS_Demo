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
    borderRadius: "var(--radius-full)",
    fontWeight: "600",
    whiteSpace: "nowrap",
    textTransform: "none",
  };

  const sizeStyles = {
    sm: {
      padding: "2px 8px",
      fontSize: "var(--font-size-xs)",
      lineHeight: "16px",
    },
    md: {
      padding: "4px 12px",
      fontSize: "var(--font-size-xs)",
      lineHeight: "18px",
    },
  };

  const variantStyles = {
    // Paid: #2C5745 bg with white text
    paid: {
      backgroundColor: "var(--color-primary)",
      color: "#FFFFFF",
      border: "1px solid var(--color-primary)",
    },
    // Unpaid: #F5F0C9 bg with #8A6A17 text
    unpaid: {
      backgroundColor: "var(--color-accent-tint)",
      color: "var(--color-warning)",
      border: "1px solid rgba(138, 106, 23, 0.2)",
    },
    // Payment mode (Cash / Online): neutral #E7EFEA chip with #2C5745 text
    mode: {
      backgroundColor: "var(--color-primary-tint)",
      color: "var(--color-primary)",
      border: "1px solid transparent",
    },
    // Today / Accent highlight: #EBE3A7 bg with #2C5745 text
    accent: {
      backgroundColor: "var(--color-accent)",
      color: "var(--color-primary)",
      border: "1px solid rgba(44, 87, 69, 0.15)",
    },
    danger: {
      backgroundColor: "#FDF2F2",
      color: "var(--color-danger)",
      border: "1px solid rgba(179, 38, 30, 0.2)",
    },
    neutral: {
      backgroundColor: "var(--color-primary-tint)",
      color: "var(--color-text)",
      border: "1px solid transparent",
    },
  };

  // Determine variant automatically if children match common values
  let resolvedVariant = variant;
  if (typeof children === "string") {
    const lower = children.toLowerCase();
    if (lower === "paid") resolvedVariant = "paid";
    else if (lower === "unpaid") resolvedVariant = "unpaid";
    else if (lower === "cash" || lower === "online") resolvedVariant = "mode";
  }

  const currentVariant = variantStyles[resolvedVariant] || variantStyles.neutral;
  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      style={{
        ...baseStyles,
        ...currentSize,
        ...currentVariant,
        ...style,
      }}
      className={`chip chip-${resolvedVariant} ${className}`}
    >
      {children}
    </span>
  );
}
