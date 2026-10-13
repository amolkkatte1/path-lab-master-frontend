"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { FiChevronDown, FiChevronUp, FiSearch, FiTrash2 } from "react-icons/fi";

import { deleteTest } from "@/app/actions";

import type { ApiTest } from "./test-types";

type SortKey =
  | "testId"
  | "testName"
  | "serviceShortName"
  | "serviceName"
  | "serviceGroupName"
  | "labName"
  | "testCharges";
type SortDirection = "asc" | "desc";

type TestsTableProps = {
  tests: ApiTest[];
};

type FilterState = {
  testId: string;
  testName: string;
  serviceShortName: string;
  serviceName: string;
  serviceGroupName: string;
  labName: string;
  testCharges: string;
};

const initialFilters: FilterState = {
  testId: "",
  testName: "",
  serviceShortName: "",
  serviceName: "",
  serviceGroupName: "",
  labName: "",
  testCharges: "",
};

function getTestIdValue(test: ApiTest) {
  return String(test.testId ?? "");
}

function getTestNameValue(test: ApiTest) {
  return test.testName ?? "";
}

function getServiceShortNameValue(test: ApiTest) {
  return test.serviceShortName ?? "";
}

function getServiceNameValue(test: ApiTest) {
  return test.serviceName ?? "";
}

function getServiceGroupNameValue(test: ApiTest) {
  return test.serviceGroupName ?? "";
}

function getLabNameValue(test: ApiTest) {
  return test.labName ?? "";
}

function getChargesValue(test: ApiTest) {
  return String(test.testCharges ?? "");
}

function includesFilter(value: string, filter: string) {
  return value.toLowerCase().includes(filter.trim().toLowerCase());
}

function renderSortIndicator(
  activeSortKey: SortKey,
  activeSortDirection: SortDirection,
  column: SortKey,
) {
  if (activeSortKey !== column) {
    return <FiChevronDown className="h-3.5 w-3.5 opacity-40" />;
  }

  return activeSortDirection === "asc" ? (
    <FiChevronUp className="h-3.5 w-3.5" />
  ) : (
    <FiChevronDown className="h-3.5 w-3.5" />
  );
}

