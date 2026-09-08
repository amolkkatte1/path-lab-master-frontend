import Link from "next/link";
import { FiPlus } from "react-icons/fi";

import { API_ENDPOINTS, parseApiResponse } from "@/lib/api";

import type { ApiUserType } from "./role-types";
import { RolesTable } from "./roles-table";

type UserTypeApiResponse = ApiUserType[] | { data?: ApiUserType[] | ApiUserType; result?: ApiUserType[] | ApiUserType };

type RolesPageProps = {
  searchParams: Promise<{
    created?: string;
    updated?: string;
    deleted?: string;
    error?: string;
  }>;
};

function normalizeUserTypes(payload: UserTypeApiResponse | null | undefined): ApiUserType[] {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  const candidate = payload.data ?? payload.result ?? [];
  if (Array.isArray(candidate)) {
    return candidate;
  }

  if (candidate && typeof candidate === "object") {
    return [candidate as ApiUserType];
  }

  return [];
}

async function getRoles() {
  try {
    const response = await fetch(API_ENDPOINTS.userTypeList, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return { roles: [], error: `The role service returned ${response.status}.` };
    }

    const payload = await parseApiResponse<UserTypeApiResponse>(response);
    return { roles: normalizeUserTypes(payload), error: null };
  } catch {
    return {
      roles: [],
      error: "Unable to connect to the role service. Please try again.",
    };
  }
}

export default async function RolesPage({ searchParams }: RolesPageProps) {
  const { roles, error } = await getRoles();
  const { created, updated, deleted, error: actionError } = await searchParams;

  return (
    <section className="mx-auto min-w-0 max-w-7xl space-y-6">
      <header className="rounded-[20px] border border-white/10 bg-white/10 px-5 py-3 backdrop-blur sm:px-6 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-200">
              Role Directory
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Manage Roles
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-200 sm:text-base">
              Review and manage role definitions used across the application.
            </p>
          </div>

          <Link
            href="/super-admin/roles/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            <FiPlus className="h-4 w-4" />
            Add Role
          </Link>
        </div>
      </header>

      {created === "1" && (
        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
          Role created successfully.
        </div>
      )}

      {updated === "1" && (
        <div className="rounded-2xl border border-sky-300/20 bg-sky-400/10 p-4 text-sm text-sky-100">
          Role updated successfully.
        </div>
      )}

      {deleted === "1" && (
        <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          Role deleted successfully.
        </div>
      )}

      {actionError && (
        <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
          {actionError === "connection"
            ? "Unable to connect to the role service. Please try again."
            : `The role service rejected the request (status ${actionError}).`}
        </div>
      )}

      {error ? (
        <div className="rounded-[24px] border border-red-300/20 bg-red-400/10 p-5 text-sm text-red-100">
          {error}
        </div>
      ) : roles.length === 0 ? (
        <div className="rounded-[24px] border border-white/10 bg-white/8 p-8 text-center text-sm text-slate-300 backdrop-blur">
          No roles were found.
        </div>
      ) : (
        <RolesTable roles={roles} />
      )}
    </section>
  );
}
