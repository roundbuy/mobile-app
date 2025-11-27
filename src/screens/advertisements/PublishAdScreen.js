import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';

const PublishAdScreen = ({ navigation, route }) => {
  const handlePublish = () => {
    // Navigate to search or home after publishing
    navigation.navigate('SearchScreen');
  };

  return (
    <SafeScreenContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Publish Ad</Text>
          <Text style={styles.stepIndicator}>8/8</Text>
        </View>

        {/* Product Image */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            {/* Placeholder for product image */}
            <View style={styles.imageBox} />
          </View>
          {/* Image Dots */}
          <View style={styles.dotsContainer}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <View style={styles.productLeft}>
              <Text style={styles.productTitle}>Armchair</Text>
              <Text style={styles.productDistance}>Distance 1000 m / 25 min walk</Text>
            </View>
            <TouchableOpacity style={styles.buyButton}>
              <Text style={styles.buyButtonText}>BUY £300</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              A wonderful armchair with brown covering and black legs. Hardly used. Massive wood.{' '}
              <Text style={styles.readMore}>Read more...</Text>
            </Text>
          </View>
        </View>

        {/* Publish Button */}
        <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
          <Text style={styles.publishButtonText}>Publish</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  backButton: {
    fontSize: 28,
    color: '#000',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    flex: 1,
    marginLeft: 16,
  },
  stepIndicator: {
    fontSize: 16,
    color: '#666',
  },
  imageContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  imageBox: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D0D0D0',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#666',
  },
  productInfo: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  productLeft: {
    flex: 1,
    marginRight: 12,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  productDistance: {
    fontSize: 13,
    color: '#666',
  },
  buyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  descriptionSection: {
    marginTop: 8,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  readMore: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  publishButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  publishButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpace: {
    height: 30,
  },
});

export default PublishAdScreen;