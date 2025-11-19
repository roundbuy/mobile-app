import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import SafeScreenContainer from '../components/SafeScreenContainer';
import { COLORS } from '../constants/theme';

const GoldMembershipScreen = ({ navigation }) => {
  const handleSelectPlan = () => {
    navigation.navigate('Cart', { 
      planType: 'Gold', 
      planName: 'Gold membership plan', 
      price: 2.00 
    });
  };

  return (
    <SafeScreenContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Membership plans</Text>
          <View style={styles.bestBadge}>
            <Text style={styles.bestBadgeText}>Best</Text>
          </View>
        </View>

        {/* Plan Card */}
        <View style={styles.planCard}>
          <View style={[styles.planHeader, { backgroundColor: '#FFD700' }]}>
            <Text style={styles.planTitle}>Gold</Text>
          </View>

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
              onPress={handleSelectPlan}
            >
              <Text style={styles.selectButtonText}>Select plan</Text>
            </TouchableOpacity>

            <Text style={styles.featuresTitle}>Green plan includes everything in Green, and:</Text>
            <Text style={styles.featureItem}>• 1 x centre-point (changeable spot to search)</Text>
            <Text style={styles.featureItem}>• 3 x product location (spots to sell)</Text>
            <Text style={styles.featureItem}>  Search notifications</Text>
            <Text style={styles.featureItem}>• Instant renewal of an old Ad with a click</Text>
            <Text style={styles.featureItem}>• Clicks statistics</Text>
            <Text style={styles.featureItem}>• Fast Ads</Text>
            <Text style={styles.featureItem}>• Targeted Ads</Text>
            <Text style={styles.featureItem}>• Pick & Transaction fee £0.30 for all Ads</Text>
          </View>
        </View>
      </ScrollView>
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    fontSize: 28,
    color: '#000',
    fontWeight: '300',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  bestBadge: {
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
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
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
    padding: 20,
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

export default GoldMembershipScreen;