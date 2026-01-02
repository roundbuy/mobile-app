import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import { IMAGES } from '../../assets/images';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Navigate to Alternative 2 after 2 seconds
    const timer = setTimeout(() => {
      navigation.replace('LicenseAgreement');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Logo Circle */}
      <Image
        source={IMAGES.logoCrop}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Brand Text */}
      <Text style={styles.brandText}>Round Buy</Text>
      <Text style={styles.tagline}>Shop Round The Corner</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: SPACING.xl,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  innerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationIcon: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  locationPin: {
    width: 30,
    height: 40,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    transform: [{ rotate: '45deg' }],
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    top: 8,
  },
  brandText: {
    ...TYPOGRAPHY.styles.h1,
    color: COLORS.primary,
    marginTop: SPACING.md,
  },
  tagline: {
    ...TYPOGRAPHY.styles.bodyMedium,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});

export default SplashScreen;