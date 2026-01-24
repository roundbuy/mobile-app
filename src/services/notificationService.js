/**
 * Notification Service
 * 
 * Handles all notification-related API calls for the mobile app
 */

import apiClient from './api';

const notificationService = {
    /**
     * Register device token for push notifications
     * Works for both authenticated users and guests
     */
    registerDeviceToken: async (deviceToken, platform, deviceId, deviceName = null) => {
        try {
            const response = await apiClient.post('/notifications/device-token', {
                deviceToken,
                platform,
                deviceId,
                deviceName
            });
            return response.data;
        } catch (error) {
            console.error('Register device token error:', error);
            throw error;
        }
    },

    /**
     * Remove device token (on logout or app uninstall)
     */
    removeDeviceToken: async (deviceToken) => {
        try {
            const response = await apiClient.delete('/notifications/device-token', {
                data: { deviceToken }
            });
            return response.data;
        } catch (error) {
            console.error('Remove device token error:', error);
            throw error;
        }
    },

    /**
     * Get user's notifications with pagination
     * Requires authentication
     */
    getMyNotifications: async (limit = 50, offset = 0) => {
        try {
            const response = await apiClient.get(`/notifications?limit=${limit}&offset=${offset}`);
            return response.data;
        } catch (error) {
            console.error('Get notifications error:', error);
            throw error;
        }
    },

    /**
     * Get unread notification count
     * Requires authentication
     */
    getUnreadCount: async () => {
        try {
            const response = await apiClient.get('/notifications/unread-count');
            return response.data;
        } catch (error) {
            console.error('Get unread count error:', error);
            throw error;
        }
    },

    /**
     * Mark notification as read
     * Requires authentication
     */
    markAsRead: async (notificationId) => {
        try {
            const response = await apiClient.put(`/notifications/${notificationId}/read`);
            return response.data;
        } catch (error) {
            console.error('Mark as read error:', error);
            throw error;
        }
    },

    /**
     * Mark notification as clicked
     * Requires authentication
     */
    markAsClicked: async (notificationId) => {
        try {
            const response = await apiClient.put(`/notifications/${notificationId}/clicked`);
            return response.data;
        } catch (error) {
            console.error('Mark as clicked error:', error);
            throw error;
        }
    },

    /**
     * Mark all notifications as read
     * Requires authentication
     */
    markAllAsRead: async () => {
        try {
            const response = await apiClient.put('/notifications/read-all');
            return response.data;
        } catch (error) {
            console.error('Mark all as read error:', error);
            throw error;
        }
    },

    /**
     * Delete a notification
     * Requires authentication
     */
    deleteNotification: async (notificationId) => {
        try {
            const response = await apiClient.delete(`/notifications/${notificationId}`);
            return response.data;
        } catch (error) {
            console.error('Delete notification error:', error);
            throw error;
        }
    },

    /**
     * Heartbeat - Check for new notifications
     * Works for both authenticated users and guests
     */
    heartbeat: async (deviceId, lastCheck = null) => {
        try {
            let url = '/notifications/heartbeat';
            const params = [];

            if (deviceId) {
                params.push(`deviceId=${deviceId}`);
            }
            if (lastCheck) {
                params.push(`lastCheck=${lastCheck}`);
            }

            if (params.length > 0) {
                url += '?' + params.join('&');
            }

            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            console.error('Heartbeat error:', error);
            throw error;
        }
    }
};

export default notificationService;
