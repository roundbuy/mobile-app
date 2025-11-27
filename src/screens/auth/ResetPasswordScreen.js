import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../../constants/theme';

const ResetPasswordScreen = ({ navigation }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = () => {
    if (newPassword && confirmPassword && newPassword === confirmPassword) {
      console.log('Password reset successful');
      navigation.navigate('Welcome');
    }
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
          <Text style={styles.backText}>Reset password</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* New Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.passwordContainer}>
            <FontAwesome name="lock" size={16} color="#6a6a6a" style={styles.inputIcon} />
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your new password"
              placeholderTextColor="#c7c7cc"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity 
              style={styles.showPasswordButton}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Text style={styles.eyeIcon}>{showNewPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm New Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.passwordContainer}>
            <FontAwesome name="lock" size={16} color="#6a6a6a" style={styles.inputIcon} />
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your new password"
              placeholderTextColor="#c7c7cc"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity 
              style={styles.showPasswordButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reset Password Button */}
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={handleResetPassword}
        >
          <Text style={styles.resetButtonText}>Reset password</Text>
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
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    letterSpacing: -0.1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
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
  resetButton: {
    height: 54,
    backgroundColor: COLORS.primary,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  resetButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
});

export default ResetPasswordScreen;