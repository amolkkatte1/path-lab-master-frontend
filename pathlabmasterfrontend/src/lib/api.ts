export const API_BASE_URL = "https://path-lab-master.onrender.com";

export const API_ENDPOINTS = {
  login: `${API_BASE_URL}/user/login`,
  users: `${API_BASE_URL}/user/list`,
  createUser: `${API_BASE_URL}/user/create`,
  updateUser: `${API_BASE_URL}/user/update`,
  getUser: `${API_BASE_URL}/user/get`,
  deleteUser: `${API_BASE_URL}/user/delete`,
  userTypeList: `${API_BASE_URL}/userType/list`,
  createUserType: `${API_BASE_URL}/userType/create`,
  updateUserType: `${API_BASE_URL}/userType/update`,
  getUserType: `${API_BASE_URL}/userType/get`,
  deleteUserType: `${API_BASE_URL}/userType/delete`,
  labs: `${API_BASE_URL}/lab/list`,
  createLab: `${API_BASE_URL}/lab/create`,
  updateLab: `${API_BASE_URL}/lab/update`,
  getLab: `${API_BASE_URL}/lab/get`,
  deleteLab: `${API_BASE_URL}/lab/delete`,
  patientList: `${API_BASE_URL}/patient/list`,
  createPatient: `${API_BASE_URL}/patient/create`,
  getPatient: `${API_BASE_URL}/patient/get`,
  updatePatient: `${API_BASE_URL}/patient/update`,
  tests: `${API_BASE_URL}/test/list`,
  testList: `${API_BASE_URL}/test/list`,
  createTest: `${API_BASE_URL}/test/create`,
  getTest: `${API_BASE_URL}/test/get`,
  updateTest: `${API_BASE_URL}/test/update`,
  deleteTest: `${API_BASE_URL}/test/delete`,
  registerReport: `${API_BASE_URL}/report/register`,
  addReport: `${API_BASE_URL}/report/add`,
  saveReport: `${API_BASE_URL}/report/save`,
  reportBilling: `${API_BASE_URL}/report/billing`,
  billingCreate: `${API_BASE_URL}/billing/create`,
  billingUpdate: `${API_BASE_URL}/billing/update`,
  ocrExtract: "https://ocr-reader-a5gk.onrender.com/ocr/extract",
  reportListFilter: `${API_BASE_URL}/report/list/filter`,
  doctorList: `${API_BASE_URL}/doctor/list`,
  createDoctor: `${API_BASE_URL}/doctor/create`,
  getDoctor: `${API_BASE_URL}/doctor/get`,
  updateDoctor: `${API_BASE_URL}/doctor/update`,
  deleteDoctor: `${API_BASE_URL}/doctor/delete`,
  parameterList: `${API_BASE_URL}/parameter/list`,
  createParameter: `${API_BASE_URL}/parameter/create`,
  getParameter: `${API_BASE_URL}/parameter/get`,
  updateParameter: `${API_BASE_URL}/parameter/update`,
  deleteParameter: `${API_BASE_URL}/parameter/delete`,
} as const;

export function getPatientListByLabId(labId: number | string) {
  return `${API_BASE_URL}/patient/list/labId/${labId}`;
}

export function getPendingPatientsByLabId(labId: number | string) {
  return `${API_BASE_URL}/report/pending-patient/labId/${labId}`;
}

export function getPatientCountTodayByLabId(labId: number | string) {
  return `${API_BASE_URL}/patient/count/today/labId/${labId}`;
}

export function getPatientDashboardByLabId(labId: number | string) {
  return `${API_BASE_URL}/patient/dashboard/labId/${labId}`;
}

export function getPendingReportsByPatientId(
  patientId: number | string,
  labId: number | string,
) {
  return `${API_BASE_URL}/report/pending-reports/patientId/${patientId}/labId/${labId}`;
}

