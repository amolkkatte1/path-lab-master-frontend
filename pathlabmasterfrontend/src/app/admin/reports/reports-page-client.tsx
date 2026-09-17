"use client";

import { useEffect, useMemo, useState } from "react";
import { FiChevronRight, FiDownload, FiFileText, FiFilter, FiHash, FiMessageCircle, FiPrinter, FiSearch, FiTrash2, FiX } from "react-icons/fi";

import {
  getReportDoctors,
  getReportList,
  type ReportDoctorOption,
  type ReportListItem,
} from "@/app/actions";

const today = new Date();
const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);

const initialFilters = {
  fromDate: formatDateInput(today),
  toDate: formatDateInput(today),
  firstName: "",
  lastName: "",
  regNo: "",
  doctor: "",
  doctorId: "",
};

export type DoctorOption = ReportDoctorOption;

type ReportsPageClientProps = {
  initialDoctors: DoctorOption[];
  initialReports: ReportListItem[];
};

function DoctorFilterSelector({
  initialDoctors,
  value,
  onChange,
}: {
  initialDoctors: DoctorOption[];
  value: string;
  onChange: (selection: { name: string; doctorId: string }) => void;
}) {
  const [doctorList, setDoctorList] = useState(initialDoctors);
  const [query, setQuery] = useState(value);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isDropdownOpen) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node | null;
      const root = document.querySelector("[data-report-doctor-filter-root]");

      if (!root || !target || root.contains(target)) {
        return;
      }

      setIsDropdownOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isDropdownOpen]);

  const filteredDoctors = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return doctorList;

    return doctorList.filter((doctor) => {
      const searchable = [
        doctor.doctorName,
        String(doctor.doctorId ?? ""),
        doctor.doctorMailId,
        String(doctor.doctorMobileNumber ?? ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalized);
    });
  }, [doctorList, query]);

  async function refreshDoctors() {
    const result = await getReportDoctors();

    if (result.ok) {
      setDoctorList(result.doctors);
    }
  }

  return (
    <div className="relative" data-report-doctor-filter-root>
      <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 shadow-sm transition focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100">
        <FiSearch className="h-4 w-4 text-slate-400" />
        <input
          value={query}
          onFocus={() => {
            setIsDropdownOpen(true);
            void refreshDoctors();
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsDropdownOpen(true);
            onChange({ name: event.target.value, doctorId: "" });
          }}
          placeholder="Search doctor"
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
        />
      </div>

      {isDropdownOpen && filteredDoctors.length > 0 && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {filteredDoctors.slice(0, 8).map((doctor) => (
            <button
              key={String(doctor.doctorId)}
              type="button"
              onClick={() => {
                const nextValue = doctor.doctorName ?? String(doctor.doctorId);
                setQuery(nextValue);
                onChange({ name: nextValue, doctorId: String(doctor.doctorId) });
                setIsDropdownOpen(false);
              }}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span>{doctor.doctorName ?? "Unnamed doctor"}</span>
              <span className="text-xs text-slate-500">ID: {doctor.doctorId}</span>
            </button>
          ))}
        </div>
      )}

      {isDropdownOpen && filteredDoctors.length === 0 && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          No doctors found for this lab.
        </div>
      )}
    </div>
  );
}

type ReportApiItem = ReportListItem;

type ReportRow = {
  patientName: string;
  regDate: string;
  type: string;
  doctor: string;
  regNo: string;
  ccNo: string;
  tests: ReportTest[];
};

type TestStatusLabel = "SAVED" | "APPROVED" | "PRINTED";
type ReportTest = {
  name: string;
  status: TestStatusLabel | null;
};
type TestStatus = {
  isSaved?: boolean;
  isApproved?: boolean;
  isPrinted?: boolean;
};
type UnknownRecord = Record<string, unknown>;

function toRecord(value: unknown): UnknownRecord {
  if (typeof value === "string") {
    try {
      return toRecord(JSON.parse(value));
    } catch {
      return {};
    }
  }

  return value && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : {};
}

function testDisplayName(testKey: string) {
  return testKey.replace(/_\d+$/, "");
}

function toTestStatus(value: unknown): TestStatus | undefined {
  const status = toRecord(value);

  return Object.keys(status).length > 0 ? status as TestStatus : undefined;
}

function getTestStatus(status: TestStatus | undefined): TestStatusLabel | null {
  if (status?.isPrinted) return "PRINTED";
  if (status?.isApproved) return "APPROVED";
  if (status?.isSaved) return "SAVED";
  return null;
}

