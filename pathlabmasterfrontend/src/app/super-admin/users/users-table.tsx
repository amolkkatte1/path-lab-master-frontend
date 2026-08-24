"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { FiChevronDown, FiChevronUp, FiSearch } from "react-icons/fi";

import type { ApiUser } from "./user-types";
import { DeleteUserButton } from "./delete-user-button";

type SortKey =
  | "userId"
  | "user"
  | "role"
  | "email"
  | "lab"
  | "contact"
  | "location";

type SortDirection = "asc" | "desc";

type UsersTableProps = {
  users: ApiUser[];
};

type FilterState = {
  userId: string;
  user: string;
  role: string;
  email: string;
  lab: string;
  contact: string;
  location: string;
};

const initialFilters: FilterState = {
  userId: "",
  user: "",
  role: "",
  email: "",
  lab: "",
  contact: "",
  location: "",
};

function getFullName(user: ApiUser) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unnamed user";
}

function getUserIdCellValue(user: ApiUser) {
  return String(user.userId ?? "");
}

function getUserCellValue(user: ApiUser) {
  return `${getFullName(user)} ${user.userName ?? ""}`.trim();
}

function getRoleCellValue(user: ApiUser) {
  return user.userTypeName ?? "";
}

function getEmailCellValue(user: ApiUser) {
  return user.mailId ?? "";
}

function getLabCellValue(user: ApiUser) {
  return user.labName ?? "";
}

function getContactCellValue(user: ApiUser) {
  return String(user.personalMobileNumber ?? "");
}

