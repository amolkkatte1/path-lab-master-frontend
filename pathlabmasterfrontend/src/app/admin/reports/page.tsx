import { getReportDoctors, getReportList } from "@/app/actions";

import ReportsPageClient from "./reports-page-client";

export default async function ReportsPage() {
  const [doctorResult, reportResult] = await Promise.all([
    getReportDoctors(),
    getReportList(),
  ]);

  return (
    <ReportsPageClient
      initialDoctors={doctorResult.doctors}
      initialReports={reportResult.reports}
    />
  );
}
