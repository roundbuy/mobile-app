import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    RefreshControl,
    Alert,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../../context/NotificationContext';
import { useTranslation } from '../../context/TranslationContext';
import { COLORS } from '../../constants/theme';
import CampaignNotificationCard from '../../components/CampaignNotificationCard';
import CampaignNotificationExpanded from '../../components/CampaignNotificationExpanded';
import CampaignNotificationModal from '../../components/CampaignNotificationModal';

const NotificationCenterScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const {
        notifications,
        campaignNotifications,
        loading,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification
    } = useNotifications();

    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');
    const [expandedCampaignId, setExpandedCampaignId] = useState(null);
    const [modalNotification, setModalNotification] = useState(null);

    const filters = ['All', 'Unread', 'Read', 'Chat'];

    useEffect(() => {
        loadNotifications();
    }, []);

    useEffect(() => {
        console.log('📢 Campaign notifications in state:', campaignNotifications?.length || 0);
        console.log('📢 Campaign notifications array:', campaignNotifications);
        if (campaignNotifications && campaignNotifications.length > 0) {
            console.log('📢 First campaign notification in state:', campaignNotifications[0]);
            console.log('📢 Has type_key?', !!campaignNotifications[0].type_key);
        }
    }, [campaignNotifications]);

    const loadNotifications = async () => {
        console.log('🔄 Loading notifications...');
        await fetchNotifications();
        console.log('✅ Notifications loaded');
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadNotifications();
        setRefreshing(false);
    };

    const handleNotificationPress = async (notification) => {
        // Mark as read
        if (!notification.is_read) {
            await markAsRead(notification.user_notification_id);
        }

        // Handle action if present
        if (notification.action_type && notification.action_data) {
            handleAction(notification.action_type, notification.action_data);
        }
    };

    const handleAction = (actionType, actionData) => {
        if (actionType === 'open_screen' && actionData.screen) {
            navigation.navigate(actionData.screen, actionData.params || {});
        } else if (actionType === 'open_url' && actionData.url) {
            // Open URL in browser
            console.log('Open URL:', actionData.url);
        }
    };

    const handleDelete = (notificationId) => {
        Alert.alert(
            t('Delete Notification'),
            t('Are you sure you want to delete this notification?'),
            [
                { text: t('Cancel'), style: t('cancel') },
                {
                    text: t('Delete'),
                    style: t('destructive'),
                    onPress: () => deleteNotification(notificationId)
                }
            ]
        );
    };

    const handleMarkAllRead = () => {
        if (unreadCount === 0) return;

        Alert.alert(
            t('Mark All as Read'),
            `Mark all ${unreadCount} notifications as read?`,
            [
                { text: t('Cancel'), style: t('cancel') },
                {
                    text: t('Mark All'),
                    onPress: () => markAllAsRead()
                }
            ]
        );
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const getFilteredNotifications = () => {
        if (activeFilter === 'Unread') {
            return notifications.filter(n => !n.is_read);
        } else if (activeFilter === 'Read') {
            return notifications.filter(n => n.is_read);
        } else if (activeFilter === 'Chat') {
            return notifications.filter(n =>
                ['new_message', 'offer_received', 'offer_accepted', 'offer_rejected', 'offer_counter'].includes(n.type)
            );
        }
        return notifications;
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
    };

    const renderNotificationItem = ({ item }) => {
        // Check if it's a campaign notification
        if (item.type_key) {
            const isExpanded = expandedCampaignId === item.user_notification_id;

            if (isExpanded) {
                return (
                    <CampaignNotificationExpanded
                        notification={item}
                        onCollapse={() => setExpandedCampaignId(null)}
                        onOpenModal={() => setModalNotification(item)}
                        navigation={navigation}
                    />
                );
            } else {
                return (
                    <CampaignNotificationCard
                        notification={item}
                        onPress={() => setExpandedCampaignId(item.user_notification_id)}
                        onDismiss={() => console.log('Dismiss:', item.user_notification_id)}
                    />
                );
            }
        }

        // Regular notification
        return (
            <TouchableOpacity
                style={styles.notificationItem}
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.7}
            >
                {!item.is_read && <View style={styles.notificationDot} />}
                <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                        <Text style={[styles.notificationTitle, !item.is_read && styles.unreadTitle]}>
                            {item.title}
                        </Text>
                        <Text style={styles.notificationTime}>
                            {formatTimestamp(item.delivered_at)}
                        </Text>
                    </View>
                    <Text style={styles.notificationMessage} numberOfLines={2}>
                        {item.message}
                    </Text>
                    {item.image_url && (
                        <Image
                            source={{ uri: item.image_url }}
                            style={styles.notificationImage}
                            resizeMode="cover"
                        />
                    )}
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
                {unreadCount > 0 && (
                    <TouchableOpacity
                        style={styles.markAllButton}
                        onPress={handleMarkAllRead}
                    >
                        <Text style={styles.markAllText}>{t('Mark all read')}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeFilter !== 'Chat' && styles.activeTab]}
                    onPress={() => setActiveFilter('All')}
                >
                    <Text style={[styles.tabText, activeFilter !== 'Chat' && styles.activeTabText]}>{t('Notifications')}</Text>
                    {activeFilter !== 'Chat' && <View style={styles.activeTabIndicator} />}
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeFilter === 'Chat' && styles.activeTab]}
                    onPress={() => setActiveFilter('Chat')}
                >
                    <Text style={[styles.tabText, activeFilter === 'Chat' && styles.activeTabText]}>{t('Chat')}</Text>
                    {activeFilter === 'Chat' && <View style={styles.activeTabIndicator} />}
                </TouchableOpacity>
            </View>

            {/* Sub-filters (only show when on Notifications tab) */}
            {activeFilter !== 'Chat' && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filtersContainer}
                    contentContainerStyle={styles.filtersContent}
                >
                    {['All', 'Buyer', 'Seller', 'Promo', 'Reco'].map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterChip,
                                activeFilter === filter && styles.filterChipActive,
                            ]}
                            onPress={() => setActiveFilter(filter)}
                        >
                            <Text
                                style={[
                                    styles.filterChipText,
                                    activeFilter === filter && styles.filterChipTextActive,
                                ]}
                            >
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}


            {/* Notifications List */}
            {(() => {
                const combinedData = [...(campaignNotifications || []), ...getFilteredNotifications()];
                console.log('📋 Rendering FlatList with', combinedData.length, 'items');
                console.log('📋 Campaign:', campaignNotifications?.length || 0, 'Regular:', getFilteredNotifications().length);
                return null;
            })()}
            <FlatList
                data={[...(campaignNotifications || []), ...getFilteredNotifications()]}
                renderItem={renderNotificationItem}
                keyExtractor={(item) => `${item.type_key ? 'campaign-' : 'regular-'}${item.user_notification_id || item.id}`}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={64} color="#D1D5DB" />
                        <Text style={styles.emptyText}>{t('No notifications yet')}</Text>
                        <Text style={styles.emptySubtext}>{t("You'll see notifications here when you receive them")}</Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
            />

            {/* Campaign Notification Modal */}
            <CampaignNotificationModal
                visible={!!modalNotification}
                notification={modalNotification}
                onClose={() => setModalNotification(null)}
                navigation={navigation}
            />
        </SafeAreaView >
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
    markAllButton: {
        padding: 8,
    },
    markAllText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '500',
    },
    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingHorizontal: 20,
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        position: 'relative',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#999',
    },
    activeTabText: {
        color: '#000',
        fontWeight: '700',
    },
    activeTabIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: COLORS.primary,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
    },
    unreadBadge: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 8,
    },
    unreadBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    filtersContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    filtersContent: {
        padding: 16,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    filterChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterChipText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    filterChipTextActive: {
        color: '#fff',
    },
    listContent: {
        paddingHorizontal: 16,
    },
    notificationItem: {
        flexDirection: 'row',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    notificationDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.primary,
        marginTop: 4,
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    notificationTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
        flex: 1,
    },
    unreadTitle: {
        fontWeight: '700',
    },
    notificationTime: {
        fontSize: 12,
        color: '#999',
        marginLeft: 8,
    },
    notificationMessage: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 8,
    },
    notificationImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginTop: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 32,
    },
});

export default NotificationCenterScreen;
