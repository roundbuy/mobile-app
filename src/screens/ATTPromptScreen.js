import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import SafeScreenContainer from '../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../constants/theme';

const ATTPromptScreen = ({ navigation }) => {
  const handleAllowTracking = () => {
    // In real app, request tracking permission here
    navigation.replace('CookiesConsent');
  };

  const handleAskAppNotToTrack = () => {
    // User declined tracking
    navigation.replace('CookiesConsent');
  };

  return (
    <SafeScreenContainer>
      {/* Header with Logo */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/Logo-main.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>ATT Prompt</Text>
        
        {/* Description */}
        <Text style={styles.description}>
          "RoundBuy" would like permission to track you acrosss apps and websites owned by other companies.
        </Text>

        {/* Explanation */}
        <Text style={styles.explanation}>
          Your data will be used to deliver personalized ads to you.
        </Text>
      </View>

      {/* Footer with Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleAllowTracking}
        >
          <Text style={styles.buttonText}>Allow Tracking</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleAskAppNotToTrack}
        >
          <Text style={styles.buttonText}>Ask App Not to Track</Text>
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