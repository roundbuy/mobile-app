import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../context/TranslationContext';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { getFullImageUrl } from '../../../utils/imageUtils';
import { IMAGES } from '../../../assets/images';
import offersService from '../../../services/offersService';
import SuggestionsFooter from '../../../components/SuggestionsFooter';

const ManageOffersScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('buyer'); // 'buyer' or 'seller'
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, [activeTab]);

  const fetchOffers = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await offersService.getUserOffers({
        type: activeTab, // 'buyer' or 'seller'
        limit: 50,
      });

      if (response.data.success) {
        setOffers(response.data.offers || []);
      } else {
        setOffers([]);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      Alert.alert(t('Error'), t('Failed to load offers. Please try again.'));
      setOffers([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleRefresh = () => {
    fetchOffers(true);
  };

  const handleViewOfferHistory = (offer) => {
    // Navigate to offer history/details screen
    navigation.navigate('OfferHistory', {
      offerId: offer.id,
      advertisementId: offer.advertisement_id,
      advertisementTitle: offer.advertisement_title,
    });
  };

  const renderOfferItem = ({ item }) => {
    const imageUri = item.advertisement_images && item.advertisement_images.length > 0
      ? getFullImageUrl(JSON.parse(item.advertisement_images)[0])
      : IMAGES.chair1;

    const activityType = item.activity_type || 'SELL';

    return (
      <View style={styles.offerCard}>
        <Image source={{ uri: imageUri }} style={styles.productImage} />

        <View style={styles.offerContent}>
          <View style={styles.offerHeader}>
            <View style={styles.titleCol}>
              <Text style={styles.productTitle} numberOfLines={1}>
                {item.advertisement_title || 'Product'}
              </Text>
            </View>
            <View style={styles.typeCol}>
              <Text style={styles.activityBadgeText}>{activityType.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.instructionText}>{t('View item offer history')}</Text>

          <TouchableOpacity
            style={styles.viewHistoryButton}
            onPress={() => handleViewOfferHistory(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.viewHistoryButtonText}>{t('View Offer history')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Manage Product offers')}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'buyer' && styles.activeTab]}
          onPress={() => setActiveTab('buyer')}
        >
          <Text style={[styles.tabText, activeTab === 'buyer' && styles.activeTabText]}>{t('Sent Offers')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'seller' && styles.activeTab]}
          onPress={() => setActiveTab('seller')}
        >
          <Text style={[styles.tabText, activeTab === 'seller' && styles.activeTabText]}>{t('Received Offers')}</Text>
        </TouchableOpacity>
      </View>

      {/* Offers List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('Loading offers...')}</Text>
        </View>
      ) : (
        <FlatList
          data={offers}
          renderItem={renderOfferItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="pricetag-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {isLoading ? 'Loading...' : `No offers found as ${activeTab}`}
              </Text>
              {!isLoading && (
                <TouchableOpacity style={styles.retryButton} onPress={() => fetchOffers()}>
                  <Text style={styles.retryText}>{t('Retry')}</Text>
                </TouchableOpacity>
              )}
            </View>
          }

        />
      )}
      <SuggestionsFooter sourceRoute="ManageOffers" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  headerRight: {
    width: 32,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#303234',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  offerCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'flex-start',
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  offerContent: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleCol: {
    flex: 1,
    paddingRight: 8,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  typeCol: {
    alignItems: 'flex-end',
  },
  activityBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
  },
  instructionText: {
    fontSize: 12,
    color: '#505050',
    marginBottom: 12,
    lineHeight: 16,
  },
  viewHistoryButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 4,
  },
  viewHistoryButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#505050',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#303234',
    marginTop: 16,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ManageOffersScreen;