import React from 'react';
import { IMAGES } from '../../../assets/images';
import { useTranslation } from '../../../context/TranslationContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../../constants/theme';

const PurchaseVisibilityAdsListScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
  const { type } = route.params;
  
  // Map type to display title
  const typeTitle = {
    partner: 'Purchase a Visibility Ad',
    targeted: 'Purchase a Targeted Ad',
    fast: 'Purchase a Fast Ad'
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Sample data - replace with actual API data
  const ads = [
    {
      id: '1',
      title: 'Armchair',
      subtitle: 'Distance: 1000 m / 25 min walk',
      price: '£252',
      image: IMAGES.chair1,
    },
    {
      id: '2',
      title: 'Wooden chair',
      subtitle: 'Distance: 750 m / 15 min walk',
      price: '£213',
      image: IMAGES.chair2,
    },
    {
      id: '3',
      title: 'Work chair',
      subtitle: 'Distance: 250 m / 5 min walk',
      price: '£131',
      image: IMAGES.chair3,
    },
    {
      id: '4',
      title: 'Cosy chair',
      subtitle: 'Distance: 500 m / 10 min walk',
      price: '£252',
      image: IMAGES.chair1,
    },
  ];

  const handlePurchaseNow = (ad) => {
    navigation.navigate('VisibilityAdChoices', { ad, type });
  };

  const renderAdItem = (item) => (
    <View key={item.id} style={styles.adCard}>
      <Image source={item.image} style={styles.adImage} />
      
      <View style={styles.adContent}>
        <View style={styles.adInfo}>
          <Text style={styles.adTitle}>{item.title}</Text>
          <Text style={styles.adPrice}>{item.price}</Text>
        </View>
        <Text style={styles.adSubtitle}>{item.subtitle}</Text>
        
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{typeTitle[type]}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerText}>{t('Upgrade your best Ad Buy & Sell now!')}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {ads.map((item) => renderAdItem(item))}
        
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
});

export default PurchaseVisibilityAdsListScreen;