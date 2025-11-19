import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import SafeScreenContainer from '../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../constants/theme';

const PolicySelectionScreen = ({ navigation }) => {
  const handlePolicyPress = (policyType) => {
    navigation.navigate('PolicyDetail', { policyType });
  };

  const handleAccept = () => {
    navigation.replace('ATTPrompt');
  };

  return (
    <SafeScreenContainer>
      {/* Header with Logo */}
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <View style={styles.innerCircle}>
            <View style={styles.locationIcon}>
              <View style={styles.locationPin} />
              <View style={styles.locationDot} />
            </View>
          </View>
        </View>
        <Text style={styles.brandText}>Round Buy</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>License Agreement & Terms</Text>
        <Text style={styles.subtitle}>
          You have the right to know exactly how RoundBuy keeps or uses data. You should know before you complete with installation and use RoundBuy.
        </Text>

        {/* Policy Options */}
        <View style={styles.policyOptions}>
          <Text style={styles.sectionTitle}>Here are the Terms & Conditions Of here</Text>

          <TouchableOpacity 
            style={styles.policyButton}
            onPress={() => handlePolicyPress('terms')}
          >
            <Text style={styles.policyButtonText}>
              Read the Terms & Conditions Of here
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.policyButton}
            onPress={() => handlePolicyPress('license')}
          >
            <Text style={styles.policyButtonText}>
              Read the License Agreement Of here
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.policyButton}
            onPress={() => handlePolicyPress('privacy')}
          >
            <Text style={styles.policyButtonText}>
              Read the Privacy Policy Of here
            </Text>
          </TouchableOpacity>
        </View>

        {/* Accept Button */}
        <TouchableOpacity 
          style={styles.acceptButton}
          onPress={handleAccept}
        >
          <Text style={styles.acceptButtonText}>I Accept</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          License Agreement must be accepted, or RoundBuy cannot be accessed.
        </Text>
      </View>
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingBottom: SPACING.lg,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  innerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationIcon: {
    width: 25,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  locationPin: {
    width: 15,
    height: 20,
    borderRadius: 7.5,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    transform: [{ rotate: '45deg' }],
  },
  locationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    top: 4,
  },
  brandText: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.styles.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  policyOptions: {
    flex: 1,
  },
  sectionTitle: {
    ...TYPOGRAPHY.styles.bodyMedium,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  policyButton: {
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
    minHeight: TOUCH_TARGETS.minHeight,
    justifyContent: 'center',
  },
  policyButtonText: {
    ...TYPOGRAPHY.styles.bodyMedium,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  acceptButton: {
    height: TOUCH_TARGETS.buttonHeight.medium,
    borderRadius: BORDER_RADIUS.button,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.md,
  },
  acceptButtonText: {
    ...TYPOGRAPHY.styles.button,
    color: COLORS.white,
  },
  disclaimer: {
    ...TYPOGRAPHY.styles.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
});

export default PolicySelectionScreen;