import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../../constants/theme';

const PasswordGuidelinesScreen = ({ route, navigation }) => {
  const { email, password } = route.params || {};
  
  const [checks, setChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    if (password) {
      setChecks({
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      });
    }
  }, [password]);

  const allChecked = Object.values(checks).every(check => check);

  const handleContinue = () => {
    if (allChecked) {
      navigation.navigate('EmailVerification', { email });
    }
  };

  const CheckItem = ({ checked, text }) => (
    <View style={styles.checkItem}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={[styles.checkText, checked && styles.checkTextChecked]}>
        {text}
      </Text>
    </View>
  );

  return (
    <SafeScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Password Guidelines</Text>
      </View>

      {/* Content */}
      <>
        <View style={styles.iconContainer}>
          <View style={styles.shieldIcon}>
            <Text style={styles.shieldText}>🛡️</Text>
          </View>
        </View>

        <Text style={styles.title}>Create a strong password</Text>
        <Text style={styles.subtitle}>
          Your password must meet the following requirements:
        </Text>

        {/* Password Requirements */}
        <View style={styles.checklistContainer}>
          <CheckItem 
            checked={checks.length} 
            text="At least 8 characters long"
          />
          <CheckItem 
            checked={checks.uppercase} 
            text="Contains uppercase letter (A-Z)"
          />
          <CheckItem 
            checked={checks.lowercase} 
            text="Contains lowercase letter (a-z)"
          />
          <CheckItem 
            checked={checks.number} 
            text="Contains a number (0-9)"
          />
          <CheckItem 
            checked={checks.special} 
            text="Contains special character (!@#$%^&*)"
          />
        </View>

        {/* Security Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Password Tips:</Text>
          <Text style={styles.tipText}>• Use a unique password for each account</Text>
          <Text style={styles.tipText}>• Avoid common words or phrases</Text>
          <Text style={styles.tipText}>• Consider using a password manager</Text>
        </View>
      </>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueButton, !allChecked && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!allChecked}
        >
          <Text style={[styles.continueButtonText, !allChecked && styles.continueButtonTextDisabled]}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  backButton: {
    minHeight: TOUCH_TARGETS.minHeight,
    minWidth: TOUCH_TARGETS.minWidth,
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  backArrow: {
    ...TYPOGRAPHY.styles.h2,
    color: COLORS.primary,
  },
  headerTitle: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.textPrimary,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  shieldIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldText: {
    fontSize: 40,
  },
  title: {
    ...TYPOGRAPHY.styles.h2,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.styles.bodyMedium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  checklistContainer: {
    marginBottom: SPACING.xl,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    minHeight: TOUCH_TARGETS.minHeight,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  checkboxChecked: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  checkText: {
    ...TYPOGRAPHY.styles.bodyMedium,
    color: COLORS.textSecondary,
    flex: 1,
  },
  checkTextChecked: {
    color: COLORS.textPrimary,
  },
  tipsContainer: {
    backgroundColor: COLORS.grayLightest,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.md,
  },
  tipsTitle: {
    ...TYPOGRAPHY.styles.bodyMedium,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  tipText: {
    ...TYPOGRAPHY.styles.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  footer: {
    paddingTop: SPACING.md,
    marginTop: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  continueButton: {
    height: TOUCH_TARGETS.buttonHeight.medium,
    borderRadius: BORDER_RADIUS.button,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.grayLight,
  },
  continueButtonText: {
    ...TYPOGRAPHY.styles.button,
    color: COLORS.white,
  },
  continueButtonTextDisabled: {
    color: COLORS.textTertiary,
  },
});

export default PasswordGuidelinesScreen;