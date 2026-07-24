import React, { useState, useEffect } from 'react';
import { IMAGES } from '../../assets/images';
import { getFullImageUrl } from '../../utils/imageUtils';
import { useTranslation } from '../../context/TranslationContext';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    FlatList,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { advertisementService } from '../../services';

const UserListingsScreen = ({ route, navigation }) => {
    const { t } = useTranslation();
    const { sellerId, sellerName } = route.params;
    const [listingTypeToggle, setListingTypeToggle] = useState('items'); // 'items', 'services'
    const [ads, setAds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchUserListings();
    }, []);

    const fetchUserListings = async (showRefreshIndicator = false) => {
        try {
            if (showRefreshIndicator) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            // Fetch all published ads for this user
            const response = await advertisementService.browseAdvertisements({
                user_id: sellerId,
                status: 'published',
                limit: 50,
            });

            if (response.success && response.data) {
                const adsData = response.data.advertisements || [];
                setAds(adsData);
            } else {
                setAds([]);
            }
        } catch (error) {
            console.error('Error fetching user listings:', error);
            Alert.alert(t('Error'), t('Failed to load user listings. Please try again.'));
            setAds([]);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const handleAdPress = (ad) => {
        if (ad.activity_name?.toLowerCase() === 'services' || ad.activity_id === 4) {
            navigation.navigate('ServiceDetails', {
                advertisementId: ad.id
            });
        } else {
            navigation.navigate('ProductDetails', {
                advertisementId: ad.id,
                advertisement: ad
            });
        }
    };

    const handleRefresh = () => {
        fetchUserListings(true);
    };

    const getFilteredAds = () => {
        if (listingTypeToggle === 'services') {
            return ads.filter(ad => ad.activity_name?.toLowerCase() === 'services' || ad.activity_id === 4);
        } else {
            return ads.filter(ad => ad.activity_name?.toLowerCase() !== 'services' && ad.activity_id !== 4);
        }
    };

    const renderAdItem = ({ item }) => {
        let parsedImages = [];
        try {
            parsedImages = typeof item.images === 'string' ? JSON.parse(item.images) : (item.images || []);
        } catch (e) {
            console.warn('Failed to parse images in UserListingsScreen:', item.images);
        }

        const imageUri = parsedImages.length > 0 ? getFullImageUrl(parsedImages[0]) : null;
        const finalImageSource = imageUri ? { uri: imageUri } : IMAGES.chair1;

        const activityType = item.activity_name || 'SELL';
        const locationText = item.city ? `${item.city}, ${item.country || ''}`.trim() : 'Location not set';
        const daysRemaining = item.end_date ? Math.ceil((new Date(item.end_date) - new Date()) / (1000 * 60 * 60 * 24)) : 60;

        return (
            <TouchableOpacity
                style={styles.adCard}
                onPress={() => handleAdPress(item)}
                activeOpacity={0.7}
            >
                <Image source={finalImageSource} style={styles.adImage} />

                <View style={styles.adContent}>
                    <View style={styles.adHeader}>
                        <Text style={styles.adTitle} numberOfLines={2}>{item.title}</Text>
                        <View style={[
                            styles.typeBadge,
                            activityType === 'Sell' && styles.sellBadge,
                            activityType === 'Rent' && styles.rentBadge,
                            activityType === 'Buy' && styles.buyBadge,
                        ]}>
                            <Text style={styles.typeBadgeText}>{activityType.toUpperCase()}</Text>
                        </View>
                    </View>

                    <Text style={styles.priceText}>£{item.price}</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="heart" size={16} color="#505050" />
                            <Text style={styles.statText}>{item.likes_count || 0}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="eye" size={16} color="#505050" />
                            <Text style={styles.statText}>{item.views_count || 0}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="chatbubble" size={16} color="#505050" />
                            <Text style={styles.statText}>{item.messages_count || 0}</Text>
                        </View>
                    </View>

                    <View style={styles.statusRow}>
                        <Text style={styles.statusText}>{t('Active')}</Text>
                        <Text style={styles.daysText}>{daysRemaining > 0 ? `${daysRemaining} days remain` : 'Expired'}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{sellerName}'s Items & Services</Text>
                <View style={styles.headerRight} />
            </View>

            {/* Toggle between Items and Services */}
            <View style={styles.toggleOuterContainer}>
                <View style={styles.toggleInnerContainer}>
                    <TouchableOpacity
                        style={[styles.toggleButton, listingTypeToggle === 'items' && styles.toggleButtonActive]}
                        onPress={() => setListingTypeToggle('items')}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="basket-outline" size={16} color={listingTypeToggle === 'items' ? '#ffffff' : '#555555'} style={{ marginRight: 6 }} />
                        <Text style={[styles.toggleButtonText, listingTypeToggle === 'items' && styles.toggleButtonTextActive]}>
                            {t('Items')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleButton, listingTypeToggle === 'services' && styles.toggleButtonActive]}
                        onPress={() => setListingTypeToggle('services')}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="construct-outline" size={16} color={listingTypeToggle === 'services' ? '#ffffff' : '#555555'} style={{ marginRight: 6 }} />
                        <Text style={[styles.toggleButtonText, listingTypeToggle === 'services' && styles.toggleButtonTextActive]}>
                            {t('Services')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Ads List */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>{t('Loading listings...')}</Text>
                </View>
            ) : (
                <FlatList
                    data={getFilteredAds()}
                    renderItem={renderAdItem}
                    keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="megaphone-outline" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>
                                {isLoading ? 'Loading...' : 'No active listings found'}
                            </Text>
                            {!isLoading && (
                                <TouchableOpacity style={styles.retryButton} onPress={() => fetchUserListings()}>
                                    <Text style={styles.retryText}>{t('Retry')}</Text>
                                </TouchableOpacity>
                            )}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    headerRight: {
        width: 32,
    },
    listContent: {
        padding: 16,
    },
    adCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        overflow: 'hidden',
    },
    adImage: {
        width: 100,
        height: 120,
        backgroundColor: '#f5f5f5',
    },
    adContent: {
        flex: 1,
        padding: 12,
    },
    adHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    adTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        flex: 1,
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginLeft: 8,
    },
    sellBadge: {
        backgroundColor: '#4CAF50',
    },
    rentBadge: {
        backgroundColor: '#FF9800',
    },
    buyBadge: {
        backgroundColor: COLORS.primary,
    },
    typeBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    priceText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary,
        marginBottom: 4,
    },
    distanceText: {
        fontSize: 12,
        color: '#505050',
        marginBottom: 8,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    statText: {
        fontSize: 12,
        color: '#505050',
        marginLeft: 4,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4CAF50',
    },
    daysText: {
        fontSize: 12,
        color: '#505050',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#505050',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#303234',
        marginTop: 16,
    },
    retryButton: {
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
    },
    retryText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    toggleOuterContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    toggleInnerContainer: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderRadius: 24,
        padding: 3,
    },
    toggleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 21,
    },
    toggleButtonActive: {
        backgroundColor: COLORS.primary,
    },
    toggleButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555555',
    },
    toggleButtonTextActive: {
        color: '#ffffff',
        fontWeight: '700',
    },
});

export default UserListingsScreen;
