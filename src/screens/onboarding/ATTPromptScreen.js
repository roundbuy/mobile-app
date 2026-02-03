import React from 'react';
import { IMAGES } from '../../assets/images';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';

import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import * as Location from 'expo-location';

const ATTPromptScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const handleAllowTracking = async () => {
    try {
      // 1. Request ATT Permission
      const { status: attStatus } = await requestTrackingPermissionsAsync();
      console.log('ATT permission status:', attStatus);

      // 2. Request Location Permission (as requested to be on this screen)
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      console.log('Location permission status:', locationStatus);

    } catch (error) {
      console.error('Error requesting permissions:', error);
    } finally {
      navigation.replace('CookiesConsent');
    }
  };

  const handleAskAppNotToTrack = () => {
    // User declined tracking - skip requests or proceed
    navigation.replace('CookiesConsent');
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
        {/* Title */}
        <Text style={styles.title}>{t('ATT Prompt')}</Text>

        {/* Description */}
        <Text style={styles.description}>{t('"RoundBuy" would like permission to track you acrosss apps and websites owned by other companies.')}</Text>

        {/* Explanation */}
        <Text style={styles.explanation}>{t('Your data will be used to deliver personalized ads to you.')}</Text>
      </View>

      {/* Footer with Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleAllowTracking}
        >
          <Text style={styles.buttonText}>{t('Allow')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleAskAppNotToTrack}
        >
          <Text style={styles.buttonText}>{t('Don\'t Allow')}</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 30,
    marginTop: 300,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  explanation: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6a6a6a',
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  footer: {
    paddingTop: 40,
    paddingBottom: 20,
  },
  button: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderTopColor: '#dfddddff',
    borderTopWidth: 2,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '500',
    color: COLORS.primary,
    letterSpacing: 0.1,
  },
});

export default ATTPromptScreen;