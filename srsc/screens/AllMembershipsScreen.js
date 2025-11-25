import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import SafeScreenContainer from '../components/SafeScreenContainer';
import { COLORS } from '../constants/theme';

const AllMembershipsScreen = ({ navigation }) => {
  const handleSelectPlan = (planType, planName, price) => {
    navigation.navigate('Cart', { planType, planName, price });
  };

  const handlePlanDetails = (planType) => {
    navigation.navigate(`${planType}Membership`);
  };

  return (
    <SafeScreenContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>All Memberships</Text>

        {/* Green Plan */}
        <View style={styles.planCard}>
          <TouchableOpacity onPress={() => handlePlanDetails('Green')}>
            <View style={[styles.planHeader, { backgroundColor: '#7FD957' }]}>
              <Text style={styles.planTitle}>Green</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.planContent}>
            <Text style={styles.planSubtitle}>Essential features for private users.</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>Price £2 now for free £0 / year</Text>
              <TouchableOpacity style={styles.infoIcon}>
                <Text style={styles.infoIconText}>ⓘ</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => handleSelectPlan('Green', 'Green membership plan', 0.00)}
            >
                <Text style={styles.selectButtonText}>Select plan</Text>
            </TouchableOpacity>

            <Text style={styles.featuresTitle}>Green plan includes</Text>
            <Text style={styles.featureItem}>• 1 x centre-point (changeable spot to search)</Text>
            <Text style={styles.featureItem}>• 1 x product location (a spot to sell)</Text>
            <Text style={styles.featureItem}>• Unlimited standard ads</Text>
            <Text style={styles.featureItem}>• Display time for ads 60 days</Text>
            <Text style={styles.featureItem}>• Highlighted ads for normal price</Text>
            <Text style={styles.featureItem}>• Chat service between private users</Text>
            <Text style={styles.featureItem}>• Pick & Transaction fee £0.70 for +10 Ads</Text>

            <View style={styles.bestBadge}>
              <Text style={styles.bestBadgeText}>Best</Text>
            </View>
          </View>
        </View>

        {/* Gold Plan */}
        <View style={styles.planCard}>
          <TouchableOpacity onPress={() => handlePlanDetails('Gold')}>
            <View style={[styles.planHeader, { backgroundColor: '#FFD700' }]}>
              <Text style={styles.planTitle}>Gold</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.planContent}>
            <Text style={styles.planSubtitle}>Essential features for private users.</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>Price £4 now for £2 / year</Text>
              <TouchableOpacity style={styles.infoIcon}>
                <Text style={styles.infoIconText}>ⓘ</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => handleSelectPlan('Gold', 'Gold membership plan', 2.00)}
            >
              <Text style={styles.selectButtonText}>Select plan</Text>
            </TouchableOpacity>

            <Text style={styles.featuresTitle}>Green plan includes everything in Green, and:</Text>
            <Text style={styles.featureItem}>• 1 x centre-point (changeable spot to search)</Text>
            <Text style={styles.featureItem}>• 3 x product location (spots to sell)</Text>
            <Text style={styles.featureItem}>  Search notifications</Text>
            <Text style={styles.featureItem}>• Clicks statistics</Text>
            <Text style={styles.featureItem}>• Fast Ads</Text>
            <Text style={styles.featureItem}>• Targeted Ads</Text>
            <Text style={styles.featureItem}>• Pick & Transaction fee £0.30 for all Ads</Text>
          </View>
        </View>

        {/* Violet Plan */}
        <View style={styles.planCard}>
          <TouchableOpacity onPress={() => handlePlanDetails('Violet')}>
            <View style={[styles.planHeader, { backgroundColor: '#9B59B6' }]}>
              <Text style={styles.planTitle}>Violet</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.planContent}>
            <Text style={styles.planSubtitle}>Essential features for private users.</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>Price £2 no for £5 / year</Text>
              <TouchableOpacity style={styles.infoIcon}>
                <Text style={styles.infoIconText}>ⓘ</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => handleSelectPlan('Violet', 'Violet membership plan', 5.00)}
            >
              <Text style={styles.selectButtonText}>Select plan</Text>
            </TouchableOpacity>

            <Text style={styles.featuresTitle}>Green plan includes</Text>
            <Text style={styles.featureItem}>• 1 x centre-point (for business location ads)</Text>
            <Text style={styles.featureItem}>• Company Ads purchaseable for product gallery</Text>
            <Text style={styles.featureItem}>• Display time for ads 7-30 days</Text>
            <Text style={styles.featureItem}>• Brand Ads purchaseable (logo with slogan)</Text>
            <Text style={styles.featureItem}>•</Text>
          </View>
        </View>
      </ScrollView>
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    fontSize: 28,
    color: '#000',
    fontWeight: '300',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 20,
    marginBottom: 20,
    lineHeight: 22,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    marginHorizontal: 10,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planHeader: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  planContent: {
    padding: 10,
  },
  planSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  infoIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconText: {
    fontSize: 12,
    color: '#666',
  },
  currentPlanBadge: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  currentPlanText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  selectButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bestBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  bestBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  featureItem: {
    fontSize: 13,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default AllMembershipsScreen;