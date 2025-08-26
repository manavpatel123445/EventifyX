import axios from "axios";


export const fetchCategories = async () => {
  const { data } = await axios.get("/api/categories");
  return data;
};

export const createCategory = async (category: { name: string; description?: string; status?: string; location?: string }) => {
  const { data } = await axios.post("/api/categories", category);
  return data;
};
