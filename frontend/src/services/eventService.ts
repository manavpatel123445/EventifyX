/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import type { ReactNode } from "react";

// Create event API instance
const eventAPI = axios.create({ 
  baseURL: "/api/events",
});

// Add auth token to requests
eventAPI.interceptors.request.use(
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
eventAPI.interceptors.response.use(
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

// Image upload service using Cloudinary
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "eventifyx_preset");
  formData.append("folder", "eventifyx/events");

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/dy7swor3r/image/upload`,
      formData
    );
    return response.data.secure_url;
  } catch (error) {
    console.error("Image upload error:", error);
    throw new Error("Failed to upload image");
  }
};

// Event Request Services
export const createEventRequest = async (eventData: EventRequestData) => {
  const { data } = await eventAPI.post("/request", eventData);
  return data;
};

export const getMyEventRequests = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const { data } = await eventAPI.get("/my-requests", { params });
  return data;
};

// Public Event Services
export const getAllEvents = async (params?: {
  category?: string;
  city?: string;
  date?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}) => {
  const { data } = await eventAPI.get("/", { params });
  return data;
};

export const getEventById = async (identifier: string) => {
  const { data } = await eventAPI.get(`/${identifier}`);
  return data;
};

// Event Manager Services (for users with event_manager role)
export const getMyManagedEvents = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const { data } = await eventAPI.get("/managed", { params });
  return data;
};

export const getRequestsForManagedEvents = async (params?: { status?: string; page?: number; limit?: number }) => {
  const { data } = await eventAPI.get("/managed/requests", { params });
  return data;
};

export const updateEvent = async (eventId: string, updates: Partial<EventRequestData>) => {
  const { data } = await eventAPI.put(`/${eventId}`, updates);
  return data;
};

export const cancelEvent = async (eventId: string, reason?: string) => {
  const { data } = await eventAPI.patch(`/${eventId}/cancel`, { reason });
  return data;
};

export const getEventStats = async (eventId: string) => {
  const { data } = await eventAPI.get(`/${eventId}/stats`);
  return data;
};

export const getAllEventRequests = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const queryString = params ? new URLSearchParams(params as any).toString() : "";
  const { data } = await eventAPI.get(`/admin/requests${queryString ? `?${queryString}` : ""}`);
  return data;
};

// approveEventRequest and rejectEventRequest API functions added.

export const approveEventRequest = async (requestId: string, adminNotes?: string) => {
  const { data } = await eventAPI.post(`/admin/requests/${requestId}/approve`, { adminNotes: adminNotes || "" });
  return data;
};

export const rejectEventRequest = async (requestId: string, reason?: string) => {
  const { data } = await eventAPI.post(`/admin/requests/${requestId}/reject`, { reason });
  return data;
};

// TypeScript interfaces
export interface EventRequestData {
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venue: {
    name: string;
    address: string;
    city: string;
    state: string;
  };
  ticketPricing: {
    type: "regular" | "vip" | "premium";
    price: number;
    quantity: number;
  }[];
  images?: string[];
  tags?: string[];
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  category: {
    _id: string;
    name: string;
  };
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venue: {
    name: string;
    address: string;
    city: string;
    state: string;
  };
  ticketPricing: {
    type: string;
    price: number;
    quantity: number;
    sold: number;
  }[];
  images: string[];
  eventManager: {
    _id: string;
    name: string;
    email: string;
  };
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  isPublic: boolean;
  totalBookings: number;
  totalRevenue: number;
  slug: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EventRequest {
  _id: string;
  title: string;
  description: string;
  category: {
    _id: string;
    name: string;
  };
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venue: {
    [x: string]: ReactNode;
    name: string;
    address: string;
    city: string;
    capacity: number;
  };
  ticketPricing: {
    type: string;
    price: number;
    quantity: number;
  }[];
  images: string[];
  requestedBy: {
    _id: string;
    name: string;
    email: string;
  };
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  reviewedBy?: {
    _id: string;
    name: string;
  };
  reviewedAt?: string;
  approvedEvent?: string;
  createdAt: string;
  updatedAt: string;
}

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
  submittedAt: string;
  processedAt?: string;
  adminResponse?: string;
  processedBy?: { _id: string; name: string };
}

export interface GetRequestsResponse {
  data: EventManagerRequest[];
  pagination: {
    totalPages: number;
    currentPage: number;
    totalRequests: number;
  };
}
