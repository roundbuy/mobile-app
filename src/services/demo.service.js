import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

/**
 * Create a separate axios instance for demo endpoints (no auth required)
 */
const demoApiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL.replace('/mobile-app', ''), // Remove /mobile-app from base URL
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS,
});

// Add request/response logging for development
demoApiClient.interceptors.request.use(
    (config) => {
        if (__DEV__) {
            console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.url}`, config.params || {});
        }
        return config;
    },
    (error) => Promise.reject(error)
);

demoApiClient.interceptors.response.use(
    (response) => {
        if (__DEV__) {
            console.log(`✅ API Response: ${response.config.url}`, response.status);
        }
        return response;
    },
    (error) => {
        if (__DEV__) {
            console.error(`❌ API Error: ${error.config?.url}`, error.response?.status);
            console.error('Error details:', error.response?.data || error.message);
        }
        return Promise.reject(error);
    }
);

/**
 * Demo Service
 * Handles all demo-related API calls (no authentication required)
 */
export const demoService = {
    /**
     * Get demo advertisements
     * @param {Object} params - Query parameters (latitude, longitude, radius, etc.)
     * @returns {Promise} API response with demo advertisements
     */
    getDemoAdvertisements: async (params) => {
        try {
            const response = await demoApiClient.get('/demo/advertisements', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: error.message };
        }
    },

    /**
     * Get single demo advertisement
     * @param {number} id - Advertisement ID
     * @returns {Promise} API response with advertisement details
     */
    getDemoAdvertisement: async (id) => {
        try {
            const response = await demoApiClient.get(`/demo/advertisements/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: error.message };
        }
    },

    /**
     * Upload CSV file (for future use)
     * @param {string} fileUri - URI of the CSV file
     * @returns {Promise} API response
     */
    uploadCSV: async (fileUri) => {
        try {
            const formData = new FormData();
            formData.append('csvFile', {
                uri: fileUri,
                type: 'text/csv',
                name: 'demo-data.csv'
            });

            const response = await demoApiClient.post('/demo/upload-csv', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: error.message };
        }
    }
};

export default demoService;
