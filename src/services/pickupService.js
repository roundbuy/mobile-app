import { apiRequest } from './api';

/**
 * Pickup Service
 * Handles all pickup schedule-related API calls
 */

/**
 * Schedule a new pickup
 * @param {Object} data - Pickup schedule data
 * @param {number} data.offer_id - Offer ID
 * @param {number} data.advertisement_id - Advertisement ID
 * @param {string} data.scheduled_date - Date in YYYY-MM-DD format
 * @param {string} data.scheduled_time - Time in HH:MM format
 * @param {string} data.description - Optional description
 * @returns {Promise<Object>} Created pickup schedule
 */
export const schedulePickup = async (data) => {
    try {
        const response = await apiRequest('POST', '/pickups/schedule', data);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get all pickups for current user
 * @param {Object} filters - Filter options
 * @param {string} filters.type - 'buyer', 'seller', or 'all'
 * @param {string} filters.status - Filter by status
 * @param {string} filters.payment_status - Filter by payment status
 * @param {number} filters.page - Page number
 * @param {number} filters.limit - Items per page
 * @returns {Promise<Object>} List of pickups with pagination
 */
export const getUserPickups = async (filters = {}) => {
    try {
        const params = new URLSearchParams();

        if (filters.type) params.append('type', filters.type);
        if (filters.status) params.append('status', filters.status);
        if (filters.payment_status) params.append('payment_status', filters.payment_status);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        const queryString = params.toString();
        const url = `/pickups${queryString ? '?' + queryString : ''}`;

        const response = await apiRequest('GET', url);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get pickup details
 * @param {number} pickupId - Pickup ID
 * @returns {Promise<Object>} Pickup details
 */
export const getPickupDetails = async (pickupId) => {
    try {
        const response = await apiRequest('GET', `/pickups/${pickupId}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get current pickup fees
 * @returns {Promise<Object>} Fee information
 */
export const getPickupFees = async () => {
    try {
        const response = await apiRequest('GET', '/pickups/fees');
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get unpaid pickups
 * @returns {Promise<Object>} List of unpaid pickups
 */
export const getUnpaidPickups = async () => {
    try {
        const response = await apiRequest('GET', '/pickups/unpaid');
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Confirm a pickup (seller only)
 * @param {number} pickupId - Pickup ID
 * @returns {Promise<Object>} Success response
 */
export const confirmPickup = async (pickupId) => {
    try {
        const response = await apiRequest('PUT', `/pickups/${pickupId}/confirm`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Reschedule a pickup
 * @param {number} pickupId - Pickup ID
 * @param {Object} data - Reschedule data
 * @param {string} data.scheduled_date - New date
 * @param {string} data.scheduled_time - New time
 * @param {string} data.reschedule_reason - Reason for rescheduling
 * @returns {Promise<Object>} Success response
 */
export const reschedulePickup = async (pickupId, data) => {
    try {
        const response = await apiRequest('PUT', `/pickups/${pickupId}/reschedule`, data);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Mark pickup as completed (seller only)
 * @param {number} pickupId - Pickup ID
 * @returns {Promise<Object>} Success response
 */
export const completePickup = async (pickupId) => {
    try {
        const response = await apiRequest('PUT', `/pickups/${pickupId}/complete`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Cancel a pickup
 * @param {number} pickupId - Pickup ID
 * @param {string} cancellation_reason - Reason for cancellation
 * @returns {Promise<Object>} Success response
 */
export const cancelPickup = async (pickupId, cancellation_reason) => {
    try {
        const response = await apiRequest('DELETE', `/pickups/${pickupId}/cancel`, {
            cancellation_reason
        });
        return response;
    } catch (error) {
        throw error;
    }
};

export default {
    schedulePickup,
    getUserPickups,
    getPickupDetails,
    getPickupFees,
    getUnpaidPickups,
    confirmPickup,
    reschedulePickup,
    completePickup,
    cancelPickup
};