function mapReportApiItem(item: ReportApiItem): ReportRow {
  const nameParts = [item.prefix, item.firstName, item.middleName, item.lastName].filter(Boolean) as string[];
  const patientName = nameParts.length > 0 ? nameParts.join(" ") : "Unknown patient";
  const completedTests = toRecord(item.completedTest);
  const pendingTests = toRecord(item.pendingTest);
  const statuses = toRecord(item.status);
  const tests = new Map<string, string>();

  Object.keys(completedTests).forEach((testKey) => {
    tests.set(testDisplayName(testKey), testKey);
  });

  Object.keys(pendingTests).forEach((testKey) => {
    const displayName = testDisplayName(testKey);
    if (!tests.has(displayName)) {
      tests.set(displayName, testKey);
    }
  });

  Object.keys(statuses).forEach((testKey) => {
    const displayName = testDisplayName(testKey);
    if (!tests.has(displayName)) {
      tests.set(displayName, testKey);
    }
  });

  const testEntries = [...tests.entries()];
  const doctorName = item.doctorName || "N/A";
  const regNo = item.patientId ? String(item.patientId) : item.reportId ? String(item.reportId) : "N/A";

  return {
    patientName,
    regDate: today.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    type: "OPD",
    doctor: doctorName,
    regNo,
    ccNo: "CC: N/A",
    tests: testEntries.map(([testName, testKey]) => {
      const statusEntry = toTestStatus(statuses[testKey])
        ?? toTestStatus(Object.entries(statuses).find(([statusKey]) => testDisplayName(statusKey) === testName)?.[1]);
      return {
        name: testName,
        status: getTestStatus(statusEntry),
      };
    }),
  };
}

function statusBadgeClass(status: TestStatusLabel) {
  if (status === "SAVED") {
    return "report-status-saved";
  }
  if (status === "APPROVED") {
    return "report-status-approved";
  }
  return "report-status-printed";
}

