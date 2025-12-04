/**
 * Services Index
 * Central export point for all API services
 */

import authService from './authService';
import subscriptionService from './subscriptionService';
import advertisementService from './advertisementService';
import apiClient, { storage, apiRequest, isAuthenticated } from './api';
import { API_CONFIG, API_ENDPOINTS, ERROR_CODES } from '../config/api.config';

// Export individual services
export {
  authService,
  subscriptionService,
  advertisementService,
  apiClient,
  storage,
  apiRequest,
  isAuthenticated,
  API_CONFIG,
  API_ENDPOINTS,
  ERROR_CODES,
};

// Default export with all services
export default {
  auth: authService,
  subscription: subscriptionService,
  advertisement: advertisementService,
  storage,
  apiRequest,
  isAuthenticated,
};