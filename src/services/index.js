/**
 * Services Index
 * Central export point for all API services
 */

import authService from './authService';
import userService from './userService';
import settingsService from './settingsService';
import subscriptionService from './subscriptionService';
import advertisementService from './advertisementService';
import messagingService from './messagingService';
import favoritesService from './favoritesService';
import offersService from './offersService';
import feedbackService from './feedbackService';
import walletService from './walletService';
import apiClient, { storage, apiRequest, isAuthenticated } from './api';
import { API_CONFIG, API_ENDPOINTS, ERROR_CODES } from '../config/api.config';

// Export individual services
export {
  authService,
  userService,
  settingsService,
  subscriptionService,
  advertisementService,
  messagingService,
  favoritesService,
  offersService,
  feedbackService,
  walletService,
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
  user: userService,
  settings: settingsService,
  subscription: subscriptionService,
  advertisement: advertisementService,
  messaging: messagingService,
  favorites: favoritesService,
  offers: offersService,
  feedback: feedbackService,
  wallet: walletService,
  storage,
  apiRequest,
  isAuthenticated,
};