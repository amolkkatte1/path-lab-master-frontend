"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiCamera, FiCheck, FiImage, FiPrinter, FiSave, FiX } from "react-icons/fi";
import { saveReport } from "@/app/actions";
import { API_ENDPOINTS, getGenerateReportPdfUrl } from "@/lib/api";
import { buildPrintHtml } from "./report-print-view";

export type PendingParameter = {
  parameterName: string;
  value: string | null;
  sequence: number;
  dataType: string;
  unit: string | null;
  formula: string | null;
  upperRange: number | null;
  lowerRange: number | null;
  isBold: boolean | null;
  isNameBold: boolean | null;
  isDescriptionParameter: boolean | null;
  isValueRequired: boolean | null;
  isValueDiscription: boolean | null;
  parameterRange: string | null;
};

export type TestStatus = {
  isSaved: boolean;
  isApproved: boolean;
  isPrinted: boolean;
  isImageUploadEnable?: boolean;
};

export type ReportData = {
  reportId: string;
  patientId: string;
  labId: string;
  pendingTest: Record<string, PendingParameter[]>;
  completedTest: Record<string, PendingParameter[]>;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  status: Record<string, TestStatus>;
};

export type PatientInfo = {
  patientName?: string;
  gender?: string;
  age?: string;
  doctorName?: string;
  mobileNumber?: string;
  createdAt?: string;
};

type PendingTestGroup = {
  key: string;
  code: string;
  category: string;
  parameters: PendingParameter[];
};

type SaveAction = "save" | "approve" | "approve_print";

function buildStatusFlags(action: SaveAction): TestStatus {
  return {
    isSaved: true,
    isApproved: action === "approve" || action === "approve_print",
    isPrinted: action === "approve_print",
  };
}

/**
 * Evaluates a formula string by substituting parameter names (from nameToValue map)
 * with their numeric values, then computing the arithmetic result.
 * Returns the result rounded to 2 decimal places, or "" on error.
 */
function evaluateFormula(formula: string, nameToValue: Map<string, string>): string {
  if (!formula.trim()) return "";

  // Sort names longest-first to avoid partial replacements
  // e.g. "PACKED CELL VOLUME (PCV)" before "PCV"
  const sortedNames = [...nameToValue.keys()].sort((a, b) => b.length - a.length);

  let expr = formula;
  for (const name of sortedNames) {
    const val = nameToValue.get(name) ?? "";
    const num = parseFloat(val);
    if (!Number.isNaN(num)) {
      // Escape special regex chars in parameter name, then replace all occurrences
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      expr = expr.replace(new RegExp(escaped, "g"), String(num));
    }
  }

  // Only allow safe arithmetic characters
  if (!/^[\d\s+\-*/().]+$/.test(expr)) return "";

  try {
    // eslint-disable-next-line no-new-func
    const result = new Function(`"use strict"; return (${expr});`)() as number;
    if (!isFinite(result) || isNaN(result)) return "";
    return String(Math.round(result * 100) / 100);
  } catch {
    return "";
  }
}

/**
 * Given a sorted list of parameters and a map of sequence→currentValue,
 * computes values for all formula-based parameters.
 * Returns a sequence→computed value map.
 */
function computeFormulaValues(
  parameters: PendingParameter[],
  currentValues: Map<number, string>,
  formulaOverrides: Record<number, string> = {},
): Map<number, string> {
  const sorted = [...parameters].sort((a, b) => a.sequence - b.sequence);
  // Build name→value as we process in order (so earlier values feed later formulas)
  const nameToValue = new Map<string, string>();
  const result = new Map<number, string>();

  for (const p of sorted) {
    const currentVal = currentValues.get(p.sequence) ?? p.value ?? "";

    if (p.formula && p.formula.trim()) {
      const computed = formulaOverrides[p.sequence] ?? evaluateFormula(p.formula, nameToValue);
      result.set(p.sequence, computed);
      // Use computed value for downstream formulas
      nameToValue.set(p.parameterName, computed);
    } else {
      // Use the current input value for downstream formulas
      nameToValue.set(p.parameterName, currentVal);
    }
  }

  return result;
}

function normalizeOcrKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const OCR_PROXY_SAFE_IMAGE_BYTES = 4_000_000;

