import axios from "axios";

// Create category API instance
const categoryAPI = axios.create({
  baseURL: "/api/categories",
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
  const { data } = await axios.get("/api/categories");
  return data;
};

export const createCategory = async (category: { name: string; description?: string; status?: string; location?: string }) => {
  const { data } = await axios.post("/api/categories", category);
  return data;
};
