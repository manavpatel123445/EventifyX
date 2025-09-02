/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from "axios";

const API = axios.create({ baseURL: "/api/manager-requests" });

// Add authorization header to all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally (same as userService)
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");
        const { data } = await axios.post("/api/auth/refresh", { refreshToken });
        const newAccess = data?.accessToken;
        if (!newAccess) throw new Error("No access token in refresh response");
        // Persist and retry
        if (localStorage.getItem("refreshToken")) {
          localStorage.setItem("accessToken", newAccess);
        } else {
          sessionStorage.setItem("accessToken", newAccess);
        }
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return API(originalRequest);
      } catch (_err) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
        sessionStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

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

export interface ProcessRequestData {
  adminResponse?: string;
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
  const { data } = await API.post("/", requestData);
  return data;
};

export const getUserRequest = async () => {
  const { data } = await API.get("/user");
  return data;
};

export const deleteRequest = async (requestId: string) => {
  const { data } = await API.delete(`/${requestId}`);
  return data;
};

// Admin functions
export const getAllRequests = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<GetRequestsResponse> => {
  try {
    console.log('Getting all requests with params:', params);
    // Log the auth token for debugging
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    console.log('Using auth token:', token ? 'Token exists' : 'No token found');
    
    const queryString = params ? new URLSearchParams(params as any).toString() : "";
    const { data } = await API.get(`/${queryString ? `?${queryString}` : ""}`);
    console.log('Response data:', data);
    return data;
  } catch (error: any) {
    console.error('Error getting requests:', error.response?.data || error.message);
    throw error;
  }
};

export const approveRequest = async (requestId: string, adminResponse?: string) => {
  const { data } = await API.put(`/${requestId}/approve`, { adminResponse });
  return data;
};

export const rejectRequest = async (requestId: string, adminResponse?: string) => {
  const { data } = await API.put(`/${requestId}/reject`, { adminResponse });
  return data;
};
