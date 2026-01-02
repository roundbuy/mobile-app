import React, { useState, useEffect } from 'react';
import { IMAGES } from '../../../assets/images';
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

const MyAdsScreen = ({ navigation }) => {
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
      Alert.alert('Error', 'Failed to load your advertisements. Please try again.');
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
    if (activeTab === 'all') return ads;
    return ads.filter(ad => ad.status === activeTab);
  };

  const renderAdItem = ({ item }) => {
    // Map API data to display format
    const imageUri = item.images && item.images.length > 0 ? { uri: item.images[0] } : IMAGES.chair1;
    const activityType = item.activity_name || 'SELL'; // Default to SELL if no activity
    const locationText = item.location_name ? `${item.city || ''}, ${item.country || ''}`.trim() : 'Location not set';
    const daysRemaining = item.end_date ? Math.ceil((new Date(item.end_date) - new Date()) / (1000 * 60 * 60 * 24)) : 60;

    return (
      <TouchableOpacity
        style={styles.adCard}
        onPress={() => handleAdPress(item)}
        activeOpacity={0.7}
      >
        <Image source={imageUri} style={styles.adImage} />

        <View style={styles.adContent}>
          <View style={styles.adHeader}>
            <Text style={styles.adTitle} numberOfLines={2}>{item.title}</Text>
            <View style={[
              styles.typeBadge,
              activityType === 'Sell' && styles.sellBadge,
              activityType === 'Rent' && styles.rentBadge,
              activityType === 'Buy' && styles.buyBadge,
            ]}>
              <Text style={styles.typeBadgeText}>{activityType.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.distanceText}>{locationText}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={16} color="#666" />
              <Text style={styles.statText}>{item.likes_count || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="eye" size={16} color="#666" />
              <Text style={styles.statText}>{item.views_count || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble" size={16} color="#666" />
              <Text style={styles.statText}>{item.messages_count || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="person" size={16} color="#666" />
              <Text style={styles.statText}>{item.watchers_count || 0}</Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <Text style={[
              styles.statusText,
              item.status === 'published' ? styles.activeStatus : styles.inactiveStatus
            ]}>
              {item.status === 'published' ? 'Active' : item.status === 'draft' ? 'Draft' : 'Inactive'}
            </Text>
            <Text style={styles.daysText}>{daysRemaining > 0 ? `${daysRemaining} days remain` : 'Expired'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Global Header */}
      <GlobalHeader
        title="Manage My Ads"
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
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'inactive' && styles.activeTab]}
          onPress={() => setActiveTab('inactive')}
        >
          <Text style={[styles.tabText, activeTab === 'inactive' && styles.activeTabText]}>
            Inactive
          </Text>
        </TouchableOpacity>
      </View>

      {/* Ads List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your ads...</Text>
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
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              )}
            </View>
          }
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
    paddingHorizontal: 16,
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
    color: '#999',
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
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  adImage: {
    width: 100,
    height: 120,
    backgroundColor: '#f5f5f5',
  },
  adContent: {
    flex: 1,
    padding: 12,
  },
  adHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  adTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  sellBadge: {
    backgroundColor: '#4CAF50',
  },
  rentBadge: {
    backgroundColor: '#FF9800',
  },
  buyBadge: {
    backgroundColor: COLORS.primary,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeStatus: {
    color: '#4CAF50',
  },
  inactiveStatus: {
    color: '#999',
  },
  daysText: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
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