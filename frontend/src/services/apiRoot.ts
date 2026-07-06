/**
 * Resolves the API root URL.
 */
export const resolveApiRoot = (): string => {
  // If explicitly provided in environment, use it (e.g. pointing to Render)
  // Otherwise fallback to /api for Vite proxy/Vercel rewrites
  return import.meta.env.VITE_API_URL || "/api";
};
