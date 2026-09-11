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
  saveReport: `${API_BASE_URL}/report/save`,
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

export function getPendingReportsByPatientId(
  patientId: number | string,
  labId: number | string,
) {
  return `${API_BASE_URL}/report/pending-reports/patientId/${patientId}/labId/${labId}`;
}

export function getDoctorListByLabId(labId: number | string) {
  return `${API_BASE_URL}/doctor/list/labId/${labId}`;
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
