import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    RefreshControl,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../context/NotificationContext';

const NotificationCenterScreen = ({ navigation }) => {
    const {
        notifications,
        loading,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification
    } = useNotifications();

    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        await fetchNotifications();
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
            navigation.navigate(actionData.screen);
        } else if (actionType === 'open_url' && actionData.url) {
            // Open URL in browser
            console.log('Open URL:', actionData.url);
        }
    };

    const handleDelete = (notificationId) => {
        Alert.alert(
            'Delete Notification',
            'Are you sure you want to delete this notification?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteNotification(notificationId)
                }
            ]
        );
    };

    const handleMarkAllRead = () => {
        if (unreadCount === 0) return;

        Alert.alert(
            'Mark All as Read',
            `Mark all ${unreadCount} notifications as read?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Mark All',
                    onPress: () => markAllAsRead()
                }
            ]
        );
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'push':
                return 'notifications';
            case 'popup':
                return 'alert-circle';
            case 'fullscreen':
                return 'expand';
            default:
                return 'notifications';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return '#EF4444';
            case 'medium':
                return '#F59E0B';
            case 'low':
                return '#10B981';
            default:
                return '#6B7280';
        }
    };

    const renderNotification = ({ item }) => (
        <TouchableOpacity
            style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
            onPress={() => handleNotificationPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.notificationHeader}>
                <View style={styles.iconContainer}>
                    <Ionicons
                        name={getTypeIcon(item.type)}
                        size={24}
                        color={getPriorityColor(item.priority)}
                    />
                </View>
                <View style={styles.notificationContent}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.title, !item.is_read && styles.unreadTitle]}>
                            {item.title}
                        </Text>
                        {!item.is_read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.message} numberOfLines={2}>
                        {item.message}
                    </Text>
                    <Text style={styles.timestamp}>
                        {formatTimestamp(item.delivered_at)}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item.user_notification_id)}
                >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>

            {item.image_url && (
                <Image
                    source={{ uri: item.image_url }}
                    style={styles.notificationImage}
                    resizeMode="cover"
                />
            )}
        </TouchableOpacity>
    );

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

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                {unreadCount > 0 && (
                    <TouchableOpacity
                        style={styles.markAllButton}
                        onPress={handleMarkAllRead}
                    >
                        <Text style={styles.markAllText}>Mark all read</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Unread Count Badge */}
            {unreadCount > 0 && (
                <View style={styles.unreadBanner}>
                    <Text style={styles.unreadBannerText}>
                        {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                    </Text>
                </View>
            )}

            {/* Notifications List */}
            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={(item) => item.user_notification_id.toString()}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={64} color="#D1D5DB" />
                        <Text style={styles.emptyText}>No notifications yet</Text>
                        <Text style={styles.emptySubtext}>
                            You'll see notifications here when you receive them
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingTop: 50
    },
    backButton: {
        padding: 8
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        flex: 1,
        textAlign: 'center',
        marginRight: 40
    },
    markAllButton: {
        padding: 8
    },
    markAllText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '500'
    },
    unreadBanner: {
        backgroundColor: '#EFF6FF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#DBEAFE'
    },
    unreadBannerText: {
        fontSize: 14,
        color: '#1E40AF',
        fontWeight: '500'
    },
    listContainer: {
        padding: 16,
        paddingBottom: 32
    },
    notificationCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1
    },
    unreadCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6'
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
    },
    notificationContent: {
        flex: 1
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
        flex: 1
    },
    unreadTitle: {
        fontWeight: '600',
        color: '#111827'
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3B82F6',
        marginLeft: 8
    },
    message: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
        lineHeight: 20
    },
    timestamp: {
        fontSize: 12,
        color: '#9CA3AF'
    },
    deleteButton: {
        padding: 8,
        marginLeft: 8
    },
    notificationImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginTop: 12
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 32
    }
});

export default NotificationCenterScreen;
