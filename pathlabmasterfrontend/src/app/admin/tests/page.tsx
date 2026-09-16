import { FiClipboard } from "react-icons/fi";
import type { ReactNode } from "react";

import { API_ENDPOINTS, getPendingReportsByPatientId, parseApiResponse } from "@/lib/api";
import { requireUserType } from "@/lib/auth";
import { TestRegistrationForm, type AvailableTest } from "./test-registration-form";

type TestRegistrationPageProps = {
  readonly searchParams: Promise<{
    patientId?: string;
    patientName?: string;
    mobileNumber?: string;
  }>;
};

type TestListResponse = {
  data?: AvailableTest[];
};

type PendingReportsResponse = {
  status?: string;
  statusCode?: number;
  data?: {
    pendingTest?: Record<string, unknown>;
    completedTest?: Record<string, unknown>;
  } | null;
};

async function getTests() {
  try {
    const response = await fetch(API_ENDPOINTS.testList, { cache: "no-store" });
    if (!response.ok) {
      return { tests: [], error: `The test service returned ${response.status}.` };
    }
    const payload = await parseApiResponse<TestListResponse>(response);
    return { tests: payload.data ?? [], error: null };
  } catch {
    return { tests: [], error: "Unable to connect to the test service. Please try again." };
  }
}

/**
 * Returns the test keys already registered for this patient (from both
 * pendingTest and completedTest), or an empty array if no report exists yet.
 */
async function getAlreadyRegisteredTestKeys(
  patientId: string,
  labId: number,
): Promise<string[]> {
  try {
    const response = await fetch(
      getPendingReportsByPatientId(patientId, labId),
      { cache: "no-store" },
    );

    const payload = await parseApiResponse<PendingReportsResponse>(response);

    // statusCode 0 means "Reports not yet Register" — no report exists
    if (!payload.data || payload.statusCode === 0) return [];

    const pendingKeys = Object.keys(payload.data.pendingTest ?? {});
    const completedKeys = Object.keys(payload.data.completedTest ?? {});

    // Strip the trailing _<timestamp> to get the human-readable test name
    return [...pendingKeys, ...completedKeys].map((key) =>
      key.replace(/_\d+$/, ""),
    );
  } catch {
    return [];
  }
}

export default async function TestRegistrationPage({
  searchParams,
}: TestRegistrationPageProps) {
  const user = await requireUserType("Administrator");

  const { patientId, patientName, mobileNumber } = await searchParams;

  // Run both fetches in parallel when patientId is present
  const [{ tests, error }, alreadyRegisteredKeys] = await Promise.all([
    getTests(),
    patientId
      ? getAlreadyRegisteredTestKeys(patientId, user.labId)
      : Promise.resolve([] as string[]),
  ]);

  let registrationContent: ReactNode;

  if (error) {
    registrationContent = (
      <div className="mt-5 rounded-xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-100">
        {error}
      </div>
    );
  } else if (!patientId) {
    registrationContent = (
      <div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">
        Select a patient before registering tests.
      </div>
    );
  } else {
    registrationContent = (
      <div className="mt-6">
        <TestRegistrationForm
          availableTests={tests}
          patientId={patientId}
          alreadyRegisteredKeys={alreadyRegisteredKeys}
        />
      </div>
    );
  }

  return (
    <section className="mx-auto min-w-0 max-w-7xl space-y-6">
      <header className="rounded-[20px] border border-white/10 bg-white/10 px-5 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
            <FiClipboard />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
              Test Registration
            </p>
            <h1 className="mt-1 text-xl font-semibold text-white">
              Register patient test
            </h1>
          </div>
        </div>
      </header>

      <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-6">
        <div className="max-w-2xl">
          {(patientName || mobileNumber) && (
            <div className="rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
              <p>{patientName || "Unnamed patient"}</p>
              {patientId && <p>Patient ID: {patientId}</p>}
              {mobileNumber && <p className="mt-1">Mobile: {mobileNumber}</p>}
            </div>
          )}
        </div>
        {registrationContent}
      </div>
    </section>
  );
}
