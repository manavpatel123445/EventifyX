import axios from "axios";

const API_ROOT = import.meta.env.VITE_API_BASE_URL || "/api";

// Public categories API (no auth required) - for Home page, filters, etc.
const publicCategoryAPI = axios.create({
  baseURL: `${API_ROOT}/categories`,
});

// Admin categories API (auth required) - for admin category management
const categoryAPI = axios.create({
  baseURL: `${API_ROOT}/admin/categories`,
});

categoryAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/** Fetch all categories for public display (Home, filters) - no auth needed */
export const getAllCategories = async () => {
  const { data } = await publicCategoryAPI.get("/");
  return data;
};

/** Fetch categories for forms (Create Event, etc.) - uses public endpoint, no auth needed */
export const fetchCategories = async () => {
  const { data } = await publicCategoryAPI.get("/");
  return data;
};

export const createCategory = async (category: { name: string; description?: string; status?: string; location?: string; icon?: string }) => {
  const { data } = await categoryAPI.post("/", category);
  return data;
};
