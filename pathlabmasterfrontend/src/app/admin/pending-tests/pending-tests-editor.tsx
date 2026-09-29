"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiCheck, FiPrinter, FiSave, FiX } from "react-icons/fi";
import { saveReport } from "@/app/actions";
import { getGenerateReportPdfUrl } from "@/lib/api";
import { buildPrintHtml } from "./report-print-view";

export type PendingParameter = {
  parameterName: string;
  value: string | null;
  sequence: number;
  dataType: string;
  unit: string | null;
  formula: string | null;
  upperRange: number | null;
  lowerRange: number | null;
  isBold: boolean | null;
  isNameBold: boolean | null;
  isDescriptionParameter: boolean | null;
  isValueRequired: boolean | null;
  isValueDiscription: boolean | null;
  parameterRange: string | null;
};

export type TestStatus = {
  isSaved: boolean;
  isApproved: boolean;
  isPrinted: boolean;
};

export type ReportData = {
  reportId: string;
  patientId: string;
  labId: string;
  pendingTest: Record<string, PendingParameter[]>;
  completedTest: Record<string, PendingParameter[]>;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  status: Record<string, TestStatus>;
};

export type PatientInfo = {
  patientName?: string;
  gender?: string;
  age?: string;
  doctorName?: string;
  mobileNumber?: string;
  createdAt?: string;
};

type PendingTestGroup = {
  key: string;
  code: string;
  category: string;
  parameters: PendingParameter[];
};

type SaveAction = "save" | "approve" | "approve_print";

function buildStatusFlags(action: SaveAction): TestStatus {
  return {
    isSaved: true,
    isApproved: action === "approve" || action === "approve_print",
    isPrinted: action === "approve_print",
  };
}

/**
 * Evaluates a formula string by substituting parameter names (from nameToValue map)
 * with their numeric values, then computing the arithmetic result.
 * Returns the result rounded to 2 decimal places, or "" on error.
 */
function evaluateFormula(formula: string, nameToValue: Map<string, string>): string {
  if (!formula.trim()) return "";

  // Sort names longest-first to avoid partial replacements
  // e.g. "PACKED CELL VOLUME (PCV)" before "PCV"
  const sortedNames = [...nameToValue.keys()].sort((a, b) => b.length - a.length);

  let expr = formula;
  for (const name of sortedNames) {
    const val = nameToValue.get(name) ?? "";
    const num = parseFloat(val);
    if (!Number.isNaN(num)) {
      // Escape special regex chars in parameter name, then replace all occurrences
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      expr = expr.replace(new RegExp(escaped, "g"), String(num));
    }
  }

  // Only allow safe arithmetic characters
  if (!/^[\d\s+\-*/().]+$/.test(expr)) return "";

  try {
    // eslint-disable-next-line no-new-func
    const result = new Function(`"use strict"; return (${expr});`)() as number;
    if (!isFinite(result) || isNaN(result)) return "";
    return String(Math.round(result * 100) / 100);
  } catch {
    return "";
  }
}

/**
 * Given a sorted list of parameters and a map of sequence→currentValue,
 * computes values for all formula-based parameters.
 * Returns a sequence→computed value map.
 */
function computeFormulaValues(
  parameters: PendingParameter[],
  currentValues: Map<number, string>,
  formulaOverrides: Record<number, string> = {},
): Map<number, string> {
  const sorted = [...parameters].sort((a, b) => a.sequence - b.sequence);
  // Build name→value as we process in order (so earlier values feed later formulas)
  const nameToValue = new Map<string, string>();
  const result = new Map<number, string>();

  for (const p of sorted) {
    const currentVal = currentValues.get(p.sequence) ?? p.value ?? "";

    if (p.formula && p.formula.trim()) {
      const computed = formulaOverrides[p.sequence] ?? evaluateFormula(p.formula, nameToValue);
      result.set(p.sequence, computed);
      // Use computed value for downstream formulas
      nameToValue.set(p.parameterName, computed);
    } else {
      // Use the current input value for downstream formulas
      nameToValue.set(p.parameterName, currentVal);
    }
  }

  return result;
}

