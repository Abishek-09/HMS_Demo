import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

export default function SearchBar({
  value: initialValue = "",
  onChange,
  placeholder = "Search by name, phone, or ID...",
  debounceMs = 250,
  style = {},
  className = "",
}) {
  const [term, setTerm] = useState(initialValue);

  // Sync external changes
  useEffect(() => {
    setTerm(initialValue);
  }, [initialValue]);

  // Debounce notification
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onChange) {
        onChange(term);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [term, debounceMs, onChange]);

  const handleClear = () => {
    setTerm("");
    if (onChange) onChange("");
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        width: "100%",
        maxWidth: "380px",
        ...style,
      }}
      className={`search-bar ${className}`}
    >
      <Search
        size={18}
        style={{
          position: "absolute",
          left: "12px",
          color: "var(--color-text-secondary)",
          pointerEvents: "none",
        }}
      />

      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        className="form-control"
        style={{
          width: "100%",
          height: "40px",
          padding: "0 36px 0 38px",
          borderRadius: "var(--radius-control)",
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
          color: "var(--color-text)",
          fontSize: "14px",
          outline: "none",
          transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
        }}
      />

      {term && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          style={{
            position: "absolute",
            right: "10px",
            color: "var(--color-text-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4px",
            borderRadius: "var(--radius-control)",
            cursor: "pointer",
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
