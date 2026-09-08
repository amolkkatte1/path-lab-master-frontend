import Link from "next/link";
import { FiPlus } from "react-icons/fi";

import { API_ENDPOINTS, parseApiResponse } from "@/lib/api";

import { FlashMessage } from "./flash-message";
import type { ApiLab } from "./lab-types";
import { LabsTable } from "./labs-table";

type LabsApiResponse =
  | ApiLab[]
  | { data?: ApiLab[] | ApiLab; result?: ApiLab[] | ApiLab; labs?: ApiLab[] | ApiLab; labList?: ApiLab[] | ApiLab; items?: ApiLab[] | ApiLab };

type LabsPageProps = {
  searchParams: Promise<{
    created?: string;
    updated?: string;
    deleted?: string;
    error?: string;
  }>;
};

function normalizeLabsPayload(payload: LabsApiResponse | null | undefined): ApiLab[] {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  const candidate =
    payload.data ??
    payload.result ??
    payload.labs ??
    payload.labList ??
    payload.items ??
    [];

  if (Array.isArray(candidate)) {
    return candidate;
  }

  if (candidate && typeof candidate === "object") {
    return [candidate as ApiLab];
  }

  return [];
}

async function getLabs() {
  try {
    const response = await fetch(API_ENDPOINTS.labs, {
      cache: "no-store",
    });

    if (!response.ok) {
      return { labs: [], error: `The lab service returned ${response.status}.` };
    }

    const payload = await parseApiResponse<LabsApiResponse>(response);
    const labs = normalizeLabsPayload(payload);

    return { labs, error: null };
  } catch {
    return {
      labs: [],
      error: "Unable to connect to the lab service. Please try again.",
    };
  }
}

export default async function LabsPage({ searchParams }: LabsPageProps) {
  const { labs, error } = await getLabs();
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
              Lab Directory
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Manage Labs
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-200 sm:text-base">
              Review and manage all laboratory profiles linked to the platform.
            </p>
          </div>

          <Link
            href="/super-admin/labs/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            <FiPlus className="h-4 w-4" />
            Add Lab
          </Link>
        </div>
      </header>

      {created === "1" && (
        <FlashMessage
          clearKey="created"
          message="Lab created successfully."
          searchParams={messageSearchParams}
          tone="success"
        />
      )}

      {updated === "1" && (
        <FlashMessage
          clearKey="updated"
          message="Lab updated successfully."
          searchParams={messageSearchParams}
          tone="info"
        />
      )}

      {deleted === "1" && (
        <FlashMessage
          clearKey="deleted"
          message="Lab deleted successfully."
          searchParams={messageSearchParams}
          tone="warning"
        />
      )}

      {actionError && (
        <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
          {actionError === "connection"
            ? "Unable to connect to the lab service. Please try again."
            : `The lab service rejected the request (status ${actionError}).`}
        </div>
      )}

      {error ? (
        <div className="rounded-[24px] border border-red-300/20 bg-red-400/10 p-5 text-sm text-red-100">
          {error}
        </div>
      ) : labs.length === 0 ? (
        <div className="rounded-[24px] border border-white/10 bg-white/8 p-8 text-center text-sm text-slate-300 backdrop-blur">
          No labs were found.
        </div>
      ) : (
        <LabsTable labs={labs} />
      )}
    </section>
  );
}
