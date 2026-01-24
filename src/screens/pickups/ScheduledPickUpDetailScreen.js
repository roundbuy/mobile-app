import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/TranslationContext';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
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

const ScheduledPickUpDetailScreen = ({ route, navigation }) => {
    const { t } = useTranslation();
    const { pickupId } = route.params;

    const [pickup, setPickup] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchPickupDetails();
    }, []);

    const fetchPickupDetails = async () => {
        try {
            setIsLoading(true);
            const response = await pickupService.getPickupDetails(pickupId);

            if (response.success) {
                setPickup(response.pickup);
            } else {
                Alert.alert(t('Error'), t('Failed to load pickup details'));
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error fetching pickup details:', error);
            Alert.alert(t('Error'), t('Failed to load pickup details'));
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirm = async () => {
        Alert.alert(
            t('Confirm Pickup'),
            t('Are you sure you want to confirm this pickup schedule?'),
            [
                { text: t('Cancel'), style: t('cancel') },
                {
                    text: t('Confirm'),
                    onPress: async () => {
                        try {
                            setIsProcessing(true);
                            const response = await pickupService.confirmPickup(pickupId);

                            if (response.success) {
                                Alert.alert(t('Success'), t('Pickup confirmed successfully!'), [
                                    { text: t('OK'), onPress: () => navigation.goBack() }
                                ]);
                            }
                        } catch (error) {
                            console.error('Error confirming pickup:', error);
                            Alert.alert(t('Error'), error.response?.data?.message || t('Failed to confirm pickup'));
                        } finally {
                            setIsProcessing(false);
                        }
                    }
                }
            ]
        );
    };

    const handleReschedule = () => {
        navigation.navigate('ReschedulePickUp', {
            pickupId: pickupId,
            currentDate: pickup.scheduled_date,
            currentTime: pickup.scheduled_time
        });
    };

    const handleCancel = () => {
        Alert.alert(
            t('Cancel Pickup'),
            t('Are you sure you want to cancel this pickup?'),
            [
                { text: t('No'), style: t('cancel') },
                {
                    text: t('Yes, Cancel'),
                    style: t('destructive'),
                    onPress: async () => {
                        try {
                            setIsProcessing(true);
                            const response = await pickupService.cancelPickup(pickupId, 'User cancelled');

                            if (response.success) {
                                Alert.alert(t('Cancelled'), t('Pickup has been cancelled'), [
                                    { text: t('OK'), onPress: () => navigation.goBack() }
                                ]);
                            }
                        } catch (error) {
                            console.error('Error cancelling pickup:', error);
                            Alert.alert(t('Error'), t('Failed to cancel pickup'));
                        } finally {
                            setIsProcessing(false);
                        }
                    }
                }
            ]
        );
    };

    const handlePayNow = () => {
        navigation.navigate('PickUpPayment', {
            pickupId: pickup.id,
            amount: pickup.total_fee,
            advertisementTitle: pickup.advertisement_title
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#FF9800';
            case 'confirmed': return '#2196F3';
            case 'rescheduled': return '#9C27B0';
            case 'completed': return '#4CAF50';
            case 'cancelled': return '#F44336';
            default: return '#999';
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <GlobalHeader
                    title={t('Pickup Details')}
                    navigation={navigation}
                    showBackButton={true}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>{t('Loading details...')}</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!pickup) {
        return null;
    }

    // Get product image
    let productImageUri = null;
    if (pickup.advertisement_images) {
        try {
            const images = typeof pickup.advertisement_images === 'string'
                ? JSON.parse(pickup.advertisement_images)
                : pickup.advertisement_images;
            if (images && images.length > 0) {
                productImageUri = getFullImageUrl(images[0]);
            }
        } catch (e) {
            console.error('Error parsing images:', e);
        }
    }

    const isBuyer = pickup.user_role === 'buyer';
    const statusColor = getStatusColor(pickup.status);
    const canConfirm = !isBuyer && pickup.status === 'pending';
    const canReschedule = pickup.status !== 'completed' && pickup.status !== 'cancelled';
    const canCancel = pickup.status !== 'completed' && pickup.status !== 'cancelled';
    const needsPayment = isBuyer && pickup.payment_status === 'unpaid' && pickup.status === 'confirmed';

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <GlobalHeader
                title={t('Scheduled Pick Up')}
                navigation={navigation}
                showBackButton={true}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Status Badge */}
                <View style={[styles.statusBanner, { backgroundColor: `${statusColor}15` }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.statusText, { color: statusColor }]}>
                        {pickup.status.charAt(0).toUpperCase() + pickup.status.slice(1)}
                    </Text>
                </View>

                {/* Product Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('Product')}</Text>
                    <View style={styles.productCard}>
                        {productImageUri ? (
                            <Image
                                source={{ uri: productImageUri }}
                                style={styles.productImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Ionicons name="image-outline" size={40} color="#ccc" />
                            </View>
                        )}
                        <View style={styles.productInfo}>
                            <Text style={styles.productTitle}>{pickup.advertisement_title}</Text>
                            <Text style={styles.productPrice}>
                                £{parseFloat(pickup.advertisement_price || 0).toFixed(2)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Schedule Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('Schedule Details')}</Text>
                    <View style={styles.detailsCard}>
                        <View style={styles.detailRow}>
                            <Ionicons name="calendar" size={20} color={COLORS.primary} />
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>{t('Date')}</Text>
                                <Text style={styles.detailValue}>{formatDate(pickup.scheduled_date)}</Text>
                            </View>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="time" size={20} color={COLORS.primary} />
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>{t('Time')}</Text>
                                <Text style={styles.detailValue}>{formatTime(pickup.scheduled_time)}</Text>
                            </View>
                        </View>
                        {pickup.description && (
                            <View style={styles.detailRow}>
                                <Ionicons name="document-text" size={20} color={COLORS.primary} />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>{t('Description')}</Text>
                                    <Text style={styles.detailValue}>{pickup.description}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* Contact Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {isBuyer ? 'Seller Information' : 'Buyer Information'}
                    </Text>
                    <View style={styles.contactCard}>
                        <View style={styles.contactRow}>
                            <Ionicons name="person" size={20} color="#666" />
                            <Text style={styles.contactText}>
                                {isBuyer ? pickup.seller_name : pickup.buyer_name}
                            </Text>
                        </View>
                        {pickup.seller_phone && (
                            <View style={styles.contactRow}>
                                <Ionicons name="call" size={20} color="#666" />
                                <Text style={styles.contactText}>
                                    {isBuyer ? pickup.seller_phone : pickup.buyer_phone}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Fee Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('Fee Information')}</Text>
                    <View style={styles.feeCard}>
                        <View style={styles.feeRow}>
                            <Text style={styles.feeLabel}>{t('Pickup Fee')}</Text>
                            <Text style={styles.feeValue}>£{parseFloat(pickup.pickup_fee || 0).toFixed(2)}</Text>
                        </View>
                        <View style={styles.feeRow}>
                            <Text style={styles.feeLabel}>{t('Safe Service Fee')}</Text>
                            <Text style={styles.feeValue}>£{parseFloat(pickup.safe_service_fee || 0).toFixed(2)}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.feeRow}>
                            <Text style={styles.totalLabel}>{t('Total')}</Text>
                            <Text style={styles.totalValue}>£{parseFloat(pickup.total_fee || 0).toFixed(2)}</Text>
                        </View>
                        <View style={[styles.paymentStatus, {
                            backgroundColor: pickup.payment_status === 'paid' ? '#E8F5E9' : '#FFF3E0'
                        }]}>
                            <Ionicons
                                name={pickup.payment_status === 'paid' ? 'checkmark-circle' : 'warning'}
                                size={16}
                                color={pickup.payment_status === 'paid' ? '#4CAF50' : '#FF9800'}
                            />
                            <Text style={[styles.paymentStatusText, {
                                color: pickup.payment_status === 'paid' ? '#4CAF50' : '#FF9800'
                            }]}>
                                {pickup.payment_status === 'paid' ? 'Paid' : 'Payment Pending'}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
                {needsPayment && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.payButton]}
                        onPress={handlePayNow}
                        disabled={isProcessing}
                    >
                        <Ionicons name="card" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>{t('Pay Now')}</Text>
                    </TouchableOpacity>
                )}

                {canConfirm && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.confirmButton]}
                        onPress={handleConfirm}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                <Text style={styles.actionButtonText}>{t('Confirm Exchange')}</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                {canReschedule && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.rescheduleButton]}
                        onPress={handleReschedule}
                        disabled={isProcessing}
                    >
                        <Ionicons name="calendar" size={20} color={COLORS.primary} />
                        <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>{t('Reschedule Exchange')}</Text>
                    </TouchableOpacity>
                )}

                {canCancel && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={handleCancel}
                        disabled={isProcessing}
                    >
                        <Text style={[styles.actionButtonText, { color: '#F44336' }]}>{t('Cancel Pickup')}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
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
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        gap: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    section: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 12,
    },
    productCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    productImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
    },
    imagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    productInfo: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'center',
    },
    productTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
    },
    productPrice: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.primary,
    },
    detailsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        gap: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    contactCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        gap: 12,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    contactText: {
        fontSize: 16,
        color: '#000',
    },
    feeCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    feeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    feeLabel: {
        fontSize: 15,
        color: '#666',
    },
    feeValue: {
        fontSize: 15,
        fontWeight: '500',
        color: '#000',
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 8,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    totalValue: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.primary,
    },
    paymentStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
        gap: 8,
    },
    paymentStatusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    actionContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
        gap: 8,
    },
    payButton: {
        backgroundColor: '#F44336',
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
    },
    rescheduleButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    cancelButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#F44336',
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

export default ScheduledPickUpDetailScreen;
