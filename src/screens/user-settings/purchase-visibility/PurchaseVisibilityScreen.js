
import React, { useState, useEffect } from 'react';
import advertisementService from '../../../services/advertisementService';
import { useTranslation } from '../../../context/TranslationContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../../constants/theme';
import SuggestionsFooter from '../../../components/SuggestionsFooter';

const PurchaseVisibilityScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const handleBack = () => {
    navigation.goBack();
  };

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
      if (response && response.data) {
        if (response.data.plans) setPlans(response.data.plans);
        if (response.data.distance_plans) setDistancePlans(response.data.distance_plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      Alert.alert(t('Error'), t('Failed to load advertisement plans'));
    } finally {
      setLoading(false);
    }
  };

  const handleTypePress = (type, typePlans) => {
    navigation.navigate('VisibilityAdChoices', {
      planType: type,
      plans: typePlans,
      distancePlans: distancePlans
    });
  };

  const getGroupedPlans = () => {
    const grouped = {};
    plans.forEach(plan => {
      const type = plan.plan_type || 'other';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(plan);
    });
    return grouped;
  };

  const getTypeDisplayName = (type) => {
    switch (type) {
      case 'rise_to_top': return t('Rise to Top');
      case 'top_spot': return t('Top Spot');
      case 'show_casing': return t('Show Casing');
      case 'targeted': return t('Targeted Ad');
      case 'fast': return t('Fast Ad');
      default: return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getTypeDescription = (type) => {
    switch (type) {
      case 'rise_to_top': return t('Get noticed first! Your ad rises to the top of search results locally.');
      case 'top_spot': return t('Secure the #1 spot in search results for maximum visibility.');
      case 'show_casing': return t('Premium placement on homepage and category pages.');
      case 'targeted': return t('Reach your specific audience with location-based targeting.');
      case 'fast': return t('Quick boost for urgent sales.');
      default: return t('Boost your ad visibility');
    }
  };

  const renderTypeCard = (type, typePlans) => {
    // Calculate ranges
    const prices = typePlans.map(p => parseFloat(p.discounted_price || p.price || 0));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Sort plans by duration to get min/max days
    const sortedByDuration = [...typePlans].sort((a, b) => a.duration_days - b.duration_days);
    const minDuration = sortedByDuration[0]?.duration_label || `${sortedByDuration[0]?.duration_days} days`;
    const maxDuration = sortedByDuration[sortedByDuration.length - 1]?.duration_label || `${sortedByDuration[sortedByDuration.length - 1]?.duration_days} days`;

    const currencySymbol = typePlans[0]?.currency_code === 'GBP' ? '£' : '£';

    return (
      <View key={type} style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.planName}>{getTypeDisplayName(type)}</Text>
          <View style={styles.priceColumn}>
            <View style={styles.priceContainer}>
              <Text style={styles.currency}>{currencySymbol}</Text>
              <Text style={styles.price}>{minPrice.toFixed(2)}</Text>
              {minPrice !== maxPrice && (
                <>
                  <Text style={styles.priceSeparator}> - </Text>
                  <Text style={styles.price}>{maxPrice.toFixed(2)}</Text>
                </>
              )}
            </View>
          </View>
        </View>

        <Text style={styles.description}>{getTypeDescription(type)}</Text>

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.metaText}>{minDuration} - {maxDuration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={16} color="#666" />
            {/* Assuming default is 3km based on migration, or check plan data */}
            <Text style={styles.metaText}>{t('Up to 10km+')}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => handleTypePress(type, typePlans)}
          activeOpacity={0.8}
        >
          <Text style={styles.buyButtonText}>{t('Select')}</Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  const groupedPlans = getGroupedPlans();
  // Order types specific way if needed, or just keys
  const orderedTypes = ['rise_to_top', 'top_spot', 'show_casing', 'targeted', 'fast'].filter(t => groupedPlans[t]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Purchase Visibility')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <View style={styles.plansContainer}>
            <Text style={styles.subtitle}>{t('Choose how you want to promote your ad')}</Text>

            {orderedTypes.map(type => renderTypeCard(type, groupedPlans[type]))}

            {Object.keys(groupedPlans).filter(t => !orderedTypes.includes(t)).map(type =>
              renderTypeCard(type, groupedPlans[type])
            )}

            {plans.length === 0 && (
              <Text style={styles.emptyText}>{t('No plans available')}</Text>
            )}
          </View>
        )}
        <SuggestionsFooter sourceRoute="PurchaseVisibility" />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plansContainer: {
    padding: 20,
    gap: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center'
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  priceColumn: {
    alignItems: 'flex-end',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  currency: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 4,
    marginRight: 2,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  priceSeparator: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  metaText: {
    fontSize: 13,
    color: '#444',
    fontWeight: '500'
  },
  buyButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  }
});

export default PurchaseVisibilityScreen;