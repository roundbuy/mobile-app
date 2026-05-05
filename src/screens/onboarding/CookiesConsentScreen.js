import React from 'react';
import { IMAGES } from '../../assets/images';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { ONBOARDING_THEME } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';

import trackingService from '../../services/TrackingService';

const CookiesConsentScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const handleAcceptAll = async () => {
    // Save cookie preferences and proceed to registration
    await trackingService.setTrackingPreference(true);
    console.log('Cookies accepted');
    navigation.replace('LaunchOnboarding');
  };

  const handleMoreInfo = () => {
    navigation.navigate('CookieSettings');
  };

  const handlePrivacyPolicyPress = () => {
    navigation.navigate('PolicyDetail', { policyType: 'privacy' });
  };

  const handleCookiePolicyPress = () => {
    navigation.navigate('PolicyDetail', { policyType: 'cookies' });
  };

  const handlePatentInfo = () => {
    navigation.navigate('PatentPending');
  };

  const { colors, typography, spacing } = ONBOARDING_THEME;

  return (
    <SafeScreenContainer>
      {/* Header with Logo and Patent Info */}
      <View style={styles.header}>
        <Image
          source={IMAGES.logoMain}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.patentText}>{t('Patents Pending')}</Text>
        <TouchableOpacity onPress={handlePatentInfo}>
          <Text style={styles.infoLink}>
            {t('Read more about')} <Text style={[styles.infoLink, { color: colors.link, textDecorationLine: 'underline' }]}>{t('patents')}</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, typography.heading, { textAlign: 'left' }]}>{t('Cookies')}</Text>

        <Text style={[styles.description, typography.body, { textAlign: 'left' }]}>
          {t('We use cookies to improve user experience. Choose what cookies you allow us to use. You can read more about our ')}
          <Text style={{ textDecorationLine: 'underline', color: colors.link }} onPress={handlePrivacyPolicyPress}>{t('Privacy Policy')}</Text>
          {' '}{t('and')}{' '}
          <Text style={{ textDecorationLine: 'underline', color: colors.link }} onPress={handleCookiePolicyPress}>{t('Cookies Policy')}</Text>.
        </Text>
      </View>

      {/* Footer with Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primaryButton }]}
          onPress={handleAcceptAll}
        >
          <Text style={styles.primaryButtonText}>{t('Accept All')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleMoreInfo}
        >
          <Text style={styles.secondaryButtonText}>{t('More info')}</Text>
        </TouchableOpacity>

        <View style={styles.footerContent}>
          <Text style={styles.footerDescription}>
            {t('Read our')} {' '}
            <Text style={{ textDecorationLine: 'underline', color: colors.link }} onPress={handlePrivacyPolicyPress}>{t('Privacy Policy')}</Text>
            {' '}{t('and')}{' '}
            <Text style={{ textDecorationLine: 'underline', color: colors.link }} onPress={handleCookiePolicyPress}>{t('Cookies Policy')}</Text>
          </Text>
        </View>
      </View>
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    marginBottom: 40,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  logo: {
    width: 150,
    height: 60,
    marginBottom: 5,
  },
  patentText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#001C64',
    marginBottom: 2,
  },
  infoLink: {
    fontSize: 14,
    fontWeight: '500',
    color: '#001C64',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 30,
    alignItems: 'left',
    marginTop: 0, // Removed top margin to allow flex-end to work fully
    paddingBottom: 60,
    alignContent: 'left',
  },
  title: {
    marginBottom: 14,
    alignItems: 'left',
  },
  description: {
    lineHeight: 24,
    textAlign: 'left',
  },
  footer: {
    paddingTop: 10, // Reduced top padding since content handles space
    paddingBottom: 20,
    paddingHorizontal: 30,
  },
  primaryButton: {
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    height: 50,
    backgroundColor: '#f5f5f5', // Keep light grey for consistency with "More info" visual hierarchy often seen
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  footerContent: {
    paddingHorizontal: 10,
  },
  footerDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    lineHeight: 22,
    textAlign: 'center',
  },
});

export default CookiesConsentScreen;