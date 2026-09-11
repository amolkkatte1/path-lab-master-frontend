import Link from "next/link";
import type { ReactNode } from "react";
import { FiArrowLeft } from "react-icons/fi";

import { getPendingReportsByPatientId, parseApiResponse } from "@/lib/api";
import { requireUserType } from "@/lib/auth";
import {
  PendingTestsEditor,
  type PendingParameter,
  type TestStatus,
  type ReportData,
} from "@/app/admin/pending-tests/pending-tests-editor";

type PendingReportData = {
  reportId?: string;
  patientId?: string;
  labId?: string;
  pendingTest?: Record<string, PendingParameter[]>;
  completedTest?: Record<string, PendingParameter[]>;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: Record<string, TestStatus>;
};

type PendingReportsResponse = {
  data?: PendingReportData;
};

async function getPendingTests(patientId: string, labId: number) {
  try {
    const response = await fetch(
      getPendingReportsByPatientId(patientId, labId),
      { cache: "no-store" },
    );

    if (!response.ok) {
      return {
        tests: [],
        reportData: null,
        error: `The pending reports service returned ${response.status}.`,
      };
    }

    const payload = await parseApiResponse<PendingReportsResponse>(response);
    const data = payload.data;

    const tests = Object.entries(data?.pendingTest ?? {}).map(
      ([key, parameters]) => ({
        key,
        code: key.replace(/_\d+$/, ""),
        category:
          parameters.find((p) => p.sequence === 1)?.parameterName ||
          parameters.find((p) => p.sequence === 1)?.value?.trim() ||
          "",
        parameters,
      }),
    );

    const reportData: ReportData = {
      reportId: data?.reportId ?? "",
      patientId: data?.patientId ?? patientId,
      labId: data?.labId ?? String(labId),
      pendingTest: data?.pendingTest ?? {},
      completedTest: data?.completedTest ?? {},
      createdBy: data?.createdBy ?? "",
      updatedBy: data?.updatedBy ?? "",
      createdAt: data?.createdAt ?? "",
      updatedAt: data?.updatedAt ?? "",
      status: data?.status ?? {},
    };

    return { tests, reportData, error: null };
  } catch {
    return {
      tests: [],
      reportData: null,
      error: "Unable to load pending tests for this patient.",
    };
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
  const { tests, reportData, error } = await getPendingTests(patientId, user.labId);
  let testsContent: ReactNode;

  if (error) {
    testsContent = <p className="p-5 text-sm text-rose-200">{error}</p>;
  } else if (tests.length === 0) {
    testsContent = (
      <p className="p-5 text-sm text-slate-400">No pending tests were found.</p>
    );
  } else {
    testsContent = (
      <PendingTestsEditor
        tests={tests}
        reportData={reportData!}
        currentUserId={user.userId}
      />
    );
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <header className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur">
        <Link
          href="/admin"
          aria-label="Back to dashboard"
          title="Back to dashboard"
          className="rounded-xl border border-white/10 p-2.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <FiArrowLeft />
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
            Pending reports
          </p>
          <h1 className="mt-1 text-xl font-semibold text-white">
            {patientName || patientId}
          </h1>
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/45">
        <div className="border-b border-white/10 p-5">
          <h2 className="text-lg font-semibold text-white">Pending tests</h2>
          <p className="mt-1 text-sm text-slate-400">
            Tests awaiting completion for this patient.
          </p>
        </div>
        {testsContent}
      </section>
    </section>
  );
}
