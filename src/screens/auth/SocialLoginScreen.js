import React, { useState, useEffect } from 'react';
import { IMAGES } from '../../assets/images';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/TranslationContext';

const SocialLoginScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { email: paramEmail, message } = route.params || {};
  const [email, setEmail] = useState(paramEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Show message if provided (from registration/payment completion)
  useEffect(() => {
    if (message) {
      Alert.alert(t('Welcome!'), message);
    }
  }, [message]);

  const handleSignIn = async () => {
    // Validate inputs
    if (!email || !password) {
      Alert.alert(t('Error'), t('Please enter both email and password'));
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(t('Invalid Email'), t('Please enter a valid email address'));
      return;
    }

    try {
      setLoading(true);

      // Call login API through AuthContext
      const response = await login(email, password);

      // Check if user needs subscription
      if (response && response.requires_subscription) {
        // User is verified but has no active subscription
        Alert.alert(
          t('Subscription Required'),
          t('Please select a subscription plan to continue.'),
          [
            {
              text: t('Choose Plan'),
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'AllMemberships' }],
                });
              }
            }
          ]
        );
      } else {
        // Success - User has subscription, navigate to main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'SearchScreen' }],
        });
      }
    } catch (error) {
      console.error('Login error:', error);

      // Handle specific error cases
      let errorMessage = error.message || 'Login failed. Please try again.';

      if (error.error_code === 'EMAIL_NOT_VERIFIED' || error.message?.includes('verify your email')) {
        // User needs to verify email first
        Alert.alert(
          t('Email Not Verified'),
          t("Please verify your email before logging in. We'll send you a verification code."),
          [
            { text: t('Cancel'), style: 'cancel' },
            {
              text: t('Verify Now'),
              onPress: () => {
                // Navigate to email verification screen
                navigation.navigate('EmailVerification', {
                  email: error.data?.email || email
                });
              }
            }
          ]
        );
      } else if (error.message?.includes('deactivated')) {
        Alert.alert(t('Account Deactivated'), t('Your account has been deactivated. Please contact support.'));
      } else if (error.message?.includes('Invalid email or password')) {
        Alert.alert(t('Login Failed'), t('Invalid email or password. Please try again.'));
      } else if (error.message?.includes('Session expired') || error.error_code === 'SESSION_EXPIRED' || error.error_code === 'TOKEN_EXPIRED') {
        Alert.alert(t('Session Expired'), t('Session expired. Please login again.'));
      } else {
        Alert.alert(t('Login Failed'), errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // TODO: Implement OAuth flow for social login
    Alert.alert(
      t('Coming Soon'),
      `${provider} login will be available in the next update.`,
      [{ text: t('OK') }]
    );
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handlePatentInfo = () => {
    navigation.navigate('PatentPending');
  };

  return (
    <SafeScreenContainer>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
        </View>

        {/* Header with Logo and Patent Info */}
        <View style={styles.logoContainer}>
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

        {/* Title */}
        <Text style={styles.title}>{t('Sign in')}</Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('Email address')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('johnround@gmail.com')}
            placeholderTextColor="#c7c7cc"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('Password')}</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              placeholderTextColor="#c7c7cc"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.showPasswordButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#6a6a6a"
              />
            </TouchableOpacity>
          </View>

          {/* Forgotten Password Link */}
          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotPasswordButton}
          >
            <Text style={styles.forgotPasswordText}>{t('Forgotten password?')}</Text>
          </TouchableOpacity>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          style={[styles.signInButton, loading && styles.signInButtonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.signInButtonText}>{t('Sign in')}</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t('Or')}</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Login Buttons */}
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialLogin('Google')}
        >
          <FontAwesome name="google" size={20} color="#DB4437" style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>{t('Sign up with google')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialLogin('Apple')}
        >
          <FontAwesome name="apple" size={20} color="#000000" style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>{t('Sign up with apple')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialLogin('Instagram')}
        >
          <FontAwesome name="instagram" size={20} color="#E4405F" style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>{t('Sign up with instagram')}</Text>
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={styles.termsLink}>{t('Terms of service')}</Text> and{' '}
          <Text style={styles.termsLink}>{t('Privacy Policy')}</Text>.
        </Text>
      </ScrollView>
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    marginBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 32,
    fontWeight: '300',
    color: '#1a1a1a',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 50,
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
    fontSize: 10,
    fontWeight: '400',
    color: '#6a6a6a',
    letterSpacing: -0.1,
  },
  clickHere: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -0.3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
    letterSpacing: -0.1,
  },
  input: {
    height: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#1a1a1a',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
  },
  showPasswordButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  signInButton: {
    height: 54,
    backgroundColor: COLORS.primary,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  signInButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6a6a6a',
    marginHorizontal: 12,
  },
  socialButton: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    marginBottom: 10,
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 16,
  },
  socialIcon: {
    width: 24,
    textAlign: 'center',
    marginLeft: 100,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
    letterSpacing: 0.1,
    marginLeft: 5,
    flex: 1,
  },
  termsText: {
    fontSize: 10,
    fontWeight: '400',
    color: '#8a8a8a',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 14,
    letterSpacing: -0.1,
  },
  termsLink: {
    color: '#8a8a8a',
    textDecorationLine: 'underline',
  },
});

export default SocialLoginScreen;