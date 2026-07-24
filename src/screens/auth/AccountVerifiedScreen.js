import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../../constants/theme';
import { IMAGES } from '../../assets/images';
import { ONBOARDING_THEME } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';
import { useAuth } from '../../context/AuthContext';

const AccountVerifiedScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  // account_type from params is the authoritative source (avoids stale closure)
  const accountType = route.params?.account_type || user?.account_type;
  const accountTypeRef = useRef(accountType);
  accountTypeRef.current = accountType;

  const handleDone = () => {
    if (accountTypeRef.current === 'business') {
      navigation.replace('BusinessVerification');
    } else {
      navigation.replace('ATTPrompt');
    }
  };

  useEffect(() => {
    const timer = setTimeout(handleDone, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handlePatentInfo = () => {
    navigation.navigate('PatentPending');
  };

  return (
    <SafeScreenContainer>
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
            {t('Read more about')}{' '}
            <Text style={[styles.infoLink, { color: ONBOARDING_THEME.colors.link, textDecorationLine: 'underline' }]}>
              {t('patents')}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Center Content */}
      <View style={styles.content}>
        <View style={styles.successCircle}>
          <Text style={styles.checkmark}>✓</Text>
        </View>

        <Text style={styles.title}>{t('Your account is created')}</Text>
        <Text style={styles.subtitle}>
          Welcome to RoundBuy —{'\n'}you're all set!
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>{t('Continue')}</Text>
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
    backgroundColor: COLORS.primary,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
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
