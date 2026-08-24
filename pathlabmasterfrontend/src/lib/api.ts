export const API_BASE_URL = "https://path-lab-master.onrender.com";

export const API_ENDPOINTS = {
  login: `${API_BASE_URL}/user/login`,
  users: `${API_BASE_URL}/user/list`,
  createUser: `${API_BASE_URL}/user/create`,
  updateUser: `${API_BASE_URL}/user/update`,
  getUser: `${API_BASE_URL}/user/get`,
  deleteUser: `${API_BASE_URL}/user/delete`,
} as const;

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
