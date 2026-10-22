import React, { forwardRef } from "react";

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

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "var(--radius-md)",
          border: `1px solid ${error ? "var(--color-danger)" : "var(--color-border)"}`,
          backgroundColor: disabled ? "var(--color-bg)" : "var(--color-surface)",
          color: "var(--color-text)",
          fontSize: "var(--font-size-sm)",
          lineHeight: "1.5",
          resize: "vertical",
          fontFamily: "inherit",
          transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
        }}
        {...props}
      />

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

export default Textarea;
