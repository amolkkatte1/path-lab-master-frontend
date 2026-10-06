"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiCalendar, FiSearch, FiTrash2 } from "react-icons/fi";

import { getPatientList, getReportDoctors, type PatientListFilters } from "@/app/actions";
import { PatientsTable, type Patient } from "./patients-table";

const today = new Date();
const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function formatDateForDisplay(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

function parseDateFromDisplay(value: string) {
  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return "";
  const [, day, month, year] = match;
  const normalizedDay = Number(day);
  const normalizedMonth = Number(month);
  const normalizedYear = Number(year);
  const parsed = new Date(Date.UTC(normalizedYear, normalizedMonth - 1, normalizedDay));
  if (
    parsed.getUTCFullYear() !== normalizedYear ||
    parsed.getUTCMonth() !== normalizedMonth - 1 ||
    parsed.getUTCDate() !== normalizedDay
  ) return "";
  return `${year}-${String(normalizedMonth).padStart(2, "0")}-${String(normalizedDay).padStart(2, "0")}`;
}

function DateInput({
  value,
  onChange,
  onValidityChange,
  min,
  max,
}: {
  value: string;
  onChange: (value: string) => void;
  onValidityChange: (isValid: boolean) => void;
  min?: string;
  max?: string;
}) {
  const [displayValue, setDisplayValue] = useState(() => formatDateForDisplay(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayValue(formatDateForDisplay(value));
  }, [value]);

  function openPicker() {
    const picker = inputRef.current;
    if (!picker) return;
    if (typeof picker.showPicker === "function") {
      try {
        picker.showPicker();
        return;
      } catch {
        // Fall through to focus on browsers that reject showPicker().
      }
    }
    picker.focus();
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={displayValue}
        onChange={(event) => {
          const nextValue = event.target.value;
          setDisplayValue(nextValue);
          const parsed = parseDateFromDisplay(nextValue);
          const isEmpty = nextValue.trim() === "";
          onValidityChange(isEmpty || Boolean(parsed));
          if (parsed) onChange(parsed);
          else if (isEmpty) onChange("");
        }}
        onClick={openPicker}
        className="patient-filter-input w-full rounded-lg border px-3 py-2.5 pr-10 text-sm outline-none transition placeholder:text-slate-400"
        placeholder="dd/mm/yyyy"
      />
      <button
        type="button"
        onClick={openPicker}
        className="patient-filter-date-button absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center transition"
        aria-label="Open date picker"
      >
        <FiCalendar className="h-4 w-4" />
      </button>
      <input
        ref={inputRef}
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(event) => {
          onValidityChange(true);
          onChange(event.target.value);
        }}
        aria-hidden="true"
        tabIndex={-1}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
      />
    </div>
  );
}

const initialFilters: PatientListFilters = {
  fromDate: formatDateInput(today),
  toDate: formatDateInput(today),
  firstName: "",
  lastName: "",
  patientId: "",
  doctorName: "",
  doctorId: "",
};

type DoctorOption = {
  doctorId: number | string;
  doctorName?: string;
  doctorMailId?: string;
  doctorMobileNumber?: number | string;
  labName?: string;
  labId?: number | string;
};

function DoctorFilterSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (selection: { name: string; doctorId: string }) => void;
}) {
  const [doctorList, setDoctorList] = useState<DoctorOption[]>([]);
  const [query, setQuery] = useState(value);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (!isDropdownOpen) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node | null;
      const root = document.querySelector("[data-patient-doctor-filter-root]");

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
      const searchable = [doctor.doctorName, String(doctor.doctorId ?? ""), doctor.doctorMailId, String(doctor.doctorMobileNumber ?? "")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalized);
    });
  }, [doctorList, query]);

  async function refreshDoctors() {
    setIsLoadingDoctors(true);
    try {
      const result = await getReportDoctors();
      if (result.ok) setDoctorList(result.doctors);
      else setDoctorList([]);
    } catch {
      setDoctorList([]);
    } finally {
      setIsLoadingDoctors(false);
    }
  }

  return (
    <div className="relative" data-patient-doctor-filter-root>
      <div className="relative">
        <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
          className="patient-filter-input w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400"
        />
      </div>

      {isDropdownOpen && isLoadingDoctors && filteredDoctors.length === 0 && (
        <div className="patient-doctor-filter-empty absolute z-20 mt-2 w-full rounded-xl border px-3 py-2 text-sm shadow-lg">Loading doctors…</div>
      )}

      {isDropdownOpen && filteredDoctors.length > 0 && (
        <div className="patient-doctor-filter-menu absolute z-20 mt-2 max-h-64 w-full overflow-y-auto overscroll-contain rounded-xl border shadow-lg">
          {filteredDoctors.map((doctor) => (
            <button
              key={String(doctor.doctorId)}
              type="button"
              onClick={() => {
                const nextValue = doctor.doctorName ?? String(doctor.doctorId);
                setQuery(nextValue);
                onChange({ name: nextValue, doctorId: String(doctor.doctorId) });
                setIsDropdownOpen(false);
              }}
              className="patient-doctor-filter-option flex w-full items-center justify-between px-3 py-2 text-left text-sm transition"
            >
              <span>{doctor.doctorName ?? "Unnamed doctor"}</span>
              <span className="patient-doctor-filter-id text-xs">ID: {doctor.doctorId}</span>
            </button>
          ))}
        </div>
      )}

      {isDropdownOpen && !isLoadingDoctors && filteredDoctors.length === 0 && (
        <div className="patient-doctor-filter-empty absolute z-20 mt-2 w-full rounded-xl border px-3 py-2 text-sm shadow-lg">
          No doctors found for this lab.
        </div>
      )}
    </div>
  );
}

