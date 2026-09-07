import Link from "next/link";
import type { ReactNode } from "react";
import { FiArrowLeft, FiClipboard } from "react-icons/fi";

import { getPendingReportsByPatientId, parseApiResponse } from "@/lib/api";
import { requireUserType } from "@/lib/auth";

type PendingReportItem = {
  testName?: string;
  serviceName?: string;
  name?: string;
  testList?: PendingReportItem[];
  pendingTest?: Record<string, unknown>;
};

type PendingReportsResponse = {
  data?: PendingReportItem[] | PendingReportItem | Record<string, unknown>;
};

function collectTestNames(value: unknown, names: string[] = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectTestNames(item, names));
    return names;
  }

  if (!value || typeof value !== "object") return names;
  const item = value as PendingReportItem;
  const name = item.testName || item.serviceName || item.name;

  if (name) names.push(name);
  if (item.testList) collectTestNames(item.testList, names);
  if (item.pendingTest) names.push(...Object.keys(item.pendingTest));

  return names;
}

async function getPendingTests(patientId: string, labId: number) {
  try {
    const response = await fetch(getPendingReportsByPatientId(patientId, labId), {
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        names: [],
        error: `The pending reports service returned ${response.status}.`,
      };
    }

    const payload = await parseApiResponse<PendingReportsResponse>(response);
    return { names: [...new Set(collectTestNames(payload.data))], error: null };
  } catch {
    return { names: [], error: "Unable to load pending tests for this patient." };
  }
}

export default async function PendingTestsPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ patientId: string }>;
  searchParams: Promise<{ patientName?: string }>;
}>) {
  const user = await requireUserType("Administrator");
  const { patientId } = await params;
  const { patientName } = await searchParams;
  const { names, error } = await getPendingTests(patientId, user.labId);
  let testsContent: ReactNode;

  if (error) {
    testsContent = <p className="p-5 text-sm text-rose-200">{error}</p>;
  } else if (names.length === 0) {
    testsContent = <p className="p-5 text-sm text-slate-400">No pending tests were found.</p>;
  } else {
    testsContent = (
      <ul className="divide-y divide-white/8">
        {names.map((name) => (
          <li key={name} className="flex items-center gap-3 px-5 py-4 text-slate-200">
            <FiClipboard className="text-emerald-300" />
            <span>{name}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <header className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur">
        <Link href="/admin" aria-label="Back to dashboard" title="Back to dashboard" className="rounded-xl border border-white/10 p-2.5 text-slate-300 transition hover:bg-white/10 hover:text-white">
          <FiArrowLeft />
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Pending reports</p>
          <h1 className="mt-1 text-xl font-semibold text-white">{patientName || patientId}</h1>
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/45">
        <div className="border-b border-white/10 p-5">
          <h2 className="text-lg font-semibold text-white">Pending tests</h2>
          <p className="mt-1 text-sm text-slate-400">Tests awaiting completion for this patient.</p>
        </div>
        {testsContent}
      </section>
    </section>
  );
}
