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

const PaidPickUpFeesScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [paidPickups, setPaidPickups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchPaidPickups();
    }, []);

    const fetchPaidPickups = async (showRefreshIndicator = false) => {
        try {
            if (showRefreshIndicator) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            const response = await pickupService.getUserPickups({
                type: 'buyer',
                payment_status: 'paid',
                limit: 50
            });

            if (response.success) {
                setPaidPickups(response.pickups || []);
            } else {
                setPaidPickups([]);
            }
        } catch (error) {
            console.error('Error fetching paid pickups:', error);
            Alert.alert(t('Error'), t('Failed to load payment history. Please try again.'));
            setPaidPickups([]);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchPaidPickups(true);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderPaidItem = ({ item }) => {
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

        // Parse fee values
        const offerPrice = parseFloat(item.offer_price || 0);
        const pickupFee = parseFloat(item.pickup_fee || 0);
        const safeServiceFee = parseFloat(item.safe_service_fee || 0);
        const buyerFee = parseFloat(item.buyer_fee || 0);
        const itemFee = parseFloat(item.item_fee || 0);
        const itemFeeDiscount = parseFloat(item.item_fee_discount || 0);
        const totalFee = parseFloat(item.total_fee || 0);
        const paymentMethod = item.payment_method || 'card';

        return (
            <View style={styles.paidCard}>
                {/* Paid Badge */}
                <View style={styles.paidBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" style={{ marginRight: 6 }} />
                    <Text style={styles.paidBadgeText}>{t('Paid')}</Text>
                </View>

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
                        {offerPrice > 0 && (
                            <Text style={styles.offerPrice}>
                                Offer Price: £{offerPrice.toFixed(2)}
                            </Text>
                        )}
                        <Text style={styles.scheduledDate}>
                            Pickup: {formatDate(item.scheduled_date)}
                        </Text>
                    </View>
                </View>

                {/* Payment Details */}
                <View style={styles.paymentSection}>
                    <View style={styles.paymentRow}>
                        <Ionicons name="calendar-outline" size={16} color="#666" style={{ marginRight: 8 }} />
                        <Text style={styles.paymentLabel}>{t('Paid on:')}</Text>
                        <Text style={styles.paymentValue}>
                            {item.paid_at ? formatDateTime(item.paid_at) : 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.paymentRow}>
                        <Ionicons
                            name={paymentMethod === 'wallet' ? 'wallet' : 'card-outline'}
                            size={16}
                            color="#666"
                            style={{ marginRight: 8 }}
                        />
                        <Text style={styles.paymentLabel}>{t('Payment Method:')}</Text>
                        <Text style={styles.paymentValue}>
                            {paymentMethod === 'wallet' ? 'Wallet' : 'Card'}
                        </Text>
                    </View>
                    {item.payment_id && (
                        <View style={styles.paymentRow}>
                            <Ionicons name="receipt-outline" size={16} color="#666" style={{ marginRight: 8 }} />
                            <Text style={styles.paymentLabel}>{t('Transaction ID:')}</Text>
                            <Text style={styles.paymentValue}>#{item.payment_id}</Text>
                        </View>
                    )}
                </View>

                {/* Fee Breakdown */}
                <View style={styles.feeSection}>
                    {pickupFee > 0 && (
                        <View style={styles.feeRow}>
                            <Text style={styles.feeLabel}>{t('Pickup Fee')}</Text>
                            <Text style={styles.feeValue}>
                                £{pickupFee.toFixed(2)}
                            </Text>
                        </View>
                    )}
                    {safeServiceFee > 0 && (
                        <View style={styles.feeRow}>
                            <Text style={styles.feeLabel}>{t('Safe Service Fee')}</Text>
                            <Text style={styles.feeValue}>
                                £{safeServiceFee.toFixed(2)}
                            </Text>
                        </View>
                    )}
                    {buyerFee > 0 && (
                        <View style={styles.feeRow}>
                            <Text style={styles.feeLabel}>{t('Buyer Fee')}</Text>
                            <Text style={styles.feeValue}>
                                £{buyerFee.toFixed(2)}
                            </Text>
                        </View>
                    )}
                    {itemFee > 0 && (
                        <View style={styles.feeRow}>
                            <View style={styles.feeWithDiscount}>
                                <Text style={styles.feeLabel}>{t('Item Fee')}</Text>
                                {itemFeeDiscount > 0 && (
                                    <View style={styles.discountBadge}>
                                        <Ionicons name="pricetag" size={12} color="#4CAF50" style={{ marginRight: 4 }} />
                                        <Text style={styles.discountText}>
                                            -£{itemFeeDiscount.toFixed(2)} discount
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.feeValueContainer}>
                                {itemFeeDiscount > 0 && (
                                    <Text style={styles.originalFee}>
                                        £{(itemFee + itemFeeDiscount).toFixed(2)}
                                    </Text>
                                )}
                                <Text style={styles.feeValue}>
                                    £{itemFee.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    )}
                    <View style={styles.divider} />
                    <View style={styles.feeRow}>
                        <Text style={styles.totalLabel}>{t('Total Paid')}</Text>
                        <Text style={styles.totalValue}>
                            £{totalFee.toFixed(2)}
                        </Text>
                    </View>
                </View>

                {/* View Receipt Button */}
                <TouchableOpacity
                    style={styles.receiptButton}
                    onPress={() => {
                        Alert.alert(t('Receipt'), t('Receipt viewing functionality coming soon'));
                    }}
                >
                    <Ionicons name="document-text-outline" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
                    <Text style={styles.receiptButtonText}>{t('View Receipt')}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <GlobalHeader
                title={t('Paid Pick Up & Safe Service Fees')}
                navigation={navigation}
                showBackButton={true}
                showIcons={true}
            />

            {/* Content */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>{t('Loading payment history...')}</Text>
                </View>
            ) : (
                <FlatList
                    data={paidPickups}
                    renderItem={renderPaidItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="receipt-outline" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>{t('No payment history')}</Text>
                            <Text style={styles.emptySubtext}>{t('Your paid pickup fees will appear here')}</Text>
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
    listContent: {
        padding: 16,
    },
    paidCard: {
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
    paidBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginBottom: 12,
    },
    paidBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4CAF50',
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
    offerPrice: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '600',
        marginBottom: 4,
    },
    scheduledDate: {
        fontSize: 13,
        color: '#999',
    },
    paymentSection: {
        marginBottom: 16,
    },
    paymentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    paymentLabel: {
        fontSize: 14,
        color: '#666',
    },
    paymentValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
        flex: 1,
    },
    feeSection: {
        backgroundColor: '#f8f8f8',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
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
        color: '#4CAF50',
    },
    receiptButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    receiptButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.primary,
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
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    feeWithDiscount: {
        flex: 1,
    },
    discountBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    discountText: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '600',
    },
    feeValueContainer: {
        alignItems: 'flex-end',
    },
    originalFee: {
        fontSize: 12,
        color: '#999',
        textDecorationLine: 'line-through',
        marginBottom: 2,
    },
});

export default PaidPickUpFeesScreen;