export default function PatientsPage() {
  const [filters, setFilters] = useState<PatientListFilters>(initialFilters);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [invalidDateFields, setInvalidDateFields] = useState({ fromDate: false, toDate: false });
  const requestId = useRef(0);

  async function loadPatients(nextFilters: PatientListFilters = filters) {
    const currentRequestId = ++requestId.current;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getPatientList(nextFilters);
      if (currentRequestId !== requestId.current) return;
      if (!result.ok) {
        setError("Unable to connect to the patient service. Please try again.");
        return;
      }
      setPatients(result.patients as Patient[]);
    } catch {
      if (currentRequestId === requestId.current) {
        setError("Unable to connect to the patient service. Please try again.");
      }
    } finally {
      if (currentRequestId === requestId.current) setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPatients(initialFilters);
  }, []);

  function clearFilters() {
    const nextFilters = { ...initialFilters };
    setFilters(nextFilters);
    setInvalidDateFields({ fromDate: false, toDate: false });
    void loadPatients(nextFilters);
  }

  function handleSearch() {
    if (invalidDateFields.fromDate || invalidDateFields.toDate) return;
    void loadPatients(filters);
  }

  function updateDateValidity(field: "fromDate" | "toDate", isValid: boolean) {
    setInvalidDateFields((current) => ({ ...current, [field]: !isValid }));
  }

  function updateFromDate(value: string) {
    setFilters((current) => ({
      ...current,
      fromDate: value,
      toDate: value && current.toDate && value > current.toDate ? value : current.toDate,
    }));
  }

  function updateToDate(value: string) {
    setFilters((current) => ({
      ...current,
      toDate: value,
      fromDate: value && current.fromDate && value < current.fromDate ? value : current.fromDate,
    }));
  }

  return (
    <section className="mx-auto min-w-0 w-full space-y-3">
      <div className="patient-filter-panel overflow-visible rounded-[20px] border shadow-sm">
        <div className="patient-filter-heading rounded-t-[20px] border-b px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] sm:text-xs">
          PATIENT DIRECTORY
        </div>

        <form
          className="space-y-3 p-2.5 sm:p-3"
          onSubmit={(event) => {
            event.preventDefault();
            handleSearch();
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="patient-filter-label block text-sm font-medium">
              <span className="patient-filter-label-text mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
                From Date
              </span>
              <DateInput
                value={filters.fromDate ?? formatDateInput(today)}
                max={filters.toDate || undefined}
                onChange={updateFromDate}
                onValidityChange={(isValid) => updateDateValidity("fromDate", isValid)}
              />
            </label>

            <label className="patient-filter-label block text-sm font-medium">
              <span className="patient-filter-label-text mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
                To Date
              </span>
              <DateInput
                value={filters.toDate ?? formatDateInput(today)}
                min={filters.fromDate || undefined}
                onChange={updateToDate}
                onValidityChange={(isValid) => updateDateValidity("toDate", isValid)}
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="patient-filter-label block text-sm font-medium">
              <span className="patient-filter-label-text mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
                First Name
              </span>
              <input
                value={filters.firstName ?? ""}
                onChange={(event) => setFilters((current) => ({ ...current, firstName: event.target.value }))}
                className="patient-filter-input w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400"
              />
            </label>

            <label className="patient-filter-label block text-sm font-medium">
              <span className="patient-filter-label-text mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
                Last Name
              </span>
              <input
                value={filters.lastName ?? ""}
                onChange={(event) => setFilters((current) => ({ ...current, lastName: event.target.value }))}
                className="patient-filter-input w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="patient-filter-label block text-sm font-medium">
              <span className="patient-filter-label-text mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
                Reg. No.
              </span>
              <input
                value={filters.patientId ?? ""}
                onChange={(event) => setFilters((current) => ({ ...current, patientId: event.target.value.replace(/\D/g, "") }))}
                inputMode="numeric"
                className="patient-filter-input w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400"
              />
            </label>

            <label className="patient-filter-label block text-sm font-medium">
              <span className="patient-filter-label-text mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
                Ref. Doctor
              </span>
              <DoctorFilterSelector
                value={filters.doctorName ?? ""}
                onChange={({ name, doctorId }) =>
                  setFilters((current) => ({
                    ...current,
                    doctorName: name,
                    doctorId,
                  }))
                }
              />
            </label>
          </div>

          <div className="patient-filter-actions flex items-center justify-end gap-3 border-t pt-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={clearFilters}
                className="patient-filter-clear inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium shadow-sm transition"
              >
                <FiTrash2 className="h-4 w-4" />
                Clear
              </button>

              <button
                type="submit"
                disabled={isLoading || invalidDateFields.fromDate || invalidDateFields.toDate}
                className="patient-filter-search inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiSearch className="h-4 w-4" />
                {isLoading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {(invalidDateFields.fromDate || invalidDateFields.toDate) && (
        <p className="patient-filter-error rounded-xl border px-4 py-3 text-sm" role="alert">
          Enter valid dates in dd/mm/yyyy format.
        </p>
      )}
      {error && (
        <div className="patient-filter-error rounded-2xl border p-5 text-sm" role="alert">
          {error}
        </div>
      )}
      <PatientsTable patients={patients} />
    </section>
  );
}
