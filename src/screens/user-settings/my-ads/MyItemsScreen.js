import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { advertisementService } from '../../../services';
import api from '../../../services/api';
import { getFullImageUrl } from '../../../utils/imageUtils';
import { useTranslation } from '../../../context/TranslationContext';
import { useAuth } from '../../../context/AuthContext';
import GlobalHeader from '../../../components/GlobalHeader';
import SuggestionsFooter from '../../../components/SuggestionsFooter';

const MyItemsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { userCurrency } = useAuth();
  const [mainTab, setMainTab] = useState('selling'); // 'selling' | 'buying'

  // Selling States
  const [sellingTab, setSellingTab] = useState('all'); // 'all', 'active', 'inactive'
  const [ads, setAds] = useState([]);
  const [sellingLoading, setSellingLoading] = useState(true);
  const [sellingRefreshing, setSellingRefreshing] = useState(false);

  // Buying States
  const [buyingItems, setBuyingItems] = useState([]);
  const [buyingLoading, setBuyingLoading] = useState(false);
  const [buyingRefreshing, setBuyingRefreshing] = useState(false);

  const currencySymbol = userCurrency === 'USD' ? '$' : userCurrency === 'EUR' ? '€' : '£';

  // ── Fetch Selling Ads ──
  const fetchAds = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setSellingRefreshing(true);
      } else {
        setSellingLoading(true);
      }

      const options = { limit: 50 };
      if (sellingTab !== 'all') {
        options.status = sellingTab === 'active' ? 'published' : 'draft';
      }

      const response = await advertisementService.getUserAdvertisements(options);
      if (response.success && response.data) {
        setAds(response.data.advertisements || []);
      } else {
        setAds([]);
      }
    } catch (error) {
      console.error('Error fetching selling ads:', error);
      Alert.alert(t('Error'), t('Failed to load your advertisements.'));
    } finally {
      setSellingLoading(false);
      setSellingRefreshing(false);
    }
  }, [sellingTab, t]);

  // ── Fetch Buying Items ──
  const fetchBuyingItems = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setBuyingRefreshing(true);
      } else {
        setBuyingLoading(true);
      }

      const res = await api.get('/buyer-seller/action-center?type=buying');
      if (res.data?.success && res.data?.data) {
        setBuyingItems(res.data.data);
      } else {
        setBuyingItems([]);
      }
    } catch (error) {
      console.error('Error fetching buying items:', error);
      Alert.alert(t('Error'), t('Failed to load purchases.'));
    } finally {
      setBuyingLoading(false);
      setBuyingRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    if (mainTab === 'selling') {
      fetchAds();
    } else {
      fetchBuyingItems();
    }
  }, [mainTab, fetchAds, fetchBuyingItems]);

  const handleAdPress = (ad) => {
    navigation.navigate('MyAdsDetail', { ad });
  };

  const handleBuyingItemPress = (item) => {
    navigation.navigate('SingleItemActionScreen', {
      conversationId: item.conversationId,
      advertisementId: item.advertisementId,
      itemTitle: item.itemTitle,
      itemPrice: item.itemPrice,
      itemImage: item.itemImage,
      otherUserName: item.username,
      type: 'buying',
    });
  };

  const renderAdItem = ({ item }) => {
    let imageSource = require('../../../../assets/chair.png'); // placeholder fallback
    try {
      const images = typeof item.images === 'string' ? JSON.parse(item.images) : item.images;
      if (images && images.length > 0) {
        const url = getFullImageUrl(images[0]);
        if (url) imageSource = { uri: url };
      }
    } catch (e) {
      console.log('Error parsing ad image:', e);
    }

    return (
      <View style={styles.card}>
        <Image source={imageSource} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.cardActivityType}>{(item.activity_name || 'SELL').toUpperCase()}</Text>
          </View>
          <View style={styles.cardStatusRow}>
            <Text style={[
              styles.cardStatusText,
              item.status === 'published' ? styles.activeStatus : styles.inactiveStatus
            ]}>
              {item.status === 'published' ? t('Active') : item.status === 'draft' ? t('Draft') : t('Inactive')}
            </Text>
            <Text style={styles.cardPrice}>£{item.price || '0.00'}</Text>
          </View>
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => handleAdPress(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.cardButtonText}>{t('View Listing')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderBuyingItem = ({ item }) => {
    const imageUrl = getFullImageUrl(item.itemImage);
    const imageSource = imageUrl ? { uri: imageUrl } : require('../../../../assets/chair.png');

    return (
      <TouchableOpacity
        style={styles.buyingCard}
        onPress={() => handleBuyingItemPress(item)}
        activeOpacity={0.8}
      >
        <Image source={imageSource} style={styles.buyingCardImage} />
        <View style={styles.buyingCardContent}>
          <Text style={styles.buyingCardTitle} numberOfLines={1}>{item.itemTitle}</Text>
          <Text style={styles.buyingCardPrice}>£{item.itemPrice || '0.00'}</Text>
          <Text style={styles.buyingCardSeller}>
            {t('Seller')}: {item.username || 'N/A'}
          </Text>
          {item.actionText && (
            <View style={styles.actionBadge}>
              <Text style={styles.actionBadgeText}>
                {item.actionText.replace('Action: ', '')}
              </Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" style={styles.buyingCardArrow} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Global Header */}
      <GlobalHeader
        title={t('My Items')}
        navigation={navigation}
        showBackButton={true}
        showIcons={true}
      />

      {/* Main segment tabs: Selling vs Buying */}
      <View style={styles.mainTabsContainer}>
        <TouchableOpacity
          style={[styles.mainTab, mainTab === 'selling' && styles.mainTabActive]}
          onPress={() => setMainTab('selling')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="storefront-outline"
            size={16}
            color={mainTab === 'selling' ? '#fff' : '#555'}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.mainTabText, mainTab === 'selling' && styles.mainTabTextActive]}>
            {t('Selling')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mainTab, mainTab === 'buying' && styles.mainTabActive]}
          onPress={() => setMainTab('buying')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="bag-handle-outline"
            size={16}
            color={mainTab === 'buying' ? '#fff' : '#555'}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.mainTabText, mainTab === 'buying' && styles.mainTabTextActive]}>
            {t('Buying')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Selling Tab Content ── */}
      {mainTab === 'selling' && (
        <View style={styles.tabContentContainer}>
          {/* Sub-tabs for Selling Status */}
          <View style={styles.subTabsContainer}>
            <TouchableOpacity
              style={[styles.subTab, sellingTab === 'all' && styles.subTabActive]}
              onPress={() => setSellingTab('all')}
            >
              <Text style={[styles.subTabText, sellingTab === 'all' && styles.subTabTextActive]}>
                {t('All')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.subTab, sellingTab === 'active' && styles.subTabActive]}
              onPress={() => setSellingTab('active')}
            >
              <Text style={[styles.subTabText, sellingTab === 'active' && styles.subTabTextActive]}>
                {t('Active')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.subTab, sellingTab === 'inactive' && styles.subTabActive]}
              onPress={() => setSellingTab('inactive')}
            >
              <Text style={[styles.subTabText, sellingTab === 'inactive' && styles.subTabTextActive]}>
                {t('Inactive')}
              </Text>
            </TouchableOpacity>
          </View>

          {sellingLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <FlatList
              data={ads}
              renderItem={renderAdItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={sellingRefreshing} onRefresh={() => fetchAds(true)} />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="megaphone-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>{t('No advertisements found')}</Text>
                </View>
              }
              ListFooterComponent={<SuggestionsFooter sourceRoute="MyAds" />}
            />
          )}
        </View>
      )}

      {/* ── Buying Tab Content ── */}
      {mainTab === 'buying' && (
        <View style={styles.tabContentContainer}>
          {buyingLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <FlatList
              data={buyingItems}
              renderItem={renderBuyingItem}
              keyExtractor={(item) => item.conversationId.toString()}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={buyingRefreshing} onRefresh={() => fetchBuyingItems(true)} />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="bag-handle-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>{t('No active purchases')}</Text>
                </View>
              }
              ListFooterComponent={<SuggestionsFooter sourceRoute="MyAds" />}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 3,
  },
  mainTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 21,
  },
  mainTabActive: {
    backgroundColor: COLORS.primary,
  },
  mainTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555555',
  },
  mainTabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  tabContentContainer: {
    flex: 1,
  },
  subTabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 8,
  },
  subTab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  subTabActive: {
    borderBottomColor: '#000',
  },
  subTabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  subTabTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: '#888',
    marginTop: 12,
  },
  card: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  cardActivityType: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  cardStatusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  activeStatus: {
    color: '#4CAF50',
  },
  inactiveStatus: {
    color: '#9E9E9E',
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  cardButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  cardButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  buyingCard: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  buyingCardImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  buyingCardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  buyingCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  buyingCardPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  buyingCardSeller: {
    fontSize: 12,
    color: '#888',
  },
  actionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff3f0',
    borderColor: '#ffc6b3',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  actionBadgeText: {
    fontSize: 11,
    color: '#ff5722',
    fontWeight: '600',
  },
  buyingCardArrow: {
    marginLeft: 8,
  },
});

export default MyItemsScreen;
