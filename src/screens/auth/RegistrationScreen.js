import React from 'react';
import { IMAGES } from '../../assets/images';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../../constants/theme';

const RegistrationScreen = ({ navigation }) => {
  const handleSignIn = () => {
    console.log('Navigate to Sign In');
    navigation.navigate('SocialLogin');
  };

  const handleRegister = () => {
    console.log('Navigate to Register');
    navigation.navigate('CreateAccount');
  };

  const handlePatentInfo = () => {
    console.log('Navigate to Patent Information');
    // Navigate to patent info page or open link
  };

  const handleTestDemo = () => {
    console.log('Navigate to Test Demo');
    // Navigate to demo mode
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
        <Text style={styles.patentText}>Patent Pending</Text>
        <TouchableOpacity onPress={handlePatentInfo}>
          <Text style={styles.infoLink}>
            for more information{' '}
            <Text style={styles.clickHere}>click here</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Center Content */}
      <View style={styles.content}>
        <Text style={styles.tagline}>Sell and Buy around you</Text>
        <Text style={styles.subtitle}>
          Buy and Sell products and services just around you!
        </Text>
        
        <TouchableOpacity
          style={styles.demoButton}
          onPress={handleTestDemo}
        >
          <Text style={styles.demoButtonText}>Test RoundBuy Demo</Text>
        </TouchableOpacity>
      </View>

      {/* Footer with Buttons */}
      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleSignIn}
          >
            <Text style={styles.signInButtonText}>Sign in</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
          >
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.copyright}>
          © 2020-2025 RoundBuy Inc ®
        </Text>
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
    marginBottom: 12,
  },
  patentText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
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
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 250,
  },
  tagline: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    letterSpacing: -0.2,
    lineHeight: 36,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6a6a6a',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: -0.9,
    marginBottom: 2,
  },
  demoButton: {
    height: 54,
    backgroundColor: '#f5f5f5',
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 50,
    marginTop: 6,
  },
  demoButtonText: {
    fontSize: 22,
    fontWeight: '500',
    color: '#1a1a1a',
    letterSpacing: 0.2,
  },
  footer: {
    paddingTop: 0,
    paddingBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  signInButton: {
    flex: 1,
    height: 54,
    backgroundColor: '#f5f5f5',
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
  registerButton: {
    flex: 1,
    height: 54,
    backgroundColor: COLORS.primary,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  copyright: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
});

export default RegistrationScreen;