import Link from "next/link";
import { getExistingBillingForPatient } from "@/app/actions";
import { requireUserType } from "@/lib/auth";
import { EditBillForm } from "./edit-bill-form";

type EditBillPageProps = {
  params: Promise<{ patientId: string }>;
  searchParams: Promise<{ patientName?: string }>;
};

export default async function EditBillPage({ params, searchParams }: EditBillPageProps) {
  const [{ patientId }, search, user] = await Promise.all([
    params,
    searchParams,
    requireUserType("Administrator"),
  ]);
  const bill = await getExistingBillingForPatient({ patientId, labId: user.labId });

  if (!bill) {
    return (
      <section className="mx-auto max-w-3xl rounded-2xl border border-amber-300/20 bg-amber-400/10 p-5 text-sm text-amber-100">
        <p>No bill was found for {search.patientName || `patient ${patientId}`}.</p>
        <Link href="/admin/billing" className="mt-4 inline-block underline">Back to Billing</Link>
      </section>
    );
  }

  return <EditBillForm patientId={patientId} patientName={search.patientName || `Patient ${patientId}`} bill={bill} />;
}
