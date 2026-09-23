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
  // If a custom range string is provided:
  // — if numeric bounds also exist, use parameterRange as the separator between them
  // — if no numeric bounds, show parameterRange directly (with \n → <br/>)
  if (parameterRange !== null && parameterRange !== "") {
    const lo = lower !== null && lower !== "" ? Number(lower) : null;
    const hi = upper !== null && upper !== "" ? Number(upper) : null;
    if (lo !== null && !Number.isNaN(lo) && hi !== null && !Number.isNaN(hi))
      return `${lo} ${parameterRange} ${hi}`;
    if (lo !== null && !Number.isNaN(lo)) return `&gt; ${lo}`;
    if (hi !== null && !Number.isNaN(hi)) return `&lt; ${hi}`;
    // No numeric bounds — show the text range directly, preserving line breaks
    return parameterRange.replace(/\n/g, "<br/>");
  }
  const lo = lower !== null && lower !== "" ? Number(lower) : null;
  const hi = upper !== null && upper !== "" ? Number(upper) : null;
  if ((lo === null || Number.isNaN(lo)) && (hi === null || Number.isNaN(hi))) return "";
  if (lo !== null && !Number.isNaN(lo) && hi !== null && !Number.isNaN(hi)) return `${lo} - ${hi}`;
  if (lo !== null && !Number.isNaN(lo)) return `&gt; ${lo}`;
  return `&lt; ${hi}`;
}

