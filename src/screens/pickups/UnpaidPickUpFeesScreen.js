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

    const renderUnpaidItem = ({ item }) => {
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
                            Product Price: £{parseFloat(item.advertisement_price || 0).toFixed(2)}
                        </Text>
                        <Text style={styles.scheduledDate}>
                            Scheduled: {formatDate(item.scheduled_date)}
                        </Text>
                    </View>
                </View>

                {/* Fee Breakdown */}
                <View style={styles.feeSection}>
                    <View style={styles.feeRow}>
                        <Text style={styles.feeLabel}>{t('Pickup Fee')}</Text>
                        <Text style={styles.feeValue}>
                            £{parseFloat(item.pickup_fee || 0).toFixed(2)}
                        </Text>
                    </View>
                    <View style={styles.feeRow}>
                        <Text style={styles.feeLabel}>{t('Safe Service Fee')}</Text>
                        <Text style={styles.feeValue}>
                            £{parseFloat(item.safe_service_fee || 0).toFixed(2)}
                        </Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.feeRow}>
                        <Text style={styles.totalLabel}>{t('Total')}</Text>
                        <Text style={styles.totalValue}>
                            £{parseFloat(item.total_fee || 0).toFixed(2)}
                        </Text>
                    </View>
                </View>

                {/* Pay Now Button */}
                <TouchableOpacity
                    style={styles.payButton}
                    onPress={() => handlePayNow(item)}
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
                    renderItem={renderUnpaidItem}
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
