import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import { IMAGES } from '../../assets/images';
import { useTranslation } from '../../context/TranslationContext';

const SplashAlternative3Screen = ({ navigation }) => {
    const { t } = useTranslation();
  useEffect(() => {
    // Navigate to License Agreement after 2 seconds
    const timer = setTimeout(() => {
      navigation.replace('LicenseAgreement');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Spacer for top */}
      <View style={styles.spacer} />

      {/* Main Content Row */}
      <View style={styles.mainContent}>
        {/* Logo */}
        <Image
          source={IMAGES.whiteLogo}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Round Buy Text */}
        <View style={styles.textContainer}>
          <Text style={styles.roundText}>{t('Round')}</Text>
          <Text style={styles.buyText}>{t('Buy')}</Text>
        </View>
      </View>

      {/* Spacer for bottom */}
      <View style={styles.spacer} />

      {/* Patent Pending */}
      <Text style={styles.patents}>{t('Patent Pending')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  spacer: {
    flex: 1,
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    width: '100%',
    marginLeft: 60,
    paddingRight: SPACING.lg,
  },
  logo: {
    width: 170,
    height: 170,
    tintColor: COLORS.white, // Makes the logo white on blue background
  },
  textContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  roundText: {
    ...TYPOGRAPHY.styles.h2,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.white,
    letterSpacing: 1,
  },
  buyText: {
    ...TYPOGRAPHY.styles.h2,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.white,
    letterSpacing: 1,
  },
  tagline: {
    ...TYPOGRAPHY.styles.h3,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.white,
    marginBottom: SPACING.sm,
    letterSpacing: 1,
  },
  description: {
    ...TYPOGRAPHY.styles.bodyMedium,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 22,
  },
  patents: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 16,
    lineHeight: 25,
    color: COLORS.white,
    fontWeight: 700,
    marginBottom: SPACING.md,
  },
});

export default SplashAlternative3Screen;