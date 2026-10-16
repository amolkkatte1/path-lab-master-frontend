import "server-only";

import { createMdDoctor } from "@/app/actions";
import { requireUserType } from "@/lib/auth";

import { MdDoctorForm } from "../md-doctor-form";

type CreateMdDoctorPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function CreateMdDoctorPage({ searchParams }: CreateMdDoctorPageProps) {
  const user = await requireUserType("Administrator");
  const { error } = await searchParams;

  return <MdDoctorForm action={createMdDoctor} error={error} labName={user.labName} labId={user.labId} />;
}
