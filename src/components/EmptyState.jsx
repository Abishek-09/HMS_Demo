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
        padding: "32px 16px",
        background: "transparent",
        ...style,
      }}
      className={`empty-state ${className}`}
    >
      {Icon && (
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "var(--radius-control)",
            backgroundColor: "var(--color-primary-tint)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-primary)",
            marginBottom: "12px",
          }}
        >
          <Icon size={26} strokeWidth={2} />
        </div>
      )}

      {title && (
        <h3
          className="text-card-title"
          style={{
            fontSize: "15px",
            fontWeight: "600",
            lineHeight: "22px",
            color: "var(--color-text)",
            margin: "0 0 4px 0",
          }}
        >
          {title}
        </h3>
      )}

      {description && (
        <p
          className="text-secondary"
          style={{
            fontSize: "13px",
            fontWeight: "400",
            lineHeight: "19px",
            color: "var(--color-text-secondary)",
            margin: "0 0 16px 0",
            maxWidth: "360px",
          }}
        >
          {description}
        </p>
      )}

      {actionText && onAction && (
        <Button variant="primary" onClick={onAction} icon={actionIcon} size="md">
          {actionText}
        </Button>
      )}
    </div>
  );
}