async function compressAndroidImage(file: File): Promise<{
  file: File;
  compression?: { width: number; height: number; quality: number };
}> {
  if (file.size <= OCR_PROXY_SAFE_IMAGE_BYTES) return { file };

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context || !image.naturalWidth || !image.naturalHeight) {
      throw new Error("Could not prepare the Android photo for upload.");
    }

    let bestCandidate: { blob: Blob; width: number; height: number; quality: number } | null = null;
    for (const [maxDimension, quality] of [[4096, 0.94], [3800, 0.91], [3400, 0.88]] as const) {
      const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (!blob) continue;
      if (!bestCandidate || blob.size < bestCandidate.blob.size) {
        bestCandidate = { blob, width: canvas.width, height: canvas.height, quality };
      }
      if (blob.size <= OCR_PROXY_SAFE_IMAGE_BYTES) break;
    }

    if (!bestCandidate || bestCandidate.blob.size >= file.size || bestCandidate.blob.size > OCR_PROXY_SAFE_IMAGE_BYTES) {
      throw new Error("Could not fit this Android photo under the upload limit while preserving image detail. Try taking a closer photo.");
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "patient-image";
    return {
      file: new File([bestCandidate.blob], `${baseName}.jpg`, {
        type: "image/jpeg",
        lastModified: file.lastModified,
      }),
      compression: {
        width: bestCandidate.width,
        height: bestCandidate.height,
        quality: bestCandidate.quality,
      },
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function extractOcrValues(payload: unknown): Record<string, string> {
  const values: Record<string, string> = {};
  const ignoredKeys = new Set(["success", "message", "status", "error", "filename"]);
  const keyNames = ["key", "name", "parameter", "parametername", "label"];
  const valueNames = ["value", "text", "result", "extractedvalue", "recognizedvalue", "recognizedtext", "ocrvalue"];

  function visit(value: unknown, parentKey = "") {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          const record = item as Record<string, unknown>;
          const keyEntry = Object.entries(record).find(([key]) => keyNames.includes(normalizeOcrKey(key)));
          const valueEntry = Object.entries(record).find(([key]) => valueNames.includes(normalizeOcrKey(key)));
          if (keyEntry && valueEntry && (typeof valueEntry[1] === "string" || typeof valueEntry[1] === "number")) {
            values[String(keyEntry[1])] = String(valueEntry[1]);
            continue;
          }
        }
        visit(item);
      }
      return;
    }
    if (!value || typeof value !== "object") return;

    const record = value as Record<string, unknown>;
    for (const [key, item] of Object.entries(record)) {
      const normalized = normalizeOcrKey(key);
      if (["data", "result", "results", "values", "extracted", "extraction", "output"].includes(normalized)) {
        visit(item);
      } else if ((typeof item === "string" || typeof item === "number") && !ignoredKeys.has(normalized)) {
        values[key] = String(item);
      } else if (item && typeof item === "object") {
        const child = item as Record<string, unknown>;
        const valueEntry = Object.entries(child).find(([childKey]) => valueNames.includes(normalizeOcrKey(childKey)));
        if (valueEntry && (typeof valueEntry[1] === "string" || typeof valueEntry[1] === "number")) {
          values[key || parentKey] = String(valueEntry[1]);
        } else {
          visit(item, key);
        }
      }
    }
  }

  visit(payload);
  return values;
}

function openPrintWindow(html: string | string[]) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const singleHtml = Array.isArray(html) ? html[0] : html;

  if (isIOS) {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.open();
    win.document.write(singleHtml);
    win.document.close();
    const tryPrint = () => { try { win.focus(); win.print(); } catch { /* ignore */ } };
    if (win.document.readyState === "complete") tryPrint();
    else { win.onload = tryPrint; setTimeout(tryPrint, 800); }
    return;
  }

  // Desktop + Android: hidden iframe
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;border:0;opacity:0;";
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
  if (!doc) { document.body.removeChild(iframe); return; }
  doc.open();
  doc.write(singleHtml);
  doc.close();
  const printAndClean = () => {
    try { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); }
    finally { setTimeout(() => document.body.removeChild(iframe), 1000); }
  };
  if (iframe.contentDocument?.readyState === "complete") printAndClean();
  else { iframe.onload = printAndClean; setTimeout(printAndClean, 800); }
}

