import React, { useState } from 'react';
import { useTranslation } from '../../../context/TranslationContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';

const ReferralCodeScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
  const { category } = route.params;
  const [copied, setCopied] = useState(false);

  // Dummy referral code - replace with actual user's code
  const referralCode = 'RB543229';
  const username = 'Username';

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCopyCode = () => {
    try {
      Clipboard.setString(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      Alert.alert(t('Success'), t('Referral code copied to clipboard!'));
    } catch (error) {
      Alert.alert(t('Error'), t('Failed to copy code'));
    }
  };

  const handleShare = async () => {
    try {
      const message = `Join RoundBuy using my referral code: ${referralCode} and let's both earn rewards!`;
      await Share.share({
        message: message,
        title: 'Join RoundBuy',
      });
    } catch (error) {
      Alert.alert(t('Error'), t('Failed to share'));
    }
  };

  const handleCheckStatus = () => {
    navigation.navigate('ReferralStatus', { category });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Referral code')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="logo-dropbox" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.logoText}>{t('RoundBuy')}</Text>
        </View>

        {/* Welcome Text */}
        <Text style={styles.welcomeText}>
          Hello, <Text style={styles.usernameText}>"{username}"</Text>
        </Text>
        <Text style={styles.descriptionText}>{t('Welcome to RoundBuy, Give this referral code to 5 friends to register and receive Gold membership for free of charge.')}</Text>

        {/* Referral Code Card */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>{t('Your unique referral code:')}</Text>
          <View style={styles.codeContainer}>
            <View style={styles.codeDashedBorder}>
              <Ionicons name="cut" size={24} color="#999" style={styles.scissorsIcon} />
              <Text style={styles.codeText}>{referralCode}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleCopyCode}
            activeOpacity={0.8}
          >
            <Ionicons name={copied ? "checkmark-circle" : "copy"} size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>
              {copied ? 'Copied!' : 'Copy Code'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Ionicons name="share-social" size={20} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>{t('Share Code')}</Text>
          </TouchableOpacity>
        </View>

        {/* Check Status Button */}
        <TouchableOpacity
          style={styles.statusButton}
          onPress={handleCheckStatus}
          activeOpacity={0.8}
        >
          <Text style={styles.statusButtonText}>{t('Check status')}</Text>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.infoHeaderText}>{t('How to use')}</Text>
          </View>
          <Text style={styles.infoText}>
            • Copy your referral code{'\n'}
            • Share it with your friends via social media or messaging apps{'\n'}
            • Ask them to use your code when signing up{'\n'}
            • Track your progress in the Check Status section
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>{t('© 2024-2026 RoundBuy Inc ®')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginRight: 36,
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  welcomeText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  usernameText: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  codeCard: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  codeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  codeContainer: {
    width: '100%',
  },
  codeDashedBorder: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#999',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    position: 'relative',
  },
  scissorsIcon: {
    position: 'absolute',
    top: -12,
    right: 12,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 4,
  },
  codeText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 4,
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 8,
  },
  statusButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    width: '100%',
  },
  statusButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginRight: 8,
  },
  infoSection: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoHeaderText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default ReferralCodeScreen;