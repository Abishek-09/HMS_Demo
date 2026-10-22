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
        size={16}
        style={{
          position: "absolute",
          left: "12px",
          color: "var(--color-text-muted)",
          pointerEvents: "none",
        }}
      />

      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        style={{
          width: "100%",
          height: "40px",
          padding: "8px 36px 8px 36px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
          color: "var(--color-text)",
          fontSize: "var(--font-size-sm)",
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
            color: "var(--color-text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4px",
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
