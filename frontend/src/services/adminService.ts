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
    recentRequests: any[];
    recentEvents: any[];
  };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "event_manager" | "admin";
  status: "active" | "blocked";
  createdAt: string;
  lastLogin?: string;
  managedEvents?: any[];
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
}
