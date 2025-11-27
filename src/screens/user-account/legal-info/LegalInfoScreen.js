import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';

const LegalInfoScreen = ({ navigation }) => {
  const handleBack = () => {
    navigation.goBack();
  };

  const handlePolicyPress = (policyType, title) => {
    // Future: Navigate to policy detail screen
    console.log('Open policy:', title);
  };

  const handleDownloadPDF = (pdfName) => {
    const pdfUrl = `https://roundbuy.com/legal/${pdfName}.pdf`;
    Linking.openURL(pdfUrl).catch(err => console.error('Failed to open PDF:', err));
  };

  const PolicyLink = ({ title, onPress }) => (
    <TouchableOpacity
      style={styles.policyLink}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.policyLinkText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Legal</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.mainTitle}>Legal Agreements for RoundBuy service</Text>

        {/* Policy Updates Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Policy updates</Text>
          <PolicyLink
            title="View Policy Updates"
            onPress={() => handlePolicyPress('policy_updates', 'Policy Updates')}
          />
        </View>

        {/* All User Agreements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All User Agreements</Text>
          <PolicyLink
            title="Terms & Conditions PDF"
            onPress={() => handleDownloadPDF('terms-conditions')}
          />
          <PolicyLink
            title="Privacy Policy PDF"
            onPress={() => handleDownloadPDF('privacy-policy')}
          />
          <PolicyLink
            title="Cookies Policy PDF"
            onPress={() => handleDownloadPDF('cookies-policy')}
          />
          <PolicyLink
            title="Prohibited & Restricted Items Policy PDF"
            onPress={() => handleDownloadPDF('prohibited-items')}
          />
          <PolicyLink
            title="Seller Business Terms PDF"
            onPress={() => handleDownloadPDF('seller-terms')}
          />
          <PolicyLink
            title="Content & Moderation Policy"
            onPress={() => handlePolicyPress('content_moderation', 'Content & Moderation Policy')}
          />
          <PolicyLink
            title="Subscriptions & Billing Policy"
            onPress={() => handlePolicyPress('subscriptions', 'Subscriptions & Billing Policy')}
          />
          <PolicyLink
            title="Referral & Credits Policy PDF"
            onPress={() => handleDownloadPDF('referral-credits')}
          />
          <PolicyLink
            title="End User License Agreement (EULA) PDF"
            onPress={() => handleDownloadPDF('eula')}
          />
          <PolicyLink
            title="Register and Record Statement PDF"
            onPress={() => handleDownloadPDF('register-record')}
          />
        </View>

        {/* IP Rights Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>IP Rights</Text>
          <PolicyLink
            title="Intellectual Property & Notice Policy"
            onPress={() => handlePolicyPress('ip_notice', 'Intellectual Property & Notice Policy')}
          />
          <PolicyLink
            title="Intellectual Property Register & Rights Management Statement"
            onPress={() => handlePolicyPress('ip_register', 'IP Register & Rights Management')}
          />
        </View>

        {/* Patents Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patents</Text>
          <PolicyLink
            title="RoundBuy patents and pending patents"
            onPress={() => handlePolicyPress('patents', 'RoundBuy Patents')}
          />
        </View>

        {/* Additional Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional information</Text>
          <PolicyLink
            title="Infrigement Report Policy"
            onPress={() => handlePolicyPress('infringement', 'Infringement Report Policy')}
          />
        </View>

        {/* Footer Text */}
        <Text style={styles.footerText}>
          These legal agreements and notices provide terms and conditions related to specific RoundBuy services.
        </Text>

        {/* Copyright */}
        <Text style={styles.copyright}>
          © 2020-2025 RoundBuy Inc ®
        </Text>

        <View style={styles.bottomSpacer} />
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
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 32,
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
  policyLink: {
    paddingVertical: 6,
  },
  policyLinkText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
    lineHeight: 20,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#666',
    lineHeight: 20,
    marginTop: 12,
    marginBottom: 24,
  },
  copyright: {
    fontSize: 11,
    fontWeight: '400',
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default LegalInfoScreen;