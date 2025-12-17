import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';
import paddleService from '../../services/paddleService';

const PaymentMethodScreen = ({ navigation, route }) => {
  const { total = '2.27', planType = 'Gold', planName = 'Gold membership plan', planId } = route.params || {};
  const [selectedPayment, setSelectedPayment] = useState('paddle');
  const [cardNumber, setCardNumber] = useState('');
  const [cvc, setCvc] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [saveForFuture, setSaveForFuture] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paddleInitialized, setPaddleInitialized] = useState(false);

  useEffect(() => {
    // Initialize Paddle when component mounts
    initializePaddle();
  }, []);

  const initializePaddle = async () => {
    try {
      await paddleService.initPaddle();
      setPaddleInitialized(true);
      console.log('Paddle initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Paddle:', error);
      Alert.alert(
        'Payment System Error',
        'Unable to initialize payment system. Please try again later.'
      );
    }
  };

  const handlePaddlePayment = async () => {
    if (!paddleInitialized) {
      Alert.alert('Error', 'Payment system is not ready. Please wait...');
      return;
    }

    if (!planId) {
      Alert.alert('Error', 'Plan information is missing. Please try again.');
      return;
    }

    setLoading(true);
    try {
      // Create transaction and get checkout URL
      const transaction = await paddleService.createTransaction(planId, 'USD');
      
      // Open Paddle checkout
      await paddleService.openCheckout(transaction.transaction_id);
      
      // Poll for transaction status
      setTimeout(async () => {
        try {
          const status = await paddleService.getTransactionStatus(transaction.transaction_id);
          
          if (status.status === 'completed' || status.status === 'paid') {
            navigation.navigate('TransactionStatus', {
              success: true,
              amount: total,
              planType,
              planName,
              transactionId: transaction.transaction_id,
            });
          } else if (status.status === 'failed') {
            navigation.navigate('TransactionStatus', {
              success: false,
              amount: total,
              planType,
              planName,
            });
          }
        } catch (error) {
          console.error('Error checking transaction status:', error);
        }
        setLoading(false);
      }, 3000);
    } catch (error) {
      setLoading(false);
      console.error('Payment error:', error);
      Alert.alert(
        'Payment Failed',
        error.message || 'Unable to process payment. Please try again.'
      );
    }
  };

  const handleContinue = () => {
    if (selectedPayment === 'paddle') {
      handlePaddlePayment();
    } else {
      // For other payment methods (demo mode)
      const isSuccess = Math.random() > 0.3; // 70% success rate
      
      navigation.navigate('TransactionStatus', {
        success: isSuccess,
        amount: total,
        planType,
        planName,
      });
    }
  };

  return (
    <SafeScreenContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose a payment method</Text>
        </View>

        {/* Paddle Payment (Recommended) */}
        <TouchableOpacity
          style={[
            styles.paymentOption,
            selectedPayment === 'paddle' && styles.paymentOptionSelected
          ]}
          onPress={() => setSelectedPayment('paddle')}
          disabled={!paddleInitialized}
        >
          <View style={styles.paddleIcon}>
            <Text style={styles.paddleText}>P</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.paymentText}>Pay with Paddle</Text>
            <Text style={styles.recommendedText}>Recommended • Secure</Text>
          </View>
          {!paddleInitialized && <ActivityIndicator size="small" color={COLORS.primary} />}
        </TouchableOpacity>

        {/* Google Pay */}
        <TouchableOpacity
          style={[
            styles.paymentOption,
            selectedPayment === 'googlepay' && styles.paymentOptionSelected
          ]}
          onPress={() => setSelectedPayment('googlepay')}
        >
          <View style={styles.googlePayIcon}>
            <Text style={styles.googleText}>G</Text>
          </View>
          <Text style={styles.paymentText}>Pay</Text>
        </TouchableOpacity>

        {/* Or pay using */}
        <Text style={styles.orText}>Or pay with card</Text>

        {/* Payment Method Icons */}
        <View style={styles.paymentIcons}>
          <TouchableOpacity 
            style={[
              styles.iconButton,
              selectedPayment === 'card' && styles.iconButtonSelected
            ]}
            onPress={() => setSelectedPayment('card')}
          >
            <View style={styles.cardIcon}>
              <View style={styles.cardStripe} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.iconButton,
              selectedPayment === 'klarna' && styles.iconButtonSelected
            ]}
            onPress={() => setSelectedPayment('klarna')}
          >
            <View style={styles.klarnaIcon}>
              <Text style={styles.klarnaText}>K</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.iconButton,
              selectedPayment === 'paypal' && styles.iconButtonSelected
            ]}
            onPress={() => setSelectedPayment('paypal')}
          >
            <View style={styles.paypalIcon}>
              <Text style={styles.paypalText}>P</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.iconButton,
              selectedPayment === 'bank' && styles.iconButtonSelected
            ]}
            onPress={() => setSelectedPayment('bank')}
          >
            <View style={styles.bankIcon} />
          </TouchableOpacity>
        </View>

        {/* Card Information */}
        <View style={styles.cardInfoSection}>
          <Text style={styles.sectionTitle}>Card information</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Card number"
              placeholderTextColor="#999"
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="numeric"
            />
            <View style={styles.cardIconSmall} />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 12 }]}>
              <TextInput
                style={styles.input}
                placeholder="Card number"
                placeholderTextColor="#999"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputContainer, { width: 100 }]}>
              <TextInput
                style={styles.input}
                placeholder="CVC"
                placeholderTextColor="#999"
                value={cvc}
                onChangeText={setCvc}
                keyboardType="numeric"
                maxLength={3}
              />
              <View style={styles.cvcIcon} />
            </View>
          </View>
        </View>

        {/* Country or Region */}
        <View style={styles.countrySection}>
          <Text style={styles.sectionTitle}>Country or region</Text>
          
          <View style={styles.countryInput}>
            <Text style={styles.countryText}>United Kingdom</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="ZIP"
              placeholderTextColor="#999"
              value={zipCode}
              onChangeText={setZipCode}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Save for Future */}
        <TouchableOpacity 
          style={styles.saveForFutureContainer}
          onPress={() => setSaveForFuture(!saveForFuture)}
        >
          <Text style={styles.saveForFutureText}>
            Save for future RoundBuy payments
          </Text>
          <View style={[styles.checkbox, saveForFuture && styles.checkboxChecked]}>
            {saveForFuture && <Text style={styles.checkmark}>✕</Text>}
          </View>
        </TouchableOpacity>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            loading && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={loading || (selectedPayment === 'paddle' && !paddleInitialized)}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.continueButtonText}>
              {selectedPayment === 'paddle' ? 'Pay with Paddle' : 'Continue'}
            </Text>
          )}
        </TouchableOpacity>

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
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F8FF',
  },
  paddleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paddleText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  recommendedText: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
    fontWeight: '500',
  },
  googlePayIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  googleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  paymentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  orText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  paymentIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  iconButton: {
    width: 70,
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconButtonSelected: {
    borderColor: COLORS.primary,
  },
  cardIcon: {
    width: 32,
    height: 24,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cardStripe: {
    height: 4,
    backgroundColor: '#999',
    borderRadius: 2,
  },
  klarnaIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFB3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  klarnaText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  paypalIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#B4E96D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paypalText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bankIcon: {
    width: 32,
    height: 24,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  cardInfoSection: {
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#000',
  },
  inputRow: {
    flexDirection: 'row',
  },
  cardIconSmall: {
    width: 24,
    height: 18,
    backgroundColor: '#D0D0D0',
    borderRadius: 3,
  },
  cvcIcon: {
    width: 24,
    height: 18,
    backgroundColor: '#D0D0D0',
    borderRadius: 3,
  },
  countrySection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  countryInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  countryText: {
    fontSize: 15,
    color: '#000',
  },
  saveForFutureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  saveForFutureText: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  checkmark: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 20,
  continueButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.7,
  },
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpace: {
    height: 30,
  },
});

export default PaymentMethodScreen;