function openPrintWindow(html: string | string[]) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const singleHtml = Array.isArray(html) ? html[0] : html;

  if (isIOS) {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.open();
    win.document.write(singleHtml);
    win.document.close();
    const tryPrint = () => { try { win.focus(); win.print(); } catch { /* ignore */ } };
    if (win.document.readyState === "complete") tryPrint();
    else { win.onload = tryPrint; setTimeout(tryPrint, 800); }
    return;
  }

  // Desktop + Android: hidden iframe
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;border:0;opacity:0;";
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
  if (!doc) { document.body.removeChild(iframe); return; }
  doc.open();
  doc.write(singleHtml);
  doc.close();
  const printAndClean = () => {
    try { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); }
    finally { setTimeout(() => document.body.removeChild(iframe), 1000); }
  };
  if (iframe.contentDocument?.readyState === "complete") printAndClean();
  else { iframe.onload = printAndClean; setTimeout(printAndClean, 800); }
}

export function PendingTestsEditor({
  tests,
  reportData,
  currentUserId,
  labName,
  patientInfo,
  reportTopSpace,
  reportBottomSpace,
}: Readonly<{
  tests: PendingTestGroup[];
  reportData: ReportData;
  currentUserId: string;
  labName: string;
  patientInfo: PatientInfo;
  reportTopSpace: number;
  reportBottomSpace: number;
}>) {
  const [activeTest, setActiveTest] = useState<PendingTestGroup | null>(null);
  const [boldMap, setBoldMap] = useState<Record<number, boolean>>({});
  const [oorMap, setOorMap] = useState<Record<number, boolean>>({});
  const [formulaValueMap, setFormulaValueMap] = useState<Map<number, string>>(new Map());
  const [formulaOverrides, setFormulaOverrides] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState<SaveAction | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [includeHeader, setIncludeHeader] = useState(false);
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const router = useRouter();

  function checkOor(value: string, lower: number | null, upper: number | null): boolean {
    const num = parseFloat(value);
    if (Number.isNaN(num)) return false;
    const lo = lower !== null && lower !== ("" as unknown) ? Number(lower) : null;
    const hi = upper !== null && upper !== ("" as unknown) ? Number(upper) : null;
    if (lo !== null && !Number.isNaN(lo) && num < lo) return true;
    if (hi !== null && !Number.isNaN(hi) && num > hi) return true;
    return false;
  }

  function openTest(test: PendingTestGroup) {
    const boldSeed: Record<number, boolean> = {};
    const oorSeed: Record<number, boolean> = {};
    // Seed current values map from existing parameter values
    const currentValues = new Map<number, string>();
    for (const p of test.parameters) {
      boldSeed[p.sequence] = p.isBold ?? false;
      const val = p.value ?? "";
      currentValues.set(p.sequence, val);
      oorSeed[p.sequence] = checkOor(val, p.lowerRange, p.upperRange);
    }
    const formulaSeed = computeFormulaValues(test.parameters, currentValues);
    // Re-check OOR for formula-computed values
    for (const p of test.parameters) {
      if (p.formula?.trim() && formulaSeed.has(p.sequence)) {
        const computed = formulaSeed.get(p.sequence) ?? "";
        oorSeed[p.sequence] = checkOor(computed, p.lowerRange, p.upperRange);
      }
    }
    setBoldMap(boldSeed);
    setOorMap(oorSeed);
    setFormulaValueMap(formulaSeed);
    setFormulaOverrides({});
    setApiError(null);
    setShowPrintOptions(false);
    setIncludeHeader(false);
    inputRefs.current = {};
    setActiveTest(test);
  }

  function updateBold(sequence: number, isBold: boolean) {
    setBoldMap((prev) => ({ ...prev, [sequence]: isBold }));
  }

  function recalculateFormulas(
    changedSequence: number,
    newValue: string,
    formulaOverridesOverride?: Record<number, string>,
  ) {
    if (!activeTest) return;
    // Build current values: inputRefs for non-formula params, override with the change
    const currentValues = new Map<number, string>();
    for (const p of activeTest.parameters) {
      if (p.formula?.trim()) continue; // formula params get their value computed
      const inputVal = inputRefs.current[p.sequence]?.value ?? p.value ?? "";
      currentValues.set(p.sequence, p.sequence === changedSequence ? newValue : inputVal);
    }
    const newFormulaMap = computeFormulaValues(
      activeTest.parameters,
      currentValues,
      formulaOverridesOverride ?? formulaOverrides,
    );
    setFormulaValueMap(newFormulaMap);
    // Update OOR for formula params
    setOorMap((prev) => {
      const next = { ...prev };
      for (const p of activeTest.parameters) {
        if (p.formula?.trim() && newFormulaMap.has(p.sequence)) {
          next[p.sequence] = checkOor(newFormulaMap.get(p.sequence) ?? "", p.lowerRange, p.upperRange);
        }
      }
      return next;
    });
  }

  function collectParameters(): PendingParameter[] {
    if (!activeTest) return [];
    // Build final value map: user inputs first, then re-run formula computation
    const currentValues = new Map<number, string>();
    for (const p of activeTest.parameters) {
      if (!p.formula?.trim()) {
        currentValues.set(
          p.sequence,
          p.isDescriptionParameter
            ? (p.value ?? "")
            : (inputRefs.current[p.sequence]?.value ?? p.value ?? ""),
        );
      }
    }
    const finalFormulaMap = computeFormulaValues(activeTest.parameters, currentValues, formulaOverrides);

    return activeTest.parameters.map((p) => ({
      ...p,
      value: p.formula?.trim()
        ? (finalFormulaMap.get(p.sequence) ?? p.value ?? "")
        : p.isDescriptionParameter
          ? (p.value ?? "")
          : (inputRefs.current[p.sequence]?.value ?? p.value ?? ""),
      isBold: boldMap[p.sequence] ?? p.isBold ?? false,
    }));
  }

  async function handleSubmit(action: SaveAction) {
    if (!activeTest) return;
    setSubmitting(action);
    setApiError(null);

    const updatedParameters = collectParameters();

    const newPending = { ...reportData.pendingTest };
    delete newPending[activeTest.key];

    const newCompleted = {
      ...reportData.completedTest,
      [activeTest.key]: updatedParameters,
    };

    const newStatus = {
      ...reportData.status,
      [activeTest.key]: buildStatusFlags(action),
    };

    try {
      const now = new Date()
        .toISOString()
        .replace("T", " ")
        .replace(/\.\d+Z$/, "");

      const result = await saveReport({
        reportId: reportData.reportId,
        patientId: reportData.patientId,
        labId: reportData.labId,
        pendingTest: newPending,
        completedTest: newCompleted,
        createdBy: reportData.createdBy,
        updatedBy: currentUserId,
        createdAt: reportData.createdAt,
        updatedAt: now,
        status: newStatus,
      });

      if (!result.ok) {
        setApiError(result.error);
        return;
      }

      if (action === "approve_print") {
        // Extract test ID from the key (e.g. "HAEMOGRAM ON CELL COUNTER_20260901184545955" → "20260901184545955")
        const testId = activeTest.key.replace(/^.*_(\d+)$/, "$1");
        const url = getGenerateReportPdfUrl(reportData.patientId, [testId], includeHeader);
        window.open(url, "_blank");
      }

      setActiveTest(null);
      router.refresh();
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <>
      <div className="pending-tests-table-scroll overflow-x-auto">
        <table className="pending-tests-table w-full min-w-[520px] text-left text-sm">
          <thead className="pending-tests-table-head text-slate-400">
            <tr className="text-xs uppercase tracking-[0.16em]">
              <th className="px-5 py-3 font-semibold">Test name</th>
              <th className="px-5 py-3 font-semibold">Category</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {tests.map((test) => (
              <tr
                key={test.key}
                onClick={() => openTest(test)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openTest(test);
                  }
                }}
                tabIndex={0}
                className="pending-tests-table-row cursor-pointer transition hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-400/60"
              >
                <td className="px-5 py-5">
                  <p className="font-semibold text-white">{test.code}</p>
                </td>
                <td className="px-5 py-4 text-slate-300">
                  {test.category || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeTest && (
        <dialog
          open
          className="fixed inset-0 z-50 m-0 flex h-full w-full items-center justify-center border-0 bg-slate-950/75 p-4 backdrop-blur-sm"
          aria-label={`Edit ${activeTest.code}`}
        >
          <div className="pending-test-dialog max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border shadow-2xl">
            {/* Header */}
            <div className="pending-test-dialog-header sticky top-0 z-10 flex items-center justify-between border-b px-5 py-4 backdrop-blur">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  Result entry
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h2 className="text-xl font-semibold text-white">
                    {activeTest.code}
                  </h2>
                  {activeTest.category && (
                    <span className="text-sm text-emerald-300">
                      Category: {activeTest.category}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTest(null)}
                aria-label="Close parameter form"
                title="Close"
                className="pending-test-dialog-close rounded-full border p-2 transition"
              >
                <FiX />
              </button>
            </div>

            {/* Parameters */}
            <div className="space-y-3 p-5">
              {apiError && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                  <FiX className="shrink-0" />
                  {apiError}
                </div>
              )}

              {[...activeTest.parameters]
                .sort((a, b) => a.sequence - b.sequence)
                .filter((p) => p.sequence !== 1 && p.sequence !== 2)
                .filter((p) => !p.isDescriptionParameter)
                .map((parameter, index) => {
                  const isBold = boldMap[parameter.sequence] ?? parameter.isBold ?? false;
                  const nameBold = parameter.isNameBold ?? false;
                  const valueRequired = parameter.isValueRequired !== false;
                  const isOor = oorMap[parameter.sequence] ?? false;
                  const isFormula = !!(parameter.formula?.trim());
                  const formulaValue = formulaValueMap.get(parameter.sequence) ?? "";

                  return (
                    <div
                      key={`${parameter.sequence}-${index}`}
                      className={`pending-test-parameter grid gap-3 rounded-xl border p-4 ${valueRequired ? "sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_180px_auto]" : ""} sm:items-center`}
                    >
                      <span className={`text-sm${nameBold ? " font-semibold" : ""}`}>
                        {parameter.parameterName || parameter.value || " "}
                      </span>

                      {valueRequired && (
                        <>
                          {isFormula ? (
                            <div className="relative">
                              <input
                                ref={(el) => {
                                  inputRefs.current[parameter.sequence] = el;
                                }}
                                value={formulaOverrides[parameter.sequence] ?? formulaValue}
                                type={parameter.dataType?.toLowerCase() === "number" ? "number" : "text"}
                                min={parameter.lowerRange ?? undefined}
                                max={parameter.upperRange ?? undefined}
                                onChange={(event) => {
                                  const nextOverrides = { ...formulaOverrides, [parameter.sequence]: event.target.value };
                                  setFormulaOverrides(nextOverrides);
                                  recalculateFormulas(parameter.sequence, event.target.value, nextOverrides);
                                }}
                                className={`pending-test-parameter-input w-full rounded-lg border px-3 py-2.5 pr-14 outline-none${isBold ? " font-semibold" : ""}${isOor ? " is-out-of-range" : ""}`}
                                aria-label={`${parameter.parameterName} (auto-filled, editable)`}
                              />
                              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                                Auto
                              </span>
                            </div>
                          ) : (
                            <input
                              ref={(el) => {
                                inputRefs.current[parameter.sequence] = el;
                              }}
                              defaultValue={parameter.value ?? ""}
                              type={
                                parameter.dataType?.toLowerCase() === "number"
                                  ? "number"
                                  : "text"
                              }
                              min={parameter.lowerRange ?? undefined}
                              max={parameter.upperRange ?? undefined}
                              onChange={(e) => {
                                const oor = checkOor(e.target.value, parameter.lowerRange, parameter.upperRange);
                                setOorMap((prev) => ({ ...prev, [parameter.sequence]: oor }));
                                recalculateFormulas(parameter.sequence, e.target.value);
                              }}
                              className={`pending-test-parameter-input w-full rounded-lg border px-3 py-2.5 outline-none${isBold ? " font-semibold" : ""}${isOor ? " is-out-of-range" : ""}`}
                            />
                          )}
                          <span className="pending-test-parameter-meta text-xs">
                            {parameter.unit || ""}
                            {parameter.lowerRange !== null ||
                            parameter.upperRange !== null
                              ? ` ${parameter.lowerRange ?? ""}-${parameter.upperRange ?? ""}`
                              : ""}
                          </span>
                          <label
                            aria-label="Bold"
                            className="pending-test-bold-control flex items-center gap-2 text-s font-medium text-slate-400"
                          >
                            <input
                              type="checkbox"
                              checked={isBold}
                              onChange={(e) =>
                                updateBold(parameter.sequence, e.target.checked)
                              }
                              className="h-4 w-4 accent-emerald-500"
                            />
                          </label>
                        </>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Footer — action buttons */}
            <div className="pending-test-dialog-footer flex flex-wrap items-center justify-end gap-3 border-t px-5 py-4">
              <button
                type="button"
                onClick={() => setActiveTest(null)}
                disabled={submitting !== null}
                className="pending-test-dialog-close-button rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50"
              >
                Close
              </button>

              {/* Save */}
              <button
                type="button"
                onClick={() => handleSubmit("save")}
                disabled={submitting !== null}
                className="flex items-center gap-2 rounded-xl border border-slate-500/50 bg-slate-700/60 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
              >
                {submitting === "save" ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <FiSave className="shrink-0" />
                )}
                Save
              </button>

              {/* Approve */}
              <button
                type="button"
                onClick={() => handleSubmit("approve")}
                disabled={submitting !== null}
                className="flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-600/60 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
              >
                {submitting === "approve" ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <FiCheck className="shrink-0" />
                )}
                Approve
              </button>

              {/* Approve & Print */}
              <button
                type="button"
                onClick={() => { setShowPrintOptions(true); }}
                disabled={submitting !== null}
                className="flex items-center gap-2 rounded-xl border border-blue-500/50 bg-blue-600/60 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
              >
                {submitting === "approve_print" ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <FiPrinter className="shrink-0" />
                )}
                Approve &amp; Print
              </button>
            </div>

          </div>
        </dialog>
      )}

      {/* Print options popup */}
      {showPrintOptions && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Print options"
        >
          <div className="pending-test-dialog w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden">
            <div className="pending-test-dialog-header flex items-center justify-between border-b px-5 py-4 rounded-t-2xl">
              <h3 className="text-base font-semibold text-white">Print options</h3>
              <button
                type="button"
                onClick={() => setShowPrintOptions(false)}
                aria-label="Close print options"
                className="pending-test-dialog-close rounded-full border p-1.5 transition"
              >
                <FiX />
              </button>
            </div>

            <div className="px-5 py-5">
              <label className="flex cursor-pointer items-center gap-3 text-sm font-medium select-none">
                <input
                  type="checkbox"
                  checked={includeHeader}
                  onChange={(e) => setIncludeHeader(e.target.checked)}
                  className="h-4 w-4 accent-emerald-500"
                />
                Include Header
              </label>
            </div>

            <div className="pending-test-dialog-footer flex items-center justify-end gap-2 border-t px-5 py-4">
              <button
                type="button"
                onClick={() => setShowPrintOptions(false)}
                disabled={submitting !== null}
                className="pending-test-dialog-close-button rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { setShowPrintOptions(false); handleSubmit("approve_print"); }}
                disabled={submitting !== null}
                className="flex items-center gap-2 rounded-xl border border-blue-500/50 bg-blue-600/60 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
              >
                {submitting === "approve_print" ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <FiPrinter className="shrink-0" />
                )}
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
