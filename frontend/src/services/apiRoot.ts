const ensureApiSuffix = (value: string) => {
  let base = value.trim().replace(/\/+$/, "");
  if (!/\/api(?:\/|$)/i.test(base)) {
    base = `${base}/api`;
  }
  return base;
};

export const resolveApiRoot = (): string => {
  const env = (import.meta as any).env || {};
  const rawBase = (env.VITE_API_BASE_URL as string | undefined) || (env.VITE_API_URL as string | undefined);

  if (env.DEV) {
    return "/api";
  }

  if (!rawBase) {
    return "/api";
  }

  if (/^https?:\/\//i.test(rawBase)) {
    return ensureApiSuffix(rawBase);
  }

  const normalized = rawBase.startsWith("/") ? rawBase : `/${rawBase}`;
  return ensureApiSuffix(normalized);
};

