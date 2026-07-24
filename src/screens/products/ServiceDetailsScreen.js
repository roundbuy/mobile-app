import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import api from '../../services/api';
import { getFullImageUrl } from '../../utils/imageUtils';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/TranslationContext';

const { width } = Dimensions.get('window');

const ServiceDetailsScreen = ({ route, navigation }) => {
  const { advertisementId } = route.params || {};
  const { user } = useAuth();
  const { t } = useTranslation();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchServiceDetails();
  }, [advertisementId]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.get(`/advertisements/view/${advertisementId}`);
      if (res.data?.success && res.data?.data?.advertisement) {
        setService(res.data.data.advertisement);
      } else {
        setError('Service details not found.');
      }
    } catch (err) {
      console.error('Error fetching service details:', err);
      setError('Failed to load service details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to purchase services.');
      return;
    }
    // Navigate to delivery checkout
    navigation.navigate('Step3DeliverySelectionScreen', {
      advertisementId: service.id,
      title: service.title,
      offerAmount: parseFloat(service.price),
      itemImage: service.images && service.images.length > 0 ? service.images[0] : null,
    });
  };

  const handleMakeOffer = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to make offers.');
      return;
    }
    navigation.navigate('ProductChat', {
      product: service,
      mode: 'makeOffer',
    });
  };

  const handleChatWithSeller = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to chat with service providers.');
      return;
    }
    navigation.navigate('ProductChat', {
      product: service,
      mode: 'chat',
    });
  };

  const handleReport = () => {
    if (!user) {
      Alert.alert(t('Login Required'), t('Please login to report content.'));
      return;
    }
    navigation.navigate('ContactSupport', {
      initialTopic: 'Report content',
      advertisementId: service.id,
      advertisementTitle: service.title,
    });
  };

  const handleReadFeedbacks = () => {
    if (service?.seller?.id) {
      navigation.navigate('UserFeedbacks', {
        userId: service.seller.id,
        userName: service.seller.username || service.seller.name || 'Seller'
      });
    } else {
      Alert.alert(t('Unavailable'), t('Seller feedback profile cannot be loaded.'));
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !service) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>{error || 'Service not found'}</Text>
          <TouchableOpacity style={styles.backButtonLarge} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonLargeText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const ratingVal = service.seller?.average_rating !== undefined ? parseFloat(service.seller.average_rating) : 0;
  const reviewsCount = service.seller?.total_reviews || 0;

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header with Search Box */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#aaa" style={styles.searchIcon} />
            <Text style={styles.searchText}>Search Services Around You</Text>
          </View>
          <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
            <Ionicons name="flag-outline" size={20} color="#DC143C" />
          </TouchableOpacity>
        </View>

        {/* Services Toggle Chip */}
        <View style={styles.chipRow}>
          <View style={styles.activeChip}>
            <Ionicons name="construct-outline" size={15} color="#0f9d58" style={{ marginRight: 4 }} />
            <Text style={styles.activeChipText}>Services</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Product Image Gallery */}
          <View style={styles.imageContainerLarge}>
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
              {service.images && service.images.length > 0 ? (
                service.images.map((img, index) => (
                  <Image
                    key={index}
                    source={{ uri: getFullImageUrl(img) }}
                    style={[styles.serviceImageLarge, { width: width }]}
                    resizeMode="cover"
                  />
                ))
              ) : (
                <View style={[styles.imagePlaceholderLarge, { width: width }]}>
                  <Ionicons name="construct" size={64} color="#aaa" />
                  <Text style={styles.placeholderTextLarge}>Service Details</Text>
                </View>
              )}
            </ScrollView>

            {/* Paging Dots */}
            {service.images && service.images.length > 1 && (
              <View style={styles.dotsContainer}>
                {service.images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      currentImageIndex === index ? styles.activeDot : styles.inactiveDot
                    ]}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Details Section */}
          <View style={styles.detailsBlock}>
            <Text style={styles.title}>{service.title}</Text>
            
            {/* Rating */}
            <TouchableOpacity 
              style={styles.ratingRow} 
              onPress={handleReadFeedbacks}
              activeOpacity={0.7}
            >
              <View style={styles.starsRow}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < Math.round(ratingVal) ? "star" : "star-outline"}
                    size={15}
                    color="#ffc107"
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>
                {ratingVal > 0 ? ratingVal.toFixed(1) : t('No ratings')} ({reviewsCount} {reviewsCount === 1 ? t('review') : t('reviews')})
              </Text>
              <Text style={styles.readFeedbacksLink}> - {t('Read Feedbacks')}</Text>
            </TouchableOpacity>

            {/* Starting Price label */}
            <Text style={styles.priceLabel}>
              Prices starting: <Text style={styles.priceAmount}>£{parseFloat(service.price).toFixed(0)}</Text>
            </Text>
            
            <Text style={styles.categoryContext}>
              Category: {service.subcategory_name || service.category_name || 'Services'}
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{service.description || 'No description provided.'}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Sticky Bottom Actions */}
      <View style={styles.stickyFooter}>
        <View style={styles.bottomButtonsRow}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={handleChatWithSeller}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#000" style={{ marginRight: 6 }} />
            <Text style={styles.chatButtonText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.offerButton}
            onPress={handleMakeOffer}
            activeOpacity={0.7}
          >
            <Ionicons name="pricetag-outline" size={20} color="#000" style={{ marginRight: 6 }} />
            <Text style={styles.offerButtonText}>Make Offer</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.buyButton} onPress={handleBuy} activeOpacity={0.8}>
          <Text style={styles.buyButtonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
    alignItems: 'flex-start',
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
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainerLarge: {
    width: '100%',
    height: 250,
    backgroundColor: '#f9f9f9',
    position: 'relative',
  },
  serviceImageLarge: {
    height: '100%',
  },
  imagePlaceholderLarge: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f2f2',
  },
  placeholderTextLarge: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#000000',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  inactiveDot: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  detailsBlock: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 28,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  readFeedbacksLink: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
    marginLeft: 4,
  },
  reportButton: {
    padding: 6,
    marginLeft: 8,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
  },
  categoryContext: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
    marginVertical: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 23,
  },
  stickyFooter: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e5e5',
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  chatButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
  offerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  offerButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
  buyButton: {
    backgroundColor: '#0f9d58',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f9d58',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
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
  backButtonLarge: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonLargeText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default ServiceDetailsScreen;
