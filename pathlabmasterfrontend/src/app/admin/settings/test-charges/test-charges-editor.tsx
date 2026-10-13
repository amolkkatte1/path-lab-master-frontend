"use client";

import { useMemo, useState } from "react";
import { FiCheck, FiLoader, FiSearch } from "react-icons/fi";

export type TestChargeTest = {
  testId: number | string;
  testName: string;
  parameterGroupList: string;
  parameterList: string;
  serviceId: number | string;
  serviceName: string;
  serviceShortName: string;
  serviceGroupId: number | string;
  labName: string;
  labId: number | string;
  serviceGroupName: string | null;
  testCharges: number | string;
  isImageUploadEnable: boolean;
  createdBy: number | string;
  updatedBy: number | string;
  createdAt: string;
  updatedAt: string;
};

type SaveAction = (
  updates: { testId: number | string; testCharges: number }[],
) => Promise<{ success: true } | { success: false; error: string }>;

type TestChargesEditorProps = {
  initialTests: TestChargeTest[];
  loadError: string | null;
  saveAction: SaveAction;
};

function chargeValue(test: TestChargeTest) {
  return typeof test.testCharges === "string"
    ? test.testCharges
    : String(test.testCharges);
}

function chargesMatch(current: string, original: string) {
  if (current.trim() === "" || original.trim() === "") {
    return current === original;
  }
  const currentNumber = Number(current);
  const originalNumber = Number(original);
  return Number.isFinite(currentNumber) && Number.isFinite(originalNumber)
    ? currentNumber === originalNumber
    : current === original;
}

export function TestChargesEditor({
  initialTests,
  loadError,
  saveAction,
}: TestChargesEditorProps) {
  const [tests, setTests] = useState(initialTests);
  const [originalCharges, setOriginalCharges] = useState(
    () => new Map(initialTests.map((test) => [String(test.testId), chargeValue(test)])),
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const changedTests = tests.filter((test, index) => {
    const originalCharge =
      originalCharges.get(String(test.testId)) ?? chargeValue(initialTests[index]);
    const currentCharge = chargeValue(test);
    return !chargesMatch(currentCharge, originalCharge);
  });
  const filteredTests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const indexedTests = tests.map((test, index) => ({ test, index }));
    if (!query) return indexedTests;

    return indexedTests.filter(({ test }) =>
      [String(test.testId), test.testName, test.serviceShortName]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [searchQuery, tests]);

  async function saveChanges() {
    if (saving || changedTests.length === 0) return;

    const invalidCharge = changedTests.some((test) => {
      const charge = Number(test.testCharges);
      return (
        chargeValue(test).trim() === "" ||
        !Number.isFinite(charge) ||
        charge < 0
      );
    });

    if (invalidCharge) {
      setSaveError("Enter a valid charge of zero or more for each edited test.");
      setSaved(false);
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaved(false);

    try {
      const result = await saveAction(
        changedTests.map((test) => ({
          testId: test.testId,
          testCharges: Number(test.testCharges),
        })),
      );

      if (!result.success) {
        setSaveError(result.error);
        return;
      }

      const savedCharges = new Map(
        changedTests.map((test) => [String(test.testId), Number(test.testCharges)]),
      );
      setOriginalCharges((currentCharges) => {
        const nextCharges = new Map(currentCharges);
        savedCharges.forEach((charge, testId) => nextCharges.set(testId, String(charge)));
        return nextCharges;
      });
      setTests((currentTests) =>
        currentTests.map((test) => ({
          ...test,
          testCharges: savedCharges.get(String(test.testId)) ?? test.testCharges,
        })),
      );
      setSaved(true);
    } catch {
      setSaveError("Unable to save test charges. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-white/10 bg-white/10 px-5 py-4 backdrop-blur sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
            Settings
          </p>
          <h1 className="mt-1 text-xl font-semibold text-white">Test Charges</h1>
        </div>
        <button
          type="button"
          onClick={saveChanges}
          disabled={saving || changedTests.length === 0 || Boolean(loadError)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? <FiLoader className="animate-spin" /> : <FiCheck />}
          {saving ? "Saving..." : "Save all"}
        </button>
      </header>

      {loadError && (
        <p
          role="alert"
          className="rounded-xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-100"
        >
          {loadError}
        </p>
      )}
      {saveError && (
        <p
          role="alert"
          className="rounded-xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-100"
        >
          {saveError}
        </p>
      )}
      {saved && (
        <p
          role="status"
          className="rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100"
        >
          Test charges saved successfully.
        </p>
      )}

      <label className="patient-filter-input flex items-center gap-3 rounded-xl border px-4 py-3">
        <FiSearch aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by test name, code, or ID"
          aria-label="Search tests by name, code, or ID"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </label>

      <div className="test-charges-table overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full table-fixed text-left text-xs sm:text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-slate-300">
            <tr>
              <th scope="col" className="break-words px-2 py-3 sm:px-5 sm:py-4">
                Test ID
              </th>
              <th scope="col" className="break-words px-2 py-3 sm:px-5 sm:py-4">
                Test name
              </th>
              <th scope="col" className="break-words px-2 py-3 sm:px-5 sm:py-4">
                Code
              </th>
              <th scope="col" className="w-28 break-words px-2 py-3 sm:w-48 sm:px-5 sm:py-4">
                Charges
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredTests.map(({ test, index }) => (
              <tr key={String(test.testId)} className="text-slate-100">
                <td className="break-words px-2 py-3 text-slate-300 sm:px-5 sm:py-4">
                  {test.testId}
                </td>
                <td className="break-words px-2 py-3 font-medium sm:px-5 sm:py-4">
                  {test.testName}
                </td>
                <td className="break-words px-2 py-3 sm:px-5 sm:py-4">
                  {test.serviceShortName || "—"}
                </td>
                <td className="px-2 py-3 sm:px-5 sm:py-3">
                  <label className="sr-only" htmlFor={`charge-${test.testId}`}>
                    Charges for {test.testName}
                  </label>
                  <input
                    id={`charge-${test.testId}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={chargeValue(test)}
                    onChange={(event) => {
                      const value = event.target.value;
                      setTests((currentTests) =>
                        currentTests.map((currentTest, currentIndex) =>
                          currentIndex === index
                            ? { ...currentTest, testCharges: value }
                            : currentTest,
                        ),
                      );
                      setSaveError(null);
                      setSaved(false);
                    }}
                    disabled={saving || Boolean(loadError)}
                    className="test-charges-input w-full min-w-0 rounded-lg border px-2 py-2 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 disabled:opacity-60 sm:px-3"
                  />
                </td>
              </tr>
            ))}
            {filteredTests.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-300">
                  {tests.length === 0
                    ? "No tests found for this laboratory."
                    : "No tests match your search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-slate-400">
        {changedTests.length} test{changedTests.length === 1 ? "" : "s"} edited
      </p>
    </section>
  );
}
