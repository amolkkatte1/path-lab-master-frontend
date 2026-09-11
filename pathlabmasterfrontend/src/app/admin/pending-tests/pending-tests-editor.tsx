"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiCheck, FiPrinter, FiSave, FiX } from "react-icons/fi";
import { saveReport } from "@/app/actions";

export type PendingParameter = {
  parameterName: string;
  value: string;
  sequence: number;
  dataType: string;
  unit: string;
  formula: string;
  upperRange: number | null;
  lowerRange: number | null;
  isBold: boolean;
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

export function PendingTestsEditor({
  tests,
  reportData,
  currentUserId,
}: Readonly<{
  tests: PendingTestGroup[];
  reportData: ReportData;
  currentUserId: string;
}>) {
  const [activeTest, setActiveTest] = useState<PendingTestGroup | null>(null);
  // track bold state for the active test's parameters
  const [boldMap, setBoldMap] = useState<Record<number, boolean>>({});
  const [submitting, setSubmitting] = useState<SaveAction | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  // ref map: sequence → input element
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const router = useRouter();

  function openTest(test: PendingTestGroup) {
    // seed bold state from current parameters
    const seed: Record<number, boolean> = {};
    for (const p of test.parameters) seed[p.sequence] = p.isBold;
    setBoldMap(seed);
    setApiError(null);
    inputRefs.current = {};
    setActiveTest(test);
  }

  function updateBold(sequence: number, isBold: boolean) {
    setBoldMap((prev) => ({ ...prev, [sequence]: isBold }));
  }

  /** Collect current input values + bold states into a parameter array */
  function collectParameters(): PendingParameter[] {
    if (!activeTest) return [];
    return activeTest.parameters.map((p) => ({
      ...p,
      value: inputRefs.current[p.sequence]?.value ?? p.value,
      isBold: boldMap[p.sequence] ?? p.isBold,
    }));
  }

  async function handleSubmit(action: SaveAction) {
    if (!activeTest) return;
    setSubmitting(action);
    setApiError(null);

    const updatedParameters = collectParameters();

    // Move this test from pendingTest → completedTest
    const newPending = { ...reportData.pendingTest };
    delete newPending[activeTest.key];

    const newCompleted = {
      ...reportData.completedTest,
      [activeTest.key]: updatedParameters,
    };

    // Update status flags for this test only
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

      // For approve_print, trigger browser print before closing
      if (action === "approve_print") {
        window.print();
      }

      // Close dialog and refresh the page data
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
                .map((parameter, index) => {
                  const isBold = boldMap[parameter.sequence] ?? parameter.isBold;
                  return (
                    <div
                      key={`${parameter.sequence}-${index}`}
                      className={`pending-test-parameter grid gap-3 rounded-xl border p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_180px_auto] sm:items-center ${isBold ? "font-semibold" : ""}`}
                    >
                      <span className={isBold ? "font-semibold" : "text-sm"}>
                        {parameter.parameterName || parameter.value || " "}
                      </span>
                      <input
                        ref={(el) => {
                          inputRefs.current[parameter.sequence] = el;
                        }}
                        defaultValue={parameter.value}
                        type={
                          parameter.dataType.toLowerCase() === "number"
                            ? "number"
                            : "text"
                        }
                        min={parameter.lowerRange ?? undefined}
                        max={parameter.upperRange ?? undefined}
                        className="pending-test-parameter-input w-full rounded-lg border px-3 py-2.5 outline-none"
                      />
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
                onClick={() => handleSubmit("approve_print")}
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
    </>
  );
}
