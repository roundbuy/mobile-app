import React from 'react';
import { IMAGES } from '../../assets/images';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';

const CookiesConsentScreen = ({ navigation }) => {
    const { t } = useTranslation();
  const handleAcceptAll = () => {
    // Save cookie preferences and proceed to registration
    console.log('Cookies accepted');
    navigation.replace('Registration');
  };

  const handleRejectAll = () => {
    // Save cookie preferences (rejected) and direct to demo info page
    console.log('Cookies rejected');
    navigation.navigate('RoundBuyInfo', { from: 'cookies' });
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

  return (
    <SafeScreenContainer>
      {/* Header with Logo and Patent Info */}
      <View style={styles.header}>
        <Image
          source={IMAGES.logoMain}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.patentText}>{t('Patent Pending')}</Text>
        <TouchableOpacity onPress={handlePatentInfo}>
          <Text style={styles.infoLink}>
            for more information{' '}
            <Text style={styles.clickHere}>{t('click here')}</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{t('Cookies')}</Text>

        <Text style={styles.description}>
          We use cookies to improve user experience. Choose what cookies you allow us to use. You can read more about our{' '}
          <Text style={styles.linkText} onPress={handlePrivacyPolicyPress}>{t('Privacy Policy')}</Text>
          {' '}and{' '}
          <Text style={styles.linkText} onPress={handleCookiePolicyPress}>{t('Cookie Policy')}</Text>.
        </Text>
      </View>

      {/* Footer with Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleAcceptAll}
        >
          <Text style={styles.primaryButtonText}>{t('Accept All')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRejectAll}
        >
          <Text style={styles.primaryButtonText}>{t('Reject All')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleMoreInfo}
        >
          <Text style={styles.secondaryButtonText}>{t('Cookies Settings')}</Text>
        </TouchableOpacity>

        <View style={styles.footerContent}>
          <Text style={styles.footerDescription}>
            Read more about our{' '}
            <Text style={styles.linkText} onPress={handlePrivacyPolicyPress}>{t('Privacy Policy')}</Text>
            {' '}and{' '}
            <Text style={styles.linkText} onPress={handleCookiePolicyPress}>{t('Cookie Policy')}</Text>.
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
  },
  logo: {
    width: 140,
    height: 60,
  },
  patentText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 12,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  infoLink: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6a6a6a',
    letterSpacing: -0.1,
  },
  clickHere: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 200,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000ff',
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  linkText: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  footer: {
    paddingTop: 40,
    paddingBottom: 20,
  },
  primaryButton: {
    height: 54,
    backgroundColor: COLORS.primary,
    borderRadius: 27,
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
    letterSpacing: 0.3,
  },
  secondaryButton: {
    height: 54,
    backgroundColor: '#f5f5f5',
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1a1a1a',
    letterSpacing: 0.2,
  },
  footerContent: {
    paddingHorizontal: 10,
    fontSize: 12,
    fontWeight: '500',
    color: '#000000ff',
    lineHeight: 22,
    letterSpacing: -0.1,
    textAlign: 'center',
  },
  footerDescription: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000000ff',
    lineHeight: 22,
    letterSpacing: -0.1,
    textAlign: 'center',
  },
});

export default CookiesConsentScreen;