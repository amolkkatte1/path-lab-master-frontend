"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { FiChevronDown, FiChevronUp, FiSearch } from "react-icons/fi";

import { DeleteParameterButton } from "./delete-parameter-button";
import type { ApiParameter } from "./parameter-types";

type SortKey =
  | "parameterId"
  | "parameterName"
  | "code"
  | "dataType"
  | "unit"
  | "criteria"
  | "sequence";

type SortDirection = "asc" | "desc";

type ParametersTableProps = {
  parameters: ApiParameter[];
};

type FilterState = {
  parameterId: string;
  parameterName: string;
  code: string;
  dataType: string;
  unit: string;
  criteria: string;
  sequence: string;
};

const initialFilters: FilterState = {
  parameterId: "",
  parameterName: "",
  code: "",
  dataType: "",
  unit: "",
  criteria: "",
  sequence: "",
};

function getIdValue(parameter: ApiParameter) {
  return String(parameter.parameterId ?? "");
}

function getNameValue(parameter: ApiParameter) {
  return parameter.parameterName ?? "";
}

function getCodeValue(parameter: ApiParameter) {
  return parameter.code ?? "";
}

function getDataTypeValue(parameter: ApiParameter) {
  return parameter.dataType ?? "";
}

function getUnitValue(parameter: ApiParameter) {
  return parameter.unit ?? "";
}

function getCriteriaValue(parameter: ApiParameter) {
  return parameter.criteria ?? "";
}

