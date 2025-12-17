import { apiRequest } from './api';

/**
 * User Service
 * Handles user profile related API calls
 */

const userService = {
  /**
   * Get current user's profile information
   */
  async getUserProfile() {
    try {
      const response = await apiRequest('GET', '/user/profile');
      return response;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  /**
   * Update current user's profile information
   */
  async updateUserProfile(profileData) {
    try {
      const response = await apiRequest('PUT', '/user/profile', profileData);
      return response;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },
};

export default userService;