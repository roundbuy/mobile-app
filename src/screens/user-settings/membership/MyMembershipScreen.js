import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { subscriptionService } from '../../../services';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from '../../../context/TranslationContext';

import PlanUpgradeRestrictionModal from '../../../components/PlanUpgradeRestrictionModal';
import SuggestionsFooter from '../../../components/SuggestionsFooter';

const MyMembershipScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [plans, setPlans] = useState([]);
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCurrency, setSelectedCurrency] = useState('GBP');
    const [restrictionModalVisible, setRestrictionModalVisible] = useState(false);

    useEffect(() => {
        fetchData();
    }, [selectedCurrency]);

    const fetchData = async () => {
        try {
            setLoading(true);
            console.log('📱 MyMembership: Fetching data...');

            // Fetch all plans
            const plansResponse = await subscriptionService.getSubscriptionPlans(selectedCurrency, 'en');
            console.log('📦 Plans response:', plansResponse);

            if (plansResponse.success) {
                setPlans(plansResponse.data.plans);
                console.log('✅ Plans loaded:', plansResponse.data.plans.length);
            }

            // Fetch current subscription
            console.log('🔍 Fetching current subscription...');
            const subResponse = await subscriptionService.getCurrentSubscription();
            console.log('📊 Subscription response:', subResponse);

            if (subResponse.success && subResponse.data) {
                setCurrentSubscription(subResponse.data);
                console.log('✅ Current subscription:', subResponse.data);
            } else {
                console.log('ℹ️ No active subscription found');
            }
        } catch (err) {
            console.error('❌ Error fetching membership data:', err);
            Alert.alert(t('Error'), t('Failed to load membership information'));
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = async (plan) => {
        // Check if this is the current plan
        if (currentSubscription && plan.slug === currentSubscription.plan_slug) {
            Alert.alert(t('Current Plan'), t('This is your current membership plan'));
            return;
        }

        // Check compatibility
        if (currentSubscription) {
            // Specific check for Private -> Business upgrade
            if (
                currentSubscription.plan_type?.toLowerCase() === 'private' &&
                plan.plan_type?.toLowerCase() === 'business'
            ) {
                setRestrictionModalVisible(true);
                return;
            }

            // General compatibility check
            if (
                currentSubscription.plan_type &&
                plan.plan_type &&
                currentSubscription.plan_type !== plan.plan_type
            ) {
                Alert.alert(t('Unavailable'), t(`You can only upgrade to ${currentSubscription.plan_type} plans.`));
                return;
            }
        }

        // Handle free/green plan
        if (plan.slug === 'green' || plan.target_currency.total_price === 0) {
            Alert.alert(
                t('Free Plan'),
                t('The Green plan is free. Do you want to switch to this plan?'),
                [
                    {
                        text: t('Switch'),
                        onPress: async () => {
                            try {
                                const response = await subscriptionService.activateFreePlan(user.email);
                                if (response.success) {
                                    Alert.alert(t('Success'), t('Plan switched successfully!'));
                                    fetchData(); // Refresh data
                                }
                            } catch (error) {
                                Alert.alert(t('Error'), t('Failed to switch plan'));
                            }
                        }
                    },
                    { text: t('Cancel'), style: 'cancel' }
                ]
            );
            return;
        }

        // Navigate to cart/payment for paid plans
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
            isUpgrade: true
        });
    };

    const handlePlanDetails = (planType) => {
        navigation.navigate(`${planType}Membership`);
    };

    const renderPlanCard = (plan) => {
        const isCurrent = currentSubscription && plan.slug === currentSubscription.plan_slug;
        const isBest = plan.tag === 'best' || plan.is_best;
        const isPopular = plan.tag === 'popular' || plan.is_popular;
        const planColor = plan.color || '#4CAF50';
        const price = parseFloat(plan.target_currency?.total_price || 0);
        const symbol = plan.target_currency?.symbol || '$';
        const renewalPrice = parseFloat(plan.renewal?.total_price || price);
        const hasDifferentRenewal = plan.renewal?.is_different || false;
        const isFree = price === 0 && renewalPrice > 0;
        const isFreeFirstYear = price === 0 && renewalPrice > 0;

        return (
            <View key={plan.id} style={[styles.planCard, isCurrent && styles.currentPlanCard]}>
                <TouchableOpacity onPress={() => handlePlanDetails(plan.name)}>
                    <View style={[styles.planHeader, { backgroundColor: planColor }]}>
                        <Text style={styles.planTitle}>{plan.name}</Text>
                        {isCurrent && (
                            <View style={styles.currentBadge}>
                                <Text style={styles.currentBadgeText}>{t('CURRENT')}</Text>
                            </View>
                        )}
                        {isBest && !isCurrent && (
                            <View style={styles.bestBadge}>
                                <Text style={styles.bestBadgeText}>{t('BEST VALUE')}</Text>
                            </View>
                        )}
                        {isPopular && !isBest && !isCurrent && (
                            <View style={styles.popularBadge}>
                                <Text style={styles.popularBadgeText}>{t('POPULAR')}</Text>
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
                        style={[
                            styles.selectButton,
                            isCurrent ? styles.currentPlanButton : { backgroundColor: COLORS.primary }
                        ]}
                        onPress={() => handleSelectPlan(plan)}
                        disabled={isCurrent}
                    >
                        <Text style={styles.selectButtonText}>
                            {isCurrent ? t('Current Plan') : plan.slug === 'green' ? t('Switch to Free Plan') : t('Upgrade to ') + plan.name}
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
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>{t('Loading membership...')}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('My Membership')}</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Current Plan Summary */}
                {currentSubscription && (
                    <View style={styles.currentPlanSummary}>
                        <Text style={styles.summaryTitle}>{t('Your Current Plan')}</Text>
                        <Text style={styles.summaryPlanName}>{currentSubscription.plan_name}</Text>
                        <Text style={styles.summaryDates}>
                            {t('Valid until')}: {new Date(currentSubscription.end_date).toLocaleDateString()}
                        </Text>
                    </View>
                )}

                <Text style={styles.title}>{t('Available Plans')}</Text>

                {/* Plan Cards */}
                {plans.map(plan => renderPlanCard(plan))}

                {plans.length === 0 && (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>{t('No subscription plans available')}</Text>
                    </View>
                )}
                <SuggestionsFooter sourceRoute="MyMembership" />
            </ScrollView>

            {/* Upgrade Restriction Modal */}
            <PlanUpgradeRestrictionModal
                visible={restrictionModalVisible}
                onClose={() => setRestrictionModalVisible(false)}
            />
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
        fontWeight: '600',
        color: '#000',
        flex: 1,
        textAlign: 'center',
        marginRight: 36,
    },
    headerRight: {
        width: 32,
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    currentPlanSummary: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 20,
        // borderRadius: 12,
        // borderWidth: 2,
        // borderColor: COLORS.primary,
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    summaryPlanName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    summaryDates: {
        fontSize: 14,
        color: '#666',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    planCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    currentPlanCard: {
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
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 24,
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    currentPlanButton: {
        backgroundColor: '#999',
    },
    selectButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    currentBadge: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    currentBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.5,
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
    emptyContainer: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
});

export default MyMembershipScreen;
