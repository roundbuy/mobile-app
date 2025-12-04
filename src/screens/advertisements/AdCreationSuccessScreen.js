import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';

const AdCreationSuccessScreen = ({ navigation, route }) => {
  const { advertisement } = route.params || {};

  const handleCheckVisibility = () => {
    navigation.navigate('PurchaseVisibilityScreen');
  };

  const handleGoToMyAds = () => {
    navigation.navigate('MyAds');
  };

  return (
    <SafeScreenContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Success!</Text>
        </View>

        {/* Success Icon */}
        <View style={styles.successIconContainer}>
          <View style={styles.successIcon}>
            <Text style={styles.iconText}>✓</Text>
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.title}>Advertisement Created Successfully!</Text>
          <Text style={styles.subtitle}>
            Your advertisement "{advertisement?.title || 'New Ad'}" has been saved and is ready to be published.
          </Text>

          {advertisement && (
            <View style={styles.adDetails}>
              <Text style={styles.detailLabel}>Ad ID:</Text>
              <Text style={styles.detailValue}>#{advertisement.id}</Text>

              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={[styles.detailValue, styles.statusDraft]}>Draft</Text>

              <Text style={styles.detailLabel}>Created:</Text>
              <Text style={styles.detailValue}>
                {new Date(advertisement.created_at).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleCheckVisibility}
          >
            <Text style={styles.primaryButtonText}>Check Visibility Plans</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleGoToMyAds}
          >
            <Text style={styles.secondaryButtonText}>View My Ads</Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>What's Next?</Text>
          <Text style={styles.infoText}>
            • Your ad is currently in draft mode{'\n'}
            • Purchase visibility to make it live{'\n'}
            • Choose from various visibility plans{'\n'}
            • Your ad will be visible to potential buyers
          </Text>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  successIconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 60,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  messageContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  adDetails: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginTop: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    marginBottom: 12,
  },
  statusDraft: {
    color: '#FF9800',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },
  infoSection: {
    backgroundColor: '#F8F9FA',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  bottomSpace: {
    height: 30,
  },
});

export default AdCreationSuccessScreen;