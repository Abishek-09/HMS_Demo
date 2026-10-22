import React, { forwardRef } from "react";

const Select = forwardRef(function Select(
  {
    label,
    id,
    value,
    onChange,
    options = [],
    error = "",
    required = false,
    disabled = false,
    helperText = "",
    className = "",
    style = {},
    placeholder = "Select...",
    ...props
  },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%", ...style }} className={className}>
      {label && (
        <label
          htmlFor={selectId}
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

      <select
        ref={ref}
        id={selectId}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          width: "100%",
          height: "40px",
          padding: "8px 12px",
          borderRadius: "var(--radius-md)",
          border: `1px solid ${error ? "var(--color-danger)" : "var(--color-border)"}`,
          backgroundColor: disabled ? "var(--color-bg)" : "var(--color-surface)",
          color: "var(--color-text)",
          fontSize: "var(--font-size-sm)",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
        }}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => {
          const val = typeof opt === "object" ? opt.value : opt;
          const lbl = typeof opt === "object" ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>

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

export default Select;
