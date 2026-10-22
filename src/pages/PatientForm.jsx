import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User, Phone, MapPin, Calendar, Check } from "lucide-react";
import AppShell from "../components/AppShell";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Textarea from "../components/Textarea";
import { getPatientById, createPatient, updatePatient } from "../services/patients";
import { validatePatient } from "../utils/validate";
import { useData } from "../context/DataContext";

export default function PatientForm() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { showToast, refreshData } = useData();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "Male",
    isAgeMode: true,
    age: "",
    dob: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  // Focus ref for the first invalid input
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const ageRef = useRef(null);
  const dobRef = useRef(null);

  useEffect(() => {
    if (isEditMode) {
      loadExistingPatient();
    }
  }, [id]);

  const loadExistingPatient = async () => {
    setLoading(true);
    try {
      const patient = await getPatientById(id);
      if (!patient) {
        showToast("Patient not found", "error");
        navigate("/patients");
        return;
      }

      setFormData({
        name: patient.name || "",
        phone: patient.phone || "",
        gender: patient.gender || "Male",
        isAgeMode: !patient.dob,
        age: patient.age !== null && patient.age !== undefined ? String(patient.age) : "",
        dob: patient.dob || "",
        address: patient.address || "",
      });
    } catch (err) {
      console.error(err);
      showToast("Error loading patient details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valErrors = validatePatient(formData, formData.isAgeMode);
    setErrors(valErrors);

    if (Object.keys(valErrors).length > 0) {
      // Focus first invalid field
      if (valErrors.name && nameRef.current) nameRef.current.focus();
      else if (valErrors.phone && phoneRef.current) phoneRef.current.focus();
      else if (valErrors.age && ageRef.current) ageRef.current.focus();
      else if (valErrors.dob && dobRef.current) dobRef.current.focus();
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        await updatePatient(id, {
          name: formData.name,
          phone: formData.phone,
          gender: formData.gender,
          age: formData.isAgeMode ? formData.age : null,
          dob: !formData.isAgeMode ? formData.dob : null,
          address: formData.address,
        });
        showToast("Patient updated successfully");
        refreshData();
        navigate(`/patients/${id}`);
      } else {
        const created = await createPatient({
          name: formData.name,
          phone: formData.phone,
          gender: formData.gender,
          age: formData.isAgeMode ? formData.age : null,
          dob: !formData.isAgeMode ? formData.dob : null,
          address: formData.address,
        });
        showToast(`Patient registered: ${created.name} (${created.id})`);
        refreshData();
        navigate(`/patients/${created.id}`);
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to save patient", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppShell title={isEditMode ? "Edit Patient" : "Register Patient"}>
        <div style={{ textAlign: "center", padding: "48px", color: "var(--color-text-muted)" }}>
          Loading patient details...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={isEditMode ? `Edit Patient (${id})` : "Register New Patient"}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        <div style={{ marginBottom: "20px" }}>
          <Button
            variant="text"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </div>

        <Card
          title={isEditMode ? "Update Patient Record" : "Patient Registration"}
          subtitle="All fields marked with an asterisk (*) are mandatory for clinical records."
        >
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <Input
              ref={nameRef}
              label="Full Name"
              required
              placeholder="e.g. Anand Varma"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              error={errors.name}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Input
                ref={phoneRef}
                label="Phone Number"
                required
                placeholder="e.g. +91 98765 43210"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (errors.phone) setErrors({ ...errors, phone: "" });
                }}
                error={errors.phone}
                helperText="10–15 digits"
              />

              <Select
                label="Gender"
                required
                value={formData.gender}
                onChange={(e) => {
                  setFormData({ ...formData, gender: e.target.value });
                  if (errors.gender) setErrors({ ...errors, gender: "" });
                }}
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Other", label: "Other" },
                ]}
                error={errors.gender}
              />
            </div>

            {/* Age OR Date of Birth Toggle */}
            <div
              style={{
                backgroundColor: "var(--color-bg)",
                padding: "16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <span style={{ fontSize: "var(--font-size-sm)", fontWeight: "600", color: "var(--color-primary)" }}>
                  Age or Date of Birth <span style={{ color: "var(--color-danger)" }}>*</span>
                </span>

                <div
                  style={{
                    display: "inline-flex",
                    backgroundColor: "var(--color-surface)",
                    padding: "3px",
                    borderRadius: "var(--radius-control)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, isAgeMode: true });
                      setErrors({ ...errors, dob: "", age: "" });
                    }}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "calc(var(--radius-control) - 2px)",
                      fontSize: "12px",
                      fontWeight: formData.isAgeMode ? "600" : "500",
                      backgroundColor: formData.isAgeMode ? "var(--color-primary)" : "transparent",
                      color: formData.isAgeMode ? "#FFFFFF" : "var(--color-text-secondary)",
                      transition: "all var(--transition-fast)",
                      cursor: "pointer",
                    }}
                  >
                    Enter Age
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, isAgeMode: false });
                      setErrors({ ...errors, dob: "", age: "" });
                    }}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "calc(var(--radius-control) - 2px)",
                      fontSize: "12px",
                      fontWeight: !formData.isAgeMode ? "600" : "500",
                      backgroundColor: !formData.isAgeMode ? "var(--color-primary)" : "transparent",
                      color: !formData.isAgeMode ? "#FFFFFF" : "var(--color-text-secondary)",
                      transition: "all var(--transition-fast)",
                      cursor: "pointer",
                    }}
                  >
                    Enter Date of Birth
                  </button>
                </div>
              </div>

              {formData.isAgeMode ? (
                <Input
                  ref={ageRef}
                  type="number"
                  placeholder="e.g. 42"
                  value={formData.age}
                  onChange={(e) => {
                    setFormData({ ...formData, age: e.target.value });
                    if (errors.age) setErrors({ ...errors, age: "" });
                  }}
                  error={errors.age}
                  suffix="years"
                  helperText="Specify completed age in years"
                />
              ) : (
                <Input
                  ref={dobRef}
                  type="date"
                  value={formData.dob}
                  onChange={(e) => {
                    setFormData({ ...formData, dob: e.target.value });
                    if (errors.dob) setErrors({ ...errors, dob: "" });
                  }}
                  error={errors.dob}
                  helperText="Select patient's exact date of birth"
                />
              )}
            </div>

            <Textarea
              label="Residential Address"
              placeholder="Door / Apartment no., Street, Area, Springfield"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              helperText="Optional address for medical records"
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "16px",
                paddingTop: "16px",
                borderTop: "1px solid var(--color-border)",
              }}
            >
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                loading={submitting}
                icon={Check}
              >
                {isEditMode ? "Save Changes" : "Register Patient"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
