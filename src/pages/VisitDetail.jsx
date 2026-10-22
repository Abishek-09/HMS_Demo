import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  Calendar,
  User,
  Activity,
  FileText,
  Receipt,
  Stethoscope,
} from "lucide-react";
import AppShell from "../components/AppShell";
import Card from "../components/Card";
import Button from "../components/Button";
import Chip from "../components/Chip";
import { getVisitById } from "../services/visits";
import { getPatientById } from "../services/patients";
import { getPrescriptionByVisit } from "../services/prescriptions";
import { getBillByVisit } from "../services/bills";
import { formatDate, formatCurrency } from "../utils/format";

export default function VisitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [visit, setVisit] = useState(null);
  const [patient, setPatient] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetails();
  }, [id]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const v = await getVisitById(id);
      if (!v) {
        navigate("/patients");
        return;
      }
      setVisit(v);

      const [p, rx, b] = await Promise.all([
        getPatientById(v.patientId),
        getPrescriptionByVisit(v.id),
        getBillByVisit(v.id),
      ]);
      setPatient(p);
      setPrescription(rx);
      setBill(b);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Visit Detail">
        <div style={{ textAlign: "center", padding: "48px", color: "var(--color-text-muted)" }}>
          Loading consultation summary...
        </div>
      </AppShell>
    );
  }

  if (!visit) return null;

  return (
    <AppShell title={`Visit Summary — ${visit.id}`}>
      <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Navigation & Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <Button
            variant="text"
            size="sm"
            icon={ArrowLeft}
            onClick={() => (patient ? navigate(`/patients/${patient.id}`) : navigate(-1))}
          >
            Back to {patient ? patient.name : "Patient"}
          </Button>

          <div style={{ display: "flex", gap: "10px" }}>
            {prescription && (
              <Button
                variant="outline"
                size="sm"
                icon={Printer}
                onClick={() => navigate(`/print/prescription/${prescription.id}`)}
              >
                Print Rx
              </Button>
            )}
            {bill && (
              <Button
                variant="secondary"
                size="sm"
                icon={Printer}
                onClick={() => navigate(`/print/receipt/${bill.id}`)}
              >
                Print Receipt
              </Button>
            )}
          </div>
        </div>

        {/* Patient & Visit Header */}
        <Card padding="20px">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span style={{ fontSize: "var(--font-size-xs)", fontWeight: "600", color: "var(--color-text-muted)" }}>
                Patient Details
              </span>
              <h3
                style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: "700",
                  color: "var(--color-primary)",
                  cursor: "pointer",
                  marginTop: "2px",
                }}
                onClick={() => navigate(`/patients/${patient?.id}`)}
              >
                {patient?.name}{" "}
                <span style={{ fontSize: "var(--font-size-xs)", fontWeight: "normal", color: "var(--color-text-muted)" }}>
                  ({patient?.id})
                </span>
              </h3>
              <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", margin: "4px 0 0" }}>
                {patient?.gender} • {patient?.age ? `${patient.age} yrs` : "—"} • {patient?.phone}
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                Consultation Date
              </span>
              <p style={{ fontSize: "var(--font-size-sm)", fontWeight: "600", color: "var(--color-text)", margin: "2px 0 0" }}>
                {formatDate(visit.dateTime, true)}
              </p>
              <span
                style={{
                  display: "inline-block",
                  marginTop: "4px",
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "var(--color-primary)",
                  backgroundColor: "var(--color-primary-tint)",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-full)",
                }}
              >
                {visit.id}
              </span>
            </div>
          </div>
        </Card>

        {/* Clinical Notes Card */}
        <Card title="Clinical Notes & Diagnosis">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <span style={{ fontSize: "var(--font-size-xs)", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase" }}>
                Chief Complaint
              </span>
              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text)", marginTop: "4px", lineHeight: 1.5 }}>
                {visit.complaint}
              </p>
            </div>

            <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "12px" }}>
              <span style={{ fontSize: "var(--font-size-xs)", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase" }}>
                Doctor's Clinical Notes
              </span>
              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text)", marginTop: "4px", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                {visit.notes}
              </p>
            </div>

            {/* Observations if available */}
            {visit.observations &&
              (visit.observations.weight ||
                visit.observations.temperature ||
                visit.observations.bp ||
                visit.observations.pulse) && (
                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "12px" }}>
                  <span style={{ fontSize: "var(--font-size-xs)", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                    Recorded Vitals
                  </span>
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "var(--font-size-sm)" }}>
                    {visit.observations.weight && (
                      <div>
                        <strong>Weight:</strong> {visit.observations.weight} kg
                      </div>
                    )}
                    {visit.observations.temperature && (
                      <div>
                        <strong>Temperature:</strong> {visit.observations.temperature}°F
                      </div>
                    )}
                    {visit.observations.bp && (
                      <div>
                        <strong>Blood Pressure:</strong> {visit.observations.bp}
                      </div>
                    )}
                    {visit.observations.pulse && (
                      <div>
                        <strong>Pulse:</strong> {visit.observations.pulse} bpm
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>
        </Card>

        {/* Prescription Card */}
        {prescription && prescription.medicines && prescription.medicines.length > 0 && (
          <Card
            title={`Prescription (${prescription.id})`}
            action={
              <Button
                variant="outline"
                size="sm"
                icon={Printer}
                onClick={() => navigate(`/print/prescription/${prescription.id}`)}
              >
                Print Prescription
              </Button>
            }
          >
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Medicine</th>
                  <th>Strength</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Qty</th>
                  <th>Instructions</th>
                </tr>
              </thead>
              <tbody>
                {prescription.medicines.map((m, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: "600", color: "var(--color-primary)" }}>{m.name}</td>
                    <td>{m.strength || "—"}</td>
                    <td>{m.dosage}</td>
                    <td>{m.frequency}</td>
                    <td>{m.duration}</td>
                    <td>{m.quantity}</td>
                    <td style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                      {m.instructions || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* Linked Bill Card */}
        {bill && (
          <Card
            title={`Invoice Details (${bill.invoiceNo})`}
            action={
              <Button
                variant="outline"
                size="sm"
                icon={Printer}
                onClick={() => navigate(`/print/receipt/${bill.id}`)}
              >
                Print Receipt
              </Button>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--font-size-sm)" }}>
                <span>Doctor Consultation Fee</span>
                <span style={{ fontWeight: "600" }}>{formatCurrency(bill.consultationFee)}</span>
              </div>

              {bill.medicineCharges &&
                bill.medicineCharges.map((item, idx) => (
                  <div
                    key={idx}
                    style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--font-size-sm)" }}
                  >
                    <span>{item.label}</span>
                    <span style={{ fontWeight: "600" }}>{formatCurrency(item.amount)}</span>
                  </div>
                ))}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "2px solid var(--color-border)",
                  paddingTop: "10px",
                  marginTop: "6px",
                }}
              >
                <div>
                  <span style={{ fontSize: "var(--font-size-base)", fontWeight: "700", color: "var(--color-primary)" }}>
                    Total Amount
                  </span>
                  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    <Chip variant="mode">{bill.paymentMode}</Chip>
                    <Chip variant={bill.status === "Paid" ? "paid" : "unpaid"}>{bill.status}</Chip>
                  </div>
                </div>
                <span style={{ fontSize: "20px", fontWeight: "700", color: "var(--color-primary)" }}>
                  {formatCurrency(bill.total)}
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
