import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import GlobalHeader from '../../../components/GlobalHeader';
import SuggestionsFooter from '../../../components/SuggestionsFooter';
import Hyperlink from '../../../components/common/Hyperlink';
import { useTranslation } from '../../../context/TranslationContext';

const LegalInfoScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const handleBack = () => {
    navigation.goBack();
  };

  const handlePolicyPress = (policyType, title) => {
    if (policyType === 'policy_updates') {
      navigation.navigate('PolicyUpdates');
    } else {
      navigation.navigate('PolicyDetail', { policyType, title });
    }
  };

  const PolicyLink = ({ title, onPress, policyType }) => (
    <Hyperlink
      linkKey={`policy_${policyType}`}
      style={styles.policyLinkText}
      onPress={onPress}
      unvisitedColor={COLORS.primary}
    >
      {title}
    </Hyperlink>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader
        title={t('Legal')}
        navigation={navigation}
        showBackButton={true}
        showIcons={true}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.mainTitle}>{t('Legal Agreements for RoundBuy service')}</Text>

        {/* Policy Updates Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Policy updates')}</Text>
          <PolicyLink
            title={t('View Policy Updates')}
            policyType="policy_updates"
            onPress={() => handlePolicyPress('policy_updates', 'Policy Updates')}
          />
        </View>

        {/* All User Agreements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('All User Agreements')}</Text>
          <PolicyLink
            title={t('Terms & Conditions')}
            policyType="terms"
            onPress={() => handlePolicyPress('terms', 'Terms & Conditions')}
          />
          <PolicyLink
            title={t('Privacy Policy')}
            policyType="privacy"
            onPress={() => handlePolicyPress('privacy', 'Privacy Policy')}
          />
          <PolicyLink
            title={t('Cookies Policy')}
            policyType="cookies"
            onPress={() => handlePolicyPress('cookies', 'Cookies Policy')}
          />
          <PolicyLink
            title={t('Prohibited & Restricted Items Policy')}
            policyType="prohibited_items"
            onPress={() => handlePolicyPress('prohibited_items', 'Prohibited & Restricted Items Policy')}
          />
          <PolicyLink
            title={t('Seller Business Terms')}
            policyType="seller_terms"
            onPress={() => handlePolicyPress('seller_terms', 'Seller Business Terms')}
          />
          <PolicyLink
            title={t('Content & Moderation Policy')}
            policyType="content_moderation"
            onPress={() => handlePolicyPress('content_moderation', 'Content & Moderation Policy')}
          />
          <PolicyLink
            title={t('Subscriptions & Billing Policy')}
            policyType="subscriptions"
            onPress={() => handlePolicyPress('subscriptions', 'Subscriptions & Billing Policy')}
          />
          <PolicyLink
            title={t('Referral & Credits Policy')}
            policyType="referral"
            onPress={() => handlePolicyPress('referral', 'Referral & Credits Policy')}
          />
          <PolicyLink
            title={t('End User License Agreement (EULA)')}
            policyType="license"
            onPress={() => handlePolicyPress('license', 'End User License Agreement')}
          />
          <PolicyLink
            title={t('Register and Record Statement')}
            policyType="register_record"
            onPress={() => handlePolicyPress('register_record', 'Register and Record Statement')}
          />
        </View>

        {/* IP Rights Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('IP Rights')}</Text>
          <PolicyLink
            title={t('Intellectual Property & Notice Policy')}
            policyType="ip_notice"
            onPress={() => handlePolicyPress('ip_notice', 'Intellectual Property & Notice Policy')}
          />
          <PolicyLink
            title={t('Intellectual Property Register & Rights Management Statement')}
            policyType="ip_register"
            onPress={() => handlePolicyPress('ip_register', 'IP Register & Rights Management')}
          />
        </View>

        {/* Patents Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Patents')}</Text>
          <PolicyLink
            title={t('RoundBuy patents and pending patents')}
            policyType="patents"
            onPress={() => handlePolicyPress('patents', 'RoundBuy Patents')}
          />
        </View>

        {/* Additional Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Additional information')}</Text>
          <PolicyLink
            title={t('Infrigement Report Policy')}
            policyType="infringement"
            onPress={() => handlePolicyPress('infringement', 'Infringement Report Policy')}
          />
        </View>

        {/* Footer Text */}
        <Text style={styles.footerText}>{t('These legal agreements and notices provide terms and conditions related to specific RoundBuy services.')}</Text>

        {/* Copyright */}
        <Text style={styles.copyright}>{t('© 2020-2026 RoundBuy Inc ®')}</Text>

        <View style={styles.bottomSpacer} />
        <SuggestionsFooter sourceRoute="LegalInfo" />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  policyLinkText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    textDecorationLine: 'underline',
    paddingVertical: 6,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#505050',
    lineHeight: 20,
    marginTop: 12,
    marginBottom: 24,
  },
  copyright: {
    fontSize: 11,
    fontWeight: '400',
    color: '#303234',
    textAlign: 'center',
    marginBottom: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default LegalInfoScreen;