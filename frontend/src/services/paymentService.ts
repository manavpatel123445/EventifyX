/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const API_ROOT = import.meta.env.VITE_API_BASE_URL || "/api";

const paymentsAPI = axios.create({
  baseURL: `${API_ROOT}/payments`,
});

// Admin-scoped payments (some backends expose logs under /api/admin/payments)
const adminPaymentsAPI = axios.create({
  baseURL: `${API_ROOT}/admin/payments`,
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

export const getPaymentById = async (paymentId: string): Promise<PaymentLog> => {
  const { data } = await paymentsAPI.get(`/${paymentId}`);
  return data;
};



