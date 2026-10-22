import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
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
    <div className="login-container">
      {/* Left Brand Panel (Flat #245744 per spec; collapses into compact header banner on mobile/tablet) */}
      <div className="login-brand-panel">
        {/* Brand Header */}
        <div className="login-brand-header">
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
                borderRadius: "var(--radius-control)",
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                border: "2px solid var(--color-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "var(--color-accent)",
                }}
              >
                {clinicConfig.logoText || "SC"}
              </span>
            </div>
            <div>
              <h1
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#FFFFFF",
                  margin: 0,
                  lineHeight: "26px",
                }}
              >
                {clinicConfig.name}
              </h1>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--color-accent)",
                  margin: "2px 0 0",
                }}
              >
                Clinic Management System • {clinicConfig.doctor}
              </p>
            </div>
          </div>
        </div>

        {/* Center Doctor / Clinic Info (Visible on Desktop, hidden on mobile/tablet to keep form visible above fold) */}
        <div className="login-brand-body" style={{ maxWidth: "440px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(242, 230, 160, 0.15)",
              color: "var(--color-accent)",
              padding: "6px 14px",
              borderRadius: "var(--radius-control)",
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
              fontSize: "28px",
              fontWeight: "700",
              color: "#FFFFFF",
              lineHeight: "36px",
              marginBottom: "16px",
            }}
          >
            Streamlined care for your patients.
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "rgba(255, 255, 255, 0.85)",
              lineHeight: "22px",
              marginBottom: "28px",
            }}
          >
            Manage walk-in consultations, generate clear A4 prescriptions, assign sequential billing,
            and keep patient medical histories at your fingertips.
          </p>

          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              borderRadius: "var(--radius-card)",
              padding: "16px 20px",
              border: "1px solid rgba(255, 255, 255, 0.12)",
            }}
          >
            <p style={{ fontSize: "14px", fontWeight: "600", color: "#FFFFFF", margin: 0 }}>
              {clinicConfig.doctor}
            </p>
            <p style={{ fontSize: "12px", color: "var(--color-accent)", margin: "4px 0 0" }}>
              {clinicConfig.quals} • {clinicConfig.designation || "Consultant Pediatrician"}
            </p>
          </div>
        </div>

        {/* Footer (Desktop only) */}
        <div className="login-brand-footer">
          <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.75)", margin: 0, lineHeight: "18px" }}>
            {clinicConfig.address} • Consulting Time: {clinicConfig.timings} • Cell: {clinicConfig.phone}
          </p>
        </div>
      </div>

      {/* Right Login Card Panel */}
      <div className="login-form-panel">
        <div className="login-card">
          <div style={{ marginBottom: "24px" }}>
            <h2
              className="text-page-title"
              style={{
                fontSize: "24px",
                fontWeight: "600",
                lineHeight: "32px",
                color: "var(--color-text)",
                marginBottom: "6px",
              }}
            >
              Sign In to Practice
            </h2>
            <p className="text-secondary" style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: 0 }}>
              Enter your clinical credentials to access your dashboard.
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: "var(--color-error-tint)",
                border: "1px solid rgba(179, 38, 30, 0.25)",
                color: "var(--color-error)",
                padding: "10px 14px",
                borderRadius: "var(--radius-control)",
                fontSize: "13px",
                lineHeight: "18px",
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
              marginTop: "24px",
              padding: "14px 16px",
              borderRadius: "var(--radius-control)",
              backgroundColor: "var(--color-primary-tint)",
              border: "1px solid var(--color-border)",
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
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "var(--color-primary)",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Auto-fill
              </button>
            </div>
            <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", lineHeight: "18px" }}>
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
