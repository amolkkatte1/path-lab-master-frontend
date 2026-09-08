"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { FiChevronDown, FiChevronUp, FiSearch } from "react-icons/fi";

import type { ApiLab } from "./lab-types";
import { DeleteLabButton } from "./delete-lab-button";

type SortKey =
  | "labId"
  | "lab"
  | "owner"
  | "email"
  | "contact"
  | "city"
  | "state";

type SortDirection = "asc" | "desc";

type LabsTableProps = {
  labs: ApiLab[];
};

type FilterState = {
  labId: string;
  lab: string;
  owner: string;
  email: string;
  contact: string;
  city: string;
  state: string;
};

const initialFilters: FilterState = {
  labId: "",
  lab: "",
  owner: "",
  email: "",
  contact: "",
  city: "",
  state: "",
};

function getFullName(lab: ApiLab) {
  return [lab.firstName, lab.lastName].filter(Boolean).join(" ") || "Unnamed owner";
}

function getLabIdCellValue(lab: ApiLab) {
  return String(lab.labId ?? "");
}

function getLabCellValue(lab: ApiLab) {
  return lab.labName ?? "";
}

function getOwnerCellValue(lab: ApiLab) {
  return getFullName(lab);
}

function getEmailCellValue(lab: ApiLab) {
  return lab.mailId ?? "";
}

function getContactCellValue(lab: ApiLab) {
  return [lab.personalMobileNumber, lab.workMobileNumber]
    .filter(Boolean)
    .join(" / ");
}

function getCityCellValue(lab: ApiLab) {
  return lab.city ?? "";
}

function getDistrictCellValue(lab: ApiLab) {
  return lab.distirct ?? lab.district ?? "";
}

