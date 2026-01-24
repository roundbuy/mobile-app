/**
 * Offers Service
 * Handles all offers-related API calls for managing price offers
 */

import apiClient from './api';

/**
 * Get all offers for the current user
 * @param {Object} params - Query parameters
 * @param {string} params.type - 'buyer', 'seller', or 'all' (default: 'all')
 * @param {string} params.status - Filter by status: 'pending', 'accepted', 'rejected', 'counter_offered'
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 20)
 * @returns {Promise} API response with offers and pagination
 */
const getUserOffers = async (params = {}) => {
  const { type = 'all', status, page = 1, limit = 20 } = params;
  return apiClient.get('/offers', {
    params: { type, status, page, limit }
  });
};

/**
 * Get offers for a specific advertisement
 * @param {number} advertisementId - Advertisement ID
 * @returns {Promise} API response with offers
 */
const getAdvertisementOffers = async (advertisementId) => {
  return apiClient.get(`/offers/advertisement/${advertisementId}`);
};

/**
 * Get offer statistics for the current user
 * @returns {Promise} API response with statistics
 */
const getOfferStats = async () => {
  return apiClient.get('/offers/stats');
};

/**
 * Get offers made by the user (as buyer)
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise} API response
 */
const getOffersMade = async (params = {}) => {
  return getUserOffers({ ...params, type: 'buyer' });
};

/**
 * Get offers received by the user (as seller)
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise} API response
 */
const getOffersReceived = async (params = {}) => {
  return getUserOffers({ ...params, type: 'seller' });
};

/**
 * Get received offers (alias for getOffersReceived)
 */
const getReceivedOffers = async (params = {}) => {
  return getUserOffers({ ...params, type: 'seller' });
};

/**
 * Get accepted offers
 * @param {Object} params - Query parameters
 * @returns {Promise} API response
 */
const getAcceptedOffers = async (params = {}) => {
  return getUserOffers({ ...params, status: 'accepted' });
};

/**
 * Get declined/rejected offers
 * @param {Object} params - Query parameters
 * @returns {Promise} API response
 */
const getDeclinedOffers = async (params = {}) => {
  return getUserOffers({ ...params, status: 'rejected' });
};

/**
 * Get pending offers
 * @param {Object} params - Query parameters
 * @returns {Promise} API response
 */
const getPendingOffers = async (params = {}) => {
  return getUserOffers({ ...params, status: 'pending' });
};

/**
 * Accept an offer
 * @param {number} offerId - Offer ID
 * @returns {Promise} API response
 */
const acceptOffer = async (offerId) => {
  return apiClient.post(`/offers/${offerId}/accept`);
};

/**
 * Decline/Reject an offer
 * @param {number} offerId - Offer ID
 * @returns {Promise} API response
 */
const declineOffer = async (offerId) => {
  return apiClient.post(`/offers/${offerId}/reject`);
};

export default {
  getUserOffers,
  getAdvertisementOffers,
  getOfferStats,
  getOffersMade,
  getOffersReceived,
  getReceivedOffers,
  getAcceptedOffers,
  getDeclinedOffers,
  getPendingOffers,
  acceptOffer,
  declineOffer
};