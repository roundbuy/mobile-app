import { apiRequest } from './api';

/**
 * Settings Service
 * Handles settings-related API calls (languages, currencies, countries, preferences)
 */

const settingsService = {
  /**
   * Get available languages
   */
  async getLanguages() {
    try {
      const response = await apiRequest('GET', '/settings/languages');
      return response;
    } catch (error) {
      console.error('Error fetching languages:', error);
      throw error;
    }
  },

  /**
   * Get available currencies
   */
  async getCurrencies() {
    try {
      const response = await apiRequest('GET', '/settings/currencies');
      return response;
    } catch (error) {
      console.error('Error fetching currencies:', error);
      throw error;
    }
  },

  /**
   * Get available countries
   */
  async getCountries() {
    try {
      const response = await apiRequest('GET', '/settings/countries');
      return response;
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  },

  /**
   * Get user preferences
   */
  async getUserPreferences() {
    try {
      const response = await apiRequest('GET', '/settings/preferences');
      return response;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      throw error;
    }
  },

  /**
   * Update user preferences
   */
  async updateUserPreferences(preferences) {
    try {
      const response = await apiRequest('PUT', '/settings/preferences', preferences);
      return response;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  },
};

export default settingsService;