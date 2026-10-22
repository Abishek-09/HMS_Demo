import React, { useState, useRef, useEffect } from "react";
import { Menu, LogOut, User, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { formatDate } from "../utils/format";
import Chip from "./Chip";

export default function TopBar({ title, onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { clinicConfig } = useData();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const todayStr = formatDate(new Date(), false);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="topbar"
      style={{
        height: "var(--topbar-height)",
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 40,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          style={{
            padding: "8px",
            borderRadius: "var(--radius-md)",
            color: "var(--color-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Menu size={20} />
        </button>

        <h1
          style={{
            fontSize: "var(--font-size-lg)",
            fontWeight: "700",
            color: "var(--color-primary)",
            margin: 0,
          }}
        >
          {title}
        </h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Today's date chip in #EBE3A7 */}
        <Chip variant="accent" size="md">
          <Calendar size={13} style={{ marginRight: "2px" }} />
          <span>Today: {todayStr}</span>
        </Chip>

        {/* Doctor Avatar Menu */}
        <div style={{ position: "relative" }} ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Doctor profile menu"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 8px",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
              transition: "all var(--transition-fast)",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--color-primary)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              DR
            </div>
            <span
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "500",
                color: "var(--color-text)",
              }}
            >
              {clinicConfig.doctor}
            </span>
          </button>

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: "220px",
                backgroundColor: "var(--color-surface)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-md)",
                padding: "8px 0",
                zIndex: 100,
                animation: "fadeIn 0.15s ease-out",
              }}
            >
              <div
                style={{
                  padding: "8px 16px",
                  borderBottom: "1px solid var(--color-border)",
                  marginBottom: "4px",
                }}
              >
                <p
                  style={{
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "600",
                    color: "var(--color-primary)",
                    margin: 0,
                  }}
                >
                  {clinicConfig.doctor}
                </p>
                <p
                  style={{
                    fontSize: "var(--font-size-xs)",
                    color: "var(--color-text-muted)",
                    margin: 0,
                  }}
                >
                  {user?.doctorEmail || "doctor@clinic.test"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 16px",
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-danger)",
                  textAlign: "left",
                  transition: "background-color var(--transition-fast)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FDF2F2")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <LogOut size={16} />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
