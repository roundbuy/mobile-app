import api from './api';

/**
 * Feedback Service
 * Handles all feedback-related API calls
 */

/**
 * Get advertisements/offers where user can give feedback
 * @returns {Promise} List of eligible transactions
 */
export const getEligibleForFeedback = async () => {
    try {
        const response = await api.get('/feedbacks/eligible');
        return response.data;
    } catch (error) {
        console.error('Error fetching eligible feedbacks:', error);
        throw error;
    }
};

/**
 * Create a new feedback
 * @param {Object} feedbackData - Feedback data
 * @param {number} feedbackData.advertisementId - Advertisement ID
 * @param {number} feedbackData.offerId - Offer ID (optional)
 * @param {number} feedbackData.reviewedUserId - User being reviewed
 * @param {number} feedbackData.rating - Rating (1-5)
 * @param {string} feedbackData.comment - Feedback comment
 * @param {string} feedbackData.transactionType - Transaction type (buy/sell/rent/give/service)
 * @returns {Promise} Created feedback
 */
export const createFeedback = async (feedbackData) => {
    try {
        const response = await api.post('/feedbacks', feedbackData);
        return response.data;
    } catch (error) {
        console.error('Error creating feedback:', error);
        throw error;
    }
};

/**
 * Get feedbacks received by current user
 * @param {number} limit - Number of feedbacks to fetch
 * @param {number} offset - Offset for pagination
 * @param {string} status - Filter by status (optional)
 * @returns {Promise} User's received feedbacks and stats
 */
export const getMyFeedbacks = async (limit = 50, offset = 0, status = null) => {
    try {
        const response = await api.get('/feedbacks/my-feedbacks', {
            params: { limit, offset, status }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching my feedbacks:', error);
        throw error;
    }
};

/**
 * Get feedbacks for a specific user
 * @param {number} userId - User ID
 * @param {number} limit - Number of feedbacks to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise} User's feedbacks and stats
 */
export const getUserFeedbacks = async (userId, limit = 20, offset = 0) => {
    try {
        const response = await api.get(`/feedbacks/user/${userId}`, {
            params: { limit, offset }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user feedbacks:', error);
        throw error;
    }
};

/**
 * Get feedback statistics for a user
 * @param {number} userId - User ID
 * @returns {Promise} Feedback statistics
 */
export const getFeedbackStats = async (userId) => {
    try {
        const response = await api.get(`/feedbacks/stats/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching feedback stats:', error);
        throw error;
    }
};

/**
 * Check if user can give feedback for a specific advertisement
 * @param {number} advertisementId - Advertisement ID
 * @param {number} offerId - Offer ID (optional)
 * @returns {Promise} Eligibility check result
 */
export const canGiveFeedback = async (advertisementId, offerId = null) => {
    try {
        const params = offerId ? { offerId } : {};
        const response = await api.get(`/feedbacks/can-give/${advertisementId}`, {
            params
        });
        return response.data;
    } catch (error) {
        console.error('Error checking feedback eligibility:', error);
        throw error;
    }
};

/**
 * Get feedbacks given by current user
     * @param {number} limit - Number of feedbacks to fetch
     * @param {number} offset - Offset for pagination
     * @returns {Promise} User's given feedbacks
     */
export const getGivenFeedbacks = async (limit = 50, offset = 0) => {
    try {
        const response = await api.get('/feedbacks/given', {
            params: { limit, offset }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching given feedbacks:', error);
        throw error;
    }
};

/**
 * Update a feedback (content)
 * @param {number} id - Feedback ID
 * @param {Object} data - { rating, comment }
 * @returns {Promise} Update result
 */
export const updateFeedback = async (id, data) => {
    try {
        const response = await api.put(`/feedbacks/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating feedback:', error);
        throw error;
    }
};

/**
 * Update feedback status (approve/reject)
 * @param {number} id - Feedback ID
 * @param {string} status - 'approved' or 'rejected'
 * @returns {Promise} Update result
 */
export const updateFeedbackStatus = async (id, status) => {
    try {
        const response = await api.patch(`/feedbacks/${id}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('Error updating feedback status:', error);
        throw error;
    }
};

export default {
    getEligibleForFeedback,
    createFeedback,
    getMyFeedbacks,
    getUserFeedbacks,
    getFeedbackStats,
    getFeedbackStats,
    canGiveFeedback,
    getGivenFeedbacks,
    updateFeedback,
    updateFeedbackStatus
};
