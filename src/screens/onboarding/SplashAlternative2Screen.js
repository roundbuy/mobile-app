import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import { IMAGES } from '../../assets/images';

const SplashAlternative2Screen = ({ navigation }) => {
  useEffect(() => {
    // Navigate to Alternative 3 after 2 seconds
    const timer = setTimeout(() => {
      navigation.replace('SplashAlternative3');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={IMAGES.logoCrop}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Tagline */}
      <Text style={styles.tagline}>SHOP AROUND YOU</Text>
      <Text style={styles.description}>
        Buy and Sell products and services
      </Text>
      <Text style={styles.description}>
        just around you!
      </Text>

      {/* Patent Pending */}
      <Text style={styles.patent}>Patent Pending</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: SPACING.xl,
  },
  tagline: {
    ...TYPOGRAPHY.styles.h3,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    letterSpacing: 1,
  },
  description: {
    ...TYPOGRAPHY.styles.bodyMedium,
    color: COLORS.primary,
    textAlign: 'center',
    lineHeight: 22,
  },
  patent: {
    ...TYPOGRAPHY.styles.bodySmall,
    color: COLORS.textPrimary,
    marginTop: SPACING.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});

export default SplashAlternative2Screen;