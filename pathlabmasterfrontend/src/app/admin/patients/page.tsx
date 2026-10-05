"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiCalendar, FiChevronDown, FiSearch, FiTrash2 } from "react-icons/fi";

import { getPatientList, getReportDoctors, type PatientListFilters } from "@/app/actions";
import { PatientsTable, type Patient } from "./patients-table";

const today = new Date();
const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);

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
  const normalizedDay = String(day).padStart(2, "0");
  const normalizedMonth = String(month).padStart(2, "0");
  return `${year}-${normalizedMonth}-${normalizedDay}`;
}

function DateInput({
  value,
  onChange,
  min,
  max,
}: {
  value: string;
  onChange: (value: string) => void;
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
      picker.showPicker();
      return;
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
          onChange(parsed || "");
        }}
        className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2.5 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400"
        placeholder="dd/mm/yyyy"
      />
      <button
        type="button"
        onClick={openPicker}
        className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center text-slate-500 transition hover:text-slate-700"
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
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
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
    const result = await getReportDoctors();
    if (result.ok) {
      setDoctorList(result.doctors);
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
          className="w-full rounded-lg border border-slate-300 bg-white/80 py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400"
        />
      </div>

      {isDropdownOpen && filteredDoctors.length > 0 && (
        <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white shadow-lg">
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
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
            >
              <span>{doctor.doctorName ?? "Unnamed doctor"}</span>
              <span className="text-xs text-slate-500">ID: {doctor.doctorId}</span>
            </button>
          ))}
        </div>
      )}

      {isDropdownOpen && filteredDoctors.length === 0 && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-lg">
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

  async function loadPatients(nextFilters: PatientListFilters = filters) {
    setIsLoading(true);
    setError(null);
    const result = await getPatientList(nextFilters);
    if (!result.ok) {
      setPatients([]);
      setError("Unable to connect to the patient service. Please try again.");
      setIsLoading(false);
      return;
    }

    setPatients(result.patients as Patient[]);
    setIsLoading(false);
  }

  useEffect(() => {
    void loadPatients(initialFilters);
  }, []);

  function clearFilters() {
    const nextFilters = { ...initialFilters };
    setFilters(nextFilters);
    void loadPatients(nextFilters);
  }

  function handleSearch() {
    void loadPatients(filters);
  }

  return (
    <section className="mx-auto min-w-0 w-full space-y-3">
      <div className="overflow-hidden rounded-[20px] border border-slate-300/80 bg-[#dfeef0] shadow-sm">
        <div className="border-b border-slate-300/80 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700 sm:text-xs">
          PATIENT DIRECTORY
        </div>

        <div className="space-y-3 p-2.5 sm:p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                From Date
              </span>
              <DateInput
                value={filters.fromDate ?? formatDateInput(today)}
                max={filters.toDate || undefined}
                onChange={(value) => setFilters((current) => ({ ...current, fromDate: value }))}
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                To Date
              </span>
              <DateInput
                value={filters.toDate ?? formatDateInput(today)}
                min={filters.fromDate || undefined}
                onChange={(value) => setFilters((current) => ({ ...current, toDate: value }))}
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                First Name
              </span>
              <input
                value={filters.firstName ?? ""}
                onChange={(event) => setFilters((current) => ({ ...current, firstName: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                Last Name
              </span>
              <input
                value={filters.lastName ?? ""}
                onChange={(event) => setFilters((current) => ({ ...current, lastName: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                Reg. No.
              </span>
              <input
                value={filters.patientId ?? ""}
                onChange={(event) => setFilters((current) => ({ ...current, patientId: event.target.value }))}
                inputMode="numeric"
                className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700">
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

          <div className="flex items-center justify-between gap-3 border-t border-slate-300/80 pt-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 underline-offset-4 hover:underline"
            >
              <span>Show</span>
              <FiChevronDown className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white"
              >
                <FiTrash2 className="h-4 w-4" />
                Clear
              </button>

              <button
                type="button"
                onClick={handleSearch}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-500 bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiSearch className="h-4 w-4" />
                {isLoading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 p-5 text-sm text-rose-100">
          {error}
        </div>
      ) : (
        <PatientsTable patients={patients} />
      )}
    </section>
  );
}
