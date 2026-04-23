const ensureApiSuffix = (value: string) => {
  let base = value.trim().replace(/\/+$/, "");
  if (!/\/api(?:\/|$)/i.test(base)) {
    base = `${base}/api`;
  }
  return base;
};

export const resolveApiRoot = (): string => {
  const env = (import.meta as any).env || {};
  
  // In both development and production on Vercel, we should prefer relative /api path
  // to leverage Vite proxy (dev) or Vercel rewrites (prod).
  // This avoids CORS issues completely.
  return "/api";
};

