import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../../constants/theme';
import { IMAGES } from '../../assets/images';
import { ONBOARDING_THEME } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';

const AccountVerifiedScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { email } = route.params || {};

  const handleDone = () => {
    // Navigate to Welcome screen first, passing the email
    navigation.replace('Welcome', { userEmail: email, showOnboarding: true });
  };

  const handlePatentInfo = () => {
    navigation.navigate('PatentPending');
  };

  return (
    <SafeScreenContainer>
      {/* Header with Logo and Patent Info */}
      {/* Header with Logo and Patent Info */}
      <View style={styles.logoContainer}>
        <Image
          source={IMAGES.logoMain}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.patentText}>{t('Patents Pending')}</Text>
        <TouchableOpacity onPress={handlePatentInfo}>
          <Text style={styles.infoLink}>
            {t('Read more about')} <Text style={[styles.infoLink, { color: ONBOARDING_THEME.colors.link, textDecorationLine: 'underline' }]}>{t('patents')}</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Center Content */}
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.successCircle}>
          <Text style={styles.checkmark}>✓</Text>
        </View>

        <Text style={styles.title}>{t('Account verified')}</Text>
        <Text style={styles.subtitle}>
          Congrats, now you're a verified{'\n'}member of RoundBuy
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={handleDone}
        >
          <Text style={styles.doneButtonText}>{t('Done')}</Text>
        </TouchableOpacity>

        <Text style={styles.copyright}>{t('© 2020-2026 RoundBuy Inc ®')}</Text>
      </View>
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'left',
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 60,
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
  clickHere: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 250,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#34c759',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  checkmark: {
    fontSize: 60,
    color: '#ffffff',
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6a6a6a',
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  footer: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  doneButton: {
    height: 54,
    backgroundColor: '#f5f5f5',
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1a1a1a',
    letterSpacing: 0.2,
  },
  copyright: {
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default AccountVerifiedScreen;