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

const PickUpStatusScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('all');
    const [pickups, setPickups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchPickups();
    }, [activeTab]);

    const fetchPickups = async (showRefreshIndicator = false) => {
        try {
            if (showRefreshIndicator) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            const filters = {
                type: 'all',
                limit: 50
            };

            // Filter by status based on active tab
            if (activeTab !== 'all') {
                filters.status = activeTab;
            }

            const response = await pickupService.getUserPickups(filters);

            if (response.success) {
                setPickups(response.pickups || []);
            } else {
                setPickups([]);
            }
        } catch (error) {
            console.error('Error fetching pickups:', error);
            Alert.alert(t('Error'), t('Failed to load pickups. Please try again.'));
            setPickups([]);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchPickups(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return '#FF9800';
            case 'confirmed':
                return '#2196F3';
            case 'rescheduled':
                return '#9C27B0';
            case 'completed':
                return '#4CAF50';
            case 'cancelled':
                return '#F44336';
            default:
                return '#999';
        }
    };

    const getStatusLabel = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
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

    const renderPickupItem = ({ item }) => {
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

        const statusColor = getStatusColor(item.status);
        const isBuyer = item.user_role === 'buyer';

        return (
            <TouchableOpacity
                style={styles.pickupCard}
                onPress={() => navigation.navigate('ScheduledPickUpDetail', { pickupId: item.id })}
                activeOpacity={0.7}
            >
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
                            £{parseFloat(item.advertisement_price || 0).toFixed(2)}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                            <Text style={[styles.statusText, { color: statusColor }]}>
                                {getStatusLabel(item.status)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Pickup Details */}
                <View style={styles.detailsSection}>
                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={16} color="#666" />
                        <Text style={styles.detailText}>
                            {formatDate(item.scheduled_date)}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="time-outline" size={16} color="#666" />
                        <Text style={styles.detailText}>
                            {formatTime(item.scheduled_time)}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name={isBuyer ? 'person-outline' : 'people-outline'} size={16} color="#666" />
                        <Text style={styles.detailText}>
                            {isBuyer ? `Seller: ${item.seller_name}` : `Buyer: ${item.buyer_name}`}
                        </Text>
                    </View>
                </View>

                {/* Payment Status */}
                {item.payment_status === 'unpaid' && (
                    <View style={styles.paymentWarning}>
                        <Ionicons name="warning-outline" size={16} color="#FF9800" />
                        <Text style={styles.paymentWarningText}>
                            Payment pending: £{parseFloat(item.total_fee || 0).toFixed(2)}
                        </Text>
                    </View>
                )}

                {/* Chevron */}
                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#999"
                    style={styles.chevron}
                />
            </TouchableOpacity>
        );
    };

    const tabs = [
        { key: 'all', label: 'All' },
        { key: 'pending', label: 'Pending' },
        { key: 'confirmed', label: 'Confirmed' },
        { key: 'completed', label: 'Completed' },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <GlobalHeader
                title={t('Status of Pick Ups')}
                navigation={navigation}
                showBackButton={true}
                showIcons={true}
            />

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.activeTab]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>{t('Loading pickups...')}</Text>
                </View>
            ) : (
                <FlatList
                    data={pickups}
                    renderItem={renderPickupItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="calendar-outline" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>
                                No {activeTab !== 'all' ? activeTab : ''} pickups found
                            </Text>
                            <Text style={styles.emptySubtext}>{t('Your scheduled pickups will appear here')}</Text>
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
        backgroundColor: '#fff',
    },
    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: COLORS.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    activeTabText: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    listContent: {
        padding: 16,
    },
    pickupCard: {
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
        marginBottom: 12,
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
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.primary,
        marginBottom: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    detailsSection: {
        gap: 8,
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#666',
    },
    paymentWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        backgroundColor: '#FFF3E0',
        borderRadius: 8,
        marginTop: 8,
    },
    paymentWarningText: {
        fontSize: 13,
        color: '#E65100',
        fontWeight: '500',
    },
    chevron: {
        position: 'absolute',
        right: 16,
        top: '50%',
        marginTop: -10,
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
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
});

export default PickUpStatusScreen;
