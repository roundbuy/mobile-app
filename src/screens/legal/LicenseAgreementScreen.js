import React from 'react';
import { IMAGES } from '../../assets/images';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { ONBOARDING_THEME } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';

const LicenseAgreementScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const handleAccept = () => {
    navigation.replace('CookiesConsent');
  };

  const handleCancel = () => {
    // Navigation for cancel - maybe back to start or stay? sticking to prev logic or just going back
    // Previous logic went to RoundBuyInfo. Screenshot shows "Cancel", usually means exit flow or go back.
    // I'll keep it pointing to RoundBuyInfo for now as it's a "soft" exit.
    navigation.navigate('RoundBuyInfo', { from: 'license' });
  };

  const handlePolicyPress = (policyType) => {
    navigation.navigate('PolicyDetail', { policyType });
  };

  const handlePatentInfo = () => {
    navigation.navigate('PatentPending');
  };

  const { colors, typography, spacing } = ONBOARDING_THEME;

  return (
    <SafeScreenContainer>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Logo and Patent Info */}
        <View style={styles.header}>
          <Image
            source={IMAGES.logoMain}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.patentText}>{t('Patents Pending')}</Text>
          <TouchableOpacity onPress={handlePatentInfo}>
            <Text style={styles.infoLink}>
              {t('Read more about')} <Text style={[styles.infoLink, { color: colors.link, textDecorationLine: 'underline' }]}>{t('patents')}</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[typography.heading, styles.title]}>
            {t('Roundbuy Policies')}
          </Text>

          <Text style={[styles.description, typography.body, { textAlign: 'left' }]}>{t('You must agree to the policies below, to complete and use the Roundbuy app & platform. Agree by tapping “I accept”.')}</Text>

          {/* Policy Links */}
          <View style={styles.linksContainer}>
            <Text style={[styles.linkHeader, { textAlign: 'left', fontWeight: '400' }]}>{t('Read our policies:')}</Text>
            <TouchableOpacity onPress={() => handlePolicyPress('license')}>
              <Text style={[styles.linkText, { color: colors.link }]}>{t('License Agreement')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePolicyPress('terms')}>
              <Text style={[styles.linkText, { color: colors.link }]}>{t('Terms & Conditions')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePolicyPress('privacy')}>
              <Text style={[styles.linkText, { color: colors.link }]}>{t('Privacy Policy')}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.emailNote}>{t('License & Terms are sent to you by email')}</Text>
        </View>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.acceptButton, { backgroundColor: colors.primaryButton }]}
              onPress={handleAccept}
            >
              <Text style={styles.acceptButtonText}>{t('I accept')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCancel}
              style={styles.cancelButton}
            >
              <Text style={[styles.cancelButtonText, { color: colors.link }]}>{t('Cancel')}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.bottomLink}>
            {t('Read our ')}
            <Text style={{ textDecorationLine: 'underline', color: colors.link }} onPress={() => handlePolicyPress('license')}>{t('License')}</Text>{', '}
            <Text style={{ textDecorationLine: 'underline', color: colors.link }} onPress={() => handlePolicyPress('terms')}>{t('Terms')}</Text> {t('and')} <Text style={{ textDecorationLine: 'underline', color: colors.link }} onPress={() => handlePolicyPress('privacy')}>{t('Privacy Policy')}</Text>
          </Text>
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
    paddingBottom: 24,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 40,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  logo: {
    width: 150,
    height: 60,
    marginBottom: 5,
  },
  patentText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#001C64',
    marginBottom: 2,
  },
  infoLink: {
    fontSize: 14,
    fontWeight: '500',
    color: '#001C64',
  },
  content: {
    marginTop: 'auto',
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  title: {
    marginBottom: 0,
    textAlign: 'left',
  },
  description: {
    marginBottom: 20,
    lineHeight: 22,
  },
  linksContainer: {
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  linkHeader: {
    marginBottom: 5,
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 24,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    textDecorationLine: 'underline',
  },
  emailNote: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6a6a6a',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 'auto',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 30,
    marginTop: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    gap: 15,
  },
  acceptButton: {
    flex: 1,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  acceptButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: '500',
  },
  bottomLink: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333333',
    marginTop: 10,
    fontWeight: '500',
  }
});

export default LicenseAgreementScreen;