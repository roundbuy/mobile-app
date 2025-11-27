import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';

const VioletMembershipScreen = ({ navigation }) => {
  const handleSelectPlan = () => {
    navigation.navigate('Cart', { 
      planType: 'Violet', 
      planName: 'Violet membership plan', 
      price: 5.00 
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
        </View>

        {/* Plan Card */}
        <View style={styles.planCard}>
          <View style={[styles.planHeader, { backgroundColor: '#9B59B6' }]}>
            <Text style={styles.planTitle}>Violet</Text>
          </View>

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
              onPress={handleSelectPlan}
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
    color: '#FFFFFF',
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

export default VioletMembershipScreen;