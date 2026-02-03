import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

console.log('✅ CampaignNotificationCard component loaded');

/**
 * Campaign Notification Card - Collapsed View
 * Displays notification in a compact card format
 */
const CampaignNotificationCard = ({
    notification,
    onPress,
    onDismiss,
    style
}) => {
    console.log('🎴 Rendering CampaignNotificationCard:', notification?.collapsed_title);

    const {
        collapsed_icon,
        collapsed_icon_bg_color,
        collapsed_title,
        collapsed_message,
        collapsed_timestamp_text,
        is_read
    } = notification;

    const iconBgColor = collapsed_icon_bg_color || '#1E3A8A';

    return (
        <TouchableOpacity
            style={[
                styles.container,
                !is_read && styles.unreadContainer,
                style
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                {/* Icon */}
                <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                    {collapsed_icon && collapsed_icon.startsWith('http') ? (
                        <Image
                            source={{ uri: collapsed_icon }}
                            style={styles.iconImage}
                            resizeMode="contain"
                        />
                    ) : (
                        <Text style={styles.iconEmoji}>{collapsed_icon || '🔔'}</Text>
                    )}
                </View>

                {/* Text Content */}
                <View style={styles.textContainer}>
                    <View style={styles.headerRow}>
                        <Text
                            style={[styles.title, !is_read && styles.unreadTitle]}
                            numberOfLines={1}
                        >
                            {collapsed_title}
                        </Text>
                        {collapsed_timestamp_text && (
                            <Text style={styles.timestamp}>{collapsed_timestamp_text}</Text>
                        )}
                    </View>
                    <Text style={styles.message} numberOfLines={2}>
                        {collapsed_message}
                    </Text>
                </View>

                {/* Chevron */}
                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#6B7280"
                    style={styles.chevron}
                />
            </View>

            {/* Unread Indicator */}
            {!is_read && <View style={styles.unreadDot} />}

            {/* Dismiss Button */}
            {onDismiss && (
                <TouchableOpacity
                    style={styles.dismissButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        onDismiss();
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="close" size={18} color="#6B7280" />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        position: 'relative'
    },
    unreadContainer: {
        backgroundColor: '#F0F9FF',
        borderLeftWidth: 4,
        borderLeftColor: "#001C64"
    },
    content: {
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    iconImage: {
        width: 24,
        height: 24
    },
    iconEmoji: {
        fontSize: 20
    },
    textContainer: {
        flex: 1,
        marginRight: 8
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: "#1F2937",
        flex: 1,
        marginRight: 8
    },
    unreadTitle: {
        fontWeight: '700'
    },
    timestamp: {
        fontSize: 12,
        color: "#6B7280"
    },
    message: {
        fontSize: 14,
        color: "#6B7280",
        lineHeight: 20
    },
    chevron: {
        marginTop: 2
    },
    unreadDot: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#001C64"
    },
    dismissButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        padding: 4
    }
});

export default CampaignNotificationCard;
