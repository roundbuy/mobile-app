import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

const EmailVerificationScreen = ({ route, navigation }) => {
  const { verifyEmail } = useAuth();
  const { email } = route.params || {};
  const [code, setCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleNumberPress = (number) => {
    const emptyIndex = code.findIndex(digit => digit === '');
    if (emptyIndex !== -1) {
      const newCode = [...code];
      newCode[emptyIndex] = number.toString();
      setCode(newCode);
    }
  };

  const handleBackspace = () => {
    const lastFilledIndex = code.map((digit, index) => digit !== '' ? index : -1).filter(i => i !== -1).pop();
    if (lastFilledIndex !== undefined && lastFilledIndex >= 0) {
      const newCode = [...code];
      newCode[lastFilledIndex] = '';
      setCode(newCode);
    }
  };

  const handleVerify = async () => {
    if (!code.every(digit => digit !== '')) {
      return;
    }

    const verificationCode = code.join('');
    
    try {
      setLoading(true);
      
      // Call verify email API
      const response = await verifyEmail(email, verificationCode);
      
      if (response.success) {
        // Navigate to Account Verified screen
        navigation.navigate('AccountVerified', { email });
      }
    } catch (error) {
      console.error('Email verification error:', error);
      
      // Clear code on error
      setCode(['', '', '', '']);
      
      let errorMessage = 'Verification failed. Please check your code and try again.';
      
      if (error.message?.includes('expired')) {
        Alert.alert(
          'Code Expired',
          'Your verification code has expired. Please request a new one.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Resend Code',
              onPress: handleResend
            }
          ]
        );
        return;
      } else if (error.message?.includes('Invalid')) {
        errorMessage = 'Invalid verification code. Please try again.';
      }
      
      Alert.alert('Verification Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      Alert.alert('Error', 'Email address not found');
      return;
    }

    try {
      setResending(true);
      setCode(['', '', '', '']);
      
      // Call resend verification API
      const response = await authService.resendVerification(email);
      
      if (response.success) {
        Alert.alert(
          'Code Sent',
          'A new verification code has been sent to your email.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      Alert.alert(
        'Failed to Resend',
        error.message || 'Could not resend verification code. Please try again.'
      );
    } finally {
      setResending(false);
    }
  };

  const NumericButton = ({ number }) => (
    <TouchableOpacity
      style={styles.numButton}
      onPress={() => handleNumberPress(number)}
    >
      <Text style={styles.numButtonText}>{number}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeScreenContainer>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.subtitle}>We have sent a code to this:</Text>
          <Text style={styles.email}>{email || 'johnround@gmail.com'}</Text>

          {/* Verification Code Display */}
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <View key={index} style={styles.codeBox}>
                <Text style={styles.codeText}>{digit || ''}</Text>
              </View>
            ))}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (!code.every(d => d !== '') || loading) && styles.verifyButtonDisabled
            ]}
            onPress={handleVerify}
            disabled={!code.every(d => d !== '') || loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify now</Text>
            )}
          </TouchableOpacity>

          {/* Resend Code */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive code? </Text>
            <TouchableOpacity onPress={handleResend} disabled={resending}>
              {resending ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={styles.resendLink}>Resend code</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Numeric Keypad */}
          <View style={styles.keypad}>
            <View style={styles.keypadRow}>
              <NumericButton number={1} />
              <NumericButton number={2} />
              <NumericButton number={3} />
            </View>
            <View style={styles.keypadRow}>
              <NumericButton number={4} />
              <NumericButton number={5} />
              <NumericButton number={6} />
            </View>
            <View style={styles.keypadRow}>
              <NumericButton number={7} />
              <NumericButton number={8} />
              <NumericButton number={9} />
            </View>
            <View style={styles.keypadRow}>
              <View style={styles.numButton} />
              <NumericButton number={0} />
              <TouchableOpacity style={styles.numButton} onPress={handleBackspace}>
                <Text style={styles.backspaceText}>⌫</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6a6a6a',
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  email: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 32,
    letterSpacing: -0.1,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 40,
  },
  codeBox: {
    width: 64,
    height: 72,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  codeText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  verifyButton: {
    height: 54,
    backgroundColor: COLORS.primary,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  verifyButtonDisabled: {
    backgroundColor: '#d1d1d6',
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  resendText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6a6a6a',
  },
  resendLink: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  keypad: {
    paddingHorizontal: 40,
    paddingBottom: 20,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  numButton: {
    width: 80,
    height: 64,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numButtonText: {
    fontSize: 28,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  backspaceText: {
    fontSize: 24,
    color: '#1a1a1a',
  },
});

export default EmailVerificationScreen;