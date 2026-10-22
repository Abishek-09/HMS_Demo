import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Stethoscope, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import Button from "../components/Button";
import Input from "../components/Input";

export default function Login() {
  const { login } = useAuth();
  const { clinicConfig } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("doctor@clinic.test");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("doctor@clinic.test");
    setPassword("demo1234");
    setError("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "var(--color-bg)",
      }}
    >
      {/* Left Brand Panel (#2C5745) */}
      <div
        style={{
          flex: "1 1 45%",
          backgroundColor: "var(--color-primary)",
          color: "#FFFFFF",
          padding: "48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Soft #EBE3A7 background decorative accents */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            backgroundColor: "var(--color-accent)",
            opacity: 0.12,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-60px",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            backgroundColor: "var(--color-accent)",
            opacity: 0.08,
            pointerEvents: "none",
          }}
        />

        {/* Brand Header */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--color-primary-dark)",
                border: "2px solid var(--color-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "var(--color-accent)",
                }}
              >
                {clinicConfig.logoText || "GF"}
              </span>
            </div>
            <div>
              <h1
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#FFFFFF",
                  margin: 0,
                }}
              >
                {clinicConfig.name}
              </h1>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--color-accent)",
                  margin: 0,
                }}
              >
                Clinic Management System
              </p>
            </div>
          </div>
        </div>

        {/* Center Doctor / Clinic Info */}
        <div style={{ position: "relative", zIndex: 2, maxWidth: "440px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(235, 227, 167, 0.15)",
              color: "var(--color-accent)",
              padding: "6px 14px",
              borderRadius: "var(--radius-full)",
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: "20px",
            }}
          >
            <ShieldCheck size={16} />
            <span>Doctor Practice Portal</span>
          </div>

          <h2
            style={{
              fontSize: "30px",
              fontWeight: "700",
              color: "#FFFFFF",
              lineHeight: 1.25,
              marginBottom: "16px",
            }}
          >
            Streamlined care for your patients.
          </h2>
          <p
            style={{
              fontSize: "15px",
              color: "rgba(255, 255, 255, 0.82)",
              lineHeight: 1.6,
              marginBottom: "28px",
            }}
          >
            Manage walk-in consultations, generate clear A4 prescriptions, assign sequential billing,
            and keep patient medical histories at your fingertips.
          </p>

          <div
            style={{
              backgroundColor: "rgba(36, 71, 58, 0.7)",
              borderRadius: "var(--radius-lg)",
              padding: "16px 20px",
              border: "1px solid rgba(235, 227, 167, 0.2)",
            }}
          >
            <p style={{ fontSize: "14px", fontWeight: "600", color: "#FFFFFF", margin: 0 }}>
              {clinicConfig.doctor}
            </p>
            <p style={{ fontSize: "12px", color: "var(--color-accent)", margin: "2px 0 0" }}>
              {clinicConfig.quals} • {clinicConfig.regNo}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
            {clinicConfig.address}
          </p>
        </div>
      </div>

      {/* Right Login Card Panel */}
      <div
        style={{
          flex: "1 1 55%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            backgroundColor: "var(--color-surface)",
            padding: "40px",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div style={{ marginBottom: "28px" }}>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "var(--color-primary)",
                marginBottom: "6px",
              }}
            >
              Sign In to Practice
            </h2>
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", margin: 0 }}>
              Enter your clinical credentials to access your dashboard.
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: "#FDF2F2",
                border: "1px solid rgba(179, 38, 30, 0.3)",
                color: "var(--color-danger)",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--font-size-sm)",
                marginBottom: "20px",
              }}
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <Input
              label="Doctor Email"
              id="login-email"
              type="email"
              required
              prefix={<Mail size={16} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@clinic.test"
            />

            <Input
              label="Password"
              id="login-password"
              type="password"
              required
              prefix={<Lock size={16} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              style={{ width: "100%", marginTop: "8px" }}
            >
              {loading ? "Signing in…" : "Sign In to Clinic"}
            </Button>
          </form>

          {/* Subtle Demo Credentials Hint Card */}
          <div
            style={{
              marginTop: "28px",
              padding: "14px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-primary-tint)",
              border: "1px solid rgba(44, 87, 69, 0.15)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Sparkles size={14} color="var(--color-primary)" />
                Demo Credentials
              </span>
              <button
                type="button"
                onClick={handleFillDemo}
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "var(--color-primary)",
                  textDecoration: "underline",
                }}
              >
                Auto-fill
              </button>
            </div>
            <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
              Email: <code style={{ color: "var(--color-primary)", fontWeight: "600" }}>doctor@clinic.test</code>
              <br />
              Password: <code style={{ color: "var(--color-primary)", fontWeight: "600" }}>demo1234</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
