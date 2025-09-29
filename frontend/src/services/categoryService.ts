import axios from "axios";

// API roots
const API_ROOT = import.meta.env.VITE_API_URL || "/api";

// Public categories (no admin required)
const publicCategoryAPI = axios.create({
  baseURL: `${API_ROOT}/categories`,
});

// Admin categories
const adminCategoryAPI = axios.create({
  baseURL: `${API_ROOT}/admin/categories`,
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
