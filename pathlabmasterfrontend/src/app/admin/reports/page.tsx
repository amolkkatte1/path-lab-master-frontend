import { getReportDoctors, getReportList } from "@/app/actions";
import { requireUserType } from "@/lib/auth";
import ReportsPageClient from "./reports-page-client";

export default async function ReportsPage() {
  const [user, doctorResult, reportResult] = await Promise.all([
    requireUserType("Administrator"),
    getReportDoctors(),
    getReportList(),
  ]);

  return (
    <ReportsPageClient
      initialDoctors={doctorResult.doctors}
      initialReports={reportResult.reports}
      labId={String(user.labId)}
      labName={user.labName}
      currentUserId={user.userId}
    />
  );
}
