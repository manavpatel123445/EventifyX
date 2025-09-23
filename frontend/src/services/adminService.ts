/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

// Create admin API instance
const adminAPI = axios.create({ 
  baseURL: "/api/admin",
});

// Add auth token to requests
adminAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
adminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("user");
      
      // Redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Dashboard Services
export const getDashboardStats = async () => {
  const { data } = await adminAPI.get("/dashboard");
  return data;
};

// Get top spenders across users (admin analytics)
export const getTopSpenders = async (params: { limit?: number } = {}) => {
  const { data } = await adminAPI.get("/analytics/top-spenders", { params });
  return data;
};

export const getAdvancedAnalytics = async (params?: { startDate?: string; endDate?: string }) => {
  const { data } = await adminAPI.get("/analytics", { params });
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
  const { data } = await adminAPI.get("/users", { params });
  return data;
};

export const getUserDetails = async (userId: string) => {
  const { data } = await adminAPI.get(`/users/${userId}`);
  return data;
};

export const updateUserStatus = async (userId: string, status: "active" | "blocked") => {
  const { data } = await adminAPI.patch(`/users/${userId}/status`, { status });
  return data;
};

export const updateUserRole = async (userId: string, role: "user" | "event_manager" | "admin") => {
  const { data } = await adminAPI.patch(`/users/${userId}/role`, { role });
  return data;
};

export const deleteUser = async (userId: string) => {
  const { data } = await adminAPI.delete(`/users/${userId}`);
  return data;
};

// Category Management Services
export const getAllCategories = async () => {
  const { data } = await adminAPI.get("/categories");
  return data;
};

export const createCategory = async (categoryData: { name: string; description?: string }) => {
  const { data } = await adminAPI.post("/categories", categoryData);
  return data;
};

export const updateCategory = async (categoryId: string, categoryData: { name?: string; description?: string }) => {
  const { data } = await adminAPI.put(`/categories/${categoryId}`, categoryData);
  return data;
};

export const deleteCategory = async (categoryId: string) => {
  const { data } = await adminAPI.delete(`/categories/${categoryId}`);
  return data;
};

// Events Management Services
export const cleanupCompletedEvents = async () => {
  // Create events API instance for this specific call
  const eventsAPI = axios.create({ baseURL: "/api/events" });
  
  // Add auth token
  const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
  if (token) {
    eventsAPI.defaults.headers.Authorization = `Bearer ${token}`;
  }
  
  const { data } = await eventsAPI.post("/admin/cleanup-completed");
  return data;
};

// Get revenue analytics
interface RevenueAnalyticsParams {
  startDate?: string;
  endDate?: string;
  managerId?: string;
}

export const getRevenueAnalytics = async (params: RevenueAnalyticsParams = {}) => {
  const { data } = await adminAPI.get("/analytics/revenue", { params });
  return data;
};

// Get manager-specific revenue
export const getManagerRevenue = async (managerId: string, params: { startDate?: string; endDate?: string } = {}) => {
  const { data } = await adminAPI.get(`/analytics/manager/${managerId}/revenue`, { params });
  return data;
};

// Import types
import type { User } from "../types/user";

// Re-export User type for external use
export type { User };

// Manager-specific user access
const managerAPI = axios.create({ 
  baseURL: "/api/manager",
});

// Add auth token to requests
managerAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Get users with limited access for managers
export const getManagerUsers = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}) => {
  const { data } = await managerAPI.get("/users", { params });
  return data;
};

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
