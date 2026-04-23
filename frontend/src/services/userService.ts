/* eslint-disable @typescript-eslint/no-unused-vars */
import axiosInstance from "./axiosInstance";
import type { UserRole } from "../types/user";

// Use shared axios instance configured in axiosInstance.ts
const API = axiosInstance;

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  profileImage?: string;
  description?: string;
  role: UserRole;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  profileImage?: string;
  description?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Fetches the current user profile.
 * Shared instance handles 401s and token refresh automatically.
 */
export const getProfile = async (): Promise<{ success: boolean; user: UserProfile } | null> => {
  const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const { data } = await API.get("/users/me");
    return data;
  } catch (error) {
    console.error("Profile fetch error:", error);
    return null;
  }
};

export const updateProfile = async (profileData: UpdateProfileData): Promise<{ success: boolean; user: UserProfile }> => {
  const { data } = await API.put("/users/me", profileData);
  return data;
};

export const changePassword = async (passwordData: ChangePasswordData): Promise<{ success: boolean; message: string }> => {
  const { data } = await API.patch("/users/me/change-password", passwordData);
  return data;
};

export const deleteAccount = async (): Promise<{ success: boolean; message: string }> => {
  const { data } = await API.delete("/users/me");
  return data;
};
