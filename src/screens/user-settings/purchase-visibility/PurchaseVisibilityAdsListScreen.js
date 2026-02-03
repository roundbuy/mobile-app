import React, { useState, useEffect } from 'react';
import advertisementService from '../../../services/advertisementService';
import { IMAGES } from '../../../assets/images';
import { useTranslation } from '../../../context/TranslationContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../../constants/theme';

const PurchaseVisibilityAdsListScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { planType, selectedPlan, selectedDistance } = route.params;

  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await advertisementService.getUserAdvertisements({ limit: 100, status: 'published' });
      if (response && response.data && response.data.advertisements) {
        setAds(response.data.advertisements);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
      Alert.alert(t('Error'), t('Failed to load advertisements'));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handlePurchaseNow = (ad) => {
    navigation.navigate('VisibilityCart', {
      ad,
      type: planType,
      duration: selectedPlan,
      distance: selectedDistance
    });
  };

  const getPlanName = () => {
    // If we have a selected plan object, use its name, otherwise fallback to type
    if (selectedPlan && selectedPlan.name) return selectedPlan.name;
    // Fallback formatting for type
    return planType ? planType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : t('Purchase Visibility');
  };

  const renderAdItem = (item) => {
    // Parse images if string
    let imageUrl = null;
    if (item.images) {
      try {
        const images = typeof item.images === 'string' ? JSON.parse(item.images) : item.images;
        if (images && images.length > 0) {
          imageUrl = typeof images[0] === 'string' ? images[0] : images[0].uri;
        }
      } catch (e) {
        console.warn('Error parsing images', e);
      }
    }

    return (
      <View key={item.id} style={styles.adCard}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.adImage} resizeMode="cover" />
        ) : (
          <View style={[styles.adImage, { backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' }]}>
            <Ionicons name="image-outline" size={32} color="#ccc" />
          </View>
        )}

        <View style={styles.adContent}>
          <View style={styles.adInfo}>
            <Text style={styles.adTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.adPrice}>{item.price} {item.currency || ''}</Text>
          </View>
          <Text style={styles.adSubtitle} numberOfLines={1}>{item.city || ''} {item.country || ''}</Text>

          <TouchableOpacity
            style={styles.purchaseButton}
            onPress={() => handlePurchaseNow(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.purchaseButtonText}>{t('Buy Now')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getPlanName()}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerText}>{t('Select the ad you want to promote')}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          ads.length > 0 ? (
            ads.map((item) => renderAdItem(item))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('No advertisements found')}</Text>
            </View>
          )
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 32,
  },
  infoBanner: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoBannerText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  adCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  adImage: {
    width: 120,
    height: 140,
    backgroundColor: '#f5f5f5',
  },
  adContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  adInfo: {
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
  adPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginLeft: 8,
  },
  adSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  purchaseButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderRadius: 20,
    alignItems: 'center',
  },
  purchaseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  bottomSpacer: {
    height: 24,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  }
});

export default PurchaseVisibilityAdsListScreen;