function getStateCellValue(lab: ApiLab) {
  return lab.state ?? "";
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

export function LabsTable({ labs }: LabsTableProps) {
  const [filters, setFilters] = useState(initialFilters);
  const [sortKey, setSortKey] = useState<SortKey>("lab");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const deferredFilters = useDeferredValue(filters);

  const filteredLabs = labs.filter((lab) => {
    return (
      includesFilter(getLabIdCellValue(lab), deferredFilters.labId) &&
      includesFilter(getLabCellValue(lab), deferredFilters.lab) &&
      includesFilter(getOwnerCellValue(lab), deferredFilters.owner) &&
      includesFilter(getEmailCellValue(lab), deferredFilters.email) &&
      includesFilter(getContactCellValue(lab), deferredFilters.contact) &&
      includesFilter(getCityCellValue(lab), deferredFilters.city) &&
      includesFilter(getStateCellValue(lab), deferredFilters.state)
    );
  });

  const sortedLabs = [...filteredLabs].sort((left, right) => {
    const leftValue =
      sortKey === "labId"
        ? getLabIdCellValue(left)
        : sortKey === "lab"
          ? getLabCellValue(left)
          : sortKey === "owner"
            ? getOwnerCellValue(left)
            : sortKey === "email"
              ? getEmailCellValue(left)
              : sortKey === "contact"
                ? getContactCellValue(left)
                : sortKey === "city"
                  ? getCityCellValue(left)
                  : getStateCellValue(left);

    const rightValue =
      sortKey === "labId"
        ? getLabIdCellValue(right)
        : sortKey === "lab"
          ? getLabCellValue(right)
          : sortKey === "owner"
            ? getOwnerCellValue(right)
            : sortKey === "email"
              ? getEmailCellValue(right)
              : sortKey === "contact"
                ? getContactCellValue(right)
                : sortKey === "city"
                  ? getCityCellValue(right)
                  : getStateCellValue(right);

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
        <h3 className="font-semibold text-white">All Labs</h3>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-sky-400/15 px-3 py-1 text-xs font-semibold text-sky-200">
            Showing {sortedLabs.length} of {labs.length}
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

      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[1080px] xl:min-w-[1200px] text-left text-sm">
          <thead className="text-slate-400">
            <tr className="text-xs uppercase tracking-[0.16em]">
              <th className="px-5 py-4 font-semibold">
                <button type="button" onClick={() => toggleSort("labId")} className="flex items-center gap-2 text-left transition">
                  Lab ID
                  {renderSortIndicator(sortKey, sortDirection, "labId")}
                </button>
              </th>
              <th className="px-5 py-4 font-semibold">
                <button type="button" onClick={() => toggleSort("lab")} className="flex items-center gap-2 text-left transition">
                  Lab
                  {renderSortIndicator(sortKey, sortDirection, "lab")}
                </button>
              </th>
              <th className="px-5 py-4 font-semibold">
                <button type="button" onClick={() => toggleSort("owner")} className="flex items-center gap-2 text-left transition">
                  Owner
                  {renderSortIndicator(sortKey, sortDirection, "owner")}
                </button>
              </th>
              <th className="px-5 py-4 font-semibold">
                <button type="button" onClick={() => toggleSort("email")} className="flex items-center gap-2 text-left transition">
                  Email
                  {renderSortIndicator(sortKey, sortDirection, "email")}
                </button>
              </th>
              <th className="px-5 py-4 font-semibold">
                <button type="button" onClick={() => toggleSort("contact")} className="flex items-center gap-2 text-left transition">
                  Contact
                  {renderSortIndicator(sortKey, sortDirection, "contact")}
                </button>
              </th>
              <th className="px-5 py-4 font-semibold">
                <button type="button" onClick={() => toggleSort("city")} className="flex items-center gap-2 text-left transition">
                  City
                  {renderSortIndicator(sortKey, sortDirection, "city")}
                </button>
              </th>
              <th className="px-5 py-4 font-semibold">
                <button type="button" onClick={() => toggleSort("state")} className="flex items-center gap-2 text-left transition">
                  State
                  {renderSortIndicator(sortKey, sortDirection, "state")}
                </button>
              </th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Actions
              </th>
            </tr>
            <tr className="border-b border-white/10">
              <th className="px-5 pb-4">
                <label className="relative block">
                  <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    value={filters.labId}
                    onChange={(event) => updateFilter("labId", event.target.value)}
                    type="text"
                    placeholder="Search ID"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/45 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-sky-400/60"
                  />
                </label>
              </th>
              <th className="px-5 pb-4">
                <label className="relative block">
                  <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    value={filters.lab}
                    onChange={(event) => updateFilter("lab", event.target.value)}
                    type="text"
                    placeholder="Search lab"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/45 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-sky-400/60"
                  />
                </label>
              </th>
              <th className="px-5 pb-4">
                <label className="relative block">
                  <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    value={filters.owner}
                    onChange={(event) => updateFilter("owner", event.target.value)}
                    type="text"
                    placeholder="Search owner"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/45 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-sky-400/60"
                  />
                </label>
              </th>
              <th className="px-5 pb-4">
                <label className="relative block">
                  <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    value={filters.email}
                    onChange={(event) => updateFilter("email", event.target.value)}
                    type="text"
                    placeholder="Search email"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/45 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-sky-400/60"
                  />
                </label>
              </th>
              <th className="px-5 pb-4">
                <label className="relative block">
                  <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    value={filters.contact}
                    onChange={(event) => updateFilter("contact", event.target.value)}
                    type="text"
                    placeholder="Search contact"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/45 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-sky-400/60"
                  />
                </label>
              </th>
              <th className="px-5 pb-4">
                <label className="relative block">
                  <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    value={filters.city}
                    onChange={(event) => updateFilter("city", event.target.value)}
                    type="text"
                    placeholder="Search city"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/45 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-sky-400/60"
                  />
                </label>
              </th>
              <th className="px-5 pb-4">
                <label className="relative block">
                  <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    value={filters.state}
                    onChange={(event) => updateFilter("state", event.target.value)}
                    type="text"
                    placeholder="Search state"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/45 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-sky-400/60"
                  />
                </label>
              </th>
              <th className="px-5 pb-4" />
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10 text-slate-200">
            {sortedLabs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-sm text-slate-300">
                  No labs match the current search filters.
                </td>
              </tr>
            ) : (
              sortedLabs.map((lab) => (
                <tr key={lab.labId ?? `${lab.labName}-${lab.mailId}`} className="transition hover:bg-white/5">
                  <td className="px-5 py-4 align-top">
                    <Link
                      href={`/super-admin/labs/edit/${lab.labId}`}
                      className="font-semibold text-sky-200 transition hover:text-white hover:underline"
                    >
                      {lab.labId ?? "—"}
                    </Link>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="font-medium text-white">{lab.labName ?? "—"}</div>
                    <div className="mt-1 text-xs text-slate-400">{getDistrictCellValue(lab)}</div>
                  </td>
                  <td className="px-5 py-4 align-top">{getFullName(lab)}</td>
                  <td className="px-5 py-4 align-top text-sky-200">{lab.mailId ?? "—"}</td>
                  <td className="px-5 py-4 align-top">{getContactCellValue(lab) || "—"}</td>
                  <td className="px-5 py-4 align-top">{lab.city ?? "—"}</td>
                  <td className="px-5 py-4 align-top">{lab.state ?? "—"}</td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex items-center justify-center">
                      <DeleteLabButton labId={lab.labId ?? ""} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
