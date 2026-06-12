/**
 * API Configuration for RoundBuy Mobile App
 * Supports environment-based configuration for development and production
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Get the appropriate API base URL based on environment and platform
 * Priority:
 * 1. Environment variable (EXPO_PUBLIC_API_URL)
 * 2. Auto-detection based on platform
 * 3. Production URL
 */
const getApiUrl = () => {
  // Use local server routes in development mode so we can test local backend changes
  if (__DEV__) {
    const envApiUrl = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;
    if (envApiUrl) {
      console.log('📡 Using API URL from environment:', envApiUrl);
      return envApiUrl;
    }

    const localIp = Constants.expoConfig?.extra?.localIp || process.env.EXPO_PUBLIC_LOCAL_IP;

    if (Platform.OS === 'ios') {
      const url = localIp ? `http://${localIp}:5001/api/v1/mobile-app` : 'http://localhost:5001/api/v1/mobile-app';
      console.log('📱 iOS Development - Using:', url);
      return url;
    } else if (Platform.OS === 'android') {
      const url = localIp ? `http://${localIp}:5001/api/v1/mobile-app` : 'http://10.0.2.2:5001/api/v1/mobile-app';
      console.log('🤖 Android Development - Using:', url);
      return url;
    } else if (Platform.OS === 'web') {
      const url = 'http://localhost:5001/api/v1/mobile-app';
      console.log('🌐 Web Development - Using:', url);
      return url;
    }
  }

  // Production/Release builds
  const envApiUrl = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;
  if (envApiUrl) {
    console.log('📡 Using API URL from environment:', envApiUrl);
    return envApiUrl;
  }

  const productionUrl = 'https://api.roundbuy.com/backend/api/v1/mobile-app';
  console.log('🚀 Production - Using:', productionUrl);
  return productionUrl;
};

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: 30000, // 30 seconds
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

console.log('✅ Final API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH_TOKEN: '/auth/refresh-token',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    APPLE_LOGIN: '/auth/apple-login',
    GOOGLE_LOGIN: '/auth/google-login',
    INSTAGRAM_LOGIN: '/auth/instagram-login',
  },

  // Subscriptions
  SUBSCRIPTION: {
    PLANS: '/subscription/plans',
    PLAN_DETAILS: (id) => `/subscription/plans/${id}`,
    PURCHASE: '/subscription/purchase',
    CREATE_PAYMENT_METHOD: '/subscription/create-payment-method',
    ACTIVATE_FREE: '/subscription/activate-free',
    CURRENT: '/subscription/current',
    TRANSACTION: (id) => `/subscription/transaction/${id}`,
    PAYMENT_METHODS: '/subscription/payment-methods',
    STRIPE_CONFIG: '/subscription/stripe-config',
  },

  // Advertisements
  ADVERTISEMENT: {
    FILTERS: '/advertisements/filters',
    BROWSE: '/advertisements/browse',
    FEATURED: '/advertisements/featured',
    VIEW: (id) => `/advertisements/view/${id}`,
    LOCATIONS: '/advertisements/locations',
    CREATE: '/advertisements',
    LIST: '/advertisements',
    GET: (id) => `/advertisements/${id}`,
    UPDATE: (id) => `/advertisements/${id}`,
    DELETE: (id) => `/advertisements/${id}`,
    PLANS: '/advertisements/plans',
  },

  // Locations
  LOCATION: {
    CREATE: '/locations',
    UPDATE: (id) => `/locations/${id}`,
    DELETE: (id) => `/locations/${id}`,
    SET_DEFAULT: (id) => `/locations/${id}/set-default`,
  },

  // User
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/update',
  },

  // Upload
  UPLOAD: {
    IMAGES: '/upload/images',
  },

  // KYC/KYB
  KYC: {
    STATUS: '/kyc/status',
    DOCUMENT_TYPES: '/kyc/document-types',
    SUBMIT: '/kyc/submit',
  },

  // Postage
  POSTAGE: {
    CARRIERS: '/postage/carriers',
    ZONES: '/postage/zones',
    CALCULATE: '/postage/calculate',
    SHIPMENTS: '/postage/shipments',
    SHIPMENT_BY_ID: (id) => `/postage/shipments/${id}`,
  },

  // Events
  EVENTS: {
    ALL: '/events',
    SUBSCRIBE: (id) => `/events/${id}/subscribe`,
    FOLLOW: (id) => `/events/${id}/follow`,
    JOIN: (id) => `/events/${id}/join`,
    ROOM: (id) => `/events/${id}/room`,
    ROOM_BIDS: (id) => `/events/${id}/room/bids`,
    ROOM_CHAT: (id) => `/events/${id}/room/chat`,
  }
};

// Error codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',
  FEATURE_LIMIT_EXCEEDED: 'FEATURE_LIMIT_EXCEEDED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
};

export default API_CONFIG;