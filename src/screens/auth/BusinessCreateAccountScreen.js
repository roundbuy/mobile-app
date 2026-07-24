import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/TranslationContext';
import { ONBOARDING_THEME } from '../../constants/theme';

const BusinessCreateAccountScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { register } = useAuth();

  // Personal fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Business fields
  const [companyName, setCompanyName] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');

  // Errors
  const [fullNameError, setFullNameError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [companyNameError, setCompanyNameError] = useState('');
  const [businessAddressError, setBusinessAddressError] = useState('');

  // Checkboxes
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [loading, setLoading] = useState(false);

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

  const validateUsername = (value) => {
    if (value.length < 3 || value.length > 20) {
      setUsernameError('Your username needs to be between 3 and 20 characters');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError('Username can only contain letters, numbers and underscores');
      return false;
    }
    setUsernameError('');
    return true;
  };

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validateCompanyName = (value) => {
    if (value.trim().length < 2) {
      setCompanyNameError('Company name must be at least 2 characters');
      return false;
    }
    setCompanyNameError('');
    return true;
  };

  const validateBusinessAddress = (value) => {
    if (value.trim().length < 5) {
      setBusinessAddressError('Please enter a valid business address');
      return false;
    }
    setBusinessAddressError('');
    return true;
  };

  const getPasswordStrength = () => {
    if (!password) return { strength: '', checks: [] };
    const checks = [
      { label: 'At least 8 characters', passed: password.length >= 8 },
      {
        label: 'Cannot contain your name or email address',
        passed:
          !password.toLowerCase().includes(fullName.toLowerCase().split(' ')[0]) &&
          !password.toLowerCase().includes(email.split('@')[0].toLowerCase()),
      },
      { label: 'Contains a number or symbol', passed: /[\d!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];
    const passedCount = checks.filter(c => c.passed).length;
    const strength = passedCount === 3 ? 'strong' : passedCount >= 2 ? 'medium' : 'weak';
    return { strength, checks };
  };

  const passwordInfo = getPasswordStrength();

  const handleSignUp = async () => {
    if (!fullName || !username || !email || !password || !companyName || !businessAddress) {
      Alert.alert(t('Error'), t('Please fill all required fields'));
      return;
    }

    const isNameValid = validateFullName(fullName);
    const isUsernameValid = validateUsername(username);
    const isEmailValid = validateEmail(email);
    const isCompanyValid = validateCompanyName(companyName);
    const isAddressValid = validateBusinessAddress(businessAddress);

    if (!isNameValid || !isUsernameValid || !isEmailValid || !isCompanyValid || !isAddressValid) return;

    if (passwordInfo.strength === 'weak') {
      Alert.alert(t('Weak Password'), t('Please create a stronger password'));
      return;
    }

    if (!termsAccepted) {
      Alert.alert(t('Terms Required'), t('Please accept the Terms & Conditions to continue'));
      return;
    }

    try {
      setLoading(true);
      const response = await register({
        full_name: fullName,
        username: username,
        email: email,
        password: password,
        marketing_opt_in: marketingOptIn,
        account_type: 'business',
        company_name: companyName,
        vat_number: vatNumber || null,
        business_address: businessAddress,
        language: 'en',
      });

      if (response.success) {
        navigation.navigate('BusinessVerification');
      }
    } catch (error) {
      console.error('Business registration error:', error);
      Alert.alert(
        t('Registration Failed'),
        error.message || t('An error occurred during registration. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeScreenContainer>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{t('Pro Seller & Business Ads')}</Text>
        <Text style={styles.subtitle}>{t('Create a business profile to access pro selling tools')}</Text>

        {/* ── Personal Details ─────────────────────────────── */}
        <Text style={styles.sectionLabel}>{t('Personal details')}</Text>

        {/* Full Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('Your full name')}</Text>
          <TextInput
            style={[styles.input, fullNameError ? styles.inputError : null]}
            placeholder={t('Example: John Round')}
            placeholderTextColor="#c7c7cc"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (text.trim()) validateFullName(text);
              else setFullNameError('');
            }}
            autoCapitalize="words"
          />
          <Text style={styles.hintText}>{t('Your full name will not be publicly visible')}</Text>
          {fullNameError ? <Text style={styles.errorText}>{fullNameError}</Text> : null}
        </View>

        {/* Username */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('Username')}</Text>
          <TextInput
            style={[styles.input, usernameError ? styles.inputError : null]}
            placeholder={t('e.g. john_round')}
            placeholderTextColor="#c7c7cc"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              if (text.length > 0) validateUsername(text);
              else setUsernameError('');
            }}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.hintText}>{t('Your username needs to be between 3 and 20 characters')}</Text>
          {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('Email')}</Text>
          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            placeholder={t('example@company.com')}
            placeholderTextColor="#c7c7cc"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (text.trim()) validateEmail(text);
              else setEmailError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        {/* Password */}
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
            <TouchableOpacity style={styles.showPasswordButton} onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>

          {password.length > 0 && (
            <View style={styles.passwordStrengthContainer}>
              <View style={styles.strengthHeader}>
                <Text style={styles.strengthLabel}>
                  {passwordInfo.strength === 'weak' ? '✗' : '✓'} Password strength:{' '}
                  <Text
                    style={[
                      styles.strengthValue,
                      passwordInfo.strength === 'strong'
                        ? styles.strongText
                        : passwordInfo.strength === 'medium'
                        ? styles.mediumText
                        : styles.weakText,
                    ]}
                  >
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
        </View>

        {/* ── Business Details ──────────────────────────────── */}
        <Text style={styles.sectionLabel}>{t('Business details')}</Text>

        {/* Company Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('Company name')} <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, companyNameError ? styles.inputError : null]}
            placeholder={t('e.g. Round Enterprises Ltd')}
            placeholderTextColor="#c7c7cc"
            value={companyName}
            onChangeText={(text) => {
              setCompanyName(text);
              if (text.trim()) validateCompanyName(text);
              else setCompanyNameError('');
            }}
            autoCapitalize="words"
          />
          {companyNameError ? <Text style={styles.errorText}>{companyNameError}</Text> : null}
        </View>

        {/* VAT Number (optional) */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('VAT number')} <Text style={styles.optional}>({t('optional')})</Text></Text>
          <TextInput
            style={styles.input}
            placeholder={t('e.g. GB123456789')}
            placeholderTextColor="#c7c7cc"
            value={vatNumber}
            onChangeText={setVatNumber}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>

        {/* Business Address */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('Business address')} <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, styles.addressInput, businessAddressError ? styles.inputError : null]}
            placeholder={t('e.g. 123 High Street, London, EC1A 1BB')}
            placeholderTextColor="#c7c7cc"
            value={businessAddress}
            onChangeText={(text) => {
              setBusinessAddress(text);
              if (text.trim()) validateBusinessAddress(text);
              else setBusinessAddressError('');
            }}
            multiline
            numberOfLines={2}
            autoCapitalize="words"
          />
          {businessAddressError ? <Text style={styles.errorText}>{businessAddressError}</Text> : null}
        </View>

        {/* Policy Checkboxes */}
        <View style={styles.checkboxSection}>
          <TouchableOpacity style={styles.checkboxRow} onPress={() => setMarketingOptIn(!marketingOptIn)} activeOpacity={0.7}>
            <View style={[styles.checkbox, marketingOptIn && styles.checkboxChecked]}>
              {marketingOptIn && <Text style={styles.checkboxTick}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              {t("I'd like to receive personalised offers and be the first to know about the latest updates to RoundBuy via email.")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkboxRow} onPress={() => setTermsAccepted(!termsAccepted)} activeOpacity={0.7}>
            <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
              {termsAccepted && <Text style={styles.checkboxTick}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              {t('By registering, I confirm that I accept RoundBuy\'s ')}<Text style={styles.checkboxLink} onPress={() => navigation.navigate('PolicyDetail', { policyType: 'terms' })}>{t('Terms & Conditions')}</Text>{t(', have read the ')}<Text style={styles.checkboxLink} onPress={() => navigation.navigate('PolicyDetail', { policyType: 'privacy' })}>{t('Privacy Policy')}</Text>{t(', and am at least 18 years old.')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Create Business Account Button */}
        <TouchableOpacity
          style={[styles.signUpButton, (loading || !termsAccepted) && styles.signUpButtonDisabled]}
          onPress={handleSignUp}
          disabled={loading || !termsAccepted}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.signUpButtonText}>{t('Create business account')}</Text>
          )}
        </TouchableOpacity>

        {/* Already have account */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>{t('Have an account? ')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SocialLogin')}>
            <Text style={styles.loginLink}>{t('Login')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.copyright}>{t('© 2020-2026 RoundBuy Inc ®')}</Text>
      </ScrollView>
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: { marginBottom: 12 },
  backButton: { width: 44, height: 44, justifyContent: 'center' },
  backArrow: { fontSize: 32, fontWeight: '300', color: '#1a1a1a' },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', marginBottom: 4, letterSpacing: -0.3 },
  subtitle: { fontSize: 15, fontWeight: '400', color: '#6a6a6a', marginBottom: 20, letterSpacing: -0.1 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6a6a6a',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 8,
  },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 6, letterSpacing: -0.1 },
  required: { color: '#ff3b30' },
  optional: { color: '#8a8a8a', fontWeight: '400' },
  hintText: { fontSize: 11, color: '#8a8a8a', marginTop: 4, marginLeft: 2 },
  input: {
    height: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#1a1a1a',
  },
  addressInput: {
    height: 72,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  inputError: { borderWidth: 1, borderColor: '#ff3b30' },
  errorText: { fontSize: 11, color: '#ff3b30', marginTop: 4, marginLeft: 4 },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  passwordInput: { flex: 1, fontSize: 14, color: '#1a1a1a' },
  showPasswordButton: { padding: 6 },
  eyeIcon: { fontSize: 18 },
  passwordStrengthContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  strengthHeader: { marginBottom: 8 },
  strengthLabel: { fontSize: 12, fontWeight: '400', color: '#6a6a6a' },
  strengthValue: { fontWeight: '700' },
  weakText: { color: '#ff3b30' },
  mediumText: { color: '#ff9500' },
  strongText: { color: '#34c759' },
  checkItem: { fontSize: 11, color: '#ff3b30', marginBottom: 4, lineHeight: 16 },
  checkPassed: { color: '#34c759' },
  checkboxSection: { marginBottom: 20, gap: 14 },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#c7c7cc',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkboxTick: { fontSize: 13, color: '#fff', fontWeight: '700' },
  checkboxLabel: { flex: 1, fontSize: 13, color: '#3a3a3a', lineHeight: 18 },
  checkboxLink: { color: ONBOARDING_THEME.colors.link, textDecorationLine: 'underline' },
  signUpButton: {
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  signUpButtonDisabled: { opacity: 0.4 },
  signUpButtonText: { fontSize: 16, fontWeight: '600', color: '#ffffff', letterSpacing: 0.2 },
  loginContainer: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 16 },
  loginText: { fontSize: 15, fontWeight: '400', color: '#000000' },
  loginLink: { fontSize: 15, fontWeight: '500', color: ONBOARDING_THEME.colors.link, textDecorationLine: 'underline' },
  copyright: { fontSize: 12, color: '#000000', textAlign: 'center', fontWeight: 'bold', marginTop: 16 },
});

export default BusinessCreateAccountScreen;
