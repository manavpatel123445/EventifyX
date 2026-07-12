export const registerSchema = (body) => {
  if (!body.name || body.name.trim().length < 3) {
    return "Name is required and must be at least 3 characters long";
  }
  if (!body.email || !/^\S+@\S+\.\S+$/.test(body.email)) {
    return "A valid email is required";
  }
  if (!body.password || body.password.length < 6) {
    return "Password is required and must be at least 6 characters long";
  }
  return null;
};

export const loginSchema = (body) => {
  if (!body.email || !body.password) {
    return "Email and password are required";
  }
  return null;
};

export const refreshSchema = (body) => {
  if (!body.refreshToken) {
    return "Refresh token is required";
  }
  return null;
};

export const forgotPasswordSchema = (body) => {
  if (!body.email) {
    return "Email is required";
  }
  return null;
};

export const resetPasswordSchema = (body) => {
  if (!body.password || body.password.length < 6) {
    return "Password is required and must be at least 6 characters long";
  }
  return null;
};

export default {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
