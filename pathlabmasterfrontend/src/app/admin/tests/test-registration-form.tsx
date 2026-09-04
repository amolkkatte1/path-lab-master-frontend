"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiCheck, FiLoader, FiSearch, FiX } from "react-icons/fi";
import { registerReport } from "@/app/actions";


export type AvailableTest = {
  testId: number | string;
  testName: string;
  serviceShortName?: string;
  serviceName?: string;
  serviceId?: number | string;
  serviceGroupId?: number | string;
  serviceGroupName?: string | null;
  labId?: number | string;
  labName?: string;
  parameterGroupList?: string;
  parameterList?: string;
  testCharges?: number | string;
  createdBy?: number | string;
  updatedBy?: number | string;
  createdAt?: string;
  updatedAt?: string;
};

type TestRegistrationFormProps = {
  availableTests: AvailableTest[];
  patientId: string;
};

function displayTestCode(test: AvailableTest) {
  return test.serviceShortName || test.serviceName || "-";
}

function displayAmount(test: AvailableTest) {
  if (test.testCharges === undefined || test.testCharges === null) return "-";
  return Number(test.testCharges).toFixed(2);
}

export function TestRegistrationForm({
  availableTests,
  patientId,
}: Readonly<TestRegistrationFormProps>) {
  const router = useRouter();
  const [rows, setRows] = useState<Array<AvailableTest | null>>([null]);
  const [rowIds, setRowIds] = useState(["test-request-row-0"]);
  const nextRowId = useRef(1);
  const [searches, setSearches] = useState([""]);
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    function closeDropdown(event: PointerEvent) {
      const target = event.target;
      const element = target instanceof Element ? target : null;
      if (!element?.closest("[data-test-autocomplete]")) {
        setActiveRow(null);
      }
    }

    document.addEventListener("pointerdown", closeDropdown);
    return () => document.removeEventListener("pointerdown", closeDropdown);
  }, []);

  const filteredTests = useMemo(() => {
    if (activeRow === null) return [];
    const query = searches[activeRow]?.trim().toLowerCase() ?? "";
    const selectedTestIds = new Set(
      rows
        .filter((test): test is AvailableTest => test !== null)
        .map((test) => String(test.testId)),
    );

    return availableTests
      .filter((test) => !selectedTestIds.has(String(test.testId)))
      .filter((test) =>
        `${test.testName} ${displayTestCode(test)} ${test.serviceName ?? ""}`
          .toLowerCase()
          .includes(query),
      )
      .slice(0, 8);
  }, [activeRow, availableTests, rows, searches]);

  function removeRow(index: number) {
    if (index === 0) {
      setSearches((current) => current.map((value, rowIndex) => rowIndex === 0 ? "" : value));
      setActiveRow(null);
      return;
    }

    setRows((current) =>
      current.filter((_, rowIndex) => rowIndex !== index),
    );
    setSearches((current) =>
      current.filter((_, rowIndex) => rowIndex !== index),
    );
    setRowIds((current) =>
      current.filter((_, rowIndex) => rowIndex !== index),
    );
    setActiveRow(null);
  }

  function chooseTest(index: number, test: AvailableTest) {
    if (
      rows.some(
        (selectedTest) => selectedTest?.testId === test.testId,
      )
    ) {
      setActiveRow(null);
      return;
    }

    if (index === 0) {
      setRows((current) => [null, ...current.map((row) => row ?? test)]);
      setSearches((current) => ["", ...current.map((search, rowIndex) => rowIndex === 0 ? test.testName : search)]);
      setRowIds((current) => [
        `test-request-row-${nextRowId.current++}`,
        ...current,
      ]);
      setActiveRow(null);
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setError("");
      return;
    }

    setRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? test : row)),
    );
    setSearches((current) =>
      current.map((search, rowIndex) =>
        rowIndex === index ? test.testName : search,
      ),
    );
    setActiveRow(null);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setError("");
  }

  async function saveTests() {
    const selectedTests = rows.filter(
      (test): test is AvailableTest => test !== null,
    );
    if (selectedTests.length === 0) {
      setError("Select at least one test before saving.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      const result = await registerReport({
        patientId,
        testList: selectedTests as unknown as Array<Record<string, unknown>>,
      });
      if (!result.ok) throw new Error(result.error);
      router.push("/admin");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to register the selected tests.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Test requests</h2>
          <p className="mt-1 text-sm text-slate-400">
            Add all requested tests.
          </p>
        </div>
      </div>
      {error && (
        <div className="mt-4 rounded-xl border border-rose-300/20 bg-rose-400/10 p-3 text-sm text-rose-100">
          {error}
        </div>
      )}
      <div className="test-request-table-frame mt-5 overflow-visible rounded-xl border">
        <table className="test-request-table w-full text-left text-sm">
          <thead className="test-request-table-head text-slate-300">
            <tr>
              <th className="w-12 px-3 py-3" aria-label="Remove" />
              <th className="px-4 py-3 font-semibold">Test name</th>
              <th className="px-4 py-3 font-semibold">Test code</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {rows.map((test, index) => (
              <tr
                key={rowIds[index]}
                className="test-request-table-row border-b last:border-b-0"
              >
                <td className="px-3 py-3 align-top" data-label="">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    aria-label="Remove test"
                    title="Remove test"
                    className="mt-2 text-rose-400 transition hover:text-rose-300"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </td>
                <td
                  className="relative px-4 py-3 align-top"
                  data-test-autocomplete
                  data-label="Test name"
                >
                  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 focus-within:border-emerald-300/50">
                    <FiSearch className="shrink-0 text-slate-500" />
                    <input
                      value={searches[index] ?? ""}
                      onFocus={() => setActiveRow(index)}
                      onChange={(event) => {
                        setSearches((current) =>
                          current.map((value, rowIndex) =>
                            rowIndex === index ? event.target.value : value,
                          ),
                        );
                        setRows((current) =>
                          current.map((row, rowIndex) =>
                            rowIndex === index ? null : row,
                          ),
                        );
                        setActiveRow(index);
                      }}
                      placeholder="Search test name"
                      className="min-w-0 w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                      aria-label={`Test name ${index + 1}`}
                    />
                  </div>
                  {activeRow === index && filteredTests.length > 0 && (
                    <div className="test-autocomplete-menu absolute left-4 right-4 top-[calc(100%-0.5rem)] z-20 overflow-hidden rounded-lg border shadow-xl">
                      {filteredTests.map((option) => (
                        <button
                          type="button"
                          key={String(option.testId)}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            chooseTest(index, option);
                          }}
                          className="test-autocomplete-option block w-full border-b px-4 py-3 text-left text-sm transition last:border-0"
                        >
                          {option.testName}
                          <span className="ml-2 text-xs opacity-70">
                            {displayTestCode(option)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 align-top text-slate-300" data-label="Test code">
                  {test ? displayTestCode(test) : "-"}
                </td>
                <td className="px-4 py-3 align-top text-slate-300" data-label="Type">
                  {test ? "Test" : "-"}
                </td>
                <td className="px-4 py-3 text-right align-top text-slate-200" data-label="Amount">
                  {test ? displayAmount(test) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => router.push("/admin")}
          disabled={isSaving}
          className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={saveTests}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? <FiLoader className="animate-spin" /> : <FiCheck />} Save
        </button>
      </div>
    </>
  );
}