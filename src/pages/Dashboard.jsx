import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Stethoscope,
  Receipt,
  IndianRupee,
  UserPlus,
  Eye,
  Printer,
  Calendar,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import AppShell from "../components/AppShell";
import Card from "../components/Card";
import Button from "../components/Button";
import Chip from "../components/Chip";
import EmptyState from "../components/EmptyState";
import { getVisits } from "../services/visits";
import { getPatients } from "../services/patients";
import { getBills } from "../services/bills";
import { getPrescriptions } from "../services/prescriptions";
import { formatDate, formatTime, formatCurrency } from "../utils/format";
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

  // Determine today's date range
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
        {/* Top Greeting & Today Chip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "26px",
                fontWeight: "700",
                color: "var(--color-primary)",
                margin: 0,
              }}
            >
              {greeting}, {clinicConfig.doctor}
            </h2>
            <p
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-muted)",
                margin: "4px 0 0",
              }}
            >
              Welcome back to {clinicConfig.name}. Here is your clinical overview for today.
            </p>
          </div>

          <Chip variant="accent" size="md">
            <Calendar size={14} style={{ marginRight: "4px" }} />
            <span>Today: {formatDate(new Date(), false)}</span>
          </Chip>
        </div>

        {/* 4 Stat Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          {/* Stat 1: Patients Today */}
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
              padding: "20px",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-primary-tint)",
                color: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Users size={24} />
            </div>
            <div>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", fontWeight: "500" }}>
                Patients Today
              </span>
              <p style={{ fontSize: "24px", fontWeight: "700", color: "var(--color-primary)", margin: "2px 0 0" }}>
                {patientsTodayCount}
              </p>
            </div>
          </div>

          {/* Stat 2: Consultations Today */}
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
              padding: "20px",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-primary-tint)",
                color: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Stethoscope size={24} />
            </div>
            <div>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", fontWeight: "500" }}>
                Consultations Today
              </span>
              <p style={{ fontSize: "24px", fontWeight: "700", color: "var(--color-primary)", margin: "2px 0 0" }}>
                {visitsToday.length}
              </p>
            </div>
          </div>

          {/* Stat 3: Unpaid Bills */}
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
              padding: "20px",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/billing")}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-accent-tint)",
                color: "var(--color-warning)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Receipt size={24} />
            </div>
            <div>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", fontWeight: "500" }}>
                Unpaid Invoices
              </span>
              <p style={{ fontSize: "24px", fontWeight: "700", color: "var(--color-warning)", margin: "2px 0 0" }}>
                {unpaidBills.length}
              </p>
            </div>
          </div>

          {/* Stat 4: Total Collected Today */}
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
              padding: "20px",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-primary-tint)",
                color: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IndianRupee size={24} />
            </div>
            <div>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", fontWeight: "500" }}>
                Collected Today
              </span>
              <p style={{ fontSize: "24px", fontWeight: "700", color: "var(--color-primary)", margin: "2px 0 0" }}>
                {formatCurrency(totalCollectedToday)}
              </p>
            </div>
          </div>
        </div>

        {/* 2 Columns: Today's Visits (left) + Quick Actions (right) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: "24px",
            alignItems: "flex-start",
          }}
        >
          {/* Today's Visits Table */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3
                  style={{
                    fontSize: "var(--font-size-base)",
                    fontWeight: "700",
                    color: "var(--color-primary)",
                    margin: 0,
                  }}
                >
                  Today's Consultations ({visitsToday.length})
                </h3>
                <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", margin: "2px 0 0" }}>
                  Visits recorded for patient consultations today
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/consultations")}
              >
                View All Visits
              </Button>
            </div>

            {visitsToday.length === 0 ? (
              <div
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <EmptyState
                  icon={Calendar}
                  title="No visits recorded yet today"
                  description="Start a walk-in consultation or register a new patient to begin today's clinic appointments."
                  actionText="Start New Consultation"
                  onAction={() => navigate("/consultations/new")}
                  actionIcon={Stethoscope}
                />
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Time</th>
                      <th>Complaint</th>
                      <th>Bill Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitsToday.map((v) => {
                      const patient = patientsMap.get(v.patientId);
                      const rx = rxMap.get(v.id);
                      const bill = billMap.get(v.id);

                      return (
                        <tr key={v.id}>
                          <td>
                            <div style={{ fontWeight: "600", color: "var(--color-primary)" }}>
                              {patient ? patient.name : v.patientId}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                              {patient?.phone}
                            </div>
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>{formatTime(v.dateTime)}</td>
                          <td style={{ maxWidth: "200px" }}>
                            <span
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={v.complaint}
                            >
                              {v.complaint}
                            </span>
                          </td>
                          <td>
                            {bill ? (
                              <Chip variant={bill.status === "Paid" ? "paid" : "unpaid"}>
                                {bill.status}
                              </Chip>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                            <div style={{ display: "inline-flex", gap: "6px" }}>
                              <Button
                                variant="outline"
                                size="sm"
                                icon={Eye}
                                onClick={() => navigate(`/consultations/${v.id}`)}
                                title="View Visit"
                              />
                              {rx && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  icon={Printer}
                                  onClick={() => navigate(`/print/prescription/${rx.id}`)}
                                  title="Print Prescription"
                                />
                              )}
                              {bill && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  icon={Printer}
                                  onClick={() => navigate(`/print/receipt/${bill.id}`)}
                                  title="Print Receipt"
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Card
              title="Quick Actions"
              subtitle="Common clinic workflows"
              padding="20px"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Button
                  variant="primary"
                  size="md"
                  icon={Stethoscope}
                  onClick={() => navigate("/consultations/new")}
                  style={{ width: "100%", justifyContent: "flex-start", padding: "12px 16px" }}
                >
                  New Consultation
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  icon={UserPlus}
                  onClick={() => navigate("/patients/new")}
                  style={{ width: "100%", justifyContent: "flex-start", padding: "12px 16px" }}
                >
                  Register Patient
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  icon={Receipt}
                  onClick={() => navigate("/billing")}
                  style={{ width: "100%", justifyContent: "flex-start", padding: "12px 16px" }}
                >
                  View Invoices & Billing
                </Button>
              </div>
            </Card>

            {/* Clinic Info Badge */}
            <Card padding="16px">
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "var(--font-size-xs)" }}>
                <span style={{ fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase" }}>
                  Practice Timings
                </span>
                <p style={{ color: "var(--color-text)", margin: 0 }}>
                  {clinicConfig.timings}
                </p>
                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "8px", marginTop: "4px" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Standard Consultation Fee:</span>
                  <p style={{ fontWeight: "700", color: "var(--color-primary)", margin: "2px 0 0", fontSize: "var(--font-size-sm)" }}>
                    {formatCurrency(clinicConfig.consultFee)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
