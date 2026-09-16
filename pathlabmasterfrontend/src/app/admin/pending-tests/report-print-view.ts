import type { PendingParameter, PatientInfo } from "./pending-tests-editor";

export type PrintTestGroup = {
  key: string;
  code: string;
  parameters: PendingParameter[];
};

function formatDate(raw: string) {
  const d = new Date(raw.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return raw;
  const date = d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase();
  return `${date} ${time}`;
}

function isOutOfRange(value: string, lower: number | null, upper: number | null): boolean {
  const num = parseFloat(value);
  if (Number.isNaN(num)) return false;
  if (lower !== null && num < lower) return true;
  if (upper !== null && num > upper) return true;
  return false;
}

function referenceRange(lower: number | null, upper: number | null): string {
  if (lower === null && upper === null) return "";
  if (lower !== null && upper !== null) return `${lower} - ${upper}`;
  if (lower !== null) return `&gt; ${lower}`;
  return `&lt; ${upper}`;
}

function testSectionHtml(group: PrintTestGroup): string {
  const sorted = [...group.parameters].sort((a, b) => a.sequence - b.sequence);

  // seq 1 = category label (e.g. "HAEMATOLOGY")
  // seq 2 = test name      (e.g. "HAEMOGRAM ON CELL COUNTER")
  const categoryParam = sorted.find((p) => p.sequence === 1);
  const category = categoryParam?.value?.trim() || categoryParam?.parameterName?.trim() || "";

  const testNameParam = sorted.find((p) => p.sequence === 2);
  const testName = testNameParam?.parameterName?.trim() || testNameParam?.value?.trim() || group.code;

  const dataRows = sorted.filter((p) => p.sequence !== 1 && p.sequence !== 2);

  const rowsHtml = dataRows.map((p) => {
    const valueBold  = p.isBold;
    const nameBold   = p.isNameBold ?? false;
    const oor        = isOutOfRange(p.value, p.lowerRange, p.upperRange);
    const refRange   = referenceRange(p.lowerRange, p.upperRange);

    // Bold section-heading row (parameterName present, no separate value column needed)
    // e.g. "Differential Leucocytes Counts", "HAEMOGRAM ON CELL COUNTER" if it appears as data
    if (nameBold && !p.value) {
      return `<tr>
        <td colspan="4" style="padding:3px 0;font-weight:700;font-size:13px;">${p.parameterName}</td>
      </tr>`;
    }

    const nameStyle  = `font-size:13px;padding:2px 0;${nameBold  ? "font-weight:700;" : ""}`;
    const valueStyle = `font-size:13px;padding:2px 0;${valueBold ? "font-weight:700;" : ""}${oor ? "background:#ffff00;padding:1px 4px;" : ""}`;

    return `<tr>
      <td style="width:38%;${nameStyle}">${p.parameterName || ""}</td>
      <td style="width:18%;${valueStyle}">${p.value || ""}</td>
      <td style="width:14%;font-size:13px;padding:2px 0;">${p.unit || ""}</td>
      <td style="width:30%;font-size:13px;padding:2px 0;">${refRange}</td>
    </tr>`;
  }).join("");

  return `
    <!-- Category heading: centred, bold, all-caps -->
    ${category ? `<tr><td colspan="4" style="text-align:center;font-weight:700;font-size:13px;padding:10px 0 4px;">${category}</td></tr>` : ""}
    <!-- Column header row -->
    <tr style="border-top:1px solid #000;border-bottom:1px solid #000;">
      <td style="font-weight:700;font-size:13px;padding:3px 0;width:38%;">Test Name</td>
      <td style="font-weight:700;font-size:13px;padding:3px 0;width:18%;">Result</td>
      <td style="font-weight:700;font-size:13px;padding:3px 0;width:14%;">Unit</td>
      <td style="font-weight:700;font-size:13px;padding:3px 0;width:30%;">Reference Range</td>
    </tr>
    <!-- Test name row -->
    <tr>
      <td colspan="4" style="font-weight:700;font-size:13px;padding:4px 0 2px;">${testName}</td>
    </tr>
    ${rowsHtml}
    <!-- Spacer row between test groups -->
    <tr><td colspan="4" style="padding:6px 0;border-bottom:1px solid #000;"></td></tr>
    <tr><td colspan="4" style="padding:4px 0;"></td></tr>
  `;
}

export function buildPrintHtml({
  labName,
  patientInfo,
  reportId,
  createdAt,
  testGroups,
  reportTopSpace,
  reportBottomSpace,
}: {
  labName: string;
  patientInfo: PatientInfo;
  reportId: string;
  createdAt: string;
  testGroups: PrintTestGroup[];
  reportTopSpace: number;
  reportBottomSpace: number;
}): string {
  const regDate    = formatDate(createdAt);
  const reportDate = formatDate(new Date().toISOString());

  const patientNameDisplay = patientInfo.patientName || "—";
  const genderAge  = [patientInfo.gender, patientInfo.age].filter(Boolean).join(" / ");
  const doctor     = patientInfo.doctorName ? `Dr. ${patientInfo.doctorName}` : "—";

  const allTestsHtml = testGroups.map(testSectionHtml).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Report — ${patientNameDisplay}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 13px;
      color: #000;
      background: #fff;
    }
    table { border-collapse: collapse; }
    .report-inner {
      padding-left: 28px;
      padding-right: 28px;
      padding-top: ${reportTopSpace}%;
      padding-bottom: ${reportBottomSpace}%;
    }
    @media print {
      @page { margin: 0; size: A4; }
    }
  </style>
</head>
<body>
<div class="report-inner">

  <!-- ── Lab name header ── -->
  <div style="text-align:center;font-size:20px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding-bottom:8px;">
    ${labName}
  </div>

  <!-- ── Patient info: two-column grid ── -->
  <table style="width:100%;margin-bottom:0;">
    <tr>
      <td style="width:50%;vertical-align:top;padding-bottom:2px;">
        <table>
          <tr>
            <td style="font-weight:700;white-space:nowrap;padding-right:4px;">Reg No</td>
            <td style="padding-right:8px;">:</td>
            <td>${reportId}</td>
          </tr>
          <tr>
            <td style="font-weight:700;white-space:nowrap;padding-right:4px;">Name</td>
            <td style="padding-right:8px;">:</td>
            <td>${patientNameDisplay}</td>
          </tr>
          <tr>
            <td style="font-weight:700;white-space:nowrap;padding-right:4px;">Referred Dr</td>
            <td style="padding-right:8px;">:</td>
            <td>${doctor}</td>
          </tr>
        </table>
      </td>
      <td style="width:50%;vertical-align:top;">
        <table>
          <tr>
            <td style="font-weight:700;white-space:nowrap;padding-right:4px;">Sex / Age</td>
            <td style="padding-right:8px;">:</td>
            <td>${genderAge || "—"}</td>
          </tr>
          <tr>
            <td style="font-weight:700;white-space:nowrap;padding-right:4px;">Reg Date</td>
            <td style="padding-right:8px;">:</td>
            <td>${regDate}</td>
          </tr>
          <tr>
            <td style="font-weight:700;white-space:nowrap;padding-right:4px;">Report Date</td>
            <td style="padding-right:8px;">:</td>
            <td>${reportDate}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- ── Full-width divider below patient info ── -->
  <div style="border-top:1px solid #000;margin:8px 0 12px;"></div>

  <!-- ── Test results ── -->
  <table style="width:100%;">
    <tbody>
      ${allTestsHtml}
    </tbody>
  </table>

  <!-- ── End of Report ── -->
  <div style="text-align:center;margin-top:32px;margin-bottom:8px;font-size:13px;font-weight:700;">
    End of Report
  </div>

</div>
</body>
</html>`;
}
