/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "user" | "event_manager" | "admin";
  allowedRoles?: ("user" | "event_manager" | "admin")[];
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  allowedRoles 
}) => {
  // Check if user is authenticated
  const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
  
  if (!token) {
    toast.error("Please login to access this page");
    return <Navigate to="/login" replace />;
  }

  // Get user data
  const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
  
  if (!userStr) {
    toast.error("Invalid user session. Please login again");
    return <Navigate to="/login" replace />;
  }

  let user;
  try {
    user = JSON.parse(userStr);
  } catch (error) {
    toast.error("Invalid user session. Please login again");
    return <Navigate to="/login" replace />;
  }

  // Resolve role: prefer stored user.role, but fall back to role from JWT payload if storage is stale
  const getTokenRole = () => {
    try {
      const raw = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      if (!raw) return null;
      const parts = raw.split(".");
      if (parts.length < 2) return null;
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const json = atob(base64);
      const payload = JSON.parse(json);
      return payload?.role ?? null;
    } catch {
      return null;
    }
  };

  const tokenRole = getTokenRole();
  const userRole = (user.role || tokenRole) as "user" | "event_manager" | "admin";

  // Define role hierarchy and additional access
  const roleAccess: Record<string, string[]> = {
    admin: ['admin', 'event_manager', 'user'],
    event_manager: ['event_manager', 'user'],
    user: ['user']
  };

  // Get all roles the user has access to
  const userAccessRoles = roleAccess[userRole] || [];

  const hasRequiredRole = 
    (requiredRole && userAccessRoles.includes(requiredRole)) ||
    (allowedRoles && allowedRoles.some(role => userAccessRoles.includes(role)));

  if (!hasRequiredRole) {
    toast.error(`Access denied. You don't have permission to access this page.`);
    return <Navigate to="/" replace />;
  }

  // Check if user account is active
  if (user.status === "blocked") {
    toast.error("Your account has been blocked. Please contact support.");
    return <Navigate to="/login" replace />;  
  }

  return <>{children}</>;
};

// Helper hook to get current user info
export const useCurrentUser = () => {
  const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
  
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Helper hook to check user role
export const useUserRole = () => {
  const user = useCurrentUser();
  return user?.role || null;
};

// Helper hook to check if user has specific role
export const useHasRole = (role: "user" | "event_manager" | "admin") => {
  const userRole = useUserRole();
  return userRole === role;
};

// Helper hook to check if user has any of the specified roles
export const useHasAnyRole = (roles: ("user" | "event_manager" | "admin")[]) => {
  const userRole = useUserRole();
  return userRole ? roles.includes(userRole) : false;
};

export default RoleProtectedRoute;
