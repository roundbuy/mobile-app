import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import SafeScreenContainer from '../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../constants/theme';

const AccountVerifiedScreen = ({ navigation }) => {
  const handleDone = () => {
    navigation.replace('Welcome');
  };

  const handlePatentInfo = () => {
    console.log('Navigate to Patent Information');
  };

  return (
    <SafeScreenContainer>
      {/* Header with Logo and Patent Info */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/Logo-main.png')}
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
        {/* Success Icon */}
        <View style={styles.successCircle}>
          <Text style={styles.checkmark}>✓</Text>
        </View>

        <Text style={styles.title}>Account verified</Text>
        <Text style={styles.subtitle}>
          Congrats, now you're a verified{'\n'}member of RoundBuy
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={handleDone}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>

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
    marginTop: 250,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#34c759',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  checkmark: {
    fontSize: 60,
    color: '#ffffff',
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6a6a6a',
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  footer: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  doneButton: {
    height: 54,
    backgroundColor: '#f5f5f5',
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1a1a1a',
    letterSpacing: 0.2,
  },
  copyright: {
    fontSize: 11,
    fontWeight: '400',
    color: '#8a8a8a',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
});

export default AccountVerifiedScreen;