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
import { advertisementService, favoritesService } from '../../services';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/TranslationContext';
import { getFullImageUrl, getAllImageUrls } from '../../utils/imageUtils';
import GlobalHeader from '../../components/GlobalHeader';
import ProductInfoModal from '../../components/ProductInfoModal';
import ResponseMetrics from '../../components/ResponseMetrics';

const { width } = Dimensions.get('window');

const getBadgeConfig = (badge) => {
  const level = badge.level?.toLowerCase();
  const type = badge.type?.toLowerCase();

  // Membership Badges
  if (type === 'membership') {
    switch (level) {
      case 'gold': return { color: '#FFD700', icon: 'star', label: 'Gold' };
      case 'green': return { color: '#4CAF50', icon: 'shield', label: 'Member' };
      case 'orange': return { color: '#FF9800', icon: 'flash', label: 'Member' };
      default: return { color: COLORS.primary, icon: 'user', label: 'Member' };
    }
  }

  // Reward Badges
  if (type === 'reward') {
    switch (level) {
      case 'lottery': return { color: '#9C27B0', icon: 'ticket', label: 'Lottery' };
      case 'top_search': return { color: '#2196F3', icon: 'search', label: 'Top Search' };
      default: return { color: COLORS.primary, icon: 'gift', label: 'Reward' };
    }
  }

  // Visibility Plans
  switch (level) {
    case 'rise_to_top': return { color: '#FF5722', icon: 'rocket', label: 'Rise Up' };
    case 'top_spot': return { color: '#E91E63', icon: 'trophy', label: 'Top Spot' };
    case 'show_casing': return { color: '#673AB7', icon: 'diamond', label: 'Showcase' };
    case 'targeted': return { color: '#00BCD4', icon: 'navigate', label: 'Targeted' };
    case 'fast_ad': return { color: '#FFC107', icon: 'flash', label: 'Fast' }; // Using flash for fast ad too
    case 'urgent': return { color: '#FF4500', icon: 'alert-circle', label: 'Urgent' };
    case 'featured': return { color: '#9370DB', icon: 'star', label: 'Featured' };
    default: return { color: COLORS.primary, icon: 'bookmark', label: level?.toUpperCase() || 'Badge' };
  }
};

// New helper for membership badges based on plan
const getMembershipConfig = (membership) => {
  if (!membership) return null;

  // Default config
  let config = {
    color: membership.color || '#2196F3',
    icon: 'ribbon',
    label: membership.name
  };

  const slug = membership.slug?.toLowerCase();

  if (slug?.includes('gold')) {
    config.icon = 'star';
    config.color = '#FFD700'; // Gold override
  } else if (slug?.includes('silver')) {
    config.icon = 'shield';
    config.color = '#C0C0C0';
  } else if (slug?.includes('platinum')) {
    config.icon = 'trophy';
    config.color = '#E5E4E2';
  } else if (slug?.includes('business')) {
    config.icon = 'briefcase';
  }

  return config;
};

const ProductDetailsScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { advertisementId, advertisement, showcaseGroupId, showcaseIndex } = route?.params || {};
  const { user, hasActiveSubscription } = useAuth();

  // State management
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [infoModal, setInfoModal] = useState({ visible: false, title: '', content: '' });
  const [sellerMetrics, setSellerMetrics] = useState(null);

  // Showcase navigation state
  const [showcaseProducts, setShowcaseProducts] = useState([]);
  const [currentShowcaseIndex, setCurrentShowcaseIndex] = useState(showcaseIndex || 0);

  // HomeMarket navigation state
  const [homeMarketProducts, setHomeMarketProducts] = useState([]);
  const [currentHomeMarketUserIndex, setCurrentHomeMarketUserIndex] = useState(route?.params?.homeMarketUserIndex || 0);
  const [currentHomeMarketIndex, setCurrentHomeMarketIndex] = useState(route?.params?.homeMarketIndex || 0);
  const homeMarketTier = route?.params?.homeMarketTier;

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

  useEffect(() => {
    if (productData) {
      console.log('📦 Product Data:', JSON.stringify(productData, null, 2));
      console.log('🏷️ Badges:', JSON.stringify(productData.badges, null, 2));
    }
  }, [productData]);

  const fetchAdvertisementDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await advertisementService.getAdvertisementDetails(advertisementId);

      if (response.success) {
        const formattedData = formatAdvertisementData(response.data.advertisement);
        setProductData(formattedData);
        setIsFavorite(response.data.advertisement.is_favorited || false);
      } else {
        setError('Failed to load advertisement details');
      }
    } catch (err) {
      console.error('Error fetching advertisement details:', err);
      setError(err.message || 'Failed to load advertisement details');

      // Handle specific errors
      if (err.require_subscription) {
        Alert.alert(
          t('Subscription Required'),
          t('You need an active subscription to view advertisement details.'),
          [{ text: t('View Plans'), onPress: () => navigation.navigate('AllMemberships') }]
        );
      } else if (err.require_login) {
        Alert.alert(
          t('Login Required'),
          t('Please login to view advertisement details.'),
          [{ text: t('Login'), onPress: () => navigation.navigate('SocialLogin') }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productData?.seller?.id) {
      // fetchSellerMetrics(productData.seller.id);
    }
  }, [productData?.seller?.id]);

  // Fetch showcase products if this product is part of a showcase
  useEffect(() => {
    if (showcaseGroupId) {
      fetchShowcaseProducts();
    }
  }, [showcaseGroupId]);

  const fetchShowcaseProducts = async () => {
    try {
      const response = await api.get('/advertisements/browse', {
        params: { page: 1, limit: 100 }
      });

      if (response.data.success) {
        const ads = response.data.data.advertisements;
        const showcase = ads.find(item =>
          item.type === 'showcase' && item.showcase_group_id === showcaseGroupId
        );

        if (showcase && showcase.products) {
          setShowcaseProducts(showcase.products);
          console.log(`📦 Loaded ${showcase.products.length} showcase products`);
        }
      }
    } catch (error) {
      console.error('Error fetching showcase products:', error);
    }
  };

  // Fetch HomeMarket products if this product is part of a HomeMarket
  useEffect(() => {
    if (homeMarketTier) {
      fetchHomeMarketProducts();
    }
  }, [homeMarketTier]);

  const fetchHomeMarketProducts = async () => {
    try {
      // Fetch products for the specific tier
      const response = await api.get('/advertisements/browse', {
        params: {
          page: 1,
          limit: 100,
          latitude: user?.latitude,
          longitude: user?.longitude,
          radius: 50
        }
      });

      if (response.data.success) {
        const ads = response.data.data.advertisements;
        // Find the HomeMarket group
        const homemarketGroup = ads.find(item => item.type === 'homemarket_group');

        if (homemarketGroup && homemarketGroup.users && homemarketGroup.users.length > currentHomeMarketUserIndex) {
          const userProducts = homemarketGroup.users[currentHomeMarketUserIndex].products;
          if (userProducts) {
            setHomeMarketProducts(userProducts);
            console.log(`🏠 Loaded ${userProducts.length} HomeMarket products for user index ${currentHomeMarketUserIndex}`);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching HomeMarket products:', error);
    }
  };

  const handlePreviousHomeMarketProduct = () => {
    if (currentHomeMarketIndex > 0 && homeMarketProducts.length > 0) {
      const newIndex = currentHomeMarketIndex - 1;
      const nextProduct = homeMarketProducts[newIndex];
      setCurrentHomeMarketIndex(newIndex);

      navigation.replace('ProductDetails', {
        advertisementId: nextProduct.id,
        homeMarketTier: homeMarketTier,
        homeMarketUserIndex: currentHomeMarketUserIndex,
        homeMarketIndex: newIndex
      });
    }
  };

  const handleNextHomeMarketProduct = () => {
    if (currentHomeMarketIndex < homeMarketProducts.length - 1) {
      const newIndex = currentHomeMarketIndex + 1;
      const nextProduct = homeMarketProducts[newIndex];
      setCurrentHomeMarketIndex(newIndex);

      navigation.replace('ProductDetails', {
        advertisementId: nextProduct.id,
        homeMarketTier: homeMarketTier,
        homeMarketUserIndex: currentHomeMarketUserIndex,
        homeMarketIndex: newIndex
      });
    }
  };

  const fetchSellerMetrics = async (sellerId) => {
    try {
      const response = await api.get(`/seller-metrics/${sellerId}`);
      if (response.data.success) {
        setSellerMetrics(response.data.data);
      }
    } catch (error) {
      console.log('Error fetching seller metrics:', error);
    }
  };

  const formatAdvertisementData = (ad) => {
    return {
      id: ad.id,
      title: ad.title,
      distance: ad.distance ? `${ad.distance} km` : 'Distance unknown',
      maxDistance: '150 km', // Default max distance
      price: `${ad.price}`,
      description: ad.description,
      category: ad.category_name,
      distanceMeters: ad.distance ? `${(ad.distance * 1000).toFixed(0)} m` : 'Distance unknown',
      condition: ad.condition_name,
      gender: ad.gender_name || '',
      age: ad.age_name || 'Any',
      size: ad.size_name || '',
      colour: ad.color_name || '',
      images: ad.images ? getAllImageUrls(ad.images) : [IMAGES.placeholder],
      seller: {
        id: ad.seller_id,
        username: ad.seller_name || 'Unknown Seller',
        rating: ad.seller?.average_rating || 0,
        avatar: ad.seller?.avatar,
        memberSince: ad.seller?.member_since,
        membership: ad.seller?.membership, // Add membership data here
      },
      favorites: 0, // This would need a separate API call
      location: {
        city: ad.city,
        country: ad.country,
      },
      createdAt: ad.created_at,
      viewsCount: ad.views_count || 0,
      badges: ad.badges || [],
    };
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleFavorite = () => {
    if (!user) {
      Alert.alert(
        t('Login Required'),
        t('Please login to add items to favorites.'),
        [
          { text: t('Cancel'), style: t('cancel') },
          { text: t('Login'), onPress: () => navigation.navigate('SocialLogin') }
        ]
      );
      return;
    }

    // Toggle favorite locally (API integration pending backend fix)
    setIsFavorite(prev => !prev);
  };

  const handleBuy = async () => {
    if (!user) {
      Alert.alert(t('Login Required'), t('Please login to buy items.'));
      return;
    }

    try {
      setLoading(true);

      // 1. Get Wallet Balance and Fees
      const [walletRes, feesRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/pickups/fees')
      ]);

      const wallet = walletRes.data.data.wallet;
      const fees = feesRes.data.fees;

      const balance = parseFloat(wallet.balance);
      const buyerFee = parseFloat(fees.pickup_fee) + parseFloat(fees.safe_service_fee); // Assuming automatic deduction covers these

      if (balance < buyerFee) {
        Alert.alert(
          t('Insufficient Balance'),
          t(`You need £${buyerFee.toFixed(2)} in your wallet to cover the Buyer's Fee. Your current balance is £${balance.toFixed(2)}.`),
          [
            { text: t('Cancel'), style: 'cancel' },
            {
              text: t('Top Up'),
              onPress: () => navigation.navigate('WalletTopup', {
                amount: (buyerFee - balance).toFixed(2), // Suggest needed amount
                minAmount: 5 // Or generic min
              })
            }
          ]
        );
        setLoading(false);
        return;
      }

      // 2. Confirm Purchase
      Alert.alert(
        t('Confirm Purchase'),
        t(`Are you sure you want to buy this item? A fee of £${buyerFee.toFixed(2)} will be deducted from your wallet.`),
        [
          { text: t('Cancel'), style: 'cancel', onPress: () => setLoading(false) },
          {
            text: t('Buy Now'),
            onPress: async () => {
              try {
                // 3. Call Buy API
                const buyRes = await api.post('/offers/buy', { advertisementId: productData.id });

                if (buyRes.data.success) {
                  Alert.alert(
                    t('Success'),
                    t('Item purchased successfully! Please schedule your pickup.'),
                    [
                      {
                        text: t('Schedule Pickup'),
                        onPress: () => {
                          // Navigate with minimal data, let screen fetch details
                          navigation.navigate('SchedulePickUp', {
                            offerId: buyRes.data.offer_id, // Use new offer ID
                            advertisementId: productData.id,
                            advertisementTitle: productData.title
                          });
                        }
                      }
                    ]
                  );
                }
              } catch (buyError) {
                console.error('Buy error:', buyError);
                const msg = buyError.response?.data?.message || t('Failed to complete purchase');
                Alert.alert(t('Error'), msg);
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );

    } catch (error) {
      console.error('Pre-buy check error:', error);
      Alert.alert(t('Error'), t('Failed to initiate purchase. Please check your connection.'));
      setLoading(false);
    }
  };

  const handleManageOffers = () => {
    navigation.navigate('ManageOffers', {
      advertisementId: productData?.id,
      otherPartyId: productData?.seller?.id || productData?.user_id,
      adTitle: productData?.title,
      sellerName: productData?.seller?.username || productData?.seller?.full_name || 'Seller'
    });
  };

  // Info content for different fields
  const infoContent = {
    Distance: "The distance shown is calculated from your current location or saved address to the seller's location. The walking time is an estimate based on average walking speed.",
    Condition: "The condition describes the current state of the item:\n\n• New: Brand new, unused item\n• Like New: Barely used, excellent condition\n• Very Good: Gently used, minor wear\n• Good: Used with visible signs of wear\n• Fair: Well-used, functional but worn\n• Poor: Heavy wear, may need repairs",
    Colour: "The color of the item as described by the seller. Actual color may vary slightly due to lighting and screen settings.",
    Responsiveness: "Metrics indicating the seller's reliability:\n\n• Response Rate: Average time to reply to messages.\n• Pick Up Rate: Percentage of successful meetings for pickup/exchange.",
  };

  const handleInfoPress = (label) => {
    if (infoContent[label]) {
      setInfoModal({
        visible: true,
        title: label,
        content: infoContent[label],
      });
    }
  };

  const closeInfoModal = () => {
    setInfoModal({ visible: false, title: '', content: '' });
  };

  const handleMakeOffer = () => {
    navigation.navigate('ProductChat', {
      product: productData,
      mode: 'makeOffer',
    });
  };

  const handleChatWithSeller = () => {
    navigation.navigate('ProductChat', {
      product: productData,
      mode: 'chat',
    });
  };

  const handlePurchaseVisibility = () => {
    // Navigate to Purchase Visibility screen
    console.log('Purchase Visibility clicked');
    // navigation.navigate('PurchaseVisibility', { advertisementId: productData.id });
  };

  const handleReadFeedbacks = () => {
    navigation.navigate('UserFeedbacks', {
      userId: productData.seller.id,
      userName: productData.seller.username
    });
  };

  const handleUserListings = () => {
    navigation.navigate('UserListings', {
      sellerId: productData.seller.id,
      sellerName: productData.seller.username
    });
  };

  const handleSchedulePickup = async () => {
    // Check if user has an accepted offer for this product
    if (!productData) {
      Alert.alert(t('Error'), t('Product data not available'));
      return;
    }

    try {
      setLoading(true);
      // Fetch user's accepted offers for this ad
      // Using existing service method if available or generic generic offers fetch
      const response = await api.get('/offers', {
        params: {
          status: 'accepted',
          // We don't have ad ID filter in generic 'offers' endpoint documentation directly?
          // Offers controller has separate `getAdvertisementOffers` but that returns all.
          // Let's filter client side or use getAdvertisementOffers.
        }
      });

      // Actually, assuming user is BUYER.
      // Let's use `getAdvertisementOffers` (requires us to parse owner/buyer logic).
      const offersRes = await api.get(`/offers/advertisement/${productData.id}`);

      let acceptedOffer = null;
      if (offersRes.data.success) {
        // Find accepted offer where I am the buyer
        acceptedOffer = offersRes.data.offers.find(o => o.status === 'accepted' && o.buyer_id === user.id);
      }

      if (acceptedOffer) {
        navigation.navigate('SchedulePickUp', {
          offerId: acceptedOffer.id,
          advertisementId: productData.id,
          advertisementTitle: productData.title
        });
      } else {
        Alert.alert(t('No Accepted Offer'), t('You do not have an accepted offer for this item yet.'));
      }

    } catch (err) {
      console.error('Check offer error', err);
      Alert.alert(t('Error'), t('Failed to verify offer status.'));
    } finally {
      setLoading(false);
    }
  };

  // Showcase navigation handlers
  const handlePreviousShowcaseProduct = () => {
    if (currentShowcaseIndex > 0 && showcaseProducts.length > 0) {
      const newIndex = currentShowcaseIndex - 1;
      const nextProduct = showcaseProducts[newIndex];
      setCurrentShowcaseIndex(newIndex);

      // Navigate to the previous product
      navigation.replace('ProductDetails', {
        advertisementId: nextProduct.id,
        showcaseGroupId: showcaseGroupId,
        showcaseIndex: newIndex
      });
    }
  };

  const handleNextShowcaseProduct = () => {
    if (currentShowcaseIndex < showcaseProducts.length - 1) {
      const newIndex = currentShowcaseIndex + 1;
      const nextProduct = showcaseProducts[newIndex];
      setCurrentShowcaseIndex(newIndex);

      // Navigate to the next product
      navigation.replace('ProductDetails', {
        advertisementId: nextProduct.id,
        showcaseGroupId: showcaseGroupId,
        showcaseIndex: newIndex
      });
    }
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
          <Text style={styles.loadingText}>{t('Loading advertisement...')}</Text>
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
      {/* Global Header */}
      <GlobalHeader
        title={t('Product')}
        navigation={navigation}
        showBackButton={true}
        showIcons={true}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Image Gallery */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(newIndex);
            }}
            scrollEventThrottle={16}
          >
            {productData.images && productData.images.length > 0 ? (
              productData.images.map((img, index) => (
                <Image
                  key={index}
                  source={{ uri: getFullImageUrl(img) }}
                  style={[styles.productImage, { width: width }]}
                  resizeMode="cover"
                  defaultSource={IMAGES.placeholder}
                />
              ))
            ) : (
              <Image
                source={IMAGES.placeholder}
                style={[styles.productImage, { width: width }]}
                resizeMode="cover"
              />
            )}
          </ScrollView>

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavorite}
          >
            <FontAwesome
              name={isFavorite ? 'heart' : 'heart-o'}
              size={24}
              color="#333"
            />
          </TouchableOpacity>
          {productData.badges && productData.badges.length > 0 && (
            <View style={styles.badgesWrapper}>
              {/* 1. Only show visibility badges here */}
              {productData.badges.filter(b => b.type === 'visibility').map((badge, index) => {
                const config = getBadgeConfig(badge);
                return (
                  <View key={index} style={[styles.badgeContainer, { backgroundColor: config.color }]}>
                    <Ionicons name={config.icon} size={10} color="#fff" style={{ marginRight: 4 }} />
                    <Text style={styles.badgeText}>{config.label}</Text>
                  </View>
                );
              })}
            </View>
          )}
          {/* Showcase Navigation Arrows */}
          {showcaseProducts.length > 0 && (
            <>
              {currentShowcaseIndex > 0 && (
                <TouchableOpacity
                  style={[styles.showcaseNavButton, styles.showcaseNavLeft]}
                  onPress={handlePreviousShowcaseProduct}
                >
                  <Ionicons name="chevron-back" size={32} color="#fff" />
                </TouchableOpacity>
              )}

              {currentShowcaseIndex < showcaseProducts.length - 1 && (
                <TouchableOpacity
                  style={[styles.showcaseNavButton, styles.showcaseNavRight]}
                  onPress={handleNextShowcaseProduct}
                >
                  <Ionicons name="chevron-forward" size={32} color="#fff" />
                </TouchableOpacity>
              )}

              {/* Showcase Counter */}
              <View style={styles.showcaseCounter}>
                <Ionicons name="diamond" size={12} color="#fff" style={{ marginRight: 4 }} />
                <Text style={styles.showcaseCounterText}>
                  {currentShowcaseIndex + 1} / {showcaseProducts.length}
                </Text>
              </View>
            </>
          )}
          {renderImageDots()}

          {/* HomeMarket Navigation Arrows */}
          {homeMarketProducts.length > 0 && (
            <>
              {currentHomeMarketIndex > 0 && (
                <TouchableOpacity
                  style={[styles.showcaseNavButton, styles.showcaseNavLeft]}
                  onPress={handlePreviousHomeMarketProduct}
                >
                  <Ionicons name="chevron-back" size={32} color="#fff" />
                </TouchableOpacity>
              )}

              {currentHomeMarketIndex < homeMarketProducts.length - 1 && (
                <TouchableOpacity
                  style={[styles.showcaseNavButton, styles.showcaseNavRight]}
                  onPress={handleNextHomeMarketProduct}
                >
                  <Ionicons name="chevron-forward" size={32} color="#fff" />
                </TouchableOpacity>
              )}

              {/* HomeMarket Counter */}
              <View style={[styles.showcaseCounter, { backgroundColor: 'rgba(255, 140, 0, 0.9)' }]}>
                <Text style={styles.showcaseCounterText}>
                  HomeMarket {currentHomeMarketIndex + 1} / {homeMarketProducts.length}
                </Text>
              </View>
            </>
          )}

        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>{productData.title}</Text>
          <Text style={styles.distanceText}>
            Distance: {productData.distance} / {productData.maxDistance}
          </Text>
          <Text style={styles.productPrice}>{productData.price}</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Description')}</Text>
          <Text style={styles.descriptionText}>{productData.description}</Text>
        </View>

        {/* Product Details */}
        <View style={styles.section}>
          <DetailRow label={t('Category')} value={productData.category} onInfoPress={handleInfoPress} />
          <DetailRow label={t('Distance')} value={productData.distanceMeters} onInfoPress={handleInfoPress} />
          <DetailRow label={t('Condition')} value={productData.condition} onInfoPress={handleInfoPress} />
          <DetailRow label={t('Gender')} value={productData.gender} onInfoPress={handleInfoPress} />
          <DetailRow label={t('Age')} value={productData.age} onInfoPress={handleInfoPress} />
          <DetailRow label={t('Size')} value={productData.size} onInfoPress={handleInfoPress} />
          <DetailRow label={t('Colour')} value={productData.colour} onInfoPress={handleInfoPress} />
        </View>

        {/* Seller Info */}
        <View style={styles.sellerSection}>
          <View style={styles.sellerRow}>
            <View style={styles.sellerAvatar}>
              {productData.seller.avatar ? (
                <Image
                  source={{ uri: getFullImageUrl(productData.seller.avatar) }}
                  style={styles.sellerAvatarImage}
                  resizeMode="cover"
                />
              ) : (
                <FontAwesome name="user" size={24} color="#505050" />
              )}
            </View>
            <View style={styles.sellerInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.sellerName}>{productData.seller.username}</Text>
                {/* 2. Add Membership Badge based on seller subscription */}
                {(() => {
                  const membership = productData.seller.membership;
                  if (membership) {
                    const config = getMembershipConfig(membership);
                    if (config) {
                      return (
                        <View style={[styles.badgeContainer, { backgroundColor: config.color, marginLeft: 8, paddingVertical: 2, borderRadius: 8 }]}>
                          <Ionicons name={config.icon} size={10} color="#fff" style={{ marginRight: 4 }} />
                          <Text style={[styles.badgeText, { fontSize: 10 }]}>{config.label}</Text>
                        </View>
                      );
                    }
                  }
                  return null;
                })()}
              </View>
              {productData.seller.rating >= 0 && (
                <View style={styles.ratingStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FontAwesome
                      key={star}
                      name={star <= 4.5 ? "star" : "star-o"}
                      size={14}
                      color="#FFD700"
                      style={{ marginRight: 2 }}
                    />
                  ))}
                </View>
              )}
            </View>
            <View style={styles.sellerLinksRight}>
              {/* Read Users Feedbacks - Button at the top */}
              <TouchableOpacity
                style={styles.sellerLinkButton}
                onPress={handleReadFeedbacks}
              >
                <Text style={styles.sellerLinkButtonText}>{t('User Feedbacks')}</Text>
              </TouchableOpacity>

              {/* User's Listings Button - Below metrics */}
              <TouchableOpacity
                style={[styles.sellerLinkButton, { marginTop: 8 }]}
                onPress={handleUserListings}
              >
                <Ionicons name="list-outline" size={16} color="#000" style={{ marginRight: 6 }} />
                <Text style={styles.sellerLinkButtonText}>{t("User's Listings")}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Response Metrics Component */}
          {/* <ResponseMetrics
            metrics={sellerMetrics}
            onPressInfo={() => handleInfoPress('Responsiveness')}
          /> */}

          {/* Chat with seller button */}
          <TouchableOpacity
            style={styles.chatWithSellerButton}
            onPress={handleChatWithSeller}
          >

            <Text style={styles.chatWithSellerButtonText}>{t('Chat with seller')}</Text>
          </TouchableOpacity>
        </View>

        {/* Legal Notice */}
        <View style={styles.legalSection}>
          <Text style={styles.legalTitle}>
            Legal notice{' '}
            <Text style={styles.linkText}>{t('click here')}</Text>
          </Text>
          <Text style={styles.legalText}>{t('This legal notice provides the basics rules of the platform for using RoundBuy as a consumer to-consumer marketplace.')}</Text>
          <Text style={styles.legalText}>
            <Text style={styles.boldText}>{t('Example text:')}</Text> Private sellers are not subject to the Consumer Rights Act 2015, which means items are sold "as described," and buyers have ten days to report an issue through RoundBuy's system.
          </Text>
          <Text style={styles.legalText}>
            <Text style={styles.boldText}>{t('Example text:')}</Text> Private sellers are not subject to the Consumer Rights Act 2015, which means items are sold "as described," and buyers have ten days to report an issue through RoundBuy's system.
          </Text>
        </View>

        {/* Report Content */}
        <View style={styles.reportSection}>
          <Text style={styles.reportText}>
            Report content{' '}
            <Text style={styles.linkText}>{t('click here')}</Text>
          </Text>
          <View style={styles.moderateTag}>
            <Text style={styles.moderateText}>{t('Moderate')}</Text>
          </View>
        </View>

        {/* Additional Legal Info */}
        <View style={styles.legalSection}>
          <Text style={styles.legalText}>{t('This legal notice provides the basics rules of the platform for using RoundBuy as a consumer to-consumer marketplace.')}</Text>
          <Text style={styles.legalText}>
            <Text style={styles.boldText}>{t('Example text:')}</Text> Private sellers are not subject to the Consumer Rights Act 2015, but items must still be "as described," and buyers have ten days to report an issue through RoundBuy's system.
          </Text>
        </View>

        {/* Make Offer Section */}
        <View style={styles.offerSection}>
          <View style={styles.offerInputContainer}>
            <TextInput
              style={styles.offerInput}
              placeholder={t('Enter offer amount')}
              placeholderTextColor="#303234"
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
            <Text style={styles.makeOfferButtonText}>{t('Make offer')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyNowButton} onPress={handleManageOffers}>
            <Text style={styles.buyNowButtonText}>{t('Manage Offers')}</Text>
          </TouchableOpacity>
        </View>

        {/* Offer History */}
        <View style={styles.offerHistorySection}>
          <Text style={styles.offerHistoryTitle}>
            Offer History{' '}
            <Text style={styles.linkText}>{t('click here')}</Text>
          </Text>
          <Text style={styles.offerReceivedText}>{t('You received an Offer for £100')}</Text>
          <Text style={styles.offerDeclinedText}>{t('You Declined the offer £100')}</Text>
          <Text style={styles.offerReceivedText}>{t('You received an offer for £220')}</Text>
          <Text style={styles.offerAcceptedText}>{t('You Accepted the offer for £200')}</Text>
        </View>

        {/* Pick Up & Exchange Section */}
        <View style={styles.pickupSection}>
          {/* Buyer's Fee */}
          <View style={styles.buyerFeeSection}>
            <Text style={styles.buyerFeeTitle}>{t("Buyer's Fee £1.00")}</Text>
            <Text style={styles.buyerFeeDescription}>
              Buyer's Fee consists of Pick Up & Exchange Fee £0.70 and Service Fee £0.30. This fee is only for Buyer's, after successfull inspection and exchange to cover the expenses of the service.{' '}
              <Text style={styles.linkTextBlue}>{t('Refund policy')}</Text> and{' '}
              <Text style={styles.linkTextBlue}>{t('Consumer Rights Act 2015')}</Text>.
            </Text>
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimerSection}>
            <Text style={styles.disclaimerTitle}>
              <Text style={styles.linkTextBlue}>{t('Disclaimer & Legal notice')}</Text> click here
            </Text>
          </View>

          {/* Pick Up & Exchange Info */}
          <View style={styles.pickupInfoSection}>
            <Text style={styles.pickupTitle}>{t('Pick Up & Exchange')}</Text>
            <Text style={styles.pickupOfferText}>
              Seller has answered you your offer of £245.00:{' '}
              <Text style={styles.offerAmount}>£250.00</Text>
            </Text>
            <Text style={styles.acceptedText}>{t('Accepted for £245.00')}</Text>
            <Text style={styles.pickupInstructions}>
              Now schedule a Pick up & Exchange!{'\n'}
              Arrange a meet up with the other user to inspect the product, and make an exchange.
            </Text>
          </View>

          {/* Schedule Button */}
          <TouchableOpacity
            style={styles.schedulePickupButton}
            onPress={handleSchedulePickup}
          >
            <Text style={styles.schedulePickupButtonText}>{t('Schedule a Pick Up')}</Text>
          </TouchableOpacity>
        </View>

        {/* Issue a Dispute Link */}
        <TouchableOpacity
          style={styles.issueDisputeLink}
          onPress={() => navigation.navigate('CreateIssue', {
            advertisementId: productData?.id,
            otherPartyId: productData?.seller?.id || productData?.user_id,
            adTitle: productData?.title,
            sellerName: productData?.seller?.username || productData?.seller?.full_name || 'Seller'
          })}
        >
          <Ionicons name="alert-circle-outline" size={20} color="#DC143C" />
          <Text style={styles.issueDisputeLinkText}>{t('Issue a Dispute')}</Text>
          <Ionicons name="chevron-forward" size={20} color="#303234" />
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Info Modal */}
      <ProductInfoModal
        visible={infoModal.visible}
        onClose={closeInfoModal}
        title={infoModal.title}
        content={infoModal.content}
      />
    </SafeAreaView >
  );
};

