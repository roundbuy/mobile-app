import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../../constants/theme';
import { advertisementService } from '../../../services';

const MAX_LOCATIONS = 5;
const SINGLE_PRICE = 2.50;
const PACKAGE_PRICE = 10.00;
const DURATION_LABEL = '6 months';

const ExtensionLocationsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await advertisementService.getUserLocations();
      if (response?.success) {
        setLocations(response.data?.locations || []);
      }
    } catch {
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLocations();
    }, [fetchLocations])
  );

  const currentCount = locations.length;
  const remainingSlots = MAX_LOCATIONS - currentCount;
  const canAddSingle = remainingSlots >= 1;
  const canAddPackage = remainingSlots >= 2;

  const isNearExpiry = (location) => {
    if (!location?.expires_at) return false;
    const expiry = new Date(location.expires_at);
    const daysLeft = (expiry - Date.now()) / (1000 * 60 * 60 * 24);
    return daysLeft > 0 && daysLeft <= 7;
  };
  const anyNearExpiry = locations.some(isNearExpiry);

  const handlePurchase = () => {
    if (!selectedOption) return;

    const price = selectedOption === 'single' ? SINGLE_PRICE : PACKAGE_PRICE;
    const qty = selectedOption === 'single' ? 1 : Math.min(4, remainingSlots);

    navigation.navigate('ExtensionCheckout', {
      type: 'display_location',
      planType: selectedOption,
      selectedPlan: {
        name: selectedOption === 'single'
          ? `+1 Display Location — ${DURATION_LABEL}`
          : `+${qty} Display Locations Package — ${DURATION_LABEL}`,
        price,
        duration: DURATION_LABEL,
      },
      selectedDistance: {},
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header navigation={navigation} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Current status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Your display locations</Text>
          <View style={styles.dotRow}>
            {Array.from({ length: MAX_LOCATIONS }).map((_, i) => (
              <View key={i} style={[styles.locationDot, i < currentCount && styles.locationDotActive]}>
                <Ionicons
                  name={i < currentCount ? 'location' : 'location-outline'}
                  size={18}
                  color={i < currentCount ? COLORS.primary : '#ccc'}
                />
              </View>
            ))}
          </View>
          <Text style={styles.statusSub}>
            {currentCount} of {MAX_LOCATIONS} locations active
            {currentCount >= MAX_LOCATIONS ? ' — maximum reached' : ''}
          </Text>
          {anyNearExpiry && (
            <View style={styles.giftBanner}>
              <Text style={styles.giftText}>🎁 One of your locations expires soon — renew and get 6 months!</Text>
            </View>
          )}
        </View>

        {currentCount >= MAX_LOCATIONS ? (
          <View style={styles.maxReachedCard}>
            <Ionicons name="checkmark-circle" size={32} color="#34c759" />
            <Text style={styles.maxReachedText}>You have the maximum 5 display locations.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>Choose an option</Text>

            {/* Single location option */}
            {canAddSingle && (
              <TouchableOpacity
                style={[styles.optionCard, selectedOption === 'single' && styles.optionCardSelected]}
                onPress={() => setSelectedOption('single')}
                activeOpacity={0.8}
              >
                <View style={styles.optionLeft}>
                  <View style={styles.radioOuter}>
                    {selectedOption === 'single' && <View style={styles.radioInner} />}
                  </View>
                  <View>
                    <Text style={styles.optionTitle}>+1 Display Location</Text>
                    <Text style={styles.optionDuration}>{DURATION_LABEL}</Text>
                    <View style={styles.giftPill}>
                      <Text style={styles.giftPillText}>🎁 Normally 3 months — 6 months on us!</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.optionPrice}>£{SINGLE_PRICE.toFixed(2)}</Text>
              </TouchableOpacity>
            )}

            {/* Package option (4 locations or remaining slots whichever is less) */}
            {canAddPackage && (
              <TouchableOpacity
                style={[styles.optionCard, selectedOption === 'package' && styles.optionCardSelected]}
                onPress={() => setSelectedOption('package')}
                activeOpacity={0.8}
              >
                <View style={styles.optionLeft}>
                  <View style={styles.radioOuter}>
                    {selectedOption === 'package' && <View style={styles.radioInner} />}
                  </View>
                  <View>
                    <Text style={styles.optionTitle}>
                      +{Math.min(4, remainingSlots)} Locations Package
                    </Text>
                    <Text style={styles.optionDuration}>{DURATION_LABEL}</Text>
                    <View style={[styles.giftPill, { backgroundColor: '#fff3cd' }]}>
                      <Text style={styles.giftPillText}>Best value — save {(Math.min(4, remainingSlots) * SINGLE_PRICE - PACKAGE_PRICE).toFixed(2) > 0 ? `£${(Math.min(4, remainingSlots) * SINGLE_PRICE - PACKAGE_PRICE).toFixed(2)}` : 'more'}!</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.optionPrice}>£{PACKAGE_PRICE.toFixed(2)}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.buyButton, !selectedOption && styles.buyButtonDisabled]}
              onPress={handlePurchase}
              disabled={!selectedOption}
            >
              <Text style={styles.buyButtonText}>
                {selectedOption
                  ? `Buy — £${selectedOption === 'single' ? SINGLE_PRICE.toFixed(2) : PACKAGE_PRICE.toFixed(2)}`
                  : 'Select an option'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.footerNote}>
          Display locations let your listings appear to buyers searching in those areas.
          Locations are managed in My Locations.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const Header = ({ navigation }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
      <Ionicons name="chevron-back" size={28} color="#000" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Display Locations</Text>
    <View style={styles.headerRight} />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
  headerRight: { width: 32 },

  scroll: { padding: 20, paddingBottom: 48 },

  statusCard: {
    backgroundColor: '#F4F6FF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },
  statusTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  dotRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  locationDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e8ecff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationDotActive: { backgroundColor: '#EEF2FF' },
  statusSub: { fontSize: 13, color: '#6a6a6a' },

  giftBanner: {
    marginTop: 10,
    backgroundColor: '#fff8ec',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ffd580',
  },
  giftText: { fontSize: 13, color: '#b07d00' },

  maxReachedCard: {
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  maxReachedText: { fontSize: 15, color: '#555', textAlign: 'center' },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F4F6FF',
  },
  optionLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  optionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  optionDuration: { fontSize: 13, color: '#888', marginBottom: 6 },
  giftPill: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  giftPillText: { fontSize: 11, color: '#2e7d32', fontWeight: '600' },
  optionPrice: { fontSize: 18, fontWeight: '800', color: COLORS.primary },

  buyButton: {
    height: 54,
    backgroundColor: COLORS.primary,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  buyButtonDisabled: { backgroundColor: '#ccc' },
  buyButtonText: { fontSize: 17, fontWeight: '600', color: '#fff' },

  footerNote: {
    fontSize: 12,
    color: '#aaa',
    lineHeight: 17,
    textAlign: 'center',
  },
});

export default ExtensionLocationsScreen;
