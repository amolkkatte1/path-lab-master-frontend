import Link from "next/link";
import { FiPlus } from "react-icons/fi";

import { API_ENDPOINTS, parseApiResponse } from "@/lib/api";

import { FlashMessage } from "./flash-message";
import type { ApiUser } from "./user-types";
import { UsersTable } from "./users-table";

type UsersApiResponse = ApiUser[] | { data?: ApiUser[] };

type UsersPageProps = {
  searchParams: Promise<{
    created?: string;
    updated?: string;
    deleted?: string;
    error?: string;
  }>;
};

async function getUsers() {
  try {
    const response = await fetch(API_ENDPOINTS.users, {
      cache: "no-store",
    });

    if (!response.ok) {
      return { users: [], error: `The user service returned ${response.status}.` };
    }

    const payload = await parseApiResponse<UsersApiResponse>(response);
    const users = Array.isArray(payload) ? payload : payload.data ?? [];

    return { users, error: null };
  } catch {
    return {
      users: [],
      error: "Unable to connect to the user service. Please try again.",
    };
  }
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const { users, error } = await getUsers();
  const { created, updated, deleted, error: actionError } = await searchParams;
  const messageSearchParams = {
    created,
    updated,
    deleted,
    error: actionError,
  };

  return (
    <section className="mx-auto min-w-0 max-w-7xl space-y-6">
      <header className="rounded-[20px] border border-white/10 bg-white/10 px-5 py-3 backdrop-blur sm:px-6 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-200">
              User Directory
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Manage Users
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-200 sm:text-base">
              Review the users registered across Path Lab and their assigned roles.
            </p>
          </div>

          <Link
            href="/super-admin/users/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            <FiPlus className="h-4 w-4" />
            Add User
          </Link>
        </div>
      </header>

      {created === "1" && (
        <FlashMessage
          clearKey="created"
          message="User created successfully."
          searchParams={messageSearchParams}
          tone="success"
        />
      )}

      {updated === "1" && (
        <FlashMessage
          clearKey="updated"
          message="User updated successfully."
          searchParams={messageSearchParams}
          tone="info"
        />
      )}

      {deleted === "1" && (
        <FlashMessage
          clearKey="deleted"
          message="User deleted successfully."
          searchParams={messageSearchParams}
          tone="warning"
        />
      )}

      {actionError && (
        <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
          {actionError === "connection"
            ? "Unable to connect to the user service. Please try again."
            : `The user service rejected the request (status ${actionError}).`}
        </div>
      )}

      {error ? (
        <div className="rounded-[24px] border border-red-300/20 bg-red-400/10 p-5 text-sm text-red-100">
          {error}
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-[24px] border border-white/10 bg-white/8 p-8 text-center text-sm text-slate-300 backdrop-blur">
          No users were found.
        </div>
      ) : (
        <UsersTable users={users} />
      )}
    </section>
  );
}
