import axiosInstance from "./axiosInstance";

// Use shared instance for all category requests
const API = axiosInstance;

/** Fetch all categories for public display (Home, filters) */
export const getAllCategories = async () => {
  const { data } = await API.get("/categories");
  return data;
};

/** Fetch categories for forms */
export const fetchCategories = async () => {
  const { data } = await API.get("/categories");
  return data;
};

/** Create a new category (Requires Admin) */
export const createCategory = async (category: { name: string; description?: string; status?: string; location?: string; icon?: string }) => {
  const { data } = await API.post("/admin/categories", category);
  return data;
};
