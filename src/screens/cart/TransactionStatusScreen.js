import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';

const TransactionStatusScreen = ({ navigation, route }) => {
  const {
    success = true,
    amount = '2.27',
    planType = 'Gold',
    planName = 'Gold membership plan',
    requiresPlan = false,
    userEmail = null
  } = route.params || {};

  const transactionId = success ? `****-****-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}` : null;
  const sessionId = `CHG ${Math.floor(10000 + Math.random() * 90000)}`;
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const formattedTime = currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const handleDone = () => {
    // If coming from registration, navigate to login
    if (requiresPlan && userEmail) {
      navigation.reset({
        index: 0,
        routes: [{
          name: 'SocialLogin',
          params: {
            email: userEmail,
            message: 'Your subscription is active! Please login to continue.'
          }
        }]
      });
    } else {
      // Existing user, go to search
      navigation.reset({
        index: 0,
        routes: [{ name: 'SearchScreen' }]
      });
    }
  };

  const handleTryAgain = () => {
    navigation.goBack();
  };

  if (!success) {
    return (
      <SafeScreenContainer>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Transaction Failed</Text>
          </View>

          {/* Failed Icon */}
          <View style={styles.statusIconContainer}>
            <View style={[styles.statusIcon, styles.failedIcon]}>
              <Text style={styles.iconText}>✕</Text>
            </View>
          </View>

          <Text style={styles.statusTitle}>Payment Unsuccessful</Text>
          
          <View style={styles.failedMessageContainer}>
            <Text style={styles.failedMessage}>
              We were unable to process your payment. Check that all the payment details were correct.
            </Text>
            <Text style={styles.tryAgainText}>Please try again!</Text>
          </View>

          {/* Try Again Button */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleTryAgain}
          >
            <Text style={styles.actionButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </SafeScreenContainer>
    );
  }

  return (
    <SafeScreenContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction Details</Text>
        </View>

        {/* Success Icon */}
        <View style={styles.statusIconContainer}>
          <View style={[styles.statusIcon, styles.successIcon]}>
            <Text style={styles.iconText}>✓</Text>
          </View>
        </View>

        <Text style={styles.statusTitle}>Payment Successful</Text>
        <Text style={styles.statusSubtitle}>CHG {sessionId}</Text>

        {/* Transaction Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Paid to RoundBuy</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID</Text>
            <Text style={styles.detailValue}>8678882373</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Card number</Text>
            <Text style={styles.detailValue}>****-****-****-1232</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>{formattedDate} {formattedTime}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Session ID</Text>
            <Text style={styles.detailValue}>{sessionId}</Text>
          </View>

          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>£{amount}</Text>
          </View>

          <View style={styles.receiptNote}>
            <Text style={styles.receiptText}>
              A copy of this receipt has been sent to your email as a PDF
            </Text>
          </View>
        </View>

        {/* Done Button */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleDone}
        >
          <Text style={styles.actionButtonText}>Done</Text>
        </TouchableOpacity>

        {/* Copyright */}
        <Text style={styles.copyright}>© 2020-2025 RoundBuy Inc ®</Text>

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
  failedIcon: {
    backgroundColor: '#FF6B6B',
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
  failedMessageContainer: {
    paddingHorizontal: 40,
    marginTop: 20,
    marginBottom: 40,
  },
  failedMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  tryAgainText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
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

export default TransactionStatusScreen;