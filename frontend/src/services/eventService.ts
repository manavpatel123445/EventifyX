/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import axiosInstance from "./axiosInstance";
import type { ReactNode } from "react";

// Use the shared instance from axiosInstance.ts
const eventAPI = axiosInstance;

/**
 * Uploads an event image to Cloudinary
 * @param file The image file to upload
 * @returns A promise that resolves to the Cloudinary URL of the uploaded image
 */
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

/**
 * Uploads a profile image to local storage and returns a data URL
 */
export const uploadAvatar = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        const dataUrl = event.target.result as string;
        const userId = localStorage.getItem('userId') || 'anonymous';
        const imageKey = `avatar_${userId}`;
        
        try {
          localStorage.setItem(imageKey, dataUrl);
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          userData.profileImage = imageKey;
          localStorage.setItem('user', JSON.stringify(userData));
          resolve(dataUrl);
        } catch (error) {
          console.error("Failed to store avatar in local storage:", error);
          reject(new Error("Failed to store avatar"));
        }
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Retrieves a profile image from local storage
 */
export const getLocalAvatar = (dataUrl: string | undefined): string | null => {
  if (!dataUrl) return null;
  if (dataUrl.startsWith('data:image')) return dataUrl;
  if (dataUrl.startsWith('avatar_')) return localStorage.getItem(dataUrl);
  return localStorage.getItem(dataUrl) || null;
};

/**
 * Gets the current user's profile image URL
 */
export const getCurrentUserAvatar = (): string | null => {
  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData?.profileImage) {
      return getLocalAvatar(userData.profileImage);
    }
    return null;
  } catch (error) {
    console.error("Error getting user avatar:", error);
    return null;
  }
};

// Event Request Services
export const createEventRequest = async (eventData: EventRequestData) => {
  const { data } = await eventAPI.post("/events/request", eventData);
  return data;
};

export const getMyEventRequests = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const { data } = await eventAPI.get("/events/my-requests", { params });
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
  const { data } = await eventAPI.get("/events/", { params });
  return data;
};

export const getEventById = async (identifier: string) => {
  const { data } = await eventAPI.get(`/events/${identifier}`);
  return data;
};

// Event Manager Services
export const getMyManagedEvents = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const { data } = await eventAPI.get("/events/managed", { params });
  return data;
};

export const getRequestsForManagedEvents = async (params?: { status?: string; page?: number; limit?: number }) => {
  const { data } = await eventAPI.get("/events/managed/requests", { params });
  return data;
};

export const updateEvent = async (eventId: string, updates: Partial<EventRequestData>) => {
  const { data } = await eventAPI.put(`/events/${eventId}`, updates);
  return data;
};

export const cancelEvent = async (eventId: string, reason?: string) => {
  const { data } = await eventAPI.patch(`/events/${eventId}/cancel`, { reason });
  return data;
};

// Admin: Soft delete an event
export const softDeleteEventAdmin = async (eventId: string) => {
  const { data } = await eventAPI.patch(`/events/admin/${eventId}/soft-delete?force=true`);
  return data;
};

export const requestEventCancellation = async (eventId: string, reason: string) => {
  const { data } = await eventAPI.post(`/events/${eventId}/request-cancellation`, { reason });
  return data;
};

export const getEventStats = async (eventId: string) => {
  const { data } = await eventAPI.get(`/events/${eventId}/stats`);
  return data;
};

export const getAllEventRequests = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const queryString = params ? new URLSearchParams(params as any).toString() : "";
  const { data } = await eventAPI.get(`/events/admin/requests${queryString ? `?${queryString}` : ""}`);
  return data;
};

export const approveEventRequest = async (requestId: string, adminNotes?: string) => {
  const { data } = await eventAPI.post(`/events/admin/requests/${requestId}/approve`, { adminNotes: adminNotes || "" });
  return data;
};

export const rejectEventRequest = async (requestId: string, reason?: string) => {
  const { data } = await eventAPI.post(`/events/admin/requests/${requestId}/reject`, { reason });
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
    profileImage?: string;
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

export const getTicketsBySessionId = async (sessionId: string) => {
  const { data } = await eventAPI.get(`/events/tickets/session/${sessionId}`);
  return data;
};
