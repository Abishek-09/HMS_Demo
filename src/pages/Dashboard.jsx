import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Users,
  Stethoscope,
  Receipt,
  IndianRupee,
  UserPlus,
  Eye,
  Printer,
  Calendar,
} from "lucide-react";
import AppShell from "../components/AppShell";
import Card from "../components/Card";
import Chip from "../components/Chip";
import EmptyState from "../components/EmptyState";
import { getVisits } from "../services/visits";
import { getPatients } from "../services/patients";
import { getBills } from "../services/bills";
import { getPrescriptions } from "../services/prescriptions";
import { formatTime, formatCurrency } from "../utils/format";
import { useData } from "../context/DataContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { clinicConfig, dataVersion } = useData();

  const [visits, setVisits] = useState([]);
  const [patients, setPatients] = useState([]);
  const [bills, setBills] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [dataVersion]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [vList, pList, bList, rxList] = await Promise.all([
        getVisits(),
        getPatients(),
        getBills(),
        getPrescriptions(),
      ]);
      setVisits(vList);
      setPatients(pList);
      setBills(bList);
      setPrescriptions(rxList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Maps
  const patientsMap = useMemo(() => new Map(patients.map((p) => [p.id, p])), [patients]);
  const rxMap = useMemo(() => new Map(prescriptions.map((r) => [r.visitId, r])), [prescriptions]);
  const billMap = useMemo(() => new Map(bills.map((b) => [b.visitId, b])), [bills]);

  // Determine today's date string
  const todayDateString = new Date().toDateString();

  // Visits today
  const visitsToday = useMemo(() => {
    return visits.filter((v) => {
      const d = new Date(v.dateTime);
      return d.toDateString() === todayDateString;
    });
  }, [visits, todayDateString]);

  // Patients today (unique patientIds visited today)
  const patientsTodayCount = useMemo(() => {
    const set = new Set(visitsToday.map((v) => v.patientId));
    return set.size;
  }, [visitsToday]);

  // Unpaid bills count
  const unpaidBills = useMemo(() => {
    return bills.filter((b) => b.status === "Unpaid");
  }, [bills]);

  // Total collected today (bills with status Paid dated today)
  const totalCollectedToday = useMemo(() => {
    return bills
      .filter((b) => {
        if (b.status !== "Paid") return false;
        const d = new Date(b.date || b.createdAt);
        return d.toDateString() === todayDateString;
      })
      .reduce((sum, b) => sum + (Number(b.total) || 0), 0);
  }, [bills, todayDateString]);

  // Dynamic greeting
  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning";
    if (hours < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <AppShell title="Dashboard">
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Welcome Section (Single source of date is now TopBar; no duplicate date chip here) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <h2
            className="text-section"
            style={{
              fontSize: "18px",
              fontWeight: "600",
              lineHeight: "26px",
              color: "var(--color-text)",
              margin: 0,
            }}
          >
            {greeting}, {clinicConfig.doctor}
          </h2>
          <p
            className="text-secondary"
            style={{
              fontSize: "13px",
              fontWeight: "400",
              lineHeight: "19px",
              color: "var(--color-text-secondary)",
              margin: 0,
            }}
          >
            Clinical summary and appointments overview for {clinicConfig.name}
          </p>
        </div>

        {/* KPI Row (4 columns desktop, fixed 116px height, 40x40 icon tile, tabular numbers) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
          }}
        >
          {/* KPI 1: Patients Today */}
          <div
            style={{
              height: "116px",
              backgroundColor: "var(--color-surface)",
              borderRadius: "var(--radius-card)",
              border: "1px solid var(--color-border)",
              padding: "20px 24px",
              boxShadow: "var(--shadow-card)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-control)",
                backgroundColor: "var(--color-primary-tint)",
                color: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Users size={20} strokeWidth={2} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                className="text-secondary"
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  lineHeight: "18px",
                  color: "var(--color-text-secondary)",
                }}
              >
                Patients Today
              </span>
              <span
                className="text-kpi tabular-nums"
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  lineHeight: "34px",
                  color: "var(--color-text)",
                  marginTop: "2px",
                }}
              >
                {patientsTodayCount}
              </span>
            </div>
          </div>

          {/* KPI 2: Consultations Today */}
          <div
            style={{
              height: "116px",
              backgroundColor: "var(--color-surface)",
              borderRadius: "var(--radius-card)",
              border: "1px solid var(--color-border)",
              padding: "20px 24px",
              boxShadow: "var(--shadow-card)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-control)",
                backgroundColor: "var(--color-primary-tint)",
                color: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Stethoscope size={20} strokeWidth={2} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                className="text-secondary"
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  lineHeight: "18px",
                  color: "var(--color-text-secondary)",
                }}
              >
                Today's Consultations
              </span>
              <span
                className="text-kpi tabular-nums"
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  lineHeight: "34px",
                  color: "var(--color-text)",
                  marginTop: "2px",
                }}
              >
                {visitsToday.length}
              </span>
            </div>
          </div>

          {/* KPI 3: Unpaid Invoices */}
          <div
            onClick={() => navigate("/billing")}
            style={{
              height: "116px",
              backgroundColor: "var(--color-surface)",
              borderRadius: "var(--radius-card)",
              border: "1px solid var(--color-border)",
              padding: "20px 24px",
              boxShadow: "var(--shadow-card)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              cursor: "pointer",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-control)",
                backgroundColor: "var(--color-accent)",
                color: "var(--color-accent-text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Receipt size={20} strokeWidth={2} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                className="text-secondary"
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  lineHeight: "18px",
                  color: "var(--color-text-secondary)",
                }}
              >
                Unpaid Invoices
              </span>
              <span
                className="text-kpi tabular-nums"
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  lineHeight: "34px",
                  color: unpaidBills.length > 0 ? "var(--color-text)" : "var(--color-text-secondary)",
                  marginTop: "2px",
                }}
              >
                {unpaidBills.length}
              </span>
            </div>
          </div>

          {/* KPI 4: Collected Today */}
          <div
            style={{
              height: "116px",
              backgroundColor: "var(--color-surface)",
              borderRadius: "var(--radius-card)",
              border: "1px solid var(--color-border)",
              padding: "20px 24px",
              boxShadow: "var(--shadow-card)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-control)",
                backgroundColor: "var(--color-primary-tint)",
                color: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IndianRupee size={20} strokeWidth={2} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                className="text-secondary"
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  lineHeight: "18px",
                  color: "var(--color-text-secondary)",
                }}
              >
                Collected Today
              </span>
              <span
                className="text-kpi tabular-nums"
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  lineHeight: "34px",
                  color: "var(--color-text)",
                  marginTop: "2px",
                }}
              >
                {formatCurrency(totalCollectedToday)}
              </span>
            </div>
          </div>
        </div>

        {/* Main 2/3 : 1/3 Split (20px gap, equalised top edges) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(320px, 1fr)",
            gap: "20px",
            alignItems: "start",
          }}
          className="dashboard-grid"
        >
          {/* Left Column: Today's Consultations Card */}
          <Card
            title="Today's Consultations"
            action={
              <Link
                to="/consultations"
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--color-primary)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                View all
              </Link>
            }
            padding="24px"
          >
            {visitsToday.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No consultations yet today"
                description="Start a walk-in consultation or register a new patient to begin today's clinic schedule."
                actionText="Start New Consultation"
                onAction={() => navigate("/consultations/new")}
                actionIcon={Stethoscope}
              />
            ) : (
              <div className="table-container" style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-control)" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: "25%" }}>Patient</th>
                      <th style={{ width: "15%" }}>Time</th>
                      <th style={{ width: "35%" }}>Complaint</th>
                      <th style={{ width: "13%" }}>Status</th>
                      <th style={{ width: "12%", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitsToday.map((v) => {
                      const patient = patientsMap.get(v.patientId);
                      const rx = rxMap.get(v.id);
                      const bill = billMap.get(v.id);

                      return (
                        <tr key={v.id}>
                          {/* Patient cell: name 14px/600, patient ID beneath 12-13px/400 secondary, 2px gap */}
                          <td>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <span
                                style={{
                                  fontSize: "14px",
                                  fontWeight: "600",
                                  lineHeight: "20px",
                                  color: "var(--color-text)",
                                }}
                              >
                                {patient ? patient.name : v.patientId}
                              </span>
                              <span
                                className="tabular-nums"
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  lineHeight: "17px",
                                  color: "var(--color-text-secondary)",
                                }}
                              >
                                {patient ? patient.patientId || patient.id : v.patientId}
                              </span>
                            </div>
                          </td>

                          {/* Time cell: tabular numerals */}
                          <td>
                            <span
                              className="tabular-nums"
                              style={{
                                fontSize: "14px",
                                fontWeight: "400",
                                color: "var(--color-text)",
                              }}
                            >
                              {formatTime(v.dateTime)}
                            </span>
                          </td>

                          {/* Complaint: single line, ellipsis truncation, title attribute with full text */}
                          <td style={{ maxWidth: "220px" }}>
                            <div
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontSize: "14px",
                                color: "var(--color-text)",
                              }}
                              title={v.complaint || "Routine consultation"}
                            >
                              {v.complaint || "Routine consultation"}
                            </div>
                          </td>

                          {/* Status: chip per §2 */}
                          <td>
                            {bill ? (
                              <Chip variant={bill.status === "Paid" ? "paid" : "unpaid"}>
                                {bill.status}
                              </Chip>
                            ) : (
                              <Chip variant="unpaid">Pending</Chip>
                            )}
                          </td>

                          {/* Actions: exactly TWO controls per row: View & Print (40x40px, 8px gap) */}
                          <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                            <div style={{ display: "inline-flex", gap: "8px", justifyContent: "flex-end" }}>
                              <button
                                type="button"
                                className="btn-icon"
                                onClick={() => navigate(`/consultations/${v.id}`)}
                                title="View consultation"
                                aria-label="View consultation"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: "var(--radius-control)",
                                  border: "1px solid var(--color-border)",
                                  backgroundColor: "var(--color-surface)",
                                  color: "var(--color-text-secondary)",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  transition: "all var(--transition-fast)",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "var(--color-primary-tint)";
                                  e.currentTarget.style.color = "var(--color-primary)";
                                  e.currentTarget.style.borderColor = "var(--color-primary)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "var(--color-surface)";
                                  e.currentTarget.style.color = "var(--color-text-secondary)";
                                  e.currentTarget.style.borderColor = "var(--color-border)";
                                }}
                              >
                                <Eye size={18} strokeWidth={2} />
                              </button>

                              <button
                                type="button"
                                className="btn-icon"
                                onClick={() => {
                                  if (rx) {
                                    navigate(`/print/prescription/${rx.id}`);
                                  } else {
                                    navigate(`/consultations/${v.id}`);
                                  }
                                }}
                                title="Print prescription"
                                aria-label="Print prescription"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: "var(--radius-control)",
                                  border: "1px solid var(--color-border)",
                                  backgroundColor: "var(--color-surface)",
                                  color: "var(--color-text-secondary)",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  transition: "all var(--transition-fast)",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "var(--color-primary-tint)";
                                  e.currentTarget.style.color = "var(--color-primary)";
                                  e.currentTarget.style.borderColor = "var(--color-primary)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "var(--color-surface)";
                                  e.currentTarget.style.color = "var(--color-text-secondary)";
                                  e.currentTarget.style.borderColor = "var(--color-border)";
                                }}
                              >
                                <Printer size={18} strokeWidth={2} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Right Column: Quick Actions + Practice Information stacked */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Quick Actions Card (§5: 3 full-width rows of 44px height, identical 20px icon slot) */}
            <Card title="Quick Actions" padding="24px">
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* 1. New Consultation (Primary Action: filled #245744, white label) */}
                <button
                  type="button"
                  onClick={() => navigate("/consultations/new")}
                  style={{
                    width: "100%",
                    height: "44px",
                    borderRadius: "var(--radius-control)",
                    backgroundColor: "var(--color-primary)",
                    color: "#FFFFFF",
                    border: "1px solid var(--color-primary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "0 16px",
                    fontSize: "14px",
                    fontWeight: "600",
                    lineHeight: "20px",
                    cursor: "pointer",
                    transition: "background-color var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary)")}
                >
                  <Stethoscope size={20} strokeWidth={2} style={{ flexShrink: 0 }} />
                  <span>New Consultation</span>
                </button>

                {/* 2. Register Patient (Secondary Action: white surface, 1px #E1E7E2 border, #23342D label, #245744 icon) */}
                <button
                  type="button"
                  onClick={() => navigate("/patients/new")}
                  style={{
                    width: "100%",
                    height: "44px",
                    borderRadius: "var(--radius-control)",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text)",
                    border: "1px solid var(--color-border)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "0 16px",
                    fontSize: "14px",
                    fontWeight: "600",
                    lineHeight: "20px",
                    cursor: "pointer",
                    transition: "background-color var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-primary-tint)";
                    e.currentTarget.style.borderColor = "var(--color-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-surface)";
                    e.currentTarget.style.borderColor = "var(--color-border)";
                  }}
                >
                  <UserPlus size={20} strokeWidth={2} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                  <span>Register Patient</span>
                </button>

                {/* 3. View Invoices & Billing (Secondary Action) */}
                <button
                  type="button"
                  onClick={() => navigate("/billing")}
                  style={{
                    width: "100%",
                    height: "44px",
                    borderRadius: "var(--radius-control)",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text)",
                    border: "1px solid var(--color-border)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "0 16px",
                    fontSize: "14px",
                    fontWeight: "600",
                    lineHeight: "20px",
                    cursor: "pointer",
                    transition: "background-color var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-primary-tint)";
                    e.currentTarget.style.borderColor = "var(--color-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-surface)";
                    e.currentTarget.style.borderColor = "var(--color-border)";
                  }}
                >
                  <Receipt size={20} strokeWidth={2} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                  <span>View Invoices & Billing</span>
                </button>
              </div>
            </Card>

            {/* Practice Information Card (§5: 16px vertical rhythm, label #53645B 13px/500 left, value #23342D 14px/600 right) */}
            <Card title="Practice Information" padding="24px">
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "500",
                      lineHeight: "18px",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Practice Timings
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      lineHeight: "20px",
                      color: "var(--color-text)",
                      textAlign: "right",
                    }}
                  >
                    {clinicConfig.timings || "1:00 PM – 9:00 PM"}
                  </span>
                </div>

                <div
                  style={{
                    borderTop: "1px solid var(--color-border)",
                    paddingTop: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "500",
                      lineHeight: "18px",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Consultation Fee
                  </span>
                  <span
                    className="tabular-nums"
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      lineHeight: "20px",
                      color: "var(--color-text)",
                      textAlign: "right",
                    }}
                  >
                    {formatCurrency(clinicConfig.consultFee)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
