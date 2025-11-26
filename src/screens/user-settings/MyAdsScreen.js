import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

const MyAdsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('active'); // 'all', 'active', 'inactive'

  // Sample data - replace with actual API data
  const [ads, setAds] = useState([
    {
      id: '1',
      title: 'Armchair',
      type: 'SELL',
      distance: '1000 m / 25 min walk',
      image: require('../../../assets/chair1.png'),
      likes: 15,
      views: 5,
      messages: 3,
      watchers: 10,
      status: 'active',
      daysRemaining: 55,
    },
    {
      id: '2',
      title: 'Wooden Chair',
      type: 'RENT',
      distance: '750 m / 15 min walk',
      image: require('../../../assets/chair2.png'),
      likes: 19,
      views: 5,
      messages: 2,
      watchers: 10,
      status: 'active',
      daysRemaining: 35,
    },
    {
      id: '3',
      title: 'Work chair',
      type: 'SELL',
      distance: '250 m / 5 min walk',
      image: require('../../../assets/chair3.png'),
      likes: 19,
      views: 5,
      messages: 2,
      watchers: 10,
      status: 'inactive',
      daysRemaining: 55,
    },
    {
      id: '4',
      title: 'Cosy Chair',
      type: 'BUY',
      distance: '500 m / 10 min walk',
      image: require('../../../assets/chair1.png'),
      likes: 19,
      views: 5,
      messages: 2,
      watchers: 10,
      status: 'active',
      daysRemaining: 35,
    },
  ]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAdPress = (ad) => {
    navigation.navigate('MyAdsDetail', { ad });
  };

  // Filter ads based on active tab
  const getFilteredAds = () => {
    if (activeTab === 'all') return ads;
    return ads.filter(ad => ad.status === activeTab);
  };

  const renderAdItem = ({ item }) => (
    <TouchableOpacity
      style={styles.adCard}
      onPress={() => handleAdPress(item)}
      activeOpacity={0.7}
    >
      <Image source={item.image} style={styles.adImage} />
      
      <View style={styles.adContent}>
        <View style={styles.adHeader}>
          <Text style={styles.adTitle}>{item.title}</Text>
          <View style={[
            styles.typeBadge,
            item.type === 'SELL' && styles.sellBadge,
            item.type === 'RENT' && styles.rentBadge,
            item.type === 'BUY' && styles.buyBadge,
          ]}>
            <Text style={styles.typeBadgeText}>{item.type}</Text>
          </View>
        </View>

        <Text style={styles.distanceText}>Distance: {item.distance}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={16} color="#666" />
            <Text style={styles.statText}>{item.likes}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="eye" size={16} color="#666" />
            <Text style={styles.statText}>{item.views}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble" size={16} color="#666" />
            <Text style={styles.statText}>{item.messages}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="person" size={16} color="#666" />
            <Text style={styles.statText}>{item.watchers}</Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <Text style={[
            styles.statusText,
            item.status === 'active' ? styles.activeStatus : styles.inactiveStatus
          ]}>
            {item.status === 'active' ? 'Active' : 'Inactive'}
          </Text>
          <Text style={styles.daysText}>{item.daysRemaining} days remain</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage My Ads</Text>
        <View style={styles.headerRight} />
      </View>

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
      <FlatList
        data={getFilteredAds()}
        renderItem={renderAdItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="megaphone-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              No {activeTab} ads found
            </Text>
          </View>
        }
      />
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
    fontWeight: '600',
    color: '#000',
  },
  headerRight: {
    width: 32,
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
});

export default MyAdsScreen;