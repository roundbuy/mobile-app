import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import SafeScreenContainer from '../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../constants/theme';

const ForgotPasswordCheckEmailScreen = ({ route, navigation }) => {
  const { email } = route.params || {};

  const handleCheckEmail = () => {
    // In real app, this would open email client
    console.log('Opening email client');
  };

  const handleResetPassword = () => {
    navigation.navigate('ResetPassword');
  };

  return (
    <SafeScreenContainer>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Forgot password</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Email Display */}
        <View style={styles.emailContainer}>
          <Text style={styles.label}>Email address</Text>
          <Text style={styles.email}>{email || 'johnround@gmail.com'}</Text>
        </View>

        {/* Email Icon */}
        <View style={styles.iconContainer}>
          <FontAwesome name="envelope-o" size={80} color="#6a6a6a" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Check your email</Text>
        
        {/* Description */}
        <Text style={styles.description}>
          Please check your inbox and follow the{'\n'}link to securely reset your password.
        </Text>

        {/* Check Email Button */}
        <TouchableOpacity 
          style={styles.checkEmailButton}
          onPress={handleCheckEmail}
        >
          <Text style={styles.checkEmailButtonText}>Check email</Text>
        </TouchableOpacity>
      </View>
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 32,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH_TARGETS.minHeight,
  },
  backArrow: {
    fontSize: 32,
    fontWeight: '300',
    color: '#1a1a1a',
    marginRight: 12,
  },
  backText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  emailContainer: {
    width: '100%',
    marginBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    letterSpacing: -0.1,
  },
  email: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    letterSpacing: -0.1,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6a6a6a',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 40,
    letterSpacing: -0.1,
  },
  checkEmailButton: {
    width: '80%',
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
  checkEmailButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
});

export default ForgotPasswordCheckEmailScreen;