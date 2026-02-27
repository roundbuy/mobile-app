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
import Hyperlink from '../../../components/common/Hyperlink';

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
        const planColor = plan.color || '#4CAF50';
        const price = parseFloat(plan.target_currency?.total_price || 0);
        const symbol = plan.target_currency?.symbol || '£';
        const renewalPrice = parseFloat(plan.renewal?.total_price || price);
        const hasDifferentRenewal = plan.renewal?.is_different || false;
        const isFree = price === 0 && renewalPrice === 0;
        const isFreeFirstYear = price === 0 && renewalPrice > 0;

        return (
            <View key={plan.id} style={styles.planCard}>
                <TouchableOpacity onPress={() => handlePlanDetails(plan.name)}>
                    <View style={[styles.planHeader, { backgroundColor: planColor }]}>
                        <Text style={styles.planTitle}>{plan.name}</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.planContent}>
                    {plan.subheading || plan.description ? (
                        <Text style={styles.planSubtitle}>{plan.subheading || plan.description}</Text>
                    ) : null}

                    <View style={styles.priceContainer}>
                        <Text style={styles.priceText}>
                            {isFreeFirstYear ? (
                                `Price ${symbol}${renewalPrice} now for free ${symbol}0 / year`
                            ) : isFree ? (
                                `Price ${symbol}0 / year`
                            ) : hasDifferentRenewal && renewalPrice !== price ? (
                                `Price ${symbol}${price} now, then ${symbol}${renewalPrice} / year`
                            ) : (
                                `Price ${symbol}${price} / year`
                            )}
                        </Text>
                        <TouchableOpacity>
                            <Ionicons name="information-circle-outline" size={20} color="#000" style={styles.infoIconStyles} />
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
                        <Text style={[
                            styles.selectButtonText,
                            isCurrent && styles.currentPlanButtonText
                        ]}>
                            {isCurrent ? t('Current plan') : plan.slug === 'green' ? t('Switch to Free Plan') : t('Upgrade to ') + plan.name}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.cardDivider} />

                    <Text style={styles.featuresTitle}>{plan.name} plan includes</Text>
                    {plan.description_bullets && plan.description_bullets.map((feature, index) => (
                        <View key={index} style={styles.featureRow}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.featureItem}>{feature}</Text>
                        </View>
                    ))}
                </View>
                <Text style={styles.footerText}>
                    Read our <Hyperlink linkKey="billing_policy" style={styles.footerLinkText} unvisitedColor={COLORS.primary} textDecorationLine="underline">{t('Subscriptions & Billing Policy')}</Hyperlink>{'\n'}
                    and <Hyperlink linkKey="refund_policy" style={styles.footerLinkText} unvisitedColor={COLORS.primary} textDecorationLine="underline">{t('Refund Policy')}</Hyperlink>
                </Text>
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
                <Text style={styles.headerTitle}>{t('Membership plans')}</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Current Plan Summary */}
                {currentSubscription && (
                    <View style={styles.currentPlanSummary}>
                        <View style={styles.currentPlanRow}>
                            <Text style={styles.currentPlanLabel}>{t('Your current plan:')}</Text>
                            <View style={[styles.inlineBadge, { backgroundColor: currentSubscription.plan_color || '#4CAF50' }]}>
                                <Text style={styles.inlineBadgeText}>{currentSubscription.plan_name}</Text>
                            </View>
                            <TouchableOpacity onPress={() => { }}>
                                <Text style={styles.upgradeLink}>{t('Upgrade')}</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.summaryDates}>
                            {t('Your annual membership starts:')} {new Date(currentSubscription.start_date || currentSubscription.created_at || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' }).replace(/\//g, '.')}
                        </Text>
                        <Text style={styles.summaryDates}>
                            {t('Your annual membership ends:')} {new Date(currentSubscription.end_date || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' }).replace(/\//g, '.')}
                        </Text>
                        <View style={styles.divider} />
                    </View>
                )}

                {/* Plan Cards */}
                {plans.map(plan => renderPlanCard(plan))}

                {plans.length === 0 && (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>{t('No subscription plans available')}</Text>
                    </View>
                )}

                <View style={styles.footerLinksContainer}>
                    <Text style={styles.footerText}>
                        Read our <Hyperlink linkKey="billing_policy" style={styles.footerLinkText} unvisitedColor={COLORS.primary} textDecorationLine="underline">{t('Subscriptions & Billing Policy')}</Hyperlink>{'\n'}
                        and <Hyperlink linkKey="refund_policy" style={styles.footerLinkText} unvisitedColor={COLORS.primary} textDecorationLine="underline">{t('Refund Policy')}</Hyperlink>
                    </Text>
                </View>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 4,
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
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
        color: '#505050',
    },
    currentPlanSummary: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 24,
    },
    currentPlanRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    currentPlanLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginRight: 8,
    },
    inlineBadge: {
        paddingVertical: 2,
        paddingHorizontal: 6,
        marginRight: 8,
    },
    inlineBadgeText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#fff',
    },
    upgradeLink: {
        fontSize: 13,
        fontWeight: '500',
        color: COLORS.primary,
        textDecorationLine: 'underline',
    },
    summaryDates: {
        fontSize: 13,
        color: '#505050',
        marginBottom: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginTop: 24,
    },
    planCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginBottom: 32,
    },
    planHeader: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    planTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    planContent: {
        padding: 16,
    },
    planSubtitle: {
        fontSize: 14,
        color: '#505050',
        marginBottom: 16,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    priceText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
        marginRight: 6,
    },
    infoIconStyles: {
        marginLeft: 2,
    },
    selectButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24,
        alignSelf: 'flex-start',
        marginBottom: 24,
    },
    currentPlanButton: {
        backgroundColor: '#f0f0f0',
    },
    selectButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    currentPlanButtonText: {
        color: '#303234',
        fontWeight: '500',
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginBottom: 20,
    },
    featuresTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
        marginBottom: 16,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    bulletPoint: {
        fontSize: 14,
        color: '#000',
        marginRight: 8,
        marginTop: -1,
    },
    featureItem: {
        flex: 1,
        fontSize: 13,
        color: '#505050',
        lineHeight: 18,
    },
    emptyContainer: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#505050',
    },
    footerLinksContainer: {
        paddingVertical: 32,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#000',
        textAlign: 'center',
        lineHeight: 18,
    },
    footerLinkText: {
        fontSize: 12,
        fontWeight: '400',
    },
});

export default MyMembershipScreen;
