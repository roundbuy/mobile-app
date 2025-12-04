import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

/**
 * Authentication Context
 * Manages user authentication state across the app
 */

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Load user data from storage on app start
   */
  useEffect(() => {
    loadUserData();
  }, []);

  /**
   * Load user data from AsyncStorage
   */
  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const authenticated = await authService.isAuthenticated();
      
      if (authenticated) {
        const userData = await authService.getCurrentUser();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} Login response
   */
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      
      if (response.success && response.data && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
      
      return response;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  /**
   * Register new user
   * @param {Object} userData - Registration data
   * @returns {Promise<Object>} Registration response
   */
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      // Don't set user as authenticated yet - they need to verify email first
      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Verify email with token
   * @param {string} email - User's email
   * @param {string} token - Verification token
   * @returns {Promise<Object>} Verification response
   */
  const verifyEmail = async (email, token) => {
    try {
      const response = await authService.verifyEmail(email, token);
      // Email verified, but user still needs to purchase subscription
      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Complete registration after subscription purchase
   * Sets user as authenticated
   * @param {Object} userData - User data
   */
  const completeRegistration = async (userData) => {
    try {
      setUser(userData);
      setIsAuthenticated(true);
      await authService.updateStoredUserData(userData);
    } catch (error) {
      console.error('Error completing registration:', error);
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear state even if API call fails
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  /**
   * Update user data
   * @param {Object} updates - User data updates
   */
  const updateUser = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      await authService.updateStoredUserData(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  /**
   * Refresh user data
   * Reload from storage or API
   */
  const refreshUser = async () => {
    try {
      await loadUserData();
    } catch (error) {
      console.error('Error refreshing user:', error);
      throw error;
    }
  };

  /**
   * Check if user has active subscription
   * @returns {boolean} True if subscription is active
   */
  const hasActiveSubscription = () => {
    if (!user) return false;
    
    // First check if the user object has explicit subscription status
    if (user.has_active_subscription !== undefined) {
      return user.has_active_subscription;
    }
    
    // Check if subscription_end_date exists and is in the future
    if (user.subscription_end_date) {
      const endDate = new Date(user.subscription_end_date);
      return endDate > new Date();
    }
    
    // Check if user doesn't require subscription (meaning they have one)
    if (user.requires_subscription === false) {
      return true;
    }
    
    return false;
  };

  /**
   * Get subscription details from user
   * @returns {Object|null} Subscription details or null
   */
  const getSubscriptionDetails = () => {
    if (!user) return null;
    
    return {
      plan_name: user.subscription_plan_name,
      plan_slug: user.subscription_plan_slug,
      start_date: user.subscription_start_date,
      end_date: user.subscription_end_date,
      is_active: hasActiveSubscription(),
    };
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    verifyEmail,
    completeRegistration,
    logout,
    updateUser,
    refreshUser,
    hasActiveSubscription,
    getSubscriptionDetails,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;