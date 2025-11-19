import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import SafeScreenContainer from '../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../constants/theme';

const LegalAgreementsScreen = ({ navigation }) => {
  const handlePolicyPress = (policyType, title) => {
    navigation.navigate('PolicyDetail', { policyType, title });
  };

  const handleDownloadPDF = (pdfName) => {
    // This would open the PDF in browser or download it
    const pdfUrl = `https://roundbuy.com/legal/${pdfName}.pdf`;
    Linking.openURL(pdfUrl).catch(err => console.error('Failed to open PDF:', err));
  };

  const PolicyLink = ({ title, onPress, isPDF }) => (
    <TouchableOpacity
      style={styles.policyLink}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.policyLinkText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeScreenContainer>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backArrow}>←</Text>
              <Text style={styles.backText}>Legal</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
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
                isPDF={true}
              />
              <PolicyLink
                title="Privacy Policy PDF"
                onPress={() => handleDownloadPDF('privacy-policy')}
                isPDF={true}
              />
              <PolicyLink
                title="Cookies Policy PDF"
                onPress={() => handleDownloadPDF('cookies-policy')}
                isPDF={true}
              />
              <PolicyLink
                title="Prohibited & Restricted Items Policy PDF"
                onPress={() => handleDownloadPDF('prohibited-items')}
                isPDF={true}
              />
              <PolicyLink
                title="Seller Business Terms PDF"
                onPress={() => handleDownloadPDF('seller-terms')}
                isPDF={true}
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
                isPDF={true}
              />
              <PolicyLink
                title="End User License Agreement (EULA) PDF"
                onPress={() => handleDownloadPDF('eula')}
                isPDF={true}
              />
              <PolicyLink
                title="Register and Record Statement PDF"
                onPress={() => handleDownloadPDF('register-record')}
                isPDF={true}
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
                title="Intellectua Property Register & Rights Management Statement"
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
          </View>
        </ScrollView>

        {/* Sticky PDF Download Section */}
        <View style={styles.stickyFooter}>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => handleDownloadPDF('all-documents')}
          >
            <Text style={styles.downloadButtonText}>📄 Download All PDFs</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    paddingVertical: 16,
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH_TARGETS.minHeight,
  },
  backArrow: {
    fontSize: 28,
    fontWeight: '400',
    color: '#1a1a1a',
    marginRight: 8,
    marginTop: -2,
  },
  backText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 4,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 15,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 1,
    letterSpacing: -0.2,
  },
  policyLink: {
    minHeight: 30,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  policyLinkText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#6a6a6a',
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6a6a6a',
    lineHeight: 20,
    marginTop: 12,
    marginBottom: 32,
    letterSpacing: -0.1,
  },
  copyright: {
    fontSize: 11,
    fontWeight: '400',
    color: '#8a8a8a',
    textAlign: 'center',
    letterSpacing: -0.1,
    marginTop: 20,
    marginBottom: 20,
  },
  stickyFooter: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  downloadButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
});

export default LegalAgreementsScreen;