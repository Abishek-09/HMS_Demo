import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PrintLayout from "../components/PrintLayout";
import { getBillById } from "../services/bills";
import { getPatientById } from "../services/patients";
import { getVisitById } from "../services/visits";
import { useData } from "../context/DataContext";
import { formatDate, formatCurrency, numberToWords } from "../utils/format";
import "../styles/print.css";

export default function PrintReceipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clinicConfig } = useData();

  const [bill, setBill] = useState(null);
  const [patient, setPatient] = useState(null);
  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const b = await getBillById(id);
      if (!b) {
        navigate("/billing");
        return;
      }
      setBill(b);

      const pat = await getPatientById(b.patientId);
      setPatient(pat);

      if (b.visitId) {
        const v = await getVisitById(b.visitId);
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
      <PrintLayout title="Loading Receipt...">
        <div style={{ textAlign: "center", padding: "40px" }}>Loading receipt...</div>
      </PrintLayout>
    );
  }

  if (!bill || !patient) return null;

  return (
    <PrintLayout
      title={`Invoice — ${bill.invoiceNo}`}
      backTo={patient ? `/patients/${patient.id}` : "/billing"}
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

        {/* Invoice Title & Meta */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderBottom: "2px solid var(--color-primary)",
            paddingBottom: "8px",
            marginBottom: "16px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--color-primary)", margin: 0 }}>
              RECEIPT / INVOICE
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--color-text-secondary)" }}>
              Original for Recipient / Patient Copy
            </p>
          </div>

          <div style={{ textAlign: "right", fontSize: "12px" }}>
            <div>
              <strong>Invoice No:</strong> <span style={{ color: "var(--color-primary)", fontWeight: "600" }}>{bill.invoiceNo}</span>
            </div>
            <div style={{ marginTop: "2px" }}>
              <strong>Date:</strong> {formatDate(bill.date || bill.createdAt, false)}
            </div>
          </div>
        </div>

        {/* Billed To Patient Strip */}
        <div className="print-patient-strip">
          <div>
            <strong>Billed To:</strong> {patient.name}
          </div>
          <div>
            <strong>PT-ID:</strong> {patient.id}
          </div>
          <div>
            <strong>Contact:</strong> {patient.phone}
          </div>
          <div>
            <strong>Payment Mode:</strong> {bill.paymentMode}
          </div>
        </div>

        {/* Breakdown Table */}
        <table className="print-table">
          <thead>
            <tr>
              <th style={{ width: "36px" }}>#</th>
              <th>Service / Item Description</th>
              <th style={{ textAlign: "right", width: "120px" }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>
                <strong>Doctor Consultation Fee</strong>
                <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--color-text-secondary)" }}>
                  Consultation on {formatDate(bill.date || bill.createdAt, false)}
                </p>
              </td>
              <td style={{ textAlign: "right", fontWeight: "600" }}>
                {formatCurrency(bill.consultationFee)}
              </td>
            </tr>

            {bill.medicineCharges &&
              bill.medicineCharges.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 2}</td>
                  <td>{item.label}</td>
                  <td style={{ textAlign: "right", fontWeight: "600" }}>
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}

            {/* Total Row */}
            <tr style={{ borderTop: "2px solid var(--color-primary)", fontWeight: "700" }}>
              <td colSpan={2} style={{ textAlign: "right", fontSize: "14px", color: "var(--color-primary)" }}>
                TOTAL AMOUNT PAYABLE:
              </td>
              <td style={{ textAlign: "right", fontSize: "15px", color: "var(--color-primary)" }}>
                {formatCurrency(bill.total)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Amount in Words */}
        <div
          style={{
            backgroundColor: "var(--color-bg)",
            padding: "10px 14px",
            borderRadius: "4px",
            border: "1px solid var(--color-border)",
            fontSize: "12px",
            marginBottom: "20px",
          }}
        >
          <strong>Amount in Words:</strong> {numberToWords(bill.total)}
        </div>

        {/* Payment Summary Box */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            borderRadius: "4px",
            backgroundColor: bill.status === "Paid" ? "var(--color-primary-tint)" : "var(--color-accent)",
            border: `1px solid ${bill.status === "Paid" ? "var(--color-primary)" : "var(--color-accent-text)"}`,
            fontSize: "12px",
            marginBottom: "32px",
          }}
        >
          <div>
            <strong>Payment Mode:</strong> {bill.paymentMode}
          </div>
          <div>
            <strong>Status:</strong>{" "}
            <span
              style={{
                fontWeight: "700",
                color: bill.status === "Paid" ? "var(--color-primary)" : "var(--color-accent-text)",
              }}
            >
              {bill.status.toUpperCase()}
            </span>
          </div>
        </div>

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
              Authorized Signatory
            </p>
          </div>
        </div>

        {/* Thank You Footer */}
        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            paddingTop: "12px",
            marginTop: "32px",
            textAlign: "center",
            fontSize: "11px",
            color: "var(--color-text-secondary)",
          }}
        >
          Thank you for visiting {clinic.name}. Wish your child vibrant health!
          <br />
          For any questions regarding this receipt, please contact: {clinic.phone}
        </div>
      </div>
    </PrintLayout>
  );
}
