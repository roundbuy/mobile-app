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

  /**
   * Check if username is available
   */
  async checkUsername(username) {
    try {
      const response = await apiRequest('POST', '/user/check-username', { username });
      return response;
    } catch (error) {
      console.error('Error checking username:', error);
      throw error;
    }
  },

  /**
   * Update user's username
   */
  async updateUsername(username) {
    try {
      const response = await apiRequest('PUT', '/user/username', { username });
      return response;
    } catch (error) {
      console.error('Error updating username:', error);
      throw error;
    }
  },

  /**
   * Update user's profile image
   */
  async updateProfileImage(formData) {
    try {
      const response = await apiRequest('POST', '/user/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Error updating profile image:', error);
      throw error;
    }
  },
};

export default userService;