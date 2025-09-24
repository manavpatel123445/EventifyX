import axios from "axios";

const API_ROOT = import.meta.env.VITE_API_BASE_URL || "/api";
const API = axios.create({ baseURL: `${API_ROOT}/auth` });

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
