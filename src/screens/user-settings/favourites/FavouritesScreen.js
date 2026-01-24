import React, { useState, useEffect } from 'react';
import { IMAGES } from '../../../assets/images';
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
import { COLORS } from '../../../constants/theme';
import { favoritesService } from '../../../services';
import GlobalHeader from '../../../components/GlobalHeader';

const FavouritesScreen = ({ navigation }) => {
    const { t } = useTranslation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);

      // Fetch favorites from API
      const response = await favoritesService.getUserFavorites({ page: 1, limit: 50 });

      if (response.success && response.data) {
        // Format the favorites data
        const formattedFavorites = response.data.favorites.map(fav => ({
          id: fav.advertisement_id,
          title: fav.advertisement?.title || 'Untitled',
          price: fav.advertisement?.price || '0.00',
          images: fav.advertisement?.images ?
            fav.advertisement.images.map(img =>
              img.startsWith('http') ? { uri: img } : { uri: `http://localhost:5001${img}` }
            ) : [IMAGES.chair1],
          category_name: fav.advertisement?.category_name || 'Uncategorized',
          location_name: fav.advertisement?.city || 'Unknown',
          seller_name: fav.advertisement?.seller_name || 'Unknown Seller',
          created_at: fav.created_at,
          advertisement: fav.advertisement,
        }));

        setFavorites(formattedFavorites);
      } else {
        // If API fails, show empty state
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);

      // Check if it's an authentication error
      if (error.message?.includes('token') || error.message?.includes('auth')) {
        Alert.alert(
          t('Authentication Required'),
          t('Please login to view your favorites.'),
          [
            { text: t('Cancel'), style: t('cancel') },
            { text: t('Login'), onPress: () => navigation.navigate('SocialLogin') }
          ]
        );
      } else {
        Alert.alert(t('Error'), t('Failed to load favorites. Please try again.'));
      }

      setFavorites([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFavorites();
  };

  const handleRemoveFavorite = async (advertisementId) => {
    try {
      Alert.alert(
        t('Remove from Favorites'),
        t('Are you sure you want to remove this item from your favorites?'),
        [
          { text: t('Cancel'), style: t('cancel') },
          {
            text: t('Remove'),
            style: t('destructive'),
            onPress: async () => {
              try {
                // Remove from API
                const response = await favoritesService.removeFromFavorites(advertisementId);

                if (response.success) {
                  // Remove from local state
                  setFavorites(prev => prev.filter(item => item.id !== advertisementId));
                  Alert.alert(t('Success'), t('Removed from favorites'));
                } else {
                  Alert.alert(t('Error'), response.message || t('Failed to remove from favorites'));
                }
              } catch (error) {
                console.error('Error removing favorite:', error);
                Alert.alert(t('Error'), t('Failed to remove from favorites. Please try again.'));
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert(t('Error'), t('Failed to remove from favorites'));
    }
  };

  const handleAdPress = (ad) => {
    // Navigate to ad details
    navigation.navigate('ProductDetails', {
      advertisementId: ad.id,
      advertisement: ad.advertisement,
    });
  };

  const renderFavoriteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.favoriteCard}
      onPress={() => handleAdPress(item)}
      activeOpacity={0.7}
    >
      <Image
        source={item.images && item.images.length > 0 ? item.images[0] : IMAGES.chair1}
        style={styles.adImage}
      />

      <View style={styles.adContent}>
        <View style={styles.adHeader}>
          <Text style={styles.adTitle} numberOfLines={2}>{item.title}</Text>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => handleRemoveFavorite(item.id)}
          >
            <Ionicons name="heart" size={20} color="#f44336" />
          </TouchableOpacity>
        </View>

        <Text style={styles.priceText}>₹{item.price}</Text>

        <View style={styles.adDetails}>
          <Text style={styles.categoryText}>{item.category_name}</Text>
          <Text style={styles.locationText}>📍 {item.location_name}</Text>
        </View>

        <Text style={styles.sellerText}>Seller: {item.seller_name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Global Header */}
      <GlobalHeader
        title={t('My Favorites')}
        navigation={navigation}
        showBackButton={true}
        showIcons={true}
      />

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('Loading favorites...')}</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>{t('No favorites yet')}</Text>
              <Text style={styles.emptySubtext}>{t('Items you favorite will appear here')}</Text>
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
  listContent: {
    padding: 16,
  },
  favoriteCard: {
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
    marginBottom: 8,
  },
  adTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  adDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
  },
  sellerText: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default FavouritesScreen;