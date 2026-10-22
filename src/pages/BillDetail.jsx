import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Receipt, CheckCircle, Clock } from "lucide-react";
import AppShell from "../components/AppShell";
import Card from "../components/Card";
import Button from "../components/Button";
import Chip from "../components/Chip";
import { getBillById, updateBillStatus } from "../services/bills";
import { getPatientById } from "../services/patients";
import { formatDate, formatCurrency, numberToWords } from "../utils/format";
import { useData } from "../context/DataContext";

export default function BillDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, refreshData } = useData();

  const [bill, setBill] = useState(null);
  const [patient, setPatient] = useState(null);
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

  const handleToggleStatus = async () => {
    if (!bill) return;
    const newStatus = bill.status === "Paid" ? "Unpaid" : "Paid";
    try {
      const updated = await updateBillStatus(bill.id, newStatus);
      setBill(updated);
      showToast(`Invoice marked as ${newStatus}`);
      refreshData();
    } catch (err) {
      console.error(err);
      showToast("Error updating invoice status", "error");
    }
  };

  if (loading) {
    return (
      <AppShell title="Invoice Detail">
        <div style={{ textAlign: "center", padding: "48px", color: "var(--color-text-muted)" }}>
          Loading invoice details...
        </div>
      </AppShell>
    );
  }

  if (!bill) return null;

  return (
    <AppShell title={`Invoice — ${bill.invoiceNo}`}>
      <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button variant="text" size="sm" icon={ArrowLeft} onClick={() => navigate("/billing")}>
            Back to Invoices
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Printer}
            onClick={() => navigate(`/print/receipt/${bill.id}`)}
          >
            Print Receipt (A4)
          </Button>
        </div>

        <Card padding="28px">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase" }}>
                Invoice Record
              </span>
              <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--color-primary)", margin: "4px 0 0" }}>
                {bill.invoiceNo}
              </h2>
              <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", margin: "4px 0 0" }}>
                Generated on {formatDate(bill.date || bill.createdAt, true)}
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ marginBottom: "8px" }}>
                <Chip variant={bill.status === "Paid" ? "paid" : "unpaid"}>{bill.status}</Chip>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleStatus}
              >
                Mark as {bill.status === "Paid" ? "Unpaid" : "Paid"}
              </Button>
            </div>
          </div>

          {/* Patient Strip */}
          <div
            style={{
              backgroundColor: "var(--color-primary-tint)",
              borderRadius: "var(--radius-md)",
              padding: "14px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
              fontSize: "var(--font-size-sm)",
            }}
          >
            <div>
              <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>Billed Patient</span>
              <p style={{ fontWeight: "600", color: "var(--color-primary)", margin: "2px 0 0" }}>
                {patient ? patient.name : bill.patientId}
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              {patient && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/patients/${patient.id}`)}
                >
                  View Patient
                </Button>
              )}
              {bill.visitId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/consultations/${bill.visitId}`)}
                >
                  View Visit
                </Button>
              )}
            </div>
          </div>

          {/* Line items table */}
          <table className="data-table" style={{ marginBottom: "20px" }}>
            <thead>
              <tr>
                <th>Description</th>
                <th style={{ textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Doctor Consultation Fee</td>
                <td style={{ textAlign: "right", fontWeight: "600" }}>
                  {formatCurrency(bill.consultationFee)}
                </td>
              </tr>
              {bill.medicineCharges &&
                bill.medicineCharges.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.label}</td>
                    <td style={{ textAlign: "right", fontWeight: "600" }}>
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              <tr style={{ borderTop: "2px solid var(--color-primary)", fontWeight: "700" }}>
                <td style={{ fontSize: "var(--font-size-base)", color: "var(--color-primary)" }}>
                  Total Amount
                </td>
                <td style={{ textAlign: "right", fontSize: "18px", color: "var(--color-primary)" }}>
                  {formatCurrency(bill.total)}
                </td>
              </tr>
            </tbody>
          </table>

          <div
            style={{
              backgroundColor: "var(--color-bg)",
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              fontSize: "var(--font-size-xs)",
              color: "var(--color-text)",
            }}
          >
            <strong>Amount in Words:</strong> {numberToWords(bill.total)}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
