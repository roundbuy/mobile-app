/**
 * Messaging Service
 * Handles all messaging-related API calls
 */

import apiClient from './api';

/**
 * Get user's conversations
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 20)
 * @returns {Promise} API response
 */
const getConversations = async (params = {}) => {
  const { page = 1, limit = 20 } = params;
  return apiClient.get('/messaging/conversations', { params: { page, limit } });
};

/**
 * Get messages in a conversation
 * @param {number} conversationId - Conversation ID
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 50)
 * @returns {Promise} API response
 */
const getConversationMessages = async (conversationId, params = {}) => {
  const { page = 1, limit = 50 } = params;
  return apiClient.get(`/messaging/conversations/${conversationId}/messages`, {
    params: { page, limit }
  });
};

/**
 * Send a message
 * @param {Object} messageData - Message data
 * @param {number} messageData.advertisement_id - Advertisement ID (receiver will be auto-determined as seller)
 * @param {string} messageData.message - Message content
 * @returns {Promise} API response
 */
const sendMessage = async (messageData) => {
  return apiClient.post('/messaging/messages', messageData);
};

/**
 * Make an offer
 * @param {Object} offerData - Offer data
 * @param {number} offerData.conversation_id - Conversation ID
 * @param {number} offerData.offered_price - Offered price
 * @param {string} offerData.message - Optional message
 * @returns {Promise} API response
 */
const makeOffer = async (offerData) => {
  return apiClient.post('/messaging/offers', offerData);
};

/**
 * Respond to an offer
 * @param {number} offerId - Offer ID
 * @param {Object} responseData - Response data
 * @param {string} responseData.action - Action: 'accept', 'reject', 'counter'
 * @param {number} responseData.counter_price - Counter price (if action is 'counter')
 * @returns {Promise} API response
 */
const respondToOffer = async (offerId, responseData) => {
  return apiClient.put(`/messaging/offers/${offerId}`, responseData);
};

/**
 * Get offers for a conversation
 * @param {number} conversationId - Conversation ID
 * @returns {Promise} API response
 */
const getConversationOffers = async (conversationId) => {
  return apiClient.get(`/messaging/conversations/${conversationId}/offers`);
};

/**
 * Mark messages as read in a conversation
 * @param {number} conversationId - Conversation ID
 * @returns {Promise} API response
 */
const markConversationAsRead = async (conversationId) => {
  // This is handled automatically when fetching messages
  // But we can expose it as a separate method if needed
  return getConversationMessages(conversationId, { page: 1, limit: 1 });
};

export default {
  getConversations,
  getConversationMessages,
  sendMessage,
  makeOffer,
  respondToOffer,
  getConversationOffers,
  markConversationAsRead
};