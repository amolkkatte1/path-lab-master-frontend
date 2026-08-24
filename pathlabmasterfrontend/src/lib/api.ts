export const API_BASE_URL = "https://path-lab-master.onrender.com";

export const API_ENDPOINTS = {
  login: `${API_BASE_URL}/user/login`,
  users: `${API_BASE_URL}/user/list`,
  createUser: `${API_BASE_URL}/user/create`,
  updateUser: `${API_BASE_URL}/user/update`,
  getUser: `${API_BASE_URL}/user/get`,
  deleteUser: `${API_BASE_URL}/user/delete`,
} as const;