export default function ReportsPageClient({
  initialDoctors,
  initialReports,
}: Readonly<ReportsPageClientProps>) {
  const [rows, setRows] = useState<ReportRow[]>(() => initialReports.map(mapReportApiItem));
  const [filters, setFilters] = useState(initialFilters);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [actionMenuRow, setActionMenuRow] = useState<ReportRow | null>(null);

  async function handleSearch() {
    const result = await getReportList(filters);
    setRows(result.reports.map(mapReportApiItem));
  }

  const filteredRows = useMemo(() => {
    const query = [filters.firstName, filters.lastName].join(" ").trim().toLowerCase();
    return rows.filter((row) => {
      if (query && !row.patientName.toLowerCase().includes(query)) return false;
      if (filters.regNo && !row.regNo.includes(filters.regNo)) return false;
      if (filters.doctor && !row.doctor.toLowerCase().includes(filters.doctor.toLowerCase())) return false;
      return true;
    });
  }, [filters, rows]);

  const clearFilters = async () => {
    setFilters(initialFilters);

    const result = await getReportList(initialFilters);
    setRows(result.reports.map(mapReportApiItem));
  };

  return (
    <div className="report-search-page min-h-screen w-full">
      <div className="report-search-header border-b px-4 py-3 text-sm font-semibold uppercase tracking-[0.22em]">
        LAB TEST SEARCH
      </div>

      <div className="w-full py-0">
        <div className="report-search-shell mx-auto w-full rounded-xl border shadow-sm">
          <div className="space-y-3 p-3 lg:p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="report-filter-field block text-sm font-medium">
                <span className="report-filter-label mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
                  From Date
                </span>
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, fromDate: e.target.value }))}
                  className="report-input report-date-input w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition"
                />
              </label>

              <label className="report-filter-field block text-sm font-medium">
                <span className="report-filter-label mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
                  To Date
                </span>
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, toDate: e.target.value }))}
                  className="report-input report-date-input w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="report-filter-field block text-sm font-medium">
                <span className="report-filter-label mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
                  First Name
                </span>
                <input
                  value={filters.firstName}
                  onChange={(e) => setFilters((prev) => ({ ...prev, firstName: e.target.value }))}
                  className="report-input w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition"
                  placeholder=""
                />
              </label>

              <label className="report-filter-field block text-sm font-medium">
                <span className="report-filter-label mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
                  Last Name
                </span>
                <input
                  value={filters.lastName}
                  onChange={(e) => setFilters((prev) => ({ ...prev, lastName: e.target.value }))}
                  className="report-input w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition"
                  placeholder=""
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="report-filter-field block text-sm font-medium">
                <span className="report-filter-label mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
                  Reg. No.
                </span>
                <input
                  value={filters.regNo}
                  onChange={(e) => setFilters((prev) => ({ ...prev, regNo: e.target.value }))}
                  inputMode="numeric"
                  className="report-input w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition"
                  placeholder=""
                />
              </label>

              <label className="report-filter-field block text-sm font-medium">
                <span className="report-filter-label mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
                  Ref. Doctor
                </span>
                  <DoctorFilterSelector
                    initialDoctors={initialDoctors}
                    value={filters.doctor}
                    onChange={({ name, doctorId }) => setFilters((prev) => ({
                      ...prev,
                      doctor: name,
                      doctorId,
                    }))}
                  />
              </label>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => setAdvancedOpen((open) => !open)}
                className="report-toggle-button flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
              >
                <span>{advancedOpen ? "Hide" : "Show"}</span>
                <FiFilter className="h-4 w-4" />
              </button>
            </div>

            {advancedOpen && (
              <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-300">
                Advanced search options are available for custom report filtering.
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 border-t border-slate-700 pt-3">
              <button
                type="button"
                onClick={clearFilters}
                className="report-action-secondary inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition"
              >
                <FiTrash2 className="h-4 w-4" />
                Clear
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
              >
                <FiFileText className="h-4 w-4" />
                Pdf Report
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
              >
                <FiDownload className="h-4 w-4" />
                Xls Report
              </button>

              <button
                type="button"
                onClick={() => {
                  void handleSearch();
                }}
                className="report-action-search ml-auto inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold shadow-lg transition"
              >
                <FiSearch className="h-4 w-4" />
                Search
              </button>
            </div>
          </div>

          <div className="report-results-summary border-t px-3 py-2.5 text-sm">
            Showing {filteredRows.length} of {rows.length} records.
          </div>

          <div className="space-y-3 p-2 pb-3">
            {filteredRows.map((row, index) => (
              <div key={`${row.regNo}-${index}`} className="report-row relative w-full rounded-xl border p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1 lg:pr-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-base font-semibold text-white">{row.patientName}</span>
                    </div>

                    <div className="report-meta mt-3 flex flex-wrap gap-x-7 gap-y-2 text-sm">
                      <span>Reg. Date: {row.regDate}</span>
                      <span>Type: {row.type}</span>
                      <span>Ref. Doctor: {row.doctor}</span>
                    </div>

                    <div className="report-meta mt-2 flex flex-wrap gap-x-7 gap-y-2 text-sm">
                      <span>Reg. No.: {row.regNo}</span>
                      <span>{row.ccNo}</span>
                    </div>

                    <div className="mt-3 space-y-2">
                      {row.tests.length === 0 ? (
                        <div className="report-test-name text-base font-medium">No tests available</div>
                      ) : row.tests.map((test) => (
                        <div key={test.name} className="flex flex-wrap items-center gap-2">
                          <span className="report-test-name text-base font-medium">Test: {test.name}</span>
                          {test.status && (
                            <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusBadgeClass(test.status)}`}>
                              {test.status}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label={`Open report actions for ${row.patientName}`}
                    onClick={() => setActionMenuRow(row)}
                    className="report-mobile-action absolute right-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border lg:hidden"
                  >
                    <FiChevronRight className="h-6 w-6" />
                  </button>

                  <div className="hidden shrink-0 flex-wrap items-center justify-end gap-2 self-center lg:flex lg:self-start">
                    <button type="button" className="report-action-button flex flex-col items-center gap-1.5 rounded-xl border px-1.5 py-1.5 text-[11px] font-medium transition">
                      <span className="report-action-icon-wrapper">
                        <FiSearch className="h-4 w-4" />
                      </span>
                      <span>WhatsApp</span>
                    </button>
                    <button type="button" className="report-action-button flex flex-col items-center gap-1.5 rounded-xl border px-1.5 py-1.5 text-[11px] font-medium transition">
                      <span className="report-action-icon-wrapper">
                        <FiPrinter className="h-4 w-4" />
                      </span>
                      <span>Print Reports</span>
                    </button>
                    <button type="button" className="report-action-button flex flex-col items-center gap-1.5 rounded-xl border px-1.5 py-1.5 text-[11px] font-medium transition">
                      <span className="report-action-icon-wrapper">
                        <FiX className="h-4 w-4" />
                      </span>
                      <span>Barcode</span>
                    </button>
                    <button type="button" className="report-action-button flex flex-col items-center gap-1.5 rounded-xl border px-1.5 py-1.5 text-[11px] font-medium transition">
                      <span className="report-action-icon-wrapper">
                        <FiFileText className="h-4 w-4" />
                      </span>
                      <span>PathLab Reports</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {actionMenuRow && (
        <div
          className="report-mobile-menu-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-5 lg:hidden"
          role="presentation"
          onClick={() => setActionMenuRow(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Report actions for ${actionMenuRow.patientName}`}
            className="report-mobile-menu w-full max-w-sm overflow-hidden rounded-md border bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <span className="flex items-center gap-3 text-xl font-medium">
                <FiFileText className="h-7 w-7" />
                PathLab Reports
              </span>
              <button
                type="button"
                aria-label="Close report actions"
                onClick={() => setActionMenuRow(null)}
                className="rounded p-1 text-slate-500 hover:bg-slate-100"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            {[
              { label: "Barcode", icon: FiHash },
              { label: "Print Reports", icon: FiPrinter },
              { label: "WhatsApp", icon: FiMessageCircle },
            ].map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                className="flex w-full items-center gap-4 border-b px-5 py-5 text-left text-xl text-slate-700 last:border-b-0 hover:bg-slate-50"
              >
                <Icon className="h-8 w-8 text-slate-700" />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
