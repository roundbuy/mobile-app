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

  /**
   * Get user's saved interest preferences
   */
  async getInterests() {
    try {
      return await apiRequest('GET', '/user/interests');
    } catch (error) {
      console.error('Error fetching interests:', error);
      throw error;
    }
  },

  /**
   * Save user's interest preferences
   */
  async saveInterests(payload) {
    try {
      return await apiRequest('PUT', '/user/interests', payload);
    } catch (error) {
      console.error('Error saving interests:', error);
      throw error;
    }
  },

  /**
   * Get active social club / events / garage-sales extensions for current user
   */
  async getSocialClubExtensionStatus() {
    try {
      return await apiRequest('GET', '/user/extensions/social-clubs/status');
    } catch (error) {
      console.error('Error fetching social club extension status:', error);
      throw error;
    }
  },

  /**
   * Activate the free first garage-sales gift extension
   */
  async activateSocialClubGift(extensionType) {
    try {
      return await apiRequest('POST', '/user/extensions/social-clubs/gift', { extension_type: extensionType });
    } catch (error) {
      console.error('Error activating social club gift:', error);
      throw error;
    }
  },

  /**
   * Update country preference
   */
  async updateCountryPreference(country, currency, language) {
    try {
      const response = await apiRequest('PUT', '/user/country-preference', { country, currency, language });
      return response;
    } catch (error) {
      console.error('Error updating country preference:', error);
      throw error;
    }
  },
};

export default userService;