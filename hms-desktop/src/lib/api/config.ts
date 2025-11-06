import axios from 'axios';
import { config } from '../../config/environment';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: config.API_URL,
  timeout: config.API_TIMEOUT || 10000, // Default 10 seconds, but allow shorter for faster retries
  headers: {
    'Content-Type': 'application/json',
  },
  // Add retry configuration for network errors
  validateStatus: (status) => {
    return status < 500; // Don't throw on 4xx errors, only 5xx
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    // Only use real JWT tokens - no mock fallback
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      // Trim token to remove any whitespace that might cause issues
      const cleanToken = token.trim();
      
      // Basic JWT validation - check if it has 3 parts (header.payload.signature)
      if (cleanToken.split('.').length === 3) {
        config.headers.Authorization = `Bearer ${cleanToken}`;
      } else {
        console.warn('Invalid token format detected, clearing token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle auth errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear invalid tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // Don't auto-reload immediately - let components handle the error for better UX
      // Components can show error messages and reload after showing the message
      console.warn('Authentication failed - token cleared. Component should handle reload.');
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
