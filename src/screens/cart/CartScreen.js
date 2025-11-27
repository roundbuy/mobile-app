import React from 'react';
import { IMAGES } from '../../assets/images';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';

const CartScreen = ({ navigation, route }) => {
  const { planType = 'Gold', planName = 'Gold membership plan', price = 2.00 } = route.params || {};
  
  const subtotal = price;
  const taxes = (price * 0.135).toFixed(2); // 13.5% tax
  const total = (parseFloat(price) + parseFloat(taxes)).toFixed(2);

  const handlePayNow = () => {
    navigation.navigate('PaymentMethod', { total, planType, planName });
  };

  const getPlanColor = () => {
    switch(planType) {
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
        <Text style={styles.cartTitle}>Your cart</Text>

        {/* Cart Item */}
        <View style={styles.cartItem}>
          <View style={[styles.planColorBox, { backgroundColor: getPlanColor() }]} />
          <View style={styles.cartItemDetails}>
            <Text style={styles.planTypeText}>{planType}</Text>
            <Text style={styles.planDescText}>1 x {planName}</Text>
          </View>
          <Text style={styles.priceText}>£{price.toFixed(2)}</Text>
        </View>

        {/* Pricing Details */}
        <View style={styles.pricingContainer}>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Subtotal</Text>
            <Text style={styles.pricingValue}>£{subtotal.toFixed(2)}</Text>
          </View>
          
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Taxes</Text>
            <Text style={styles.pricingValue}>£{taxes}</Text>
          </View>
          
          <View style={[styles.pricingRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>£{total}</Text>
          </View>
        </View>

        {/* Payment Method Section */}
        <View style={styles.paymentMethodSection}>
          <Text style={styles.paymentMethodTitle}>Payment method</Text>
        </View>

        {/* Pay Now Button */}
        <TouchableOpacity 
          style={styles.payButton}
          onPress={handlePayNow}
        >
          <Text style={styles.payButtonText}>Pay now</Text>
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