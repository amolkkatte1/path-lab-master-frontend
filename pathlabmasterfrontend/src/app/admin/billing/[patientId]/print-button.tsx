"use client";

import { FiPrinter } from "react-icons/fi";

export function PrintBillButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400"
    >
      <FiPrinter className="h-4 w-4" />
      Print bill
    </button>
  );
}
