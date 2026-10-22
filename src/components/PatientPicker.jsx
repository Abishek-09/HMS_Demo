import React, { useState, useEffect } from "react";
import { User, UserPlus, Check, Search, Phone, MapPin, Calendar } from "lucide-react";
import { getPatients, createPatient } from "../services/patients";
import Button from "./Button";
import Input from "./Input";
import Select from "./Select";
import Textarea from "./Textarea";
import Modal from "./Modal";
import { validatePatient } from "../utils/validate";
import { useData } from "../context/DataContext";

export default function PatientPicker({ selectedPatient, onSelectPatient }) {
  const { showToast } = useData();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // New patient form state
  const [newPatient, setNewPatient] = useState({
    name: "",
    phone: "",
    gender: "Male",
    isAgeMode: true,
    age: "",
    dob: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPatients();
  }, [search]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const data = await getPatients(search);
      setPatients(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterInline = async (e) => {
    e.preventDefault();
    const valErrors = validatePatient(newPatient, newPatient.isAgeMode);
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      return;
    }

    setSubmitting(true);
    try {
      const created = await createPatient({
        name: newPatient.name,
        phone: newPatient.phone,
        gender: newPatient.gender,
        age: newPatient.isAgeMode ? newPatient.age : null,
        dob: !newPatient.isAgeMode ? newPatient.dob : null,
        address: newPatient.address,
      });

      showToast(`Patient registered: ${created.name} (${created.id})`);
      setIsRegisterModalOpen(false);
      onSelectPatient(created);
      // Reset form
      setNewPatient({
        name: "",
        phone: "",
        gender: "Male",
        isAgeMode: true,
        age: "",
        dob: "",
        address: "",
      });
      setErrors({});
      loadPatients();
    } catch (err) {
      console.error(err);
      showToast("Failed to register patient", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* If a patient is selected, show compact summary card */}
      {selectedPatient ? (
        <div
          style={{
            backgroundColor: "var(--color-primary-tint)",
            border: "1px solid rgba(44, 87, 69, 0.2)",
            borderRadius: "var(--radius-lg)",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--color-primary)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "600",
                fontSize: "16px",
              }}
            >
              {selectedPatient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h4
                  style={{
                    fontSize: "var(--font-size-base)",
                    fontWeight: "700",
                    color: "var(--color-primary)",
                    margin: 0,
                  }}
                >
                  {selectedPatient.name}
                </h4>
                <span
                  style={{
                    fontSize: "var(--font-size-xs)",
                    fontWeight: "600",
                    color: "var(--color-primary)",
                    backgroundColor: "#FFFFFF",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid rgba(44, 87, 69, 0.2)",
                  }}
                >
                  {selectedPatient.id}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  fontSize: "var(--font-size-xs)",
                  color: "var(--color-text-muted)",
                  marginTop: "4px",
                }}
              >
                <span>
                  <strong>Gender:</strong> {selectedPatient.gender}
                </span>
                <span>
                  <strong>Age:</strong> {selectedPatient.age || "—"} yrs
                </span>
                <span>
                  <strong>Phone:</strong> {selectedPatient.phone}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectPatient(null)}
          >
            Change Patient
          </Button>
        </div>
      ) : (
        /* Patient search and selection */
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "var(--font-size-base)",
                  fontWeight: "600",
                  color: "var(--color-primary)",
                  margin: 0,
                }}
              >
                Select Patient
              </h3>
              <p
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--color-text-muted)",
                  margin: "2px 0 0",
                }}
              >
                Search existing records or register a new patient inline
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={UserPlus}
              onClick={() => setIsRegisterModalOpen(true)}
            >
              + Register New Patient
            </Button>
          </div>

          <div style={{ position: "relative", marginBottom: "16px" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "12px",
                color: "var(--color-text-muted)",
              }}
            />
            <input
              type="text"
              placeholder="Search by patient name, phone number, or PT-ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                height: "40px",
                padding: "8px 12px 8px 36px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                fontSize: "var(--font-size-sm)",
                outline: "none",
              }}
            />
          </div>

          {/* Quick results list */}
          <div
            style={{
              maxHeight: "220px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {loading ? (
              <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", textAlign: "center" }}>
                Searching patients...
              </p>
            ) : patients.length === 0 ? (
              <div
                style={{
                  padding: "24px",
                  textAlign: "center",
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-muted)",
                }}
              >
                No matching patients found.
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(true)}
                  style={{
                    color: "var(--color-primary)",
                    fontWeight: "600",
                    marginLeft: "6px",
                    textDecoration: "underline",
                  }}
                >
                  Register new patient
                </button>
              </div>
            ) : (
              patients.slice(0, 6).map((pat) => (
                <div
                  key={pat.id}
                  onClick={() => onSelectPatient(pat)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    cursor: "pointer",
                    transition: "all var(--transition-fast)",
                    backgroundColor: "var(--color-surface)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-primary-tint)";
                    e.currentTarget.style.borderColor = "var(--color-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-surface)";
                    e.currentTarget.style.borderColor = "var(--color-border)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "var(--radius-full)",
                        backgroundColor: "var(--color-primary)",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "600",
                        fontSize: "13px",
                      }}
                    >
                      {pat.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "var(--font-size-sm)", color: "var(--color-text)" }}>
                        {pat.name}{" "}
                        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", fontWeight: "normal" }}>
                          ({pat.id})
                        </span>
                      </div>
                      <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                        {pat.gender} • {pat.age || "—"} yrs • {pat.phone}
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm">
                    Select
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Inline Registration Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register New Patient"
        maxWidth="500px"
      >
        <form onSubmit={handleRegisterInline}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Input
              label="Full Name"
              required
              placeholder="e.g. Anand Varma"
              value={newPatient.name}
              onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
              error={errors.name}
            />

            <Input
              label="Phone Number"
              required
              placeholder="e.g. +91 98765 43210"
              value={newPatient.phone}
              onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
              error={errors.phone}
              helperText="10–15 digits"
            />

            <Select
              label="Gender"
              required
              value={newPatient.gender}
              onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
              options={[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Other", label: "Other" },
              ]}
              error={errors.gender}
            />

            {/* Age / DOB toggle */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                }}
              >
                <label style={{ fontSize: "var(--font-size-sm)", fontWeight: "500", color: "var(--color-text)" }}>
                  Age / Date of Birth <span style={{ color: "var(--color-danger)" }}>*</span>
                </label>
                <div style={{ display: "flex", gap: "8px", fontSize: "var(--font-size-xs)" }}>
                  <button
                    type="button"
                    onClick={() => setNewPatient({ ...newPatient, isAgeMode: true })}
                    style={{
                      fontWeight: newPatient.isAgeMode ? "700" : "400",
                      color: newPatient.isAgeMode ? "var(--color-primary)" : "var(--color-text-muted)",
                      textDecoration: newPatient.isAgeMode ? "underline" : "none",
                    }}
                  >
                    Enter Age
                  </button>
                  <span style={{ color: "var(--color-border)" }}>|</span>
                  <button
                    type="button"
                    onClick={() => setNewPatient({ ...newPatient, isAgeMode: false })}
                    style={{
                      fontWeight: !newPatient.isAgeMode ? "700" : "400",
                      color: !newPatient.isAgeMode ? "var(--color-primary)" : "var(--color-text-muted)",
                      textDecoration: !newPatient.isAgeMode ? "underline" : "none",
                    }}
                  >
                    Enter Date of Birth
                  </button>
                </div>
              </div>

              {newPatient.isAgeMode ? (
                <Input
                  type="number"
                  placeholder="e.g. 35"
                  value={newPatient.age}
                  onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                  error={errors.age}
                  suffix="years"
                />
              ) : (
                <Input
                  type="date"
                  value={newPatient.dob}
                  onChange={(e) => setNewPatient({ ...newPatient, dob: e.target.value })}
                  error={errors.dob}
                />
              )}
            </div>

            <Textarea
              label="Address (Optional)"
              placeholder="Residential address / sector"
              value={newPatient.address}
              onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
              rows={2}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            <Button
              variant="outline"
              onClick={() => setIsRegisterModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Save & Select Patient
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
