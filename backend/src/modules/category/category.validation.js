export const createCategorySchema = (body) => {
  if (!body.name || body.name.trim().length < 2) {
    return "Category name is required and must be at least 2 characters long";
  }
  return null;
};

export const updateCategorySchema = (body) => {
  if (body.name && body.name.trim().length < 2) {
    return "Category name must be at least 2 characters long";
  }
  if (body.status && !["active", "inactive"].includes(body.status)) {
    return "Status must be active or inactive";
  }
  return null;
};

export default {
  createCategorySchema,
  updateCategorySchema,
};
