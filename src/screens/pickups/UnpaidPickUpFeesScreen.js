import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/TranslationContext';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import GlobalHeader from '../../components/GlobalHeader';
import pickupService from '../../services/pickupService';
import { getFullImageUrl } from '../../utils/imageUtils';

const UnpaidPickUpFeesScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [unpaidPickups, setUnpaidPickups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchUnpaidPickups();
    }, []);

    const fetchUnpaidPickups = async (showRefreshIndicator = false) => {
        try {
            if (showRefreshIndicator) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            const response = await pickupService.getUnpaidPickups();

            if (response.success) {
                setUnpaidPickups(response.unpaid_pickups || []);
            } else {
                setUnpaidPickups([]);
            }
        } catch (error) {
            console.error('Error fetching unpaid pickups:', error);
            Alert.alert(t('Error'), t('Failed to load unpaid fees. Please try again.'));
            setUnpaidPickups([]);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchUnpaidPickups(true);
    };

    const handlePayNow = (pickup) => {
        // Navigate to payment screen
        navigation.navigate('PickUpPayment', {
            pickupId: pickup.id,
            pickupData: pickup,
            productPrice: pickup.advertisement_price || pickup.offer_price, // Explicitly pass price
            amount: pickup.total_fee,
            advertisementTitle: pickup.advertisement_title
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const calculateTotalUnpaid = () => {
        return unpaidPickups.reduce((sum, pickup) => {
            return sum + parseFloat(pickup.total_fee || 0);
        }, 0);
    };

    const UnpaidFeeCard = ({ item, onPayNow, t }) => {
        const [expanded, setExpanded] = useState(false);

        // Initial fees from item
        const pickupFee = parseFloat(item.pickup_fee || 0);
        const safeServiceFee = parseFloat(item.safe_service_fee || 0);
        const productPrice = parseFloat(item.advertisement_price || 0);
        const originalTotal = parseFloat(item.total_fee || 0);

        // New logic: Buyer's Fee = Pickup + Service
        const buyersFee = pickupFee + safeServiceFee;

        // Static 2.7% calculation
        const itemFeePercent = 0.027;
        const itemFee = productPrice * itemFeePercent;

        // Discount matches item fee
        const discount = itemFee;

        // Subtotal = Product Price + Buyers Fee + Item Fee
        const subTotal = productPrice + buyersFee + itemFee;

        // Grand Total = Subtotal - Discount
        // Effectively: Product Price + Buyers Fee
        const calculatedTotal = subTotal - discount;

        // Get product image
        let productImageUri = null;
        if (item.advertisement_images) {
            try {
                const images = typeof item.advertisement_images === 'string'
                    ? JSON.parse(item.advertisement_images)
                    : item.advertisement_images;
                if (images && images.length > 0) {
                    productImageUri = getFullImageUrl(images[0]);
                }
            } catch (e) {
                console.error('Error parsing images:', e);
            }
        }

        return (
            <View style={styles.unpaidCard}>
                {/* Product Info */}
                <View style={styles.productSection}>
                    {productImageUri ? (
                        <Image
                            source={{ uri: productImageUri }}
                            style={styles.productImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Ionicons name="image-outline" size={32} color="#ccc" />
                        </View>
                    )}
                    <View style={styles.productDetails}>
                        <Text style={styles.productTitle} numberOfLines={2}>
                            {item.advertisement_title}
                        </Text>
                        <Text style={styles.productPrice}>
                            {t('Product Price')}: £{productPrice.toFixed(2)}
                        </Text>
                        <Text style={styles.scheduledDate}>
                            {t('Scheduled')}: {new Date(item.scheduled_date).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                            })}
                        </Text>
                    </View>
                </View>

                {/* Fee Breakdown */}
                {/* Fee Breakdown */}
                <View style={styles.feeSection}>
                    {/* Product Price */}
                    <View style={styles.feeRow}>
                        <Text style={styles.feeLabel}>{t('Product Price')}</Text>
                        <Text style={styles.feeValue}>
                            £{productPrice.toFixed(2)}
                        </Text>
                    </View>

                    {/* Expandable Buyer's Fee */}
                    <TouchableOpacity
                        style={styles.feeRow}
                        onPress={() => setExpanded(!expanded)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.feeLabelContainer}>
                            <Text style={styles.feeLabelMain}>{t('Buyers Fee')}</Text>
                            <Ionicons
                                name={expanded ? "chevron-up" : "chevron-down"}
                                size={16}
                                color="#666"
                                style={{ marginLeft: 4 }}
                            />
                        </View>
                        <Text style={styles.feeValueMain}>
                            £{buyersFee.toFixed(2)}
                        </Text>
                    </TouchableOpacity>

                    {expanded && (
                        <View style={styles.expandedSection}>
                            <View style={styles.subFeeRow}>
                                <Text style={styles.subFeeLabel}>{t('Pick Up & Exchange Fee')}</Text>
                                <Text style={styles.subFeeValue}>£{pickupFee.toFixed(2)}</Text>
                            </View>
                            <View style={styles.subFeeRow}>
                                <Text style={styles.subFeeLabel}>{t('Service Fee')}</Text>
                                <Text style={styles.subFeeValue}>£{safeServiceFee.toFixed(2)}</Text>
                            </View>
                        </View>
                    )}

                    {/* Item Fee */}
                    <View style={styles.feeRow}>
                        <Text style={styles.feeLabel}>{t('Item Fee')} (2.7%)</Text>
                        <Text style={styles.feeValue}>
                            £{itemFee.toFixed(2)}
                        </Text>
                    </View>

                    {/* Sub Total divider */}
                    <View style={[styles.divider, { marginVertical: 4 }]} />

                    {/* Sub Total */}
                    <View style={styles.feeRow}>
                        <Text style={[styles.feeLabel, { fontWeight: '600' }]}>{t('Sub Total')}</Text>
                        <Text style={[styles.feeValue, { fontWeight: '600' }]}>
                            £{subTotal.toFixed(2)}
                        </Text>
                    </View>

                    {/* Discount */}
                    <View style={styles.feeRow}>
                        <Text style={[styles.feeLabel, { color: '#4CAF50' }]}>{t('Discount')} (2.7%)</Text>
                        <Text style={[styles.feeValue, { color: '#4CAF50' }]}>
                            -£{discount.toFixed(2)}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.feeRow}>
                        <Text style={styles.totalLabel}>{t('Grand Total')}</Text>
                        <Text style={styles.totalValue}>
                            £{calculatedTotal.toFixed(2)}
                        </Text>
                    </View>
                </View>

                {/* Pay Now Button */}
                <TouchableOpacity
                    style={styles.payButton}
                    onPress={() => onPayNow(item)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="card-outline" size={20} color="#fff" />
                    <Text style={styles.payButtonText}>{t('Pay now')}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <GlobalHeader
                title={t('Unpaid Pick Up & Safe Service Fees')}
                navigation={navigation}
                showBackButton={true}
                showIcons={true}
            />

            {/* Total Summary */}
            {!isLoading && unpaidPickups.length > 0 && (
                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>{t('Total Unpaid Fees')}</Text>
                        <Text style={styles.summaryAmount}>
                            £{calculateTotalUnpaid().toFixed(2)}
                        </Text>
                    </View>
                    <Text style={styles.summarySubtext}>
                        {unpaidPickups.length} {unpaidPickups.length === 1 ? 'pickup' : 'pickups'} pending payment
                    </Text>
                </View>
            )}

            {/* Content */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>{t('Loading unpaid fees...')}</Text>
                </View>
            ) : (
                <FlatList
                    data={unpaidPickups}
                    renderItem={({ item }) => <UnpaidFeeCard item={item} onPayNow={handlePayNow} t={t} />}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="checkmark-circle-outline" size={64} color="#4CAF50" />
                            <Text style={styles.emptyText}>{t('All fees paid!')}</Text>
                            <Text style={styles.emptySubtext}>{t("You don't have any pending pickup fees")}</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    summaryCard: {
        backgroundColor: '#fff',
        padding: 16,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    summaryAmount: {
        fontSize: 24,
        fontWeight: '700',
        color: '#F44336',
    },
    summarySubtext: {
        fontSize: 14,
        color: '#666',
    },
    listContent: {
        padding: 16,
    },
    unpaidCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    productSection: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
    },
    imagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    productDetails: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    productTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    scheduledDate: {
        fontSize: 13,
        color: '#999',
    },
    feeSection: {
        backgroundColor: '#f8f8f8',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    feeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    feeLabel: {
        fontSize: 14,
        color: '#666',
    },
    feeValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
    },
    feeLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    feeLabelMain: {
        fontSize: 14,
        color: '#000',
        fontWeight: '600',
    },
    feeValueMain: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    expandedSection: {
        paddingVertical: 8,
        paddingLeft: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        marginTop: 4,
        marginBottom: 8,
    },
    subFeeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 2,
    },
    subFeeLabel: {
        fontSize: 13,
        color: '#666',
    },
    subFeeValue: {
        fontSize: 13,
        color: '#666',
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#F44336',
    },
    payButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F44336',
        paddingVertical: 14,
        borderRadius: 8,
        gap: 8,
    },
    payButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
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
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4CAF50',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
});

export default UnpaidPickUpFeesScreen;
