import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Dimensions, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import api from '../../services/api';
import { getFullImageUrl } from '../../utils/imageUtils';

const { width } = Dimensions.get('window');

const ServiceListScreen = ({ route, navigation }) => {
  const { categoryId, categoryName } = route.params || {};
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchServices('');
    setSearchQuery('');
  }, [categoryId]);

  const fetchServices = async (queryVal = searchQuery) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch advertisements with activity_id = 4 (Services) and the selected category_id (subcategory_id in ads)
      const res = await api.get('/advertisements/browse', {
        params: {
          subcategory_id: categoryId,
          activity_id: 4, // Services
          search: queryVal || undefined,
          limit: 50
        }
      });

      if (res.data?.success && res.data?.data?.advertisements) {
        const rawAds = res.data.data.advertisements;
        const flattenedAds = [];
        rawAds.forEach(item => {
          if (item.type === 'promotions' || item.type === 'standard' || item.type === 'showcase' || item.type === 'homemarket') {
            if (item.products && Array.isArray(item.products)) {
              flattenedAds.push(...item.products);
            }
          } else if (item.type === 'homemarket_group') {
            if (item.users) {
              item.users.forEach(u => {
                if (u.products) {
                  flattenedAds.push(...u.products);
                }
              });
            }
          } else if (!item.type || item.type === 'product') {
            flattenedAds.push(item);
          }
        });
        
        // Ensure all listings belong to the correct category to avoid mixing matching ads
        const filteredAds = flattenedAds.filter(ad => ad.subcategory_id === categoryId || ad.category_id === categoryId);
        setServices(filteredAds);
      } else {
        setServices([]);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderServiceCard = ({ item }) => {
    const imageUrl = item.images && item.images.length > 0 ? getFullImageUrl(item.images[0]) : null;
    
    // Generate random rating and reviews count for mock listings
    const mockRating = (4.0 + Math.random() * 1.0).toFixed(1);
    const mockReviewsCount = Math.floor(5 + Math.random() * 45);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ServiceDetails', { advertisementId: item.id })}
      >
        {/* Business Logo/Image */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="construct" size={24} color="#aaa" />
              <Text style={styles.placeholderText}>Service</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          
          {/* Rating */}
          <View style={styles.ratingRow}>
            <View style={styles.starsRow}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < Math.floor(mockRating) ? "star" : "star-outline"}
                  size={14}
                  color="#ffc107"
                />
              ))}
            </View>
            <Text style={styles.ratingText}>{mockRating} ({mockReviewsCount} reviews)</Text>
          </View>

          {/* Starting Price */}
          <Text style={styles.priceText}>
            £{parseFloat(item.price).toFixed(0)} starting price
          </Text>

          {/* Category Label */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{categoryName}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with Search Box */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#aaa" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Services Around You"
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => fetchServices(searchQuery)}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Toggle Button row */}
      <View style={styles.chipRow}>
        <View style={styles.activeChip}>
          <Ionicons name="construct-outline" size={15} color="#0f9d58" style={{ marginRight: 4 }} />
          <Text style={styles.activeChipText}>Services</Text>
        </View>
      </View>

      {/* Category Header */}
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{categoryName}</Text>
        <Text style={styles.servicesCount}>({services.length} available)</Text>
      </View>

      {/* Main List */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchServices}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : services.length === 0 ? (
        <View style={styles.centerBox}>
          <Ionicons name="construct-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No services available in this category</Text>
        </View>
      ) : (
        <FlatList
          data={services}
          renderItem={renderServiceCard}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchText: {
    fontSize: 14,
    color: '#888',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f4ea',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0f9d58',
  },
  activeChipText: {
    fontSize: 13,
    color: '#0f9d58',
    fontWeight: '700',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
  },
  servicesCount: {
    fontSize: 15,
    color: '#888',
    marginLeft: 6,
    fontWeight: '500',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#000',
    fontSize: 14,
    padding: 0,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eef0f2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    marginRight: 14,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  starsRow: {
    flexDirection: 'row',
    marginRight: 6,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 6,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f5f5f5',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 14,
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    marginTop: 12,
  },
});

export default ServiceListScreen;
