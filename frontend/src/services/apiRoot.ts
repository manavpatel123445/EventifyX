export const resolveApiRoot = (): string => {
  // If explicitly provided in environment, use it (e.g. pointing to Render)
  // Otherwise fallback to /api for Vite proxy/Vercel rewrites
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // Ensure the URL ends with /api if it doesn't already
    return envUrl.endsWith("/api") ? envUrl : `${envUrl.replace(/\/$/, "")}/api`;
  }
  return "/api";
};

