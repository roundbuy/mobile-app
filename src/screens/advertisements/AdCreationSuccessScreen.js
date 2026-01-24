import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';

const AdCreationSuccessScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
  const { advertisement } = route.params || {};
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [status, setStatus] = useState('review'); // 'review' or 'published'

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus('published');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-publish after 5 minutes
    const publishTimer = setTimeout(() => {
      setStatus('published');
    }, 300000); // 5 minutes

    return () => {
      clearInterval(timer);
      clearTimeout(publishTimer);
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCheckVisibility = () => {
    navigation.navigate('PurchaseVisibilityScreen');
  };

  const handleGoToMyAds = () => {
    navigation.navigate('MyAds');
  };

  const handleGoToHome = () => {
    navigation.navigate('SearchScreen');
  };

  const getStatusColor = () => {
    return status === 'review' ? '#FF9800' : '#4CAF50';
  };

  const getStatusText = () => {
    return status === 'review' ? 'Under Review' : 'Published';
  };

  const getStatusIcon = () => {
    return status === 'review' ? '⏳' : '✓';
  };

  return (
    <SafeScreenContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('Success!')}</Text>
        </View>

        {/* Success Icon */}
        <View style={styles.successIconContainer}>
          <View style={[styles.successIcon, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.iconText}>{getStatusIcon()}</Text>
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.title}>{t('Advertisement Created Successfully!')}</Text>
          <Text style={styles.subtitle}>
            Your advertisement "{advertisement?.title || 'New Ad'}" has been submitted.
          </Text>

          {advertisement && (
            <View style={styles.adDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('Ad ID:')}</Text>
                <Text style={styles.detailValue}>#{advertisement.id}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('Status:')}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                  <Text style={styles.statusText}>{getStatusText()}</Text>
                </View>
              </View>

              {status === 'review' && (
                <View style={styles.reviewSection}>
                  <View style={styles.timerContainer}>
                    <Text style={styles.timerLabel}>{t('Review Time Remaining:')}</Text>
                    <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
                  </View>
                  <Text style={styles.reviewNote}>{t('Your ad is being reviewed for quality and compliance. It will be automatically published once approved.')}</Text>
                </View>
              )}

              {status === 'published' && (
                <View style={styles.publishedSection}>
                  <Text style={styles.publishedText}>{t('🎉 Your ad is now live and visible to buyers!')}</Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('Created:')}</Text>
                <Text style={styles.detailValue}>
                  {new Date(advertisement.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleCheckVisibility}
          >
            <Text style={styles.primaryButtonText}>{t('Boost Visibility')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleGoToMyAds}
          >
            <Text style={styles.secondaryButtonText}>{t('View My Ads')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.tertiaryButton]}
            onPress={handleGoToHome}
          >
            <Text style={styles.tertiaryButtonText}>{t('Go to Home')}</Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>{t("What's Next?")}</Text>
          {status === 'review' ? (
            <Text style={styles.infoText}>
              • Your ad is currently under review{'\n'}
              • Review typically takes up to 5 minutes{'\n'}
              • You'll receive a notification once published{'\n'}
              • Boost visibility to reach more buyers
            </Text>
          ) : (
            <Text style={styles.infoText}>
              • Your ad is now live and visible{'\n'}
              • Buyers can now see and contact you{'\n'}
              • Boost visibility to reach more buyers{'\n'}
              • Manage your ads from "My Ads" section
            </Text>
          )}
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reviewSection: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 8,
    marginVertical: 12,
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
  },
  timerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E65100',
    fontFamily: 'monospace',
  },
  reviewNote: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  publishedSection: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 8,
    marginVertical: 12,
  },
  publishedText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2E7D32',
    textAlign: 'center',
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
  tertiaryButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tertiaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
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