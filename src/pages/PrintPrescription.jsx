import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PrintLayout from "../components/PrintLayout";
import { getPrescriptionById } from "../services/prescriptions";
import { getPatientById } from "../services/patients";
import { getVisitById } from "../services/visits";
import { useData } from "../context/DataContext";
import { formatDate } from "../utils/format";
import "../styles/print.css";

export default function PrintPrescription() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clinicConfig } = useData();

  const [prescription, setPrescription] = useState(null);
  const [patient, setPatient] = useState(null);
  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const rx = await getPrescriptionById(id);
      if (!rx) {
        navigate("/consultations");
        return;
      }
      setPrescription(rx);

      const pat = await getPatientById(rx.patientId);
      setPatient(pat);

      if (rx.visitId) {
        const v = await getVisitById(rx.visitId);
        setVisit(v);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clinic = clinicConfig;

  if (loading) {
    return (
      <PrintLayout title="Loading Prescription...">
        <div style={{ textAlign: "center", padding: "40px" }}>Loading prescription...</div>
      </PrintLayout>
    );
  }

  if (!prescription || !patient) return null;

  return (
    <PrintLayout
      title={`Prescription — ${patient.name} (${prescription.id})`}
      backTo={patient ? `/patients/${patient.id}` : "/patients"}
    >
      <div className="print-page">
        {/* Header Band in #245744 */}
        <div className="print-header-band">
          <div>
            <h1>{clinic.name}</h1>
            <p className="clinic-sub">Consulting Time: {clinic.timings}</p>
            <p style={{ margin: "4px 0 0", fontSize: "11px", opacity: 0.9 }}>
              {clinic.address} • Cell: {clinic.phone}
            </p>
          </div>

          <div className="doctor-meta">
            <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#FFFFFF", margin: 0 }}>
              {clinic.doctor}
            </h2>
            <p style={{ margin: "2px 0 0", color: "var(--color-accent)" }}>{clinic.quals}</p>
            <p style={{ margin: "2px 0 0", color: "#FFFFFF", fontSize: "11px" }}>
              {clinic.designation || "Consultant Pediatrician"}
            </p>
          </div>
        </div>

        {/* Patient Strip */}
        <div className="print-patient-strip">
          <div>
            <strong>Patient Name:</strong> {patient.name}
          </div>
          <div>
            <strong>PT-ID:</strong> {patient.id}
          </div>
          <div>
            <strong>Age / Gender:</strong> {patient.age ? `${patient.age} yrs` : "—"} / {patient.gender}
          </div>
          <div>
            <strong>Date:</strong> {formatDate(prescription.createdAt || visit?.dateTime, false)}
          </div>
        </div>

        {/* Clinical Complaint & Observations Block if filled */}
        {visit && (
          <div className="print-block page-break-avoid">
            <div className="print-block-title">Clinical Findings & Vitals</div>
            <p style={{ margin: "4px 0 8px", fontSize: "12px", color: "var(--color-text)" }}>
              <strong>Chief Complaint:</strong> {visit.complaint}
            </p>

            {visit.observations &&
              (visit.observations.weight ||
                visit.observations.temperature ||
                visit.observations.bp ||
                visit.observations.pulse) && (
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    flexWrap: "wrap",
                    fontSize: "11px",
                    backgroundColor: "var(--color-bg)",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  {visit.observations.weight && (
                    <span>
                      <strong>Weight:</strong> {visit.observations.weight} kg
                    </span>
                  )}
                  {visit.observations.temperature && (
                    <span>
                      <strong>Temp:</strong> {visit.observations.temperature} °F
                    </span>
                  )}
                  {visit.observations.bp && (
                    <span>
                      <strong>BP:</strong> {visit.observations.bp}
                    </span>
                  )}
                  {visit.observations.pulse && (
                    <span>
                      <strong>Pulse:</strong> {visit.observations.pulse} bpm
                    </span>
                  )}
                </div>
              )}
          </div>
        )}

        {/* Rx Symbol & Medication Table */}
        <div className="rx-symbol">℞</div>

        <table className="print-table">
          <thead>
            <tr>
              <th style={{ width: "24px" }}>#</th>
              <th>Medicine & Strength</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Duration</th>
              <th>Qty</th>
              <th>Instructions</th>
            </tr>
          </thead>
          <tbody>
            {prescription.medicines && prescription.medicines.length > 0 ? (
              prescription.medicines.map((m, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: "600", color: "var(--color-text-secondary)" }}>{idx + 1}</td>
                  <td>
                    <strong style={{ color: "var(--color-primary)" }}>{m.name}</strong>
                    {m.strength && (
                      <span style={{ color: "var(--color-text-secondary)", marginLeft: "6px" }}>({m.strength})</span>
                    )}
                  </td>
                  <td>{m.dosage}</td>
                  <td>{m.frequency}</td>
                  <td>{m.duration}</td>
                  <td>{m.quantity}</td>
                  <td style={{ fontStyle: "italic", color: "var(--color-text-secondary)" }}>{m.instructions || "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "16px" }}>
                  No specific medicines prescribed. Advised general rest and symptomatic care.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Doctor's General Advice / Notes */}
        {visit && visit.notes && (
          <div className="print-block page-break-avoid" style={{ marginTop: "16px" }}>
            <div className="print-block-title">Doctor's Clinical Notes & Advice</div>
            <p style={{ margin: "4px 0 0", fontSize: "11px", lineHeight: 1.5, color: "var(--color-text)" }}>
              {visit.notes}
            </p>
          </div>
        )}

        {/* Signature Area */}
        <div className="signature-area page-break-avoid">
          <div className="signature-line">
            <p style={{ fontWeight: "700", color: "var(--color-primary)", margin: 0 }}>
              {clinic.doctor}
            </p>
            <p style={{ fontSize: "11px", color: "var(--color-text-secondary)", margin: "2px 0 0" }}>
              {clinic.quals} • {clinic.designation || "Consultant Pediatrician"}
            </p>
            <p style={{ fontSize: "10px", color: "var(--color-text-secondary)", margin: "2px 0 0" }}>
              Authorized Signature
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            paddingTop: "8px",
            marginTop: "24px",
            textAlign: "center",
            fontSize: "10px",
            color: "var(--color-text-secondary)",
          }}
        >
          {clinic.name} • {clinic.address} • Consulting Time: {clinic.timings} • Cell: {clinic.phone}
        </div>
      </div>
    </PrintLayout>
  );
}
