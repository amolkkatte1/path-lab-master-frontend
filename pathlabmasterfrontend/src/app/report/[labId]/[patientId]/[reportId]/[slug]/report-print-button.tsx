"use client";

import { FiDownload } from "react-icons/fi";

export default function ReportPrintButton({ patientName }: { patientName: string }) {
  function handlePrint() {
    // Set a meaningful document title so "Save as PDF" uses it as the filename
    document.title = `Report - ${patientName}`;
    window.print();
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      aria-label="Save as PDF / Print"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: "50px",
        padding: "12px 20px",
        fontSize: "14px",
        fontWeight: 600,
        fontFamily: "Arial, sans-serif",
        cursor: "pointer",
        boxShadow: "0 4px 14px rgba(37,99,235,0.45)",
      }}
    >
      <FiDownload size={16} />
      Save PDF
    </button>
  );
}