function testSectionHtml(group: PrintTestGroup, printMode: "individual" | "grouped", isLast = false, isFirst = false, showCategory = true): string {
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

  const tbodyStyle = printMode === "individual" && !isLast
    ? "page-break-after:always;break-after:page;"
    : printMode === "grouped" ? "page-break-inside:avoid;break-inside:avoid;" : "";

  return `<tbody style="${tbodyStyle}">
    <!-- Category heading: centred, bold, all-caps, always with border-top and border-bottom -->
    ${(showCategory && category) ? `<tr><td colspan="4" style="text-align:center;font-weight:700;font-size:13px;padding:6px 0 4px;border-top:1px solid #000;border-bottom:1px solid #000;">${category}</td></tr>` : ""}
    <!-- Column header row: only in individual mode for first test -->
    ${printMode === "individual" || isFirst ? `
    <tr style="border-top:1px solid #000;border-bottom:1px solid #000;">
      <td style="font-weight:700;font-size:13px;padding:3px 0;width:38%;">Test Name</td>
      <td style="font-weight:700;font-size:13px;padding:3px 0;width:18%;">Result</td>
      <td style="font-weight:700;font-size:13px;padding:3px 0;width:14%;">Unit</td>
      <td style="font-weight:700;font-size:13px;padding:3px 0;width:30%;">Reference Range</td>
    </tr>` : ""}
    <!-- Test name row -->
    <tr>
      <td colspan="4" style="font-weight:700;font-size:13px;padding:4px 0 3px;border-bottom:1px solid #aaa;">${testName}</td>
    </tr>
    ${rowsHtml}
    <!-- Divider between test groups -->
    <tr><td colspan="4" style="padding:0;border-bottom:1px solid #000;"></td></tr>
    ${printMode === "individual" ? `<tr><td colspan="4" style="text-align:center;font-size:13px;font-weight:700;padding:8px 0 4px;">End of ${testName}</td></tr>` : ""}
  </tbody>`;
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
  printMode,
  isIOS = false,
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
  printMode?: "individual" | "grouped";
  isIOS?: boolean;
}): string {
  const showHeader = includeHeader !== false;
  const mode = printMode ?? "individual";
  const regDate    = formatDate(patientCreatedAt);
  const reportDate = formatDate(new Date().toISOString());

  const patientNameDisplay = patientInfo.patientName || "—";
  const genderAge  = [patientInfo.gender, patientInfo.age].filter(Boolean).join(" / ");
  const doctor     = patientInfo.doctorName ? `Dr. ${patientInfo.doctorName}` : "—";

  // Shared patient header block (used in both iOS and standard paths)
  const patientHeaderHtml = `
    ${showHeader ? `<div style="text-align:center;font-size:20px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding-bottom:8px;">${labName}</div>` : ""}
    <table style="width:100%;border-collapse:collapse;margin-bottom:0;">
      <tr>
        <td style="width:50%;vertical-align:top;padding-bottom:2px;">
          <table>
            <tr><td style="font-weight:700;white-space:nowrap;padding-right:4px;">Reg No</td><td style="padding-right:8px;">:</td><td style="font-weight:700;">${reportId}</td></tr>
            <tr><td style="font-weight:700;white-space:nowrap;padding-right:4px;">Name</td><td style="padding-right:8px;">:</td><td style="font-weight:700;">${patientNameDisplay}</td></tr>
            <tr><td style="font-weight:700;white-space:nowrap;padding-right:4px;">Referred Dr</td><td style="padding-right:8px;">:</td><td style="font-weight:700;">${doctor}</td></tr>
          </table>
        </td>
        <td style="width:50%;vertical-align:top;">
          <table>
            <tr><td style="font-weight:700;white-space:nowrap;padding-right:4px;">Sex / Age</td><td style="padding-right:8px;">:</td><td style="font-weight:700;">${genderAge || "—"}</td></tr>
            <tr><td style="font-weight:700;white-space:nowrap;padding-right:4px;">Reg Date</td><td style="padding-right:8px;">:</td><td style="font-weight:700;">${regDate}</td></tr>
            <tr><td style="font-weight:700;white-space:nowrap;padding-right:4px;">Report Date</td><td style="padding-right:8px;">:</td><td style="font-weight:700;">${reportDate}</td></tr>
          </table>
        </td>
      </tr>
    </table>
    <div style="border-top:1px solid #000;margin:8px 0 0;"></div>
  `;

  // In grouped mode, sort tests by category so same-category tests are consecutive.
  // HAEMATOLOGY/CBC always comes first, then remaining categories alphabetically.
  const orderedGroups = mode === "grouped"
    ? [...testGroups].sort((a, b) => {
        const catOf = (g: PrintTestGroup) => {
          const sorted = [...g.parameters].sort((x, y) => x.sequence - y.sequence);
          const p = sorted.find((x) => x.sequence === 1);
          return p?.value?.trim() || p?.parameterName?.trim() || "";
        };
        const isCbcCat = (cat: string) => /haematology|haematology|hematology|cbc/i.test(cat);
        const isCbcCode = (code: string) => /cbc|haemogram/i.test(code);

        const catA = catOf(a);
        const catB = catOf(b);

        const aIsHaem = isCbcCat(catA) || isCbcCode(a.code);
        const bIsHaem = isCbcCat(catB) || isCbcCode(b.code);

        // HAEMATOLOGY group always first
        if (aIsHaem && !bIsHaem) return -1;
        if (!aIsHaem && bIsHaem) return 1;

        // Within same category, CBC/Haemogram test first
        if (catA === catB) {
          if (isCbcCode(a.code) && !isCbcCode(b.code)) return -1;
          if (!isCbcCode(a.code) && isCbcCode(b.code)) return 1;
          return 0;
        }

        // All other categories alphabetically
        return catA.localeCompare(catB);
      })
    : testGroups;

  const allTestsHtml = orderedGroups.map((g, i) => {
    const isLast = i === orderedGroups.length - 1;
    const isFirst = i === 0;

    // In grouped mode, suppress category if the previous test had the same one
    let showCategory = true;
    if (mode === "grouped" && i > 0) {
      const prevSorted = [...orderedGroups[i - 1].parameters].sort((a, b) => a.sequence - b.sequence);
      const prevCatParam = prevSorted.find((p) => p.sequence === 1);
      const prevCategory = prevCatParam?.value?.trim() || prevCatParam?.parameterName?.trim() || "";

      const curSorted = [...g.parameters].sort((a, b) => a.sequence - b.sequence);
      const curCatParam = curSorted.find((p) => p.sequence === 1);
      const curCategory = curCatParam?.value?.trim() || curCatParam?.parameterName?.trim() || "";

      if (curCategory && curCategory === prevCategory) showCategory = false;
    }

    return testSectionHtml(g, mode, isLast, isFirst, showCategory);
  }).join("");

  // ── iOS-specific layout ──
  // iOS Safari respects page-break-after on block <div> but not on <tbody>.
  // Each "page" is a self-contained div with the patient header + top/bottom spacing.
  if (isIOS) {
    const pageStyle = `padding: ${reportTopSpace}% 58px ${reportBottomSpace}%; background:#fff;`;
    const breakStyle = mode === "individual" ? "page-break-after:always;break-after:page;" : "page-break-inside:avoid;break-inside:avoid;";

    const iosPages = orderedGroups.map((g, i) => {
      const isLast = i === orderedGroups.length - 1;
      const isFirstG = i === 0;
      let showCategory = true;
      if (mode === "grouped" && i > 0) {
        const prevSorted = [...orderedGroups[i - 1].parameters].sort((a, b) => a.sequence - b.sequence);
        const prevCatParam = prevSorted.find((p) => p.sequence === 1);
        const prevCategory = prevCatParam?.value?.trim() || prevCatParam?.parameterName?.trim() || "";
        const curSorted = [...g.parameters].sort((a, b) => a.sequence - b.sequence);
        const curCatParam = curSorted.find((p) => p.sequence === 1);
        const curCategory = curCatParam?.value?.trim() || curCatParam?.parameterName?.trim() || "";
        if (curCategory && curCategory === prevCategory) showCategory = false;
      }

      const sectionHtml = testSectionHtml(g, mode, isLast, isFirstG, showCategory);

      if (mode === "individual") {
        // Each test = its own full page with header repeated
        const breakAfter = isLast ? "" : "page-break-after:always;break-after:page;";
        return `<div style="${pageStyle}${breakAfter}">
          ${patientHeaderHtml}
          <table style="width:100%;border-collapse:collapse;">${sectionHtml}</table>
          <div style="text-align:center;margin-top:5px;font-size:13px;font-weight:700;">End of ${(() => {
            const sorted = [...g.parameters].sort((a, b) => a.sequence - b.sequence);
            const p = sorted.find((x) => x.sequence === 2);
            return p?.parameterName?.trim() || p?.value?.trim() || g.code;
          })()}</div>
        </div>`;
      }
      return sectionHtml;
    }).join("");

    if (mode === "grouped") {
      const groupedBody = `<div style="${pageStyle}page-break-inside:avoid;break-inside:avoid;">
        ${patientHeaderHtml}
        <table style="width:100%;border-collapse:collapse;">${iosPages}</table>
        <div style="text-align:center;margin-top:5px;font-size:13px;font-weight:700;">End of Report</div>
      </div>`;

      return `<!DOCTYPE html><html lang="en"><head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
        <title>Report — ${patientNameDisplay}</title>
        <style>* { box-sizing:border-box;margin:0;padding:0; } body { font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#000;background:#fff; } table { border-collapse:collapse; }
        @media print { @page { margin:0;size:A4; } * { -webkit-print-color-adjust:exact!important;print-color-adjust:exact!important; } }</style>
      </head><body>${groupedBody}</body></html>`;
    }

    return `<!DOCTYPE html><html lang="en"><head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
      <title>Report — ${patientNameDisplay}</title>
      <style>* { box-sizing:border-box;margin:0;padding:0; } body { font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#000;background:#fff; } table { border-collapse:collapse; }
      @media print { @page { margin:0;size:A4; } * { -webkit-print-color-adjust:exact!important;print-color-adjust:exact!important; } }</style>
    </head><body>${iosPages}</body></html>`;
  }

  // ── Standard layout (desktop + Android) ──

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
      background: #f1f5f9;
    }
    table { border-collapse: collapse; }
    #report-wrap {
      width: 800px;
      transform-origin: top left;
      background: #fff;
    }
    .report-inner {
      padding-left: 58px;
      padding-right: 58px;
    }
    #dl-bar {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      background: #1e293b;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      z-index: 999;
      font-family: Arial, sans-serif;
    }
    #dl-bar span { color: #94a3b8; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    #dl-bar button {
      flex-shrink: 0;
      background: #2563eb; color: #fff; border: none;
      border-radius: 8px; padding: 9px 18px;
      font-size: 14px; font-weight: 600; cursor: pointer;
    }
    @media print {
      @page { margin: 0; size: A4; margin-bottom: ${reportBottomSpace}%; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      #dl-bar { display: none !important; }
      body { background: #fff; }
      #report-wrap { transform: none !important; width: 100% !important; }
      tbody { -webkit-column-break-inside: avoid; }
      thead { display: table-header-group; }
    }
  </style>
  <script>
    (function() {
      var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      function applyScale() {
        var scale = Math.min(1, (window.innerWidth || 800) / 800);
        var wrap = document.getElementById('report-wrap');
        if (wrap) {
          wrap.style.transform = 'scale(' + scale + ')';
          document.body.style.height = Math.ceil(wrap.offsetHeight * scale) + 'px';
        }
      }
      document.addEventListener('DOMContentLoaded', function() {
        applyScale();
        var bar = document.getElementById('dl-bar');
        if (!bar) return;
        if (isIOS) {
          bar.innerHTML = '<span style="color:#94a3b8;font-size:12px;line-height:1.4;">Tap the Share button &#x2197; in Safari then choose <strong style="color:#fff">Print</strong> or <strong style="color:#fff">Save to Files</strong></span>';
        } else {
          var btn = document.getElementById('dl-btn');
          if (btn) btn.style.display = 'flex';
        }
      });
      window.addEventListener('resize', applyScale);
    })();
  </script>
</head>
<body>
<div id="report-wrap">
<div class="report-inner">

  <table style="width:100%;border-collapse:collapse;">
    <thead>
      <tr>
        <td colspan="4" style="padding-top:${reportTopSpace}%;padding-bottom:0;">
          ${patientHeaderHtml}
        </td>
      </tr>
    </thead>

    ${allTestsHtml}
  </table>

  <div style="text-align:center;margin-top:5px;margin-bottom:8px;font-size:13px;font-weight:700;">
    End of Report
  </div>

</div>
</div>

<div id="dl-bar">
  <span>Report — ${patientNameDisplay}</span>
  <button id="dl-btn" onclick="window.print()" style="display:none;">&#8681; Save / Print</button>
</div>

</body>
</html>`;
}
