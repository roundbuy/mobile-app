import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { StripeProvider, CardForm, useConfirmPayment } from '@stripe/stripe-react-native';
import api from '../../services/api';

const PaymentMethodContent = ({ navigation, route, config, totalAmount, onSelect }) => {
    const [selectedMethod, setSelectedMethod] = useState(null);
    const { confirmPayment } = useConfirmPayment();
    const [cardDetails, setCardDetails] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const walletBalance = config?.walletBalance || 0;

    const handleSelectWallet = () => {
        setSelectedMethod('wallet');
        if (onSelect) {
            onSelect({ type: 'wallet', label: 'Pay with Wallet' });
        }
        navigation.goBack();
    };

    const handleSelectCard = () => {
        // Just select it, opening the inline form underneath
        setSelectedMethod('card');
    };

    const handleContinueCardPayment = async () => {
        if (!cardDetails?.complete) {
            Alert.alert('Incomplete Details', 'Please fill out all card information.');
            return;
        }

        try {
            setIsProcessing(true);

            // 1. Create Payment Intent
            const response = await api.post('/checkout/create-payment-intent', {
                amount: totalAmount,
                currency: 'GBP'
            });

            if (response.data.success) {
                const clientSecret = response.data.data.clientSecret;

                // 2. Confirm the payment via the inline CardForm
                const { error, paymentIntent } = await confirmPayment(clientSecret, {
                    paymentMethodType: 'Card',
                });

                if (error) {
                    setIsProcessing(false);
                    Alert.alert('Payment Failed', error.message);
                    return;
                }

                // Call onSelect knowing the card is captured securely
                if (onSelect) {
                    onSelect({
                        type: 'card',
                        label: 'Credit & Debit card',
                        clientSecret: clientSecret
                    });
                }
                navigation.goBack();
            } else {
                setIsProcessing(false);
                Alert.alert('Error', 'Could not initialize Stripe payment.');
            }
        } catch (error) {
            console.error('Stripe error:', error);
            setIsProcessing(false);
            Alert.alert('Error', 'Stripe transaction failed. Please check network.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Ionicons name="close" size={28} color="#000" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Payment method</Text>

                <TouchableOpacity
                    style={[styles.methodCard, selectedMethod === 'wallet' && styles.methodCardSelected]}
                    onPress={handleSelectWallet}
                    activeOpacity={0.7}
                >
                    <View style={styles.methodIconBox}>
                        <Ionicons name="wallet-outline" size={24} color="#666" />
                    </View>
                    <View style={styles.methodTextContainer}>
                        <Text style={styles.methodTitle}>Pay with Wallet</Text>
                        <Text style={styles.methodSubtitle}>Balance: £{walletBalance.toFixed(2)}</Text>
                    </View>
                    <View style={styles.radioOuter}>
                        {selectedMethod === 'wallet' && <View style={styles.radioInner} />}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.methodCard,
                        selectedMethod === 'card' && styles.methodCardSelected,
                        selectedMethod === 'card' && styles.methodCardExpanded
                    ]}
                    onPress={handleSelectCard}
                    activeOpacity={0.7}
                >
                    <View style={styles.methodIconBox}>
                        <Ionicons name="card-outline" size={24} color="#666" />
                    </View>
                    <View style={styles.methodTextContainer}>
                        <Text style={styles.methodTitle}>Credit & Debit card</Text>
                        <Text style={styles.methodSubtitle}>Pay securely with Stripe</Text>
                    </View>
                    <View style={styles.radioOuter}>
                        {selectedMethod === 'card' && <View style={styles.radioInner} />}
                    </View>
                </TouchableOpacity>

                {/* Inline Card Form renders directly below if selected */}
                {selectedMethod === 'card' && (
                    <View style={styles.cardFormContainer}>
                        <Text style={styles.cardFormLabel}>Card information</Text>
                        <CardForm
                            style={styles.cardForm}
                            onFormComplete={(details) => {
                                setCardDetails(details);
                            }}
                        />
                        <TouchableOpacity
                            style={[
                                styles.continueButton,
                                (!cardDetails?.complete || isProcessing) && styles.continueButtonDisabled
                            ]}
                            onPress={handleContinueCardPayment}
                            disabled={!cardDetails?.complete || isProcessing}
                        >
                            <Text style={styles.continueButtonText}>
                                {isProcessing ? 'Processing...' : 'Continue'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    I agree with <Text style={styles.linkText}>Subscriptions & Billings Policy</Text> and <Text style={styles.linkText}>Refund Policy</Text>
                </Text>
            </View>
        </SafeAreaView>
    );
};

const PaymentMethodScreen = ({ navigation, route }) => {
    const { config, totalAmount, onSelect } = route?.params || {};

    let publishKey = config?.stripePublishableKey || '';

    // If no key is set yet, we just render without stripe logic
    // but the provider requires a key if used, so we handle missing config gracefully.
    return (
        <StripeProvider publishableKey={publishKey || 'pk_test_dummy_fallback'}>
            <PaymentMethodContent
                navigation={navigation}
                route={route}
                config={config}
                totalAmount={totalAmount}
                onSelect={onSelect}
            />
        </StripeProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        padding: 16,
        paddingTop: 24,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 24,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 4,
        marginBottom: 16,
    },
    methodCardSelected: {
        // highlight style if wanted
        borderColor: '#000',
    },
    methodCardExpanded: {
        marginBottom: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottomWidth: 0,
    },
    methodIconBox: {
        marginRight: 16,
    },
    methodTextContainer: {
        flex: 1,
    },
    methodTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
        marginBottom: 4,
    },
    methodSubtitle: {
        fontSize: 14,
        color: '#666',
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
    footer: {
        position: 'absolute',
        bottom: 50,
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    footerText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#000',
        lineHeight: 20,
    },
    linkText: {
        color: COLORS.primary,
        textDecorationLine: 'underline',
    },
    cardFormContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#000',
        borderTopWidth: 0,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
        marginBottom: 16,
    },
    cardFormLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    cardForm: {
        height: 200,
        width: '100%',
    },
    continueButton: {
        backgroundColor: '#001C64', // '#001C64' Blue
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    continueButtonDisabled: {
        // opacity: 0.5,
        backgroundColor: COLORS.grayLighter,
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default PaymentMethodScreen;