function DeleteTestButton({ testId }: { testId: number | string }) {
  return (
    <form
      action={deleteTest}
      onSubmit={(event) => {
        if (!window.confirm("Are you sure you want to delete this test?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="testId" value={testId} />
      <button
        type="submit"
        aria-label={`Delete test ${testId}`}
        title="Delete test"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-300/20 bg-red-400/10 text-red-500/60 transition hover:bg-red-400/20"
      >
        <FiTrash2 className="h-4 w-4" />
      </button>
    </form>
  );
}

export function TestsTable({ tests }: TestsTableProps) {
  const [filters, setFilters] = useState(initialFilters);
  const [sortKey, setSortKey] = useState<SortKey>("testId");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const deferredFilters = useDeferredValue(filters);

  const filteredTests = tests.filter((test) => {
    return (
      includesFilter(getTestIdValue(test), deferredFilters.testId) &&
      includesFilter(getTestNameValue(test), deferredFilters.testName) &&
      includesFilter(getServiceShortNameValue(test), deferredFilters.serviceShortName) &&
      includesFilter(getServiceNameValue(test), deferredFilters.serviceName) &&
      includesFilter(getServiceGroupNameValue(test), deferredFilters.serviceGroupName) &&
      includesFilter(getLabNameValue(test), deferredFilters.labName) &&
      includesFilter(getChargesValue(test), deferredFilters.testCharges)
    );
  });

  const sortedTests = [...filteredTests].sort((left, right) => {
    const leftValue =
      sortKey === "testId"
        ? getTestIdValue(left)
        : sortKey === "testName"
          ? getTestNameValue(left)
          : sortKey === "serviceShortName"
            ? getServiceShortNameValue(left)
            : sortKey === "serviceName"
              ? getServiceNameValue(left)
              : sortKey === "serviceGroupName"
                ? getServiceGroupNameValue(left)
                : sortKey === "labName"
                  ? getLabNameValue(left)
                  : getChargesValue(left);

    const rightValue =
      sortKey === "testId"
        ? getTestIdValue(right)
        : sortKey === "testName"
          ? getTestNameValue(right)
          : sortKey === "serviceShortName"
            ? getServiceShortNameValue(right)
            : sortKey === "serviceName"
              ? getServiceNameValue(right)
              : sortKey === "serviceGroupName"
                ? getServiceGroupNameValue(right)
                : sortKey === "labName"
                  ? getLabNameValue(right)
                  : getChargesValue(right);

    const comparison = leftValue.localeCompare(rightValue, undefined, {
      numeric: true,
      sensitivity: "base",
    });

    return sortDirection === "asc" ? comparison : comparison * -1;
  });

  function updateFilter(key: keyof FilterState, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function toggleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextKey);
    setSortDirection("asc");
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-[24px] border border-white/10 bg-white/8 backdrop-blur">
      <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-semibold text-white">All Tests</h3>
        <div className="flex items-center gap-3">
          <span className="tests-table-count rounded-full px-3 py-1 text-xs font-semibold">
            Showing {sortedTests.length} of {tests.length}
          </span>
          <button
            type="button"
            onClick={() => setFilters(initialFilters)}
            className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
          >
            Clear filters
          </button>
        </div>
      </div>

      <div className="w-full min-w-0">
        <table className="w-full table-fixed text-left text-xs sm:text-sm">
          <thead className="text-slate-400">
            <tr className="text-xs uppercase tracking-[0.16em]">
              <th className="break-words px-2 py-3 font-semibold sm:px-5 sm:py-4">
                <button type="button" onClick={() => toggleSort("testId")} className="flex min-w-0 flex-wrap items-center gap-1 text-left transition sm:gap-2">
                  Test ID
                  {renderSortIndicator(sortKey, sortDirection, "testId")}
                </button>
              </th>
              <th className="break-words px-2 py-3 font-semibold sm:px-5 sm:py-4">
                <button type="button" onClick={() => toggleSort("testName")} className="flex min-w-0 flex-wrap items-center gap-1 text-left transition sm:gap-2">
                  Test Name
                  {renderSortIndicator(sortKey, sortDirection, "testName")}
                </button>
              </th>
              <th className="break-words px-2 py-3 font-semibold sm:px-5 sm:py-4">
                <button type="button" onClick={() => toggleSort("serviceShortName")} className="flex min-w-0 flex-wrap items-center gap-1 text-left transition sm:gap-2">
                  Code
                  {renderSortIndicator(sortKey, sortDirection, "serviceShortName")}
                </button>
              </th>
              <th className="break-words px-2 py-3 font-semibold sm:px-5 sm:py-4">
                <button type="button" onClick={() => toggleSort("serviceName")} className="flex min-w-0 flex-wrap items-center gap-1 text-left transition sm:gap-2">
                  Service
                  {renderSortIndicator(sortKey, sortDirection, "serviceName")}
                </button>
              </th>
              <th className="break-words px-2 py-3 font-semibold sm:px-5 sm:py-4">
                <button type="button" onClick={() => toggleSort("serviceGroupName")} className="flex min-w-0 flex-wrap items-center gap-1 text-left transition sm:gap-2">
                  Group
                  {renderSortIndicator(sortKey, sortDirection, "serviceGroupName")}
                </button>
              </th>
              <th className="break-words px-2 py-3 font-semibold sm:px-5 sm:py-4">
                <button type="button" onClick={() => toggleSort("labName")} className="flex min-w-0 flex-wrap items-center gap-1 text-left transition sm:gap-2">
                  Lab
                  {renderSortIndicator(sortKey, sortDirection, "labName")}
                </button>
              </th>
              <th className="break-words px-2 py-3 font-semibold sm:px-5 sm:py-4">
                <button type="button" onClick={() => toggleSort("testCharges")} className="flex min-w-0 flex-wrap items-center gap-1 text-left transition sm:gap-2">
                  Charges
                  {renderSortIndicator(sortKey, sortDirection, "testCharges")}
                </button>
              </th>
              <th className="break-words px-2 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 sm:px-5 sm:py-4">
                Actions
              </th>
            </tr>

            <tr className="tests-table-filter-row border-y border-white/10 bg-slate-900/30">
              {[
                ["testId", "Filter ID"],
                ["testName", "Filter test"],
                ["serviceShortName", "Filter code"],
                ["serviceName", "Filter service"],
                ["serviceGroupName", "Filter group"],
                ["labName", "Filter lab"],
                ["testCharges", "Filter charges"],
              ].map(([key, placeholder]) => (
                <th key={key} className="px-1 py-2 text-left font-medium text-slate-300 sm:px-3 sm:py-3">
                  <div className="flex min-w-0 items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-1 py-2 sm:gap-2 sm:px-2.5">
                    <FiSearch className="hidden h-3.5 w-3.5 shrink-0 text-slate-400 sm:block" />
                    <input
                      value={filters[key as keyof FilterState]}
                      onChange={(event) => updateFilter(key as keyof FilterState, event.target.value)}
                      placeholder={placeholder}
                      aria-label={placeholder}
                      className="w-full min-w-0 bg-transparent text-[10px] text-white placeholder:text-slate-400 focus:outline-none sm:text-xs"
                    />
                  </div>
                </th>
              ))}
              <th className="px-5 py-3 text-right font-medium text-slate-300" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {sortedTests.map((test) => (
              <tr key={String(test.testId ?? test.testName ?? "test")} className="border-t border-white/10 transition hover:bg-white/5">
                <td className="break-words px-2 py-3 sm:px-5 sm:py-4">
                  <Link
                    href={`/super-admin/tests/edit/${test.testId ?? ""}`}
                    className="tests-table-link font-semibold transition hover:underline"
                  >
                    {test.testId ?? "—"}
                  </Link>
                </td>
                <td className="break-words px-2 py-3 text-slate-200 sm:px-5 sm:py-4">{test.testName ?? "—"}</td>
                <td className="break-words px-2 py-3 text-slate-200 sm:px-5 sm:py-4">{test.serviceShortName ?? "—"}</td>
                <td className="break-words px-2 py-3 text-slate-200 sm:px-5 sm:py-4">{test.serviceName ?? "—"}</td>
                <td className="break-words px-2 py-3 text-slate-200 sm:px-5 sm:py-4">{test.serviceGroupName ?? "—"}</td>
                <td className="break-words px-2 py-3 text-slate-200 sm:px-5 sm:py-4">{test.labName ?? "—"}</td>
                <td className="break-words px-2 py-3 text-slate-200 sm:px-5 sm:py-4">{test.testCharges ?? "—"}</td>
                <td className="px-2 py-3 text-right sm:px-5 sm:py-4">
                  <div className="flex justify-end">
                    <DeleteTestButton testId={test.testId ?? ""} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
