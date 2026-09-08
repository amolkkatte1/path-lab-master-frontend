"use client";

import { useState } from "react";
import { FiEdit2, FiX } from "react-icons/fi";

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

type PendingTestGroup = {
  key: string;
  code: string;
  name: string;
  category: string;
  parameters: PendingParameter[];
};

export function PendingTestsEditor({
  tests,
}: Readonly<{ tests: PendingTestGroup[] }>) {
  const [activeTest, setActiveTest] = useState<PendingTestGroup | null>(null);

  return (
    <>
      <div className="pending-tests-table-scroll overflow-x-auto">
        <table className="pending-tests-table w-full min-w-[620px] text-left text-sm">
          <thead className="pending-tests-table-head text-slate-400">
            <tr className="text-xs uppercase tracking-[0.16em]">
              <th className="px-5 py-3 font-semibold">Test name</th>
              <th className="px-5 py-3 font-semibold">Category</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {tests.map((test) => (
              <tr key={test.key} className="pending-tests-table-row transition hover:bg-white/5">
                <td className="px-5 py-4">
                  <p className="font-semibold text-white">{test.name} ({test.code})</p>
                </td>
                <td className="px-5 py-4 text-slate-300">{test.category || "-"}</td>
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => setActiveTest(test)}
                    aria-label={`Edit ${test.name}`}
                    title={`Edit ${test.name}`}
                    className="inline-flex rounded-lg border border-white/10 p-2 text-emerald-300 transition hover:bg-emerald-400/10 hover:text-emerald-200"
                  >
                    <FiEdit2 />
                  </button>
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
          aria-label={`Edit ${activeTest.code} ${activeTest.name}`}
        >
          <div className="pending-test-dialog max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border shadow-2xl">
            <div className="pending-test-dialog-header sticky top-0 z-10 flex items-center justify-between border-b px-5 py-4 backdrop-blur">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  Result entry
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h2 className="text-xl font-semibold text-white">
                    {activeTest.code} ({activeTest.name})
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
            <div className="space-y-3 p-5">
              {[...activeTest.parameters]
                .sort((left, right) => left.sequence - right.sequence)
                .filter(
                  (parameter) => parameter.sequence !== 1 && parameter.sequence !== 2,
                )
                .map((parameter, index) => (
                    <label
                      key={`${parameter.sequence}-${index}`}
                      className={`pending-test-parameter grid gap-2 rounded-xl border p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_180px] sm:items-center ${parameter.isBold ? "font-semibold" : ""}`}
                    >
                      <span
                        className={parameter.isBold ? "font-semibold" : "text-sm"}
                      >
                        {parameter.parameterName || parameter.value || " "}
                      </span>
                      <input
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
                    </label>
                ))}
            </div>
            <div className="pending-test-dialog-footer flex justify-end border-t px-5 py-4">
              <button
                type="button"
                onClick={() => setActiveTest(null)}
                className="pending-test-dialog-close-button rounded-xl border px-4 py-2.5 text-sm font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
