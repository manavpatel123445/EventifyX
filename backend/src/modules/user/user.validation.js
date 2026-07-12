export const updateProfileSchema = (body) => {
  if (body.name && body.name.length < 3) {
    return "Name must be at least 3 characters long";
  }
  if (body.phone && !/^\+?[1-9]\d{1,14}$/.test(body.phone)) {
    return "Invalid phone number format";
  }
  return null;
};

export const toggleStatusSchema = (body) => {
  if (!body.status || !["active", "blocked"].includes(body.status)) {
    return "Status must be either active or blocked";
  }
  return null;
};

export default {
  updateProfileSchema,
  toggleStatusSchema,
};
