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
import { userService } from '../../../services';

const EXTENSION_ITEMS = [
  {
    key: 'social_clubs',
    icon: 'people-circle-outline',
    title: 'Social Clubs',
    description: 'List your items in local Social Club galleries and connect with community buyers.',
    price: 2.00,
    duration: '6 months',
    giftMessage: null,
    activeKey: 'social_clubs_active',
  },
  {
    key: 'events',
    icon: 'calendar-outline',
    title: 'Events',
    description: 'Promote your items at local Events and reach buyers browsing event listings.',
    price: 2.00,
    duration: '6 months',
    giftMessage: null,
    activeKey: 'events_active',
  },
  {
    key: 'garage_sales',
    icon: 'home-outline',
    title: 'Garage Sales & HomeMarket',
    description: 'Unlock the HomeMarket & GarageSales gallery. Add listings to reach buyers shopping local garage sales.',
    price: 2.00,
    duration: '6 months',
    giftMessage: '🎁 Your first Garage Sale access is a gift from us — activate it free!',
    isFirstFree: true,
    activeKey: 'garage_sales_active',
  },
];

const ExtensionSocialClubsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [activeExtensions, setActiveExtensions] = useState({});
  const [selectedKeys, setSelectedKeys] = useState([]);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await userService.getSocialClubExtensionStatus();
      if (resp?.success) {
        setActiveExtensions(resp.data || {});
      }
    } catch {
      setActiveExtensions({});
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchStatus();
    }, [fetchStatus])
  );

  const toggleSelect = (key) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handlePurchase = async () => {
    const selected = EXTENSION_ITEMS.filter((i) => selectedKeys.includes(i.key));
    if (selected.length === 0) return;

    const totalPrice = selected.reduce((sum, item) => {
      return sum + (item.isFirstFree && !activeExtensions[item.activeKey] ? 0 : item.price);
    }, 0);

    // Free gift items — activate directly without checkout
    const giftItems = selected.filter((i) => i.isFirstFree && !activeExtensions[i.activeKey]);
    const paidItems = selected.filter((i) => !i.isFirstFree || activeExtensions[i.activeKey]);

    for (const gift of giftItems) {
      try {
        await userService.activateSocialClubGift(gift.key);
      } catch {
        // ignore — might already be active
      }
    }

    if (paidItems.length === 0) {
      // All were free gifts — refresh status and done
      fetchStatus();
      return;
    }

    navigation.navigate('ExtensionCheckout', {
      type: 'social_extension',
      planType: 'social_clubs_bundle',
      selectedPlan: {
        name: paidItems.map((i) => i.title).join(' + '),
        price: totalPrice,
        duration: '6 months',
        items: paidItems.map((i) => i.key),
      },
      selectedDistance: {},
    });
  };

  const totalPrice = selectedKeys.reduce((sum, key) => {
    const item = EXTENSION_ITEMS.find((i) => i.key === key);
    if (!item) return sum;
    const isFreeFirstTime = item.isFirstFree && !activeExtensions[item.activeKey];
    return sum + (isFreeFirstTime ? 0 : item.price);
  }, 0);

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
        <Text style={styles.heading}>Community Extensions</Text>
        <Text style={styles.subheading}>
          Unlock gallery access for community features. Select what you want to activate.
        </Text>

        {EXTENSION_ITEMS.map((item) => {
          const isActive = !!activeExtensions[item.activeKey];
          const isSelected = selectedKeys.includes(item.key);
          const isFreeFirstTime = item.isFirstFree && !isActive;

          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.card,
                isActive && styles.cardActive,
                isSelected && !isActive && styles.cardSelected,
              ]}
              onPress={() => !isActive && toggleSelect(item.key)}
              activeOpacity={isActive ? 1 : 0.8}
            >
              {/* Active badge */}
              {isActive && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
              )}

              {/* Select checkbox */}
              {!isActive && (
                <View style={styles.checkbox}>
                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                  ) : (
                    <Ionicons name="ellipse-outline" size={24} color="#ccc" />
                  )}
                </View>
              )}

              <View style={styles.cardBody}>
                <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                  <Ionicons name={item.icon} size={26} color={isActive ? '#34c759' : COLORS.primary} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDesc}>{item.description}</Text>

                  {item.giftMessage && (
                    <View style={styles.giftBanner}>
                      <Text style={styles.giftText}>{item.giftMessage}</Text>
                    </View>
                  )}

                  <View style={styles.priceRow}>
                    {isFreeFirstTime ? (
                      <>
                        <Text style={styles.priceStrike}>£{item.price.toFixed(2)}</Text>
                        <Text style={styles.priceFree}>Free</Text>
                      </>
                    ) : (
                      <Text style={styles.price}>£{item.price.toFixed(2)}</Text>
                    )}
                    <Text style={styles.priceDuration}>/ {item.duration}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {selectedKeys.length > 0 && (
          <TouchableOpacity style={styles.buyButton} onPress={handlePurchase}>
            <Text style={styles.buyButtonText}>
              {totalPrice === 0
                ? `Activate ${selectedKeys.length} extension${selectedKeys.length > 1 ? 's' : ''} — Free`
                : `Buy ${selectedKeys.length} extension${selectedKeys.length > 1 ? 's' : ''} — £${totalPrice.toFixed(2)}`}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footerNote}>
          Extensions unlock gallery access for the selected duration. Renewal is available before expiry.
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
    <Text style={styles.headerTitle}>Social Extensions</Text>
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

  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: 14,
    color: '#6a6a6a',
    lineHeight: 20,
    marginBottom: 24,
  },

  card: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#fafafa',
    position: 'relative',
  },
  cardActive: {
    borderColor: '#34c759',
    backgroundColor: '#f0fff4',
  },
  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F4F6FF',
  },

  activeBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    backgroundColor: '#34c759',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activeBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  checkbox: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },

  cardBody: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconWrapActive: { backgroundColor: '#e8f5e9' },
  cardContent: { flex: 1, paddingRight: 28 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#6a6a6a', lineHeight: 18, marginBottom: 8 },

  giftBanner: {
    backgroundColor: '#fff8ec',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ffd580',
    marginBottom: 8,
  },
  giftText: { fontSize: 12, color: '#b07d00', lineHeight: 16 },

  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  price: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  priceStrike: {
    fontSize: 14,
    color: '#aaa',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  priceFree: { fontSize: 16, fontWeight: '800', color: '#34c759' },
  priceDuration: { fontSize: 12, color: '#888' },

  buyButton: {
    height: 54,
    backgroundColor: COLORS.primary,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  buyButtonText: { fontSize: 17, fontWeight: '600', color: '#fff' },

  footerNote: {
    fontSize: 12,
    color: '#aaa',
    lineHeight: 17,
    textAlign: 'center',
  },
});

export default ExtensionSocialClubsScreen;
