import React from 'react';
import { IMAGES } from '../../assets/images';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';
import OnboardingModal from '../../components/onboarding/OnboardingModal';

const RegistrationScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  console.log('📱 RegistrationScreen: Rendering...');

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
    navigation.navigate('PatentPending');
  };

  const handleTestDemo = () => {
    console.log('Navigate to Test Demo');
    navigation.navigate('Demo');
  };


  try {
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

          {/* Find Out Section */}
          <View style={styles.findOutContainer}>
            <Text style={styles.findOutTitle}>{t('Why should you use our App?')}</Text>
            <Text style={styles.findOutSubtitle}>{t('Find out what we offer!')}</Text>
            <TouchableOpacity
              style={styles.findOutButton}
              onPress={() => setShowOnboarding(true)}
            >
              <Text style={styles.findOutButtonText}>{t('Find out!')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Center Content */}
        <View style={styles.content}>
          <Text style={styles.tagline}>{t('Sell and Buy around you')}</Text>
          <Text style={styles.subtitle}>{t('Buy and Sell products and services just around you!')}</Text>

          <TouchableOpacity
            style={styles.demoButton}
            onPress={handleTestDemo}
          >
            <Text style={styles.demoButtonText}>{t('Test RoundBuy Demo')}</Text>
          </TouchableOpacity>
        </View>

        <OnboardingModal
          visible={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          tourId="registration_tour"
          onFinish={() => {
            setShowOnboarding(false);
            navigation.navigate('CreateAccount');
          }}
          title="Registration"
          slides={[
            {
              title: 'Onboard 1',
              heading: 'Location Benefits',
              description: 'Location: Lorem ipsum dolores est. Lorem ipsum dolores est. Default location is your... Product location...',
              list: ['Value Propostion 1', 'Value Propostion 2', 'Value Propostion 3']
            },
            {
              title: 'Onboard 2',
              heading: 'Listing Features',
              description: 'Listing: Lorem ipsum dolores est. Lorem ipsum dolores est.',
              list: ['Value Propostion 1', 'Value Propostion 2', 'Value Propostion 3']
            },
            {
              title: 'Onboard 3',
              heading: 'Mission Statement',
              description: 'Our Mission statement: lorum ipsum dolores est, lorum ipsum dolores est.',
              buttonText: 'Sign Up now!'
            }
          ]}
        />

        {/* Footer with Buttons */}
        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleSignIn}
            >
              <Text style={styles.signInButtonText}>{t('Sign in')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
            >
              <Text style={styles.registerButtonText}>{t('Register')}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.copyright}>{t('© 2020-2026 RoundBuy Inc ®')}</Text>
        </View>
      </SafeScreenContainer>
    );
  } catch (error) {
    console.error('❌ RegistrationScreen: Render error:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#000' }}>{t('Registration Screen')}</Text>
        <Text style={{ fontSize: 16, marginBottom: 20, color: '#666', textAlign: 'center' }}>{t('Error loading screen. Check console for details.')}</Text>
        <TouchableOpacity
          style={{ backgroundColor: '#007AFF', padding: 15, borderRadius: 8 }}
          onPress={handleSignIn}
        >
          <Text style={{ color: '#fff', fontSize: 16 }}>{t('Sign In')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: '#34C759', padding: 15, borderRadius: 8, marginTop: 10 }}
          onPress={handleRegister}
        >
          <Text style={{ color: '#fff', fontSize: 16 }}>{t('Register')}</Text>
        </TouchableOpacity>
      </View>
    );
  }
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
    color: '#676777ff',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: -0.9,
    marginBottom: 2,
  },
  findOutContainer: {
    marginTop: 20,
    alignItems: 'flex-start',
  },
  findOutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00a82d', // Darker Green
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  findOutSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#76ff03', // Lighter Green / Lime
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  findOutButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: '#eee',
  },
  findOutButtonText: {
    fontSize: 15,
    color: '#0056b3', // Blue text
    fontWeight: '600',
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