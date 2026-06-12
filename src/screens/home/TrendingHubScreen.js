import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { COLORS } from '../../constants/theme';
import { getFullImageUrl } from '../../utils/imageUtils';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40) / 2;

// Premium fallback mock data
const MOCK_GALLERIES = [
  {
    id: 1,
    name: 'Streetwear Essentials',
    hero_image_url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=400&q=80',
    description: 'The hottest urban outfits and hoodies.',
  },
  {
    id: 2,
    name: 'Cozy Knitwear & Jackets',
    hero_image_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    description: 'Stay warm and stylish all season long.',
  },
  {
    id: 3,
    name: 'Vintage & Retro Finds',
    hero_image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80',
    description: 'Timeless denim, graphic tees, and accessories.',
  },
];

const MOCK_FEED = {
  general: [
    { id: 't1', title: 'Retro Oversized Denim Jacket', price: 2999.00, trending_score: 185, images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80'] },
    { id: 't2', title: 'Classic Leather Chelsea Boots', price: 4499.00, trending_score: 142, images: ['https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=400&q=80'] },
    { id: 't3', title: 'Minimalist Canvas Backpack', price: 1899.00, trending_score: 98, images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80'] },
    { id: 't4', title: 'Vintage Round Gold Sunglasses', price: 999.00, trending_score: 230, images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80'] },
  ],
  women: [
    { id: 'w1', title: 'Floral Silk Midi Dress', price: 3499.00, trending_score: 176, images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=400&q=80'] },
    { id: 'w2', title: 'Oversized Wool Blend Knit Sweaters', price: 2199.00, trending_score: 112, images: ['https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&w=400&q=80'] },
  ],
  men: [
    { id: 'm1', title: 'Waterproof Hooded Windbreaker', price: 3999.00, trending_score: 154, images: ['https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=400&q=80'] },
    { id: 'm2', title: 'Premium Heavyweight Crewneck Sweatshirt', price: 1799.00, trending_score: 89, images: ['https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80'] },
  ],
  children: [
    { id: 'c1', title: 'Cute Organic Cotton Dungarees', price: 1299.00, trending_score: 94, images: ['https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=400&q=80'] },
    { id: 'c2', title: 'Kids Colorful Waterproof Rainboots', price: 899.00, trending_score: 77, images: ['https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=400&q=80'] },
  ],
};

const TrendingHubScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'women', 'men', 'children'
  const [galleries, setGalleries] = useState([]);
  const [feedItems, setFeedItems] = useState([]);
  const [loadingGalleries, setLoadingGalleries] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(true);

  useEffect(() => {
    fetchGalleries();
  }, []);

  useEffect(() => {
    fetchTrendingFeed();
  }, [activeTab]);

  const fetchGalleries = async () => {
    try {
      setLoadingGalleries(true);
      const res = await api.get('/trending/galleries');
      if (res.data?.success && res.data?.data?.galleries) {
        setGalleries(res.data.data.galleries);
      } else {
        setGalleries(MOCK_GALLERIES);
      }
    } catch (err) {
      console.error('Error fetching trending galleries:', err);
      setGalleries(MOCK_GALLERIES);
    } finally {
      setLoadingGalleries(false);
    }
  };

  const fetchTrendingFeed = async () => {
    try {
      setLoadingFeed(true);
      const type = activeTab === 'all' ? 'general' : activeTab;
      const res = await api.get(`/trending/feed?type=${type}&limit=20`);
      if (res.data?.success && res.data?.data?.items) {
        setFeedItems(res.data.data.items);
      } else {
        setFeedItems(MOCK_FEED[type] || MOCK_FEED.general);
      }
    } catch (err) {
      console.error('Error fetching trending feed:', err);
      const type = activeTab === 'all' ? 'general' : activeTab;
      setFeedItems(MOCK_FEED[type] || MOCK_FEED.general);
    } finally {
      setLoadingFeed(false);
    }
  };

  const handleProductPress = (item) => {
    navigation.navigate('ProductDetails', { advertisementId: item.id, advertisement: item });
  };

  const handleGalleryPress = (gallery) => {
    navigation.navigate('TrendingGallery', { galleryId: gallery.id, gallery });
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Title */}
      <View style={styles.titleSection}>
        <Text style={styles.titleText}>Popular on RoundBuy</Text>
        <Text style={styles.subtitleText}>The absolute best deals and collections curated near you</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {['all', 'women', 'men', 'children'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Curated Collections Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Top Selling Collections</Text>
        <Text style={styles.sectionSub}>Curated groups of hot items</Text>
      </View>

      {/* Collections Horizontal Scroll */}
      {loadingGalleries ? (
        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 30 }} />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.collectionsContainer}
        >
          {galleries.map((gallery) => (
            <TouchableOpacity
              key={gallery.id}
              style={styles.collectionCard}
              onPress={() => handleGalleryPress(gallery)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: gallery.hero_image_url || 'https://placehold.co/600x800' }}
                style={styles.collectionImage}
              />
              <View style={styles.collectionOverlay}>
                <Text style={styles.collectionName} numberOfLines={1}>{gallery.name}</Text>
                <Text style={styles.collectionDesc} numberOfLines={2}>{gallery.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Trending Items Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trending Right Now</Text>
        <Text style={styles.sectionSub}>Items getting the most views today</Text>
      </View>
    </View>
  );

  const renderFeedItem = ({ item }) => {
    const imageUrl = item.images && item.images.length > 0 ? getFullImageUrl(item.images[0]) : 'https://placehold.co/400';
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.productImage} />
          {item.trending_score && (
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>🔥 {item.trending_score}</Text>
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.productPrice}>₹{parseFloat(item.price).toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Navigation */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Trending Hub</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={feedItems}
        renderItem={renderFeedItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !loadingFeed && (
            <View style={styles.emptyContainer}>
              <Ionicons name="flame-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No trending items found</Text>
            </View>
          )
        }
        ListFooterComponent={
          loadingFeed && (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 30 }} />
          )
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  headerContainer: {
    paddingTop: 16,
  },
  titleSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 14,
    color: '#606060',
    marginTop: 4,
    lineHeight: 18,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#606060',
  },
  activeTabButtonText: {
    fontWeight: '700',
    color: '#000',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  sectionSub: {
    fontSize: 12,
    color: '#808080',
    marginTop: 2,
  },
  collectionsContainer: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 24,
  },
  collectionCard: {
    width: 160,
    height: 220,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  collectionImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  collectionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  collectionName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  collectionDesc: {
    color: '#E0E0E0',
    fontSize: 11,
    lineHeight: 14,
  },
  listContent: {
    paddingBottom: 24,
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  productCard: {
    width: COLUMN_WIDTH,
    marginBottom: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  imageContainer: {
    width: '100%',
    height: COLUMN_WIDTH,
    backgroundColor: '#F7F7F9',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  scoreBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E65100',
  },
  productInfo: {
    padding: 10,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#303030',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 15,
    color: '#808080',
    marginTop: 8,
  },
});

export default TrendingHubScreen;
