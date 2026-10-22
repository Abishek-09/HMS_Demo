import React from "react";

export default function Card({
  title,
  subtitle,
  action,
  children,
  className = "",
  style = {},
  compact = false,
  padding,
  ...props
}) {
  const cardPadding = padding || (compact ? "16px" : "24px");

  return (
    <div
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-card)",
        padding: cardPadding,
        boxShadow: "var(--shadow-card)",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
      className={`card ${compact ? "card-compact" : ""} ${className}`}
      {...props}
    >
      {(title || action) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "16px",
            borderBottom: subtitle ? "1px solid var(--color-border)" : "none",
            paddingBottom: subtitle ? "12px" : 0,
            gap: "12px",
          }}
        >
          <div>
            {title && (
              <h3
                className="text-card-title"
                style={{
                  fontSize: "15px",
                  fontWeight: "600",
                  lineHeight: "22px",
                  color: "var(--color-text)",
                  margin: 0,
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                className="text-secondary"
                style={{
                  fontSize: "13px",
                  fontWeight: "400",
                  lineHeight: "19px",
                  color: "var(--color-text-secondary)",
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
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
