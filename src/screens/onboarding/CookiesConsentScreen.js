import React from 'react';
import { IMAGES } from '../../assets/images';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../../constants/theme';

const CookiesConsentScreen = ({ navigation }) => {
  const handleAcceptAll = () => {
    // Save cookie preferences and proceed to registration
    console.log('Cookies accepted');
    navigation.replace('Registration');
  };

  const handleRejectAll = () => {
    // Save cookie preferences (rejected) and proceed
    console.log('Cookies rejected');
    navigation.replace('Registration');
  };

  const handleMoreInfo = () => {
    navigation.navigate('CookieSettings');
  };

  return (
    <SafeScreenContainer>
      {/* Header with Logo */}
      <View style={styles.header}>
        <Image
          source={IMAGES.logoMain}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Cookies</Text>
        
        <Text style={styles.description}>
          We use cookies to improve user experience. Choose what cookies you allow us to use. You can read more about our Privacy Policy in our{' '}
          <Text style={styles.linkText}>Privacy policy and Cookie Policy</Text>.
        </Text>
      </View>

      {/* Footer with Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleAcceptAll}
        >
          <Text style={styles.primaryButtonText}>Accept All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRejectAll}
        >
          <Text style={styles.primaryButtonText}>Reject All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleMoreInfo}
        >
          <Text style={styles.secondaryButtonText}>More info</Text>
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
    paddingHorizontal: 20,
    marginTop: 250,
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
});

export default CookiesConsentScreen;