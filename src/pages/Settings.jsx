import React, { useState, useRef } from "react";
import { Download, Upload, Save, RefreshCw, Check, Database, Shield } from "lucide-react";
import AppShell from "../components/AppShell";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Textarea from "../components/Textarea";
import { ConfirmModal } from "../components/Modal";
import { useData } from "../context/DataContext";
import { exportAllData, importAllData, getLastSavedTimestamp, seedStorageIfEmpty } from "../services/storage";
import { formatDate } from "../utils/format";

export default function Settings() {
  const { clinicConfig, updateClinic, showToast, refreshData } = useData();

  const [formData, setFormData] = useState({
    name: clinicConfig.name || "",
    doctor: clinicConfig.doctor || "",
    quals: clinicConfig.quals || "",
    designation: clinicConfig.designation || "",
    regNo: clinicConfig.regNo || "",
    address: clinicConfig.address || "",
    phone: clinicConfig.phone || "",
    email: clinicConfig.email || "",
    timings: clinicConfig.timings || "",
    consultFee: clinicConfig.consultFee || 500,
    logoText: clinicConfig.logoText || "SC",
  });

  const [lastSaved, setLastSaved] = useState(getLastSavedTimestamp());
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleSaveClinic = (e) => {
    e.preventDefault();
    updateClinic({
      ...formData,
      consultFee: Number(formData.consultFee) || 500,
    });
    setLastSaved(new Date().toISOString());
  };

  const handleDownloadBackup = async () => {
    try {
      const backup = await exportAllData();
      const jsonStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateTag = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `santosh_child_care_backup_${dateTag}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Data backup JSON downloaded successfully");
    } catch (err) {
      console.error(err);
      showToast("Failed to export backup data", "error");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        await importAllData(json);
        showToast("Backup data restored successfully");
        setLastSaved(new Date().toISOString());
        refreshData();
      } catch (err) {
        console.error(err);
        showToast("Invalid backup file: " + err.message, "error");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // reset input
  };

  const handleResetDemoData = () => {
    localStorage.clear();
    seedStorageIfEmpty();
    showToast("Reset to default demonstration data");
    refreshData();
    setResetConfirmOpen(false);
    setLastSaved(new Date().toISOString());
  };

  return (
    <AppShell title="Clinic Settings">
      <div style={{ maxWidth: "840px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Clinic Identity & Doctor Settings */}
        <Card
          title="Clinic & Practitioner Identity"
          subtitle="These details appear on your printed prescriptions, receipts, and headers."
        >
          <form onSubmit={handleSaveClinic} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Input
                label="Clinic Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <Input
                label="Doctor Full Name"
                required
                value={formData.doctor}
                onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Input
                label="Medical Qualifications"
                required
                placeholder="e.g. M.B.B.S., M.D. (PEDS)"
                value={formData.quals}
                onChange={(e) => setFormData({ ...formData, quals: e.target.value })}
              />

              <Input
                label="Designation / Specialization"
                placeholder="e.g. Consultant Pediatrician"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Input
                label="Medical Council Registration No."
                placeholder="e.g. Reg. No. 12345"
                value={formData.regNo}
                onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
              />

              <Input
                label="Logo Monogram (2–3 Letters)"
                placeholder="e.g. SC"
                value={formData.logoText}
                onChange={(e) => setFormData({ ...formData, logoText: e.target.value })}
              />
            </div>

            <Textarea
              label="Clinic Physical Address"
              required
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Input
                label="Clinic Phone Number"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />

              <Input
                label="Official Email Address"
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
              <Input
                label="Clinic Timings / Operating Hours"
                required
                value={formData.timings}
                onChange={(e) => setFormData({ ...formData, timings: e.target.value })}
              />

              <Input
                label="Default Consultation Fee (₹)"
                required
                type="number"
                prefix="₹"
                value={formData.consultFee}
                onChange={(e) => setFormData({ ...formData, consultFee: e.target.value })}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                paddingTop: "16px",
                borderTop: "1px solid var(--color-border)",
                marginTop: "8px",
              }}
            >
              <Button type="submit" variant="primary" icon={Save}>
                Save Identity Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Data & Backup Panel */}
        <Card
          title="Data & Local Backup Management"
          subtitle="All patient records, visits, prescriptions, and invoices are saved securely in your browser's persistent storage."
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div
              style={{
                backgroundColor: "var(--color-primary-tint)",
                borderRadius: "var(--radius-md)",
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                border: "1px solid var(--color-border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Database size={24} color="var(--color-primary)" />
                <div>
                  <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                    Storage Status
                  </span>
                  <p style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-primary)", margin: "2px 0 0" }}>
                    Last Local Save: {formatDate(lastSaved, true)}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Download}
                  onClick={handleDownloadBackup}
                >
                  Download Data (JSON)
                </Button>

                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept=".json,application/json"
                  onChange={handleFileChange}
                />

                <Button
                  variant="outline"
                  size="sm"
                  icon={Upload}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Restore From Backup File
                </Button>
              </div>
            </div>

            {/* Reset Demo Data Section */}
            <div
              style={{
                borderTop: "1px solid var(--color-border)",
                paddingTop: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <h4 style={{ fontSize: "var(--font-size-sm)", fontWeight: "600", color: "var(--color-danger)", margin: 0 }}>
                  Reset Demo Data
                </h4>
                <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", margin: "2px 0 0" }}>
                  Clears local modifications and re-seeds the application with realistic demonstration records.
                </p>
              </div>

              <Button
                variant="danger"
                size="sm"
                icon={RefreshCw}
                onClick={() => setResetConfirmOpen(true)}
              >
                Reset to Demo Seed
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <ConfirmModal
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={handleResetDemoData}
        title="Reset All Demo Data?"
        message="This action will erase any newly entered patients, visits, and bills, replacing them with the original clinical demo dataset. Are you sure you want to proceed?"
        confirmText="Reset All Data"
        isDestructive
      />
    </AppShell>
  );
}
