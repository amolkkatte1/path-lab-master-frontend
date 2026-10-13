"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { updateBillingRecord } from "@/app/actions";

type BillData = {
  billId?: number | string;
  testList?: Record<string, number | string> | Array<{ testName?: string; testCharges?: number | string }>;
  totalAmount?: number | string;
  paymentReceived?: number | string;
  paymentDue?: number | string;
  discount?: number | string;
  collectedByDoctor?: number | string;
  doctorName?: string;
};

type BillTest = { testName: string; testCharges: string };

function initialTests(bill?: BillData | null): BillTest[] {
  if (!bill?.testList) return [];
  const entries = Array.isArray(bill.testList)
    ? bill.testList.map((test) => [test.testName ?? "", test.testCharges ?? 0] as const)
    : Object.entries(bill.testList);
  return entries.map(([testName, testCharges]) => ({ testName, testCharges: String(testCharges) }));
}

export function EditBillForm({ patientId, patientName, bill }: { patientId: string; patientName: string; bill: BillData }) {
  const router = useRouter();
  const [tests, setTests] = useState(() => initialTests(bill));
  const [discount, setDiscount] = useState(String(bill.discount ?? 0));
  const [paymentReceived, setPaymentReceived] = useState(String(bill.paymentReceived ?? 0));
  const [collectedByDoctor, setCollectedByDoctor] = useState(String(bill.collectedByDoctor ?? 0));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const total = useMemo(() => tests.reduce((sum, test) => sum + (Number(test.testCharges) || 0), 0), [tests]);
  const due = Math.max(total - (Number(discount) || 0) - (Number(paymentReceived) || 0) - (Number(collectedByDoctor) || 0), 0);

  async function save() {
    if (tests.some((test) => !test.testName.trim() || Number(test.testCharges) < 0 || !Number.isFinite(Number(test.testCharges)))) {
      setError("Enter a test name and a valid non-negative amount for each row.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const result = await updateBillingRecord({ patientId, testList: tests, discount, paymentReceived, collectedByDoctor });
      if (!result.ok) throw new Error(result.error);
      router.push("/admin/billing");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save the bill.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl space-y-5">
      <header className="rounded-2xl border border-white/10 bg-white/10 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Edit bill</p>
        <h1 className="mt-1 text-xl font-semibold">{patientName}</h1>
        <p className="mt-1 flex flex-wrap gap-x-3 text-sm text-slate-400">
          <span className="whitespace-nowrap">Patient ID: {patientId}</span>
          <span className="whitespace-nowrap">Bill ID: {bill.billId ?? "-"}</span>
        </p>
        <p className="mt-1 text-sm text-slate-400">Referring doctor: {bill.doctorName || "-"}</p>
      </header>

      {error && <p role="alert" className="rounded-xl border border-rose-300/20 bg-rose-400/10 p-3 text-sm text-rose-100">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/45">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-400"><tr><th className="px-4 py-3">Test</th><th className="px-4 py-3">Amount (₹)</th></tr></thead>
          <tbody className="divide-y divide-white/10">
            {tests.map((test, index) => (
              <tr key={index}>
                <td className="px-4 py-3"><input aria-label={`Test name ${index + 1}`} value={test.testName} onChange={(event) => setTests((current) => current.map((item, row) => row === index ? { ...item, testName: event.target.value } : item))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-emerald-300/50" /></td>
                <td className="px-4 py-3"><input aria-label={`Test amount ${index + 1}`} type="number" min="0" step="0.01" value={test.testCharges} onChange={(event) => setTests((current) => current.map((item, row) => row === index ? { ...item, testCharges: event.target.value } : item))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-emerald-300/50" /></td>
              </tr>
            ))}
            {tests.length === 0 && <tr><td colSpan={2} className="px-4 py-6 text-center text-slate-400">No tests on this bill.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:grid-cols-3">
        <label className="text-sm text-slate-300">Discount (₹)<input type="number" min="0" step="0.01" value={discount} onChange={(event) => setDiscount(event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" /></label>
        <label className="text-sm text-slate-300">Payment received (₹)<input type="number" min="0" step="0.01" value={paymentReceived} onChange={(event) => setPaymentReceived(event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" /></label>
        <label className="text-sm text-slate-300">Collected by doctor (₹)<input type="number" min="0" step="0.01" value={collectedByDoctor} onChange={(event) => setCollectedByDoctor(event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" /></label>
        <div className="sm:col-span-3 flex flex-wrap justify-end gap-x-8 gap-y-2 border-t border-white/10 pt-4 text-sm"><span>Total: ₹{total.toFixed(2)}</span><span className="font-semibold">Due: ₹{due.toFixed(2)}</span></div>
      </div>

      <div className="flex justify-end gap-3 mr-4">
        <button type="button" onClick={() => router.push("/admin/billing")} disabled={saving} className="rounded-lg border border-white/15 px-4 py-2.5 text-sm text-slate-200">Cancel</button>
        <button type="button" onClick={save} disabled={saving} className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : "Save bill"}</button>
      </div>
    </section>
  );
}
