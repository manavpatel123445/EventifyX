import type { UserRole } from "../types/user";

export const ROLES = {
  ADMIN: 'admin',
  EVENT_MANAGER: 'event_manager',
  USER: 'user'
} as const;

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.EVENT_MANAGER]: 'Event Manager',
  [ROLES.USER]: 'User'
};

export const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
  [ROLES.ADMIN]: {
    bg: 'bg-red-100',
    text: 'text-red-800'
  },
  [ROLES.EVENT_MANAGER]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800'
  },
  [ROLES.USER]: {
    bg: 'bg-gray-100',
    text: 'text-gray-800'
  }
};

export const hasRole = (userRole: UserRole | null | undefined, requiredRole: UserRole): boolean => {
  if (!userRole) return false;
  
  // Admin has all roles
  if (userRole === ROLES.ADMIN) return true;
  
  // Event manager has user privileges
  if (requiredRole === ROLES.USER && userRole === ROLES.EVENT_MANAGER) return true;
  
  return userRole === requiredRole;
};

export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
