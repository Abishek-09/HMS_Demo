import React from "react";
import { Check } from "lucide-react";

export default function StepIndicator({
  currentStep = 1,
  steps = ["Consultation", "Prescription", "Billing"],
  onStepClick = null,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        width: "100%",
        padding: "16px 0",
      }}
    >
      {steps.map((label, idx) => {
        const stepNumber = idx + 1;
        const isCurrent = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;
        const isUpcoming = currentStep < stepNumber;

        return (
          <React.Fragment key={label}>
            {/* Step node */}
            <div
              onClick={() => {
                if (isCompleted && onStepClick) {
                  onStepClick(stepNumber);
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: isCompleted && onStepClick ? "pointer" : "default",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "var(--radius-chip)",
                  backgroundColor: isCompleted
                    ? "var(--color-primary)"
                    : isCurrent
                    ? "var(--color-primary)"
                    : "var(--color-border)",
                  color: isCompleted || isCurrent ? "#FFFFFF" : "var(--color-text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "600",
                  transition: "all var(--transition-fast)",
                  boxShadow: isCurrent ? "0 0 0 3px var(--color-primary-tint)" : "none",
                }}
              >
                {isCompleted ? <Check size={14} strokeWidth={2.5} /> : stepNumber}
              </div>

              <span
                style={{
                  fontSize: "14px",
                  fontWeight: isCurrent ? "600" : "500",
                  lineHeight: "20px",
                  color: isCurrent ? "var(--color-primary)" : isCompleted ? "var(--color-text)" : "var(--color-text-secondary)",
                }}
              >
                {label}
              </span>
            </div>

            {/* Connecting line */}
            {idx < steps.length - 1 && (
              <div
                style={{
                  width: "48px",
                  height: "2px",
                  backgroundColor: isCompleted ? "var(--color-primary)" : "var(--color-border)",
                  transition: "background-color var(--transition-fast)",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
