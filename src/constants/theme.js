/**
 * RoundBuy Design System
 * Complete theme configuration for colors, typography, spacing, and touch targets
 * 
 * Usage: import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS } from '../constants/theme';
 */

// ============================================================================
// COLORS
// ============================================================================
export const COLORS = {
  // Primary Brand Colors
  primary: '#001C64',
  primaryDark: '#001447',
  primaryLight: '#1A3A8A',
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Gray Scale
  gray: '#666666',
  grayDark: '#333333',
  grayMedium: '#999999',
  grayLight: '#CCCCCC',
  grayLighter: '#E0E0E0',
  grayLightest: '#F5F5F5',
  
  // Background Colors
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  backgroundDark: '#333333',
  
  // Text Colors
  textPrimary: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textLight: '#CCCCCC',
  textOnPrimary: '#FFFFFF',
  textOnDark: '#FFFFFF',
  
  // Semantic Colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Border Colors
  border: '#E0E0E0',
  borderLight: '#F5F5F5',
  borderDark: '#CCCCCC',
  
  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  
  // Social Media Colors
  facebook: '#1877F2',
  google: '#DB4437',
  apple: '#000000',
  instagram: '#E4405F',
  twitter: '#1DA1F2',
  slider:'#616161',
  blue:"#285AB1"
};

// ============================================================================
// SPACING SYSTEM
// Based on 8px grid system
// ============================================================================
export const SPACING = {
  // Base Units
  xs: 8,     // Small spacing: tight elements like icon and text pairs
  sm: 12,    // Small-medium spacing
  md: 16,    // Medium spacing: between related content sections
  lg: 24,    // Large spacing: separating major sections
  xl: 32,    // Extra large spacing: separating major sections
  xxl: 48,   // Extra extra large: creating clear visual breaks
  xxxl: 64,  // Maximum spacing: major page divisions
  
  // Specific Use Cases
  tightPair: 8,           // Icon and text pairs
  relatedContent: 16,     // Between related content
  majorSections: 24,      // Between major sections  
  visualBreak: 48,        // Clear visual separation
  
  // Content Spacing
  paragraphSpacing: 16,   // Between paragraphs
  sectionSpacing: 32,     // Between different sections
  
  // List & Card Spacing
  listItemPadding: 16,    // Padding inside list items
  listItemGap: 8,         // Gap between list items
  cardGap: 16,            // Gap between cards
  cardGapLarge: 24,       // Gap between information-rich cards
  
  // Button & Interactive Element Spacing
  buttonPadding: 16,      // Internal button padding
  buttonSpacing: 24,      // Space around primary action buttons
  touchTargetPadding: 12, // Minimum padding around touch targets
  relatedButtons: 12,     // Space between related interactive elements
  unrelatedButtons: 24,   // Space between unrelated button groups
  
  // Form Spacing
  formFieldPadding: 16,   // Internal padding for form inputs
  formFieldSpacing: 16,   // Space between form fields
  
  // Headline Spacing
  headlineTop: 32,        // Space above headlines (24-32px)
  headlineBottom: 16,     // Space below headlines (12-16px)
  
  // CTA Spacing
  ctaSpacing: 24,         // Space around call-to-action buttons (20-24px)
  
};

// ============================================================================
// TYPOGRAPHY SYSTEM
// Font: Roboto (Regular, Medium, Bold)
// ============================================================================
export const TYPOGRAPHY = {
  // Font Family
  fontFamily: {
    regular: 'Roboto_400Regular',
    medium: 'Roboto_500Medium',
    bold: 'Roboto_700Bold',
  },
  
  // Font Sizes (Hierarchy)
  fontSize: {
    // Headings
    h1: 36,           // Main titles, screen titles (32-36px)
    h2: 28,           // Section headers, major UI elements (24-28px)
    h3: 22,           // Subheaders, card titles (20-22px)
    
    // Body Text
    bodyLarge: 18,    // Main readable content, important text
    bodyMedium: 16,   // Standard readable content
    bodySmall: 14,    // Descriptions, notes, meta information
    
    // Small Text
    caption: 12,      // Labels, tooltips, helper text
    tiny: 10,         // Rare: disclaimers, legal information
    
    // Interactive Elements
    button: 18,       // Button text (16-18px, never smaller than 16px)
    input: 16,        // Input fields (16-18px, prevents zoom on iOS)
    tab: 14,          // Tabs & navigation labels (12-14px)
    cta: 24,          // CTA headlines (24px+)
  },
  
  // Line Heights (1.4-1.6x multiplier)
  lineHeight: {
    h1: 50,           // 36 * 1.4 = 50.4
    h2: 39,           // 28 * 1.4 = 39.2
    h3: 31,           // 22 * 1.4 = 30.8
    bodyLarge: 25,    // 18 * 1.4 = 25.2
    bodyMedium: 25,   // 16 * 1.6 = 25.6
    bodySmall: 22,    // 14 * 1.6 = 22.4
    caption: 17,      // 12 * 1.4 = 16.8
    tiny: 14,         // 10 * 1.4 = 14
    button: 25,       // 18 * 1.4 = 25.2
    input: 22,        // 16 * 1.4 = 22.4
    tab: 20,          // 14 * 1.4 = 19.6
    cta: 34,          // 24 * 1.4 = 33.6
  },
  
  // Font Weights
  fontWeight: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
  
  // Text Styles (Pre-configured combinations)
  styles: {
    h1: {
      fontFamily: 'Roboto_700Bold',
      fontSize: 36,
      lineHeight: 50,
      fontWeight: '700',
    },
    h2: {
      fontFamily: 'Roboto_700Bold',
      fontSize: 28,
      lineHeight: 39,
      fontWeight: '700',
    },
    h3: {
      fontFamily: 'Roboto_500Medium',
      fontSize: 22,
      lineHeight: 31,
      fontWeight: '500',
    },
    bodyLarge: {
      fontFamily: 'Roboto_400Regular',
      fontSize: 18,
      lineHeight: 25,
      fontWeight: '400',
    },
    bodyMedium: {
      fontFamily: 'Roboto_400Regular',
      fontSize: 16,
      lineHeight: 25,
      fontWeight: '400',
    },
    bodySmall: {
      fontFamily: 'Roboto_400Regular',
      fontSize: 14,
      lineHeight: 22,
      fontWeight: '400',
    },
    caption: {
      fontFamily: 'Roboto_400Regular',
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '400',
    },
    tiny: {
      fontFamily: 'Roboto_400Regular',
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '400',
    },
    button: {
      fontFamily: 'Roboto_500Medium',
      fontSize: 18,
      lineHeight: 25,
      fontWeight: '500',
    },
    input: {
      fontFamily: 'Roboto_400Regular',
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '400',
    },
  },
};

