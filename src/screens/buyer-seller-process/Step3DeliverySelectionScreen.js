import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getFullImageUrl } from '../../utils/imageUtils';

const Step3DeliverySelectionScreen = ({ navigation, route }) => {
    const { conversationId, advertisementId, title, offerAmount, advertisement_images, itemImage } = route?.params || {};

    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState(null);
    const [selectedDelivery, setSelectedDelivery] = useState('pickup');

    // Values from the sub-screens when they return
    const [savedAddress, setSavedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null); // { type: 'wallet'|'card', label: '...' }

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const response = await api.get('/checkout/config');
            if (response.data.success) {
                setConfig(response.data.data);
                if (response.data.data.savedAddress) {
                    setSavedAddress(response.data.data.savedAddress);
                }
            }
        } catch (error) {
            console.error('Error fetching checkout config:', error);
            Alert.alert('Error', 'Failed to load checkout details.');
        } finally {
            setLoading(false);
        }
    };

    const deliveryOptions = [
        { id: 'pickup', title: 'Pick It Up Yourself', subtitle: 'From the item location' },
        { id: 'ship', title: 'Ship to You', subtitle: 'To your address' },
        { id: 'courier', title: 'Courier delivery', subtitle: 'To your address' },
    ];

    const basePrice = parseFloat(offerAmount || 0);
    const buyerFee = config ? config.fees.buyerFee : 1.00;
    const itemValueFeePercent = config ? config.fees.itemValueFeePercent : 2.7;
    const itemValueFee = (basePrice * itemValueFeePercent) / 100;
    const totalToPay = basePrice + buyerFee + itemValueFee;

    const handlePay = async () => {
        if (selectedDelivery !== 'pickup' && !savedAddress?.phone) {
            Alert.alert('Missing Info', 'Please provide your contact details/phone number.');
            return;
        }
        if (!paymentMethod) {
            Alert.alert('Missing Info', 'Please choose a payment method.');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/checkout/process-order', {
                advertisementId,
                conversationId,
                amount: totalToPay,
                deliveryOption: selectedDelivery,
                paymentMethod: paymentMethod.type,
                addressDetails: savedAddress,
                paymentId: paymentMethod.paymentId || null
            });

            if (response.data.success) {
                // Navigate to Payment Success Screen
                navigation.navigate('PaymentSuccessScreen', {
                    conversationId,
                    advertisementId,
                    title,
                    amount: totalToPay,
                    paymentMethod: paymentMethod.label || paymentMethod.type,
                    transactionId: response.data.orderId
                });
            }
        } catch (error) {
            console.error('Checkout error:', error);
            Alert.alert('Payment Failed', error.response?.data?.message || 'Something went wrong during checkout.');
        } finally {
            setLoading(false);
        }
    };

    let adImage = itemImage || null;
    if (advertisement_images) {
        try {
            adImage = JSON.parse(advertisement_images)[0];
        } catch (e) { }
    }

    if (loading && !config) {
        return (
            <SafeAreaView style={[styles.container, styles.centerAll]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Product Summary */}
                <View style={styles.productBlock}>
                    <Image
                        source={adImage ? { uri: getFullImageUrl(adImage) } : { uri: 'https://via.placeholder.com/80' }}
                        style={styles.productImage}
                    />
                    <View style={styles.productDetails}>
                        <Text style={styles.productTitle} numberOfLines={2}>{title || 'Product Item'}</Text>
                        <Text style={styles.productPrice}>£{basePrice.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Delivery Options */}
                <Text style={styles.sectionTitle}>Delivery option</Text>
                <View style={styles.deliveryContainer}>
                    {deliveryOptions.map((option, index) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.optionRow,
                                index === 0 && styles.optionRowFirst,
                                index === deliveryOptions.length - 1 && styles.optionRowLast,
                                selectedDelivery === option.id && styles.optionRowSelected
                            ]}
                            onPress={() => setSelectedDelivery(option.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.optionIconContainer}>
                                {option.id === 'pickup' && <Ionicons name="location-outline" size={24} color="#666" />}
                                {option.id === 'ship' && <Ionicons name="cube-outline" size={24} color="#666" />}
                                {option.id === 'courier' && <Ionicons name="airplane-outline" size={24} color="#666" />}
                            </View>
                            <View style={styles.optionTextContainer}>
                                <Text style={styles.optionTitle}>{option.title}</Text>
                                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                            </View>
                            <View style={styles.radioOuter}>
                                {selectedDelivery === option.id && <View style={styles.radioInner} />}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
                <TouchableOpacity style={styles.disclaimerLink}>
                    <Text style={styles.disclaimerText}>Our Location & Safety Disclaimers</Text>
                </TouchableOpacity>

                {/* Contact Details (Hidden for pickup) */}
                {selectedDelivery !== 'pickup' && (
                    <>
                        <Text style={styles.sectionTitle}>Contact details</Text>
                        <TouchableOpacity
                            style={styles.inputBox}
                            onPress={() => navigation.navigate('ShippingAddressScreen', {
                                savedAddress,
                                onSave: (address) => setSavedAddress(address)
                            })}
                        >
                            <Text style={[styles.inputText, savedAddress?.phone ? styles.inputTextFilled : null]}>
                                {savedAddress?.phone ? savedAddress.phone : '+ Your phone number'}
                            </Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* Payment Method */}
                <Text style={styles.sectionTitle}>Payment method</Text>
                <TouchableOpacity
                    style={styles.inputBox}
                    onPress={() => navigation.navigate('BuyerSellerPaymentMethodScreen', {
                        config,
                        totalAmount: totalToPay,
                        onSelect: (method) => setPaymentMethod(method)
                    })}
                >
                    <Text style={[styles.inputText, paymentMethod ? styles.inputTextFilled : null]}>
                        {paymentMethod ? paymentMethod.label : '+ Choose your payment method'}
                    </Text>
                </TouchableOpacity>

                {/* Price Summary */}
                <Text style={styles.sectionTitle}>Your price summary</Text>
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Item price</Text>
                        <Text style={styles.summaryValue}>£{basePrice.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Buyer's Fee</Text>
                        <Text style={styles.summaryValue}>£{buyerFee.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.summaryBorderRow]}>
                        <Text style={styles.summaryLabel}>Item value {itemValueFeePercent}%</Text>
                        <Text style={styles.summaryValue}>£{itemValueFee.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRowTotal}>
                        <Text style={styles.summaryTotalLabel}>Total to pay</Text>
                        <Text style={styles.summaryTotalValue}>£{totalToPay.toFixed(2)}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.feeLink}>
                    <Text style={styles.feeLinkText}>Read our Buyer's fee & item value {itemValueFeePercent}%</Text>
                </TouchableOpacity>

                {/* Pay Button */}
                <TouchableOpacity
                    style={[styles.payButton, loading && styles.disabledButton]}
                    onPress={handlePay}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.payButtonText}>Pay</Text>
                    )}
                </TouchableOpacity>
                <View style={styles.secureContainer}>
                    <Ionicons name="lock-closed-outline" size={12} color="#666" style={{ marginRight: 4 }} />
                    <Text style={styles.secureText}>Your payment details are secure encrypted</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centerAll: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 4,
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    content: {
        padding: 24,
        paddingTop: 16,
    },
    productBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    productDetails: {
        marginLeft: 16,
        justifyContent: 'center',
    },
    productTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
        marginTop: 8,
    },
    deliveryContainer: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    optionRowFirst: {
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    optionRowLast: {
        borderBottomWidth: 0,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },
    optionRowSelected: {
        // can add light tint if needed
    },
    optionIconContainer: {
        marginRight: 12,
        width: 24,
        alignItems: 'center',
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
    },
    optionSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ccc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#333',
    },
    disclaimerLink: {
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 24,
    },
    disclaimerText: {
        fontSize: 10,
        color: COLORS.primary,
        textDecorationLine: 'underline',
    },
    inputBox: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 12,
        marginBottom: 24,
        backgroundColor: '#fff',
    },
    inputText: {
        fontSize: 14,
        color: '#999',
    },
    inputTextFilled: {
        color: '#000',
    },
    summaryContainer: {
        marginTop: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryBorderRow: {
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingBottom: 8,
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#000',
    },
    summaryValue: {
        fontSize: 14,
        color: '#000',
    },
    summaryRowTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryTotalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    summaryTotalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    feeLink: {
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 32,
    },
    feeLinkText: {
        fontSize: 10,
        color: COLORS.primary,
        textDecorationLine: 'underline',
    },
    payButton: {
        backgroundColor: '#001A5C', // Dark exact blue from design
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 8,
    },
    payButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.7,
    },
    secureContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    secureText: {
        fontSize: 10,
        color: '#666',
    },
});

export default Step3DeliverySelectionScreen;
