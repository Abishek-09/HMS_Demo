import React from "react";
import { Printer, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import "../styles/print.css";

export default function PrintLayout({ title, backTo, children }) {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="print-screen-wrapper">
      {/* Top action bar hidden during print */}
      <div className="print-actions-bar no-print">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button variant="outline" size="sm" icon={ArrowLeft} onClick={handleBack}>
            Back
          </Button>
          <span style={{ fontSize: "var(--font-size-sm)", fontWeight: "600", color: "var(--color-primary)" }}>
            {title}
          </span>
        </div>

        <Button variant="primary" size="sm" icon={Printer} onClick={handlePrint}>
          Print Document (A4)
        </Button>
      </div>

      {/* Printable Sheet */}
      <div className="print-sheet page-break-avoid">{children}</div>
    </div>
  );
}
