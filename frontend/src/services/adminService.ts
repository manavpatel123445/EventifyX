/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "./axiosInstance";

// Use the shared instance from axiosInstance.ts
// This automatically handles auth headers and 401 refresh/queuing logic.
const adminAPI = axiosInstance;
const managerAPI = axiosInstance;

// Dashboard Services
export const getDashboardStats = async () => {
  const { data } = await adminAPI.get("/admin/dashboard");
  return data;
};

// Get top spenders across users (admin analytics)
export const getTopSpenders = async (params: { limit?: number } = {}) => {
  const { data } = await adminAPI.get("/admin/analytics/top-spenders", { params });
  return data;
};

export const getAdvancedAnalytics = async (params?: { startDate?: string; endDate?: string }) => {
  const { data } = await adminAPI.get("/admin/analytics", { params });
  return data;
};

// User Management Services
export const getAllUsers = async (params?: {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}) => {
  const { data } = await adminAPI.get("/admin/users", { params });
  return data;
};

export const getUserDetails = async (userId: string) => {
  const { data } = await adminAPI.get(`/admin/users/${userId}`);
  return data;
};

export const updateUserStatus = async (userId: string, status: "active" | "blocked") => {
  const { data } = await adminAPI.patch(`/admin/users/${userId}/status`, { status });
  return data;
};

export const updateUserRole = async (userId: string, role: "user" | "event_manager" | "admin") => {
  const { data } = await adminAPI.patch(`/admin/users/${userId}/role`, { role });
  return data;
};

export const deleteUser = async (userId: string) => {
  const { data } = await adminAPI.delete(`/admin/users/${userId}`);
  return data;
};

// Category Management Services
export const getAllCategories = async () => {
  const { data } = await adminAPI.get("/admin/categories");
  return data;
};

export const createCategory = async (categoryData: { name: string; description?: string }) => {
  const { data } = await adminAPI.post("/admin/categories", categoryData);
  return data;
};

export const updateCategory = async (categoryId: string, categoryData: { name?: string; description?: string }) => {
  const { data } = await adminAPI.put(`/admin/categories/${categoryId}`, categoryData);
  return data;
};

export const deleteCategory = async (categoryId: string) => {
  const { data } = await adminAPI.delete(`/admin/categories/${categoryId}`);
  return data;
};

// Events Management Services
export const cleanupCompletedEvents = async () => {
  const { data } = await adminAPI.post("/events/admin/cleanup-completed");
  return data;
};

// Get revenue analytics
interface RevenueAnalyticsParams {
  startDate?: string;
  endDate?: string;
  managerId?: string;
}

export const getRevenueAnalytics = async (params: RevenueAnalyticsParams = {}) => {
  const { data } = await adminAPI.get("/admin/analytics/revenue", { params });
  return data;
};

// Get manager-specific revenue
export const getManagerRevenue = async (managerId: string, params: { startDate?: string; endDate?: string } = {}) => {
  const { data } = await adminAPI.get(`/admin/analytics/manager/${managerId}/revenue`, { params });
  return data;
};

// Manager-specific user access
export const getManagerUsers = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}) => {
  const { data } = await managerAPI.get("/manager/users", { params });
  return data;
};

// Import types
import type { User } from "../types/user";

// Re-export User type for external use
export type { User };

// Types for TypeScript
export interface DashboardStats {
  users: {
    total: number;
    users: number;
    eventManagers: number;
    admins: number;
  };
  events: {
    total: number;
    upcoming: number;
    ongoing: number;
    completed: number;
    cancelled: number;
  };
  requests: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  revenue: {
    totalRevenue: number;
    totalBookings: number;
    totalEvents: number;
  };
  recentActivity: {
    recentRequests: User[];
    recentEvents: any[];
  };
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
}
