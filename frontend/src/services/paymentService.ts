/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const resolveApiRoot = () => {
  const env = (import.meta as any).env || {};
  const raw = env?.VITE_API_URL as string | undefined;
  if (env?.DEV) return "/api";
  if (!raw) return "/api";

  let base = raw.trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(base)) {
    if (!/\/(api)(?:\/|$)/i.test(base)) base = `${base}/api`;
    return base;
  }
  if (!base.startsWith('/')) base = `/${base}`;
  if (!/\/(api)(?:\/|$)/i.test(base)) base = `${base}/api`;
  return base;
};

const API_ROOT = resolveApiRoot();

const paymentsAPI = axios.create({
  baseURL: API_ROOT.endsWith('/') ? `${API_ROOT}payments` : `${API_ROOT}/payments`,
});

// Admin-scoped payments – in this backend, logs live under /api/payments/logs
// so we reuse the same payments base URL.
const adminPaymentsAPI = axios.create({
  baseURL: API_ROOT.endsWith('/') ? `${API_ROOT}payments` : `${API_ROOT}/payments`,
});

paymentsAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

adminPaymentsAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface PaymentLog {
  _id: string;
  transactionId: string;
  status: string;
  amount: number;
  currency?: string;
  user: { _id: string; name: string; email?: string } | string;
  event: { _id: string; title: string } | string;
  tickets?: string[];
  createdAt: string;
  updatedAt?: string;
  provider?: string;
  raw?: any;
}

export interface PaymentLogsResponse {
  data: PaymentLog[];
  pagination?: {
    totalPages: number;
    currentPage: number;
    totalItems: number;
    pageSize: number;
  };
}

export interface PaymentLogsParams {
  page?: number;
  limit?: number;
  eventId?: string;
  userId?: string;
  transactionId?: string;
  userName?: string;
  eventName?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  managerOnly?: boolean; // when true, server should scope to current manager's events
}

export const getPaymentLogs = async (params: PaymentLogsParams = {}): Promise<PaymentLogsResponse> => {
  // Manager or public logs typically under /api/payments/logs
  const { data } = await paymentsAPI.get("/logs", { params });
  return data;
};
 
export const getAdminPaymentLogs = async (params: PaymentLogsParams = {}): Promise<PaymentLogsResponse> => {
  // Admin logs often live under /api/admin/payments/logs
  const { data } = await adminPaymentsAPI.get("/logs", { params });
  return data;
};

export const createCheckoutSession = async (
  eventId: string,
  tickets: any[],
  buyerDetails: any,
  selectedDate?: string
) => {
  const { data } = await paymentsAPI.post("/create-checkout-session", {
    eventId,
    tickets,
    buyerDetails,
    selectedDate,
  });
  return data;
};
