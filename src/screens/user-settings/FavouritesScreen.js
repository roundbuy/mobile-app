import React from 'react';
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
import { COLORS } from '../../constants/theme';

const FavouritesScreen = ({ navigation }) => {
  const handleBack = () => {
    navigation.goBack();
  };

  // Sample data - replace with actual API data
  const favourites = [
    {
      id: '1',
      title: 'Armchair',
      type: 'SELL',
      distance: '1000 m / 25 min walk',
      image: require('../../../assets/chair1.png'),
    },
    {
      id: '2',
      title: 'Wooden Chair',
      type: 'RENT',
      distance: '750 m / 15 min walk',
      image: require('../../../assets/chair2.png'),
    },
    {
      id: '3',
      title: 'Work-chair',
      type: 'SELL',
      distance: '250 m / 5 min walk',
      image: require('../../../assets/chair3.png'),
    },
    {
      id: '4',
      title: 'Cosy Chair',
      type: 'BUY',
      distance: '500 m / 10 min walk',
      image: require('../../../assets/chair1.png'),
    },
  ];

  const handleViewAd = (product) => {
    navigation.navigate('ProductDetails', { product });
  };

  const handleRemoveFavourite = (productId) => {
    // Remove from favourites
    console.log('Remove favourite:', productId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Favorites</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {favourites.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <Image source={product.image} style={styles.productImage} />
            
            <View style={styles.productContent}>
              <View style={styles.productHeader}>
                <Text style={styles.productTitle}>{product.title}</Text>
                <View style={[
                  styles.typeBadge,
                  product.type === 'SELL' && styles.sellBadge,
                  product.type === 'RENT' && styles.rentBadge,
                  product.type === 'BUY' && styles.buyBadge,
                ]}>
                  <Text style={styles.typeBadgeText}>{product.type}</Text>
                </View>
              </View>

              <Text style={styles.distanceText}>Distance: {product.distance}</Text>

              <TouchableOpacity
                style={styles.viewAdButton}
                onPress={() => handleViewAd(product)}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAdButtonText}>View Ad</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.heartButton}
              onPress={() => handleRemoveFavourite(product.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="heart" size={24} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.copyright}>© 2020-2025 RoundBuy Inc ®</Text>
        </View>
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
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    position: 'relative',
  },
  productImage: {
    width: 100,
    height: 120,
    backgroundColor: '#f5f5f5',
  },
  productContent: {
    flex: 1,
    padding: 12,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  sellBadge: {
    backgroundColor: '#4CAF50',
  },
  rentBadge: {
    backgroundColor: '#FF9800',
  },
  buyBadge: {
    backgroundColor: COLORS.primary,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  viewAdButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  viewAdButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
  },
  footer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  copyright: {
    fontSize: 12,
    color: '#999',
  },
});

export default FavouritesScreen;