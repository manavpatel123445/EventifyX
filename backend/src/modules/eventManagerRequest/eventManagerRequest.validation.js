export const submitRequestSchema = (body) => {
  if (!body.reason || body.reason.trim().length < 10) {
    return "Reason must be at least 10 characters long";
  }
  return null;
};

export const adminActionSchema = (body) => {
  if (body.adminResponse && body.adminResponse.trim().length > 500) {
    return "Admin response notes must not exceed 500 characters";
  }
  return null;
};

export default {
  submitRequestSchema,
  adminActionSchema,
};
