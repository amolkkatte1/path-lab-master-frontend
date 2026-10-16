import "server-only";

import { notFound } from "next/navigation";

import { updateMdDoctor } from "@/app/actions";
import { getMdDoctorListByLabId, parseApiResponse } from "@/lib/api";
import { requireUserType } from "@/lib/auth";

import { MdDoctorForm } from "../../md-doctor-form";
import { getMdDoctorId, resolveMdDoctorList, type MdDoctorListResponse } from "../../md-doctor-types";

type EditMdDoctorPageProps = {
  params: Promise<{ doctorId: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditMdDoctorPage({ params, searchParams }: EditMdDoctorPageProps) {
  const user = await requireUserType("Administrator");
  const [{ doctorId }, { error }] = await Promise.all([params, searchParams]);
  let doctor = null;

  try {
    const response = await fetch(getMdDoctorListByLabId(user.labId), { cache: "no-store" });
    if (!response.ok) notFound();
    const payload = await parseApiResponse<MdDoctorListResponse>(response);
    doctor = resolveMdDoctorList(payload).find((item) => String(getMdDoctorId(item)) === doctorId) ?? null;
  } catch {
    notFound();
  }

  if (!doctor) notFound();

  return <MdDoctorForm action={updateMdDoctor} doctor={doctor} error={error} labName={user.labName} labId={user.labId} />;
}
