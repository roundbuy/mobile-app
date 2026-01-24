import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import WalletPaymentOption from '../../components/WalletPaymentOption';
import { COLORS } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';

const AdPaymentMethodScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [saveForFuture, setSaveForFuture] = useState(false);

  // Get amount from route params if available
  const amount = route.params?.amount || 0;

  const handleContinue = () => {
    navigation.navigate('AdCart', {
      ...route.params,
      paymentMethod: selectedPayment,
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
          <Text style={styles.headerTitle}>{t('Choose a payment method')}</Text>
          <Text style={styles.stepIndicator}>5/8</Text>
        </View>

        {/* Wallet Payment Option */}
        <View style={styles.walletSection}>
          <WalletPaymentOption
            selected={selectedPayment === 'wallet'}
            onSelect={() => setSelectedPayment('wallet')}
            amount={amount}
            showBalance={true}
          />
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t('OR')}</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Pay using */}
        <Text style={styles.orText}>{t('Pay using card')}</Text>

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
        </View>


        {/* Card Information - Only show when card is selected */}
        {selectedPayment === 'card' && (
          <>
            <View style={styles.cardInfoSection}>
              <Text style={styles.sectionTitle}>{t('Card information')}</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={t('Card number')}
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
                    placeholder={t('Expiry date')}
                    placeholderTextColor="#999"
                    value={expiryDate}
                    onChangeText={setExpiryDate}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputContainer, { width: 100 }]}>
                  <TextInput
                    style={styles.input}
                    placeholder={t('CVC')}
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
              <Text style={styles.sectionTitle}>{t('Country or region')}</Text>

              <View style={styles.countryInput}>
                <Text style={styles.countryText}>{t('United Kingdom')}</Text>
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={t('ZIP')}
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
              <Text style={styles.saveForFutureText}>{t('Save for future RoundBuy payments')}</Text>
              <View style={[styles.checkbox, saveForFuture && styles.checkboxChecked]}>
                {saveForFuture && <Text style={styles.checkmark}>✕</Text>}
              </View>
            </TouchableOpacity>
          </>
        )}

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>{t('Continue')}</Text>
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
  backButton: {
    fontSize: 28,
    color: '#000',
    marginRight: 16,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  stepIndicator: {
    fontSize: 16,
    color: '#666',
  },
  walletSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    fontSize: 14,
    color: '#999',
    marginHorizontal: 16,
    fontWeight: '500',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 24,
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

export default AdPaymentMethodScreen;