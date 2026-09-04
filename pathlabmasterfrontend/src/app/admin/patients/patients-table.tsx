"use client";

import { useDeferredValue, useState } from "react";
import Link from "next/link";
import { FiChevronDown, FiChevronUp, FiClipboard, FiMail, FiPhone, FiSearch } from "react-icons/fi";

export type Patient = {
  patientId: number | string;
  prefix?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  mobileNumber?: number | string;
  mailId?: string;
  gender?: string;
  dateOfBirth?: string;
  labName?: string;
  doctorId?: number | string;
  doctorName?: string;
};

type SortKey = "patient" | "contact" | "gender" | "dateOfBirth" | "doctor" | "lab";
type SortDirection = "asc" | "desc";
type FilterKey = SortKey;

type PatientsTableProps = {
  patients: Patient[];
};

const initialFilters: Record<FilterKey, string> = {
  patient: "",
  contact: "",
  gender: "",
  dateOfBirth: "",
  doctor: "",
  lab: "",
};

function patientName(patient: Patient) {
  return [patient.prefix, patient.firstName, patient.middleName, patient.lastName]
    .filter(Boolean)
    .join(" ");
}

function testRegistrationHref(patient: Patient) {
  const params = new URLSearchParams({
    patientId: String(patient.patientId),
    patientName: patientName(patient),
  });

  if (patient.mobileNumber) {
    params.set("mobileNumber", String(patient.mobileNumber));
  }

  return `/admin/tests?${params.toString()}`;
}

function cellValue(patient: Patient, key: SortKey) {
  if (key === "patient") return `${patientName(patient)} ${patient.patientId}`;
  if (key === "contact") return `${patient.mobileNumber ?? ""} ${patient.mailId ?? ""}`;
  if (key === "gender") return patient.gender ?? "";
  if (key === "dateOfBirth") return patient.dateOfBirth ?? "";
  if (key === "doctor") return `${patient.doctorName ?? ""} ${patient.doctorId ?? ""}`;
  return patient.labName ?? "";
}

function sortIndicator(activeKey: SortKey, direction: SortDirection, key: SortKey) {
  if (activeKey !== key) return <FiChevronDown className="h-3.5 w-3.5 opacity-40" />;
  return direction === "asc" ? <FiChevronUp className="h-3.5 w-3.5" /> : <FiChevronDown className="h-3.5 w-3.5" />;
}

export function PatientsTable({ patients }: PatientsTableProps) {
  const [filters, setFilters] = useState(initialFilters);
  const [sortKey, setSortKey] = useState<SortKey>("patient");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const deferredFilters = useDeferredValue(filters);

  const filteredPatients = patients.filter((patient) =>
    (Object.keys(initialFilters) as FilterKey[]).every((key) =>
      cellValue(patient, key).toLowerCase().includes(deferredFilters[key].trim().toLowerCase()),
    ),
  );

  const sortedPatients = [...filteredPatients].sort((left, right) => {
    const comparison = cellValue(left, sortKey).localeCompare(cellValue(right, sortKey), undefined, {
      numeric: true,
      sensitivity: "base",
    });
    return sortDirection === "asc" ? comparison : comparison * -1;
  });

  function updateFilter(key: FilterKey, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/45">
      <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-semibold text-white">All patients</h2>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">Showing {sortedPatients.length} of {patients.length}</span>
          <button type="button" onClick={() => setFilters(initialFilters)} className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:bg-white/10">Clear filters</button>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[1080px] text-left text-sm">
          <thead className="bg-transparent-950/30 text-slate-400">
            <tr className="text-xs uppercase tracking-[0.16em]">
              {([
                ["patient", "Patient"],
                ["contact", "Contact"],
                ["gender", "Gender"],
                ["dateOfBirth", "Date of birth"],
                ["doctor", "Doctor"],
                // ["lab", "Laboratory"],
              ] as const).map(([key, label]) => (
                <th key={key} className="px-5 py-3 font-semibold">
                  <button type="button" onClick={() => toggleSort(key)} className="table-sort-button flex items-center gap-2 text-left transition">
                    {label}
                    {sortIndicator(sortKey, sortDirection, key)}
                  </button>
                  <label className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 normal-case tracking-normal">
                    <FiSearch className="h-3.5 w-3.5 shrink-0" />
                    <input value={filters[key]} onChange={(event) => updateFilter(key, event.target.value)} placeholder={`Search ${label.toLowerCase()}`} aria-label={`Search ${label}`} className="min-w-0 w-full bg-transparent text-xs font-normal text-slate-200 outline-none placeholder:text-slate-500" />
                  </label>
                </th>
              ))}
              <th className="px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {sortedPatients.map((patient) => (
              <tr key={String(patient.patientId)} className="patient-table-row transition hover:bg-white/5">
                <td className="px-5 py-4"><Link href={`/admin/patients/edit/${patient.patientId}`} className="font-semibold text-white transition hover:text-emerald-200 hover:underline">{patientName(patient)}</Link><p className="mt-1 text-xs text-slate-500">ID: <Link href={`/admin/patients/edit/${patient.patientId}`} className="transition hover:text-emerald-300 hover:underline">{String(patient.patientId)}</Link></p></td>
                <td className="px-5 py-4"><p className="flex items-center gap-2 text-slate-300"><FiPhone className="text-emerald-300" />{patient.mobileNumber ?? "-"}</p><p className="mt-1 flex items-center gap-2 text-xs text-slate-500"><FiMail />{patient.mailId ?? "-"}</p></td>
                <td className="px-5 py-4 text-slate-300">{patient.gender ?? "-"}</td>
                <td className="px-5 py-4 text-slate-400">{patient.dateOfBirth ?? "-"}</td>
                <td className="px-5 py-4 text-slate-300">
                  <p className="font-medium text-white">{patient.doctorName ?? "-"}</p>
                  <p className="mt-1 text-xs text-slate-500">ID: {patient.doctorId ?? "-"}</p>
                </td>
                {/* <td className="px-5 py-4 text-slate-300">{patient.labName ?? "-"}</td> */}
                <td className="px-5 py-4">
                  <Link
                    href={testRegistrationHref(patient)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-400/20"
                  >
                    <FiClipboard className="h-3.5 w-3.5" />
                    Register test
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedPatients.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-300">No patients match the selected filters.</p>}
      </div>
    </div>
  );
}
