import Link from "next/link";
import { FiPlus } from "react-icons/fi";

import { API_ENDPOINTS, parseApiResponse } from "@/lib/api";

import { ParametersTable } from "./parameters-table";
import type { ApiParameter } from "./parameter-types";

type ParameterApiResponse =
  | ApiParameter[]
  | { data?: ApiParameter[] | ApiParameter; result?: ApiParameter[] | ApiParameter; parameters?: ApiParameter[] | ApiParameter; parameterList?: ApiParameter[] | ApiParameter; items?: ApiParameter[] | ApiParameter };

function normalizeParametersPayload(payload: ParameterApiResponse | null | undefined): ApiParameter[] {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  const candidate =
    payload.data ??
    payload.result ??
    payload.parameters ??
    payload.parameterList ??
    payload.items ??
    [];

  if (Array.isArray(candidate)) {
    return candidate;
  }

  if (candidate && typeof candidate === "object") {
    return [candidate as ApiParameter];
  }

  return [];
}

async function getParameters() {
  try {
    const response = await fetch(API_ENDPOINTS.parameterList, {
      cache: "no-store",
    });

    if (!response.ok) {
      return { parameters: [], error: `The parameter service returned ${response.status}.` };
    }

    const payload = await parseApiResponse<ParameterApiResponse>(response);
    return { parameters: normalizeParametersPayload(payload), error: null };
  } catch {
    return {
      parameters: [],
      error: "Unable to connect to the parameter service. Please try again.",
    };
  }
}

export default async function ParameterPage() {
  const { parameters, error } = await getParameters();

  return (
    <section className="mx-auto min-w-0 max-w-7xl space-y-6">
      <header className="rounded-[20px] border border-white/10 bg-white/10 px-5 py-3 backdrop-blur sm:px-6 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-200">
              Test Parameters
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Manage Test Parameters
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-200 sm:text-base">
              Review and filter lab test parameter definitions for reporting and diagnostics.
            </p>
          </div>

          <Link
            href="/super-admin/parameter/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            <FiPlus className="h-4 w-4" />
            Add Parameter
          </Link>
        </div>
      </header>

      {error ? (
        <div className="rounded-[24px] border border-red-300/20 bg-red-400/10 p-5 text-sm text-red-100">
          {error}
        </div>
      ) : parameters.length === 0 ? (
        <div className="rounded-[24px] border border-white/10 bg-white/8 p-8 text-center text-sm text-slate-300 backdrop-blur">
          No parameters were found.
        </div>
      ) : (
        <ParametersTable parameters={parameters} />
      )}
    </section>
  );
}
