import { notFound } from "next/navigation";
import { getReportViewData } from "@/app/actions";
import { requireUserType } from "@/lib/auth";
import PatientReportTests from "./patient-report-tests";

export default async function PatientReportPage({
  params,
}: Readonly<{ params: Promise<{ patientId: string }> }>) {
  const [{ patientId }, user] = await Promise.all([params, requireUserType("Administrator")]);
  const result = await getReportViewData(patientId, String(user.labId));

  if (!result.ok) notFound();

  return <PatientReportTests report={result.data} currentUserId={String(user.userId)} />;
}
