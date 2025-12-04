import { apiRequest } from './api';
import apiClient from './api';
import { API_ENDPOINTS } from '../config/api.config';

/**
 * Advertisement Service
 * Handles advertisement-related API calls
 */

/**
 * Get advertisement filter options
 * @returns {Promise<Object>} Filter options (categories, activities, conditions, etc.)
 */
export const getFilters = async () => {
  try {
    const response = await apiRequest('GET', API_ENDPOINTS.ADVERTISEMENT.FILTERS);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Browse/search advertisements
 * @param {Object} filters - Search filters
 * @param {string} filters.search - Search query
 * @param {number} filters.category_id - Category ID
 * @param {number} filters.subcategory_id - Subcategory ID
 * @param {number} filters.activity_id - Activity ID
 * @param {number} filters.condition_id - Condition ID
 * @param {number} filters.min_price - Minimum price
 * @param {number} filters.max_price - Maximum price
 * @param {number} filters.latitude - User latitude
 * @param {number} filters.longitude - User longitude
 * @param {number} filters.radius - Search radius in km (default 50)
 * @param {string} filters.sort - Sort field (created_at, price, views_count, distance)
 * @param {string} filters.order - Sort order (ASC, DESC)
 * @param {number} filters.page - Page number
 * @param {number} filters.limit - Items per page
 * @returns {Promise<Object>} List of advertisements with pagination
 */
export const browseAdvertisements = async (filters = {}) => {
  try {
    // Build query string from filters
   const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    const queryString = params.toString();
    const url = `${API_ENDPOINTS.ADVERTISEMENT.BROWSE}${queryString ? '?' + queryString : ''}`;

    const response = await apiRequest('GET', url);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get featured advertisements
 * @param {number} limit - Number of items (default 10)
 * @returns {Promise<Object>} List of featured advertisements
 */
export const getFeaturedAdvertisements = async (limit = 10) => {
  try {
    const response = await apiRequest(
      'GET',
      `${API_ENDPOINTS.ADVERTISEMENT.FEATURED}?limit=${limit}`
    );
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get advertisement details (public view)
 * @param {number} id - Advertisement ID
 * @returns {Promise<Object>} Advertisement details with seller info
 */
export const getAdvertisementDetails = async (id) => {
  try {
    const response = await apiRequest('GET', API_ENDPOINTS.ADVERTISEMENT.VIEW(id));
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user's saved locations
 * @returns {Promise<Object>} List of user locations
 */
export const getUserLocations = async () => {
  try {
    const response = await apiRequest('GET', API_ENDPOINTS.ADVERTISEMENT.LOCATIONS);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new advertisement
 * @param {Object} adData - Advertisement data
 * @returns {Promise<Object>} Created advertisement
 */
export const createAdvertisement = async (adData) => {
  try {
    const response = await apiRequest('POST', API_ENDPOINTS.ADVERTISEMENT.CREATE, adData);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user's advertisements
 * @param {Object} options - Query options
 * @param {string} options.status - Filter by status
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @returns {Promise<Object>} List of user's advertisements
 */
export const getUserAdvertisements = async (options = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (options.status) params.append('status', options.status);
    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);

    const queryString = params.toString();
    const url = `${API_ENDPOINTS.ADVERTISEMENT.LIST}${queryString ? '?' + queryString : ''}`;

    const response = await apiRequest('GET', url);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get single advertisement (own ad)
 * @param {number} id - Advertisement ID
 * @returns {Promise<Object>} Advertisement details
 */
export const getMyAdvertisement = async (id) => {
  try {
    const response = await apiRequest('GET', API_ENDPOINTS.ADVERTISEMENT.GET(id));
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Update advertisement
 * @param {number} id - Advertisement ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated advertisement
 */
export const updateAdvertisement = async (id, updateData) => {
  try {
    const response = await apiRequest('PUT', API_ENDPOINTS.ADVERTISEMENT.UPDATE(id), updateData);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete advertisement
 * @param {number} id - Advertisement ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteAdvertisement = async (id) => {
  try {
    const response = await apiRequest('DELETE', API_ENDPOINTS.ADVERTISEMENT.DELETE(id));
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Create user location
 * @param {Object} locationData - Location data
 * @returns {Promise<Object>} Created location
 */
export const createLocation = async (locationData) => {
  try {
    const response = await apiRequest('POST', API_ENDPOINTS.LOCATION.CREATE, locationData);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user location
 * @param {number} id - Location ID
 * @param {Object} locationData - Updated location data
 * @returns {Promise<Object>} Updated location
 */
export const updateLocation = async (id, locationData) => {
  try {
    const response = await apiRequest('PUT', API_ENDPOINTS.LOCATION.UPDATE(id), locationData);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete user location
 * @param {number} id - Location ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteLocation = async (id) => {
  try {
    const response = await apiRequest('DELETE', API_ENDPOINTS.LOCATION.DELETE(id));
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Set location as default
 * @param {number} id - Location ID
 * @returns {Promise<Object>} Update confirmation
 */
export const setDefaultLocation = async (id) => {
  try {
    const response = await apiRequest('PATCH', API_ENDPOINTS.LOCATION.SET_DEFAULT(id));
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Upload images for advertisement
 * @param {Array} images - Array of image objects from expo-image-picker
 * @returns {Promise<Object>} Upload response with image URLs
 */
export const uploadImages = async (images) => {
  try {
    const formData = new FormData();

    // Add each image to form data
    images.forEach((image, index) => {
      const fileName = image.uri.split('/').pop() || `image_${index}.jpg`;
      const fileType = image.type || 'image/jpeg'; // Default to jpeg if not specified

      // For React Native, create proper file object
      formData.append('images', {
        uri: image.uri,
        name: fileName,
        type: fileType,
      });
    });

    // Use apiClient directly for multipart upload
    const response = await apiClient.post(API_ENDPOINTS.UPLOAD.IMAGES, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getFilters,
  browseAdvertisements,
  getFeaturedAdvertisements,
  getAdvertisementDetails,
  getUserLocations,
  createAdvertisement,
  getUserAdvertisements,
  getMyAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  createLocation,
  updateLocation,
  deleteLocation,
  setDefaultLocation,
  uploadImages,
};