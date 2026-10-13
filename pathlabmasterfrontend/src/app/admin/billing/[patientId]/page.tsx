import { getExistingBillingForPatient } from "@/app/actions";
import { requireUserType } from "@/lib/auth";
import { PrintBillButton } from "./print-button";

type BillingPageProps = {
  params: Promise<{ patientId: string }>;
  searchParams: Promise<{ patientName?: string; mobileNumber?: string }>;
};

function amount(value: unknown) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number.toFixed(2) : "0.00";
}

export default async function PatientBillPage({ params, searchParams }: BillingPageProps) {
  const [{ patientId }, search, user] = await Promise.all([
    params,
    searchParams,
    requireUserType("Administrator"),
  ]);
  const billing = await getExistingBillingForPatient({ patientId, labId: user.labId });
  const tests = Array.isArray(billing?.testList)
    ? billing.testList
    : Object.entries(billing?.testList ?? {}).map(([testName, testCharges]) => ({ testName, testCharges }));

  return (
    <section className="mx-auto min-w-0 max-w-3xl space-y-4">
      <div className="flex items-center justify-between gap-4 print:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Billing</p>
          <h1 className="mt-1 text-xl font-semibold text-white">Patient bill</h1>
        </div>
        {billing && <PrintBillButton />}
      </div>

      {!billing ? (
        <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-5 text-sm text-amber-100">
          No bill was found for {search.patientName || `patient ${patientId}`}.
        </div>
      ) : (
        <article className="rounded-2xl border border-white/10 bg-white p-6 text-slate-900 shadow-xl print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{user.labName}</p>
              <h2 className="mt-2 text-2xl font-bold">Bill</h2>
            </div>
            <div className="text-right text-sm text-slate-600">
              <p>Bill ID: {billing.billId ?? "-"}</p>
              <p>Patient ID: {patientId}</p>
              <p>{billing.createdAt ? new Date(billing.createdAt).toLocaleDateString("en-IN") : ""}</p>
            </div>
          </header>

          <section className="grid gap-2 border-b border-slate-200 py-5 text-sm sm:grid-cols-2">
            <p><span className="font-semibold">Patient:</span> {search.patientName || `Patient ${patientId}`}</p>
            <p><span className="font-semibold">Mobile:</span> {search.mobileNumber || "-"}</p>
            <p><span className="font-semibold">Referring doctor:</span> {billing.doctorName || "-"}</p>
          </section>

          <table className="mt-5 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-3">Test</th>
                <th className="py-3 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test, index) => (
                <tr key={`${test.testName ?? "test"}-${index}`} className="border-b border-slate-100">
                  <td className="py-3">{test.testName || "Test"}</td>
                  <td className="py-3 text-right">{amount(test.testCharges)}</td>
                </tr>
              ))}
              {tests.length === 0 && (
                <tr><td className="py-3 text-slate-500" colSpan={2}>No test details are available.</td></tr>
              )}
            </tbody>
          </table>

          <dl className="ml-auto mt-5 grid max-w-xs grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <dt className="text-slate-600">Total</dt><dd className="text-right">₹{amount(billing.totalAmount)}</dd>
            <dt className="text-slate-600">Discount</dt><dd className="text-right">₹{amount(billing.discount)}</dd>
            <dt className="font-semibold">Paid</dt><dd className="text-right font-semibold">₹{amount(billing.paymentReceived)}</dd>
            <dt className="font-bold">Due</dt><dd className="text-right font-bold">₹{amount(billing.paymentDue)}</dd>
          </dl>
        </article>
      )}
    </section>
  );
}
