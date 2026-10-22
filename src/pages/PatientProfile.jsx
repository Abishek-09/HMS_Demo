import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Stethoscope,
  Printer,
  Eye,
  FileText,
  Receipt,
  Search,
  ArrowLeft,
} from "lucide-react";
import AppShell from "../components/AppShell";
import Card from "../components/Card";
import Button from "../components/Button";
import Chip from "../components/Chip";
import Table from "../components/Table";
import EmptyState from "../components/EmptyState";
import { getPatientById } from "../services/patients";
import { getVisitsByPatient } from "../services/visits";
import { getPrescriptionsByPatient } from "../services/prescriptions";
import { getBillsByPatient } from "../services/bills";
import { formatDate, formatCurrency } from "../utils/format";
import { useData } from "../context/DataContext";

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dataVersion } = useData();

  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab state
  const [activeTab, setActiveTab] = useState("visits"); // visits | prescriptions | bills
  const [tabSearch, setTabSearch] = useState("");

  useEffect(() => {
    loadPatientData();
  }, [id, dataVersion]);

  const loadPatientData = async () => {
    setLoading(true);
    try {
      const p = await getPatientById(id);
      if (!p) {
        navigate("/patients");
        return;
      }
      setPatient(p);

      const [vList, rxList, bList] = await Promise.all([
        getVisitsByPatient(id),
        getPrescriptionsByPatient(id),
        getBillsByPatient(id),
      ]);
      setVisits(vList);
      setPrescriptions(rxList);
      setBills(bList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Map visitId to prescription and bill for quick cross-linking
  const rxByVisitMap = useMemo(() => {
    const map = new Map();
    prescriptions.forEach((r) => map.set(r.visitId, r));
    return map;
  }, [prescriptions]);

  const billByVisitMap = useMemo(() => {
    const map = new Map();
    bills.forEach((b) => map.set(b.visitId, b));
    return map;
  }, [bills]);

  // Tab filtering
  const filteredVisits = useMemo(() => {
    if (!tabSearch.trim()) return visits;
    const q = tabSearch.toLowerCase();
    return visits.filter(
      (v) =>
        (v.complaint && v.complaint.toLowerCase().includes(q)) ||
        (v.notes && v.notes.toLowerCase().includes(q)) ||
        v.id.toLowerCase().includes(q)
    );
  }, [visits, tabSearch]);

  const filteredPrescriptions = useMemo(() => {
    if (!tabSearch.trim()) return prescriptions;
    const q = tabSearch.toLowerCase();
    return prescriptions.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.medicines.some(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.dosage.toLowerCase().includes(q) ||
            (m.instructions && m.instructions.toLowerCase().includes(q))
        )
    );
  }, [prescriptions, tabSearch]);

  const filteredBills = useMemo(() => {
    if (!tabSearch.trim()) return bills;
    const q = tabSearch.toLowerCase();
    return bills.filter(
      (b) =>
        b.invoiceNo.toLowerCase().includes(q) ||
        b.status.toLowerCase().includes(q) ||
        b.paymentMode.toLowerCase().includes(q)
    );
  }, [bills, tabSearch]);

  if (loading) {
    return (
      <AppShell title="Patient Profile">
        <div style={{ textAlign: "center", padding: "48px", color: "var(--color-text-muted)" }}>
          Loading patient profile...
        </div>
      </AppShell>
    );
  }

  if (!patient) return null;

  return (
    <AppShell title={`Patient Profile — ${patient.name}`}>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Top Back Navigation */}
        <div>
          <Button variant="text" size="sm" icon={ArrowLeft} onClick={() => navigate("/patients")}>
            Back to Patients
          </Button>
        </div>

        {/* Patient Header Card */}
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "24px",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--color-primary)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                fontWeight: "700",
                flexShrink: 0,
              }}
            >
              {patient.name.charAt(0)}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    color: "var(--color-primary)",
                    margin: 0,
                  }}
                >
                  {patient.name}
                </h2>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    backgroundColor: "var(--color-primary-tint)",
                    color: "var(--color-primary)",
                    padding: "3px 10px",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid rgba(44, 87, 69, 0.2)",
                  }}
                >
                  {patient.id}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  flexWrap: "wrap",
                  marginTop: "8px",
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-muted)",
                }}
              >
                <span>
                  <strong>Gender:</strong> {patient.gender}
                </span>
                <span>
                  <strong>Age:</strong> {patient.age ? `${patient.age} yrs` : "—"}
                  {patient.dob && ` (${formatDate(patient.dob, false)})`}
                </span>
                <span>
                  <strong>Phone:</strong> {patient.phone}
                </span>
              </div>

              {patient.address && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "var(--font-size-xs)",
                    color: "var(--color-text-muted)",
                    marginTop: "6px",
                  }}
                >
                  <MapPin size={14} />
                  <span>{patient.address}</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Button
              variant="outline"
              icon={Edit2}
              onClick={() => navigate(`/patients/${patient.id}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="primary"
              icon={Stethoscope}
              onClick={() => navigate(`/consultations/new?patientId=${patient.id}`)}
            >
              New Consultation
            </Button>
          </div>
        </div>

        {/* Tab Navigation & Search */}
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
            overflow: "hidden",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {/* Tab Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 20px",
              borderBottom: "1px solid var(--color-border)",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", gap: "24px" }}>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("visits");
                  setTabSearch("");
                }}
                style={{
                  padding: "16px 4px",
                  fontSize: "var(--font-size-sm)",
                  fontWeight: activeTab === "visits" ? "700" : "500",
                  color: activeTab === "visits" ? "var(--color-primary)" : "var(--color-text-muted)",
                  borderBottom: activeTab === "visits" ? "3px solid var(--color-primary)" : "3px solid transparent",
                  transition: "all var(--transition-fast)",
                }}
              >
                Visits ({visits.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("prescriptions");
                  setTabSearch("");
                }}
                style={{
                  padding: "16px 4px",
                  fontSize: "var(--font-size-sm)",
                  fontWeight: activeTab === "prescriptions" ? "700" : "500",
                  color: activeTab === "prescriptions" ? "var(--color-primary)" : "var(--color-text-muted)",
                  borderBottom: activeTab === "prescriptions" ? "3px solid var(--color-primary)" : "3px solid transparent",
                  transition: "all var(--transition-fast)",
                }}
              >
                Prescriptions ({prescriptions.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("bills");
                  setTabSearch("");
                }}
                style={{
                  padding: "16px 4px",
                  fontSize: "var(--font-size-sm)",
                  fontWeight: activeTab === "bills" ? "700" : "500",
                  color: activeTab === "bills" ? "var(--color-primary)" : "var(--color-text-muted)",
                  borderBottom: activeTab === "bills" ? "3px solid var(--color-primary)" : "3px solid transparent",
                  transition: "all var(--transition-fast)",
                }}
              >
                Bills ({bills.length})
              </button>
            </div>

            <div style={{ padding: "8px 0" }}>
              <div style={{ position: "relative", width: "260px" }}>
                <Search
                  size={14}
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "10px",
                    color: "var(--color-text-muted)",
                  }}
                />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={tabSearch}
                  onChange={(e) => setTabSearch(e.target.value)}
                  style={{
                    width: "100%",
                    height: "34px",
                    padding: "6px 10px 6px 30px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    fontSize: "var(--font-size-xs)",
                    outline: "none",
                  }}
                />
              </div>
            </div>
          </div>

          {/* TAB 1: VISITS */}
          {activeTab === "visits" && (
            <div>
              {filteredVisits.length === 0 ? (
                <EmptyState
                  icon={Stethoscope}
                  title="No visits recorded"
                  description="No clinical visits match your current search for this patient."
                  actionText="Start new consultation"
                  onAction={() => navigate(`/consultations/new?patientId=${patient.id}`)}
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {filteredVisits.map((visit) => {
                    const linkedRx = rxByVisitMap.get(visit.id);
                    const linkedBill = billByVisitMap.get(visit.id);

                    return (
                      <div
                        key={visit.id}
                        style={{
                          padding: "20px",
                          borderBottom: "1px solid var(--color-border)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                          gap: "16px",
                          transition: "background-color var(--transition-fast)",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: "280px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                            <span
                              style={{
                                fontSize: "var(--font-size-sm)",
                                fontWeight: "700",
                                color: "var(--color-primary)",
                              }}
                            >
                              {formatDate(visit.dateTime, true)}
                            </span>
                            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                              ({visit.id})
                            </span>
                          </div>

                          <p
                            style={{
                              fontSize: "var(--font-size-sm)",
                              fontWeight: "600",
                              color: "var(--color-text)",
                              marginBottom: "4px",
                            }}
                          >
                            Complaint: {visit.complaint}
                          </p>

                          <p
                            style={{
                              fontSize: "var(--font-size-xs)",
                              color: "var(--color-text-muted)",
                              lineHeight: 1.5,
                              marginBottom: "12px",
                            }}
                          >
                            {visit.notes}
                          </p>

                          {/* Observations pills */}
                          {visit.observations &&
                            (visit.observations.bp ||
                              visit.observations.temperature ||
                              visit.observations.weight) && (
                              <div
                                style={{
                                  display: "flex",
                                  gap: "8px",
                                  flexWrap: "wrap",
                                  fontSize: "var(--font-size-xs)",
                                  color: "var(--color-primary)",
                                }}
                              >
                                {visit.observations.weight && (
                                  <span style={{ backgroundColor: "var(--color-primary-tint)", padding: "2px 8px", borderRadius: "var(--radius-sm)" }}>
                                    Wt: {visit.observations.weight} kg
                                  </span>
                                )}
                                {visit.observations.temperature && (
                                  <span style={{ backgroundColor: "var(--color-primary-tint)", padding: "2px 8px", borderRadius: "var(--radius-sm)" }}>
                                    Temp: {visit.observations.temperature}°F
                                  </span>
                                )}
                                {visit.observations.bp && (
                                  <span style={{ backgroundColor: "var(--color-primary-tint)", padding: "2px 8px", borderRadius: "var(--radius-sm)" }}>
                                    BP: {visit.observations.bp}
                                  </span>
                                )}
                                {visit.observations.pulse && (
                                  <span style={{ backgroundColor: "var(--color-primary-tint)", padding: "2px 8px", borderRadius: "var(--radius-sm)" }}>
                                    Pulse: {visit.observations.pulse} bpm
                                  </span>
                                )}
                              </div>
                            )}
                        </div>

                        {/* Linked Records & Actions */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: "8px",
                          }}
                        >
                          <div style={{ display: "flex", gap: "8px" }}>
                            {linkedRx && (
                              <Button
                                variant="outline"
                                size="sm"
                                icon={Printer}
                                onClick={() => navigate(`/print/prescription/${linkedRx.id}`)}
                              >
                                Rx Print
                              </Button>
                            )}
                            {linkedBill && (
                              <Button
                                variant="outline"
                                size="sm"
                                icon={Printer}
                                onClick={() => navigate(`/print/receipt/${linkedBill.id}`)}
                              >
                                Receipt
                              </Button>
                            )}
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={Eye}
                              onClick={() => navigate(`/consultations/${visit.id}`)}
                            >
                              Visit Detail
                            </Button>
                          </div>

                          {linkedBill && (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <Chip variant={linkedBill.status === "Paid" ? "paid" : "unpaid"}>
                                {linkedBill.status}
                              </Chip>
                              <span style={{ fontSize: "var(--font-size-xs)", fontWeight: "600", color: "var(--color-text)" }}>
                                {formatCurrency(linkedBill.total)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRESCRIPTIONS */}
          {activeTab === "prescriptions" && (
            <div>
              {filteredPrescriptions.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No prescriptions found"
                  description="No medication records found for this patient."
                />
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Rx ID</th>
                        <th>Prescribed Date</th>
                        <th>Medicines</th>
                        <th>Linked Visit</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPrescriptions.map((rx) => (
                        <tr key={rx.id}>
                          <td style={{ fontWeight: "600", color: "var(--color-primary)" }}>{rx.id}</td>
                          <td>{formatDate(rx.createdAt, true)}</td>
                          <td>
                            <strong>{rx.medicines?.length || 0} medicines:</strong>{" "}
                            {rx.medicines?.map((m) => m.name).join(", ") || "None"}
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => navigate(`/consultations/${rx.visitId}`)}
                              style={{
                                color: "var(--color-primary)",
                                textDecoration: "underline",
                                fontSize: "var(--font-size-xs)",
                                fontWeight: "600",
                              }}
                            >
                              View Visit ({rx.visitId})
                            </button>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <Button
                              variant="outline"
                              size="sm"
                              icon={Printer}
                              onClick={() => navigate(`/print/prescription/${rx.id}`)}
                            >
                              Print A4
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BILLS */}
          {activeTab === "bills" && (
            <div>
              {filteredBills.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="No billing records"
                  description="No invoices found for this patient."
                />
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Invoice No</th>
                        <th>Date</th>
                        <th>Total Amount</th>
                        <th>Mode</th>
                        <th>Status</th>
                        <th>Linked Visit</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBills.map((bill) => (
                        <tr key={bill.id}>
                          <td style={{ fontWeight: "700", color: "var(--color-primary)" }}>
                            {bill.invoiceNo}
                          </td>
                          <td>{formatDate(bill.date || bill.createdAt, false)}</td>
                          <td style={{ fontWeight: "600" }}>{formatCurrency(bill.total)}</td>
                          <td>
                            <Chip variant="mode">{bill.paymentMode}</Chip>
                          </td>
                          <td>
                            <Chip variant={bill.status === "Paid" ? "paid" : "unpaid"}>
                              {bill.status}
                            </Chip>
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => navigate(`/consultations/${bill.visitId}`)}
                              style={{
                                color: "var(--color-primary)",
                                textDecoration: "underline",
                                fontSize: "var(--font-size-xs)",
                                fontWeight: "600",
                              }}
                            >
                              Visit ({bill.visitId})
                            </button>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "6px" }}>
                              <Button
                                variant="outline"
                                size="sm"
                                icon={Eye}
                                onClick={() => navigate(`/billing/${bill.id}`)}
                              >
                                Detail
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                icon={Printer}
                                onClick={() => navigate(`/print/receipt/${bill.id}`)}
                              >
                                Receipt
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
