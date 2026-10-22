import React, { forwardRef } from "react";

const Input = forwardRef(function Input(
  {
    label,
    id,
    type = "text",
    value,
    onChange,
    placeholder = "",
    error = "",
    required = false,
    disabled = false,
    helperText = "",
    prefix = null,
    suffix = null,
    className = "",
    style = {},
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%", ...style }} className={className}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: "var(--font-size-sm)",
            fontWeight: "500",
            color: "var(--color-text)",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span>{label}</span>
          {required && <span style={{ color: "var(--color-danger)" }}>*</span>}
        </label>
      )}

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          width: "100%",
        }}
      >
        {prefix && (
          <span
            style={{
              position: "absolute",
              left: "12px",
              color: "var(--color-text-muted)",
              fontSize: "var(--font-size-sm)",
              pointerEvents: "none",
            }}
          >
            {prefix}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: "100%",
            height: "40px",
            padding: `8px 12px 8px ${prefix ? "32px" : "12px"}`,
            paddingRight: suffix ? "36px" : "12px",
            borderRadius: "var(--radius-md)",
            border: `1px solid ${error ? "var(--color-danger)" : "var(--color-border)"}`,
            backgroundColor: disabled ? "var(--color-bg)" : "var(--color-surface)",
            color: "var(--color-text)",
            fontSize: "var(--font-size-sm)",
            lineHeight: "1.5",
            transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
          }}
          {...props}
        />

        {suffix && (
          <span
            style={{
              position: "absolute",
              right: "12px",
              color: "var(--color-text-muted)",
              fontSize: "var(--font-size-sm)",
              pointerEvents: "none",
            }}
          >
            {suffix}
          </span>
        )}
      </div>

      {error ? (
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--color-danger)",
            fontWeight: "500",
          }}
          role="alert"
        >
          {error}
        </span>
      ) : helperText ? (
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-muted)",
          }}
        >
          {helperText}
        </span>
      ) : null}
    </div>
  );
});

export default Input;
