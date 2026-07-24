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
import advertisementService from '../../../services/advertisementService';
import { COLORS } from '../../../constants/theme';
import SuggestionsFooter from '../../../components/SuggestionsFooter';

const ExtensionBoostsScreen = ({ navigation }) => {
  const [plans, setPlans] = useState([]);
  const [distancePlans, setDistancePlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await advertisementService.getAdvertisementPlans();
      if (response?.data) {
        if (response.data.plans) setPlans(response.data.plans);
        if (response.data.distance_plans) setDistancePlans(response.data.distance_plans);
      }
    } catch {
      Alert.alert('Error', 'Failed to load boost plans');
    } finally {
      setLoading(false);
    }
  };

  const getGroupedPlans = () => {
    const grouped = {};
    plans.forEach(plan => {
      const type = plan.plan_type || 'other';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(plan);
    });
    return grouped;
  };

  const getDisplayName = (type) => {
    switch (type) {
      case 'rise_to_top': return 'Rise to Top';
      case 'top_spot': return 'TopSpot';
      case 'show_casing': return 'ShowCasing';
      case 'home_market': return 'HomeMarket';
      case 'garage_sales': return 'GarageSales';
      case 'targeted': return 'Targeted Ad';
      case 'fast': return 'Fast Ad';
      default: return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getDescription = (type) => {
    switch (type) {
      case 'rise_to_top': return 'Get noticed first! Your listing rises to the top of search results once a day.';
      case 'top_spot': return 'Secure the #1 spot in search results for maximum visibility.';
      case 'show_casing': return 'Premium placement on homepage and category pages.';
      case 'targeted': return 'Reach your specific audience with location-based targeting.';
      case 'fast': return 'Quick boost for urgent sales.';
      default: return 'Boost your ad visibility';
    }
  };

  const handleSelect = (type, typePlans) => {
    navigation.navigate('VisibilityAdChoices', {
      planType: type,
      plans: typePlans,
      distancePlans,
    });
  };

  const groupedPlans = getGroupedPlans();
  const orderedTypes = ['rise_to_top', 'top_spot', 'show_casing', 'targeted', 'fast'].filter(k => groupedPlans[k]);
  const remainingTypes = Object.keys(groupedPlans).filter(k => !orderedTypes.includes(k));
  const allTypes = [...orderedTypes, ...remainingTypes];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Visibility Boost</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Promote your listings to reach more buyers</Text>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : allTypes.length === 0 ? (
          <Text style={styles.empty}>No boost plans available</Text>
        ) : (
          allTypes.map((type) => {
            const typePlans = groupedPlans[type];
            const prices = typePlans.map(p => parseFloat(p.discounted_price || p.price || 0));
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            const sorted = [...typePlans].sort((a, b) => a.duration_days - b.duration_days);
            const minDur = sorted[0]?.duration_label || `${sorted[0]?.duration_days} days`;
            const maxDur = sorted[sorted.length - 1]?.duration_label || `${sorted[sorted.length - 1]?.duration_days} days`;

            return (
              <View key={type} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardName}>{getDisplayName(type)}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.currency}>£</Text>
                    <Text style={styles.price}>{minPrice.toFixed(2)}</Text>
                    {minPrice !== maxPrice && (
                      <Text style={styles.price}> - {maxPrice.toFixed(2)}</Text>
                    )}
                  </View>
                </View>

                <Text style={styles.cardDesc}>{getDescription(type)}</Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaChip}>
                    <Ionicons name="time-outline" size={14} color="#555" />
                    <Text style={styles.metaText}>{minDur} - {maxDur}</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Ionicons name="location-outline" size={14} color="#555" />
                    <Text style={styles.metaText}>Up to 10km+</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.selectBtn}
                  onPress={() => handleSelect(type, typePlans)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.selectBtnText}>Select</Text>
                  <Ionicons name="chevron-forward" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            );
          })
        )}

        <SuggestionsFooter sourceRoute="PurchaseVisibility" />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  headerRight: { width: 32 },

  scroll: { padding: 16, gap: 14, paddingBottom: 48 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 4 },
  loading: { paddingTop: 60, alignItems: 'center' },
  empty: { textAlign: 'center', color: '#888', marginTop: 40 },

  card: {
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardName: { fontSize: 20, fontWeight: '700', color: '#000', flex: 1 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-start' },
  currency: { fontSize: 14, fontWeight: '600', color: COLORS.primary, marginTop: 4, marginRight: 1 },
  price: { fontSize: 20, fontWeight: '700', color: COLORS.primary },

  cardDesc: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 14 },

  metaRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  metaText: { fontSize: 13, color: '#444', fontWeight: '500' },

  selectBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  selectBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});

export default ExtensionBoostsScreen;
