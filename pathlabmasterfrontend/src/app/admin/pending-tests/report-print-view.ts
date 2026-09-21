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

function isOutOfRange(value: string, lower: number | string | null, upper: number | string | null): boolean {
  const num = parseFloat(value);
  if (Number.isNaN(num)) return false;
  const lo = lower !== null && lower !== "" ? Number(lower) : null;
  const hi = upper !== null && upper !== "" ? Number(upper) : null;
  if (lo !== null && !Number.isNaN(lo) && num < lo) return true;
  if (hi !== null && !Number.isNaN(hi) && num > hi) return true;
  return false;
}

function referenceRange(lower: number | string | null, upper: number | string | null, parameterRange: string | null): string {
  // If a custom range string is provided, use it as the separator between the two numbers
  if (parameterRange !== null && parameterRange !== "") {
    const lo = lower !== null && lower !== "" ? Number(lower) : null;
    const hi = upper !== null && upper !== "" ? Number(upper) : null;
    if (lo !== null && !Number.isNaN(lo) && hi !== null && !Number.isNaN(hi))
      return `${lo} ${parameterRange} ${hi}`;
    if (lo !== null && !Number.isNaN(lo)) return `&gt; ${lo}`;
    if (hi !== null && !Number.isNaN(hi)) return `&lt; ${hi}`;
    return "";
  }
  const lo = lower !== null && lower !== "" ? Number(lower) : null;
  const hi = upper !== null && upper !== "" ? Number(upper) : null;
  if ((lo === null || Number.isNaN(lo)) && (hi === null || Number.isNaN(hi))) return "";
  if (lo !== null && !Number.isNaN(lo) && hi !== null && !Number.isNaN(hi)) return `${lo} - ${hi}`;
  if (lo !== null && !Number.isNaN(lo)) return `&gt; ${lo}`;
  return `&lt; ${hi}`;
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
    const valueBold  = p.isBold ?? false;
    const nameBold   = p.isNameBold ?? false;
    const oor        = isOutOfRange(p.value ?? "", p.lowerRange, p.upperRange);
    const refRange   = referenceRange(p.lowerRange, p.upperRange, p.parameterRange ?? null);
    const cellBase   = `font-size:13px;padding:2px 0;vertical-align:top;`;

    // Description-only parameter — spans all columns, preserves line breaks
    if (p.isDescriptionParameter) {
      const text = (p.parameterName || p.value || "").replace(/\\n\n|\\n|\n/g, "<br/>");
      return `<tr>
        <td colspan="4" style="${cellBase}font-style:italic;color:#333;">${text}</td>
      </tr>`;
    }

    // Value-is-description: name in first col, value as paragraph spanning remaining 3 cols
    if (p.isValueDiscription) {
      const nameStyle = `${cellBase}${nameBold ? "font-weight:700;" : ""}`;
      const text = (p.value || "").replace(/\\n\n|\\n|\n/g, "<br/>");
      return `<tr>
        <td style="width:38%;${nameStyle}">${p.parameterName || ""}</td>
        <td colspan="3" style="${cellBase}">${text}</td>
      </tr>`;
    }

    // Name-only row (no value required)
    if (p.isValueRequired === false) {
      return `<tr>
        <td colspan="4" style="${cellBase}${nameBold ? "font-weight:700;" : ""}">${p.parameterName || ""}</td>
      </tr>`;
    }

    // Bold section-heading row (no value, not a description)
    if (nameBold && !p.value) {
      return `<tr>
        <td colspan="4" style="${cellBase}font-weight:700;">${p.parameterName}</td>
      </tr>`;
    }

    const nameStyle  = `${cellBase}${nameBold  ? "font-weight:700;" : ""}`;
    const tdValueStyle = `${cellBase}`;
    const valueInner = oor
      ? `<span style="background:#ffff00;font-weight:700;padding:1px 0px;display:inline-block;">${p.value || ""}</span>`
      : `<span style="${valueBold ? "font-weight:700;" : ""}">${p.value || ""}</span>`;

    return `<tr>
      <td style="width:38%;${nameStyle}">${p.parameterName || ""}</td>
      <td style="width:18%;${tdValueStyle}">${valueInner}</td>
      <td style="width:14%;${cellBase}">${p.unit || ""}</td>
      <td style="width:30%;${cellBase}">${refRange}</td>
    </tr>`;
  }).join("");

  return `
    <!-- Category heading: centred, bold, all-caps -->
    ${category ? `<tr><td colspan="4" style="text-align:center;font-weight:700;font-size:13px;padding:6px 0 4px;">${category}</td></tr>` : ""}
    <!-- Column header row -->
    <tr style="border-top:1px solid #000;border-bottom:1px solid #000;">
      <td style="font-weight:700;font-size:13px;padding:3px 0;width:38%;">Test Name</td>
      <td style="font-weight:700;font-size:13px;padding:3px 0;width:18%;">Result</td>
      <td style="font-weight:700;font-size:13px;padding:3px 0;width:14%;">Unit</td>
      <td style="font-weight:700;font-size:13px;padding:3px 0;width:30%;">Reference Range</td>
    </tr>
    <!-- Test name row -->
    <tr>
      <td colspan="4" style="font-weight:700;font-size:13px;padding:4px 0 3px;border-bottom:1px solid #aaa;">${testName}</td>
    </tr>
    ${rowsHtml}
    <!-- Divider between test groups (no extra vertical padding) -->
    <tr><td colspan="4" style="padding:0;border-bottom:1px solid #000;"></td></tr>
  `;
}

