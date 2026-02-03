import { apiRequest } from './api';
import { API_ENDPOINTS } from '../config/api.config';

/**
 * Subscription Service
 * Handles subscription and payment-related API calls
 */

/**
 * Get all subscription plans
 * @param {string} currencyCode - Currency code (e.g., 'USD', 'INR')
 * @param {string} language - Language code (default: 'en')
 * @returns {Promise<Object>} Plans with pricing
 */
export const getSubscriptionPlans = async (currencyCode = 'INR', language = 'en') => {
  console.log('Fetching plans with currency:', currencyCode, 'and language:', language);
  console.log('API Endpoint:', `${API_ENDPOINTS.SUBSCRIPTION.PLANS}?currency_code=${currencyCode}&language=${language}`);

  try {
    const response = await apiRequest(
      'GET',
      `${API_ENDPOINTS.SUBSCRIPTION.PLANS}?currency_code=${currencyCode}&language=${language}`
    );
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get specific plan details
 * @param {number} planId - Plan ID
 * @param {string} currencyCode - Currency code
 * @param {string} language - Language code
 * @returns {Promise<Object>} Plan details
 */
export const getPlanDetails = async (planId, currencyCode = 'INR', language = 'en') => {
  try {
    const response = await apiRequest(
      'GET',
      `${API_ENDPOINTS.SUBSCRIPTION.PLAN_DETAILS(planId)}?currency_code=${currencyCode}&language=${language}`
    );
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Purchase subscription plan
 * @param {Object} purchaseData - Purchase data
 * @param {number} purchaseData.plan_id - Plan ID
 * @param {string} purchaseData.currency_code - Currency code
 * @param {string} purchaseData.payment_method_id - Stripe payment method ID
 * @param {boolean} purchaseData.save_payment_method - Save payment method for future
 * @param {string} purchaseData.country - Country code
 * @param {string} purchaseData.zip_code - ZIP/Postal code
 * @returns {Promise<Object>} Purchase response with subscription and transaction details
 */
export const purchaseSubscription = async (purchaseData) => {
  try {
    const response = await apiRequest('POST', API_ENDPOINTS.SUBSCRIPTION.PURCHASE, purchaseData);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get transaction status
 * @param {string} transactionId - Transaction/payment ID
 * @returns {Promise<Object>} Transaction and subscription details
 */
export const getTransactionStatus = async (transactionId) => {
  try {
    const response = await apiRequest(
      'GET',
      API_ENDPOINTS.SUBSCRIPTION.TRANSACTION(transactionId)
    );
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get saved payment methods
 * @returns {Promise<Object>} List of saved payment methods
 */
export const getSavedPaymentMethods = async () => {
  try {
    const response = await apiRequest('GET', API_ENDPOINTS.SUBSCRIPTION.PAYMENT_METHODS);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get Stripe configuration (publishable key)
 * @returns {Promise<Object>} Stripe config
 */
export const getStripeConfig = async () => {
  try {
    const response = await apiRequest('GET', API_ENDPOINTS.SUBSCRIPTION.STRIPE_CONFIG);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Activate free plan (Green plan)
 * @param {string} email - User's email (required for new users)
 * @returns {Promise<Object>} Activation response with subscription details
 */
export const activateFreePlan = async (email = null) => {
  try {
    const data = email ? { email } : {};
    const response = await apiRequest('POST', API_ENDPOINTS.SUBSCRIPTION.ACTIVATE_FREE, data);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get current user subscription
 * @returns {Promise<Object>} Current subscription details
 */
export const getCurrentSubscription = async () => {
  try {
    const response = await apiRequest('GET', API_ENDPOINTS.SUBSCRIPTION.CURRENT);
    return response;
  } catch (error) {
    throw error;
  }
};

export default {
  getSubscriptionPlans,
  getPlanDetails,
  purchaseSubscription,
  activateFreePlan,
  getCurrentSubscription,
  getTransactionStatus,
  getSavedPaymentMethods,
  getStripeConfig,
};