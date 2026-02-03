import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/TranslationContext';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import GlobalHeader from '../../components/GlobalHeader';
import WalletPaymentOption from '../../components/WalletPaymentOption';
import pickupService from '../../services/pickupService';

const PickUpPaymentScreen = ({ route, navigation }) => {
    const { t } = useTranslation();
    const { pickupId, pickupData } = route.params;

    const [selectedMethod, setSelectedMethod] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [fees, setFees] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showFeeDetails, setShowFeeDetails] = useState(false);

    useEffect(() => {
        fetchPickupFees();
    }, []);

    const fetchPickupFees = async () => {
        try {
            const response = await pickupService.getPickupFees();
            if (response.success) {
                setFees(response.fees);
            }
        } catch (error) {
            console.error('Error fetching fees:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate fees based on offer price/product price from params or data
    // Use route param first as it's explicitly passed from previous screen
    const rawPrice = route.params?.productPrice || pickupData?.offer_price || pickupData?.advertisement_price || 0;
    const offerPrice = parseFloat(rawPrice);
    const pickupFee = parseFloat(fees?.pickup_fee || 0);
    const safeServiceFee = parseFloat(fees?.safe_service_fee || 0);

    // New Logic
    const buyersFee = pickupFee + safeServiceFee;

    // Static 2.7%
    const itemFeePercentage = 2.7;
    const itemFee = (offerPrice * itemFeePercentage) / 100;

    // Discount matches item fee
    const discount = itemFee;

    // Subtotal = Product Price + Buyers Fee + Item Fee
    const subTotal = offerPrice + buyersFee + itemFee;

    // Grand Total = Subtotal - Discount
    const totalAmount = subTotal - discount;

    const paymentMethods = [
        {
            id: 'card',
            name: 'Credit/Debit Card',
            icon: 'card-outline',
            description: 'Pay securely with Stripe'
        },
        {
            id: 'cod',
            name: 'Cash on Delivery',
            icon: 'cash-outline',
            description: 'Pay with cash upon pickup'
        },
    ];

    const handlePayment = async () => {
        if (!selectedMethod) {
            Alert.alert(t('Error'), t('Please select a payment method'));
            return;
        }

        let paymentMethodName = 'Card';
        if (selectedMethod === 'wallet') paymentMethodName = 'Wallet';
        else if (selectedMethod === 'cod') paymentMethodName = 'Cash on Delivery';

        Alert.alert(
            t('Confirm Payment'),
            `Pay £${totalAmount.toFixed(2)} via ${paymentMethodName} for pickup fees?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Pay Now',
                    onPress: async () => {
                        try {
                            setIsProcessing(true);

                            // TODO: Integrate with actual payment system
                            // For CODs, we might just mark as pending or instructions
                            await new Promise(resolve => setTimeout(resolve, 2000));

                            // Navigate to success screen or show success message
                            Alert.alert(
                                t('Payment Successful!'),
                                t('Your pickup fee has been paid successfully.'),
                                [
                                    {
                                        text: t('OK'),
                                        onPress: () => {
                                            // Navigate back to pickup details or status screen
                                            navigation.navigate('PickUpStatus');
                                        }
                                    }
                                ]
                            );
                        } catch (error) {
                            console.error('Payment error:', error);
                            Alert.alert(t('Payment Failed'), t('Unable to process payment. Please try again.'));
                        } finally {
                            setIsProcessing(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <GlobalHeader
                title={t('Payment')}
                navigation={navigation}
                showBackButton={true}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Order Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('Payment Summary')}</Text>
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>{t('Product')}</Text>
                            <Text style={styles.summaryValue} numberOfLines={1}>
                                {pickupData?.advertisement_title || 'N/A'}
                            </Text>
                        </View>
                        {offerPrice > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>{t('Product Price')}</Text>
                                <Text style={styles.offerPriceText}>£{offerPrice.toFixed(2)}</Text>
                            </View>
                        )}
                        <View style={styles.divider} />

                        {loading ? (
                            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 16 }} />
                        ) : (
                            <>
                                <>
                                    {/* Expandable Buyer's Fee */}
                                    <TouchableOpacity
                                        style={styles.summaryRow}
                                        onPress={() => setShowFeeDetails(!showFeeDetails)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={[styles.summaryLabel, { fontWeight: '600', color: '#000' }]}>{t('Buyers Fee')}</Text>
                                            <Ionicons
                                                name={showFeeDetails ? "chevron-up" : "chevron-down"}
                                                size={16}
                                                color="#666"
                                                style={{ marginLeft: 4 }}
                                            />
                                        </View>
                                        <Text style={[styles.summaryValue, { fontWeight: '600' }]}>£{buyersFee.toFixed(2)}</Text>
                                    </TouchableOpacity>

                                    {showFeeDetails && (
                                        <View style={styles.expandedDetails}>
                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>{t('Pick Up & Exchange Fee')}</Text>
                                                <Text style={styles.detailValue}>£{pickupFee.toFixed(2)}</Text>
                                            </View>
                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>{t('Service Fee')}</Text>
                                                <Text style={styles.detailValue}>£{safeServiceFee.toFixed(2)}</Text>
                                            </View>
                                        </View>
                                    )}

                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>
                                            {t('Item Fee')} ({itemFeePercentage}%)
                                        </Text>
                                        <Text style={styles.summaryValue}>£{itemFee.toFixed(2)}</Text>
                                    </View>

                                    {/* Sub Total divider */}
                                    <View style={[styles.divider, { marginVertical: 4 }]} />

                                    {/* Sub Total */}
                                    <View style={styles.summaryRow}>
                                        <Text style={[styles.summaryLabel, { fontWeight: '600', color: '#000' }]}>{t('Sub Total')}</Text>
                                        <Text style={[styles.summaryValue, { fontWeight: '600' }]}>
                                            £{subTotal.toFixed(2)}
                                        </Text>
                                    </View>

                                    <View style={styles.summaryRow}>
                                        <Text style={[styles.summaryLabel, { color: '#4CAF50' }]}>
                                            {t('Discount')} ({itemFeePercentage}%)
                                        </Text>
                                        <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>-£{discount.toFixed(2)}</Text>
                                    </View>
                                </>
                            </>
                        )}

                        <View style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.totalLabel}>{t('Grand Total')}</Text>
                            <Text style={styles.totalValue}>
                                £{totalAmount.toFixed(2)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Payment Methods */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('Choose Payment Method')}</Text>

                    {/* Wallet Payment Option */}
                    <WalletPaymentOption
                        selected={selectedMethod === 'wallet'}
                        onSelect={() => setSelectedMethod('wallet')}
                        amount={totalAmount}
                        showBalance={true}
                        style={{ marginBottom: 12 }}
                    />

                    {/* Card Payment Methods */}
                    {paymentMethods.map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            style={[
                                styles.paymentMethod,
                                selectedMethod === method.id && styles.selectedMethod
                            ]}
                            onPress={() => setSelectedMethod(method.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.methodIcon}>
                                <Ionicons
                                    name={method.icon}
                                    size={28}
                                    color={selectedMethod === method.id ? COLORS.primary : '#666'}
                                />
                            </View>
                            <View style={styles.methodInfo}>
                                <Text style={styles.methodName}>{method.name}</Text>
                                <Text style={styles.methodDescription}>{method.description}</Text>
                            </View>
                            <View style={styles.radioButton}>
                                {selectedMethod === method.id && (
                                    <View style={styles.radioButtonInner} />
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Security Info */}
                <View style={styles.securityInfo}>
                    <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
                    <Text style={styles.securityText}>{t('Your payment information is secure and encrypted')}</Text>
                </View>
            </ScrollView>

            {/* Pay Button */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={[styles.payButton, (!selectedMethod || isProcessing) && styles.payButtonDisabled]}
                    onPress={handlePayment}
                    disabled={!selectedMethod || isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="lock-closed" size={20} color="#fff" />
                            <Text style={styles.payButtonText}>
                                Pay £{totalAmount.toFixed(2)}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
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
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    summaryLabel: {
        fontSize: 15,
        color: '#666',
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: '500',
        color: '#000',
        flex: 1,
        textAlign: 'right',
        marginLeft: 16,
    },
    offerPriceText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#4CAF50',
        flex: 1,
        textAlign: 'right',
        marginLeft: 16,
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
    paymentMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    selectedMethod: {
        borderColor: COLORS.primary,
        backgroundColor: `${COLORS.primary}05`,
    },
    methodIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    methodInfo: {
        flex: 1,
    },
    methodName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    methodDescription: {
        fontSize: 14,
        color: '#666',
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#ccc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.primary,
    },
    securityInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        margin: 16,
        backgroundColor: '#E8F5E9',
        borderRadius: 12,
    },
    securityText: {
        flex: 1,
        fontSize: 14,
        color: '#2E7D32',
        fontWeight: '500',
    },
    bottomContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    payButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 8,
        gap: 8,
    },
    payButtonDisabled: {
        opacity: 0.5,
    },
    payButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    expandedDetails: {
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        marginLeft: 16, // Indent slightly
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    detailLabel: {
        fontSize: 13,
        color: '#666',
    },
    detailValue: {
        fontSize: 13,
        color: '#333',
    },
});

export default PickUpPaymentScreen;
