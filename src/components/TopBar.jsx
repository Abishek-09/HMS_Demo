import React, { useState, useRef, useEffect } from "react";
import { Menu, LogOut, User, Calendar, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { formatDate } from "../utils/format";

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
        height: "var(--topbar-height)", /* 68px */
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        position: "sticky",
        top: 0,
        zIndex: 40,
        boxShadow: "none", /* no shadow per §4 */
      }}
    >
      {/* Left side: Hamburger (40x40) + Page Title (--text-page-title) */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
          title="Toggle navigation"
          className="btn-icon"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "var(--radius-control)",
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Menu size={20} />
        </button>

        <h1
          className="text-page-title"
          style={{
            fontSize: "28px",
            fontWeight: "600",
            lineHeight: "36px",
            color: "var(--color-text)",
            margin: 0,
          }}
        >
          {title}
        </h1>
      </div>

      {/* Right side: Single Date Chip + Doctor Block Dropdown */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Date Chip: #F2E6A0 background, #23342D text, 13px/500, 8px radius, 8px 12px padding */}
        <div
          className="date-chip"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "var(--color-accent)",
            color: "var(--color-text)",
            fontSize: "13px",
            fontWeight: "500",
            lineHeight: "18px",
            borderRadius: "8px",
            padding: "8px 12px",
            whiteSpace: "nowrap",
          }}
        >
          <Calendar size={14} style={{ color: "var(--color-text)", flexShrink: 0 }} />
          <span>Today: {todayStr}</span>
        </div>

        {/* Doctor Block: 32px avatar, name at 14px/600, role at 12px/400 secondary, 8px gap */}
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
              padding: "4px 8px 4px 4px",
              borderRadius: "var(--radius-control)",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
              cursor: "pointer",
              transition: "border-color var(--transition-fast)",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "var(--radius-control)",
                backgroundColor: "var(--color-primary)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "700",
                flexShrink: 0,
              }}
            >
              DR
            </div>

            <div style={{ textAlign: "left", lineHeight: "1.2" }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  lineHeight: "18px",
                  color: "var(--color-text)",
                  whiteSpace: "nowrap",
                }}
              >
                {clinicConfig.doctor || "Dr. B. Sivakumar"}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "400",
                  lineHeight: "16px",
                  color: "var(--color-text-secondary)",
                  whiteSpace: "nowrap",
                }}
              >
                {clinicConfig.designation || clinicConfig.quals || "Consultant"}
              </div>
            </div>

            <ChevronDown size={14} style={{ color: "var(--color-text-secondary)", marginLeft: "4px" }} />
          </button>

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: "220px",
                backgroundColor: "var(--color-surface)",
                borderRadius: "var(--radius-card)",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-modal)",
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
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "var(--color-text)",
                    margin: 0,
                  }}
                >
                  {clinicConfig.doctor}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                    margin: "2px 0 0",
                  }}
                >
                  {user?.email || "doctor@clinic.test"}
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
                  padding: "8px 16px",
                  textAlign: "left",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "var(--color-error)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-error-tint)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
