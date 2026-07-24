import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Animated,
} from 'react-native';
import { StripeProvider, CardField, useStripe } from '@stripe/stripe-react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import stripeService from '../services/stripeService';
import api from '../services/api';

const CANCEL_SECONDS = 300; // 5 minutes

// ─── Inner sheet (must be inside StripeProvider) ──────────────────────────────
const SheetContent = ({ title, description, amount, currency = 'GBP', payload, onSuccess, onClose }) => {
  const { createPaymentMethod } = useStripe();

  // 'loading' while checking cards, 'new_card' if none saved, 'processing' | 'success' | 'failed'
  const [step, setStep]               = useState('loading');
  const [savedCard, setSavedCard]     = useState(null);   // first saved card, if any
  const [cardComplete, setCardComplete] = useState(false);
  const [errorMsg, setErrorMsg]       = useState('');
  const [secondsLeft, setSecondsLeft] = useState(CANCEL_SECONDS);

  const timerRef    = useRef(null);
  const slideAnim   = useRef(new Animated.Value(400)).current;

  // ── Slide in, check cards, auto-pay if card exists ───────────────────────────
  useEffect(() => {
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 60, friction: 10 }).start();
    startTimer();
    initPayment();
    return () => clearInterval(timerRef.current);
  }, []);

  const initPayment = async () => {
    try {
      const cards = await stripeService.getSavedPaymentMethods();
      if (cards && cards.length > 0) {
        // Saved card found — auto-pay immediately, no button needed
        setSavedCard(cards[0]);
        await executePayment({ saved_card_id: cards[0].id });
      } else {
        // No saved card — show card entry form
        setStep('new_card');
      }
    } catch {
      setStep('new_card');
    }
  };

  const executePayment = async (cardPayload) => {
    setStep('processing');
    clearInterval(timerRef.current);
    try {
      const finalPayload = { ...(payload || {}), currency, amount, ...cardPayload };
      const res = await api.post('/advertisements/purchase-extension', finalPayload);
      if (res.data?.success) {
        setStep('success');
        if (onSuccess) onSuccess(res.data?.data);
      } else {
        setErrorMsg(res.data?.message || 'Payment failed. Please try again.');
        setStep('failed');
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err.message || 'Payment failed. Please try again.');
      setStep('failed');
    }
  };

  const handlePayNewCard = async () => {
    if (!cardComplete) { setErrorMsg('Please complete your card details.'); return; }
    setErrorMsg('');
    const { paymentMethod, error } = await createPaymentMethod({ paymentMethodType: 'Card' });
    if (error) { setErrorMsg(error.message); return; }
    await executePayment({ payment_method_id: paymentMethod.id });
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); onClose(); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (secs) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;

  const handleClose = () => { clearInterval(timerRef.current); onClose(); };

  const currencySymbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency;

  // ── Processing state ─────────────────────────────────────────────────────────
  if (step === 'processing') {
    return (
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.processingText}>Processing payment…</Text>
          <Text style={styles.processingSubText}>Please do not close this screen</Text>
        </View>
      </Animated.View>
    );
  }

  // ── Success state ────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.resultContainer}>
          <View style={[styles.resultIcon, styles.successIcon]}>
            <Ionicons name="checkmark" size={36} color="#fff" />
          </View>
          <Text style={styles.resultTitle}>Payment successful</Text>
          <Text style={styles.resultAmount}>{currencySymbol}{parseFloat(amount).toFixed(2)}</Text>
          <Text style={styles.resultDesc}>{description || title}</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={handleClose} activeOpacity={0.8}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  // ── Failed state ─────────────────────────────────────────────────────────────
  if (step === 'failed') {
    return (
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.resultContainer}>
          <View style={[styles.resultIcon, styles.failedIcon]}>
            <Ionicons name="close" size={36} color="#fff" />
          </View>
          <Text style={styles.resultTitle}>Payment failed</Text>
          <Text style={styles.resultError}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => initPayment()} activeOpacity={0.8}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelTextBtn} onPress={handleClose}>
            <Text style={styles.cancelTextBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  // ── No saved card — enter new card ───────────────────────────────────────────
  if (step === 'new_card') {
    return (
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.handle} />
        <View style={styles.sheetHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sheetTitle}>{title}</Text>
            {description ? <Text style={styles.sheetDesc}>{description}</Text> : null}
          </View>
          <View style={styles.timerBadge}>
            <Ionicons name="time-outline" size={13} color={secondsLeft < 60 ? '#C62828' : '#888'} />
            <Text style={[styles.timerText, secondsLeft < 60 && styles.timerTextUrgent]}>
              {formatTime(secondsLeft)}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Enter card details</Text>
        <CardField
          postalCodeEnabled={false}
          style={styles.cardField}
          cardStyle={cardFieldStyle}
          onCardChange={(d) => setCardComplete(d.complete)}
        />

        {errorMsg ? <Text style={styles.inlineError}>{errorMsg}</Text> : null}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{currencySymbol}{parseFloat(amount).toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.payBtn, !cardComplete && styles.payBtnDisabled]}
          onPress={handlePayNewCard}
          disabled={!cardComplete}
          activeOpacity={0.8}
        >
          <Ionicons name="lock-closed" size={15} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.payBtnText}>Pay {currencySymbol}{parseFloat(amount).toFixed(2)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelTextBtn} onPress={handleClose}>
          <Text style={styles.cancelTextBtnText}>Cancel — {formatTime(secondsLeft)} remaining</Text>
        </TouchableOpacity>
        <View style={{ height: 30 }} />
      </Animated.View>
    );
  }

  // ── loading / processing / success handled above — nothing else to render ────
  return null;
};

