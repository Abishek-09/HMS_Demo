import React from "react";

export default function Card({
  title,
  subtitle,
  action,
  children,
  className = "",
  style = {},
  padding = "var(--space-6)",
  ...props
}) {
  return (
    <div
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: padding,
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
      className={`card ${className}`}
      {...props}
    >
      {(title || action) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "var(--space-4)",
            borderBottom: subtitle || action ? "1px solid var(--color-border)" : "none",
            paddingBottom: subtitle || action ? "var(--space-3)" : 0,
            gap: "12px",
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  fontSize: "var(--font-size-base)",
                  fontWeight: "600",
                  color: "var(--color-primary)",
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--color-text-muted)",
                  marginTop: "2px",
                  marginBottom: 0,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
