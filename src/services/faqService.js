import api from './api';

/**
 * FAQ Service
 * Handles all FAQ-related API calls for mobile app
 */

const faqService = {
    /**
     * Get all FAQs organized hierarchically
     */
    getAllFaqs: async () => {
        try {
            const response = await api.get('/faqs');
            return response.data;
        } catch (error) {
            console.error('Get all FAQs error:', error);
            throw error;
        }
    },

    /**
     * Get FAQs by category
     */
    getFaqsByCategory: async (categoryId) => {
        try {
            const response = await api.get(`/faqs/category/${categoryId}`);
            return response.data;
        } catch (error) {
            console.error('Get FAQs by category error:', error);
            throw error;
        }
    },

    /**
     * Search FAQs
     */
    searchFaqs: async (query) => {
        try {
            const response = await api.get('/faqs/search', {
                params: { q: query }
            });
            return response.data;
        } catch (error) {
            console.error('Search FAQs error:', error);
            throw error;
        }
    },

    /**
     * Get FAQ categories (lightweight)
     */
    getCategories: async () => {
        try {
            const response = await api.get('/faqs/categories');
            return response.data;
        } catch (error) {
            console.error('Get categories error:', error);
            throw error;
        }
    },

    /**
     * Get single FAQ by ID
     */
    getFaqById: async (id) => {
        try {
            const response = await api.get(`/faqs/${id}`);
            return response.data;
        } catch (error) {
            console.error('Get FAQ by ID error:', error);
            throw error;
        }
    }
};

export default faqService;
