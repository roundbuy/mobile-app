import React, { useState, useEffect } from 'react';
import { IMAGES } from '../../../assets/images';
import clicksIcon from '../../../../assets/clicks.png';
import offerIcon from '../../../../assets/Offer.png';
import { getFullImageUrl } from '../../../utils/imageUtils';
import { useTranslation } from '../../../context/TranslationContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { advertisementService } from '../../../services';
import GlobalHeader from '../../../components/GlobalHeader';
import SuggestionsFooter from '../../../components/SuggestionsFooter';

const MyAdsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'active', 'inactive'
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch ads on component mount and when tab changes
  useEffect(() => {
    fetchAds();
  }, [activeTab]);

  const fetchAds = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const options = {
        limit: 50, // Get more ads for better UX
      };

      // Only add status filter if not 'all'
      if (activeTab !== 'all') {
        // Map frontend tab names to database status values
        if (activeTab === 'active') {
          options.status = 'published';
        } else if (activeTab === 'inactive') {
          options.status = 'draft';
        } else {
          options.status = activeTab;
        }
      }

      const response = await advertisementService.getUserAdvertisements(options);

      if (response.success && response.data) {
        const adsData = response.data.advertisements || [];
        setAds(adsData);
      } else {
        setAds([]);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
      Alert.alert(t('Error'), t('Failed to load your advertisements. Please try again.'));
      setAds([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAdPress = (ad) => {
    navigation.navigate('MyAdsDetail', { ad });
  };

  const handleRefresh = () => {
    fetchAds(true);
  };

  // Filter ads based on active tab (client-side filtering for better UX)
  const getFilteredAds = () => {
    // If not 'all', the API already filtered the results, so return everything we have
    // OR we could double check to be safe, but we must use the correct mapping
    if (activeTab === 'all') return ads;

    // Status mapping matches backend
    const statusMap = {
      'active': 'published',
      'inactive': 'draft'
    };

    // If we want to be safe and filter client side too:
    return ads.filter(ad => ad.status === statusMap[activeTab]);
  };

  const renderAdItem = ({ item }) => {
    // Map API data to display format
    let imageSource = IMAGES.chair1;
    try {
      const images = typeof item.images === 'string' ? JSON.parse(item.images) : item.images;
      if (images && images.length > 0) {
        const url = getFullImageUrl(images[0]);
        if (url) imageSource = { uri: url };
      }
    } catch (e) {
      console.log('Error parsing ad image:', e);
    }
    const activityType = item.activity_name || 'SELL'; // Default to SELL if no activity

    return (
      <View style={styles.adCard}>
        <Image source={imageSource} style={styles.adImage} />

        <View style={styles.adContent}>
          <View style={styles.adRow}>
            <Text style={styles.adTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.activityType}>{activityType.toUpperCase()}</Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={[
              styles.statusText,
              item.status === 'published' ? styles.activeStatus : styles.inactiveStatus
            ]}>
              {item.status === 'published' ? 'Active' : item.status === 'draft' ? 'Draft' : 'Inactive'}
            </Text>
            <Text style={styles.validityText}>{t('Continuous')}</Text>
          </View>

          <TouchableOpacity
            style={styles.viewListingButton}
            onPress={() => handleAdPress(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.viewListingButtonText}>{t('View Listing')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Global Header */}
      <GlobalHeader
        title={t('My Listings')}
        navigation={navigation}
        showBackButton={true}
        showIcons={true}
      />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>{t('All')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>{t('Active')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'inactive' && styles.activeTab]}
          onPress={() => setActiveTab('inactive')}
        >
          <Text style={[styles.tabText, activeTab === 'inactive' && styles.activeTabText]}>{t('Inactive')}</Text>
        </TouchableOpacity>
      </View>

      {/* Ads List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('Loading your ads...')}</Text>
        </View>
      ) : (
        <FlatList
          data={getFilteredAds()}
          renderItem={renderAdItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="megaphone-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {isLoading ? 'Loading...' : `No ${activeTab} ads found`}
              </Text>
              {!isLoading && (
                <TouchableOpacity style={styles.retryButton} onPress={() => fetchAds()}>
                  <Text style={styles.retryText}>{t('Retry')}</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          ListFooterComponent={<SuggestionsFooter sourceRoute="MyAds" />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
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
    padding: 16,
  },
  adCard: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#fff',
  },
  adImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  adContent: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  adRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  activityType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  activeStatus: {
    color: '#4CAF50',
  },
  inactiveStatus: {
    color: '#9E9E9E',
  },
  validityText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
  },
  viewListingButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 12,
  },
  viewListingButtonText: {
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

export default MyAdsScreen;