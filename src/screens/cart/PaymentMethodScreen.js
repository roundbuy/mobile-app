import stripeService from '../../services/stripeService';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/TranslationContext';

/**
 * Simple Payment Method Screen
 * Uses backend Stripe integration without React Native SDK
 * This avoids the StripeSdk native module requirement
 */
const PaymentMethodScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const {
    planId,
    planType = 'Gold',
    planName = 'Gold membership plan',
    planSlug,
    total = '2.27',
    subtotal,
    taxes,
    currency = 'GBP',
    currencySymbol = '£',
    requiresPlan = false,
    userEmail
  } = route.params || {};

  const { completeRegistration } = useAuth();

  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('US');
  const [saveForFuture, setSaveForFuture] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateCard = () => {
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
      Alert.alert(t('Invalid Card'), t('Please enter a valid card number'));
      return false;
    }
    if (!expiryMonth || !expiryYear) {
      Alert.alert(t('Invalid Expiry'), t('Please enter card expiry date'));
      return false;
    }
    if (!cvc || cvc.length < 3) {
      Alert.alert(t('Invalid CVC'), t('Please enter card CVC'));
      return false;
    }
    if (!zipCode) {
      Alert.alert(t('Missing ZIP'), t('Please enter your ZIP/Postal code'));
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateCard()) {
      return;
    }

    setLoading(true);
    try {
      // 1. Create Payment Method via Backend (Server-side tokenization)
      const paymentMethodId = await stripeService.createPaymentMethod({
        number: cardNumber.replace(/\s/g, ''),
        exp_month: parseInt(expiryMonth),
        exp_year: parseInt(expiryYear),
        cvc: cvc
      });

      // 2. Confirm Subscription with Backend using paymentMethodId
      const response = await stripeService.confirmPaymentAndSubscribe({
        planId: planId,
        currencyCode: currency,
        paymentMethodId: paymentMethodId,
        savePaymentMethod: saveForFuture,
        country: country,
        zipCode: zipCode
      });

      console.log('✅ Subscription created:', response);

      // Handle successful payment
      if (requiresPlan && completeRegistration) {
        // Complete registration flow
        await completeRegistration({
          email: userEmail,
          subscription_plan_id: planId,
          subscription_plan_name: planName,
          subscription_plan_slug: planSlug,
          subscription_start_date: response.subscription.start_date,
          subscription_end_date: response.subscription.end_date,
          has_active_subscription: true,
          requires_subscription: false
        });

        Alert.alert(
          t('Welcome to RoundBuy!'),
          `Your ${planType} plan has been activated successfully!`,
          [{
            text: t('Start Browsing'),
            onPress: () => navigation.replace('Main')
          }]
        );
      } else {
        // Regular subscription purchase
        navigation.navigate('TransactionStatus', {
          success: true,
          amount: total,
          planType,
          planName,
          transactionId: response.transaction.id,
        });
      }
    } catch (error) {
      setLoading(false);
      console.error('Payment error:', error);

      let errorMessage = 'Unable to process payment. Please try again.';
      if (error.message?.includes('card')) {
        errorMessage = 'Card payment failed. Please check your card details.';
      } else if (error.message?.includes('insufficient')) {
        errorMessage = 'Insufficient funds. Please use a different card.';
      }

      Alert.alert(t('Payment Failed'), errorMessage);
    }
  };

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted);
  };

  return (
    <SafeScreenContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('Payment Details')}</Text>
        </View>

        {/* Plan Summary */}
        <View style={styles.planSummary}>
          <Text style={styles.planSummaryTitle}>{t('Order Summary')}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{planName}</Text>
            <Text style={styles.summaryValue}>{currencySymbol}{parseFloat(subtotal || total).toFixed(2)}</Text>
          </View>
          {taxes > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('Taxes')}</Text>
              <Text style={styles.summaryValue}>{currencySymbol}{parseFloat(taxes).toFixed(2)}</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>{t('Total')}</Text>
            <Text style={styles.totalValue}>{currencySymbol}{parseFloat(total).toFixed(2)}</Text>
          </View>
        </View>

        {/* Card Information */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>{t('Card Information')}</Text>

          {/* Card Number - Full Width */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('Card number')}
              placeholderTextColor="#999"
              value={cardNumber}
              onChangeText={formatCardNumber}
              keyboardType="numeric"
              maxLength={19}
            />
          </View>


          {/* Expiry and CVC - Same Row */}
          <View style={styles.rowInputs}>
            <View style={[styles.inputContainer, styles.rowInput]}>
              <TextInput
                style={styles.input}
                placeholder={t('MM')}
                placeholderTextColor="#999"
                value={expiryMonth}
                onChangeText={setExpiryMonth}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>

            <View style={[styles.inputContainer, styles.rowInput]}>
              <TextInput
                style={styles.input}
                placeholder={t('YY')}
                placeholderTextColor="#999"
                value={expiryYear}
                onChangeText={setExpiryYear}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>

            <View style={[styles.inputContainer, styles.rowInput]}>
              <TextInput
                style={styles.input}
                placeholder={t('CVC')}
                placeholderTextColor="#999"
                value={cvc}
                onChangeText={setCvc}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>
        </View>

        {/* Billing Details */}
        <View style={styles.billingSection}>
          <Text style={styles.sectionTitle}>{t('Billing Details')}</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('ZIP / Postal Code')}
              placeholderTextColor="#999"
              value={zipCode}
              onChangeText={setZipCode}
              keyboardType="default"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('Country')}
              placeholderTextColor="#999"
              value={country}
              onChangeText={setCountry}
            />
          </View>
        </View>

        {/* Save for Future */}
        <TouchableOpacity
          style={styles.saveForFutureContainer}
          onPress={() => setSaveForFuture(!saveForFuture)}
        >
          <Text style={styles.saveForFutureText}>{t('Save card for future payments')}</Text>
          <View style={[styles.checkbox, saveForFuture && styles.checkboxChecked]}>
            {saveForFuture && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>

        {/* Pay Button */}
        <TouchableOpacity
          style={[
            styles.payButton,
            loading && styles.payButtonDisabled
          ]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.payButtonText}>
              Pay {currencySymbol}{parseFloat(total).toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>

        {/* Security Notice */}
        <Text style={styles.securityText}>{t('🔒 Secured by Stripe. Your payment information is encrypted and secure.')}</Text>

        {/* Test Card Info */}
        <View style={styles.testCardInfo}>
          <Text style={styles.testCardTitle}>{t('Test Card (Development)')}</Text>
          <Text style={styles.testCardText}>{t('Card: 4242 4242 4242 4242')}</Text>
          <Text style={styles.testCardText}>{t('Expiry: 12/25 | CVC: 123')}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  closeButton: {
    fontSize: 24,
    color: '#000',
    marginRight: 16,
    fontWeight: '400',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  planSummary: {
    backgroundColor: '#F8F9FA',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  planSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#666',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  cardSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  inputContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    paddingVertical: 14,
    fontSize: 15,
    color: '#000',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  rowInput: {
    flex: 1,
    marginBottom: 12,
  },
  billingSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  saveForFutureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  saveForFutureText: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  payButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  payButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.7,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  securityText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 16,
  },
  testCardInfo: {
    backgroundColor: '#FFF3CD',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  testCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  testCardText: {
    fontSize: 11,
    color: '#856404',
  },
  bottomSpace: {
    height: 30,
  },
});

export default PaymentMethodScreen;