// ============================================================================
// TOUCH TARGETS
// Minimum sizes and spacing for interactive elements
// ============================================================================
export const TOUCH_TARGETS = {
  // Minimum Sizes
  minHeight: 44,              // Minimum 44px height for all tappable elements
  minWidth: 44,               // Minimum 44px width for square touch targets
  
  // Button Sizes
  buttonHeight: {
    small: 44,
    medium: 50,
    large: 56,
  },
  
  // Touch Target Spacing
  relatedSpacing: 12,         // 8-12px spacing between related interactive elements
  unrelatedSpacing: 24,       // 16-24px spacing between unrelated groups of buttons
  primaryButtonSpacing: 24,   // 24px minimum spacing around primary action buttons
  
  // Form Input Spacing
  inputPadding: 16,           // 12-16px internal padding for form inputs
  inputHeight: 50,            // Standard input field height
  
  // Specific Element Sizes
  checkbox: 24,               // Checkbox/radio button size
  switch: {
    width: 51,
    height: 31,
  },
  icon: {
    small: 16,
    medium: 24,
    large: 32,
  },
};

// ============================================================================
// BORDER RADIUS
// ============================================================================
export const BORDER_RADIUS = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 999,      // For circular elements
  
  // Component-specific
  button: 25,
  card: 12,
  input: 8,
  modal: 16,
};

// ============================================================================
// SHADOWS
// ============================================================================
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// ============================================================================
// ANIMATION / TRANSITION
// ============================================================================
export const ANIMATION = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// ============================================================================
// LAYOUT
// ============================================================================
export const LAYOUT = {
  screenPadding: 16,          // Standard screen padding
  containerMaxWidth: 1200,    // Maximum content width
  gridColumns: 12,            // Grid system columns
  
  // Platform-specific safe area padding
  safeArea: {
    // Android and Web
    android: {
      paddingTop: 24,
      paddingBottom: 45,
      paddingLeft: 16,
      paddingRight: 16,
    },
    // iOS (iPhone)
    ios: {
      paddingTop: 58.67,
      paddingBottom: 45,
      paddingLeft: 16,
      paddingRight: 16,
    },
  },
};

// ============================================================================
// SLIDER CONFIGURATION
// ============================================================================
export const SLIDER_CONFIG = {
  max: 10,                    // Maximum value for the slider (can be made dynamic in the future)
  min: 0,                     // Minimum value for the slider
  decimalPrecision: 1,        // Number of decimal places (1 = 0.1, 2 = 0.01, etc.)
  defaultValue: 5.0,          // Default value (middle of range)
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get line height for a given font size
 * @param {number} fontSize - Font size in pixels
 * @param {number} multiplier - Line height multiplier (default: 1.5)
 * @returns {number} Calculated line height
 */
export const getLineHeight = (fontSize, multiplier = 1.5) => {
  return Math.round(fontSize * multiplier);
};

/**
 * Get spacing value
 * @param {number} multiplier - Multiplier for base spacing unit (8px)
 * @returns {number} Calculated spacing
 */
export const getSpacing = (multiplier = 1) => {
  return 8 * multiplier;
};

/**
 * Apply text style
 * @param {string} style - Style name from TYPOGRAPHY.styles
 * @returns {object} Text style object
 */
export const applyTextStyle = (style) => {
  return TYPOGRAPHY.styles[style] || TYPOGRAPHY.styles.bodyMedium;
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================
export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  TOUCH_TARGETS,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATION,
  LAYOUT,
  SLIDER_CONFIG,
  getLineHeight,
  getSpacing,
  applyTextStyle,
};