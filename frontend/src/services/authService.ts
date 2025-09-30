import axios from "axios";

// Resolve API root to always include '/api' and prefer Vite proxy in development
const resolveApiRoot = () => {
  const env = (import.meta as any).env || {};
  const raw = env?.VITE_API_URL as string | undefined;
  // Use Vite proxy during development
  if (env?.DEV) return "/api";
  if (!raw) return "/api";

  let base = raw.trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(base)) {
    if (!/\/(api)(?:\/|$)/i.test(base)) base = `${base}/api`;
    return base;
  }
  if (!base.startsWith('/')) base = `/${base}`;
  if (!/\/(api)(?:\/|$)/i.test(base)) base = `${base}/api`;
  return base;
};

const API_ROOT = resolveApiRoot();
const API = axios.create({ baseURL: API_ROOT.endsWith('/') ? `${API_ROOT}auth` : `${API_ROOT}/auth` });

// Add authorization header to all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = async (payload: { email: string; password: string }) => {
  const { data } = await API.post("/login", payload);
  return data;
};

export const registerUser = async (payload: { name: string; email: string; password: string }) => {
  const { data } = await API.post("/register", payload);
  return data;
};

export const getMe = async (accessToken: string) => {
  const { data } = await API.get("/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
};

export const refreshToken = async (refreshToken: string) => {
  const { data } = await API.post("/refresh", { refreshToken });
  return data;
};

export const forgotPassword = async (email: string) => {
  const { data } = await API.post("/forgot-password", { email });
  return data;
};

export const resetPassword = async (resetToken: string, password: string) => {
  const { data } = await API.put(`/reset-password/${resetToken}`, { password });
  return data;
};
