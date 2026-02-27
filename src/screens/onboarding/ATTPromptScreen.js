import React from 'react';
import { IMAGES } from '../../assets/images';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { ONBOARDING_THEME } from '../../constants/theme';
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
      navigation.replace('NotificationPermission');
    }
  };

  const handleAskAppNotToTrack = () => {
    // User declined tracking - skip requests or proceed
    navigation.replace('NotificationPermission');
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
        {/* Title */}
        <Text style={[styles.title, typography.heading]}>{t('ATT Prompt')}</Text>

        {/* Description */}
        <Text style={[styles.description]}>
          <Text style={{ fontWeight: '700' }}>"RoundBuy" {t('would like permission to track you acrosss apps and websites owned by other companies.')}</Text> {t('Your data will be used to deliver personalized ads to you.')}
        </Text>
      </View>

      {/* Footer with Action Buttons */}
      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleAllowTracking}
          >
            <Text style={[styles.buttonText, { color: colors.link }]}>{t('Allow Tracking')}</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.button}
            onPress={handleAskAppNotToTrack}
          >
            <Text style={[styles.buttonText, { color: colors.link }]}>{t('Ask App Not to Track')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.safetyLink}>
          <Text style={styles.safetyText}>{t('Our')} <Text style={{ color: colors.link, textDecorationLine: 'underline' }}>{t('Safety Disclaimers')}</Text></Text>
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
    alignItems: 'center',
    paddingBottom: 30, // Space above footer
  },
  title: {
    marginBottom: 30,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    color: '#000000',
    lineHeight: 24,
    paddingHorizontal: 5,
  },
  footer: {
    paddingBottom: 40,
    paddingHorizontal: 0,
  },
  buttonContainer: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  button: {
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  safetyLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  safetyText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 22,
    textAlign: 'center',
    color: '#333333',
  }

});

export default ATTPromptScreen;