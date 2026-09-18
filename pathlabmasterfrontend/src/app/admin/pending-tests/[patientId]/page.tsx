import Link from "next/link";
import type { ReactNode } from "react";
import { FiArrowLeft } from "react-icons/fi";

import { API_ENDPOINTS, getPendingReportsByPatientId, parseApiResponse, stringifyApiPayload, getConfigByLabId } from "@/lib/api";
import { requireUserType } from "@/lib/auth";
import {
  PendingTestsEditor,
  type PendingParameter,
  type TestStatus,
  type ReportData,
  type PatientInfo,
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

type PatientApiData = {
  patientId?: number | string;
  prefix?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  year?: number | string;
  month?: number | string;
  days?: number | string;
  doctorName?: string;
  mobileNumber?: number | string;
  createdAt?: string;
};

type PatientApiResponse = { data?: PatientApiData } | PatientApiData;

async function getPatientInfo(patientId: string): Promise<PatientInfo> {
  try {
    const response = await fetch(API_ENDPOINTS.getPatient, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: stringifyApiPayload({ patientId }, ["patientId"]),
      cache: "no-store",
    });

    if (!response.ok) return {};

    const payload = await parseApiResponse<PatientApiResponse>(response);
    const data = "patientId" in payload ? payload : ((payload as { data?: PatientApiData }).data ?? {});

    const nameParts = [data.prefix, data.firstName, data.middleName, data.lastName].filter(Boolean);

    const ageParts: string[] = [];
    if (data.year) ageParts.push(`${data.year}Y`);
    if (data.month) ageParts.push(`${data.month}M`);
    if (data.days) ageParts.push(`${data.days}D`);

    return {
      patientName: nameParts.join(" ") || undefined,
      gender: data.gender,
      age: ageParts.join(" ") || undefined,
      doctorName: data.doctorName,
      mobileNumber: data.mobileNumber ? String(data.mobileNumber) : undefined,
      createdAt: data.createdAt,
    };
  } catch {
    return {};
  }
}

async function getLabConfig(labId: number): Promise<{ topSpace: number; bottomSpace: number }> {
  try {
    const response = await fetch(getConfigByLabId(labId), { cache: "no-store" });
    if (!response.ok) return { topSpace: 0, bottomSpace: 0 };
    const payload = await parseApiResponse<{
      data?: { reportTopSpace?: number; reportBottomSpace?: number };
    }>(response);
    return {
      topSpace: payload.data?.reportTopSpace ?? 0,
      bottomSpace: payload.data?.reportBottomSpace ?? 0,
    };
  } catch {
    return { topSpace: 0, bottomSpace: 0 };
  }
}

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

  // Fetch report data, patient info, and lab config in parallel
  const [{ tests, reportData, error }, patientInfo, labConfig] = await Promise.all([
    getPendingTests(patientId, user.labId),
    getPatientInfo(patientId),
    getLabConfig(user.labId),
  ]);

  // Prefer the full name from the patient API; fall back to the URL search param
  const resolvedPatientInfo = {
    ...patientInfo,
    patientName: patientInfo.patientName || patientName,
  };

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
        labName={user.labName}
        patientInfo={resolvedPatientInfo}
        reportTopSpace={labConfig.topSpace}
        reportBottomSpace={labConfig.bottomSpace}
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
            {resolvedPatientInfo.patientName || patientId}
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
