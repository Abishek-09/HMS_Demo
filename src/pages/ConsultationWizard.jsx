import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Stethoscope,
  FileText,
  Receipt,
  CheckCircle2,
  Printer,
  User,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import AppShell from "../components/AppShell";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Textarea from "../components/Textarea";
import StepIndicator from "../components/StepIndicator";
import PatientPicker from "../components/PatientPicker";
import MedicineRowTable from "../components/MedicineRowTable";
import { ConfirmModal } from "../components/Modal";
import { getPatientById } from "../services/patients";
import { createVisit } from "../services/visits";
import { createPrescription } from "../services/prescriptions";
import { createBill } from "../services/bills";
import { validateConsultationStep1, validateMedicineRow } from "../utils/validate";
import { formatCurrency, formatDate } from "../utils/format";
import { useData } from "../context/DataContext";

export default function ConsultationWizard() {
  const [searchParams] = useSearchParams();
  const prefillPatientId = searchParams.get("patientId");
  const navigate = useNavigate();
  const { clinicConfig, showToast, refreshData } = useData();

  // Wizard Step: 1 = Consultation, 2 = Prescription, 3 = Billing, 4 = Success Screen
  const [currentStep, setCurrentStep] = useState(1);

  // Selected Patient
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Step 1: Consultation Data
  const [consultationData, setConsultationData] = useState({
    dateTime: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
    complaint: "",
    notes: "",
    observations: {
      weight: "",
      temperature: "",
      bp: "",
      pulse: "",
    },
  });
  const [step1Errors, setStep1Errors] = useState({});

  // Step 2: Prescription Data
  const [medicines, setMedicines] = useState([
    {
      name: "",
      strength: "",
      dosage: "1-0-1",
      frequency: "After food",
      duration: "5 days",
      quantity: "10 tabs",
      instructions: "",
    },
  ]);
  const [skipPrescription, setSkipPrescription] = useState(false);
  const [step2Error, setStep2Error] = useState("");

  // Step 3: Billing Data
  const [consultFee, setConsultFee] = useState(clinicConfig.consultFee || 500);
  const [medicineCharges, setMedicineCharges] = useState([]);
  const [paymentMode, setPaymentMode] = useState("Cash"); // Cash | Online
  const [billStatus, setBillStatus] = useState("Paid"); // Paid | Unpaid
  const [submitting, setSubmitting] = useState(false);

  // Saved Results (populated on finish)
  const [savedResult, setSavedResult] = useState(null);

  // Unsaved changes confirm modal
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [pendingNavigate, setPendingNavigate] = useState(null);

  // Refs for focusing first invalid field
  const complaintRef = useRef(null);
  const notesRef = useRef(null);

  useEffect(() => {
    if (prefillPatientId) {
      getPatientById(prefillPatientId).then((pat) => {
        if (pat) setSelectedPatient(pat);
      });
    }
  }, [prefillPatientId]);

  // Update consult fee if config changes
  useEffect(() => {
    if (clinicConfig.consultFee && consultFee === 500) {
      setConsultFee(clinicConfig.consultFee);
    }
  }, [clinicConfig.consultFee]);

  // Compute live billing total
  const liveTotal =
    (Number(consultFee) || 0) +
    medicineCharges.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  // Handle Step 1 -> Step 2
  const handleProceedToStep2 = () => {
    const errors = validateConsultationStep1({
      patientId: selectedPatient?.id,
      complaint: consultationData.complaint,
      notes: consultationData.notes,
    });

    setStep1Errors(errors);

    if (Object.keys(errors).length > 0) {
      if (errors.complaint && complaintRef.current) complaintRef.current.focus();
      else if (errors.notes && notesRef.current) notesRef.current.focus();
      return;
    }

    setCurrentStep(2);
  };

  // Handle Step 2 -> Step 3
  const handleProceedToStep3 = (skip = false) => {
    setStep2Error("");
    if (skip) {
      setSkipPrescription(true);
      setCurrentStep(3);
      return;
    }

    // Validate medicine rows if any exist
    if (medicines.length > 0) {
      for (let i = 0; i < medicines.length; i++) {
        const rowErr = validateMedicineRow(medicines[i]);
        if (Object.keys(rowErr).length > 0) {
          setStep2Error(`Please complete required fields for Medicine #${i + 1} (${Object.values(rowErr)[0]})`);
          return;
        }
      }
    }

    setSkipPrescription(false);
    setCurrentStep(3);
  };

  // Step 3: Add medicine charge line item
  const handleAddMedCharge = () => {
    setMedicineCharges([
      ...medicineCharges,
      { label: "Medication charges", amount: 100 },
    ]);
  };

  const handleUpdateMedCharge = (index, field, value) => {
    const updated = [...medicineCharges];
    updated[index] = { ...updated[index], [field]: value };
    setMedicineCharges(updated);
  };

  const handleRemoveMedCharge = (index) => {
    setMedicineCharges(medicineCharges.filter((_, i) => i !== index));
  };

  // Step 3 -> Save and Finish
  const handleSaveAndFinish = async () => {
    if (!selectedPatient) return;

    setSubmitting(true);
    try {
      // 1. Create Visit record
      const newVisit = await createVisit({
        patientId: selectedPatient.id,
        dateTime: new Date(consultationData.dateTime).toISOString(),
        complaint: consultationData.complaint,
        notes: consultationData.notes,
        observations: consultationData.observations,
      });

      // 2. Create Prescription if not skipped and has medicines
      let newRx = null;
      if (!skipPrescription && medicines.length > 0) {
        newRx = await createPrescription({
          visitId: newVisit.id,
          patientId: selectedPatient.id,
          medicines: medicines,
        });
      }

      // 3. Create Bill record with sequential invoice number
      const newBill = await createBill({
        visitId: newVisit.id,
        patientId: selectedPatient.id,
        date: new Date(consultationData.dateTime).toISOString(),
        consultationFee: consultFee,
        medicineCharges: medicineCharges,
        paymentMode: paymentMode,
        status: billStatus,
      });

      setSavedResult({
        visit: newVisit,
        prescription: newRx,
        bill: newBill,
      });

      showToast("Consultation, prescription, and invoice saved successfully");
      refreshData();
      setCurrentStep(4); // Show success screen
    } catch (err) {
      console.error(err);
      showToast("Error saving consultation: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestExit = (targetUrl) => {
    if (currentStep < 4 && (consultationData.complaint || selectedPatient)) {
      setPendingNavigate(targetUrl);
      setDiscardModalOpen(true);
    } else {
      navigate(targetUrl);
    }
  };

  return (
    <AppShell title="New Consultation">
      {/* Wizard Header & Step Indicator */}
      {currentStep <= 3 && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Button
              variant="text"
              size="sm"
              icon={ArrowLeft}
              onClick={() => handleRequestExit(selectedPatient ? `/patients/${selectedPatient.id}` : "/patients")}
            >
              Cancel & Exit
            </Button>
          </div>

          <StepIndicator
            currentStep={currentStep}
            steps={["Consultation Notes", "Prescription", "Billing & Invoice"]}
            onStepClick={(step) => {
              if (step < currentStep) setCurrentStep(step);
            }}
          />
        </div>
      )}

      {/* Main Content Layout with Sticky Summary Rail */}
      {currentStep <= 3 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: "24px",
            alignItems: "flex-start",
          }}
        >
          {/* Left Form Area */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Patient Selector (must be selected to proceed) */}
            <PatientPicker
              selectedPatient={selectedPatient}
              onSelectPatient={(p) => {
                setSelectedPatient(p);
                if (step1Errors.patientId) {
                  setStep1Errors({ ...step1Errors, patientId: "" });
                }
              }}
            />
            {step1Errors.patientId && (
              <span style={{ color: "var(--color-danger)", fontSize: "var(--font-size-xs)", fontWeight: "600" }}>
                {step1Errors.patientId}
              </span>
            )}

            {/* STEP 1: CONSULTATION */}
            {currentStep === 1 && (
              <Card
                title="Clinical Notes & Observations"
                subtitle="Record symptoms, diagnosis, and patient vital signs."
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <Input
                    label="Consultation Date & Time"
                    type="datetime-local"
                    value={consultationData.dateTime}
                    onChange={(e) =>
                      setConsultationData({ ...consultationData, dateTime: e.target.value })
                    }
                  />

                  <Textarea
                    ref={complaintRef}
                    label="Chief Complaint"
                    required
                    placeholder="e.g. High fever for 3 days with severe productive cough..."
                    value={consultationData.complaint}
                    onChange={(e) => {
                      setConsultationData({ ...consultationData, complaint: e.target.value });
                      if (step1Errors.complaint) setStep1Errors({ ...step1Errors, complaint: "" });
                    }}
                    error={step1Errors.complaint}
                    rows={2}
                  />

                  <Textarea
                    ref={notesRef}
                    label="Clinical Examination & Diagnosis"
                    required
                    placeholder="e.g. Chest clear on auscultation, throat congested, diagnosed with acute bronchitis..."
                    value={consultationData.notes}
                    onChange={(e) => {
                      setConsultationData({ ...consultationData, notes: e.target.value });
                      if (step1Errors.notes) setStep1Errors({ ...step1Errors, notes: "" });
                    }}
                    error={step1Errors.notes}
                    rows={4}
                  />

                  {/* Observations Section */}
                  <div
                    style={{
                      borderTop: "1px solid var(--color-border)",
                      paddingTop: "16px",
                      marginTop: "8px",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "var(--font-size-sm)",
                        fontWeight: "600",
                        color: "var(--color-primary)",
                        marginBottom: "12px",
                      }}
                    >
                      Vital Observations (Optional)
                    </h4>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
                      <Input
                        label="Weight"
                        placeholder="70"
                        suffix="kg"
                        value={consultationData.observations.weight}
                        onChange={(e) =>
                          setConsultationData({
                            ...consultationData,
                            observations: { ...consultationData.observations, weight: e.target.value },
                          })
                        }
                      />

                      <Input
                        label="Temperature"
                        placeholder="98.6"
                        suffix="°F"
                        value={consultationData.observations.temperature}
                        onChange={(e) =>
                          setConsultationData({
                            ...consultationData,
                            observations: { ...consultationData.observations, temperature: e.target.value },
                          })
                        }
                      />

                      <Input
                        label="Blood Pressure"
                        placeholder="120/80"
                        value={consultationData.observations.bp}
                        onChange={(e) =>
                          setConsultationData({
                            ...consultationData,
                            observations: { ...consultationData.observations, bp: e.target.value },
                          })
                        }
                      />

                      <Input
                        label="Pulse"
                        placeholder="72"
                        suffix="bpm"
                        value={consultationData.observations.pulse}
                        onChange={(e) =>
                          setConsultationData({
                            ...consultationData,
                            observations: { ...consultationData.observations, pulse: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: "16px",
                      paddingTop: "16px",
                      borderTop: "1px solid var(--color-border)",
                    }}
                  >
                    <Button variant="primary" icon={ArrowRight} onClick={handleProceedToStep2}>
                      Save & Continue to Prescription
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* STEP 2: PRESCRIPTION */}
            {currentStep === 2 && (
              <Card
                title="Prescription Details"
                subtitle="Add required medications, dosages, frequency, and instructions."
              >
                {step2Error && (
                  <div
                    style={{
                      backgroundColor: "#FDF2F2",
                      border: "1px solid rgba(179, 38, 30, 0.3)",
                      color: "var(--color-danger)",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                      fontSize: "var(--font-size-sm)",
                      marginBottom: "16px",
                    }}
                  >
                    {step2Error}
                  </div>
                )}

                <MedicineRowTable medicines={medicines} onChange={setMedicines} />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "24px",
                    paddingTop: "16px",
                    borderTop: "1px solid var(--color-border)",
                  }}
                >
                  <Button variant="outline" icon={ArrowLeft} onClick={() => setCurrentStep(1)}>
                    Back to Notes
                  </Button>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <Button
                      variant="outline"
                      onClick={() => handleProceedToStep3(true)}
                    >
                      Skip Prescription
                    </Button>
                    <Button
                      variant="primary"
                      icon={ArrowRight}
                      onClick={() => handleProceedToStep3(false)}
                    >
                      Save & Continue to Billing
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* STEP 3: BILLING */}
            {currentStep === 3 && (
              <Card
                title="Invoice & Payment Details"
                subtitle="Review consultation fee, line items, and record payment mode."
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* Fee Inputs */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <Input
                      label="Doctor Consultation Fee"
                      type="number"
                      prefix="₹"
                      value={consultFee}
                      onChange={(e) => setConsultFee(e.target.value)}
                    />

                    <div>
                      <label style={{ fontSize: "var(--font-size-sm)", fontWeight: "500", color: "var(--color-text)", display: "block", marginBottom: "6px" }}>
                        Payment Mode
                      </label>
                      <div style={{ display: "flex", gap: "16px", height: "40px", alignItems: "center" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "var(--font-size-sm)" }}>
                          <input
                            type="radio"
                            name="paymentMode"
                            value="Cash"
                            checked={paymentMode === "Cash"}
                            onChange={() => setPaymentMode("Cash")}
                          />
                          Cash
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "var(--font-size-sm)" }}>
                          <input
                            type="radio"
                            name="paymentMode"
                            value="Online"
                            checked={paymentMode === "Online"}
                            onChange={() => setPaymentMode("Online")}
                          />
                          Online (UPI / Card)
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Payment Status Toggle */}
                  <div>
                    <label style={{ fontSize: "var(--font-size-sm)", fontWeight: "500", color: "var(--color-text)", display: "block", marginBottom: "6px" }}>
                      Bill Status
                    </label>
                    <div style={{ display: "inline-flex", backgroundColor: "var(--color-bg)", padding: "4px", borderRadius: "var(--radius-full)", border: "1px solid var(--color-border)" }}>
                      <button
                        type="button"
                        onClick={() => setBillStatus("Paid")}
                        style={{
                          padding: "6px 16px",
                          borderRadius: "var(--radius-full)",
                          fontSize: "var(--font-size-xs)",
                          fontWeight: billStatus === "Paid" ? "700" : "500",
                          backgroundColor: billStatus === "Paid" ? "var(--color-primary)" : "transparent",
                          color: billStatus === "Paid" ? "#FFFFFF" : "var(--color-text-muted)",
                          transition: "all var(--transition-fast)",
                        }}
                      >
                        Paid
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillStatus("Unpaid")}
                        style={{
                          padding: "6px 16px",
                          borderRadius: "var(--radius-full)",
                          fontSize: "var(--font-size-xs)",
                          fontWeight: billStatus === "Unpaid" ? "700" : "500",
                          backgroundColor: billStatus === "Unpaid" ? "var(--color-accent-tint)" : "transparent",
                          color: billStatus === "Unpaid" ? "var(--color-warning)" : "var(--color-text-muted)",
                          transition: "all var(--transition-fast)",
                        }}
                      >
                        Unpaid
                      </button>
                    </div>
                  </div>

                  {/* Medicine Charges Line Items */}
                  <div
                    style={{
                      borderTop: "1px solid var(--color-border)",
                      paddingTop: "16px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <h4 style={{ fontSize: "var(--font-size-sm)", fontWeight: "600", color: "var(--color-primary)", margin: 0 }}>
                        Medicine / Additional Charges Line Items
                      </h4>
                      <Button variant="secondary" size="sm" icon={Plus} onClick={handleAddMedCharge}>
                        Add Item
                      </Button>
                    </div>

                    {medicineCharges.length === 0 ? (
                      <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", margin: 0 }}>
                        No additional medicine charges added. (Optional)
                      </p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {medicineCharges.map((item, idx) => (
                          <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <input
                              type="text"
                              placeholder="Description / Medicine"
                              value={item.label}
                              onChange={(e) => handleUpdateMedCharge(idx, "label", e.target.value)}
                              style={{
                                flex: 2,
                                height: "36px",
                                padding: "6px 10px",
                                borderRadius: "var(--radius-sm)",
                                border: "1px solid var(--color-border)",
                                fontSize: "var(--font-size-xs)",
                              }}
                            />
                            <div style={{ flex: 1, position: "relative" }}>
                              <span style={{ position: "absolute", left: "8px", top: "8px", fontSize: "12px", color: "var(--color-text-muted)" }}>
                                ₹
                              </span>
                              <input
                                type="number"
                                placeholder="Amount"
                                value={item.amount}
                                onChange={(e) => handleUpdateMedCharge(idx, "amount", e.target.value)}
                                style={{
                                  width: "100%",
                                  height: "36px",
                                  padding: "6px 10px 6px 22px",
                                  borderRadius: "var(--radius-sm)",
                                  border: "1px solid var(--color-border)",
                                  fontSize: "var(--font-size-xs)",
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMedCharge(idx)}
                              aria-label="Remove item"
                              style={{ color: "var(--color-danger)", padding: "4px" }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Total Display */}
                  <div
                    style={{
                      backgroundColor: "var(--color-primary-tint)",
                      padding: "16px 20px",
                      borderRadius: "var(--radius-md)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: "1px solid rgba(44, 87, 69, 0.2)",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "var(--font-size-xs)", textTransform: "uppercase", fontWeight: "700", color: "var(--color-primary)" }}>
                        Calculated Total Bill
                      </span>
                      <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", margin: "2px 0 0" }}>
                        Includes consultation fee and line items
                      </p>
                    </div>
                    <span style={{ fontSize: "24px", fontWeight: "700", color: "var(--color-primary)" }}>
                      {formatCurrency(liveTotal)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "16px",
                      paddingTop: "16px",
                      borderTop: "1px solid var(--color-border)",
                    }}
                  >
                    <Button variant="outline" icon={ArrowLeft} onClick={() => setCurrentStep(2)}>
                      Back to Prescription
                    </Button>

                    <Button
                      variant="primary"
                      size="lg"
                      loading={submitting}
                      onClick={handleSaveAndFinish}
                      icon={CheckCircle2}
                    >
                      Save & Finish Consultation
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sticky Summary Rail on the Right */}
          <aside
            style={{
              position: "sticky",
              top: "84px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <Card title="Consultation Summary" padding="16px">
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "var(--font-size-xs)" }}>
                <div>
                  <span style={{ color: "var(--color-text-muted)" }}>Patient:</span>
                  <p style={{ fontWeight: "600", color: "var(--color-primary)", margin: "2px 0 0", fontSize: "var(--font-size-sm)" }}>
                    {selectedPatient ? selectedPatient.name : "Not selected yet"}
                  </p>
                  {selectedPatient && (
                    <span style={{ color: "var(--color-text-muted)" }}>
                      {selectedPatient.id} • {selectedPatient.gender}
                    </span>
                  )}
                </div>

                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "8px" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Doctor:</span>
                  <p style={{ fontWeight: "600", color: "var(--color-text)", margin: "2px 0 0" }}>
                    {clinicConfig.doctor}
                  </p>
                </div>

                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "8px" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Prescription:</span>
                  <p style={{ fontWeight: "600", color: "var(--color-text)", margin: "2px 0 0" }}>
                    {skipPrescription ? "Skipped" : `${medicines.length} medicine(s)`}
                  </p>
                </div>

                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "8px" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Running Bill:</span>
                  <p style={{ fontSize: "18px", fontWeight: "700", color: "var(--color-primary)", margin: "2px 0 0" }}>
                    {formatCurrency(liveTotal)}
                  </p>
                  <span style={{ color: "var(--color-text-muted)" }}>
                    Status: <strong>{billStatus}</strong> ({paymentMode})
                  </span>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      ) : (
        /* STEP 4: SUCCESS SCREEN */
        <div style={{ maxWidth: "580px", margin: "40px auto 0" }}>
          <Card padding="36px">
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "var(--color-primary)",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "var(--color-primary)",
                  marginBottom: "8px",
                }}
              >
                Consultation Completed!
              </h2>

              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", maxWidth: "420px", lineHeight: 1.5, marginBottom: "28px" }}>
                Records have been saved to local medical database and linked to{" "}
                <strong>{selectedPatient?.name}</strong>.
              </p>

              {/* Saved Records Meta Strip */}
              <div
                style={{
                  width: "100%",
                  backgroundColor: "var(--color-primary-tint)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  marginBottom: "28px",
                  display: "flex",
                  justifyContent: "space-around",
                  textAlign: "center",
                  border: "1px solid rgba(44, 87, 69, 0.15)",
                }}
              >
                <div>
                  <span style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                    Visit ID
                  </span>
                  <p style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-primary)", margin: "2px 0 0" }}>
                    {savedResult?.visit?.id}
                  </p>
                </div>

                {savedResult?.prescription && (
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                      Rx Number
                    </span>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-primary)", margin: "2px 0 0" }}>
                      {savedResult?.prescription?.id}
                    </p>
                  </div>
                )}

                <div>
                  <span style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                    Invoice No
                  </span>
                  <p style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-primary)", margin: "2px 0 0" }}>
                    {savedResult?.bill?.invoiceNo}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                {savedResult?.prescription && (
                  <Button
                    variant="primary"
                    size="lg"
                    icon={Printer}
                    onClick={() => navigate(`/print/prescription/${savedResult.prescription.id}`)}
                  >
                    Print Prescription (A4)
                  </Button>
                )}

                <Button
                  variant="secondary"
                  size="lg"
                  icon={Printer}
                  onClick={() => navigate(`/print/receipt/${savedResult.bill.id}`)}
                >
                  Print Receipt / Invoice (A4)
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => navigate(`/patients/${selectedPatient.id}`)}
                  style={{ marginTop: "8px" }}
                >
                  Back to Patient Profile
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Discard confirmation modal */}
      <ConfirmModal
        isOpen={discardModalOpen}
        onClose={() => setDiscardModalOpen(false)}
        onConfirm={() => {
          setDiscardModalOpen(false);
          if (pendingNavigate) navigate(pendingNavigate);
        }}
        title="Discard Unsaved Consultation?"
        message="You have unsaved clinical entries. If you leave now, the consultation details for this visit will be discarded."
        confirmText="Discard & Exit"
        isDestructive
      />
    </AppShell>
  );
}
