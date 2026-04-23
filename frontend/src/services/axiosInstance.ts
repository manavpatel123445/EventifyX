import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { resolveApiRoot } from "./apiRoot";

const API_ROOT = resolveApiRoot();

// Queue for multiple failed requests during token refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Shared Axios instance for all authenticated API calls.
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_ROOT,
});

// Request interceptor: Inject Bearer Token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401s with Token Refresh and Queuing
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // If the request already failed once (it's a retry), or it's a refresh request, don't retry again
      if (originalRequest._retry || originalRequest.url?.includes("/auth/refresh")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, add this request to the queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            originalRequest._retry = true; // Mark as retry
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token available");

        // Attempt to refresh the access token
        const { data } = await axios.post(`${API_ROOT}/auth/refresh`, { refreshToken });
        const newAccess = data?.accessToken;

        if (!newAccess) throw new Error("Refresh response did not contain access token");

        // Persist new token
        if (localStorage.getItem("refreshToken")) {
          localStorage.setItem("accessToken", newAccess);
        } else {
          sessionStorage.setItem("accessToken", newAccess);
        }

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        
        // Reset state before processing queue to allow retried requests to pass
        isRefreshing = false;
        processQueue(null, newAccess);
        
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed: Clear auth and redirect to login
        isRefreshing = false;
        processQueue(refreshError, null);
        
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
        sessionStorage.removeItem("user");

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
