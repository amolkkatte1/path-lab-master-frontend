import Link from "next/link";
import { notFound } from "next/navigation";

import { updateUserType } from "@/app/actions";
import { API_ENDPOINTS, parseApiResponse, stringifyApiPayload } from "@/lib/api";

import type { ApiUserType } from "../../role-types";

type GetUserTypeApiResponse =
  | ApiUserType
  | { data?: ApiUserType | null }
  | { result?: ApiUserType | null };

type EditRolePageProps = {
  params: Promise<{ userTypeId: string }>;
  searchParams: Promise<{ error?: string }>;
};

async function getRole(userTypeId: string) {
  let response: Response;

  try {
    response = await fetch(API_ENDPOINTS.getUserType, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: stringifyApiPayload({ userTypeId }, ["userTypeId"]),
      cache: "no-store",
    });
  } catch {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  const payload = await parseApiResponse<GetUserTypeApiResponse>(response);

  if (!payload || typeof payload !== "object") {
    return null;
  }

  if ("userTypeId" in payload) {
    return payload;
  }

  if ("data" in payload && payload.data) {
    return payload.data;
  }

  if ("result" in payload && payload.result) {
    return payload.result;
  }

  return null;
}

export default async function EditRolePage({ params, searchParams }: EditRolePageProps) {
  const { userTypeId } = await params;
  const { error } = await searchParams;
  const role = await getRole(userTypeId);

  if (!role) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-[20px] border border-sky-300/20 bg-white/10 px-5 py-3 backdrop-blur sm:px-6 sm:py-4">
        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.28em] text-sky-200">
          Role Management
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Edit Role
        </h2>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
          {error === "connection"
            ? "Unable to connect to the role service. Please try again."
            : `The role service rejected the request (status ${error}).`}
        </div>
      )}

      <form action={updateUserType} className="rounded-[24px] bg-white p-6 text-slate-900 shadow-[0_22px_60px_rgba(15,23,42,0.14)] sm:p-8">
        <input type="hidden" name="userTypeId" value={role.userTypeId ?? userTypeId} />
        <input type="hidden" name="createdAt" value={role.createdAt ?? ""} />
        <input type="hidden" name="createdBy" value={String(role.createdBy ?? "")} />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <label className="sm:col-span-2 lg:col-span-3">
            <span className="mb-2 block text-sm font-semibold">Role name</span>
            <input
              name="userTypeName"
              type="text"
              defaultValue={role.userTypeName ?? ""}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>
        </div>

        <button type="submit" className="mt-7 rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
          Update role
        </button>
        <Link href="/super-admin/roles" className="mt-7 ml-3 inline-block rounded-xl bg-gray-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800">
          Cancel
        </Link>
      </form>
    </section>
  );
}
