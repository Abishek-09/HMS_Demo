import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PrintLayout from "../components/PrintLayout";
import { getBillById } from "../services/bills";
import { getPatientById } from "../services/patients";
import { getClinicConfig } from "../config/clinic";
import { formatDate, formatCurrency, numberToWords } from "../utils/format";

export default function PrintReceipt() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bill, setBill] = useState(null);
  const [patient, setPatient] = useState(null);
  const [clinic, setClinic] = useState(getClinicConfig());
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PrintLayout title="Receipt / Invoice">
        <div style={{ textAlign: "center", padding: "40px" }}>Loading receipt details...</div>
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
        {/* Header Band in #2C5745 */}
        <div className="print-header-band">
          <div>
            <h1>{clinic.name}</h1>
            <p className="clinic-sub">{clinic.timings}</p>
            <p style={{ margin: "4px 0 0", fontSize: "11px", opacity: 0.9 }}>
              {clinic.address} • Phone: {clinic.phone}
            </p>
          </div>

          <div className="doctor-meta">
            <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#FFFFFF", margin: 0 }}>
              {clinic.doctor}
            </h2>
            <p style={{ margin: "2px 0 0", color: "#EBE3A7" }}>{clinic.quals}</p>
            <p style={{ margin: "2px 0 0", opacity: 0.85 }}>{clinic.regNo}</p>
          </div>
        </div>

        {/* Invoice Title & Meta */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderBottom: "2px solid #2C5745",
            paddingBottom: "8px",
            marginBottom: "16px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#2C5745", margin: 0 }}>
              RECEIPT / INVOICE
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#555" }}>
              Original for Recipient / Patient Copy
            </p>
          </div>

          <div style={{ textAlign: "right", fontSize: "12px" }}>
            <div>
              <strong>Invoice No:</strong> <span style={{ color: "#2C5745" }}>{bill.invoiceNo}</span>
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
            <strong>Patient ID:</strong> {patient.id}
          </div>
          <div>
            <strong>Age / Gender:</strong> {patient.age ? `${patient.age} yrs` : "—"} / {patient.gender}
          </div>
          <div>
            <strong>Phone:</strong> {patient.phone}
          </div>
        </div>

        {/* Line Items Table */}
        <table className="print-table" style={{ marginTop: "16px" }}>
          <thead>
            <tr>
              <th style={{ width: "30px" }}>#</th>
              <th>Description of Service / Medication</th>
              <th style={{ textAlign: "right", width: "120px" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Doctor Consultation Fee</td>
              <td style={{ textAlign: "right", fontWeight: "500" }}>
                {formatCurrency(bill.consultationFee)}
              </td>
            </tr>

            {bill.medicineCharges &&
              bill.medicineCharges.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 2}</td>
                  <td>{item.label}</td>
                  <td style={{ textAlign: "right", fontWeight: "500" }}>
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}

            {/* Total Row */}
            <tr style={{ borderTop: "2px solid #2C5745", fontWeight: "700" }}>
              <td colSpan={2} style={{ textAlign: "right", fontSize: "14px", color: "#2C5745" }}>
                TOTAL AMOUNT PAYABLE:
              </td>
              <td style={{ textAlign: "right", fontSize: "15px", color: "#2C5745" }}>
                {formatCurrency(bill.total)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Amount in Words */}
        <div
          style={{
            backgroundColor: "#F9FAF9",
            padding: "10px 14px",
            borderRadius: "4px",
            border: "1px solid #DCE3DE",
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
            backgroundColor: bill.status === "Paid" ? "#F0F5F2" : "#FFFBEB",
            border: `1px solid ${bill.status === "Paid" ? "#2C5745" : "#8A6A17"}`,
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
                color: bill.status === "Paid" ? "#2C5745" : "#8A6A17",
              }}
            >
              {bill.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Signature Area */}
        <div className="signature-area page-break-avoid">
          <div className="signature-line">
            <p style={{ fontWeight: "700", color: "#2C5745", margin: 0 }}>
              {clinic.doctor}
            </p>
            <p style={{ fontSize: "11px", color: "#555", margin: "2px 0 0" }}>
              {clinic.quals} • {clinic.regNo}
            </p>
            <p style={{ fontSize: "10px", color: "#888", margin: "2px 0 0" }}>
              Authorized Signatory
            </p>
          </div>
        </div>

        {/* Thank You Footer */}
        <div
          style={{
            borderTop: "1px solid #DCE3DE",
            paddingTop: "12px",
            marginTop: "32px",
            textAlign: "center",
            fontSize: "11px",
            color: "#666",
          }}
        >
          Thank you for choosing {clinic.name}. Wish you good health!
          <br />
          For any questions regarding this receipt, please contact: {clinic.phone}
        </div>
      </div>
    </PrintLayout>
  );
}
