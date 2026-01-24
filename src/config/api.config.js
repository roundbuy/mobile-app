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
  // TEMPORARY HARDCODE: Bypass environment variable caching in native builds
  // TODO: Remove this hardcode once native build is updated
  const hardcodedUrl = 'http://localhost:5001/api/v1/mobile-app';
  console.log('⚠️  USING HARDCODED API URL (temporary fix):', hardcodedUrl);
  return hardcodedUrl;

  // Check for environment variable first (highest priority)
  const envApiUrl = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;

  console.log('🔍 API URL Detection:');
  console.log('  Constants.expoConfig?.extra?.apiUrl:', Constants.expoConfig?.extra?.apiUrl);
  console.log('  process.env.EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
  console.log('  envApiUrl:', envApiUrl);

  if (envApiUrl) {
    console.log('📡 Using API URL from environment:', envApiUrl);
    return envApiUrl;
  }

  // Development mode - auto-detect platform
  if (__DEV__) {
    // Get local IP from environment variable if set
    const localIp = Constants.expoConfig?.extra?.localIp || process.env.EXPO_PUBLIC_LOCAL_IP;

    if (Platform.OS === 'ios') {
      // iOS Simulator can use localhost
      const url = localIp ? `http://${localIp}:5001/api/v1/mobile-app` : 'http://localhost:5001/api/v1/mobile-app';
      console.log('📱 iOS Development - Using:', url);
      return url;
    } else if (Platform.OS === 'android') {
      // Android Emulator uses special IP
      // 10.0.2.2 maps to host machine's localhost
      const url = localIp ? `http://${localIp}:5001/api/v1/mobile-app` : 'http://10.0.2.2:5001/api/v1/mobile-app';
      console.log('🤖 Android Development - Using:', url);
      return url;
    } else if (Platform.OS === 'web') {
      // Web can use localhost
      const url = 'http://localhost:5001/api/v1/mobile-app';
      console.log('🌐 Web Development - Using:', url);
      return url;
    }
  }

  // Production mode
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
  },

  // Subscriptions
  SUBSCRIPTION: {
    PLANS: '/subscription/plans',
    PLAN_DETAILS: (id) => `/subscription/plans/${id}`,
    PURCHASE: '/subscription/purchase',
    CREATE_PAYMENT_METHOD: '/subscription/create-payment-method',
    ACTIVATE_FREE: '/subscription/activate-free',
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