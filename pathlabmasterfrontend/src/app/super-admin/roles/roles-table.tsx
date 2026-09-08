"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { FiChevronDown, FiChevronUp, FiSearch, FiTrash2 } from "react-icons/fi";

import { deleteUserType } from "@/app/actions";

import type { ApiUserType } from "./role-types";

type SortKey = "userTypeId" | "userTypeName" | "createdBy" | "updatedBy";
type SortDirection = "asc" | "desc";

type RolesTableProps = {
  roles: ApiUserType[];
};

type FilterState = {
  userTypeId: string;
  userTypeName: string;
  createdBy: string;
  updatedBy: string;
};

const initialFilters: FilterState = {
  userTypeId: "",
  userTypeName: "",
  createdBy: "",
  updatedBy: "",
};

function getIdValue(role: ApiUserType) {
  return String(role.userTypeId ?? "");
}

function getNameValue(role: ApiUserType) {
  return role.userTypeName ?? "";
}

function getCreatedByValue(role: ApiUserType) {
  return String(role.createdBy ?? "");
}

function getUpdatedByValue(role: ApiUserType) {
  return String(role.updatedBy ?? "");
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

function DeleteRoleButton({ userTypeId }: { userTypeId: number | string }) {
  return (
    <form
      action={deleteUserType}
      onSubmit={(event) => {
        if (!window.confirm("Are you sure you want to delete this role?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="userTypeId" value={userTypeId} />
      <button
        type="submit"
        aria-label={`Delete role ${userTypeId}`}
        title="Delete role"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-300/20 bg-red-400/10 text-red-500/60 transition hover:bg-red-400/20"
      >
        <FiTrash2 className="h-4 w-4" />
      </button>
    </form>
  );
}

export function RolesTable({ roles }: RolesTableProps) {
  const [filters, setFilters] = useState(initialFilters);
  const [sortKey, setSortKey] = useState<SortKey>("userTypeId");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const deferredFilters = useDeferredValue(filters);

  const filteredRoles = roles.filter((role) => {
    return (
      includesFilter(getIdValue(role), deferredFilters.userTypeId) &&
      includesFilter(getNameValue(role), deferredFilters.userTypeName) &&
      includesFilter(getCreatedByValue(role), deferredFilters.createdBy) &&
      includesFilter(getUpdatedByValue(role), deferredFilters.updatedBy)
    );
  });

  const sortedRoles = [...filteredRoles].sort((left, right) => {
    const leftValue =
      sortKey === "userTypeId"
        ? getIdValue(left)
        : sortKey === "userTypeName"
          ? getNameValue(left)
          : sortKey === "createdBy"
            ? getCreatedByValue(left)
            : getUpdatedByValue(left);

    const rightValue =
      sortKey === "userTypeId"
        ? getIdValue(right)
        : sortKey === "userTypeName"
          ? getNameValue(right)
          : sortKey === "createdBy"
            ? getCreatedByValue(right)
            : getUpdatedByValue(right);

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
        <h3 className="font-semibold text-white">All Roles</h3>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-sky-400/15 px-3 py-1 text-xs font-semibold text-sky-200">
            Showing {sortedRoles.length} of {roles.length}
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
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-slate-400">
            <tr className="text-xs uppercase tracking-[0.16em]">
              <th className="px-5 py-4 font-semibold">
                <button type="button" onClick={() => toggleSort("userTypeId")} className="flex items-center gap-2 text-left transition">
                  Role ID
                  {renderSortIndicator(sortKey, sortDirection, "userTypeId")}
                </button>
              </th>
              <th className="px-5 py-4 font-semibold">
                <button type="button" onClick={() => toggleSort("userTypeName")} className="flex items-center gap-2 text-left transition">
                  Role Name
                  {renderSortIndicator(sortKey, sortDirection, "userTypeName")}
                </button>
              </th>
              <th className="px-5 py-4 font-semibold">
                <button type="button" onClick={() => toggleSort("createdBy")} className="flex items-center gap-2 text-left transition">
                  Created By
                  {renderSortIndicator(sortKey, sortDirection, "createdBy")}
                </button>
              </th>
              <th className="px-5 py-4 font-semibold">
                <button type="button" onClick={() => toggleSort("updatedBy")} className="flex items-center gap-2 text-left transition">
                  Updated By
                  {renderSortIndicator(sortKey, sortDirection, "updatedBy")}
                </button>
              </th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Actions
              </th>
            </tr>
            <tr className="border-y border-white/10 bg-slate-900/30">
              <th className="px-5 py-3 text-left font-medium text-slate-300">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
                  <FiSearch className="h-3.5 w-3.5 text-slate-400" />
                  <input
                    value={filters.userTypeId}
                    onChange={(event) => updateFilter("userTypeId", event.target.value)}
                    placeholder="Filter ID"
                    className="w-full bg-transparent text-xs text-white placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </th>
              <th className="px-5 py-3 text-left font-medium text-slate-300">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
                  <FiSearch className="h-3.5 w-3.5 text-slate-400" />
                  <input
                    value={filters.userTypeName}
                    onChange={(event) => updateFilter("userTypeName", event.target.value)}
                    placeholder="Filter role"
                    className="w-full bg-transparent text-xs text-white placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </th>
              <th className="px-5 py-3 text-left font-medium text-slate-300">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
                  <FiSearch className="h-3.5 w-3.5 text-slate-400" />
                  <input
                    value={filters.createdBy}
                    onChange={(event) => updateFilter("createdBy", event.target.value)}
                    placeholder="Filter creator"
                    className="w-full bg-transparent text-xs text-white placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </th>
              <th className="px-5 py-3 text-left font-medium text-slate-300">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
                  <FiSearch className="h-3.5 w-3.5 text-slate-400" />
                  <input
                    value={filters.updatedBy}
                    onChange={(event) => updateFilter("updatedBy", event.target.value)}
                    placeholder="Filter updater"
                    className="w-full bg-transparent text-xs text-white placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </th>
              <th className="px-5 py-3 text-right font-medium text-slate-300"> </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {sortedRoles.map((role) => (
              <tr key={String(role.userTypeId ?? role.userTypeName ?? "role")} className="border-t border-white/10 transition hover:bg-white/5">
                <td className="px-5 py-4">
                  <Link
                    href={`/super-admin/roles/edit/${role.userTypeId ?? ""}`}
                    className="font-semibold text-sky-200 transition hover:text-white hover:underline"
                  >
                    {role.userTypeId ?? "—"}
                  </Link>
                </td>
                <td className="px-5 py-4 text-slate-200">{role.userTypeName ?? "—"}</td>
                <td className="px-5 py-4 text-slate-200">{role.createdBy ?? "—"}</td>
                <td className="px-5 py-4 text-slate-200">{role.updatedBy ?? "—"}</td>
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end">
                    <DeleteRoleButton userTypeId={role.userTypeId ?? ""} />
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