export function buildPrintHtml({
  labName,
  patientInfo,
  reportId,
  createdAt,
  patientCreatedAt,
  testGroups,
  reportTopSpace,
  reportBottomSpace,
  includeHeader,
}: {
  labName: string;
  patientInfo: PatientInfo;
  reportId: string;
  createdAt: string;
  patientCreatedAt: string;
  testGroups: PrintTestGroup[];
  reportTopSpace: number;
  reportBottomSpace: number;
  includeHeader?: boolean;
}): string {
  const showHeader = includeHeader !== false;
  const regDate    = formatDate(patientCreatedAt);
  const reportDate = formatDate(new Date().toISOString());

  const patientNameDisplay = patientInfo.patientName || "—";
  const genderAge  = [patientInfo.gender, patientInfo.age].filter(Boolean).join(" / ");
  const doctor     = patientInfo.doctorName ? `Dr. ${patientInfo.doctorName}` : "—";

  const allTestsHtml = testGroups.map(testSectionHtml).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=800" />
  <title>Report — ${patientNameDisplay}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 13px;
      color: #000;
      background: #fff;
      height: fit-content;
    }
    table { border-collapse: collapse; }
    .report-inner {
      padding-left: 58px;
      padding-right: 58px;
      padding-top: ${reportTopSpace}%;
      padding-bottom: ${reportBottomSpace}%;
    }
    @media print {
      @page { margin: 0; size: A4; }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      /* Hide any floating UI injected by the report-view page */
      button { display: none !important; }
    }
  </style>
</head>
<body>
<div class="report-inner">

  <!-- ── Lab name header ── -->
  ${showHeader ? `<div style="text-align:center;font-size:20px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding-bottom:8px;">
    ${labName}
  </div>` : ""}

  <!-- ── Patient info: two-column grid ── -->
  <table style="width:100%;margin-bottom:0;">
    <tr>
      <td style="width:50%;vertical-align:top;padding-bottom:2px;">
        <table>
          <tr>
            <td style="font-weight:700;white-space:nowrap;padding-right:4px;">Reg No</td>
            <td style="padding-right:8px;">:</td>
            <td style="font-weight:700;">${reportId}</td>
          </tr>
          <tr>
            <td style="font-weight:700;white-space:nowrap;padding-right:4px;">Name</td>
            <td style="padding-right:8px;">:</td>
            <td style="font-weight:700;">${patientNameDisplay}</td>
          </tr>
          <tr>
            <td style="font-weight:700;white-space:nowrap;padding-right:4px;">Referred Dr</td>
            <td style="padding-right:8px;">:</td>
            <td style="font-weight:700;">${doctor}</td>
          </tr>
        </table>
      </td>
      <td style="width:50%;vertical-align:top;">
        <table>
          <tr>
            <td style="font-weight:700;white-space:nowrap;padding-right:4px;">Sex / Age</td>
            <td style="padding-right:8px;">:</td>
            <td style="font-weight:700;">${genderAge || "—"}</td>
          </tr>
          <tr>
            <td style="font-weight:700;white-space:nowrap;padding-right:4px;">Reg Date</td>
            <td style="padding-right:8px;">:</td>
            <td style="font-weight:700;">${regDate}</td>
          </tr>
          <tr>
            <td style="font-weight:700;white-space:nowrap;padding-right:4px;">Report Date</td>
            <td style="padding-right:8px;">:</td>
            <td style="font-weight:700;">${reportDate}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- ── Full-width divider below patient info ── -->
  <div style="border-top:1px solid #000;margin:8px 0 0;"></div>

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
