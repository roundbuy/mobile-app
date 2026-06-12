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
  Modal,
  Share,
  TouchableWithoutFeedback,
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
import Hyperlink from '../../components/common/Hyperlink';

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

  // Layout states
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isUserStatsExpanded, setIsUserStatsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('HomeMarket');
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleShare = async () => {
    setIsMenuVisible(false);
    try {
      await Share.share({
        message: `Check out ${productData?.title || 'this item'} on Roundbuy!`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleReport = () => {
    setIsMenuVisible(false);
    navigation.navigate('ContactSupport', {
      initialTopic: 'Report content',
      advertisementId: productData?.id,
      advertisementTitle: productData?.title,
    });
  };

  const handleRaiseIssue = () => {
    if (!user) {
      Alert.alert(
        t('Login Required'),
        t('Please login to raise an issue.'),
        [
          { text: t('Cancel'), style: 'cancel' },
          { text: t('Login'), onPress: () => navigation.navigate('SocialLogin') }
        ]
      );
      return;
    }

    navigation.navigate('CreateIssue', {
      advertisementId: productData?.id,
      otherPartyId: productData?.seller?.id || productData?.seller_id,
      adTitle: productData?.title,
      sellerName: productData?.seller?.username || productData?.seller_name
    });
  };

  const calculateBuyerFee = (priceStr) => {
    if (!priceStr) return '';
    const match = priceStr.match(/([^\d.,\s]+)?[\s]*([\d.,]+)/);
    const symbol = match ? (match[1] || '£') : '£';
    return `${symbol}1.00`;
  };

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
      latitude: ad.latitude,
      longitude: ad.longitude,
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

  const handleBuy = () => {
    if (!user) {
      Alert.alert(t('Login Required'), t('Please login to buy items.'));
      return;
    }

    try {
      // Extract numeric base price from formatted price string
      let basePrice = 0;
      if (typeof productData.price === 'string') {
        const match = productData.price.match(/[\d.,]+/);
        if (match) {
          basePrice = parseFloat(match[0].replace(/,/g, ''));
        }
      } else if (typeof productData.price === 'number') {
        basePrice = productData.price;
      }

      navigation.navigate('Step3DeliverySelectionScreen', {
        advertisementId: productData.id,
        title: productData.title,
        offerAmount: basePrice,
        itemImage: productData.images && productData.images.length > 0 ? productData.images[0] : null
      });
    } catch (error) {
      console.error('Pre-buy navigation error:', error);
      Alert.alert(t('Error'), t('Failed to initiate purchase.'));
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
    Condition: "The condition provided for an item helps users to filter the desired items more easily. These guidelines help buyers set expectations regarding cosmetic blemishes, packaging, and item functionality. All items need to have truthful condition!\n**Item conditions (note! You need something else for services):**\n**New:** Unused, unopened, and in original condition or packaging, with all original accessories, materials and warranties.\n**As new:** Unused, in original condition with or without it's packaging, with no signs of wear, and with all original accessories.\n**Very Good:** An item used only a little, with minor cosmetic wear, functioning perfectly and looking still very good.\n**Good:** Shows consistent use, such as minor scratches, stains, or wear marks, but is fully functional and intact.\n**Satisfactory:** Heavily used with noticeable sings of wear, such as dents, scratches, but still functional.\n**Poor:** Severe damage or heavy wear, such as damaged bindings on books or broken parts, often just barely functional.\n**Additional guidelines:**\nAll conditions stated by sellers in listings need to be accurate, with up-to-date images and descriptions, so buyers get a realistic idea of the condition. It is advisable to choose the poorer condition if uncertain.\nDefects, imperfections should be fully informed to the Buyer. Buyers should check in person the item, by inspection for accuracy & for any defects. need to inspect the item to ascertain this.\nIf Seller misleads, lies or otherwise distorts the condition to Buyer, the Buyer has right to return the item to the Seller. Always provide images and descriptions to prevent misunderstandings.\nIf user violates the community rules by choosing a wrong condition, we might block temporarily or do other more drastic measures to end it!\nFor more information, please contact us (circle with \"i\" here)",
    Colour: "The color of the item as described by the seller. Actual color may vary slightly due to lighting and screen settings.",
    Responsiveness: "Metrics indicating the seller's reliability:\n\n• **Response Rate:** Average time to reply to messages.\n• **Pick Up Rate:** Percentage of successful meetings for pickup/exchange.",
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
        title={t('Listing')}
        navigation={navigation}
        showBackButton={true}
        showIcons={false}
        rightContent={
          <TouchableOpacity onPress={() => setIsMenuVisible(true)} style={{ padding: 4, paddingHorizontal: 8 }}>
            <Ionicons name="ellipsis-vertical" size={24} color="#000" />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Image Gallery */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
              setCurrentImageIndex(newIndex);
            }}
            scrollEventThrottle={16}
          >
            {productData.images && productData.images.length > 0 ? (
              productData.images.map((img, index) => (
                <Image
                  key={index}
                  source={{ uri: getFullImageUrl(img) }}
                  style={[styles.productImage, { width: width - 32 }]}
                  resizeMode="cover"
                  defaultSource={IMAGES.placeholder}
                />
              ))
            ) : (
              <Image
                source={IMAGES.placeholder}
                style={[styles.productImage, { width: width - 32 }]}
                resizeMode="cover"
              />
            )}
          </ScrollView>

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavorite}
          >
            <FontAwesome
              name={'heart'}
              size={32}
              color={isFavorite ? '#DC143C' : '#505050'}
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

          <View style={styles.imageFooterContainer}>
            {renderImageDots()}
            <TouchableOpacity style={styles.reportBadge}>
              <Text style={styles.reportBadgeText}>{t('Report')}</Text>
            </TouchableOpacity>
          </View>

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
          <View style={styles.titleRowContainer}>
            <Text style={styles.productTitle} numberOfLines={2}>{productData.title}</Text>
            <Text style={styles.titleSubText} numberOfLines={1}>size {productData.size || '42'}</Text>
            <Text style={styles.titleSubTextBold} numberOfLines={1}>{productData.condition}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.productPriceText}>£{productData.price}</Text>
            <View style={styles.buyerFeeRow}>
              <Text style={styles.buyerFeeText}>Buyer's Fee {calculateBuyerFee(productData.price)}</Text>
              <Ionicons name="shield-checkmark-outline" size={12} color="#505050" style={{ marginLeft: 4 }} />
            </View>
          </View>

          {/* Distance & Directions Row */}
          <View style={styles.distanceDirectionsRow}>
            <View style={styles.distanceDirectionsInfo}>
              <Ionicons name="location" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.distanceDirectionsText}>
                {productData.distanceMeters || productData.distance || '1.2 km'} ({Math.round(parseFloat(productData.distance || 1.2) * 20)} mins walk)
              </Text>
            </View>
            <TouchableOpacity
              style={styles.getDirectionsButton}
              onPress={() => {
                navigation.navigate('ProductDirections', {
                  product: productData,
                  latitude: productData.latitude || 51.875462,
                  longitude: productData.longitude || -0.372755,
                });
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.getDirectionsText}>Get Directions</Text>
              <Ionicons name="navigate-outline" size={14} color="#FFF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description & Product Details */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitleSmall}>{t('Description')}</Text>
          <Text style={styles.descriptionText} numberOfLines={2}>
            {productData.description || 'A wonderful armchair with brown covering and black legs. Hardly used. Massive wood...'}
          </Text>

          {isDescriptionExpanded && (
            <View style={styles.detailsList}>
              <DetailRow label={t('Category')} value={productData.category} onInfoPress={handleInfoPress} />
              <DetailRow label={t('Distance')} value={productData.distanceMeters} onInfoPress={handleInfoPress} />
              <DetailRow label={t('Price')} value={productData.price} onInfoPress={handleInfoPress} />
              <DetailRow label={t('Condition')} value={productData.condition} onInfoPress={handleInfoPress} />
              <DetailRow label={t('Gender')} value={productData.gender} onInfoPress={handleInfoPress} />
              <DetailRow label={t('Age')} value={productData.age} onInfoPress={handleInfoPress} />
              <DetailRow label={t('Size')} value={productData.size} onInfoPress={handleInfoPress} />
              <DetailRow label={t('Colour')} value={productData.colour} onInfoPress={handleInfoPress} />
            </View>
          )}
          <TouchableOpacity onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)} style={styles.moreInfoButton}>
            <Text style={styles.linkTextBlue}>{isDescriptionExpanded ? t('hide info') : t('more info')}</Text>
          </TouchableOpacity>
        </View>

        {/* User Statistics */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitleSmall}>{t('User statistics')}</Text>
          <Text style={styles.descriptionText} numberOfLines={2}>
            {t('Verified seller with a high response rate and successful pickup history. Building a trustful local community.')}
          </Text>
          <TouchableOpacity onPress={() => setIsUserStatsExpanded(!isUserStatsExpanded)} style={styles.moreInfoButton}>
            <Text style={[styles.linkTextBlue, { marginBottom: 10 }]}>{isUserStatsExpanded ? t('hide info') : t('more info')}</Text>
          </TouchableOpacity>

          <View style={styles.sellerRow}>
            <View style={styles.sellerAvatar}>
              {productData.seller?.avatar ? (
                <Image
                  source={{ uri: getFullImageUrl(productData.seller.avatar) }}
                  style={styles.sellerAvatarImage}
                  resizeMode="cover"
                />
              ) : (
                <FontAwesome name="user" size={24} color="#505050" />
              )}
            </View>
            <View style={styles.sellerInfoOuter}>
              <View style={styles.sellerInfoRow}>
                <Text style={styles.sellerName}>{productData.seller?.username}</Text>
              </View>
              {productData.seller?.rating >= 0 && (
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
              <TouchableOpacity onPress={handleReadFeedbacks}>
                <Text style={styles.sellerLinkTextSmall}>{t('Read')} <Hyperlink text={t('Feedbacks')} onPress={handleReadFeedbacks} >Feedbacks </Hyperlink></Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUserListings} style={{ marginTop: 4 }}>
                <Text style={styles.sellerLinkTextSmall}>{t('View')} <Hyperlink text={t('Listings')} onPress={handleUserListings} >Listings </Hyperlink></Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.chatWithSellerButtonGray} onPress={handleChatWithSeller}>
            <Text style={styles.chatWithSellerButtonText}>{t('Chat now')}</Text>
          </TouchableOpacity>
        </View>

        {/* Resale Disclaimer */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitleSmall}>{t('Resale Disclaimer')}</Text>
          <Text style={styles.descriptionText} numberOfLines={2}>
            {t('All items are sold as-is by private sellers. Please inspect the item carefully during pickup. Transactions are governed by our local community guidelines.')}
          </Text>
          <TouchableOpacity style={styles.moreInfoButton}>
            <Text style={styles.linkTextBlue}>{t('more info')}</Text>
          </TouchableOpacity>
        </View>

        {/* Buyer's Fee Disclaimer */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitleSmall}>{t("Buyer's Fee")}</Text>
          <Text style={styles.descriptionText} numberOfLines={2}>
            {t("The buyer's fee is a small flat charge that helps us maintain the platform, provide secure messaging, and support our sustainable mission.")}
          </Text>
          <TouchableOpacity style={styles.moreInfoButton}>
            <Text style={styles.linkTextBlue}>{t('more info')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.footerDisclaimerTextBottom}>
          Our <Text style={styles.linkTextBlue}>Buyer's Fee & Disclaimers</Text>
        </Text>
        {/* HomeMarket & ShowCasing Tabs */}
        <View style={styles.tabsSection}>
          <View style={styles.tabsHeader}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'HomeMarket' && styles.activeTabButton]}
              onPress={() => setActiveTab('HomeMarket')}
            >
              <Text style={[styles.tabButtonText, activeTab === 'HomeMarket' && styles.activeTabButtonText]}>HomeMarket</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'ShowCasing' && styles.activeTabButton]}
              onPress={() => setActiveTab('ShowCasing')}
            >
              <Text style={[styles.tabButtonText, activeTab === 'ShowCasing' && styles.activeTabButtonText]}>ShowCasing</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.garageText}>Garage by {productData.seller?.username || 'User'}</Text>
          <View style={styles.gridContainer}>
            {(activeTab === 'HomeMarket' ? homeMarketProducts : showcaseProducts).map((item, index) => (
              <View key={index} style={styles.gridItem}>
                <TouchableOpacity
                  onPress={() => navigation.push('ProductDetails', { advertisementId: item.id })}
                >
                  <Image source={{ uri: getFullImageUrl(item.images?.[0]) }} style={styles.gridItemImage} defaultSource={IMAGES.placeholder} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.gridItemHeart}>
                  <FontAwesome name="heart" size={16} color="#505050" />
                </TouchableOpacity>
                <Text style={styles.gridItemTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.gridItemPrice}>£{item.price}</Text>
                <Text style={styles.gridItemDistance}>Distance: {item.distance ? parseFloat(item.distance).toFixed(0) : 600} m / 7 min walk</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.locationDisclaimerLink}>
            <Text style={styles.footerDisclaimerText}>
              Our <Text style={styles.linkTextBlue}>Location & Safety Disclaimers</Text>
            </Text>

          </TouchableOpacity>
        </View>

        {user?.id !== productData?.seller?.id && (
          <TouchableOpacity
            style={styles.issueDisputeLink}
            onPress={handleRaiseIssue}
          >
            <Ionicons name="alert-circle-outline" size={24} color="#DC143C" />
            <Text style={styles.issueDisputeLinkText}>{t('Raise an issue')}</Text>
            <Ionicons name="chevron-forward" size={20} color="#DC143C" />
          </TouchableOpacity>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={styles.stickyFooter}>
        <View style={styles.bottomButtonsFooter}>
          <TouchableOpacity
            style={styles.makeOfferButtonFooter}
            onPress={handleMakeOffer}
          >
            <Text style={styles.makeOfferButtonTextFooter}>{t('Make offer')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyNowButtonFooter} onPress={handleBuy}>
            <Text style={styles.buyNowButtonTextFooter}>{t('Buy')}</Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* Share / Report Menu */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdownMenu}>
                <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
                  <Ionicons name="share-social-outline" size={20} color="#000" />
                  <Text style={styles.menuItemText}>{t('Share')}</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity style={styles.menuItem} onPress={handleReport}>
                  <Ionicons name="warning-outline" size={20} color="#DC143C" />
                  <Text style={[styles.menuItemText, { color: '#DC143C' }]}>{t('Report')}</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

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
  titleRowContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 16,
    marginBottom: 8,
  },
  titleSubText: {
    fontSize: 16,
    color: '#000080',
    fontWeight: '800',
  },
  titleSubTextBold: {
    fontSize: 16,
    color: '#000080',
    fontWeight: '800',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000080',
  },
  productPriceText: {
    fontSize: 14,
    color: '#000080',
    fontWeight: '700',
  },
  priceContainer: {
    marginBottom: 8,
  },
  buyerFeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  buyerFeeText: {
    fontSize: 12,
    color: '#000080',
  },
  cardSection: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  sectionTitleSmall: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  moreInfoButton: {
    marginTop: 8,
  },
  linkTextBlue: {
    color: '#000080',
    textDecorationLine: 'underline',
    fontSize: 12,
  },
  detailsList: {
    marginTop: 12,
  },
  sellerAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  sellerInfoOuter: {
    flex: 1,
    justifyContent: 'center',
  },
  sellerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerLinkTextSmall: {
    fontSize: 12,
    color: '#000080',
  },
  chatWithSellerButtonGray: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  tabsSection: {
    margin: 16,
  },
  tabsHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: '#000',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#505050',
    fontWeight: '600',
  },
  activeTabButtonText: {
    color: '#000',
    fontWeight: '700',
  },
  garageText: {
    fontSize: 12,
    color: '#505050',
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 8,
    marginBottom: 16,
  },
  gridItemImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  gridItemHeart: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  gridItemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  gridItemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
    marginTop: 4,
  },
  gridItemDistance: {
    fontSize: 8,
    color: '#505050',
    marginTop: 4,
  },
  locationDisclaimerLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  footerDisclaimerText: {
    fontSize: 10,
    color: '#505050',
    textAlign: 'center',
  },
  stickyFooter: {
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  bottomButtonsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  makeOfferButtonFooter: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  makeOfferButtonTextFooter: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  buyNowButtonFooter: {
    flex: 1,
    backgroundColor: '#000040',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  buyNowButtonTextFooter: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerDisclaimerTextBottom: {
    fontSize: 10,
    color: '#505050',
    textAlign: 'center',
  },
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
    width: width - 32,
    height: 550,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  productImage: {
    width: width - 32,
    height: 550,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  favoriteCount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  imageFooterContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#b0b0b0',
  },
  activeDot: {
    backgroundColor: '#505050',
  },
  reportBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    borderWidth: 1,
    borderColor: '#b0b0b0',
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reportBadgeText: {
    fontSize: 10,
    color: '#505050',
  },
  productInfo: {
    padding: 16,
  },
  titleRowContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#001A5C',
    flex: 1,
    textAlign: 'left',
  },
  titleSubText: {
    fontSize: 16,
    color: '#001A5C',
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
  },
  titleSubTextBold: {
    fontSize: 16,
    color: '#001A5C',
    fontWeight: '800',
    flex: 1,
    textAlign: 'right',
  },
  productPriceText: {
    fontSize: 15,
    color: '#001A5C',
    fontWeight: '500',
  },
  buyerFeeText: {
    fontSize: 15,
    color: '#001A5C',
    fontWeight: '500',
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
  menuOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 55, // just below header
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  menuItemText: {
    fontSize: 14,
    marginLeft: 10,
    color: '#000',
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  distanceDirectionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  distanceDirectionsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  distanceDirectionsText: {
    fontSize: 14,
    color: '#303030',
    fontWeight: '500',
  },
  getDirectionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  getDirectionsText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default ProductDetailsScreen;