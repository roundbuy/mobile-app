import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';

const VisibilityCartScreen = ({ navigation, route }) => {
  const { ad, type, duration, distance } = route.params;

  const handleBack = () => {
    navigation.goBack();
  };

  // Calculate prices
  const visibilityAdPrice = 7.00;
  const subtotal = parseFloat(distance.price.replace('£', ''));
  const taxes = (subtotal * 0.135).toFixed(2); // 13.5% tax
  const total = (subtotal + parseFloat(taxes)).toFixed(2);

  const handlePayNow = () => {
    navigation.navigate('VisibilityPayment', {
      ad,
      type,
      duration,
      distance,
      total,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/Logo-main.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Your cart */}
        <Text style={styles.cartTitle}>Your cart</Text>

        {/* Cart Item */}
        <View style={styles.cartItem}>
          <View style={styles.visibilityIconContainer}>
            <Ionicons name="eye" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.cartItemDetails}>
            <Text style={styles.itemTitle}>Visibility Ad</Text>
            <Text style={styles.itemDesc}>{ad.title} - {type} ad</Text>
            <Text style={styles.itemDesc}>{duration.label} • {distance.label}</Text>
          </View>
          <Text style={styles.priceText}>£{subtotal.toFixed(2)}</Text>
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
          activeOpacity={0.7}
        >
          <Text style={styles.payButtonText}>Pay now</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
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
  content: {
    flex: 1,
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
  visibilityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cartItemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
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
  bottomSpacer: {
    height: 20,
  },
});

export default VisibilityCartScreen;