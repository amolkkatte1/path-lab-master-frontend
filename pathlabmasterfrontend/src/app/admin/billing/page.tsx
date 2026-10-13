import { PatientDirectory } from "../patient-directory";
import { requireUserType } from "@/lib/auth";

export default async function BillingPage() {
  const user = await requireUserType("Administrator");
  return <PatientDirectory mode="billing" labId={user.labId} />;
}
