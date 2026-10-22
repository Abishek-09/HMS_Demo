import React, { forwardRef } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";

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

      <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
        <select
          ref={ref}
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`form-control ${error ? "is-invalid" : ""}`}
          style={{
            width: "100%",
            height: "40px",
            padding: "0 36px 0 12px",
            borderRadius: "var(--radius-control)",
            border: `1px solid ${error ? "var(--color-error)" : "var(--color-border)"}`,
            backgroundColor: disabled ? "var(--color-bg)" : "var(--color-surface)",
            color: disabled ? "var(--color-text-secondary)" : "var(--color-text)",
            fontSize: "14px",
            lineHeight: "21px",
            cursor: disabled ? "not-allowed" : "pointer",
            appearance: "none",
            WebkitAppearance: "none",
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
        <ChevronDown
          size={16}
          style={{
            position: "absolute",
            right: "12px",
            color: "var(--color-text-secondary)",
            pointerEvents: "none",
          }}
        />
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

export default Select;
