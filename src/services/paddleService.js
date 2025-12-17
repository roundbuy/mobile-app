import axios from 'axios';
import { initializePaddle, Paddle } from '@paddle/paddle-js';
import api from './api';

let paddleInstance = null;

/**
 * Get Paddle client token from backend
 */
export const getClientToken = async () => {
  try {
    const response = await api.get('/paddle/client-token');
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error('Failed to get Paddle configuration');
    }
  } catch (error) {
    console.error('Error getting Paddle client token:', error);
    throw error;
  }
};

/**
 * Initialize Paddle with client token from backend
 */
export const initPaddle = async () => {
  try {
    // Get Paddle configuration from backend
    const config = await getClientToken();
    const { client_token, environment } = config;
    
    // Initialize Paddle
    paddleInstance = await initializePaddle({
      token: client_token,
      environment: environment === 'production' ? 'production' : 'sandbox',
      eventCallback: (event) => {
        console.log('Paddle event:', event);
        handlePaddleEvent(event);
      }
    });
    
    console.log('Paddle initialized successfully');
    return paddleInstance;
  } catch (error) {
    console.error('Error initializing Paddle:', error);
    throw error;
  }
};

/**
 * Get Paddle instance
 */
export const getPaddle = () => {
  if (!paddleInstance) {
    throw new Error('Paddle not initialized. Call initPaddle() first.');
  }
  return paddleInstance;
};

/**
 * Create a transaction and get checkout URL
 */
export const createTransaction = async (planId, currencyCode = 'USD') => {
  try {
    const response = await api.post('/paddle/create-transaction', {
      plan_id: planId,
      currency_code: currencyCode
    });
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to create transaction');
    }
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

/**
 * Open Paddle checkout overlay
 */
export const openCheckout = async (transactionId) => {
  try {
    const paddle = getPaddle();
    
    // Open checkout overlay
    paddle.Checkout.open({
      transactionId: transactionId,
      successCallback: (data) => {
        console.log('Payment successful:', data);
      },
      closeCallback: () => {
        console.log('Checkout closed');
      }
    });
  } catch (error) {
    console.error('Error opening checkout:', error);
    throw error;
  }
};

/**
 * Create and open checkout in one step
 */
export const purchasePlan = async (planId, currencyCode = 'USD') => {
  try {
    // Create transaction
    const transaction = await createTransaction(planId, currencyCode);
    
    // Open checkout
    await openCheckout(transaction.transaction_id);
    
    return transaction;
  } catch (error) {
    console.error('Error purchasing plan:', error);
    throw error;
  }
};

/**
 * Get transaction status
 */
export const getTransactionStatus = async (transactionId) => {
  try {
    const response = await api.get(`/paddle/transaction/${transactionId}`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to get transaction status');
    }
  } catch (error) {
    console.error('Error getting transaction status:', error);
    throw error;
  }
};

/**
 * Get available prices from Paddle
 */
export const getPrices = async () => {
  try {
    const response = await api.get('/paddle/prices');
    
    if (response.data.success) {
      return response.data.data.prices;
    } else {
      throw new Error(response.data.message || 'Failed to get prices');
    }
  } catch (error) {
    console.error('Error getting prices:', error);
    throw error;
  }
};

/**
 * Handle Paddle events
 */
const handlePaddleEvent = (event) => {
  switch (event.name) {
    case 'checkout.loaded':
      console.log('Checkout loaded');
      break;
    case 'checkout.customer.created':
      console.log('Customer created:', event.data);
      break;
    case 'checkout.completed':
      console.log('Checkout completed:', event.data);
      // Navigate to success screen or refresh subscription status
      break;
    case 'checkout.closed':
      console.log('Checkout closed');
      break;
    case 'checkout.error':
      console.error('Checkout error:', event.data);
      break;
    default:
      console.log('Paddle event:', event.name, event.data);
  }
};

/**
 * Format price for display
 */
export const formatPrice = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount / 100); // Paddle amounts are in cents
};

export default {
  initPaddle,
  getPaddle,
  getClientToken,
  createTransaction,
  openCheckout,
  purchasePlan,
  getTransactionStatus,
  getPrices,
  formatPrice
};