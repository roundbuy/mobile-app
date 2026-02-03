import React from 'react';
import { IMAGES } from '../../assets/images';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';
import { rewardsService } from '../../services/rewardsService';
import { useState } from 'react';

const AdCartScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [referrerName, setReferrerName] = useState('');

  const planType = 'Gold';
  const planName = 'membership plan';
  const price = 2.00;
  const subtotal = price;
  const taxes = (price * 0.135).toFixed(2);
  const total = (parseFloat(price) + parseFloat(taxes)).toFixed(2);

  const validatePromo = async (code) => {
    if (!code) {
      setPromoError('');
      setReferrerName('');
      setDiscountApplied(false);
      return;
    }

    try {
      const result = await rewardsService.validateReferralCode(code);
      if (result.isValid) {
        setReferrerName(result.referrerName);
        setPromoError('');
        setDiscountApplied(true); // Just visual for now
      } else {
        setPromoError(t('Invalid code'));
        setReferrerName('');
        setDiscountApplied(false);
      }
    } catch (error) {
      setPromoError(t('Invalid code'));
    }
  };

  const handlePromoChange = (text) => {
    setPromoCode(text);
    if (text.length >= 6) {
      validatePromo(text);
    } else {
      setPromoError('');
      setReferrerName('');
      setDiscountApplied(false);
    }
  };

  const handlePayNow = () => {
    navigation.navigate('AdTransaction', {
      ...route.params,
      total,
      planType,
      planName,
      success: true,
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
          {/* <Text style={styles.stepIndicator}>6/8</Text> */}
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={IMAGES.logoMain}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Your Cart */}
        <Text style={styles.cartTitle}>{t('Your cart')}</Text>

        {/* Cart Item */}
        <View style={styles.cartItem}>
          <View style={[styles.planColorBox, { backgroundColor: '#FFD700' }]} />
          <View style={styles.cartItemDetails}>
            <Text style={styles.planTypeText}>{planType}</Text>
            <Text style={styles.planDescText}>1 x {planName}</Text>
          </View>
          <Text style={styles.priceText}>£{price.toFixed(2)}</Text>
        </View>

        {/* Step Indicator */}
        <Text style={styles.stepText}>7/9</Text>

        {/* Promo Code Input */}
        <View style={styles.promoContainer}>
          <Text style={styles.promoLabel}>{t('Promo / Referral Code')}</Text>
          <View style={styles.promoInputWrapper}>
            <TextInput
              style={[styles.promoInput, promoError ? { borderColor: 'red', borderWidth: 1 } : null]}
              placeholder={t('Enter code')}
              value={promoCode}
              onChangeText={handlePromoChange}
              autoCapitalize="characters"
            />
            {discountApplied && (
              <View style={styles.appliedBadge}>
                <Text style={styles.appliedText}>{t('Applied')}</Text>
              </View>
            )}
          </View>
          {promoError ? (
            <Text style={styles.errorText}>{promoError}</Text>
          ) : referrerName ? (
            <Text style={styles.successText}>{t('Referred by:')} {referrerName}</Text>
          ) : null}
        </View>

        {/* Pricing Details */}
        <View style={styles.pricingContainer}>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>{t('Subtotal')}</Text>
            <Text style={styles.pricingValue}>£{subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>{t('Taxes')}</Text>
            <Text style={styles.pricingValue}>£{taxes}</Text>
          </View>

          <View style={[styles.pricingRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>{t('Total')}</Text>
            <Text style={styles.totalValue}>£{total}</Text>
          </View>
        </View>

        {/* Payment Method Section */}
        <View style={styles.paymentMethodSection}>
          <Text style={styles.paymentMethodTitle}>{t('Payment method')}</Text>
        </View>

        {/* Pay Now Button */}
        <TouchableOpacity
          style={styles.payButton}
          onPress={handlePayNow}
        >
          <Text style={styles.payButtonText}>{t('Pay now')}</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    fontSize: 28,
    color: '#000',
    fontWeight: '300',
  },
  stepIndicator: {
    fontSize: 16,
    color: '#666',
  },
  logoContainer: {
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 30,
  },
  logo: {
    width: 160,
    height: 70,
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FAFAFA',
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  planColorBox: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
  },
  cartItemDetails: {
    flex: 1,
  },
  planTypeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  planDescText: {
    fontSize: 13,
    color: '#666',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  pricingContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pricingLabel: {
    fontSize: 15,
    color: '#666',
  },
  pricingValue: {
    fontSize: 15,
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
  paymentMethodSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  payButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpace: {
    height: 30,
  },
  promoContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  promoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  promoInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  promoInput: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: '#000',
  },
  appliedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  appliedText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default AdCartScreen;