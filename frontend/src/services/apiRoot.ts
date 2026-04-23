/**
 * Resolves the API root URL.
 * In both development and production on Vercel, we prefer the relative /api path
 * to leverage the Vite proxy (dev) or Vercel rewrites (prod).
 * This eliminates CORS issues by ensuring all requests appear to be same-origin.
 */
export const resolveApiRoot = (): string => {
  return "/api";
};
