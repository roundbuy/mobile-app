import React, { useState } from 'react';
import { useTranslation } from '../../context/TranslationContext';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import GlobalHeader from '../../components/GlobalHeader';
import walletService from '../../services/walletService';
import { useWallet } from '../../contexts/WalletContext';

const WalletTopupScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const { refreshWallet } = useWallet();
    const [amount, setAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('card');
    const [loading, setLoading] = useState(false);

    const quickAmounts = [10, 20, 50, 100, 200];

    const paymentMethods = [
        { id: 'card', name: 'Credit/Debit Card', icon: 'card' },
        { id: 'paypal', name: 'PayPal', icon: 'logo-paypal' },
        { id: 'bank', name: 'Bank Transfer', icon: 'business' },
    ];

    const handleQuickAmount = (value) => {
        setAmount(value.toString());
    };

    const handleTopup = async () => {
        const topupAmount = parseFloat(amount);

        // Validation
        if (!amount || isNaN(topupAmount) || topupAmount <= 0) {
            Alert.alert(t('Invalid Amount'), t('Please enter a valid amount'));
            return;
        }

        if (topupAmount < 5) {
            Alert.alert(t('Minimum Amount'), t('Minimum top-up amount is £5'));
            return;
        }

        if (topupAmount > 1000) {
            Alert.alert(t('Maximum Amount'), t('Maximum top-up amount is £1000'));
            return;
        }

        try {
            setLoading(true);

            // Step 1: Initiate top-up
            const initiateResponse = await walletService.initiateTopup(topupAmount, selectedMethod);

            if (!initiateResponse.success) {
                throw new Error(initiateResponse.message || 'Failed to initiate top-up');
            }

            const topupRequestId = initiateResponse.data.topup_request_id;

            // Step 2: Simulate payment success (in production, this would be payment gateway)
            // Wait a bit to simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Step 3: Complete top-up
            const completeResponse = await walletService.completeTopup(topupRequestId);

            if (completeResponse.success) {
                // Refresh wallet balance
                await refreshWallet();

                Alert.alert(
                    t('Success!'),
                    `£${topupAmount.toFixed(2)} has been added to your wallet`,
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.goBack()
                        }
                    ]
                );
            } else {
                throw new Error(completeResponse.message || 'Failed to complete top-up');
            }
        } catch (error) {
            console.error('Top-up error:', error);
            Alert.alert(t('Error'), error.message || t('Failed to top up wallet. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <GlobalHeader
                title={t('Top Up Wallet')}
                navigation={navigation}
                showBackButton={true}
                showIcons={false}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Amount Input */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('Enter Amount')}</Text>
                    <View style={styles.amountInputContainer}>
                        <Text style={styles.currencySymbol}>£</Text>
                        <TextInput
                            style={styles.amountInput}
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0.00"
                            keyboardType="decimal-pad"
                            placeholderTextColor="#ccc"
                        />
                    </View>
                    <Text style={styles.helperText}>{t('Minimum: £5 • Maximum: £1000')}</Text>
                </View>

                {/* Quick Amount Buttons */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('Quick Amounts')}</Text>
                    <View style={styles.quickAmountsContainer}>
                        {quickAmounts.map((value) => (
                            <TouchableOpacity
                                key={value}
                                style={[
                                    styles.quickAmountButton,
                                    amount === value.toString() && styles.quickAmountButtonActive
                                ]}
                                onPress={() => handleQuickAmount(value)}
                            >
                                <Text style={[
                                    styles.quickAmountText,
                                    amount === value.toString() && styles.quickAmountTextActive
                                ]}>
                                    £{value}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Payment Method */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('Payment Method')}</Text>
                    {paymentMethods.map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            style={[
                                styles.paymentMethod,
                                selectedMethod === method.id && styles.paymentMethodActive
                            ]}
                            onPress={() => setSelectedMethod(method.id)}
                        >
                            <View style={styles.paymentMethodLeft}>
                                <View style={[
                                    styles.paymentMethodIcon,
                                    selectedMethod === method.id && styles.paymentMethodIconActive
                                ]}>
                                    <Ionicons
                                        name={method.icon}
                                        size={24}
                                        color={selectedMethod === method.id ? COLORS.primary : '#666'}
                                    />
                                </View>
                                <Text style={[
                                    styles.paymentMethodText,
                                    selectedMethod === method.id && styles.paymentMethodTextActive
                                ]}>
                                    {method.name}
                                </Text>
                            </View>
                            {selectedMethod === method.id && (
                                <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={20} color={COLORS.primary} />
                    <Text style={styles.infoText}>{t('Funds will be added to your wallet instantly after payment confirmation')}</Text>
                </View>

                {/* Top Up Button */}
                <TouchableOpacity
                    style={[styles.topupButton, loading && styles.topupButtonDisabled]}
                    onPress={handleTopup}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.topupButtonText}>
                            Top Up {amount && !isNaN(parseFloat(amount)) ? `£${parseFloat(amount).toFixed(2)}` : 'Wallet'}
                        </Text>
                    )}
                </TouchableOpacity>

                <View style={styles.bottomSpace} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 16,
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    currencySymbol: {
        fontSize: 32,
        fontWeight: '700',
        color: '#000',
        marginRight: 8,
    },
    amountInput: {
        flex: 1,
        fontSize: 32,
        fontWeight: '700',
        color: '#000',
    },
    helperText: {
        fontSize: 13,
        color: '#666',
        marginTop: 8,
    },
    quickAmountsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    quickAmountButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    quickAmountButtonActive: {
        backgroundColor: COLORS.primary + '20',
        borderColor: COLORS.primary,
    },
    quickAmountText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    quickAmountTextActive: {
        color: COLORS.primary,
    },
    paymentMethod: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        marginBottom: 12,
    },
    paymentMethodActive: {
        backgroundColor: COLORS.primary + '10',
        borderColor: COLORS.primary,
    },
    paymentMethodLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentMethodIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    paymentMethodIconActive: {
        backgroundColor: COLORS.primary + '20',
    },
    paymentMethodText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    paymentMethodTextActive: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        backgroundColor: COLORS.primary + '10',
        borderRadius: 12,
        marginBottom: 24,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        marginLeft: 12,
        lineHeight: 20,
    },
    topupButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    topupButtonDisabled: {
        opacity: 0.6,
    },
    topupButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    bottomSpace: {
        height: 40,
    },
});

export default WalletTopupScreen;
