import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';
import { subscriptionService, authService } from '../../services';
import { useAuth } from '../../context/AuthContext';

const AllMembershipsScreen = ({ navigation, route }) => {
  const { completeRegistration } = useAuth();
  const { requiresPlan, userEmail } = route.params || {};
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('GBP'); // British Pound £

  useEffect(() => {
    fetchPlans();
  }, [selectedCurrency]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await subscriptionService.getSubscriptionPlans(selectedCurrency, 'en');

      console.log('📦 API Response:', JSON.stringify(response, null, 2));

      if (response.success) {
        setPlans(response.data.plans);

        // Log each plan's pricing details
        response.data.plans.forEach(plan => {
          console.log(`\n💳 ${plan.name} Plan Details:`);
          console.log('  - Slug:', plan.slug);
          console.log('  - Price:', plan.target_currency?.total_price);
          console.log('  - Renewal Price:', plan.renewal?.total_price);
          console.log('  - Currency:', plan.target_currency?.code);
          console.log('  - Symbol:', plan.target_currency?.symbol);
          console.log('  - Is Different Renewal:', plan.renewal?.is_different);
        });
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError(err.message || 'Failed to load subscription plans');

      // Show alert but don't block UI
      Alert.alert(
        'Connection Error',
        'Could not load subscription plans. Using cached data.',
        [{ text: 'Retry', onPress: fetchPlans }, { text: 'Cancel' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan) => {
    // Handle free/green plan
    if (plan.slug === 'green' || plan.target_currency.total_price === 0) {
      Alert.alert(
        'Free Plan Selected',
        'The Green plan is free! You can start using the app immediately.',
        [
          {
            text: 'Continue',
            onPress: async () => {
              try {
                // Call API to activate free plan with email for new users
                const response = await subscriptionService.activateFreePlan(userEmail);

                if (response.success) {
                  Alert.alert(
                    'Plan Activated',
                    'Your free plan has been activated successfully! Please login to continue.',
                    [{
                      text: 'Login',
                      onPress: () => navigation.replace('SocialLogin', {
                        email: userEmail,
                        message: 'Your free plan is ready! Please login to start browsing.'
                      })
                    }]
                  );
                } else {
                  Alert.alert('Error', response.message || 'Failed to activate free plan');
                }
              } catch (error) {
                console.error('Error activating free plan:', error);
                Alert.alert('Error', error.message || 'Failed to activate free plan. Please try again.');
              }
            }
          },
          { text: 'Choose Different Plan', style: 'cancel' }
        ]
      );
      return;
    }

    // Navigate to cart/payment flow for paid plans
    navigation.navigate('Cart', {
      planId: plan.id,
      planType: plan.name,
      planName: `${plan.name} membership plan`,
      planSlug: plan.slug,
      planColor: plan.color,
      price: plan.target_currency.total_price,
      originalPrice: plan.target_currency.price,
      taxAmount: plan.target_currency.tax_amount,
      taxRate: plan.target_currency.tax_rate,
      currency: plan.target_currency.code,
      currencySymbol: plan.target_currency.symbol,
      renewalPrice: plan.renewal?.total_price || plan.target_currency.total_price,
      isDifferentRenewal: plan.renewal?.is_different || false,
      durationDays: plan.duration_days,
      requiresPlan: requiresPlan, // Pass through if coming from registration
      userEmail: userEmail
    });
  };

  const handlePlanDetails = (planType) => {
    navigation.navigate(`${planType}Membership`);
  };

  const renderPlanCard = (plan) => {
    const isBest = plan.tag === 'best' || plan.is_best;
    const isPopular = plan.tag === 'popular' || plan.is_popular;
    const planColor = plan.color || '#4CAF50';
    const price = parseFloat(plan.target_currency?.total_price || 0);
    const originalPrice = parseFloat(plan.target_currency?.price || 0);
    const symbol = plan.target_currency?.symbol || '$';
    const renewalPrice = parseFloat(plan.renewal?.total_price || price);
    const hasDifferentRenewal = plan.renewal?.is_different || false;

    // Determine if plan is free
    const isFree = price === 0 && renewalPrice > 0;
    const isFreeFirstYear = price === 0 && renewalPrice > 0;

    // Debug logging for Violet plan
    if (plan.slug === 'violet') {
      console.log('\n🔍 VIOLET PLAN CALCULATION:');
      console.log('  Raw price:', plan.target_currency?.total_price);
      console.log('  Parsed price:', price);
      console.log('  Raw renewal:', plan.renewal?.total_price);
      console.log('  Parsed renewal:', renewalPrice);
      console.log('  isFree:', isFree);
      console.log('  isFreeFirstYear:', isFreeFirstYear);
      console.log('  hasDifferentRenewal:', hasDifferentRenewal);
    }

    return (
      <View key={plan.id} style={[styles.planCard, isBest && styles.bestPlanCard]}>
        <TouchableOpacity onPress={() => handlePlanDetails(plan.name)}>
          <View style={[styles.planHeader, { backgroundColor: planColor }]}>
            <Text style={styles.planTitle}>{plan.name}</Text>
            {isBest && (
              <View style={styles.bestBadge}>
                <Text style={styles.bestBadgeText}>BEST VALUE</Text>
              </View>
            )}
            {isPopular && !isBest && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>POPULAR</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.planContent}>
          <Text style={styles.planSubtitle}>{plan.subheading || plan.description}</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>
              {isFreeFirstYear ? (
                `FREE, then ${symbol}${renewalPrice.toFixed(2)} / ${plan.duration_days} days`
              ) : isFree ? (
                `FREE / ${plan.duration_days} days`
              ) : hasDifferentRenewal && renewalPrice !== price ? (
                `Price ${symbol}${price.toFixed(2)} now, then ${symbol}${renewalPrice.toFixed(2)} / ${plan.duration_days} days`
              ) : (
                `Price ${symbol}${price.toFixed(2)} / ${plan.duration_days} days`
              )}
            </Text>
            <TouchableOpacity style={styles.infoIcon}>
              <Text style={styles.infoIconText}>ⓘ</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.selectButton, { backgroundColor: planColor }]}
            onPress={() => handleSelectPlan(plan)}
          >
            <Text style={styles.selectButtonText}>
              {plan.slug === 'green' ? 'Select Free Plan' : 'Select ' + plan.name}
            </Text>
          </TouchableOpacity>

          <Text style={styles.featuresTitle}>{plan.name} plan includes:</Text>
          {plan.description_bullets && plan.description_bullets.map((feature, index) => (
            <Text key={index} style={styles.featureItem}>• {feature}</Text>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading subscription plans...</Text>
        </View>
      </SafeScreenContainer>
    );
  }

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

        {/* Dynamic Plan Cards */}
        {plans.map(plan => renderPlanCard(plan))}

        {plans.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No subscription plans available</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchPlans}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 10,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bestPlanCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  planHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTitle: {
    fontSize: 22,
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
  bestBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  bestBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  popularBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: 11,
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
  checkMark: {
    fontSize: 14,
    color: COLORS.primary,
    marginRight: 8,
    fontWeight: '700',
  },
});

export default AllMembershipsScreen;