export function getDoctorListByLabId(labId: number | string) {
  return `${API_BASE_URL}/doctor/list/labId/${labId}`;
}

export function getConfigByLabId(labId: number | string) {
  return `${API_BASE_URL}/config/get/labId/${labId}`;
}

export function getOcrTestKeysFromConfig(payload: unknown): Record<string, string[]> {
  const queue: unknown[] = [payload];

  while (queue.length > 0) {
    const current = queue.shift();
    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }
    if (!current || typeof current !== "object") continue;

    const record = current as Record<string, unknown>;
    for (const [key, value] of Object.entries(record)) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (normalizedKey === "testkeys" && value && typeof value === "object" && !Array.isArray(value)) {
        const testKeys: Record<string, string[]> = {};
        for (const [testName, keys] of Object.entries(value as Record<string, unknown>)) {
          if (!Array.isArray(keys)) continue;
          const strings = keys.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
          if (strings.length > 0) testKeys[testName] = strings;
        }
        return testKeys;
      }
      if (value && typeof value === "object") queue.push(value);
    }
  }

  return {};
}

function findConfigValue(payload: unknown, wantedKey: string): unknown {
  const queue: unknown[] = [payload];
  while (queue.length > 0) {
    const current = queue.shift();
    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }
    if (!current || typeof current !== "object") continue;
    for (const [key, value] of Object.entries(current as Record<string, unknown>)) {
      if (key.toLowerCase().replace(/[^a-z0-9]/g, "") === wantedKey) return value;
      if (value && typeof value === "object") queue.push(value);
    }
  }
  return undefined;
}

export function getOcrColumnCountFromConfig(payload: unknown): number {
  const value = findConfigValue(payload, "columncount");
  const count = typeof value === "number" ? value : Number(value);
  return Number.isInteger(count) && count > 0 ? count : 1;
}

export function getOcrTestKeyMappingFromConfig(
  payload: unknown,
): Record<string, Record<string, string>> {
  const value = findConfigValue(payload, "testkeymapping");
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const mappings: Record<string, Record<string, string>> = {};
  for (const [testName, mapping] of Object.entries(value as Record<string, unknown>)) {
    if (!mapping || typeof mapping !== "object" || Array.isArray(mapping)) continue;
    const entries = Object.entries(mapping as Record<string, unknown>)
      .filter((entry): entry is [string, string] => typeof entry[1] === "string" && Boolean(entry[1].trim()))
      .map(([parameterName, ocrKey]) => [parameterName.trim(), ocrKey.trim()] as const);
    if (entries.length > 0) mappings[testName] = Object.fromEntries(entries);
  }
  return mappings;
}

const LARGE_INTEGER_PATTERN = /:\s*(-?\d{16,})(?=\s*[,}\]])/g;

export async function parseApiResponse<T>(response: Response) {
  const text = await response.text();
  const normalized = text.replace(LARGE_INTEGER_PATTERN, ': "$1"');

  return JSON.parse(normalized) as T;
}

export function stringifyApiPayload(
  payload: Record<string, unknown>,
  integerKeys: string[] = [],
) {
  const integerKeySet = new Set(integerKeys);

  return JSON.stringify(payload, (key, value) => {
    if (
      integerKeySet.has(key) &&
      typeof value === "string" &&
      /^-?\d+$/.test(value)
    ) {
      return `__RAW_INTEGER__${value}`;
    }

    return value;
  }).replace(/"__RAW_INTEGER__(-?\d+)"/g, "$1");
}

export function getGenerateReportPdfUrl(
  patientId: string,
  testIds: string[],
  includeHeader: boolean,
  printGroup = false,
) {
  const rIds = testIds.join("|");
  const hdr = includeHeader ? "true" : "false";
  const pg = printGroup ? "true" : "false";
  return `${API_BASE_URL}/report/generate/pId/${patientId}/rIds/${rIds}/hdr/${hdr}/mdsn/true/pg/${pg}`;
}
