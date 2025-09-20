import { ROLES, ROLE_DISPLAY_NAMES, ROLE_COLORS } from "./roles";
import { type UserRole } from "../app/slices/authslice";

export const getRoleDisplayName = (role: string): string => {
  return ROLE_DISPLAY_NAMES[role as UserRole] || role;
};

export const getRoleStyles = (role: string) => {
  const defaultStyles = {
    bg: 'bg-gray-100',
    text: 'text-gray-800'
  };
  
  if (!role) return defaultStyles;
  
  return ROLE_COLORS[role as UserRole] || defaultStyles;
};

export const isEventManager = (role: string): boolean => {
  return role === ROLES.EVENT_MANAGER;
};
