/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import axiosInstance from "./axiosInstance";

// Use the shared instance from axiosInstance.ts
const API = axiosInstance;

export interface EventManagerRequest {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  reason: string;
  experience?: string;
  status: "pending" | "approved" | "rejected";
  adminResponse?: string;
  processedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  processedAt?: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitRequestData {
  reason: string;
  experience?: string;
}

export interface GetRequestsResponse {
  success: boolean;
  data: EventManagerRequest[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRequests: number;
  };
}

// User functions
export const submitEventManagerRequest = async (requestData: SubmitRequestData) => {
  const { data } = await API.post("/manager-requests/", requestData);
  return data;
};

export const getUserRequest = async () => {
  const { data } = await API.get("/manager-requests/user");
  return data;
};

export const deleteRequest = async (requestId: string) => {
  const { data } = await API.delete(`/manager-requests/${requestId}`);
  return data;
};

// Admin functions
export const getAllRequests = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<GetRequestsResponse> => {
  const queryString = params ? new URLSearchParams(params as any).toString() : "";
  const { data } = await API.get(`/manager-requests/${queryString ? `?${queryString}` : ""}`);
  return data;
};

export const approveRequest = async (requestId: string, adminResponse?: string) => {
  const { data } = await API.put(`/manager-requests/${requestId}/approve`, { adminResponse });
  return data;
};

export const rejectRequest = async (requestId: string, adminResponse?: string) => {
  const { data } = await API.put(`/manager-requests/${requestId}/reject`, { adminResponse });
  return data;
};
