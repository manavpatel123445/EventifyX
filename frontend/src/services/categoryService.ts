import axios from "axios";

// Create category API instance (admin routes)
const API_ROOT = import.meta.env.VITE_API_BASE_URL || "/api";
const categoryAPI = axios.create({
  baseURL: `${API_ROOT}/admin/categories`,
});

// Add auth token to requests
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

export const getAllCategories = async () => {
  const { data } = await categoryAPI.get("/");
  return data;
};

export const fetchCategories = async () => {
  const { data } = await axios.get(`${API_ROOT}/admin/categories`);
  return data;
};

export const createCategory = async (category: { name: string; description?: string; status?: string; location?: string; icon?: string }) => {
  const { data } = await axios.post(`${API_ROOT}/admin/categories`, category);
  return data;
};
