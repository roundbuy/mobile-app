import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StripeProvider, CardField, useStripe } from '@stripe/stripe-react-native';
import { COLORS } from '../../../constants/theme';
import { useTranslation } from '../../../context/TranslationContext';
import stripeService from '../../../services/stripeService';
import api from '../../../services/api';

// ─── Inner screen (must be inside StripeProvider) ─────────────────────────────
const CheckoutContent = ({ navigation, params }) => {
  const { t } = useTranslation();
  const { createPaymentMethod } = useStripe();

  const {
    ad,
    type,
    duration,
    distance,
    planType,
    selectedPlan,
    selectedDistance,
  } = params;

  const resolvedAd       = ad || null;
  const resolvedType     = type || planType || '';
  const resolvedDuration = duration || selectedPlan || {};
  const resolvedDistance = distance || selectedDistance || null;

  // ── Pricing ─────────────────────────────────────────────────────────────────
  const planPrice      = parseFloat(resolvedDuration.discounted_price || resolvedDuration.price || 0);
  const distancePrice  = resolvedDistance ? parseFloat(resolvedDistance.discounted_price || resolvedDistance.price || 0) : 0;
  const subtotal       = planPrice + distancePrice;
  const taxes          = subtotal * 0.135;
  const total          = (subtotal + taxes).toFixed(2);
  const currencyCode   = resolvedDuration.currency_code || 'GBP';
  const currencySymbol = currencyCode === 'GBP' ? '£' : currencyCode === 'USD' ? '$' : currencyCode;

  // ── State ────────────────────────────────────────────────────────────────────
  const [savedCards,   setSavedCards]   = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [zipCode,      setZipCode]      = useState('');
  const [saveCard,     setSaveCard]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [loadingCards, setLoadingCards] = useState(true);
  const [showNewCard,  setShowNewCard]  = useState(false);

  // ── Load saved cards ─────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const cards = await stripeService.getSavedPaymentMethods();
        setSavedCards(cards);
        if (cards.length > 0) {
          setSelectedCard(cards[0].id);
        } else {
          setShowNewCard(true);
        }
      } catch {
        setShowNewCard(true);
      } finally {
        setLoadingCards(false);
      }
    })();
  }, []);

  // ── Payment ──────────────────────────────────────────────────────────────────
  const handlePay = async () => {
    const usingSavedCard = selectedCard && !showNewCard;
    if (!usingSavedCard && !cardComplete) {
      Alert.alert('Card required', 'Please complete your card details.');
      return;
    }
    setLoading(true);
    try {
      // Build the payload — saved cards send their DB id, new cards send the Stripe pm_ id
      const payload = {
        save_card: saveCard,
        type:      resolvedType,
        plan:      resolvedDuration,
        distance:  resolvedDistance,
        ad_id:     resolvedAd?.id || null,
        amount:    total,
        currency:  currencyCode,
      };

      if (usingSavedCard) {
        // selectedCard is the DB row id (integer) — backend resolves provider_payment_method_id
        payload.saved_card_id = selectedCard;
      } else {
        const { paymentMethod, error } = await createPaymentMethod({
          paymentMethodType: 'Card',
          paymentMethodData: {
            billingDetails: { address: { postalCode: zipCode || undefined } },
          },
        });
        if (error) {
          Alert.alert('Card Error', error.message);
          setLoading(false);
          return;
        }
        payload.payment_method_id = paymentMethod.id;
      }

      const res = await api.post('/advertisements/purchase-extension', payload);

      if (res.data?.success) {
        const card = savedCards.find(c => c.id === selectedCard);
        navigation.navigate('VisibilityTransactionSuccess', {
          ad:           resolvedAd,
          type:         resolvedType,
          duration:     resolvedDuration,
          distance:     resolvedDistance,
          total,
          cardLastFour: card?.card?.last4 || res.data?.data?.card_last4 || null,
        });
      } else {
        Alert.alert('Payment failed', res.data?.message || 'Please try again.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Payment failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Saved card item ───────────────────────────────────────────────────────────
  const renderSavedCard = (card) => {
    const isActive = selectedCard === card.id && !showNewCard;
    const brand    = (card.card?.brand || 'CARD').toUpperCase();
    const last4    = card.card?.last4 || '••••';
    const expiry   = card.card
      ? `${String(card.card.exp_month).padStart(2, '0')}/${card.card.exp_year}`
      : '';

    return (
      <TouchableOpacity
        key={card.id}
        style={[styles.savedCard, isActive && styles.savedCardActive]}
        onPress={() => { setSelectedCard(card.id); setShowNewCard(false); }}
        activeOpacity={0.8}
      >
        <View style={styles.savedCardLeft}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandText}>{brand}</Text>
          </View>
          <View>
            <Text style={styles.cardNumber}>•••• {last4}</Text>
            <Text style={styles.cardExpiry}>Expires {expiry}</Text>
          </View>
        </View>
        <View style={[styles.radio, isActive && styles.radioActive]}>
          {isActive && <View style={styles.radioDot} />}
        </View>
      </TouchableOpacity>
    );
  };

  const canPay = (selectedCard && !showNewCard) || (showNewCard && cardComplete);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Order summary */}
        <Text style={styles.sectionTitle}>Order summary</Text>
        <View style={styles.cartCard}>
          <View style={styles.cartIcon}>
            <Ionicons name="flash" size={22} color={COLORS.primary} />
          </View>
          <View style={styles.cartDetails}>
            <Text style={styles.cartTitle}>{resolvedDuration.name || 'Extension & Boosts'}</Text>
            {resolvedAd?.title && <Text style={styles.cartSub}>{resolvedAd.title}</Text>}
            {resolvedDuration.duration_label && <Text style={styles.cartSub}>{resolvedDuration.duration_label}</Text>}
            {resolvedDistance && (
              <Text style={styles.cartSub}>
                {resolvedDistance.is_unlimited ? 'Unlimited distance' : `+${resolvedDistance.distance_km} km`}
              </Text>
            )}
          </View>
          <Text style={styles.cartPrice}>{currencySymbol}{subtotal.toFixed(2)}</Text>
        </View>

        {/* Price breakdown */}
        <View style={styles.breakdown}>
          {distancePrice > 0 && (
            <View style={styles.bRow}>
              <Text style={styles.bLabel}>Distance boost</Text>
              <Text style={styles.bValue}>{currencySymbol}{distancePrice.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.bRow}>
            <Text style={styles.bLabel}>Tax (13.5%)</Text>
            <Text style={styles.bValue}>{currencySymbol}{taxes.toFixed(2)}</Text>
          </View>
          <View style={[styles.bRow, styles.bRowTotal]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{currencySymbol}{total}</Text>
          </View>
        </View>

        {/* Payment */}
        <Text style={styles.sectionTitle}>Payment</Text>

        {loadingCards ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />
        ) : (
          <>
            {savedCards.length > 0 && (
              <View style={styles.savedSection}>
                <Text style={styles.savedLabel}>Saved cards</Text>
                {savedCards.map(renderSavedCard)}
                <TouchableOpacity
                  style={[styles.savedCard, showNewCard && styles.savedCardActive]}
                  onPress={() => { setSelectedCard(null); setShowNewCard(true); }}
                  activeOpacity={0.8}
                >
                  <View style={styles.savedCardLeft}>
                    <View style={[styles.brandBadge, { backgroundColor: '#eee' }]}>
                      <Ionicons name="add" size={16} color="#555" />
                    </View>
                    <Text style={[styles.cardNumber, { color: '#333' }]}>Add new card</Text>
                  </View>
                  <View style={[styles.radio, showNewCard && styles.radioActive]}>
                    {showNewCard && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {showNewCard && (
              <View style={styles.newCardSection}>
                <Text style={styles.fieldLabel}>Card details</Text>
                <CardField
                  postalCodeEnabled={false}
                  placeholders={{ number: '4242 4242 4242 4242' }}
                  cardStyle={{
                    backgroundColor: '#f5f5f5',
                    textColor: '#000',
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: cardComplete ? COLORS.primary : '#e0e0e0',
                  }}
                  style={styles.cardField}
                  onCardChange={(d) => setCardComplete(d.complete)}
                />

                <TouchableOpacity
                  style={styles.saveRow}
                  onPress={() => setSaveCard(!saveCard)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, saveCard && styles.checkboxOn]}>
                    {saveCard && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                  <Text style={styles.saveText}>Save card for future RoundBuy payments</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Pay button */}
        <TouchableOpacity
          style={[styles.payBtn, (!canPay || loading) && styles.payBtnOff]}
          onPress={handlePay}
          disabled={!canPay || loading}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.payBtnText}>Pay {currencySymbol}{total}</Text>
          }
        </TouchableOpacity>

        <View style={styles.secureRow}>
          <Ionicons name="lock-closed" size={13} color="#aaa" />
          <Text style={styles.secureText}>Secured by Stripe</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Outer wrapper — fetches Stripe key, then renders inside StripeProvider ───
const ExtensionCheckoutScreen = ({ navigation, route }) => {
  const [publishableKey, setPublishableKey] = useState('');
  const [keyLoaded,      setKeyLoaded]      = useState(false);

  useEffect(() => {
    stripeService.getStripePublishableKey()
      .then(k => setPublishableKey(k || ''))
      .catch(() => setPublishableKey(''))
      .finally(() => setKeyLoaded(true));
  }, []);

  if (!keyLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <StripeProvider publishableKey={publishableKey || 'pk_test_placeholder'}>
      <CheckoutContent navigation={navigation} params={route.params || {}} />
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  backBtn:     { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },

  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#000', marginBottom: 12, marginTop: 4 },

  // Cart
  cartCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fafafa', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#eee', marginBottom: 16,
  },
  cartIcon: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  cartDetails: { flex: 1 },
  cartTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  cartSub:   { fontSize: 12, color: '#888', marginBottom: 1 },
  cartPrice: { fontSize: 16, fontWeight: '700', color: '#000' },

  // Breakdown
  breakdown: { marginBottom: 24 },
  bRow:  { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  bLabel: { fontSize: 14, color: '#666' },
  bValue: { fontSize: 14, color: '#666' },
  bRowTotal: { borderTopWidth: 1, borderTopColor: '#eee', marginTop: 8, paddingTop: 12 },
  totalLabel: { fontSize: 17, fontWeight: '700', color: '#000' },
  totalValue: { fontSize: 17, fontWeight: '800', color: COLORS.primary },

  // Saved cards
  savedSection: { marginBottom: 16 },
  savedLabel: { fontSize: 13, fontWeight: '600', color: '#888', marginBottom: 10 },
  savedCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderWidth: 1.5, borderColor: '#e0e0e0',
    borderRadius: 12, marginBottom: 10, backgroundColor: '#fafafa',
  },
  savedCardActive: { borderColor: COLORS.primary, backgroundColor: '#F4F6FF' },
  savedCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandBadge: {
    backgroundColor: COLORS.primary, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4, alignItems: 'center', justifyContent: 'center',
  },
  brandText:  { fontSize: 11, fontWeight: '800', color: '#fff' },
  cardNumber: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  cardExpiry: { fontSize: 12, color: '#aaa', marginTop: 1 },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: COLORS.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },

  // New card form
  newCardSection: { marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8 },
  cardField: { width: '100%', height: 50, marginBottom: 14 },

  saveRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: '#ccc', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
  },
  checkboxOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  saveText: { fontSize: 14, color: '#333', flex: 1 },

  // Pay
  payBtn: {
    backgroundColor: COLORS.primary, borderRadius: 28,
    paddingVertical: 16, alignItems: 'center', marginBottom: 12,
  },
  payBtnOff:  { opacity: 0.45 },
  payBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },

  secureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  secureText: { fontSize: 12, color: '#aaa' },
});

export default ExtensionCheckoutScreen;
