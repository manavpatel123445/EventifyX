import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User, UserRole } from "../../types/user";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  role: UserRole | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  permissions: {
    canManageEvents: boolean;
    canManageUsers: boolean;
    canApproveEvents: boolean;
  };
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  role: null,
  status: 'idle',
  error: null,
  permissions: {
    canManageEvents: false,
    canManageUsers: false,
    canApproveEvents: false,
  },
};

// Helper function to set permissions based on role
const getRolePermissions = (role: UserRole | null) => {
  switch (role) {
    case 'admin':
      return {
        canManageEvents: true,
        canManageUsers: true,
        canApproveEvents: true,
      };
    case 'event_manager':
      return {
        canManageEvents: true,
        canManageUsers: false,
        canApproveEvents: false,
      };
    case 'user':
    default:
      return {
        canManageEvents: false,
        canManageUsers: false,
        canApproveEvents: false,
      };
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>
    ) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.role = user.role;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.permissions = getRolePermissions(user.role);
      state.status = 'succeeded';
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.role = null;
      state.status = 'idle';
      state.error = null;
      state.permissions = getRolePermissions(null);
    },
    setUser: (state, action: PayloadAction<User>) => {
      const user = action.payload;
      state.user = user;
      state.role = user.role;
      state.permissions = getRolePermissions(user.role);
    },
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    updateRole: (state, action: PayloadAction<UserRole>) => {
      const role = action.payload;
      state.role = role;
      if (state.user) {
        state.user.role = role;
      }
      state.permissions = getRolePermissions(role);
    },
    setStatus: (state, action: PayloadAction<AuthState['status']>) => {
      state.status = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { 
  loginSuccess, 
  logout, 
  setUser, 
  setTokens, 
  setStatus, 
  updateRole, 
  setError 
} = authSlice.actions;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectCurrentRole = (state: { auth: AuthState }) => state.auth.role;
export const selectIsAuthenticated = (state: { auth: AuthState }) => !!state.auth.accessToken;
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectPermissions = (state: { auth: AuthState }) => state.auth.permissions;

// Role-based selectors
export const selectIsAdmin = (state: { auth: AuthState }) => state.auth.role === 'admin';
export const selectIsEventManager = (state: { auth: AuthState }) => 
  state.auth.role === 'event_manager' || state.auth.role === 'admin';

export default authSlice.reducer;
