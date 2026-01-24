import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useWallet } from '../contexts/WalletContext';

/**
 * WalletPaymentOption Component
 * 
 * A reusable component for displaying wallet balance and allowing wallet payments
 * Can be integrated into any payment screen
 * 
 * @param {boolean} selected - Whether wallet payment is selected
 * @param {function} onSelect - Callback when wallet option is selected
 * @param {number} amount - Amount to be paid (optional, for validation)
 * @param {boolean} showBalance - Whether to show wallet balance (default: true)
 * @param {string} style - Additional container styles
 */
const WalletPaymentOption = ({
    selected = false,
    onSelect,
    amount = null,
    showBalance = true,
    style = {},
    disabled = false
}) => {
    const { wallet, loading } = useWallet();

    const formatCurrency = (value) => {
        return `£${parseFloat(value || 0).toFixed(2)}`;
    };

    const hasInsufficientBalance = amount && wallet && parseFloat(wallet.balance) < parseFloat(amount);
    const isDisabled = disabled || loading || !wallet || hasInsufficientBalance;

    return (
        <TouchableOpacity
            style={[
                styles.container,
                selected && styles.containerSelected,
                isDisabled && styles.containerDisabled,
                style
            ]}
            onPress={() => !isDisabled && onSelect && onSelect()}
            disabled={isDisabled}
        >
            <View style={styles.leftContent}>
                <View style={[
                    styles.iconContainer,
                    selected && styles.iconContainerSelected
                ]}>
                    <Ionicons
                        name="wallet"
                        size={24}
                        color={selected ? COLORS.primary : '#666'}
                    />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[
                        styles.title,
                        selected && styles.titleSelected
                    ]}>
                        Pay with Wallet
                    </Text>
                    {showBalance && (
                        <View style={styles.balanceRow}>
                            {loading ? (
                                <ActivityIndicator size="small" color="#666" />
                            ) : wallet ? (
                                <>
                                    <Text style={styles.balanceLabel}>Balance: </Text>
                                    <Text style={[
                                        styles.balanceAmount,
                                        hasInsufficientBalance && styles.insufficientBalance
                                    ]}>
                                        {formatCurrency(wallet.balance)}
                                    </Text>
                                </>
                            ) : (
                                <Text style={styles.errorText}>Wallet unavailable</Text>
                            )}
                        </View>
                    )}
                    {hasInsufficientBalance && (
                        <Text style={styles.insufficientText}>
                            Insufficient balance. Please top up your wallet.
                        </Text>
                    )}
                </View>
            </View>
            <View style={styles.rightContent}>
                <View style={[
                    styles.radioOuter,
                    selected && styles.radioOuterSelected
                ]}>
                    {selected && <View style={styles.radioInner} />}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    containerSelected: {
        backgroundColor: COLORS.primary + '10',
        borderColor: COLORS.primary,
    },
    containerDisabled: {
        opacity: 0.5,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconContainerSelected: {
        backgroundColor: COLORS.primary + '20',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    titleSelected: {
        color: COLORS.primary,
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    balanceLabel: {
        fontSize: 14,
        color: '#666',
    },
    balanceAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4CAF50',
    },
    insufficientBalance: {
        color: '#F44336',
    },
    insufficientText: {
        fontSize: 12,
        color: '#F44336',
        marginTop: 4,
    },
    errorText: {
        fontSize: 14,
        color: '#F44336',
    },
    rightContent: {
        marginLeft: 12,
    },
    radioOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#D0D0D0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioOuterSelected: {
        borderColor: COLORS.primary,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.primary,
    },
});

export default WalletPaymentOption;
