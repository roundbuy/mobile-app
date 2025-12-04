/**
 * API Configuration for RoundBuy Mobile App
 */

// API Base URL - Change based on environment
const getApiUrl = () => {
  if (__DEV__) {
    // Development - use your local IP or localhost
    // For iOS Simulator: use 'localhost'
    // For Android Emulator: use '10.0.2.2'
    // For Physical Device: use your computer's IP (e.g., '192.168.1.100')
    return 'http://localhost:5001/api/v1/mobile-app';
  }
  
  // Production
  return 'https://api.roundbuy.com/backend/api/v1/mobile-app';
};

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: 30000, // 30 seconds
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

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