export type UserRole = 'user' | 'event_manager' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'blocked';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  profileImage?: string;
  dateOfBirth?: string | Date;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  managedEvents?: any[];
}
