import React, { useEffect, useState } from 'react';
import { IMAGES } from '../../assets/images';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';
import stripeService from '../../services/stripeService';

const CartScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const {
    planId,
    planType = 'Gold',
    planName = 'Gold membership plan',
    planSlug,
    planColor,
    price = 2.00,
    originalPrice,
    taxAmount = 0,
    taxRate = 0,
    currency = 'GBP',
    currencySymbol = '£',
    renewalPrice,
    isDifferentRenewal = false,
    durationDays = 365,
    requiresPlan = false,
    userEmail
  } = route.params || {};

  const [fees, setFees] = useState({
    subtotal: parseFloat(originalPrice || price),
    taxes: parseFloat(taxAmount || (parseFloat(originalPrice || price) * (taxRate / 100))),
    total: parseFloat(price),
    discount: 0
  });
  const [loadingPrice, setLoadingPrice] = useState(true);

  useEffect(() => {
    fetchPrice();
  }, []);

  const fetchPrice = async () => {
    try {
      setLoadingPrice(true);
      // Call backend to get calculated/pro-rated price
      const response = await stripeService.createPaymentIntent({
        planId,
        currencyCode: currency,
        amount: 0 // Backend ignores this and calculates correct amount
      });

      if (response) {
        setFees({
          subtotal: parseFloat(response.original_price || response.amount), // Backend sends original_price (base + tax)
          taxes: 0, // Backend sends total incl. tax in original_price usually, or I can try to extract.
          // Actually createPaymentIntent returns: amount (final), original_price (base+tax), discount.
          // Let's use backend provided values.
          total: parseFloat(response.amount),
          discount: parseFloat(response.discount || 0)
        });
      }
    } catch (error) {
      console.error('Failed to fetch price:', error);
      // Fallback to params
    } finally {
      setLoadingPrice(false);
    }
  };

  const handlePayNow = () => {
    navigation.navigate('PaymentMethod', {
      planId,
      planType,
      planName,
      planSlug,
      total: fees.total,
      subtotal: fees.subtotal,
      taxes: fees.taxes,
      currency,
      currencySymbol,
      requiresPlan,
      userEmail
    });
  };

  const getPlanColor = () => {
    switch (planType) {
      case 'Green': return '#7FD957';
      case 'Gold': return '#FFD700';
      case 'Violet': return '#9B59B6';
      default: return '#FFD700';
    }
  };

  return (
    <SafeScreenContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
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
          <View style={[styles.planColorBox, { backgroundColor: getPlanColor() }]} />
          <View style={styles.cartItemDetails}>
            <Text style={styles.planTypeText}>{planType}</Text>
            <Text style={styles.planDescText}>1 x {planName}</Text>
          </View>
          <Text style={styles.priceText}>{currencySymbol}{price.toFixed(2)}</Text>
        </View>

        {/* Pricing Details */}
        <View style={styles.pricingContainer}>
          {loadingPrice ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
          ) : (
            <>
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>{t('Subtotal')}</Text>
                <Text style={styles.pricingValue}>{currencySymbol}{fees.subtotal.toFixed(2)}</Text>
              </View>

              {fees.discount > 0 && (
                <View style={styles.pricingRow}>
                  <Text style={[styles.pricingLabel, { color: '#4CAF50' }]}>{t('Unused time credit')}</Text>
                  <Text style={[styles.pricingValue, { color: '#4CAF50' }]}>-{currencySymbol}{fees.discount.toFixed(2)}</Text>
                </View>
              )}

              {fees.taxes > 0 && (
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>{t('Taxes')}</Text>
                  <Text style={styles.pricingValue}>{currencySymbol}{fees.taxes.toFixed(2)}</Text>
                </View>
              )}

              <View style={[styles.pricingRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>{t('Total')}</Text>
                <Text style={styles.totalValue}>{currencySymbol}{fees.total.toFixed(2)}</Text>
              </View>
            </>
          )}
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
  },
  backButton: {
    fontSize: 28,
    color: '#000',
    fontWeight: '300',
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
    marginBottom: 24,
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

});

export default CartScreen;