import { apiRequest } from './api';
import { API_ENDPOINTS } from '../config/api.config';

/**
 * Stripe Service for React Native
 * Handles Stripe payment integration using backend APIs
 */

/**
 * Get Stripe publishable key from backend
 * @returns {Promise<string>} Stripe publishable key
 */
export const getStripePublishableKey = async () => {
    try {
        const response = await apiRequest('GET', API_ENDPOINTS.SUBSCRIPTION.STRIPE_CONFIG);
        if (response.success && response.data) {
            return response.data.stripe_publishable_key;
        }
        throw new Error('Failed to get Stripe configuration');
    } catch (error) {
        console.error('Error getting Stripe key:', error);
        throw error;
    }
};

/**
 * Create a Stripe Payment Method via backend (server-side tokenization)
 * This is more secure and avoids Stripe dashboard restrictions
 * @param {Object} cardDetails - { number, exp_month, exp_year, cvc }
 * @returns {Promise<string>} Payment Method ID (pm_...)
 */
export const createPaymentMethod = async (cardDetails) => {
    try {
        const response = await apiRequest('POST', API_ENDPOINTS.SUBSCRIPTION.CREATE_PAYMENT_METHOD, {
            card_number: cardDetails.number,
            exp_month: cardDetails.exp_month,
            exp_year: cardDetails.exp_year,
            cvc: cardDetails.cvc,
            billing_details: {}
        });

        if (response.success && response.data) {
            return response.data.payment_method_id;
        }
        throw new Error(response.message || 'Failed to create payment method');
    } catch (error) {
        console.error('Error creating payment method:', error);
        throw new Error(error.message || 'Failed to validate card details');
    }
};

/**
 * Create payment intent for subscription
 * @param {Object} params - Payment parameters
 * @param {number} params.planId - Subscription plan ID
 * @param {string} params.currencyCode - Currency code (e.g., 'USD', 'GBP')
 * @param {number} params.amount - Amount in smallest currency unit (cents)
 * @returns {Promise<Object>} Payment intent details
 */
export const createPaymentIntent = async ({ planId, currencyCode, amount }) => {
    try {
        const response = await apiRequest('POST', '/api/v1/mobile-app/subscription/create-payment-intent', {
            plan_id: planId,
            currency_code: currencyCode,
            amount: amount
        });

        if (response.success && response.data) {
            return response.data;
        }
        throw new Error(response.message || 'Failed to create payment intent');
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
    }
};

/**
 * Confirm payment and create subscription
 * @param {Object} params - Payment confirmation parameters
 * @param {number} params.planId - Subscription plan ID
 * @param {string} params.currencyCode - Currency code
 * @param {string} params.paymentMethodId - Stripe payment method ID
 * @param {boolean} params.savePaymentMethod - Whether to save payment method
 * @param {string} params.country - Country code
 * @param {string} params.zipCode - ZIP/Postal code
 * @returns {Promise<Object>} Subscription and transaction details
 */
export const confirmPaymentAndSubscribe = async ({
    planId,
    currencyCode,
    paymentMethodId,
    savePaymentMethod = false,
    country = 'US',
    zipCode = ''
}) => {
    try {
        const response = await apiRequest('POST', API_ENDPOINTS.SUBSCRIPTION.PURCHASE, {
            plan_id: planId,
            currency_code: currencyCode,
            payment_method_id: paymentMethodId,
            save_payment_method: savePaymentMethod,
            country: country,
            zip_code: zipCode,
            auto_renew: false
        });

        if (response.success && response.data) {
            return response.data;
        }
        throw new Error(response.message || 'Payment failed');
    } catch (error) {
        console.error('Error confirming payment:', error);
        throw error;
    }
};

/**
 * Get saved payment methods
 * @returns {Promise<Array>} List of saved payment methods
 */
export const getSavedPaymentMethods = async () => {
    try {
        const response = await apiRequest('GET', API_ENDPOINTS.SUBSCRIPTION.PAYMENT_METHODS);
        if (response.success && response.data) {
            return response.data.payment_methods || [];
        }
        return [];
    } catch (error) {
        console.error('Error getting saved payment methods:', error);
        return [];
    }
};

export default {
    getStripePublishableKey,
    createPaymentMethod,
    createPaymentIntent,
    confirmPaymentAndSubscribe,
    getSavedPaymentMethods
};
