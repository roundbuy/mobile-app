import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
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

// Fallback items in case API is empty/offline
const MOCK_ITEMS = [
  { id: 'g1', title: 'Vintage Denim Overall Dress', price: 1999.00, trending_score: 95, images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80'] },
  { id: 'g2', title: 'Oversized Pastel Hoodie', price: 1499.00, trending_score: 84, images: ['https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=400&q=80'] },
  { id: 'g3', title: 'Corduroy Shoulder Bag', price: 799.00, trending_score: 73, images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80'] },
  { id: 'g4', title: 'Chunky Retro Trainers', price: 3499.00, trending_score: 110, images: ['https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=400&q=80'] },
];

const TrendingGalleryScreen = ({ route, navigation }) => {
  const { galleryId, gallery: initialGallery } = route.params || {};
  const [gallery, setGallery] = useState(initialGallery || {});
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleryDetailsAndItems();
  }, [galleryId]);

  const fetchGalleryDetailsAndItems = async () => {
    try {
      setLoading(true);
      // Fetch specific gallery items
      const res = await api.get(`/trending/galleries/${galleryId}/items`);
      if (res.data?.success) {
        if (res.data.data.gallery) {
          setGallery(res.data.data.gallery);
        }
        setItems(res.data.data.items || []);
      } else {
        setItems(MOCK_ITEMS);
      }
    } catch (err) {
      console.error('Error fetching gallery items:', err);
      // Set fallbacks
      setItems(MOCK_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (item) => {
    navigation.navigate('ProductDetails', { advertisementId: item.id, advertisement: item });
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Banner / Hero Image */}
      <View style={styles.heroSection}>
        <Image
          source={{ uri: gallery.hero_image_url || 'https://placehold.co/800x600' }}
          style={styles.heroImage}
        />
        <View style={styles.heroOverlay}>
          <Text style={styles.galleryName}>{gallery.name || 'Collection'}</Text>
          <Text style={styles.galleryDesc}>{gallery.description || 'Curated collections selected just for you.'}</Text>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Items in this Collection</Text>
        <Text style={styles.listSub}>{items.length} items available</Text>
      </View>
    </View>
  );

  const renderItemCard = ({ item }) => {
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
      {/* Floating Header Back Button */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.floatingTitle} numberOfLines={1}>
          {gallery.name || 'Collection'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={items}
        renderItem={renderItemCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="gift-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No items found in this gallery</Text>
            </View>
          )
        }
        ListFooterComponent={
          loading && (
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
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  floatingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  heroSection: {
    width: '100%',
    height: 250,
    backgroundColor: '#303030',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  galleryName: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  galleryDesc: {
    color: '#E0E0E0',
    fontSize: 13,
    lineHeight: 18,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  listSub: {
    fontSize: 12,
    color: '#808080',
    marginTop: 2,
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

export default TrendingGalleryScreen;
