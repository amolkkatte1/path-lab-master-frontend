import { getReportViewData } from "@/app/actions";
import { buildPrintHtml, type PrintTestGroup } from "@/app/admin/pending-tests/report-print-view";
import ReportPrintButton from "./report-print-button";

type PageParams = {
  params: Promise<{
    labId: string;
    patientId: string;
    reportId: string;
    slug: string;
  }>;
  searchParams: Promise<{ header?: string }>;
};

export default async function ReportPage({ params, searchParams }: PageParams) {
  const { labId, patientId } = await params;
  const { header } = await searchParams;
  const includeHeader = header === "1";

  const result = await getReportViewData(patientId, Number(labId));

  if (!result.ok) {
    return (
      <div style={{ fontFamily: "Arial, sans-serif", padding: "40px", color: "#ef4444" }}>
        <h2>Could not load report</h2>
        <p>{result.error}</p>
      </div>
    );
  }

  const { data } = result;

  // Build test groups from completedTests
  const testGroups: PrintTestGroup[] = Object.entries(data.completedTests).map(
    ([key, parameters]) => ({
      key,
      code: key.replace(/_\d+$/, ""),
      parameters,
    }),
  );

  const html = buildPrintHtml({
    labName: data.labName,
    patientInfo: {
      patientName: data.patientName,
      gender: data.gender,
      age: data.age,
      doctorName: data.doctorName,
      createdAt: data.patientCreatedAt,
    },
    reportId: data.reportId,
    createdAt: data.reportCreatedAt,
    patientCreatedAt: data.patientCreatedAt,
    testGroups,
    reportTopSpace: data.reportTopSpace,
    reportBottomSpace: data.reportBottomSpace,
    includeHeader,
  });

  return (
    <>
      {/* Full-page report rendered directly */}
      <div dangerouslySetInnerHTML={{ __html: html }} />

      {/* Floating print/save button */}
      <ReportPrintButton patientName={data.patientName} />
    </>
  );
}
