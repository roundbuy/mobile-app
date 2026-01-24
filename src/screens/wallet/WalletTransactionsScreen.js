import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/TranslationContext';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import GlobalHeader from '../../components/GlobalHeader';
import walletService from '../../services/walletService';

const WalletTransactionsScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filter, setFilter] = useState('all'); // all, credit, debit

    useEffect(() => {
        loadTransactions();
    }, [filter]);

    const loadTransactions = async (pageNum = 1, append = false) => {
        try {
            if (!append) {
                setLoading(true);
            }

            const params = {
                page: pageNum,
                limit: 20
            };

            if (filter !== 'all') {
                params.type = filter;
            }

            const response = await walletService.getTransactions(params);

            if (response.success) {
                const newTransactions = response.data.transactions;

                if (append) {
                    setTransactions(prev => [...prev, ...newTransactions]);
                } else {
                    setTransactions(newTransactions);
                }

                setHasMore(response.data.pagination.page < response.data.pagination.total_pages);
                setPage(pageNum);
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
            Alert.alert(t('Error'), t('Failed to load transactions'));
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadTransactions(1, false);
        setRefreshing(false);
    };

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            setLoadingMore(true);
            loadTransactions(page + 1, true);
        }
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
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return `Today, ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday, ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
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
            case 'commission':
                return { name: 'trending-down', color: '#FF5722' };
            case 'penalty':
                return { name: 'warning', color: '#F44336' };
            default:
                return { name: 'swap-horizontal', color: '#757575' };
        }
    };

    const getCategoryLabel = (category) => {
        const labels = {
            topup: 'Top-up',
            payment: 'Payment',
            refund: 'Refund',
            withdrawal: 'Withdrawal',
            bonus: 'Bonus',
            commission: 'Commission',
            penalty: 'Penalty'
        };
        return labels[category] || category;
    };

    const renderTransaction = ({ item }) => {
        const icon = getTransactionIcon(item.category);
        const isCredit = item.transaction_type === 'credit';

        return (
            <View style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                    <View style={[styles.transactionIcon, { backgroundColor: icon.color + '20' }]}>
                        <Ionicons name={icon.name} size={24} color={icon.color} />
                    </View>
                    <View style={styles.transactionInfo}>
                        <Text style={styles.transactionCategory}>
                            {getCategoryLabel(item.category)}
                        </Text>
                        <Text style={styles.transactionDescription} numberOfLines={1}>
                            {item.description}
                        </Text>
                        <Text style={styles.transactionDate}>
                            {formatDate(item.created_at)}
                        </Text>
                    </View>
                </View>
                <View style={styles.transactionRight}>
                    <Text style={[
                        styles.transactionAmount,
                        { color: isCredit ? '#4CAF50' : '#F44336' }
                    ]}>
                        {isCredit ? '+' : '-'}{formatCurrency(item.amount)}
                    </Text>
                    <Text style={styles.transactionBalance}>
                        Balance: {formatCurrency(item.balance_after)}
                    </Text>
                </View>
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>{t('No transactions found')}</Text>
            <Text style={styles.emptyStateSubtext}>
                {filter !== 'all'
                    ? 'Try changing the filter'
                    : 'Your transaction history will appear here'}
            </Text>
        </View>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <GlobalHeader
                title={t('Transaction History')}
                navigation={navigation}
                showBackButton={true}
                showIcons={false}
            />

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>{t('All')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'credit' && styles.filterTabActive]}
                    onPress={() => setFilter('credit')}
                >
                    <Text style={[styles.filterText, filter === 'credit' && styles.filterTextActive]}>{t('Money In')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'debit' && styles.filterTabActive]}
                    onPress={() => setFilter('debit')}
                >
                    <Text style={[styles.filterText, filter === 'debit' && styles.filterTextActive]}>{t('Money Out')}</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>{t('Loading transactions...')}</Text>
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    renderItem={renderTransaction}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={renderEmpty}
                    ListFooterComponent={renderFooter}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    filterTab: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginHorizontal: 4,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
    },
    filterTabActive: {
        backgroundColor: COLORS.primary,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    filterTextActive: {
        color: '#fff',
        fontWeight: '600',
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
    listContent: {
        flexGrow: 1,
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
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
    transactionCategory: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    transactionDescription: {
        fontSize: 15,
        fontWeight: '500',
        color: '#000',
        marginBottom: 4,
    },
    transactionDate: {
        fontSize: 12,
        color: '#999',
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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
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
        textAlign: 'center',
    },
    loadingMore: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});

export default WalletTransactionsScreen;
