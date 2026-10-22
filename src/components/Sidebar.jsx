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

export default function Sidebar({ isCollapsed, onToggleCollapse }) {
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
    <aside
      className="sidebar"
      style={{
        width: isCollapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)",
        backgroundColor: "var(--color-primary)",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        transition: "width var(--transition-normal)",
        zIndex: 50,
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
          height: "var(--topbar-height)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: isCollapsed ? "0 16px" : "0 20px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Inline SVG Monogram Logo */}
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--color-primary-dark)",
            border: "2px solid var(--color-accent)",
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
            {clinicConfig.logoText || "GF"}
          </span>
        </div>

        {!isCollapsed && (
          <div style={{ overflow: "hidden" }}>
            <h2
              style={{
                fontSize: "14px",
                fontWeight: "700",
                color: "#FFFFFF",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                letterSpacing: "-0.2px",
              }}
            >
              {clinicConfig.name}
            </h2>
            <p
              style={{
                fontSize: "11px",
                color: "var(--color-accent)",
                whiteSpace: "nowrap",
                margin: 0,
              }}
            >
              {clinicConfig.doctor}
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
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: isCollapsed ? "10px 0" : "10px 14px",
                justifyContent: isCollapsed ? "center" : "flex-start",
                borderRadius: "var(--radius-full)",
                textDecoration: "none",
                fontSize: "var(--font-size-sm)",
                fontWeight: isActive ? "600" : "500",
                // Active nav item = #EBE3A7 pill with #2C5745 text
                backgroundColor: isActive ? "var(--color-accent)" : "transparent",
                color: isActive ? "var(--color-primary)" : "rgba(255, 255, 255, 0.85)",
                transition: "all var(--transition-fast)",
              })}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={18} strokeWidth={2} />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Profile / Quick Info */}
      <div
        style={{
          padding: isCollapsed ? "16px 8px" : "16px",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          backgroundColor: "var(--color-primary-dark)",
          display: "flex",
          flexDirection: isCollapsed ? "column" : "row",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "space-between",
          gap: "8px",
        }}
      >
        {!isCollapsed && (
          <div style={{ overflow: "hidden" }}>
            <p
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#FFFFFF",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {clinicConfig.doctor}
            </p>
            <p
              style={{
                fontSize: "10px",
                color: "rgba(255, 255, 255, 0.65)",
                margin: 0,
              }}
            >
              {clinicConfig.designation || clinicConfig.quals}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={logout}
          title="Sign out"
          aria-label="Sign out"
          style={{
            color: "rgba(255, 255, 255, 0.75)",
            padding: "8px",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.75)")}
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
