/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "./axiosInstance";

// Use shared instance from axiosInstance.ts
const API = axiosInstance;

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
  managerOnly?: boolean;
}

export const getPaymentLogs = async (params: PaymentLogsParams = {}): Promise<PaymentLogsResponse> => {
  const { data } = await API.get("/payments/logs", { params });
  return data;
};
 
export const getAdminPaymentLogs = async (params: PaymentLogsParams = {}): Promise<PaymentLogsResponse> => {
  const { data } = await API.get("/payments/logs", { params });
  return data;
};

export const createCheckoutSession = async (
  eventId: string,
  tickets: any[],
  buyerDetails: any,
  selectedDate?: string
) => {
  const { data } = await API.post("/payments/create-checkout-session", {
    eventId,
    tickets,
    buyerDetails,
    selectedDate,
  });
  return data;
};
