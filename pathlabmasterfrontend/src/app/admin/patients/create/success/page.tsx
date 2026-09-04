import Link from "next/link";
import { FiCheckCircle, FiClipboard, FiUsers } from "react-icons/fi";

import { requireUserType } from "@/lib/auth";

type PatientSuccessPageProps = {
  searchParams: Promise<{
    patientName?: string;
    mobileNumber?: string;
  }>;
};

export default async function PatientSuccessPage({
  searchParams,
}: PatientSuccessPageProps) {
  await requireUserType("Administrator");

  const { patientName, mobileNumber } = await searchParams;
  const testRegistrationParams = new URLSearchParams();

  if (patientName) {
    testRegistrationParams.set("patientName", patientName);
  }

  if (mobileNumber) {
    testRegistrationParams.set("mobileNumber", mobileNumber);
  }

  const testRegistrationHref = testRegistrationParams.size
    ? `/admin/tests?${testRegistrationParams.toString()}`
    : "/admin/tests";

  return (
    <section className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-emerald-300/25 bg-white p-6 text-center text-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.22)] sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <FiCheckCircle className="h-7 w-7" />
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Registration Success
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">
          Patient registered successfully.
        </h1>

        {patientName && (
          <p className="mt-3 text-sm text-slate-600">
            {patientName} has been added to the patient directory.
          </p>
        )}

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Link
            href="/admin/patients"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-950"
          >
            <FiUsers className="h-4 w-4" />
            OK
          </Link>
          <Link
            href={testRegistrationHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <FiClipboard className="h-4 w-4" />
            Register test
          </Link>
        </div>
      </div>
    </section>
  );
}
