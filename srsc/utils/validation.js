/**
 * Form Validation Utilities for RoundBuy Mobile App
 * 
 * Provides validation functions for email, password, phone, etc.
 */

/**
 * Validate email address
 * @param {string} email - Email address to validate
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} { isValid: boolean, error: string, checks: object }
 */
export const validatePassword = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const allChecksPassed = Object.values(checks).every(check => check);

  if (!password || password.trim() === '') {
    return { 
      isValid: false, 
      error: 'Password is required', 
      checks 
    };
  }

  if (!allChecksPassed) {
    const missingRequirements = [];
    if (!checks.length) missingRequirements.push('at least 8 characters');
    if (!checks.uppercase) missingRequirements.push('an uppercase letter');
    if (!checks.lowercase) missingRequirements.push('a lowercase letter');
    if (!checks.number) missingRequirements.push('a number');
    if (!checks.special) missingRequirements.push('a special character');

    return { 
      isValid: false, 
      error: `Password must contain ${missingRequirements.join(', ')}`, 
      checks 
    };
  }

  return { isValid: true, error: '', checks };
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {object} { isValid: boolean, error: string }
 */
export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.length < 10) {
    return { isValid: false, error: 'Phone number must be at least 10 digits' };
  }

  if (digitsOnly.length > 15) {
    return { isValid: false, error: 'Phone number is too long' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate name
 * @param {string} name - Name to validate
 * @param {number} minLength - Minimum length (default: 2)
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateName = (name, minLength = 2) => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Name is required' };
  }

  if (name.trim().length < minLength) {
    return { isValid: false, error: `Name must be at least ${minLength} characters` };
  }

  if (!/^[a-zA-Z\s-']+$/.test(name)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate verification code
 * @param {string} code - Verification code to validate
 * @param {number} length - Expected length (default: 6)
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateVerificationCode = (code, length = 6) => {
  if (!code || code.trim() === '') {
    return { isValid: false, error: 'Verification code is required' };
  }

  if (code.length !== length) {
    return { isValid: false, error: `Verification code must be ${length} digits` };
  }

  if (!/^\d+$/.test(code)) {
    return { isValid: false, error: 'Verification code must contain only numbers' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate required field
 * @param {string} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || value.toString().trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateURL = (url) => {
  if (!url || url.trim() === '') {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    new URL(url);
    return { isValid: true, error: '' };
  } catch (e) {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
};

/**
 * Validate age (must be 18 or older)
 * @param {string|number} age - Age to validate
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateAge = (age) => {
  const numericAge = parseInt(age, 10);

  if (isNaN(numericAge)) {
    return { isValid: false, error: 'Please enter a valid age' };
  }

  if (numericAge < 18) {
    return { isValid: false, error: 'You must be at least 18 years old' };
  }

  if (numericAge > 120) {
    return { isValid: false, error: 'Please enter a valid age' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate passwords match
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {object} { isValid: boolean, error: string }
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return { isValid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true, error: '' };
};

/**
 * Sanitize input (remove potentially harmful characters)
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (!input) return '';
  
  // Remove script tags and potentially harmful characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .trim();
};

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length === 10) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }
  
  return phone;
};

/**
 * Get password strength
 * @param {string} password - Password to check
 * @returns {object} { strength: string, score: number, color: string }
 */
export const getPasswordStrength = (password) => {
  if (!password) {
    return { strength: 'None', score: 0, color: '#999999' };
  }

  let score = 0;
  
  // Length
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Complexity
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

  if (score <= 2) {
    return { strength: 'Weak', score, color: '#F44336' };
  } else if (score <= 4) {
    return { strength: 'Medium', score, color: '#FF9800' };
  } else {
    return { strength: 'Strong', score, color: '#4CAF50' };
  }
};

export default {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  validateVerificationCode,
  validateRequired,
  validateURL,
  validateAge,
  validatePasswordMatch,
  sanitizeInput,
  formatPhoneNumber,
  getPasswordStrength,
};