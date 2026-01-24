import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';

const AdTransactionScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
  const { success = true, total = '2.27' } = route.params || {};
  
  const sessionId = `CHG ${Math.floor(10000 + Math.random() * 90000)}`;
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const formattedTime = currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const handleDone = () => {
    navigation.navigate('PublishAd', {
      ...route.params,
    });
  };

  return (
    <SafeScreenContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('Transaction Details')}</Text>
          <Text style={styles.stepIndicator}>7/8</Text>
        </View>

        {/* Success Icon */}
        <View style={styles.statusIconContainer}>
          <View style={[styles.statusIcon, styles.successIcon]}>
            <Text style={styles.iconText}>✓</Text>
          </View>
        </View>

        <Text style={styles.statusTitle}>{t('Payment Successful')}</Text>
        <Text style={styles.statusSubtitle}>{sessionId}</Text>

        {/* Transaction Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>{t('Paid to RoundBuy')}</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('Transaction ID')}</Text>
            <Text style={styles.detailValue}>8678882373</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('Card number')}</Text>
            <Text style={styles.detailValue}>****-****-****-1232</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('Date & Time')}</Text>
            <Text style={styles.detailValue}>{formattedDate} {formattedTime}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('Session ID')}</Text>
            <Text style={styles.detailValue}>{sessionId}</Text>
          </View>

          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>{t('Total Amount')}</Text>
            <Text style={styles.totalValue}>£{total}</Text>
          </View>

          <View style={styles.receiptNote}>
            <Text style={styles.receiptText}>{t('A copy of this receipt has been sent to your email as a PDF')}</Text>
          </View>
        </View>

        {/* Done Button */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleDone}
        >
          <Text style={styles.actionButtonText}>{t('Done')}</Text>
        </TouchableOpacity>

        {/* Copyright */}
        <Text style={styles.copyright}>{t('© 2020-2026 RoundBuy Inc ®')}</Text>

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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    fontSize: 28,
    color: '#000',
    fontWeight: '300',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  stepIndicator: {
    fontSize: 16,
    color: '#666',
  },
  statusIconContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  statusIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    backgroundColor: '#4ECDC4',
  },
  iconText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  statusSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  detailsContainer: {
    backgroundColor: '#FAFAFA',
    marginHorizontal: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderRadius: 12,
    marginBottom: 32,
  },
  detailsTitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  totalRow: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  receiptNote: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  receiptText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  copyright: {
    fontSize: 11,
    fontWeight: '400',
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  bottomSpace: {
    height: 20,
  },
});

export default AdTransactionScreen;