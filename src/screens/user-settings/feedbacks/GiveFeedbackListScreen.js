import React from 'react';
import { IMAGES } from '../../../assets/images';
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
import { COLORS } from '../../../constants/theme';

const GiveFeedbackListScreen = ({ navigation }) => {
  const handleBack = () => {
    navigation.goBack();
  };

  // Sample data - replace with actual API data
  const products = [
    {
      id: '1',
      title: 'Armchair',
      type: 'SELL',
      distance: '1000 m / 25 min walk',
      status: 'You have Paid this fee!',
      image: IMAGES.chair1,
      hasFeedback: false,
    },
    {
      id: '2',
      title: 'Wooden Chair',
      type: 'RENT',
      distance: '750 m / 15 min walk',
      status: 'You have Paid this fee!',
      image: IMAGES.chair2,
      hasFeedback: false,
    },
    {
      id: '3',
      title: 'Work-chair',
      type: 'SELL',
      distance: '250 m / 5 min walk',
      status: 'You have Paid this fee!',
      image: IMAGES.chair3,
      hasFeedback: false,
    },
    {
      id: '4',
      title: 'Cosy Chair',
      type: 'BUY',
      distance: '500 m / 10 min walk',
      status: 'You have Paid this fee!',
      image: IMAGES.chair1,
      hasFeedback: false,
    },
    {
      id: '5',
      title: 'Armchair',
      type: 'GIVE',
      distance: '1000 m / 25 min walk',
      status: 'You have Paid this fee!',
      image: IMAGES.chair1,
      hasFeedback: false,
    },
  ];

  const handleGiveFeedback = (product) => {
    navigation.navigate('GiveFeedbackForm', { product });
  };

  const handleProductPress = (product) => {
    navigation.navigate('FeedbackStatus', { product });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paid Pick Up & Safe Service fees</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {products.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.productCard}
            onPress={() => handleProductPress(product)}
            activeOpacity={0.7}
          >
            <Image source={product.image} style={styles.productImage} />
            
            <View style={styles.productContent}>
              <View style={styles.productHeader}>
                <Text style={styles.productTitle}>{product.title}</Text>
                <View style={[
                  styles.typeBadge,
                  product.type === 'SELL' && styles.sellBadge,
                  product.type === 'RENT' && styles.rentBadge,
                  product.type === 'BUY' && styles.buyBadge,
                  product.type === 'GIVE' && styles.giveBadge,
                ]}>
                  <Text style={styles.typeBadgeText}>{product.type}</Text>
                </View>
              </View>

              <Text style={styles.distanceText}>{product.distance}</Text>
              <Text style={styles.statusText}>{product.status}</Text>

              <TouchableOpacity
                style={styles.feedbackButton}
                onPress={() => handleGiveFeedback(product)}
                activeOpacity={0.7}
              >
                <Text style={styles.feedbackButtonText}>Give Feedback</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

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
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
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
  },
  productImage: {
    width: 140,
    height: 140,
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
  giveBadge: {
    backgroundColor: '#9C27B0',
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  feedbackButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  feedbackButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  bottomSpacer: {
    height: 24,
  },
});

export default GiveFeedbackListScreen;