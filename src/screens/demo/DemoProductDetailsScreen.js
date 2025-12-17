import React, { useState, useEffect } from 'react';
import { IMAGES } from '../../assets/images';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { demoService } from '../../services/demo.service';

const { width } = Dimensions.get('window');

const DemoProductDetailsScreen = ({ route, navigation }) => {
  const { advertisementId, advertisement } = route?.params || {};

  // State management
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');

  // Fetch advertisement details on mount
  useEffect(() => {
    if (advertisementId) {
      fetchAdvertisementDetails();
    } else if (advertisement) {
      // Use passed advertisement data if available
      setProductData(formatAdvertisementData(advertisement));
      setLoading(false);
    } else {
      setError('No advertisement ID provided');
      setLoading(false);
    }
  }, [advertisementId, advertisement]);

  const fetchAdvertisementDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use demo service to get advertisement details
      const response = await demoService.getDemoAdvertisement(advertisementId);

      if (response.success) {
        const formattedData = formatAdvertisementData(response.data);
        setProductData(formattedData);
        setIsFavorite(false); // Demo mode - no favorites
      } else {
        setError('Failed to load demo advertisement');
      }
    } catch (err) {
      console.error('Error fetching demo advertisement:', err);
      setError(err.message || 'Failed to load demo advertisement');
    } finally {
      setLoading(false);
    }
  };

  const formatAdvertisementData = (ad) => {
    return {
      id: ad.id,
      title: ad.title,
      distance: ad.distance ? `${ad.distance} km` : 'Distance unknown',
      maxDistance: '150 km', // Default max distance
      price: `₹${ad.price}`,
      description: ad.description,
      category: ad.category_name,
      distanceMeters: ad.distance ? `${(ad.distance * 1000).toFixed(0)} m` : 'Distance unknown',
      condition: ad.condition_name,
      gender: ad.gender_name || '',
      age: ad.age_name || 'Any',
      size: ad.size_name || '',
      colour: ad.color_name || '',
      images: ad.images ? ad.images.map(img =>
        img.startsWith('http') ? img : `http://localhost:5001${img}`
      ) : [IMAGES.placeholder],
      seller: {
        id: ad.seller_id,
        username: ad.seller_name || 'Unknown Seller',
        rating: ad.seller?.average_rating || 0,
        avatar: ad.seller?.avatar,
        memberSince: ad.seller?.member_since,
      },
      favorites: 0, // This would need a separate API call
      location: {
        city: ad.city,
        country: ad.country,
      },
      createdAt: ad.created_at,
      viewsCount: ad.views_count || 0,
    };
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleFavorite = () => {
    Alert.alert(
      'Demo Mode',
      'Favorites feature is available in the full version after registration.',
      [{ text: 'OK' }]
    );
  };

  const handleBuy = () => {
    Alert.alert(
      'Demo Mode',
      'Purchase feature is available in the full version after registration.',
      [{ text: 'OK' }]
    );
  };

  const handleMakeOffer = () => {
    Alert.alert(
      'Demo Mode',
      'Make offer feature is available in the full version after registration.',
      [{ text: 'OK' }]
    );
  };

  const handleChatWithSeller = () => {
    Alert.alert(
      'Demo Mode',
      'Chat feature is available in the full version after registration.',
      [{ text: 'OK' }]
    );
  };

  const renderImageDots = () => {
    if (!productData?.images) return null;

    return (
      <View style={styles.dotsContainer}>
        {productData.images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentImageIndex && styles.activeDot,
            ]}
          />
        ))}
      </View>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading advertisement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error || !productData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <FontAwesome name="exclamation-triangle" size={48} color="#ccc" />
          <Text style={styles.errorText}>{error || 'Advertisement not found'}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={advertisementId ? fetchAdvertisementDetails : handleBack}
          >
            <Text style={styles.retryButtonText}>
              {advertisementId ? 'Retry' : 'Go Back'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Demo Product</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: productData.images[currentImageIndex] }}
            style={styles.productImage}
            resizeMode="cover"
            defaultSource={IMAGES.placeholder}
          />
          <TouchableOpacity
            style={[styles.favoriteButton, favoriteLoading && styles.favoriteButtonDisabled]}
            onPress={handleFavorite}
            disabled={favoriteLoading}
          >
            {favoriteLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <FontAwesome
                name={isFavorite ? 'heart' : 'heart-o'}
                size={24}
                color={isFavorite ? COLORS.primary : '#fff'}
              />
            )}
          </TouchableOpacity>
          {renderImageDots()}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.productTitle}>{productData.title}</Text>
            <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
              <Text style={styles.buyButtonText}>BUY {productData.price}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.distanceText}>
            Distance: {productData.distance} / {productData.maxDistance}
          </Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{productData.description}</Text>
        </View>

        {/* Product Details */}
        <View style={styles.section}>
          <DetailRow label="Category" value={productData.category} />
          <DetailRow label="Distance" value={productData.distanceMeters} />
          <DetailRow label="Price" value={productData.price} />
          <DetailRow label="Condition" value={productData.condition} />
          <DetailRow label="Gender" value={productData.gender} />
          <DetailRow label="Age" value={productData.age} />
          <DetailRow label="Size" value={productData.size} />
          <DetailRow label="Colour" value={productData.colour} />
        </View>

        {/* Seller Info */}
        <View style={styles.sellerSection}>
          <View style={styles.sellerRow}>
            <View style={styles.sellerAvatar}>
              {productData.seller.avatar ? (
                <Image
                  source={{ uri: productData.seller.avatar }}
                  style={styles.sellerAvatarImage}
                  resizeMode="cover"
                />
              ) : (
                <FontAwesome name="user" size={24} color="#666" />
              )}
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{productData.seller.username}</Text>
              {productData.seller.rating > 0 && (
                <View style={styles.ratingRow}>
                  <FontAwesome name="star" size={12} color="#FFD700" />
                  <Text style={styles.ratingText}>{productData.seller.rating.toFixed(1)}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.chatButton}
              onPress={handleChatWithSeller}
            >
              <Text style={styles.chatButtonText}>Chat with</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.negotiateText}>
            Agree details! Negotiate price!
          </Text>
        </View>

        {/* Legal Notice */}
        <View style={styles.legalSection}>
          <Text style={styles.legalTitle}>
            Legal notice{' '}
            <Text style={styles.linkText}>click here</Text>
          </Text>
          <Text style={styles.legalText}>
            This legal notice provides the basics rules of the platform for using RoundBuy as a consumer to-consumer marketplace.
          </Text>
          <Text style={styles.legalText}>
            <Text style={styles.boldText}>Example text:</Text> Private sellers are not subject to the Consumer Rights Act 2015, which means items are sold "as described," and buyers have ten days to report an issue through RoundBuy's system.
          </Text>
          <Text style={styles.legalText}>
            <Text style={styles.boldText}>Example text:</Text> Private sellers are not subject to the Consumer Rights Act 2015, which means items are sold "as described," and buyers have ten days to report an issue through RoundBuy's system.
          </Text>
        </View>

        {/* Report Content */}
        <View style={styles.reportSection}>
          <Text style={styles.reportText}>
            Report content{' '}
            <Text style={styles.linkText}>click here</Text>
          </Text>
          <View style={styles.moderateTag}>
            <Text style={styles.moderateText}>Moderate</Text>
          </View>
        </View>

        {/* Additional Legal Info */}
        <View style={styles.legalSection}>
          <Text style={styles.legalText}>
            This legal notice provides the basics rules of the platform for using RoundBuy as a consumer to-consumer marketplace.
          </Text>
          <Text style={styles.legalText}>
            <Text style={styles.boldText}>Example text:</Text> Private sellers are not subject to the Consumer Rights Act 2015, but items must still be "as described," and buyers have ten days to report an issue through RoundBuy's system.
          </Text>
        </View>

        {/* Make Offer Section */}
        <View style={styles.offerSection}>
          <View style={styles.offerInputContainer}>
            <TextInput
              style={styles.offerInput}
              placeholder="Enter offer amount"
              placeholderTextColor="#999"
              value={offerAmount}
              onChangeText={setOfferAmount}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Bottom Buttons */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={styles.makeOfferButton}
            onPress={handleMakeOffer}
          >
            <Text style={styles.makeOfferButtonText}>Make offer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyNowButton} onPress={handleBuy}>
            <Text style={styles.buyNowButtonText}>Buy</Text>
          </TouchableOpacity>
        </View>

        {/* Offer History */}
        <View style={styles.offerHistorySection}>
          <Text style={styles.offerHistoryTitle}>
            Offer History{' '}
            <Text style={styles.linkText}>click here</Text>
          </Text>
          <Text style={styles.offerReceivedText}>
            You received an Offer for £100
          </Text>
          <Text style={styles.offerDeclinedText}>
            You Declined the offer £100
          </Text>
          <Text style={styles.offerReceivedText}>
            You received an offer for £220
          </Text>
          <Text style={styles.offerAcceptedText}>
            You Accepted the offer for £200
          </Text>
        </View>

        {/* Manage Offers */}
        <TouchableOpacity style={styles.manageOffersButton}>
          <Text style={styles.manageOffersText}>Manage offers</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
    backgroundColor: '#f5f5f5',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  favoriteButtonDisabled: {
    opacity: 0.6,
  },
  favoriteCount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: '#fff',
  },
  productInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  buyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  distanceText: {
    fontSize: 13,
    color: '#666',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  sellerSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sellerAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  chatButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  negotiateText: {
    fontSize: 12,
    color: '#666',
  },
  legalSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  legalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  linkText: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  legalText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: '700',
    color: '#000',
  },
  reportSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  reportText: {
    fontSize: 12,
    color: '#666',
  },
  moderateTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  moderateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  offerSection: {
    padding: 16,
  },
  offerInputContainer: {
    marginBottom: 16,
  },
  offerInput: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#000',
  },
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  makeOfferButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  makeOfferButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyNowButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  offerHistorySection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  offerHistoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  offerReceivedText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  offerDeclinedText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  offerAcceptedText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  manageOffersButton: {
    margin: 16,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  manageOffersText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default DemoProductDetailsScreen;