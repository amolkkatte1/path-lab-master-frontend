import { getReportDoctors, getReportList } from "@/app/actions";
import { API_ENDPOINTS, parseApiResponse, stringifyApiPayload } from "@/lib/api";
import { requireUserType } from "@/lib/auth";
import ReportsPageClient from "./reports-page-client";

function normalizeLabDate(value: unknown): string | null {
  if (value === null || value === undefined) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  const direct = new Date(raw.replace(" ", "T"));
  if (!Number.isNaN(direct.getTime())) {
    return new Date(direct.getTime() - direct.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
  }

  const match = raw.match(/^(\d{4})[-/](\d{2})[-/](\d{1,2})$/);
  if (match) {
    const [, year, month, day] = match;
    return `${year}-${month}-${day}`;
  }

  return null;
}

async function getLabDateRange(labId: string) {
  const today = new Date();
  const todayString = today.toISOString().slice(0, 10);

  try {
    const response = await fetch(API_ENDPOINTS.getLab, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: stringifyApiPayload({ labId }, ["labId"]),
      cache: "no-store",
    });

    if (!response.ok) {
      return { fromDate: todayString, toDate: todayString };
    }

    const payload = await parseApiResponse<{ data?: Record<string, unknown> } | Record<string, unknown>>(response);
    const lab = ("data" in payload && payload.data && typeof payload.data === "object" ? payload.data : payload) as Record<string, unknown> | undefined;
    const startRaw = lab?.sbuscriptionStartDate ?? lab?.subscriptionStartDate ?? null;
    const endRaw = lab?.sbuscriptionEndDate ?? lab?.subscriptionEndDate ?? null;
    const fromDate = normalizeLabDate(startRaw) ?? todayString;
    const toDate = normalizeLabDate(endRaw) ?? fromDate;

    return { fromDate, toDate };
  } catch {
    return { fromDate: todayString, toDate: todayString };
  }
}

export default async function ReportsPage() {
  const user = await requireUserType("Administrator");
  const [doctorResult, dateRange] = await Promise.all([
    getReportDoctors(),
    getLabDateRange(String(user.labId)),
  ]);
  const reportResult = await getReportList({
    fromDate: dateRange.fromDate,
    toDate: dateRange.toDate,
  });

  return (
    <ReportsPageClient
      initialDoctors={doctorResult.doctors}
      initialReports={reportResult.reports}
      labId={String(user.labId)}
      labName={user.labName}
      currentUserId={user.userId}
      defaultFromDate={dateRange.fromDate}
      defaultToDate={dateRange.toDate}
    />
  );
}
