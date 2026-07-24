import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { advertisementService, userService } from '../../../services';
import { getFullImageUrl } from '../../../utils/imageUtils';
import { useTranslation } from '../../../context/TranslationContext';

const MyServicesScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [extensionStatus, setExtensionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch extension status
      const extRes = await userService.getSocialClubExtensionStatus();
      if (extRes?.success && extRes?.data) {
        setExtensionStatus(extRes.data);
      }

      // Fetch user's listings and filter for Services (activity_id = 4)
      const adsRes = await advertisementService.getUserAdvertisements({ limit: 100 });
      if (adsRes?.success && adsRes?.data?.advertisements) {
        const userServices = (adsRes.data.advertisements || []).filter(
          ad => ad.activity_id === 4 || ad.activity_name?.toLowerCase() === 'services'
        );
        setServices(userServices);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error('Error fetching services/extension status:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchData(true);
  };

  const getExpirationDateString = () => {
    if (!extensionStatus || !extensionStatus.service_listings_active) {
      return t('Not Active');
    }
    const dateStr = extensionStatus.service_listings_expires_at;
    if (!dateStr) return t('Active');
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const renderServiceItem = ({ item }) => {
    const imageUrl = item.images && item.images.length > 0 ? getFullImageUrl(item.images[0]) : null;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ServiceDetails', { advertisementId: item.id })}
      >
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="construct-outline" size={24} color="#aaa" />
            </View>
          )}
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.cardPrice}>
            £{parseFloat(item.price).toFixed(2)} starting price
          </Text>
          <View style={styles.cardStats}>
            <View style={styles.statRow}>
              <Ionicons name="eye-outline" size={14} color="#666" />
              <Text style={styles.statText}>{item.views_count || 0} views</Text>
            </View>
            <View style={[styles.statusBadge, item.status === 'published' ? styles.statusPublished : styles.statusPending]}>
              <Text style={styles.statusText}>{item.status || 'draft'}</Text>
            </View>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#ccc" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Service Listings')}</Text>
        <View style={styles.headerRight} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <View style={styles.content}>
          {/* Extension Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusRowHeader}>
              <Ionicons name="shield-checkmark" size={20} color="#0f9d58" />
              <Text style={styles.statusTitle}>{t('Extension Access Active')}</Text>
            </View>
            <Text style={styles.statusDesc}>
              {t('You have unlimited service listings. Expires on:')}{' '}
              <Text style={styles.statusDate}>{getExpirationDateString()}</Text>
            </Text>
          </View>

          {/* List header */}
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>{t('My Services')}</Text>
            <Text style={styles.listSubtitle}>({services.length} listings)</Text>
          </View>

          {services.length === 0 ? (
            <ScrollView
              contentContainerStyle={styles.emptyContainer}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            >
              <Ionicons name="construct-outline" size={72} color="#ccc" />
              <Text style={styles.emptyTitle}>{t('No Services Listed Yet')}</Text>
              <Text style={styles.emptyDesc}>
                {t('List your professional skill or trade to start receiving local offers.')}
              </Text>
            </ScrollView>
          ) : (
            <FlatList
              data={services}
              renderItem={renderServiceItem}
              keyExtractor={item => String(item.id)}
              contentContainerStyle={styles.list}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Create Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => navigation.navigate('SellService')}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={24} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.createBtnText}>{t('List a Service')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    borderBottomColor: '#f0f0f0',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  headerRight: { width: 32 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1 },

  statusCard: {
    margin: 20,
    padding: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  statusRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E7D32',
  },
  statusDesc: {
    fontSize: 13,
    color: '#4E7D4E',
  },
  statusDate: {
    fontWeight: '700',
    color: '#1B5E20',
  },

  listHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
  },
  listSubtitle: {
    fontSize: 13,
    color: '#888',
    marginLeft: 6,
    fontWeight: '500',
  },

  list: { paddingHorizontal: 20, paddingBottom: 100 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    marginRight: 12,
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1, justifyContent: 'center' },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 3,
  },
  cardPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: '#666',
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  statusPublished: { backgroundColor: '#E8F5E9' },
  statusPending: { backgroundColor: '#FFF3E0' },
  statusText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', color: '#666' },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },

  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'transparent',
  },
  createBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  createBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default MyServicesScreen;
