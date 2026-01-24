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
 * @returns {Promise} User's received feedbacks and stats
 */
export const getMyFeedbacks = async (limit = 50, offset = 0) => {
    try {
        const response = await api.get('/feedbacks/my-feedbacks', {
            params: { limit, offset }
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

export default {
    getEligibleForFeedback,
    createFeedback,
    getMyFeedbacks,
    getUserFeedbacks,
    getFeedbackStats,
    canGiveFeedback
};
