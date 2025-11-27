import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../../constants/theme';

const CreateAccountScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  // Validate full name
  const validateFullName = (name) => {
    if (name.trim().length < 2) {
      setFullNameError('Name must be at least 2 characters');
      return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      setFullNameError('Name should only contain letters');
      return false;
    }
    setFullNameError('');
    return true;
  };

  // Validate email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { strength: '', checks: [] };
    
    const checks = [
      {
        label: 'At least 8 characters',
        passed: password.length >= 8
      },
      {
        label: 'Cannot contain your name or email address',
        passed: !password.toLowerCase().includes(fullName.toLowerCase().split(' ')[0]) &&
                !password.toLowerCase().includes(email.split('@')[0].toLowerCase())
      },
      {
        label: 'Contains a number or symbol',
        passed: /[\d!@#$%^&*(),.?":{}|<>]/.test(password)
      }
    ];

    const passedCount = checks.filter(c => c.passed).length;
    const strength = passedCount === 3 ? 'strong' : passedCount >= 2 ? 'medium' : 'weak';
    
    return { strength, checks };
  };

  const passwordInfo = getPasswordStrength();

  const handleSignUp = () => {
    // Validate inputs
    if (!fullName || !email || !password) {
      console.log('Please fill all fields');
      return;
    }
    
    const isNameValid = validateFullName(fullName);
    const isEmailValid = validateEmail(email);
    
    if (!isNameValid || !isEmailValid) {
      return;
    }

    if (passwordInfo.strength === 'weak') {
      console.log('Password is too weak');
      return;
    }
    
    // Navigate to next screen
    navigation.navigate('EmailVerification', { email });
  };

  const handleFullNameChange = (text) => {
    setFullName(text);
    if (text.trim()) {
      validateFullName(text);
    } else {
      setFullNameError('');
    }
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (text.trim()) {
      validateEmail(text);
    } else {
      setEmailError('');
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Sign up with ${provider}`);
    navigation.navigate('SocialLogin');
  };

  const handlePasswordGuideline = () => {
    navigation.navigate('PasswordGuidelines');
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

        {/* Title */}
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Create a profile, buy & sell safely
        </Text>

        {/* Full Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your full name</Text>
          <TextInput
            style={[styles.input, fullNameError ? styles.inputError : null]}
            placeholder="Example: John Round"
            placeholderTextColor="#c7c7cc"
            value={fullName}
            onChangeText={handleFullNameChange}
            autoCapitalize="words"
          />
          {fullNameError ? <Text style={styles.errorText}>{fullNameError}</Text> : null}
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Enter your email</Text>
          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            placeholder="example@gmail.com"
            placeholderTextColor="#c7c7cc"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
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
              <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
          
          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <View style={styles.passwordStrengthContainer}>
              <View style={styles.strengthHeader}>
                <Text style={styles.strengthLabel}>
                  {passwordInfo.strength === 'weak' ? '✗' : '✓'} Password strength:{' '}
                  <Text style={[
                    styles.strengthValue,
                    passwordInfo.strength === 'strong' ? styles.strongText :
                    passwordInfo.strength === 'medium' ? styles.mediumText :
                    styles.weakText
                  ]}>
                    {passwordInfo.strength}
                  </Text>
                </Text>
              </View>
              {passwordInfo.checks.map((check, index) => (
                <Text key={index} style={[styles.checkItem, check.passed && styles.checkPassed]}>
                  {check.passed ? '✓' : '✗'} {check.label}
                </Text>
              ))}
            </View>
          )}
          
          {/* Password Guideline Link */}
          <View style={styles.passwordHelp}>
            <TouchableOpacity onPress={handlePasswordGuideline}>
              <Text style={styles.passwordGuidelineLink}>Password guideline</Text>
            </TouchableOpacity>
            <Text style={styles.checkMark}>✓</Text>
          </View>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={handleSignUp}
        >
          <Text style={styles.signUpButtonText}>Sign up</Text>
        </TouchableOpacity>

        {/* Already have account */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SocialLogin')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Login Buttons */}
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialLogin('Google')}
        >
          <View style={styles.socialButtonContent}>
            <FontAwesome name="google" size={22} color="#DB4437" style={styles.socialIcon} />
            <Text style={styles.socialButtonText}>Sign up with google</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialLogin('Apple')}
        >
          <View style={styles.socialButtonContent}>
            <FontAwesome name="apple" size={22} color="#000000" style={styles.socialIcon} />
            <Text style={styles.socialButtonText}>Sign up with apple</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialLogin('Instagram')}
        >
          <View style={styles.socialButtonContent}>
            <FontAwesome name="instagram" size={22} color="#E4405F" style={styles.socialIcon} />
            <Text style={styles.socialButtonText}>Sign up with instagram</Text>
          </View>
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of service</Text> and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>.
        </Text>

        {/* Copyright */}
        <Text style={styles.copyright}>
          © 2020-2025 RoundBuy Inc ®
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6a6a6a',
    marginBottom: 20,
    letterSpacing: -0.1,
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
  inputError: {
    borderWidth: 1,
    borderColor: '#ff3b30',
  },
  errorText: {
    fontSize: 11,
    color: '#ff3b30',
    marginTop: 4,
    marginLeft: 4,
  },
  passwordStrengthContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  strengthHeader: {
    marginBottom: 8,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6a6a6a',
  },
  strengthValue: {
    fontWeight: '700',
  },
  weakText: {
    color: '#ff3b30',
  },
  mediumText: {
    color: '#ff9500',
  },
  strongText: {
    color: '#34c759',
  },
  checkItem: {
    fontSize: 11,
    color: '#ff3b30',
    marginBottom: 4,
    lineHeight: 16,
  },
  checkPassed: {
    color: '#34c759',
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
    padding: 6,
  },
  eyeIcon: {
    fontSize: 18,
  },
  passwordHelp: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  passwordGuidelineLink: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  checkMark: {
    fontSize: 14,
    color: '#34c759',
    fontWeight: '700',
  },
  signUpButton: {
    height: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    letterSpacing: 0.2,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6a6a6a',
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.primary,
    textDecorationLine: 'underline',
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
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
    letterSpacing: 0.1,
  },
  termsText: {
    fontSize: 10,
    fontWeight: '400',
    color: '#8a8a8a',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 12,
    lineHeight: 14,
    letterSpacing: -0.1,
  },
  termsLink: {
    color: '#8a8a8a',
    textDecorationLine: 'underline',
  },
  copyright: {
    fontSize: 10,
    fontWeight: '400',
    color: '#8a8a8a',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
});

export default CreateAccountScreen;