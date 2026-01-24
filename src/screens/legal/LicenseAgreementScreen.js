import React from 'react';
import { IMAGES } from '../../assets/images';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';

const LicenseAgreementScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const handleAccept = () => {
    navigation.replace('ATTPrompt');
  };

  const handleCancel = () => {
    navigation.navigate('RoundBuyInfo', { from: 'license' });
  };


  const handlePolicyPress = (policyType) => {
    navigation.navigate('PolicyDetail', { policyType });
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
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>
            License Agreement, Terms &{'\n'}Conditions, and Privacy Policy
          </Text>

          <Text style={styles.description}>{t('You must agree to license agreement (EULA), Terms & Conditions and Privacy Policy below in order to complete the installation and use RoundBuy app or services. By clicking "I accept", you are agreeing to the terms of these agreements.')}</Text>

          {/* Policy Links */}
          <View style={styles.linksContainer}>
            <Text style={styles.linkText}>
              {t('Read the License Agreement PDF')}{' '}
              <Text style={styles.linkHighlight} onPress={() => handlePolicyPress('license')}>
                {t('here')}
              </Text>
              {'\n'}{t('Terms & Conditions PDF')}{' '}
              <Text style={styles.linkHighlight} onPress={() => handlePolicyPress('terms')}>
                {t('here')}
              </Text>
              {'\n'}{t('and Privacy Policy')}{' '}
              <Text style={styles.linkHighlight} onPress={() => handlePolicyPress('privacy')}>
                {t('here')}
              </Text>
            </Text>
          </View>

          <Text style={styles.emailNote}>{t('A copy of the License will be sent to you by email. It is also posted at https://roundbuy.com/legal/')}</Text>
        </View>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={handleAccept}
            >
              <Text style={styles.acceptButtonText}>{t('I accept')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCancel}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>{t('Cancel')}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.copyright}>{t('© 2020-2026 RoundBuy Inc ®')}</Text>
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
    paddingBottom: SPACING.lg,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 40,
    marginTop: 10,
  },
  logo: {
    width: 140,
    height: 60,
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
    paddingHorizontal: 4,
    marginTop: 150,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 15,
    fontWeight: '400',
    color: '#4a4a4a',
    marginBottom: 20,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  linksContainer: {
    marginBottom: 20,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 23,
    letterSpacing: -0.1,
  },
  linkHighlight: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  emailNote: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6a6a6a',
    lineHeight: 18,
    marginBottom: 30,
    letterSpacing: -0.1,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 'auto',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 70,
    paddingHorizontal: 0,
  },
  acceptButton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  acceptButtonText: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 26,
  },
  cancelButtonText: {
    fontSize: 22,
    fontWeight: '500',
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
  copyright: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    letterSpacing: -0.1,
    marginTop: -50,
  },
});

export default LicenseAgreementScreen;