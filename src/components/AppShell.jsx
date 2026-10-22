import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import ToastContainer from "./Toast";

export default function AppShell({ title, children }) {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1440
  );
  const [isCollapsed, setIsCollapsed] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    function handleResize() {
      const w = window.innerWidth;
      setWindowWidth(w);
      if (w < 768) {
        setIsCollapsed(false);
      } else if (w < 1024) {
        setIsCollapsed(true);
        setIsMobileOpen(false);
      } else {
        setIsCollapsed(false);
        setIsMobileOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggle = () => {
    if (windowWidth < 768) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--color-bg)",
        overflowX: "hidden",
      }}
    >
      <Sidebar
        isCollapsed={windowWidth < 768 ? false : isCollapsed}
        isMobileOpen={windowWidth < 768 && isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        onToggleCollapse={handleToggle}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <TopBar
          title={title}
          onToggleSidebar={handleToggle}
        />

        <main
          style={{
            flex: 1,
            padding: windowWidth < 768 ? "16px" : windowWidth < 1440 ? "20px 24px" : "24px 28px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {children}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
