import apiClient from './api';

/**
 * Campaign Notification Service
 * Handles fetching and managing campaign notifications
 */

const campaignNotificationService = {
    /**
     * Get user's campaign notifications with pagination
     * Requires authentication
     */
    getMyCampaignNotifications: async (limit = 50, offset = 0) => {
        try {
            const response = await apiClient.get(`/campaign-notifications?limit=${limit}&offset=${offset}`);
            return response.data;
        } catch (error) {
            console.error('Get campaign notifications error:', error);
            throw error;
        }
    },

    /**
     * Fetch campaign notifications (alias for getMyCampaignNotifications)
     */
    fetchCampaignNotifications: async () => {
        try {
            const response = await apiClient.get('/campaign-notifications');
            return response.data.notifications || [];
        } catch (error) {
            console.error('Error fetching campaign notifications:', error);
            throw error;
        }
    },

    /**
     * Mark campaign notification as read
     */
    markCampaignNotificationAsRead: async (userNotificationId) => {
        try {
            const response = await apiClient.post(`/campaign-notifications/${userNotificationId}/read`);
            return response.data;
        } catch (error) {
            console.error('Error marking campaign notification as read:', error);
            throw error;
        }
    },

    /**
     * Mark campaign notification as clicked
     */
    markCampaignNotificationAsClicked: async (userNotificationId, buttonClicked = null) => {
        try {
            const response = await apiClient.post(`/campaign-notifications/${userNotificationId}/click`, {
                button_clicked: buttonClicked
            });
            return response.data;
        } catch (error) {
            console.error('Error marking campaign notification as clicked:', error);
            throw error;
        }
    },

    /**
     * Dismiss campaign notification
     */
    dismissCampaignNotification: async (userNotificationId) => {
        try {
            const response = await apiClient.post(`/campaign-notifications/${userNotificationId}/dismiss`);
            return response.data;
        } catch (error) {
            console.error('Error dismissing campaign notification:', error);
            throw error;
        }
    },

    /**
     * Get campaign notification statistics for user
     */
    getCampaignNotificationStats: async () => {
        try {
            const response = await apiClient.get('/campaign-notifications/stats');
            return response.data.stats || {};
        } catch (error) {
            console.error('Error fetching campaign notification stats:', error);
            throw error;
        }
    }
};

export default campaignNotificationService;
