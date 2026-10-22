import React from "react";
import Button from "./Button";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  actionIcon,
  className = "",
  style = {},
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "48px 24px",
        background: "transparent",
        ...style,
      }}
      className={`empty-state ${className}`}
    >
      {/* Accent illustration block with #EBE3A7 */}
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "var(--radius-lg)",
          backgroundColor: "var(--color-accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-primary)",
          marginBottom: "16px",
          boxShadow: "0 2px 8px rgba(44, 87, 69, 0.08)",
        }}
      >
        {Icon ? <Icon size={34} strokeWidth={1.8} /> : null}
      </div>

      <h3
        style={{
          fontSize: "var(--font-size-base)",
          fontWeight: "600",
          color: "var(--color-text)",
          marginBottom: "6px",
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-muted)",
            maxWidth: "360px",
            lineHeight: "1.5",
            marginBottom: actionText ? "20px" : "0",
          }}
        >
          {description}
        </p>
      )}

      {actionText && onAction && (
        <Button variant="primary" onClick={onAction} icon={actionIcon}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
