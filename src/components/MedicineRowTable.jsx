import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Button from "./Button";
import { ConfirmModal } from "./Modal";

export default function MedicineRowTable({ medicines, onChange }) {
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const handleAddRow = () => {
    onChange([
      ...medicines,
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
  };

  const handleUpdateField = (index, field, value) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const requestDelete = (index) => {
    if (medicines.length === 1) {
      // Must confirm before removing the last row
      setDeleteIndex(index);
      setConfirmModalOpen(true);
    } else {
      const updated = medicines.filter((_, i) => i !== index);
      onChange(updated);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteIndex !== null) {
      const updated = medicines.filter((_, i) => i !== deleteIndex);
      onChange(updated);
      setDeleteIndex(null);
      setConfirmModalOpen(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "var(--font-size-sm)",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid var(--color-border)", textAlign: "left" }}>
              <th style={{ padding: "8px 6px", color: "var(--color-primary)", width: "30px" }}>#</th>
              <th style={{ padding: "8px 6px", color: "var(--color-primary)", minWidth: "160px" }}>
                Medicine Name <span style={{ color: "var(--color-danger)" }}>*</span>
              </th>
              <th style={{ padding: "8px 6px", color: "var(--color-primary)", minWidth: "90px" }}>Strength</th>
              <th style={{ padding: "8px 6px", color: "var(--color-primary)", minWidth: "100px" }}>
                Dosage <span style={{ color: "var(--color-danger)" }}>*</span>
              </th>
              <th style={{ padding: "8px 6px", color: "var(--color-primary)", minWidth: "120px" }}>
                Frequency <span style={{ color: "var(--color-danger)" }}>*</span>
              </th>
              <th style={{ padding: "8px 6px", color: "var(--color-primary)", minWidth: "100px" }}>
                Duration <span style={{ color: "var(--color-danger)" }}>*</span>
              </th>
              <th style={{ padding: "8px 6px", color: "var(--color-primary)", minWidth: "90px" }}>
                Qty <span style={{ color: "var(--color-danger)" }}>*</span>
              </th>
              <th style={{ padding: "8px 6px", color: "var(--color-primary)", minWidth: "140px" }}>Instructions</th>
              <th style={{ padding: "8px 6px", width: "40px" }}></th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((med, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td style={{ padding: "8px 6px", color: "var(--color-text-muted)", fontWeight: "600" }}>
                  {idx + 1}
                </td>
                <td style={{ padding: "8px 6px" }}>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paracetamol"
                    value={med.name}
                    onChange={(e) => handleUpdateField(idx, "name", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--color-border)",
                      fontSize: "var(--font-size-xs)",
                    }}
                  />
                </td>
                <td style={{ padding: "8px 6px" }}>
                  <input
                    type="text"
                    placeholder="e.g. 650mg"
                    value={med.strength}
                    onChange={(e) => handleUpdateField(idx, "strength", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--color-border)",
                      fontSize: "var(--font-size-xs)",
                    }}
                  />
                </td>
                <td style={{ padding: "8px 6px" }}>
                  <input
                    type="text"
                    required
                    placeholder="1-0-1"
                    value={med.dosage}
                    onChange={(e) => handleUpdateField(idx, "dosage", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--color-border)",
                      fontSize: "var(--font-size-xs)",
                    }}
                  />
                </td>
                <td style={{ padding: "8px 6px" }}>
                  <input
                    type="text"
                    required
                    placeholder="After food"
                    value={med.frequency}
                    onChange={(e) => handleUpdateField(idx, "frequency", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--color-border)",
                      fontSize: "var(--font-size-xs)",
                    }}
                  />
                </td>
                <td style={{ padding: "8px 6px" }}>
                  <input
                    type="text"
                    required
                    placeholder="5 days"
                    value={med.duration}
                    onChange={(e) => handleUpdateField(idx, "duration", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--color-border)",
                      fontSize: "var(--font-size-xs)",
                    }}
                  />
                </td>
                <td style={{ padding: "8px 6px" }}>
                  <input
                    type="text"
                    required
                    placeholder="10 tabs"
                    value={med.quantity}
                    onChange={(e) => handleUpdateField(idx, "quantity", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--color-border)",
                      fontSize: "var(--font-size-xs)",
                    }}
                  />
                </td>
                <td style={{ padding: "8px 6px" }}>
                  <input
                    type="text"
                    placeholder="With warm water"
                    value={med.instructions}
                    onChange={(e) => handleUpdateField(idx, "instructions", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--color-border)",
                      fontSize: "var(--font-size-xs)",
                    }}
                  />
                </td>
                <td style={{ padding: "8px 6px", textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={() => requestDelete(idx)}
                    aria-label={`Remove medicine row ${idx + 1}`}
                    style={{
                      color: "var(--color-danger)",
                      padding: "4px",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <Button variant="secondary" size="sm" icon={Plus} onClick={handleAddRow}>
          Add Medicine Row
        </Button>
      </div>

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Last Medicine Row"
        message="Are you sure you want to remove the only medicine row? You can re-add rows or choose 'Skip prescription' if no medication is required."
        confirmText="Remove Row"
        isDestructive
      />
    </div>
  );
}