// ─── Public component — wraps with StripeProvider ─────────────────────────────
const PaymentSheet = ({ visible, onClose, title, description, amount, currency, payload, onSuccess }) => {
  const [publishableKey, setPublishableKey] = useState('');
  const [keyLoaded, setKeyLoaded]           = useState(false);

  useEffect(() => {
    if (visible && !keyLoaded) {
      stripeService.getStripePublishableKey()
        .then((k) => setPublishableKey(k || 'pk_test_placeholder'))
        .catch(() => setPublishableKey('pk_test_placeholder'))
        .finally(() => setKeyLoaded(true));
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      {keyLoaded ? (
        <StripeProvider publishableKey={publishableKey}>
          <SheetContent
            title={title}
            description={description}
            amount={amount}
            currency={currency}
            payload={payload}
            onSuccess={onSuccess}
            onClose={onClose}
          />
        </StripeProvider>
      ) : (
        <View style={styles.sheet}>
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        </View>
      )}
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginBottom: 16,
  },

  // Header
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  sheetDesc:  { fontSize: 13, color: '#888', marginTop: 2 },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  timerText:       { fontSize: 12, fontWeight: '600', color: '#888' },
  timerTextUrgent: { color: '#C62828' },

  // Section
  section:      { marginBottom: 16 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Saved card rows
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    marginBottom: 8,
    backgroundColor: '#fafafa',
  },
  cardRowActive: { borderColor: COLORS.primary, backgroundColor: '#EEF2FF' },
  cardBrand:     { backgroundColor: '#1a1a1a', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  cardBrandText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  cardLast4:     { flex: 1, fontSize: 14, color: '#333', fontFamily: 'Courier' },
  newCardText:   { flex: 1, fontSize: 14, color: COLORS.primary, fontWeight: '500' },

  // Card field
  cardField:     { height: 50, marginTop: 4 },

  // Error
  inlineError: { fontSize: 13, color: '#C62828', marginBottom: 10, textAlign: 'center' },

  // Total
  totalRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 4 },
  totalLabel: { fontSize: 15, color: '#555', fontWeight: '500' },
  totalAmount:{ fontSize: 22, fontWeight: '800', color: '#1a1a1a' },

  // Pay button
  payBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  payBtnText:     { fontSize: 16, fontWeight: '700', color: '#fff' },
  payBtnDisabled: { backgroundColor: '#ccc' },

  // Cancel
  cancelTextBtn:     { alignItems: 'center', paddingVertical: 10 },
  cancelTextBtnText: { fontSize: 14, color: '#aaa' },

  // Processing
  processingContainer: { alignItems: 'center', paddingVertical: 50, gap: 16 },
  processingText:      { fontSize: 17, fontWeight: '600', color: '#1a1a1a' },
  processingSubText:   { fontSize: 13, color: '#888' },

  // Result (success / failed)
  resultContainer: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  resultIcon:      { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  successIcon:     { backgroundColor: '#2E7D32' },
  failedIcon:      { backgroundColor: '#C62828' },
  resultTitle:     { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  resultAmount:    { fontSize: 28, fontWeight: '800', color: COLORS.primary },
  resultDesc:      { fontSize: 14, color: '#888', textAlign: 'center', paddingHorizontal: 20 },
  resultError:     { fontSize: 14, color: '#C62828', textAlign: 'center', paddingHorizontal: 20 },
  doneBtn: {
    marginTop: 12,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  doneBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  retryBtn: {
    marginTop: 12,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  retryBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});

const cardFieldStyle = {
  backgroundColor: '#fafafa',
  textColor: '#1a1a1a',
  placeholderColor: '#aaa',
  borderRadius: 10,
  borderWidth: 1.5,
  borderColor: '#e8e8e8',
};

export default PaymentSheet;
