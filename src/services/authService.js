import apiClient, { storage, apiRequest } from './api';
import { API_ENDPOINTS } from '../config/api.config';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.full_name - User's full name
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @param {string} userData.language - Preferred language (default: 'en')
 * @returns {Promise<Object>} Registration response
 */
export const register = async (userData) => {
  try {
    const response = await apiRequest('POST', API_ENDPOINTS.AUTH.REGISTER, userData);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify email with token
 * @param {string} email - User's email
 * @param {string} token - Verification token
 * @returns {Promise<Object>} Verification response
 */
export const verifyEmail = async (email, token) => {
  try {
    const response = await apiRequest('POST', API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
      email,
      token,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Resend verification email
 * @param {string} email - User's email
 * @returns {Promise<Object>} Response
 */
export const resendVerification = async (email) => {
  try {
    const response = await apiRequest('POST', API_ENDPOINTS.AUTH.RESEND_VERIFICATION, {
      email,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Login user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} Login response with tokens and user data
 */
export const login = async (email, password) => {
  try {
    const response = await apiRequest('POST', API_ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });

    if (__DEV__) {
      console.log('📱 Login Response:', JSON.stringify(response, null, 2));
    }

    // Save tokens and user data to storage
    if (response.success && response.data) {
      const { access_token, refresh_token, user } = response.data;
      
      if (__DEV__) {
        console.log('📱 Extracted from response:', {
          has_access_token: !!access_token,
          has_refresh_token: !!refresh_token,
          has_user: !!user,
          access_token_type: typeof access_token,
          refresh_token_type: typeof refresh_token
        });
      }
      
      // Only save if tokens exist and are not undefined
      if (access_token && refresh_token && access_token !== 'undefined' && refresh_token !== 'undefined') {
        await storage.saveTokens(access_token, refresh_token);
        console.log('✅ Tokens saved successfully');
      } else {
        console.error('❌ Login successful but tokens are missing or undefined');
        console.error('Response data:', response.data);
        throw new Error('Login successful but authentication tokens were not provided by server');
      }
      
      // Save user data if exists
      if (user) {
        await storage.saveUserData(user);
        console.log('✅ User data saved successfully');
      } else {
        console.warn('⚠️ User data not found in response');
      }
    } else {
      console.error('❌ Invalid login response structure:', response);
      throw new Error('Invalid response from server');
    }

    return response;
  } catch (error) {
    console.error('❌ Login error in authService:', error);
    throw error;
  }
};

/**
 * Logout user
 * Clears local storage and tokens
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await storage.clearAuthData();
    // Optionally call backend logout endpoint if it exists
    // await apiRequest('POST', '/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Request password reset
 * @param {string} email - User's email
 * @returns {Promise<Object>} Response
 */
export const forgotPassword = async (email) => {
  try {
    const response = await apiRequest('POST', API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      email,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Reset password with token
 * @param {string} email - User's email
 * @param {string} token - Reset token
 * @param {string} new_password - New password
 * @returns {Promise<Object>} Response
 */
export const resetPassword = async (email, token, new_password) => {
  try {
    const response = await apiRequest('POST', API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      email,
      token,
      new_password,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Change password (for authenticated users)
 * @param {string} current_password - Current password
 * @param {string} new_password - New password
 * @returns {Promise<Object>} Response
 */
export const changePassword = async (current_password, new_password) => {
  try {
    const response = await apiRequest('POST', API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      current_password,
      new_password,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get current user data from storage
 * @returns {Promise<Object|null>} User data or null
 */
export const getCurrentUser = async () => {
  try {
    return await storage.getUserData();
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} True if authenticated
 */
export const isAuthenticated = async () => {
  try {
    const token = await storage.getAccessToken();
    return !!token;
  } catch (error) {
    return false;
  }
};

/**
 * Refresh access token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} New tokens response
 */
export const refreshToken = async (refreshToken) => {
  try {
    const response = await apiRequest('POST', API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      refresh_token: refreshToken,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Update stored user data
 * @param {Object} userData - User data to update
 * @returns {Promise<void>}
 */
export const updateStoredUserData = async (userData) => {
  try {
    await storage.saveUserData(userData);
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
};

export default {
  register,
  verifyEmail,
  resendVerification,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  getCurrentUser,
  isAuthenticated,
  updateStoredUserData,
};