function getLocationCellValue(user: ApiUser) {
  return [user.city, user.state].filter(Boolean).join(", ");
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

export function UsersTable({ users }: UsersTableProps) {
  const [filters, setFilters] = useState(initialFilters);
  const [sortKey, setSortKey] = useState<SortKey>("user");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const deferredFilters = useDeferredValue(filters);

  const filteredUsers = users.filter((user) => {
    return (
      includesFilter(getUserCellValue(user), deferredFilters.user) &&
      includesFilter(getUserIdCellValue(user), deferredFilters.userId) &&
      includesFilter(getRoleCellValue(user), deferredFilters.role) &&
      includesFilter(getEmailCellValue(user), deferredFilters.email) &&
      includesFilter(getLabCellValue(user), deferredFilters.lab) &&
      includesFilter(getContactCellValue(user), deferredFilters.contact) &&
      includesFilter(getLocationCellValue(user), deferredFilters.location)
    );
  });

  const sortedUsers = [...filteredUsers].sort((left, right) => {
    const leftValue =
      sortKey === "userId"
        ? getUserIdCellValue(left)
        : sortKey === "user"
        ? getUserCellValue(left)
        : sortKey === "role"
          ? getRoleCellValue(left)
          : sortKey === "email"
            ? getEmailCellValue(left)
            : sortKey === "lab"
              ? getLabCellValue(left)
              : sortKey === "contact"
                ? getContactCellValue(left)
                : getLocationCellValue(left);

    const rightValue =
      sortKey === "userId"
        ? getUserIdCellValue(right)
        : sortKey === "user"
        ? getUserCellValue(right)
        : sortKey === "role"
          ? getRoleCellValue(right)
          : sortKey === "email"
            ? getEmailCellValue(right)
            : sortKey === "lab"
              ? getLabCellValue(right)
              : sortKey === "contact"
                ? getContactCellValue(right)
                : getLocationCellValue(right);

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
        <h3 className="font-semibold text-white">All Users</h3>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-sky-400/15 px-3 py-1 text-xs font-semibold text-sky-200">
            Showing {sortedUsers.length} of {users.length}
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
          <thead className="bg-slate-950/30 text-slate-400">
            <tr className="text-xs uppercase tracking-[0.16em]">
              <th className="px-5 py-4 font-semibold">
                <button
                  type="button"
                  onClick={() => toggleSort("userId")}
                  className="flex items-center gap-2 text-left transition hover:text-white"
                >
                  User ID
                  {renderSortIndicator(sortKey, sortDirection, "userId")}
                </button>
              </th>
              <th className="px-5 py-4 font-semibold">
                <button
                  type="button"
                  onClick={() => toggleSort("user")}
                  className="flex items-center gap-2 text-left transition hover:text-white"
                >
                  User
                  {renderSortIndicator(sortKey, sortDirection, "user")}
                </button>
              </th>
              <th className="px-5 py-4 font-semibold">
                <button
                  type="button"
                  onClick={() => toggleSort("role")}
                  className="flex items-center gap-2 text-left transition hover:text-white"
                >
                  Role
                  {renderSortIndicator(sortKey, sortDirection, "role")}
                </button>
              </th>
              <th className="px-5 py-4 font-semibold">
                <button
                  type="button"
                  onClick={() => toggleSort("email")}
                  className="flex items-center gap-2 text-left transition hover:text-white"
                >
                  Email
                  {renderSortIndicator(sortKey, sortDirection, "email")}
                </button>
              </th>
              <th className="px-5 py-4 font-semibold">
                <button
                  type="button"
                  onClick={() => toggleSort("lab")}
                  className="flex items-center gap-2 text-left transition hover:text-white"
                >
                  Lab
                  {renderSortIndicator(sortKey, sortDirection, "lab")}
                </button>
              </th>
              <th className="px-5 py-4 font-semibold">
                <button
                  type="button"
                  onClick={() => toggleSort("contact")}
                  className="flex items-center gap-2 text-left transition hover:text-white"
                >
                  Contact
                  {renderSortIndicator(sortKey, sortDirection, "contact")}
                </button>
              </th>
              <th className="px-5 py-4 font-semibold">
                <button
                  type="button"
                  onClick={() => toggleSort("location")}
                  className="flex items-center gap-2 text-left transition hover:text-white"
                >
                  Location
                  {renderSortIndicator(sortKey, sortDirection, "location")}
                </button>
              </th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Actions
              </th>
            </tr>
            <tr className="border-t border-white/10">
              <th className="px-5 pb-4">
                <label className="relative block">
                  <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    value={filters.userId}
                    onChange={(event) => updateFilter("userId", event.target.value)}
                    placeholder="Search ID"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/45 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-sky-400/60"
                  />
                </label>
              </th>
              <th className="px-5 pb-4">
                <label className="relative block">
                  <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    value={filters.user}
                    onChange={(event) => updateFilter("user", event.target.value)}
                    placeholder="Search user"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/45 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-sky-400/60"
                  />
                </label>
              </th>
              <th className="px-5 pb-4">
                <label className="relative block">
                  <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    value={filters.role}
                    onChange={(event) => updateFilter("role", event.target.value)}
                    placeholder="Search role"
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
                    placeholder="Search email"
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
                    placeholder="Search lab"
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
                    placeholder="Search contact"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/45 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-sky-400/60"
                  />
                </label>
              </th>
              <th className="px-5 pb-4">
                <label className="relative block">
                  <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    value={filters.location}
                    onChange={(event) => updateFilter("location", event.target.value)}
                    placeholder="Search location"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/45 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-sky-400/60"
                  />
                </label>
              </th>
              <th className="px-5 pb-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-slate-200">
            {sortedUsers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-sm text-slate-300">
                  No users match the current search filters.
                </td>
              </tr>
            ) : (
              sortedUsers.map((user) => (
                <tr key={user.userId} className="transition hover:bg-white/5">
                  <td className="px-5 py-4">
                    <Link
                      href={`/super-admin/users/edit/${user.userId}`}
                      className="font-semibold text-sky-200 transition hover:text-white hover:underline"
                    >
                      {user.userId}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-white">{getFullName(user)}</p>
                    <p className="mt-1 text-xs text-slate-400">@{user.userName ?? "-"}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                      {user.userTypeName ?? "-"}
                    </span>
                  </td>
                  <td className="px-5 py-4">{user.mailId ?? "-"}</td>
                  <td className="px-5 py-4">{user.labName ?? "-"}</td>
                  <td className="px-5 py-4">{user.personalMobileNumber ?? "-"}</td>
                  <td className="px-5 py-4">{getLocationCellValue(user) || "-"}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center">
                    <DeleteUserButton userId={user.userId} />
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