function getSequenceValue(parameter: ApiParameter) {
  return String(parameter.sequence ?? "");
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

export function ParametersTable({ parameters }: ParametersTableProps) {
  const [filters, setFilters] = useState(initialFilters);
  const [sortKey, setSortKey] = useState<SortKey>("parameterName");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const deferredFilters = useDeferredValue(filters);

  const filteredParameters = parameters.filter((parameter) => {
    return (
      includesFilter(getIdValue(parameter), deferredFilters.parameterId) &&
      includesFilter(getNameValue(parameter), deferredFilters.parameterName) &&
      includesFilter(getCodeValue(parameter), deferredFilters.code) &&
      includesFilter(getDataTypeValue(parameter), deferredFilters.dataType) &&
      includesFilter(getUnitValue(parameter), deferredFilters.unit) &&
      includesFilter(getCriteriaValue(parameter), deferredFilters.criteria) &&
      includesFilter(getSequenceValue(parameter), deferredFilters.sequence)
    );
  });

  const sortedParameters = [...filteredParameters].sort((left, right) => {
    const leftValue =
      sortKey === "parameterId"
        ? getIdValue(left)
        : sortKey === "parameterName"
          ? getNameValue(left)
          : sortKey === "code"
            ? getCodeValue(left)
            : sortKey === "dataType"
              ? getDataTypeValue(left)
              : sortKey === "unit"
                ? getUnitValue(left)
                : sortKey === "criteria"
                  ? getCriteriaValue(left)
                  : getSequenceValue(left);

    const rightValue =
      sortKey === "parameterId"
        ? getIdValue(right)
        : sortKey === "parameterName"
          ? getNameValue(right)
          : sortKey === "code"
            ? getCodeValue(right)
            : sortKey === "dataType"
              ? getDataTypeValue(right)
              : sortKey === "unit"
                ? getUnitValue(right)
                : sortKey === "criteria"
                  ? getCriteriaValue(right)
                  : getSequenceValue(right);

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
        <h3 className="font-semibold text-white">All Test Parameters</h3>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-sky-400/15 px-3 py-1 text-xs font-semibold text-sky-200">
            Showing {sortedParameters.length} of {parameters.length}
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
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="text-slate-400">
            <tr className="text-xs uppercase tracking-[0.16em]">
              <th className="px-5 py-4 font-semibold">
                <button type="button" onClick={() => toggleSort("parameterId")} className="flex items-center gap-2 text-left transition">
                  Parameter ID
                  {renderSortIndicator(sortKey, sortDirection, "parameterId")}
                </button>
              </th>
              <th className="px-5 py-4 font-semibold">
                <button type="button" onClick={() => toggleSort("parameterName")} className="flex items-center gap-2 text-left transition">
                  Name
                  {renderSortIndicator(sortKey, sortDirection, "parameterName")}
                </button>
              </th>
              <th className="px-5 py-4 font-semibold">
                <button type="button" onClick={() => toggleSort("code")} className="flex items-center gap-2 text-left transition">
                  Code
                  {renderSortIndicator(sortKey, sortDirection, "code")}
                </button>
              </th>
              <th className="px-5 py-4 font-semibold">
                <button type="button" onClick={() => toggleSort("dataType")} className="flex items-center gap-2 text-left transition">
                  Data Type
                  {renderSortIndicator(sortKey, sortDirection, "dataType")}
                </button>
              </th>
              <th className="px-5 py-4 font-semibold">
                <button type="button" onClick={() => toggleSort("unit")} className="flex items-center gap-2 text-left transition">
                  Unit
                  {renderSortIndicator(sortKey, sortDirection, "unit")}
                </button>
              </th>
              <th className="px-5 py-4 font-semibold">
                <button type="button" onClick={() => toggleSort("criteria")} className="flex items-center gap-2 text-left transition">
                  Criteria
                  {renderSortIndicator(sortKey, sortDirection, "criteria")}
                </button>
              </th>
              <th className="px-5 py-4 font-semibold">
                <button type="button" onClick={() => toggleSort("sequence")} className="flex items-center gap-2 text-left transition">
                  Sequence
                  {renderSortIndicator(sortKey, sortDirection, "sequence")}
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
                    value={filters.parameterId}
                    onChange={(event) => updateFilter("parameterId", event.target.value)}
                    placeholder="Search ID"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/45 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-sky-400/60"
                  />
                </label>
              </th>
              <th className="px-5 pb-4">
                <label className="relative block">
                  <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    value={filters.parameterName}
                    onChange={(event) => updateFilter("parameterName", event.target.value)}
                    placeholder="Search name"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/45 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-sky-400/60"
                  />
                </label>
              </th>
              <th className="px-5 pb-4">
                <label className="relative block">
                  <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    value={filters.code}
                    onChange={(event) => updateFilter("code", event.target.value)}
                    placeholder="Search code"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/45 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-sky-400/60"
                  />
                </label>
              </th>
              <th className="px-5 pb-4">
                <label className="relative block">
                  <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    value={filters.dataType}
                    onChange={(event) => updateFilter("dataType", event.target.value)}
                    placeholder="Search type"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/45 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-sky-400/60"
                  />
                </label>
              </th>
              <th className="px-5 pb-4">
                <label className="relative block">
                  <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    value={filters.unit}
                    onChange={(event) => updateFilter("unit", event.target.value)}
                    placeholder="Search unit"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/45 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-sky-400/60"
                  />
                </label>
              </th>
              <th className="px-5 pb-4">
                <label className="relative block">
                  <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    value={filters.criteria}
                    onChange={(event) => updateFilter("criteria", event.target.value)}
                    placeholder="Search criteria"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/45 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-slate-500 focus:border-sky-400/60"
                  />
                </label>
              </th>
              <th className="px-5 pb-4">
                <label className="relative block">
                  <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    value={filters.sequence}
                    onChange={(event) => updateFilter("sequence", event.target.value)}
                    placeholder="Search seq"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/45 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-sky-400/60"
                  />
                </label>
              </th>
              <th className="px-5 pb-4" />
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10 text-slate-200">
            {sortedParameters.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-sm text-slate-300">
                  No parameters match the current search filters.
                </td>
              </tr>
            ) : (
              sortedParameters.map((parameter) => (
                <tr key={parameter.parameterId ?? `${parameter.parameterName}-${parameter.code}`} className="transition hover:bg-white/5">
                  <td className="px-5 py-4 align-top">
                    <Link
                      href={`/super-admin/parameter/edit/${parameter.parameterId}`}
                      className="font-semibold text-sky-200 transition hover:text-white hover:underline"
                    >
                      {parameter.parameterId ?? "—"}
                    </Link>
                  </td>
                  <td className="px-5 py-4 align-top text-white">{parameter.parameterName ?? "—"}</td>
                  <td className="px-5 py-4 align-top">{parameter.code ?? "—"}</td>
                  <td className="px-5 py-4 align-top">{parameter.dataType ?? "—"}</td>
                  <td className="px-5 py-4 align-top">{parameter.unit ?? "—"}</td>
                  <td className="px-5 py-4 align-top">{parameter.criteria ?? "—"}</td>
                  <td className="px-5 py-4 align-top">{parameter.sequence ?? "—"}</td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex items-center justify-center">
                      <DeleteParameterButton parameterId={parameter.parameterId ?? ""} />
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
