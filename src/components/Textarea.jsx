import React, { forwardRef } from "react";
import { AlertCircle } from "lucide-react";

const Textarea = forwardRef(function Textarea(
  {
    label,
    id,
    value,
    onChange,
    placeholder = "",
    rows = 3,
    error = "",
    required = false,
    disabled = false,
    helperText = "",
    className = "",
    style = {},
    ...props
  },
  ref
) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%", ...style }} className={className}>
      {label && (
        <label
          htmlFor={textareaId}
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

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`form-control ${error ? "is-invalid" : ""}`}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "var(--radius-control)",
          border: `1px solid ${error ? "var(--color-error)" : "var(--color-border)"}`,
          backgroundColor: disabled ? "var(--color-bg)" : "var(--color-surface)",
          color: disabled ? "var(--color-text-secondary)" : "var(--color-text)",
          fontSize: "14px",
          lineHeight: "21px",
          resize: "vertical",
          fontFamily: "inherit",
          height: "auto",
          transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
        }}
        {...props}
      />

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

export default Textarea;
