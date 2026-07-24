import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  StripeProvider,
  CardField,
  useStripe,
} from '@stripe/stripe-react-native';
import { COLORS } from '../../../constants/theme';
import GlobalHeader from '../../../components/GlobalHeader';
import SuggestionsFooter from '../../../components/SuggestionsFooter';
import api from '../../../services/api';
import stripeService from '../../../services/stripeService';

const BRAND_COLORS = {
  visa:       '#1A1F71',
  mastercard: '#EB001B',
  amex:       '#2E77BC',
  discover:   '#FF6600',
  default:    '#555',
};

const brandLabel = (brand = '') => brand.toUpperCase().replace('MASTERCARD', 'MC');

// ─── Inner component (inside StripeProvider) ──────────────────────────────────
const BillingContent = ({ navigation }) => {
  const { confirmSetupIntent } = useStripe();

  const [cards,       setCards]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [adding,      setAdding]      = useState(false);     // show add-card form
  const [saving,      setSaving]      = useState(false);     // spinner while saving
  const [removing,    setRemoving]    = useState(null);      // id being removed
  const [cardOk,      setCardOk]      = useState(false);     // CardField complete
  const [setDefault,  setSetDefault]  = useState(false);

  // Pulse animation for the "processing" state
  const pulse = new Animated.Value(1);
  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.6, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,   duration: 600, useNativeDriver: true }),
      ])
    ).start();
  };

  const loadCards = useCallback(async () => {
    setLoading(true);
    try {
      const methods = await stripeService.getSavedPaymentMethods();
      setCards(methods);
    } catch {
      // silent — shows empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCards(); }, [loadCards]);

  // ── Add card via SetupIntent ───────────────────────────────────────────────
  const handleSaveCard = async () => {
    if (!cardOk) {
      Alert.alert('Incomplete', 'Please enter all card details.');
      return;
    }
    setSaving(true);
    startPulse();
    try {
      // 1. Get a SetupIntent client_secret from backend
      const setupRes = await api.post('/subscription/create-setup-intent');
      if (!setupRes.data?.success) throw new Error(setupRes.data?.message || 'Setup failed');
      const clientSecret = setupRes.data.data.client_secret;

      // 2. Confirm the SetupIntent with the CardField — Stripe handles mandate
      const { setupIntent, error } = await confirmSetupIntent(clientSecret, {
        paymentMethodType: 'Card',
      });
      if (error) throw new Error(error.message);

      // 3. Tell backend to persist the confirmed payment method
      await api.post('/subscription/save-payment-method', {
        payment_method_id: setupIntent.paymentMethodId,
        set_as_default: setDefault || cards.length === 0,
      });

      await loadCards();
      setAdding(false);
      setCardOk(false);
      setSetDefault(false);
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not save card');
    } finally {
      setSaving(false);
    }
  };

  // ── Remove card ────────────────────────────────────────────────────────────
  const handleRemove = (card) => {
    Alert.alert(
      'Remove card',
      `Remove •••• ${card.last_four}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRemoving(card.id);
            try {
              await api.delete(`/subscription/payment-methods/${card.id}`);
              await loadCards();
            } catch {
              Alert.alert('Error', 'Could not remove card');
            } finally {
              setRemoving(null);
            }
          },
        },
      ]
    );
  };

  // ── Set default card ───────────────────────────────────────────────────────
  const handleSetDefault = async (card) => {
    try {
      await api.put(`/subscription/payment-methods/${card.id}/default`);
      await loadCards();
    } catch {
      Alert.alert('Error', 'Could not update default card');
    }
  };

  // ── Card brand colour ──────────────────────────────────────────────────────
  const brandColor = (brand = '') => BRAND_COLORS[brand.toLowerCase()] || BRAND_COLORS.default;

  // ─── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Saved cards ── */}
      {cards.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Saved cards</Text>

          {cards.map((card) => (
            <View
              key={card.id}
              style={[styles.cardRow, card.is_default && styles.cardRowDefault]}
            >
              {/* Brand badge */}
              <View style={[styles.brandBadge, { backgroundColor: brandColor(card.card_brand) }]}>
                <Text style={styles.brandText}>{brandLabel(card.card_brand)}</Text>
              </View>

              {/* Details */}
              <View style={styles.cardDetails}>
                <Text style={styles.cardNumber}>•••• •••• •••• {card.last_four}</Text>
                <Text style={styles.cardExpiry}>
                  Expires {String(card.expiry_month).padStart(2, '0')}/{card.expiry_year}
                </Text>
              </View>

              {/* Badges + actions */}
              <View style={styles.cardActions}>
                {card.is_default ? (
                  <View style={styles.defaultPill}>
                    <Text style={styles.defaultPillText}>Default</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleSetDefault(card)}
                    style={styles.setDefaultBtn}
                  >
                    <Text style={styles.setDefaultText}>Set default</Text>
                  </TouchableOpacity>
                )}

                {removing === card.id ? (
                  <ActivityIndicator size="small" color="#ff3b30" style={{ marginTop: 6 }} />
                ) : (
                  <TouchableOpacity onPress={() => handleRemove(card)} style={styles.removeBtn}>
                    <Ionicons name="trash-outline" size={18} color="#ff3b30" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* ── Empty state ── */}
      {cards.length === 0 && !adding && (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="card-outline" size={36} color="#ccc" />
          </View>
          <Text style={styles.emptyTitle}>No payment method</Text>
          <Text style={styles.emptySub}>
            Add a card to enable one-tap payments across RoundBuy.
          </Text>
        </View>
      )}

      {/* ── Mandate notice (always shown if not adding) ── */}
      {!adding && (
        <View style={styles.mandateBox}>
          <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.primary} style={{ marginTop: 1 }} />
          <Text style={styles.mandateText}>
            RoundBuy will charge your default card automatically for future purchases — no card entry needed each time.
          </Text>
        </View>
      )}

      {/* ── Add card button ── */}
      {!adding && (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setAdding(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.addBtnText}>Add payment method</Text>
        </TouchableOpacity>
      )}

      {/* ── Add card form ── */}
      {adding && (
        <View style={styles.addForm}>
          <Text style={styles.sectionLabel}>New card</Text>

          <CardField
            postalCodeEnabled={false}
            placeholders={{ number: '4242 4242 4242 4242' }}
            cardStyle={{
              backgroundColor: '#f8f8f8',
              textColor: '#000',
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: cardOk ? COLORS.primary : '#e0e0e0',
              placeholderColor: '#bbb',
            }}
            style={styles.cardField}
            onCardChange={(d) => setCardOk(d.complete)}
          />

          {/* Set as default toggle */}
          {cards.length > 0 && (
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setSetDefault(!setDefault)}
              activeOpacity={0.7}
            >
              <View style={[styles.toggle, setDefault && styles.toggleOn]}>
                {setDefault && <Ionicons name="checkmark" size={13} color="#fff" />}
              </View>
              <Text style={styles.toggleLabel}>Set as default payment method</Text>
            </TouchableOpacity>
          )}

          {/* Mandate consent text */}
          <View style={styles.consentBox}>
            <Ionicons name="information-circle-outline" size={16} color="#888" />
            <Text style={styles.consentText}>
              By adding this card you authorise RoundBuy to charge it for future purchases without asking for card details again. You can remove it at any time.
            </Text>
          </View>

          {/* Supported networks */}
          <View style={styles.networkRow}>
            {['VISA', 'MC', 'AMEX'].map((n) => (
              <View
                key={n}
                style={[styles.networkBadge, { backgroundColor: n === 'VISA' ? '#1A1F71' : n === 'MC' ? '#EB001B' : '#2E77BC' }]}
              >
                <Text style={styles.networkText}>{n}</Text>
              </View>
            ))}
          </View>

          {/* Save / Cancel */}
          <TouchableOpacity
            style={[styles.saveBtn, (!cardOk || saving) && styles.saveBtnOff]}
            onPress={handleSaveCard}
            disabled={!cardOk || saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <View style={styles.savingRow}>
                <Animated.View style={{ opacity: pulse }}>
                  <Ionicons name="lock-closed" size={18} color="#fff" />
                </Animated.View>
                <Text style={styles.saveBtnText}>Securing card...</Text>
              </View>
            ) : (
              <Text style={styles.saveBtnText}>Save card</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => { setAdding(false); setCardOk(false); setSetDefault(false); }}
            disabled={saving}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <View style={styles.secureRow}>
            <Ionicons name="lock-closed" size={12} color="#aaa" />
            <Text style={styles.secureText}>Secured by Stripe · PCI DSS compliant</Text>
          </View>
        </View>
      )}

      {/* ── Future payment hint (when cards exist) ── */}
      {cards.length > 0 && !adding && (
        <View style={styles.hintBox}>
          <Ionicons name="flash" size={16} color={COLORS.primary} />
          <Text style={styles.hintText}>
            Next time you pay, we'll use your default card automatically — no details needed.
          </Text>
        </View>
      )}

      <View style={{ height: 48 }} />
    </ScrollView>
  );
};

// ─── Outer wrapper — fetches Stripe key then renders ─────────────────────────
const BillingPaymentsScreen = ({ navigation }) => {
  const [publishableKey, setPublishableKey] = useState('');
  const [keyReady,       setKeyReady]       = useState(false);

  useEffect(() => {
    stripeService.getStripePublishableKey()
      .then(k => setPublishableKey(k || ''))
      .catch(() => {})
      .finally(() => setKeyReady(true));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader
        title="Billing & Payments"
        navigation={navigation}
        showBackButton
        showIcons
      />

      {!keyReady ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <StripeProvider publishableKey={publishableKey || 'pk_test_placeholder'}>
          <BillingContent navigation={navigation} />
        </StripeProvider>
      )}

      <SuggestionsFooter sourceRoute="BillingPayments" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center' },

  scroll:       { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24 },

  // Section label
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#aaa', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 },

  // Saved card row
  section:        { marginBottom: 24 },
  cardRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e8e8e8',
    borderRadius: 14, padding: 14, marginBottom: 10,
    backgroundColor: '#fafafa', gap: 12,
  },
  cardRowDefault: { borderColor: COLORS.primary, backgroundColor: '#F4F6FF' },
  brandBadge: {
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5,
    minWidth: 42, alignItems: 'center', justifyContent: 'center',
  },
  brandText:    { fontSize: 10, fontWeight: '900', color: '#fff' },
  cardDetails:  { flex: 1 },
  cardNumber:   { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  cardExpiry:   { fontSize: 12, color: '#888' },
  cardActions:  { alignItems: 'flex-end', gap: 4 },
  defaultPill:  { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  defaultPillText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  setDefaultBtn: { paddingVertical: 2 },
  setDefaultText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },
  removeBtn:    { padding: 4 },

  // Empty state
  empty: { alignItems: 'center', paddingTop: 40, paddingBottom: 24 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 6 },
  emptySub:   { fontSize: 14, color: '#aaa', textAlign: 'center', lineHeight: 20, paddingHorizontal: 24 },

  // Mandate box
  mandateBox: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: '#EEF2FF', borderRadius: 10, padding: 12, marginBottom: 20,
  },
  mandateText: { fontSize: 13, color: '#444', lineHeight: 18, flex: 1 },

  // Add button
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: COLORS.primary, borderStyle: 'dashed',
    borderRadius: 14, paddingVertical: 16, marginBottom: 8,
  },
  addBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.primary },

  // Add card form
  addForm:   { paddingTop: 4 },
  cardField: { width: '100%', height: 52, marginBottom: 16 },

  toggleRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  toggle: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: '#ccc',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
  },
  toggleOn:    { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  toggleLabel: { fontSize: 14, color: '#333', flex: 1 },

  consentBox: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: '#f8f8f8', borderRadius: 10, padding: 12, marginBottom: 16,
  },
  consentText: { fontSize: 12, color: '#666', lineHeight: 18, flex: 1 },

  networkRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  networkBadge: {
    borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5,
  },
  networkText: { fontSize: 10, fontWeight: '900', color: '#fff' },

  saveBtn: {
    backgroundColor: COLORS.primary, borderRadius: 28,
    paddingVertical: 16, alignItems: 'center', marginBottom: 10,
  },
  saveBtnOff:  { opacity: 0.4 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  savingRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },

  cancelBtn:     { paddingVertical: 14, alignItems: 'center', marginBottom: 8 },
  cancelBtnText: { fontSize: 15, color: '#888', fontWeight: '500' },

  secureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 4 },
  secureText: { fontSize: 11, color: '#bbb' },

  // Future hint
  hintBox: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: '#f0fff4', borderRadius: 10, padding: 12, marginTop: 8,
  },
  hintText: { fontSize: 13, color: '#2d7a4f', lineHeight: 18, flex: 1 },
});

export default BillingPaymentsScreen;
