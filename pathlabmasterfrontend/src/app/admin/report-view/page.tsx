"use client";

import { useEffect } from "react";

export default function ReportViewPage() {
  useEffect(() => {
    const html = sessionStorage.getItem("pendingReportHtml");
    if (!html) return;

    // Replace the entire document with the report HTML so the page
    // has a real URL (shareable, saveable as PDF) instead of about:blank
    document.open();
    document.write(html);
    document.close();
  }, []);

  // Shown briefly before the document is replaced
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "Arial, sans-serif", color: "#64748b" }}>
      Loading report…
    </div>
  );
}
