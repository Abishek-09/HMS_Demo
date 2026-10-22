import React, { forwardRef } from "react";
import { AlertCircle } from "lucide-react";

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
          className="text-label"
          style={{
            fontSize: "13px",
            fontWeight: "500",
            lineHeight: "18px",
            color: "var(--color-text-secondary)",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span>{label}</span>
          {required && <span style={{ color: "var(--color-error)" }}>*</span>}
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
              color: "var(--color-text-secondary)",
              fontSize: "14px",
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
          className={`form-control ${error ? "is-invalid" : ""}`}
          style={{
            width: "100%",
            height: "40px",
            padding: `0 12px 0 ${prefix ? "34px" : "12px"}`,
            paddingRight: suffix ? "36px" : "12px",
            borderRadius: "var(--radius-control)",
            border: `1px solid ${error ? "var(--color-error)" : "var(--color-border)"}`,
            backgroundColor: disabled ? "var(--color-bg)" : "var(--color-surface)",
            color: disabled ? "var(--color-text-secondary)" : "var(--color-text)",
            fontSize: "14px",
            lineHeight: "21px",
            cursor: disabled ? "not-allowed" : "text",
            transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
          }}
          {...props}
        />

        {suffix && (
          <span
            style={{
              position: "absolute",
              right: "12px",
              color: "var(--color-text-secondary)",
              fontSize: "14px",
              pointerEvents: "none",
            }}
          >
            {suffix}
          </span>
        )}
      </div>

      {error ? (
        <div
          className="form-error"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "12px",
            color: "var(--color-error)",
            marginTop: "2px",
          }}
          role="alert"
        >
          <AlertCircle size={13} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <span
          className="text-meta-sm"
          style={{
            fontSize: "12px",
            color: "var(--color-text-secondary)",
            marginTop: "2px",
          }}
        >
          {helperText}
        </span>
      ) : null}
    </div>
  );
});

export default Input;
