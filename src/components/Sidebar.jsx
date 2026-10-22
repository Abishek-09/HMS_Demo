import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Receipt,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";

export default function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
  const { logout } = useAuth();
  const { clinicConfig } = useData();

  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/patients", label: "Patients", icon: Users },
    { to: "/consultations", label: "Consultations", icon: Stethoscope },
    { to: "/billing", label: "Billing", icon: Receipt },
    { to: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(35, 52, 45, 0.4)",
            zIndex: 90,
            transition: "opacity var(--transition-normal)",
          }}
        />
      )}

      <aside
        className={`sidebar ${isMobileOpen ? "sidebar-mobile-open" : ""}`}
        style={{
          width: isCollapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)",
          backgroundColor: "var(--color-primary)",
          color: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          transition: "width var(--transition-normal), transform var(--transition-normal)",
          zIndex: 100,
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            minHeight: "var(--topbar-height)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: isCollapsed ? "0 16px" : "16px 20px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          {/* Clinic Monogram / Logo */}
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-control)",
              backgroundColor: "rgba(255, 255, 255, 0.12)",
              border: "1.5px solid var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                fontWeight: "700",
                color: "var(--color-accent)",
                letterSpacing: "-0.5px",
              }}
            >
              {clinicConfig.logoText || "SC"}
            </span>
          </div>

          {!isCollapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Clinic name must WRAP to two lines rather than truncate with an ellipsis */}
              <h2
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  lineHeight: "18px",
                  color: "#FFFFFF",
                  margin: 0,
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  letterSpacing: "-0.2px",
                }}
              >
                {clinicConfig.name}
              </h2>
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: "400",
                  lineHeight: "16px",
                  color: "var(--color-accent)",
                  margin: "2px 0 0",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {clinicConfig.doctor}
                {clinicConfig.quals ? ` • ${clinicConfig.quals}` : ""}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav
          style={{
            flex: 1,
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
          aria-label="Sidebar Navigation"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                }}
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  height: "44px",
                  padding: "0 12px",
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  borderRadius: "8px", /* radius 8px per §4 */
                  textDecoration: "none",
                  fontSize: "15px",
                  fontWeight: isActive ? "600" : "500",
                  lineHeight: "22px",
                  backgroundColor: isActive ? "var(--color-accent)" : "transparent",
                  color: isActive ? "var(--color-primary)" : "#FFFFFF",
                  transition: "background-color var(--transition-fast), color var(--transition-fast)",
                })}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains("active")) {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains("active")) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
                title={isCollapsed ? item.label : undefined}
                aria-label={item.label}
              >
                <Icon size={20} strokeWidth={2} style={{ flexShrink: 0 }} />
                {!isCollapsed && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Control pinned at bottom */}
        <div
          style={{
            padding: "12px",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <button
            type="button"
            onClick={logout}
            title={isCollapsed ? "Logout" : undefined}
            aria-label="Logout"
            style={{
              width: "100%",
              height: "44px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "0 12px",
              justifyContent: isCollapsed ? "center" : "flex-start",
              borderRadius: "8px",
              backgroundColor: "transparent",
              color: "rgba(255, 255, 255, 0.85)",
              fontSize: "15px",
              fontWeight: "500",
              lineHeight: "22px",
              cursor: "pointer",
              transition: "background-color var(--transition-fast), color var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.85)";
            }}
          >
            <LogOut size={20} strokeWidth={2} style={{ flexShrink: 0 }} />
            {!isCollapsed && <span style={{ whiteSpace: "nowrap" }}>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
