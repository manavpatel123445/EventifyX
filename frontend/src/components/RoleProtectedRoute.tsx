/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from "react";
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
  const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
  const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");

  let user: { role?: string; status?: string } | null = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch {
      // Invalid JSON
    }
  }

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
  const userRole = (user?.role || tokenRole) as "user" | "event_manager" | "admin";

  const roleAccess: Record<string, string[]> = {
    admin: ['admin', 'event_manager', 'user'],
    event_manager: ['event_manager', 'user'],
    user: ['user']
  };

  const userAccessRoles = roleAccess[userRole] || [];
  const hasRequiredRole = 
    (requiredRole && userAccessRoles.includes(requiredRole)) ||
    (allowedRoles && allowedRoles.some(role => userAccessRoles.includes(role)));

  // Determine redirect reason (don't call toast during render — causes setState-in-render)
  type RedirectReason = "no-token" | "no-user" | "access-denied" | "blocked" | null;
  let redirectReason: RedirectReason = null;
  let redirectTo = "/login";

  if (!token) redirectReason = "no-token";
  else if (!userStr || !user) redirectReason = "no-user";
  else if (!hasRequiredRole) {
    redirectReason = "access-denied";
    redirectTo = "/";
  } else if (user.status === "blocked") redirectReason = "blocked";

  // Defer toast to next tick to avoid "Cannot update component while rendering another"
  useEffect(() => {
    if (!redirectReason) return;
    const msg =
      redirectReason === "no-token" ? "Please login to access this page" :
      redirectReason === "no-user" ? "Invalid user session. Please login again" :
      redirectReason === "access-denied" ? "Access denied. You don't have permission to access this page." :
      "Your account has been blocked. Please contact support.";
    const t = setTimeout(() => toast.error(msg), 0);
    return () => clearTimeout(t);
  }, [redirectReason]);

  if (redirectReason) return <Navigate to={redirectTo} replace />;
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
