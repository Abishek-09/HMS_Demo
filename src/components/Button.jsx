import React from "react";
import { Loader2 } from "lucide-react";

export default function Button({
  children,
  type = "button",
  variant = "primary", // primary, secondary, outline, danger, dangerSolid, text
  size = "md", // sm, md, lg
  loading = false,
  disabled = false,
  icon: Icon = null,
  onClick,
  className = "",
  style = {},
  ...props
}) {
  const [isHovered, setIsHovered] = React.useState(false);

  const baseStyles = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontWeight: "600",
    borderRadius: "var(--radius-md)",
    transition: "all var(--transition-fast)",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    border: "1px solid transparent",
    textDecoration: "none",
    whiteSpace: "nowrap",
    userSelect: "none",
  };

  const sizeStyles = {
    sm: {
      padding: "6px 14px",
      fontSize: "var(--font-size-xs)",
      height: "32px",
    },
    md: {
      padding: "8px 18px",
      fontSize: "var(--font-size-sm)",
      height: "40px",
    },
    lg: {
      padding: "12px 24px",
      fontSize: "var(--font-size-base)",
      height: "48px",
    },
  };

  const variantStyles = {
    primary: {
      backgroundColor: isHovered && !disabled && !loading ? "var(--color-primary-dark)" : "var(--color-primary)",
      color: "#FFFFFF",
      borderColor: isHovered && !disabled && !loading ? "var(--color-primary-dark)" : "var(--color-primary)",
      boxShadow: isHovered && !disabled && !loading ? "0 4px 12px rgba(44, 87, 69, 0.25)" : "none",
      transform: isHovered && !disabled && !loading ? "translateY(-1px)" : "none",
    },
    secondary: {
      backgroundColor: isHovered && !disabled && !loading ? "#D8E5DD" : "var(--color-primary-tint)",
      color: "var(--color-primary)",
      borderColor: "transparent",
      transform: isHovered && !disabled && !loading ? "translateY(-1px)" : "none",
    },
    outline: {
      backgroundColor: isHovered && !disabled && !loading ? "var(--color-primary-tint)" : "transparent",
      color: "var(--color-primary)",
      borderColor: isHovered && !disabled && !loading ? "var(--color-primary)" : "var(--color-border)",
    },
    danger: {
      backgroundColor: isHovered && !disabled && !loading ? "#FDF2F2" : "transparent",
      color: "var(--color-danger)",
      borderColor: "var(--color-border)",
    },
    dangerSolid: {
      backgroundColor: isHovered && !disabled && !loading ? "#991B1B" : "var(--color-danger)",
      color: "#FFFFFF",
      borderColor: isHovered && !disabled && !loading ? "#991B1B" : "var(--color-danger)",
      boxShadow: isHovered && !disabled && !loading ? "0 4px 12px rgba(179, 38, 30, 0.25)" : "none",
      transform: isHovered && !disabled && !loading ? "translateY(-1px)" : "none",
    },
    text: {
      backgroundColor: isHovered && !disabled && !loading ? "rgba(44, 87, 69, 0.08)" : "transparent",
      color: isHovered && !disabled && !loading ? "var(--color-primary)" : "var(--color-text-muted)",
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...baseStyles,
        ...currentSize,
        ...currentVariant,
        ...style, // style passed from caller will augment (e.g. width: 100%) without clearing background/colors
      }}
      className={`btn btn-${variant} btn-size-${size} ${className}`}
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
