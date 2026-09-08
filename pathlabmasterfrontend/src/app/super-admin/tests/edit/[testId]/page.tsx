import Link from "next/link";
import { notFound } from "next/navigation";

import { updateTest } from "@/app/actions";
import { API_ENDPOINTS, parseApiResponse, stringifyApiPayload } from "@/lib/api";

import type { ApiTest } from "../../test-types";

type GetTestApiResponse = ApiTest | { data?: ApiTest | null } | { result?: ApiTest | null };

type EditTestPageProps = {
  params: Promise<{ testId: string }>;
  searchParams: Promise<{ error?: string }>;
};

async function getTest(testId: string) {
  let response: Response;

  try {
    response = await fetch(API_ENDPOINTS.getTest, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: stringifyApiPayload({ testId }, ["testId"]),
      cache: "no-store",
    });
  } catch {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  const payload = await parseApiResponse<GetTestApiResponse>(response);

  if (!payload || typeof payload !== "object") {
    return null;
  }

  if ("testId" in payload) {
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

export default async function EditTestPage({ params, searchParams }: EditTestPageProps) {
  const { testId } = await params;
  const { error } = await searchParams;
  const test = await getTest(testId);

  if (!test) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-[20px] border border-sky-300/20 bg-white/10 px-5 py-3 backdrop-blur sm:px-6 sm:py-4">
        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.28em] text-sky-200">
          Test Management
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Edit Test
        </h2>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
          {error === "connection"
            ? "Unable to connect to the test service. Please try again."
            : `The test service rejected the request (status ${error}).`}
        </div>
      )}

      <form action={updateTest} className="rounded-[24px] bg-white p-6 text-slate-900 shadow-[0_22px_60px_rgba(15,23,42,0.14)] sm:p-8">
        <input type="hidden" name="testId" value={test.testId ?? testId} />
        <input type="hidden" name="createdAt" value={test.createdAt ?? ""} />
        <input type="hidden" name="createdBy" value={String(test.createdBy ?? "")} />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <label className="sm:col-span-2 lg:col-span-3">
            <span className="mb-2 block text-sm font-semibold">Test name</span>
            <input
              name="testName"
              type="text"
              defaultValue={test.testName ?? ""}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold">Service ID</span>
            <input
              name="serviceId"
              type="number"
              defaultValue={String(test.serviceId ?? "")}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold">Service name</span>
            <input
              name="serviceName"
              type="text"
              defaultValue={test.serviceName ?? ""}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold">Service short name</span>
            <input
              name="serviceShortName"
              type="text"
              defaultValue={test.serviceShortName ?? ""}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold">Service group ID</span>
            <input
              name="serviceGroupId"
              type="number"
              defaultValue={String(test.serviceGroupId ?? "")}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold">Service group name</span>
            <input
              name="serviceGroupName"
              type="text"
              defaultValue={test.serviceGroupName ?? ""}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold">Lab ID</span>
            <input
              name="labId"
              type="number"
              defaultValue={String(test.labId ?? "")}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold">Lab name</span>
            <input
              name="labName"
              type="text"
              defaultValue={test.labName ?? ""}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold">Test charges</span>
            <input
              name="testCharges"
              type="number"
              step="0.01"
              defaultValue={String(test.testCharges ?? "0")}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold">Parameter IDs</span>
            <input
              name="parameterList"
              type="text"
              defaultValue={Array.isArray(test.parameterList) ? JSON.stringify(test.parameterList) : (test.parameterList ?? "")}
              placeholder="1,2,3 or [1,2,3]"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold">Parameter group IDs</span>
            <input
              name="parameterGroupList"
              type="text"
              defaultValue={Array.isArray(test.parameterGroupList) ? JSON.stringify(test.parameterGroupList) : (test.parameterGroupList ?? "")}
              placeholder="10,11 or [10,11]"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>
        </div>

        <button type="submit" className="mt-7 rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
          Update test
        </button>
        <Link href="/super-admin/tests" className="mt-7 ml-3 inline-block rounded-xl bg-gray-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800">
          Cancel
        </Link>
      </form>
    </section>
  );
}