const DetailRow = ({ label, value, onInfoPress }) => {
  const hasInfo = ['Distance', 'Condition', 'Colour'].includes(label);

  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLabelContainer}>
        <Text style={styles.detailLabel}>{label}</Text>
        {hasInfo && (
          <TouchableOpacity
            onPress={() => onInfoPress(label)}
            style={styles.infoButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="information-circle-outline" size={18} color="#505050" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
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
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#505050',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgesWrapper: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    zIndex: 10,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    // marginLeft: 4,
  },
  errorText: {
    fontSize: 16,
    color: '#505050',
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
    padding: 8,
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
    color: '#505050',
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
    color: '#505050',
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoButton: {
    marginLeft: 6,
    padding: 2,
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
    alignItems: 'top',
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
    marginBottom: 4,
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerLinksRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  sellerLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: 140,
    // maxWidth: 160,
    justifyContent: 'center',
  },
  sellerLinkButtonText: {
    fontSize: 13,
    color: '#000',
    fontWeight: '600',
  },
  sellerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  sellerLinkText: {
    fontSize: 12,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  sellerLinkSeparator: {
    fontSize: 12,
    color: '#505050',
    marginHorizontal: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#505050',
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
  chatWithSellerButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  chatWithSellerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  purchaseVisibilityButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  purchaseVisibilityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  negotiateText: {
    fontSize: 12,
    color: '#505050',
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
    color: '#505050',
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
    color: '#505050',
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
    color: '#505050',
    marginBottom: 6,
  },
  offerDeclinedText: {
    fontSize: 12,
    color: '#505050',
    marginBottom: 6,
  },
  offerAcceptedText: {
    fontSize: 12,
    color: '#505050',
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
  pickupSection: {
    margin: 16,
    marginTop: 8,
  },
  buyerFeeSection: {
    marginBottom: 12,
  },
  buyerFeeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 6,
  },
  buyerFeeDescription: {
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
  linkTextBlue: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  disclaimerSection: {
    marginBottom: 16,
  },
  disclaimerTitle: {
    fontSize: 13,
    color: '#333',
  },
  pickupInfoSection: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  pickupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  pickupOfferText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
  },
  offerAmount: {
    fontWeight: '700',
    color: '#000',
  },
  acceptedText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 8,
  },
  pickupInstructions: {
    fontSize: 12,
    color: '#505050',
    lineHeight: 18,
  },
  schedulePickupButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  schedulePickupButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  issueDisputeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 16,
    marginTop: 8,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  issueDisputeLinkText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#DC143C',
    marginLeft: 12,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
    marginTop: 8,
  },
  bottomSpacer: {
    height: 40,
  },
  // Showcase Navigation Styles
  showcaseNavButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  showcaseNavLeft: {
    left: 16,
  },
  showcaseNavRight: {
    right: 16,
  },
  showcaseCounter: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(103, 58, 183, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 15,
  },
  showcaseCounterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ProductDetailsScreen;