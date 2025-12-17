/**
 * Favorites Service
 * Handles all favorites/wishlist-related API calls
 */

import apiClient from './api';

/**
 * Get user's favorites list
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 20)
 * @returns {Promise} API response
 */
const getUserFavorites = async (params = {}) => {
  const { page = 1, limit = 20 } = params;
  return apiClient.get('/favorites', { params: { page, limit } });
};

/**
 * Add advertisement to favorites
 * @param {Object} favoriteData - Favorite data
 * @param {number} favoriteData.advertisement_id - Advertisement ID to favorite
 * @returns {Promise} API response
 */
const addToFavorites = async (favoriteData) => {
  return apiClient.post('/favorites', favoriteData);
};

/**
 * Remove advertisement from favorites
 * @param {number} advertisementId - Advertisement ID to remove from favorites
 * @returns {Promise} API response
 */
const removeFromFavorites = async (advertisementId) => {
  return apiClient.delete(`/favorites/${advertisementId}`);
};

/**
 * Check if advertisement is in user's favorites
 * @param {number} advertisementId - Advertisement ID to check
 * @returns {Promise} API response
 */
const checkFavoriteStatus = async (advertisementId) => {
  return apiClient.get(`/favorites/check/${advertisementId}`);
};

/**
 * Toggle favorite status (add if not favorited, remove if favorited)
 * @param {number} advertisementId - Advertisement ID
 * @returns {Promise} API response with new status
 */
const toggleFavorite = async (advertisementId) => {
  try {
    // First check current status
    const statusResponse = await checkFavoriteStatus(advertisementId);

    console.log('Status response:', statusResponse);

    // Check if response is valid
    if (!statusResponse || typeof statusResponse !== 'object') {
      throw new Error('Invalid response from server');
    }

    // Handle success response
    if (statusResponse.success && statusResponse.data) {
      if (statusResponse.data.is_favorited) {
        // Remove from favorites
        const removeResponse = await removeFromFavorites(advertisementId);
        return {
          success: true,
          data: {
            is_favorited: false,
            advertisement_id: advertisementId,
            message: 'Removed from favorites'
          }
        };
      } else {
        // Add to favorites
        const addResponse = await addToFavorites({ advertisement_id: advertisementId });
        return {
          success: true,
          data: {
            is_favorited: true,
            advertisement_id: advertisementId,
            message: 'Added to favorites'
          }
        };
      }
    }

    // If success is false or data is missing
    throw new Error(statusResponse.message || 'Failed to check favorite status');
  } catch (error) {
    console.error('Toggle favorite error:', error);

    // Re-throw with more context
    if (error.response) {
      throw new Error(error.response.data?.message || 'Server error');
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Failed to toggle favorite');
    }
  }
};

export default {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavoriteStatus,
  toggleFavorite
};