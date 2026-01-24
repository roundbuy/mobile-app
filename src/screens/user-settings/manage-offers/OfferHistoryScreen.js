import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../context/TranslationContext';
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
import { COLORS } from '../../../constants/theme';
import { getFullImageUrl } from '../../../utils/imageUtils';
import { IMAGES } from '../../../assets/images';
import offersService from '../../../services/offersService';
import { useAuth } from '../../../context/AuthContext';

const OfferHistoryScreen = ({ route, navigation }) => {
    const { t } = useTranslation();
    const { advertisementId, advertisementTitle } = route.params;
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'new', 'accepted', 'declined'
    const [offers, setOffers] = useState([]);
    const [advertisementData, setAdvertisementData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSeller, setIsSeller] = useState(false);

    useEffect(() => {
        fetchOffers();
    }, [activeTab]);

    const fetchOffers = async (showRefreshIndicator = false) => {
        try {
            if (showRefreshIndicator) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            const response = await offersService.getAdvertisementOffers(advertisementId);
            console.log('=== OFFER HISTORY API RESPONSE ===');
            console.log('Success:', response.data.success);
            console.log('Offers count:', response.data.offers?.length);
            if (response.data.offers && response.data.offers.length > 0) {
                console.log('First offer data:', response.data.offers[0]);
                console.log('Advertisement images:', response.data.offers[0].advertisement_images);
            }

            if (response.data.success) {
                const allOffers = response.data.offers || [];
                setIsSeller(response.data.is_owner || false);

                // Store advertisement data from first offer
                if (allOffers.length > 0) {
                    const adData = {
                        title: allOffers[0].advertisement_title || advertisementTitle,
                        price: allOffers[0].advertisement_price,
                        images: allOffers[0].advertisement_images,
                        status: allOffers[0].advertisement_status,
                    };
                    console.log('Setting advertisement data:', adData);
                    setAdvertisementData(adData);
                }

                // Filter offers based on active tab
                let filteredOffers = allOffers;
                if (activeTab === 'new') {
                    filteredOffers = allOffers.filter(offer => offer.status === 'pending');
                } else if (activeTab === 'accepted') {
                    filteredOffers = allOffers.filter(offer => offer.status === 'accepted');
                } else if (activeTab === 'declined') {
                    filteredOffers = allOffers.filter(offer => offer.status === 'rejected');
                }

                setOffers(filteredOffers);
            } else {
                setOffers([]);
            }
        } catch (error) {
            console.error('Error fetching offer history:', error);
            Alert.alert(t('Error'), t('Failed to load offer history. Please try again.'));
            setOffers([]);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const handleRefresh = () => {
        fetchOffers(true);
    };

    const handleAcceptOffer = async (offerId) => {
        Alert.alert(
            t('Accept Offer'),
            t('Are you sure you want to accept this offer?'),
            [
                { text: t('Cancel'), style: t('cancel') },
                {
                    text: t('Accept'),
                    onPress: async () => {
                        try {
                            const response = await offersService.acceptOffer(offerId);
                            if (response.data.success) {
                                Alert.alert(t('Success'), t('Offer accepted successfully'));
                                fetchOffers();
                            }
                        } catch (error) {
                            console.error('Error accepting offer:', error);
                            Alert.alert(t('Error'), t('Failed to accept offer. Please try again.'));
                        }
                    },
                },
            ]
        );
    };

    const handleDeclineOffer = async (offerId) => {
        Alert.alert(
            t('Decline Offer'),
            t('Are you sure you want to decline this offer?'),
            [
                { text: t('Cancel'), style: t('cancel') },
                {
                    text: t('Decline'),
                    style: t('destructive'),
                    onPress: async () => {
                        try {
                            const response = await offersService.declineOffer(offerId);
                            if (response.data.success) {
                                Alert.alert(t('Success'), t('Offer declined successfully'));
                                fetchOffers();
                            }
                        } catch (error) {
                            console.error('Error declining offer:', error);
                            Alert.alert(t('Error'), t('Failed to decline offer. Please try again.'));
                        }
                    },
                },
            ]
        );
    };

    const handleMakeOffer = () => {
        // Navigate to make offer screen or show make offer modal
        Alert.alert(t('Make Offer'), t('Make offer functionality coming soon'));
    };

    const handleSchedulePickup = () => {
        // Navigate to schedule pickup screen
        navigation.navigate('SchedulePickUp', {
            offerId: offers[0]?.id,
            advertisementId: advertisementId,
            advertisementTitle: advertisementData?.title || advertisementTitle
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const renderOfferItem = ({ item }) => {
        const isPending = item.status === 'pending';
        const isAccepted = item.status === 'accepted';
        const isDeclined = item.status === 'rejected';

        return (
            <View style={styles.offerCard}>
                <View style={styles.offerRow}>
                    <Text style={styles.offerDate}>{formatDate(item.created_at)}</Text>
                    <View style={styles.offerDetails}>
                        {isSeller ? (
                            <Text style={styles.offerText}>
                                {item.buyer_name || 'Buyer'} offered {item.currency_code || '£'} {item.offered_price}
                            </Text>
                        ) : (
                            <Text style={styles.offerText}>
                                You {isAccepted ? 'Accepted' : isDeclined ? 'Declined' : 'Offered'} the offer {item.currency_code || '£'} {item.offered_price}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Show action buttons for seller on pending offers */}
                {isSeller && isPending && (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.declineButton}
                            onPress={() => handleDeclineOffer(item.id)}
                        >
                            <Text style={styles.declineButtonText}>{t('Decline')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={() => handleAcceptOffer(item.id)}
                        >
                            <Text style={styles.acceptButtonText}>{t('Accept')}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Show status for buyer */}
                {!isSeller && (
                    <View style={styles.statusContainer}>
                        {isPending && <Text style={styles.pendingStatus}>{t('Pending')}</Text>}
                        {isAccepted && <Text style={styles.acceptedStatus}>{t('Accepted')}</Text>}
                        {isDeclined && <Text style={styles.declinedStatus}>{t('Declined')}</Text>}
                    </View>
                )}
            </View>
        );
    };

    const renderHeader = () => {
        // Get product image from advertisement data
        let productImageSource = IMAGES.chair1;

        if (advertisementData && advertisementData.images) {
            try {
                const images = typeof advertisementData.images === 'string'
                    ? JSON.parse(advertisementData.images)
                    : advertisementData.images;
                if (images && images.length > 0) {
                    const imageUrl = getFullImageUrl(images[0]);
                    console.log('Product image URL:', imageUrl);
                    productImageSource = { uri: imageUrl };
                }
            } catch (e) {
                console.error('Error parsing images:', e);
            }
        }

        return (
            <View style={styles.productHeader}>
                <Image
                    source={productImageSource}
                    style={styles.productImage}
                    resizeMode="cover"
                    defaultSource={IMAGES.chair1}
                />
                <View style={styles.productInfo}>
                    <Text style={styles.productTitle}>
                        {advertisementData?.title || advertisementTitle}
                    </Text>
                    <View style={styles.activityBadge}>
                        <Text style={styles.activityBadgeText}>{t('SELL')}</Text>
                    </View>
                    <Text style={styles.distanceText}>{t('Distance: 1000 m / 25 min walk')}</Text>
                </View>
            </View>
        );
    };

    const renderFooter = () => {
        // Check if there's an accepted offer for buyer
        const hasAcceptedOffer = !isSeller && offers.some(offer => offer.status === 'accepted');
        const acceptedOffer = offers.find(offer => offer.status === 'accepted');

        return (
            <View style={styles.footer}>
                {isSeller ? (
                    <>
                        <Text style={styles.footerText}>{t('Click to close here')}</Text>
                        <TouchableOpacity
                            style={styles.footerButton}
                            onPress={handleSchedulePickup}
                        >
                            <Text style={styles.footerButtonText}>{t('Schedule a Pick Up')}</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        {hasAcceptedOffer && (
                            <TouchableOpacity
                                style={[styles.footerButton, styles.scheduleButton]}
                                onPress={() => {
                                    navigation.navigate('SchedulePickUp', {
                                        offerId: acceptedOffer.id,
                                        advertisementId: advertisementId,
                                        advertisementTitle: advertisementData?.title || advertisementTitle
                                    });
                                }}
                            >
                                <Text style={styles.footerButtonText}>{t('Schedule a Pick Up')}</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={styles.footerButton}
                            onPress={handleMakeOffer}
                        >
                            <Text style={styles.footerButtonText}>{t('Make an offer')}</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Product Offer History')}</Text>
                <View style={styles.headerRight} />
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                    onPress={() => setActiveTab('all')}
                >
                    <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>{t('All')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'new' && styles.activeTab]}
                    onPress={() => setActiveTab('new')}
                >
                    <Text style={[styles.tabText, activeTab === 'new' && styles.activeTabText]}>{t('New')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'accepted' && styles.activeTab]}
                    onPress={() => setActiveTab('accepted')}
                >
                    <Text style={[styles.tabText, activeTab === 'accepted' && styles.activeTabText]}>{t('Accepted')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'declined' && styles.activeTab]}
                    onPress={() => setActiveTab('declined')}
                >
                    <Text style={[styles.tabText, activeTab === 'declined' && styles.activeTabText]}>{t('Declined')}</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>{t('Loading offer history...')}</Text>
                </View>
            ) : (
                <FlatList
                    data={offers}
                    renderItem={renderOfferItem}
                    keyExtractor={(item) => item.id.toString()}
                    ListHeaderComponent={renderHeader}
                    ListFooterComponent={renderFooter}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-text-outline" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>
                                {isLoading ? 'Loading...' : `No ${activeTab} offers found`}
                            </Text>
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
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: '#000',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#999',
    },
    activeTabText: {
        color: '#000',
        fontWeight: '700',
    },
    listContent: {
        paddingBottom: 20,
    },
    productHeader: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
    },
    productInfo: {
        flex: 1,
        marginLeft: 12,
    },
    productTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    activityBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#4CAF50',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
        marginBottom: 6,
    },
    activityBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    distanceText: {
        fontSize: 12,
        color: '#666',
    },
    offerCard: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    offerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    offerDate: {
        fontSize: 12,
        color: '#666',
        width: 80,
    },
    offerDetails: {
        flex: 1,
    },
    offerText: {
        fontSize: 14,
        color: '#000',
        lineHeight: 20,
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 12,
    },
    declineButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#000',
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: 'center',
    },
    declineButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    acceptButton: {
        flex: 1,
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: 'center',
    },
    acceptButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    statusContainer: {
        marginTop: 8,
    },
    pendingStatus: {
        fontSize: 12,
        color: '#FF9800',
        fontWeight: '500',
    },
    acceptedStatus: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '500',
    },
    declinedStatus: {
        fontSize: 12,
        color: '#F44336',
        fontWeight: '500',
    },
    footer: {
        padding: 16,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 12,
    },
    footerButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 6,
        width: '100%',
        alignItems: 'center',
    },
    scheduleButton: {
        backgroundColor: '#4CAF50',
        marginBottom: 12,
    },
    footerButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
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
        fontSize: 16,
        color: '#999',
        marginTop: 16,
    },
});

export default OfferHistoryScreen;
