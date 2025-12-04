import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ERROR_CODES } from '../config/api.config';

/**
 * Storage keys for AsyncStorage
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: '@roundbuy:access_token',
  REFRESH_TOKEN: '@roundbuy:refresh_token',
  USER_DATA: '@roundbuy:user_data',
};

/**
 * Create axios instance with default configuration
 */
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

/**
 * Request interceptor - Add auth token to requests
 */
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }
    
    // Log request in development
    if (__DEV__) {
      console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle common errors and token refresh
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (__DEV__) {
      console.log(`✅ API Response: ${response.config.url}`, response.status);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error in development with more details
    if (__DEV__) {
      console.error(`❌ API Error: ${error.config?.url}`, error.response?.status);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        hasResponse: !!error.response,
        hasRequest: !!error.request,
        config: error.config ? {
          method: error.config.method,
          url: error.config.url,
          baseURL: error.config.baseURL,
          fullURL: error.config.baseURL + error.config.url
        } : 'No config'
      });
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error - no response received. Error:', error.message, 'Code:', error.code);
      return Promise.reject({
        success: false,
        message: 'Network error. Please check your internet connection.',
        error_code: ERROR_CODES.NETWORK_ERROR,
        debug: {
          errorMessage: error.message,
          errorCode: error.code,
          url: error.config?.url,
          baseURL: error.config?.baseURL
        }
      });
    }

    const status = error.response.status;
    const errorData = error.response.data;

    // Handle 401 Unauthorized - Token expired or invalid
    if (status === 401) {
      // Check if this is a login request - don't treat as session expiration
      const isLoginRequest = originalRequest.url?.includes('/auth/login');
      const isRefreshRequest = originalRequest.url?.includes('/auth/refresh-token');

      if (isLoginRequest) {
        // This is a login failure (invalid credentials), not session expiration
        return Promise.reject({
          success: false,
          message: errorData.message || 'Invalid email or password',
          error_code: errorData.error_code || 'INVALID_CREDENTIALS',
          ...errorData,
        });
      }

      if (isRefreshRequest) {
        // Refresh token is invalid, user needs to login again
        await clearAuthData();
        return Promise.reject({
          success: false,
          message: 'Session expired. Please login again.',
          error_code: ERROR_CODES.UNAUTHORIZED,
          require_login: true,
        });
      }

      // For other 401 errors, try to refresh token
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to refresh token
          const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

          if (!refreshToken) {
            // No refresh token, user needs to login again
            await clearAuthData();
            return Promise.reject({
              success: false,
              message: 'Session expired. Please login again.',
              error_code: ERROR_CODES.UNAUTHORIZED,
              require_login: true,
            });
          }

          // Call refresh token endpoint
          const refreshResponse = await apiClient.post('/auth/refresh-token', {
            refresh_token: refreshToken
          });

          if (refreshResponse.data.success) {
            const { access_token, refresh_token: newRefreshToken } = refreshResponse.data.data;

            // Save new tokens
            await storage.saveTokens(access_token, newRefreshToken);

            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return apiClient(originalRequest);
          } else {
            // Refresh failed, clear auth and require login
            await clearAuthData();
            return Promise.reject({
              success: false,
              message: 'Session expired. Please login again.',
              error_code: ERROR_CODES.UNAUTHORIZED,
              require_login: true,
            });
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          await clearAuthData();
          return Promise.reject({
            success: false,
            message: 'Session expired. Please login again.',
            error_code: ERROR_CODES.UNAUTHORIZED,
            require_login: true,
          });
        }
      }
    }

    // Handle 403 Forbidden - Subscription required
    if (status === 403) {
      if (errorData.error_code === 'SUBSCRIPTION_REQUIRED') {
        return Promise.reject({
          ...errorData,
          require_subscription: true,
        });
      }
      
      if (errorData.error_code === 'FEATURE_LIMIT_EXCEEDED') {
        return Promise.reject({
          ...errorData,
          limit_exceeded: true,
        });
      }
    }

    // Handle 404 Not Found
    if (status === 404) {
      return Promise.reject({
        success: false,
        message: errorData.message || 'Resource not found',
        error_code: 'NOT_FOUND',
      });
    }

    // Handle 400 Bad Request - Validation errors
    if (status === 400) {
      return Promise.reject({
        success: false,
        message: errorData.message || 'Invalid request',
        error_code: ERROR_CODES.VALIDATION_ERROR,
        ...errorData,
      });
    }

    // Handle 500 Server Error
    if (status >= 500) {
      return Promise.reject({
        success: false,
        message: 'Server error. Please try again later.',
        error_code: ERROR_CODES.SERVER_ERROR,
      });
    }

    // Default error handling
    return Promise.reject({
      success: false,
      message: errorData.message || 'An error occurred',
      ...errorData,
    });
  }
);

/**
 * Storage helper functions
 */
export const storage = {
  /**
   * Save auth tokens
   */
  async saveTokens(accessToken, refreshToken) {
    try {
      // Validate tokens are not null/undefined
      if (!accessToken || !refreshToken) {
        console.error('❌ Cannot save tokens - undefined or null values');
        console.error('Access Token:', accessToken);
        console.error('Refresh Token:', refreshToken);
        throw new Error('Invalid tokens: both access_token and refresh_token are required');
      }

      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
      ]);
      
      if (__DEV__) {
        console.log('✅ Tokens saved successfully to AsyncStorage');
      }
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw error;
    }
  },

  /**
   * Get access token
   */
  async getAccessToken() {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  /**
   * Get refresh token
   */
  async getRefreshToken() {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  /**
   * Save user data
   */
  async saveUserData(userData) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  },

  /**
   * Get user data
   */
  async getUserData() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  /**
   * Clear all auth data
   */
  async clearAuthData() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw error;
    }
  },
};

/**
 * Clear auth data helper
 */
const clearAuthData = async () => {
  await storage.clearAuthData();
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async () => {
  const token = await storage.getAccessToken();
  return !!token;
};

/**
 * API request wrapper with error handling
 */
export const apiRequest = async (method, url, data = null, config = {}) => {
  try {
    const requestConfig = {
      method,
      url,
      ...config,
    };
    
    // Only add data for non-GET requests and when data is not null
    if (method !== 'GET' && data !== null) {
      requestConfig.data = data;
    } else if (method !== 'GET') {
      // For POST/PUT/DELETE without data, send empty object
      requestConfig.data = {};
    }
    
    const response = await apiClient(requestConfig);
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default apiClient;
export { STORAGE_KEYS };