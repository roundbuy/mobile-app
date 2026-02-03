import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Campaign Notification Expanded - Semi-Expanded View
 * Shows full message with action buttons
 */
const CampaignNotificationExpanded = ({
    notification,
    onCollapse,
    onButtonPress,
    navigation
}) => {
    console.log('📖 Rendering CampaignNotificationExpanded:', notification?.expanded_title);

    const {
        expanded_icon,
        expanded_icon_bg_color,
        expanded_title,
        expanded_message,
        expanded_button_1_text,
        expanded_button_1_action,
        expanded_button_1_color,
        expanded_button_2_text,
        expanded_button_2_action,
        expanded_button_2_color,
        // Fallback to collapsed values
        collapsed_icon,
        collapsed_icon_bg_color,
        collapsed_title,
        collapsed_message
    } = notification;

    const icon = expanded_icon || collapsed_icon;
    const iconBgColor = expanded_icon_bg_color || collapsed_icon_bg_color || '#1E3A8A';
    const title = expanded_title || collapsed_title;
    const message = expanded_message || collapsed_message;
    const button1Color = expanded_button_1_color || '#2563EB';
    const button2Color = expanded_button_2_color || '#FFFFFF';

    const handleButtonAction = (action) => {
        if (!action) return;

        if (action.type === 'open_url' && action.url) {
            Linking.openURL(action.url);
        } else if (action.type === 'open_screen' && action.screen) {
            navigation?.navigate(action.screen, action.params || {});
        } else if (action.type === 'custom' && action.action) {
            onButtonPress?.(action.action);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                        {icon && icon.startsWith('http') ? (
                            <Image
                                source={{ uri: icon }}
                                style={styles.iconImage}
                                resizeMode="contain"
                            />
                        ) : (
                            <Text style={styles.iconEmoji}>{icon || '🔔'}</Text>
                        )}
                    </View>
                    <Text style={styles.title} numberOfLines={2}>
                        {title}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={onCollapse}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="chevron-up" size={24} color={"#1F2937"} />
                </TouchableOpacity>
            </View>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Action Buttons */}
            <View style={styles.buttonsContainer}>
                {expanded_button_1_text && (
                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: button1Color }]}
                        onPress={() => handleButtonAction(expanded_button_1_action)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.primaryButtonText}>{expanded_button_1_text}</Text>
                    </TouchableOpacity>
                )}
                {expanded_button_2_text && (
                    <TouchableOpacity
                        style={[
                            styles.secondaryButton,
                            {
                                borderColor: button2Color === '#FFFFFF' ? "#E0E0E0" : button2Color
                            }
                        ]}
                        onPress={() => handleButtonAction(expanded_button_2_action)}
                        activeOpacity={0.8}
                    >
                        <Text
                            style={[
                                styles.secondaryButtonText,
                                {
                                    color: button2Color === '#FFFFFF' ? "#1F2937" : button2Color
                                }
                            ]}
                        >
                            {expanded_button_2_text}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
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
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
        marginRight: 12
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
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: "#1F2937",
        flex: 1,
        lineHeight: 22
    },
    message: {
        fontSize: 14,
        color: "#6B7280",
        lineHeight: 20,
        marginBottom: 16
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: 12
    },
    primaryButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    primaryButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: '600'
    },
    secondaryButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: '600'
    }
});

export default CampaignNotificationExpanded;
