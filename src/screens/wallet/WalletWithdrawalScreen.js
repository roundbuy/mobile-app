import React, { useState, useEffect } from 'react';
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

const WalletWithdrawalScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [wallet, setWallet] = useState(null);
    const [amount, setAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('bank_transfer');
    const [bankDetails, setBankDetails] = useState({
        account_name: '',
        account_number: '',
        sort_code: '',
        bank_name: ''
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const withdrawalMethods = [
        { id: 'bank_transfer', name: 'Bank Transfer', icon: 'business', minAmount: 10 },
        { id: 'paypal', name: 'PayPal', icon: 'logo-paypal', minAmount: 5 },
    ];

    useEffect(() => {
        loadWallet();
    }, []);

    const loadWallet = async () => {
        try {
            const response = await walletService.getWallet();
            if (response.success) {
                setWallet(response.data.wallet);
            }
        } catch (error) {
            console.error('Error loading wallet:', error);
        } finally {
            setLoading(false);
        }
    };

    const getMinAmount = () => {
        const method = withdrawalMethods.find(m => m.id === selectedMethod);
        return method?.minAmount || 10;
    };

    const handleWithdrawal = async () => {
        const withdrawalAmount = parseFloat(amount);
        const minAmount = getMinAmount();

        // Validation
        if (!amount || isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
            Alert.alert(t('Invalid Amount'), t('Please enter a valid amount'));
            return;
        }

        if (withdrawalAmount < minAmount) {
            Alert.alert(t('Minimum Amount'), `Minimum withdrawal amount is £${minAmount}`);
            return;
        }

        if (withdrawalAmount > wallet.balance) {
            Alert.alert(
                t('Insufficient Balance'),
                `You only have £${wallet.balance.toFixed(2)} available`
            );
            return;
        }

        // Validate bank details for bank transfer
        if (selectedMethod === 'bank_transfer') {
            if (!bankDetails.account_name || !bankDetails.account_number || !bankDetails.sort_code) {
                Alert.alert(t('Missing Information'), t('Please fill in all bank details'));
                return;
            }
        }

        // Confirm withdrawal
        Alert.alert(
            t('Confirm Withdrawal'),
            `Withdraw £${withdrawalAmount.toFixed(2)} to your ${selectedMethod === 'bank_transfer' ? 'bank account' : 'PayPal'}?\n\nProcessing time: 1-3 business days`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Confirm', onPress: submitWithdrawal }
            ]
        );
    };

    const submitWithdrawal = async () => {
        try {
            setSubmitting(true);

            const withdrawalAmount = parseFloat(amount);
            const details = selectedMethod === 'bank_transfer' ? bankDetails : { paypal_email: bankDetails.account_name };

            const response = await walletService.requestWithdrawal(
                withdrawalAmount,
                selectedMethod,
                details
            );

            if (response.success) {
                Alert.alert(
                    t('Withdrawal Requested'),
                    `Your withdrawal request for £${withdrawalAmount.toFixed(2)} has been submitted.\n\n${response.data.note}`,
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.goBack()
                        }
                    ]
                );
            } else {
                throw new Error(response.message || 'Failed to request withdrawal');
            }
        } catch (error) {
            console.error('Withdrawal error:', error);
            Alert.alert(t('Error'), error.message || t('Failed to request withdrawal. Please try again.'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <GlobalHeader
                    title={t('Withdraw Funds')}
                    navigation={navigation}
                    showBackButton={true}
                    showIcons={false}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <GlobalHeader
                title={t('Withdraw Funds')}
                navigation={navigation}
                showBackButton={true}
                showIcons={false}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Available Balance */}
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>{t('Available Balance')}</Text>
                    <Text style={styles.balanceAmount}>
                        £{wallet?.balance?.toFixed(2) || '0.00'}
                    </Text>
                </View>

                {/* Amount Input */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('Withdrawal Amount')}</Text>
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
                    <Text style={styles.helperText}>
                        Minimum: £{getMinAmount()} • Available: £{wallet?.balance?.toFixed(2) || '0.00'}
                    </Text>
                </View>

                {/* Withdrawal Method */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('Withdrawal Method')}</Text>
                    {withdrawalMethods.map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            style={[
                                styles.methodCard,
                                selectedMethod === method.id && styles.methodCardActive
                            ]}
                            onPress={() => setSelectedMethod(method.id)}
                        >
                            <View style={styles.methodLeft}>
                                <View style={[
                                    styles.methodIcon,
                                    selectedMethod === method.id && styles.methodIconActive
                                ]}>
                                    <Ionicons
                                        name={method.icon}
                                        size={24}
                                        color={selectedMethod === method.id ? COLORS.primary : '#666'}
                                    />
                                </View>
                                <View>
                                    <Text style={[
                                        styles.methodName,
                                        selectedMethod === method.id && styles.methodNameActive
                                    ]}>
                                        {method.name}
                                    </Text>
                                    <Text style={styles.methodMin}>Min: £{method.minAmount}</Text>
                                </View>
                            </View>
                            {selectedMethod === method.id && (
                                <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Bank Details Form */}
                {selectedMethod === 'bank_transfer' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('Bank Account Details')}</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{t('Account Holder Name *')}</Text>
                            <TextInput
                                style={styles.textInput}
                                value={bankDetails.account_name}
                                onChangeText={(text) => setBankDetails({ ...bankDetails, account_name: text })}
                                placeholder={t('John Doe')}
                                placeholderTextColor="#ccc"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{t('Account Number *')}</Text>
                            <TextInput
                                style={styles.textInput}
                                value={bankDetails.account_number}
                                onChangeText={(text) => setBankDetails({ ...bankDetails, account_number: text })}
                                placeholder="12345678"
                                keyboardType="number-pad"
                                placeholderTextColor="#ccc"
                                maxLength={8}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{t('Sort Code *')}</Text>
                            <TextInput
                                style={styles.textInput}
                                value={bankDetails.sort_code}
                                onChangeText={(text) => setBankDetails({ ...bankDetails, sort_code: text })}
                                placeholder="12-34-56"
                                placeholderTextColor="#ccc"
                                maxLength={8}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{t('Bank Name (Optional)')}</Text>
                            <TextInput
                                style={styles.textInput}
                                value={bankDetails.bank_name}
                                onChangeText={(text) => setBankDetails({ ...bankDetails, bank_name: text })}
                                placeholder={t('Barclays')}
                                placeholderTextColor="#ccc"
                            />
                        </View>
                    </View>
                )}

                {selectedMethod === 'paypal' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('PayPal Details')}</Text>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{t('PayPal Email *')}</Text>
                            <TextInput
                                style={styles.textInput}
                                value={bankDetails.account_name}
                                onChangeText={(text) => setBankDetails({ ...bankDetails, account_name: text })}
                                placeholder={t('your@email.com')}
                                keyboardType="email-address"
                                placeholderTextColor="#ccc"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>
                )}

                {/* Info Box */}
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={20} color={COLORS.primary} />
                    <Text style={styles.infoText}>{t("Withdrawal requests are processed within 1-3 business days. You'll receive a notification once processed.")}</Text>
                </View>

                {/* Withdraw Button */}
                <TouchableOpacity
                    style={[styles.withdrawButton, submitting && styles.withdrawButtonDisabled]}
                    onPress={handleWithdrawal}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.withdrawButtonText}>{t('Request Withdrawal')}</Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    balanceCard: {
        padding: 20,
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        marginBottom: 24,
        alignItems: 'center',
    },
    balanceLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    balanceAmount: {
        fontSize: 32,
        fontWeight: '700',
        color: COLORS.primary,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 12,
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
    methodCard: {
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
    methodCardActive: {
        backgroundColor: COLORS.primary + '10',
        borderColor: COLORS.primary,
    },
    methodLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    methodIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    methodIconActive: {
        backgroundColor: COLORS.primary + '20',
    },
    methodName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    methodNameActive: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    methodMin: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#000',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        backgroundColor: '#FFF3E0',
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
    withdrawButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    withdrawButtonDisabled: {
        opacity: 0.6,
    },
    withdrawButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    bottomSpace: {
        height: 40,
    },
});

export default WalletWithdrawalScreen;
