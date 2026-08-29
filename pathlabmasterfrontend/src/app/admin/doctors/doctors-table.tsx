"use client";

import { useDeferredValue, useState } from "react";
import Link from "next/link";
import { FiChevronDown, FiChevronUp, FiMail, FiPhone, FiSearch } from "react-icons/fi";

import { DeleteDoctorButton } from "./delete-doctor-button";

export type Doctor = {
  doctorId: number | string;
  doctorName?: string;
  doctorMailId?: string;
  doctorMobileNumber?: number | string;
  shairingPercentage?: number | string;
  labName?: string;
  educationQulification?: string;
};

type SortKey = "doctor" | "contact" | "qualification" | "sharing" | "lab";
type SortDirection = "asc" | "desc";

type DoctorsTableProps = {
  doctors: Doctor[];
};

const filterKeys: SortKey[] = ["doctor", "contact", "qualification", "sharing", "lab"];
const initialFilters: Record<SortKey, string> = {
  doctor: "",
  contact: "",
  qualification: "",
  sharing: "",
  lab: "",
};

function cellValue(doctor: Doctor, key: SortKey) {
  if (key === "doctor") return `${doctor.doctorName ?? ""} ${doctor.doctorId}`;
  if (key === "contact") return `${doctor.doctorMobileNumber ?? ""} ${doctor.doctorMailId ?? ""}`;
  if (key === "qualification") return doctor.educationQulification ?? "";
  if (key === "sharing") return String(doctor.shairingPercentage ?? "");
  return doctor.labName ?? "";
}

function sortIndicator(activeKey: SortKey, direction: SortDirection, key: SortKey) {
  if (activeKey !== key) return <FiChevronDown className="h-3.5 w-3.5 opacity-40" />;
  return direction === "asc" ? <FiChevronUp className="h-3.5 w-3.5" /> : <FiChevronDown className="h-3.5 w-3.5" />;
}

export function DoctorsTable({ doctors }: Readonly<DoctorsTableProps>) {
  const [filters, setFilters] = useState(initialFilters);
  const [sortKey, setSortKey] = useState<SortKey>("doctor");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const deferredFilters = useDeferredValue(filters);

  const filteredDoctors = doctors.filter((doctor) =>
    filterKeys.every((key) => cellValue(doctor, key).toLowerCase().includes(deferredFilters[key].trim().toLowerCase())),
  );

  const sortedDoctors = [...filteredDoctors].sort((left, right) => {
    const comparison = cellValue(left, sortKey).localeCompare(cellValue(right, sortKey), undefined, { numeric: true, sensitivity: "base" });
    return sortDirection === "asc" ? comparison : comparison * -1;
  });

  function updateFilter(key: SortKey, value: string) {
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
        <h2 className="font-semibold text-white">All doctors</h2>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">Showing {sortedDoctors.length} of {doctors.length}</span>
          <button type="button" onClick={() => setFilters(initialFilters)} className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:bg-white/10">Clear filters</button>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[1180px] text-left text-sm">
          <thead className="text-slate-400">
            <tr className="text-xs uppercase tracking-[0.16em]">
              {([
                ["doctor", "Doctor"],
                ["contact", "Contact"],
                ["qualification", "Qualification"],
                ["sharing", "Sharing %"],
                ["lab", "Laboratory"],
              ] as const).map(([key, label]) => (
                <th key={key} className="px-5 py-3 font-semibold">
                  <button type="button" onClick={() => toggleSort(key)} className="flex items-center gap-2 text-left transition hover:text-white">{label}{sortIndicator(sortKey, sortDirection, key)}</button>
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
            {sortedDoctors.map((doctor) => (
              <tr key={String(doctor.doctorId)} className="doctor-table-row transition hover:bg-white/5">
                <td className="px-5 py-4"><Link href={`/admin/doctors/edit/${doctor.doctorId}`} className="font-semibold text-white transition hover:text-emerald-200 hover:underline">{doctor.doctorName ?? "-"}</Link><p className="mt-1 text-xs text-slate-500">ID: <Link href={`/admin/doctors/edit/${doctor.doctorId}`} className="transition hover:text-emerald-300 hover:underline">{String(doctor.doctorId)}</Link></p></td>
                <td className="px-5 py-4"><p className="flex items-center gap-2 text-slate-300"><FiPhone className="text-emerald-300" />{doctor.doctorMobileNumber ?? "-"}</p><p className="mt-1 flex items-center gap-2 text-xs text-slate-500"><FiMail />{doctor.doctorMailId ?? "-"}</p></td>
                <td className="px-5 py-4 text-slate-300">{doctor.educationQulification ?? "-"}</td>
                <td className="px-5 py-4 text-slate-300">{doctor.shairingPercentage ?? "-"}%</td>
                <td className="px-5 py-4 text-slate-300">{doctor.labName ?? "-"}</td>
                <td className="px-5 py-4"><DeleteDoctorButton doctorId={doctor.doctorId} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedDoctors.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-300">No doctors match the selected filters.</p>}
      </div>
    </div>
  );
}