export function PendingTestsEditor({
  tests,
  reportData,
  currentUserId,
  labName,
  patientInfo,
  reportTopSpace,
  reportBottomSpace,
  ocrKeysByTest = {},
  ocrColumnCount = 1,
  ocrTestKeyMapping = {},
}: Readonly<{
  tests: PendingTestGroup[];
  reportData: ReportData;
  currentUserId: string;
  labName: string;
  patientInfo: PatientInfo;
  reportTopSpace: number;
  reportBottomSpace: number;
  ocrKeysByTest?: Record<string, string[]>;
  ocrColumnCount?: number;
  ocrTestKeyMapping?: Record<string, Record<string, string>>;
}>) {
  const [activeTest, setActiveTest] = useState<PendingTestGroup | null>(null);
  const [boldMap, setBoldMap] = useState<Record<number, boolean>>({});
  const [oorMap, setOorMap] = useState<Record<number, boolean>>({});
  const [formulaValueMap, setFormulaValueMap] = useState<Map<number, string>>(new Map());
  const [formulaOverrides, setFormulaOverrides] = useState<Record<number, string>>({});
  const [parameterValueOverrides, setParameterValueOverrides] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState<SaveAction | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrMessage, setOcrMessage] = useState<string | null>(null);
  const [ocrLogs, setOcrLogs] = useState<string[]>([]);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [includeHeader, setIncludeHeader] = useState(false);
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function checkOor(value: string, lower: number | null, upper: number | null): boolean {
    const num = parseFloat(value);
    if (Number.isNaN(num)) return false;
    const lo = lower !== null && lower !== ("" as unknown) ? Number(lower) : null;
    const hi = upper !== null && upper !== ("" as unknown) ? Number(upper) : null;
    if (lo !== null && !Number.isNaN(lo) && num < lo) return true;
    if (hi !== null && !Number.isNaN(hi) && num > hi) return true;
    return false;
  }

  function openTest(test: PendingTestGroup) {
    const boldSeed: Record<number, boolean> = {};
    const oorSeed: Record<number, boolean> = {};
    // Seed current values map from existing parameter values
    const currentValues = new Map<number, string>();
    for (const p of test.parameters) {
      boldSeed[p.sequence] = p.isBold ?? false;
      const val = p.value ?? "";
      currentValues.set(p.sequence, val);
      oorSeed[p.sequence] = checkOor(val, p.lowerRange, p.upperRange);
    }
    const formulaSeed = computeFormulaValues(test.parameters, currentValues);
    // Re-check OOR for formula-computed values
    for (const p of test.parameters) {
      if (p.formula?.trim() && formulaSeed.has(p.sequence)) {
        const computed = formulaSeed.get(p.sequence) ?? "";
        oorSeed[p.sequence] = checkOor(computed, p.lowerRange, p.upperRange);
      }
    }
    setBoldMap(boldSeed);
    setOorMap(oorSeed);
    setFormulaValueMap(formulaSeed);
    setFormulaOverrides({});
    setParameterValueOverrides({});
    setApiError(null);
    setOcrError(null);
    setOcrMessage(null);
    setShowPrintOptions(false);
    setIncludeHeader(false);
    inputRefs.current = {};
    setActiveTest(test);
  }

  function updateBold(sequence: number, isBold: boolean) {
    setBoldMap((prev) => ({ ...prev, [sequence]: isBold }));
  }

  function recalculateFormulas(
    changedSequence: number,
    newValue: string,
    formulaOverridesOverride?: Record<number, string>,
    parameterValueOverridesOverride?: Record<number, string>,
  ) {
    if (!activeTest) return;
    // Build current values: inputRefs for non-formula params, override with the change
    const currentValues = new Map<number, string>();
    for (const p of activeTest.parameters) {
      if (p.formula?.trim()) continue; // formula params get their value computed
      const inputVal = inputRefs.current[p.sequence]?.value
        ?? parameterValueOverridesOverride?.[p.sequence]
        ?? parameterValueOverrides[p.sequence]
        ?? p.value
        ?? "";
      currentValues.set(p.sequence, p.sequence === changedSequence ? newValue : inputVal);
    }
    const newFormulaMap = computeFormulaValues(
      activeTest.parameters,
      currentValues,
      formulaOverridesOverride ?? formulaOverrides,
    );
    setFormulaValueMap(newFormulaMap);
    // Update OOR for formula params
    setOorMap((prev) => {
      const next = { ...prev };
      for (const p of activeTest.parameters) {
        if (p.formula?.trim() && newFormulaMap.has(p.sequence)) {
          next[p.sequence] = checkOor(newFormulaMap.get(p.sequence) ?? "", p.lowerRange, p.upperRange);
        }
      }
      return next;
    });
  }

  function collectParameters(): PendingParameter[] {
    if (!activeTest) return [];
    // Build final value map: user inputs first, then re-run formula computation
    const currentValues = new Map<number, string>();
    for (const p of activeTest.parameters) {
      if (!p.formula?.trim()) {
        currentValues.set(
          p.sequence,
          p.isDescriptionParameter
            ? (parameterValueOverrides[p.sequence] ?? p.value ?? "")
            : (inputRefs.current[p.sequence]?.value ?? parameterValueOverrides[p.sequence] ?? p.value ?? ""),
        );
      }
    }
    const finalFormulaMap = computeFormulaValues(activeTest.parameters, currentValues, formulaOverrides);

    return activeTest.parameters.map((p) => ({
      ...p,
      value: p.formula?.trim()
        ? (finalFormulaMap.get(p.sequence) ?? p.value ?? "")
        : p.isDescriptionParameter
          ? (parameterValueOverrides[p.sequence] ?? p.value ?? "")
          : (inputRefs.current[p.sequence]?.value ?? parameterValueOverrides[p.sequence] ?? p.value ?? ""),
      isBold: boldMap[p.sequence] ?? p.isBold ?? false,
    }));
  }

  function writeOcrLog(level: "info" | "warn" | "error", message: string, details?: unknown) {
    let detailText = "";
    if (details !== undefined) {
      if (typeof details === "string") detailText = details;
      else {
        try {
          detailText = JSON.stringify(details);
        } catch {
          detailText = String(details);
        }
      }
    }
    const line = `${new Date().toLocaleTimeString()} ${level.toUpperCase()} ${message}${detailText ? ` — ${detailText}` : ""}`;
    setOcrLogs((current) => [...current.slice(-39), line]);
    if (level === "error") console.error(`[OCR] ${message}`, details ?? "");
    else if (level === "warn") console.warn(`[OCR] ${message}`, details ?? "");
    else console.info(`[OCR] ${message}`, details ?? "");
  }

  async function handleOcrImage(file: File | undefined) {
    if (!file || !activeTest) return;
    setOcrError(null);
    setOcrMessage(null);
    setOcrLogs([]);
    const testName = activeTest.code.trim();
    console.groupCollapsed(`[OCR] ${testName}`);
    writeOcrLog("info", "Image selected", {
      name: file.name,
      type: file.type,
      sizeBytes: file.size,
    });
    const normalizedTestName = normalizeOcrKey(testName);
    const keysForTest = ocrKeysByTest[testName]
      ?? Object.entries(ocrKeysByTest).find(([configuredTestName]) => normalizeOcrKey(configuredTestName) === normalizedTestName)?.[1]
      ?? [];
    const mappingForTest = ocrTestKeyMapping[testName]
      ?? Object.entries(ocrTestKeyMapping).find(([configuredTestName]) => normalizeOcrKey(configuredTestName) === normalizedTestName)?.[1]
      ?? {};
    writeOcrLog("info", "OCR configuration", { keys: keysForTest, columnCount: ocrColumnCount, testKeyMapping: mappingForTest });
    if (keysForTest.length === 0) {
      const message = `OCR keys are not configured for ${testName}.`;
      writeOcrLog("error", "OCR stopped", message);
      setOcrError(message);
      console.groupEnd();
      return;
    }

    setIsOcrProcessing(true);
    try {
      const isAndroid = /Android/i.test(navigator.userAgent);
      const preparedImage = isAndroid ? await compressAndroidImage(file) : { file };
      const uploadImage = preparedImage.file;
      writeOcrLog("info", isAndroid ? "Android upload image prepared" : "Original image selected for upload", {
        name: uploadImage.name,
        type: uploadImage.type,
        originalSizeBytes: file.size,
        uploadSizeBytes: uploadImage.size,
        compressed: uploadImage !== file,
        compression: preparedImage.compression ?? "not needed",
      });
      const formData = new FormData();
      formData.append("image", uploadImage);
      formData.append("keys", JSON.stringify(keysForTest));
      formData.append("columnCount", String(ocrColumnCount));

      writeOcrLog("info", "Sending OCR request", {
        method: "POST",
        endpoint: API_ENDPOINTS.ocrExtract,
        fields: ["image", "keys", "columnCount"],
        imageSizeBytes: uploadImage.size,
        compressed: uploadImage !== file,
        keys: keysForTest,
        columnCount: String(ocrColumnCount),
      });
      const response = await fetch(API_ENDPOINTS.ocrExtract, {
        method: "POST",
        body: formData,
      });
      writeOcrLog("info", "OCR HTTP response", {
        status: response.status,
        ok: response.ok,
        url: response.url,
        redirected: response.redirected,
        contentType: response.headers.get("content-type"),
        contentLength: response.headers.get("content-length"),
        server: response.headers.get("server"),
        via: response.headers.get("via"),
      });
      const responseText = await response.text();
      let payload: unknown;
      try {
        payload = JSON.parse(responseText) as unknown;
      } catch {
        writeOcrLog("error", "OCR response was not valid JSON", responseText.slice(0, 500));
        const isOversized = response.status === 413 || /request entity too large|payload too large/i.test(responseText);
        if (isOversized) {
          throw new Error("The OCR upload was rejected as too large before processing. Check the receiving server, proxy, and gateway request limits.");
        }
        if (!response.ok) {
          throw new Error(responseText.trim().slice(0, 200) || `Image extraction failed (${response.status}).`);
        }
        throw new Error("The OCR service returned an unreadable response. Please try again.");
      }
      writeOcrLog("info", "OCR response body", payload);
      if (!response.ok) {
        if (response.status === 413) {
          throw new Error("The OCR upload was rejected as too large before processing. Check the receiving server, proxy, and gateway request limits.");
        }
        const responseMessage = payload && typeof payload === "object" && "message" in payload
          ? String((payload as { message?: unknown }).message ?? "")
          : "";
        throw new Error(responseMessage || `Image extraction failed (${response.status}).`);
      }
      if (payload && typeof payload === "object" && "status" in payload
        && String((payload as { status?: unknown }).status).toUpperCase() !== "SUCCESS") {
        throw new Error("The OCR service could not extract values from this image.");
      }

      const extractedValues = extractOcrValues(payload);
      const normalizedValues = new Map(
        Object.entries(extractedValues).map(([key, value]) => [normalizeOcrKey(key), value] as const),
      );
      const normalizedMapping = new Map(
        Object.entries(mappingForTest).map(([parameterName, ocrKey]) => [normalizeOcrKey(parameterName), normalizeOcrKey(ocrKey)] as const),
      );
      const nextParameterOverrides = { ...parameterValueOverrides };
      // Preserve OCR values for formula parameters. Other formula parameters
      // are recalculated from the updated dependency values below.
      const nextFormulaOverrides: Record<number, string> = {};
      const nextOorValues: Record<number, boolean> = {};
      let matchedCount = 0;

      for (const parameter of activeTest.parameters) {
        const normalizedParameter = normalizeOcrKey(parameter.parameterName);
        const mappedOcrKey = normalizedMapping.get(normalizedParameter);
        const extracted = (mappedOcrKey ? normalizedValues.get(mappedOcrKey) : undefined)
          ?? normalizedValues.get(normalizedParameter);
        if (extracted === undefined) continue;

        matchedCount += 1;
        nextParameterOverrides[parameter.sequence] = extracted;
        if (parameter.formula?.trim()) nextFormulaOverrides[parameter.sequence] = extracted;
        if (inputRefs.current[parameter.sequence] && !parameter.formula?.trim()) {
          inputRefs.current[parameter.sequence]!.value = extracted;
        }
        nextOorValues[parameter.sequence] = checkOor(extracted, parameter.lowerRange, parameter.upperRange);
      }

      if (matchedCount === 0) {
        writeOcrLog("warn", "OCR returned values, but none matched the active test parameters", {
          testKeyMapping: mappingForTest,
          parameterNames: activeTest.parameters.map((parameter) => parameter.parameterName),
          extractedKeys: Object.keys(extractedValues),
        });
        throw new Error("No image values matched this test's parameters.");
      }

      writeOcrLog("info", "OCR values matched to parameters", {
        matchedCount,
        values: Object.fromEntries(
          activeTest.parameters
            .filter((parameter) => nextParameterOverrides[parameter.sequence] !== undefined)
            .map((parameter) => [parameter.parameterName, nextParameterOverrides[parameter.sequence]]),
        ),
      });
      setParameterValueOverrides(nextParameterOverrides);
      setFormulaOverrides(nextFormulaOverrides);
      setOorMap((previous) => ({ ...previous, ...nextOorValues }));
      recalculateFormulas(-1, "", nextFormulaOverrides, nextParameterOverrides);
      setOcrMessage(`Filled ${matchedCount} parameter${matchedCount === 1 ? "" : "s"} from the image.`);
      writeOcrLog("info", "OCR autofill completed", { matchedCount });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to extract values from this image.";
      setOcrError(message);
      writeOcrLog("error", "OCR request failed", message);
    } finally {
      setIsOcrProcessing(false);
      console.groupEnd();
    }
  }

  async function handleSubmit(action: SaveAction) {
    if (!activeTest) return;
    setSubmitting(action);
    setApiError(null);

    const updatedParameters = collectParameters();

    const newPending = { ...reportData.pendingTest };
    delete newPending[activeTest.key];

    const newCompleted = {
      ...reportData.completedTest,
      [activeTest.key]: updatedParameters,
    };

    const newStatus = {
      ...reportData.status,
      [activeTest.key]: {
        ...reportData.status[activeTest.key],
        ...buildStatusFlags(action),
      },
    };

    try {
      const now = new Date()
        .toISOString()
        .replace("T", " ")
        .replace(/\.\d+Z$/, "");

      const result = await saveReport({
        reportId: reportData.reportId,
        patientId: reportData.patientId,
        labId: reportData.labId,
        pendingTest: newPending,
        completedTest: newCompleted,
        createdBy: reportData.createdBy,
        updatedBy: currentUserId,
        createdAt: reportData.createdAt,
        updatedAt: now,
        status: newStatus,
      });

      if (!result.ok) {
        setApiError(result.error);
        return;
      }

      if (action === "approve_print") {
        // Extract test ID from the key (e.g. "HAEMOGRAM ON CELL COUNTER_20260901184545955" → "20260901184545955")
        const testId = activeTest.key.replace(/^.*_(\d+)$/, "$1");
        const url = getGenerateReportPdfUrl(reportData.patientId, [testId], includeHeader);
        window.open(url, "_blank");
      }

      setActiveTest(null);
      router.refresh();
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <>
      <div className="pending-tests-table-scroll overflow-x-auto">
        <table className="pending-tests-table w-full min-w-[520px] text-left text-sm">
          <thead className="pending-tests-table-head text-slate-400">
            <tr className="text-xs uppercase tracking-[0.16em]">
              <th className="px-5 py-3 font-semibold">Test name</th>
              <th className="px-5 py-3 font-semibold">Category</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {tests.map((test) => (
              <tr
                key={test.key}
                onClick={() => openTest(test)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openTest(test);
                  }
                }}
                tabIndex={0}
                className="pending-tests-table-row cursor-pointer transition hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-400/60"
              >
                <td className="px-5 py-5">
                  <p className="font-semibold text-white">{test.code}</p>
                </td>
                <td className="px-5 py-4 text-slate-300">
                  {test.category || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeTest && (
        <dialog
          open
          className="fixed inset-0 z-50 m-0 flex h-full w-full items-center justify-center border-0 bg-slate-950/75 p-4 backdrop-blur-sm"
          aria-label={`Edit ${activeTest.code}`}
          aria-busy={isOcrProcessing}
        >
          {isOcrProcessing && (
            <div className="pending-test-ocr-overlay absolute inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" role="status" aria-live="assertive">
              <div className="pending-test-ocr-loading-card flex w-full max-w-sm flex-col items-center rounded-2xl border px-7 py-8 text-center shadow-2xl">
                <span className="mb-5 h-12 w-12 animate-spin rounded-full border-4 border-emerald-300/20 border-t-emerald-400" aria-hidden="true" />
                <p className="pending-test-ocr-loading-title text-base font-semibold">Reading image values</p>
                <p className="pending-test-ocr-loading-description mt-2 text-sm">Please wait while the test parameters are being filled.</p>
                {ocrLogs.length > 0 && (
                  <pre className="pending-test-ocr-loading-log mt-4 max-h-24 w-full overflow-y-auto whitespace-pre-wrap break-words text-left text-[11px]" aria-live="polite">
                    {ocrLogs.slice(-4).join("\n")}
                  </pre>
                )}
              </div>
            </div>
          )}
          <div className="pending-test-dialog max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border shadow-2xl">
            {/* Header */}
            <div className="pending-test-dialog-header sticky top-0 z-10 flex items-center justify-between border-b px-5 py-4 backdrop-blur">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  Result entry
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h2 className="text-xl font-semibold text-white">
                    {activeTest.code}
                  </h2>
                  {activeTest.category && (
                    <span className="text-sm text-emerald-300">
                      Category: {activeTest.category}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTest(null)}
                aria-label="Close parameter form"
                title="Close"
                className="pending-test-dialog-close rounded-full border p-2 transition"
              >
                <FiX />
              </button>
            </div>

            {/* Parameters */}
            <div className="space-y-3 p-5">
              {reportData.status[activeTest.key]?.isImageUploadEnable === true && (
                <section className="mb-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
                  <p className="mb-3 text-sm font-semibold text-white">Upload an image to fill test values</p>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(event) => {
                      void handleOcrImage(event.target.files?.[0]);
                      event.currentTarget.value = "";
                    }}
                  />
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      void handleOcrImage(event.target.files?.[0]);
                      event.currentTarget.value = "";
                    }}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      disabled={isOcrProcessing}
                      className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-600/70 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                    >
                      <FiCamera /> Take photo
                    </button>
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      disabled={isOcrProcessing}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 disabled:opacity-50"
                    >
                      <FiImage /> Choose from gallery
                    </button>
                  </div>
                  {ocrMessage && <p className="mt-3 text-sm text-emerald-300">{ocrMessage}</p>}
                  {ocrError && <p role="alert" className="mt-3 text-sm text-rose-300">{ocrError}</p>}
                  {ocrLogs.length > 0 && (
                    <div className="pending-test-ocr-log-panel mt-4 rounded-lg border p-3">
                      <p className="pending-test-ocr-log-title mb-2 text-xs font-semibold uppercase tracking-wide">OCR diagnostics</p>
                      <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-relaxed" aria-live="polite">
                        {ocrLogs.join("\n")}
                      </pre>
                    </div>
                  )}
                </section>
              )}

              {apiError && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                  <FiX className="shrink-0" />
                  {apiError}
                </div>
              )}

              {[...activeTest.parameters]
                .sort((a, b) => a.sequence - b.sequence)
                .filter((p) => p.sequence !== 1 && p.sequence !== 2)
                .filter((p) => !p.isDescriptionParameter)
                .map((parameter, index) => {
                  const isBold = boldMap[parameter.sequence] ?? parameter.isBold ?? false;
                  const nameBold = parameter.isNameBold ?? false;
                  const valueRequired = parameter.isValueRequired !== false;
                  const isOor = oorMap[parameter.sequence] ?? false;
                  const isFormula = !!(parameter.formula?.trim());
                  const formulaValue = formulaValueMap.get(parameter.sequence) ?? "";

                  return (
                    <div
                      key={`${parameter.sequence}-${index}`}
                      className={`pending-test-parameter grid gap-3 rounded-xl border p-4 ${valueRequired ? "sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_180px_auto]" : ""} sm:items-center`}
                    >
                      <span className={`text-sm${nameBold ? " font-semibold" : ""}`}>
                        {parameter.parameterName || parameter.value || " "}
                      </span>

                      {valueRequired && (
                        <>
                          {isFormula ? (
                            <div className="relative">
                              <input
                                ref={(el) => {
                                  inputRefs.current[parameter.sequence] = el;
                                }}
                                value={formulaOverrides[parameter.sequence] ?? formulaValue}
                                type={parameter.dataType?.toLowerCase() === "number" ? "number" : "text"}
                                min={parameter.lowerRange ?? undefined}
                                max={parameter.upperRange ?? undefined}
                                onChange={(event) => {
                                  const nextOverrides = { ...formulaOverrides, [parameter.sequence]: event.target.value };
                                  setFormulaOverrides(nextOverrides);
                                  recalculateFormulas(parameter.sequence, event.target.value, nextOverrides);
                                }}
                                className={`pending-test-parameter-input w-full rounded-lg border px-3 py-2.5 pr-14 outline-none${isBold ? " font-semibold" : ""}${isOor ? " is-out-of-range" : ""}`}
                                aria-label={`${parameter.parameterName} (auto-filled, editable)`}
                              />
                              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                                Auto
                              </span>
                            </div>
                          ) : (
                            <input
                              ref={(el) => {
                                inputRefs.current[parameter.sequence] = el;
                              }}
                              defaultValue={parameter.value ?? ""}
                              type={
                                parameter.dataType?.toLowerCase() === "number"
                                  ? "number"
                                  : "text"
                              }
                              min={parameter.lowerRange ?? undefined}
                              max={parameter.upperRange ?? undefined}
                              onChange={(e) => {
                                const oor = checkOor(e.target.value, parameter.lowerRange, parameter.upperRange);
                                setOorMap((prev) => ({ ...prev, [parameter.sequence]: oor }));
                                // A manual dependency edit starts a fresh formula
                                // calculation, replacing OCR or earlier overrides.
                                setFormulaOverrides({});
                                recalculateFormulas(parameter.sequence, e.target.value, {});
                              }}
                              className={`pending-test-parameter-input w-full rounded-lg border px-3 py-2.5 outline-none${isBold ? " font-semibold" : ""}${isOor ? " is-out-of-range" : ""}`}
                            />
                          )}
                          <span className="pending-test-parameter-meta text-xs">
                            {parameter.unit || ""}
                            {parameter.lowerRange !== null ||
                            parameter.upperRange !== null
                              ? ` ${parameter.lowerRange ?? ""}-${parameter.upperRange ?? ""}`
                              : ""}
                          </span>
                          <label
                            aria-label="Bold"
                            className="pending-test-bold-control flex items-center gap-2 text-s font-medium text-slate-400"
                          >
                            <input
                              type="checkbox"
                              checked={isBold}
                              onChange={(e) =>
                                updateBold(parameter.sequence, e.target.checked)
                              }
                              className="h-4 w-4 accent-emerald-500"
                            />
                          </label>
                        </>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Footer — action buttons */}
            <div className="pending-test-dialog-footer flex flex-wrap items-center justify-end gap-3 border-t px-5 py-4">
              <button
                type="button"
                onClick={() => setActiveTest(null)}
                disabled={submitting !== null}
                className="pending-test-dialog-close-button rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50"
              >
                Close
              </button>

              {/* Save */}
              <button
                type="button"
                onClick={() => handleSubmit("save")}
                disabled={submitting !== null}
                className="flex items-center gap-2 rounded-xl border border-slate-500/50 bg-slate-700/60 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
              >
                {submitting === "save" ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <FiSave className="shrink-0" />
                )}
                Save
              </button>

              {/* Approve */}
              <button
                type="button"
                onClick={() => handleSubmit("approve")}
                disabled={submitting !== null}
                className="flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-600/60 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
              >
                {submitting === "approve" ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <FiCheck className="shrink-0" />
                )}
                Approve
              </button>

              {/* Approve & Print */}
              <button
                type="button"
                onClick={() => { setShowPrintOptions(true); }}
                disabled={submitting !== null}
                className="flex items-center gap-2 rounded-xl border border-blue-500/50 bg-blue-600/60 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
              >
                {submitting === "approve_print" ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <FiPrinter className="shrink-0" />
                )}
                Approve &amp; Print
              </button>
            </div>

          </div>
        </dialog>
      )}

      {/* Print options popup */}
      {showPrintOptions && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Print options"
        >
          <div className="pending-test-dialog w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden">
            <div className="pending-test-dialog-header flex items-center justify-between border-b px-5 py-4 rounded-t-2xl">
              <h3 className="text-base font-semibold text-white">Print options</h3>
              <button
                type="button"
                onClick={() => setShowPrintOptions(false)}
                aria-label="Close print options"
                className="pending-test-dialog-close rounded-full border p-1.5 transition"
              >
                <FiX />
              </button>
            </div>

            <div className="px-5 py-5">
              <label className="flex cursor-pointer items-center gap-3 text-sm font-medium select-none">
                <input
                  type="checkbox"
                  checked={includeHeader}
                  onChange={(e) => setIncludeHeader(e.target.checked)}
                  className="h-4 w-4 accent-emerald-500"
                />
                Include Header
              </label>
            </div>

            <div className="pending-test-dialog-footer flex items-center justify-end gap-2 border-t px-5 py-4">
              <button
                type="button"
                onClick={() => setShowPrintOptions(false)}
                disabled={submitting !== null}
                className="pending-test-dialog-close-button rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { setShowPrintOptions(false); handleSubmit("approve_print"); }}
                disabled={submitting !== null}
                className="flex items-center gap-2 rounded-xl border border-blue-500/50 bg-blue-600/60 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
              >
                {submitting === "approve_print" ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <FiPrinter className="shrink-0" />
                )}
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
