import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/TranslationContext';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import GlobalHeader from '../../components/GlobalHeader';
import { useWallet } from '../../contexts/WalletContext';
import walletService from '../../services/walletService';

const WalletScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const { wallet, loading: walletLoading, refreshWallet } = useWallet();
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const response = await walletService.getWallet();

            if (response.success) {
                setRecentTransactions(response.data.recent_transactions || []);
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
            Alert.alert(t('Error'), t('Failed to load transactions. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([refreshWallet(), loadTransactions()]);
        setRefreshing(false);
    };

    const formatCurrency = (amount) => {
        const value = parseFloat(amount);
        if (isNaN(value) || amount === null || amount === undefined) {
            return '£0.00';
        }
        return `£${value.toFixed(2)}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTransactionIcon = (category) => {
        switch (category) {
            case 'topup':
                return { name: 'add-circle', color: '#4CAF50' };
            case 'payment':
                return { name: 'cart', color: '#FF9800' };
            case 'refund':
                return { name: 'refresh-circle', color: '#2196F3' };
            case 'withdrawal':
                return { name: 'arrow-down-circle', color: '#9C27B0' };
            case 'bonus':
                return { name: 'gift', color: '#E91E63' };
            default:
                return { name: 'swap-horizontal', color: '#757575' };
        }
    };

    const renderTransaction = (transaction) => {
        const icon = getTransactionIcon(transaction.category);
        const isCredit = transaction.transaction_type === 'credit';

        return (
            <TouchableOpacity
                key={transaction.id}
                style={styles.transactionItem}
                onPress={() => navigation.navigate('WalletTransactions')}
            >
                <View style={styles.transactionLeft}>
                    <View style={[styles.transactionIcon, { backgroundColor: icon.color + '20' }]}>
                        <Ionicons name={icon.name} size={24} color={icon.color} />
                    </View>
                    <View style={styles.transactionInfo}>
                        <Text style={styles.transactionDescription} numberOfLines={1}>
                            {transaction.description || transaction.category}
                        </Text>
                        <Text style={styles.transactionDate}>
                            {formatDate(transaction.created_at)}
                        </Text>
                    </View>
                </View>
                <View style={styles.transactionRight}>
                    <Text style={[
                        styles.transactionAmount,
                        { color: isCredit ? '#4CAF50' : '#F44336' }
                    ]}>
                        {isCredit ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </Text>
                    <Text style={styles.transactionBalance}>
                        Balance: {formatCurrency(transaction.balance_after)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading || walletLoading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <GlobalHeader
                    title={t('My Wallet')}
                    navigation={navigation}
                    showBackButton={true}
                    showIcons={true}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>{t('Loading wallet...')}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <GlobalHeader
                title={t('My Wallet')}
                navigation={navigation}
                showBackButton={true}
                showIcons={true}
            />

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Balance Card */}
                <View style={styles.balanceCard}>
                    <View style={styles.balanceHeader}>
                        <Ionicons name="wallet" size={32} color={COLORS.primary} />
                        <Text style={styles.balanceLabel}>{t('Available Balance')}</Text>
                    </View>
                    <Text style={styles.balanceAmount}>
                        {wallet ? formatCurrency(wallet.balance) : '£0.00'}
                    </Text>
                    <Text style={styles.balanceCurrency}>{wallet?.currency || 'GBP'}</Text>
                </View>

                {/* Quick Actions */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('WalletTopup')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#4CAF5020' }]}>
                            <Ionicons name="add-circle" size={28} color="#4CAF50" />
                        </View>
                        <Text style={styles.actionText}>{t('Top Up')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('WalletWithdrawal')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#FF980020' }]}>
                            <Ionicons name="arrow-down-circle" size={28} color="#FF9800" />
                        </View>
                        <Text style={styles.actionText}>{t('Withdraw')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('WalletTransactions')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#2196F320' }]}>
                            <Ionicons name="list" size={28} color="#2196F3" />
                        </View>
                        <Text style={styles.actionText}>{t('History')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent Transactions */}
                <View style={styles.transactionsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('Recent Transactions')}</Text>
                        {recentTransactions.length > 0 && (
                            <TouchableOpacity onPress={() => navigation.navigate('WalletTransactions')}>
                                <Text style={styles.seeAllText}>{t('See All')}</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {recentTransactions.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="receipt-outline" size={64} color="#ccc" />
                            <Text style={styles.emptyStateText}>{t('No transactions yet')}</Text>
                            <Text style={styles.emptyStateSubtext}>{t('Top up your wallet to get started')}</Text>
                        </View>
                    ) : (
                        <View style={styles.transactionsList}>
                            {recentTransactions.map(renderTransaction)}
                        </View>
                    )}
                </View>

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
    balanceCard: {
        margin: 20,
        padding: 24,
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    balanceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    balanceLabel: {
        fontSize: 16,
        color: '#fff',
        marginLeft: 12,
        opacity: 0.9,
    },
    balanceAmount: {
        fontSize: 42,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    balanceCurrency: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.8,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    actionButton: {
        alignItems: 'center',
    },
    actionIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    transactionsSection: {
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    seeAllText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '500',
    },
    transactionsList: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        overflow: 'hidden',
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    transactionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionDescription: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    transactionDate: {
        fontSize: 12,
        color: '#666',
    },
    transactionRight: {
        alignItems: 'flex-end',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    transactionBalance: {
        fontSize: 12,
        color: '#666',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginTop: 16,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
    },
    bottomSpace: {
        height: 40,
    },
});

export default WalletScreen;
