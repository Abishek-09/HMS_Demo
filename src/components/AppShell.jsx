import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import ToastContainer from "./Toast";

export default function AppShell({ title, children }) {
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 900);

  // Auto-collapse below 900px
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 900) {
        setIsCollapsed(true);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--color-bg)",
      }}
    >
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0, // prevents flex overflow
        }}
      >
        <TopBar
          title={title}
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        <main
          style={{
            flex: 1,
            padding: "24px",
            maxWidth: "1400px",
            width: "100%",
            margin: "0 auto",
          }}
        >
          {children}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
