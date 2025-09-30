import axios from "axios";

// API roots
const resolveApiRoot = () => {
  const env = (import.meta as any).env || {};
  const raw = env?.VITE_API_URL as string | undefined;
  // In development, always use Vite proxy
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

// Public categories (no admin required)
const publicCategoryAPI = axios.create({
  baseURL: API_ROOT.endsWith('/') ? `${API_ROOT}categories` : `${API_ROOT}/categories`,
});

// Admin categories
const adminCategoryAPI = axios.create({
  baseURL: API_ROOT.endsWith('/') ? `${API_ROOT}admin/categories` : `${API_ROOT}/admin/categories`,
});

// Add auth token to requests
publicCategoryAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getAllCategories = async () => {
  const { data } = await publicCategoryAPI.get("/");
  return data;
};

export const fetchCategories = async () => {
  const { data } = await publicCategoryAPI.get("/");
  return data;
};

export const createCategory = async (category: { name: string; description?: string; status?: string; location?: string; icon?: string }) => {
  const { data } = await adminCategoryAPI.post("/", category);
  return data;
};
