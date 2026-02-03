import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Dimensions,
    Image,
    ScrollView,
    Linking,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

/**
 * Campaign Notification Popup - 3 States
 * 1. Collapsed: Small banner at top
 * 2. Semi-Expanded: Shows full message and buttons
 * 3. Full-Screen: Full modal view
 */
const CampaignNotificationPopup = ({ notification, onClose, navigation }) => {
    const [state, setState] = useState('collapsed'); // 'collapsed', 'expanded', 'fullscreen'
    const [slideAnim] = useState(new Animated.Value(-200));
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (notification) {
            setVisible(true);
            setState('collapsed');
            // Slide in animation
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 8
            }).start();
        }
    }, [notification]);

    const handleClose = () => {
        Animated.timing(slideAnim, {
            toValue: -200,
            duration: 300,
            useNativeDriver: true
        }).start(() => {
            setVisible(false);
            setState('collapsed');
            onClose();
        });
    };

    const handleExpand = () => {
        setState('expanded');
    };

    const handleCollapse = () => {
        setState('collapsed');
    };

    const handleOpenFullscreen = () => {
        setState('fullscreen');
    };

    const handleButtonAction = (action) => {
        if (!action) return;

        if (action.type === 'dismiss') {
            handleClose();
        } else if (action.type === 'open_url' && action.url) {
            Linking.openURL(action.url);
            handleClose();
        } else if (action.type === 'open_screen' && action.screen) {
            handleClose();
            setTimeout(() => {
                navigation?.navigate(action.screen, action.params || {});
            }, 300);
        }
    };

    if (!notification || !visible) return null;

    const {
        collapsed_icon,
        collapsed_icon_bg_color,
        collapsed_title,
        collapsed_message,
        collapsed_timestamp_text,
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
        fullscreen_show_logo,
        fullscreen_icon,
        fullscreen_icon_bg_color,
        fullscreen_heading,
        fullscreen_subheading,
        fullscreen_description,
        fullscreen_primary_button_text,
        fullscreen_primary_button_action,
        fullscreen_primary_button_color,
        fullscreen_secondary_button_text,
        fullscreen_secondary_button_action,
        fullscreen_secondary_button_color,
        is_read
    } = notification;

    // Collapsed State - Small banner at top
    if (state === 'collapsed') {
        const iconBgColor = collapsed_icon_bg_color || '#10B981';

        return (
            <Modal visible={visible} transparent animationType="none">
                <Animated.View
                    style={[
                        styles.collapsedContainer,
                        { transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <TouchableOpacity
                        style={[
                            styles.collapsedCard,
                            !is_read && styles.unreadCard
                        ]}
                        onPress={handleExpand}
                        activeOpacity={0.9}
                    >
                        <View style={styles.collapsedContent}>
                            {/* Icon */}
                            <View style={[styles.collapsedIcon, { backgroundColor: iconBgColor }]}>
                                {collapsed_icon && collapsed_icon.startsWith('http') ? (
                                    <Image
                                        source={{ uri: collapsed_icon }}
                                        style={styles.collapsedIconImage}
                                        resizeMode="contain"
                                    />
                                ) : (
                                    <Text style={styles.collapsedIconEmoji}>{collapsed_icon || '🔔'}</Text>
                                )}
                            </View>

                            {/* Text */}
                            <View style={styles.collapsedText}>
                                <Text style={styles.collapsedTitle} numberOfLines={1}>
                                    {collapsed_title}
                                </Text>
                                <Text style={styles.collapsedMessage} numberOfLines={1}>
                                    {collapsed_message}
                                </Text>
                            </View>

                            {/* Chevron */}
                            <Ionicons name="chevron-down" size={20} color="#6B7280" />
                        </View>

                        {/* Unread indicator */}
                        {!is_read && <View style={styles.unreadDot} />}
                    </TouchableOpacity>

                    {/* Close button */}
                    <TouchableOpacity
                        style={styles.collapsedCloseButton}
                        onPress={handleClose}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="close" size={20} color="#6B7280" />
                    </TouchableOpacity>
                </Animated.View>
            </Modal>
        );
    }

    // Semi-Expanded State - Shows full message and buttons
    if (state === 'expanded') {
        const icon = expanded_icon || collapsed_icon;
        const iconBgColor = expanded_icon_bg_color || collapsed_icon_bg_color || '#1E3A8A';
        const title = expanded_title || collapsed_title;
        const message = expanded_message || collapsed_message;
        const button1Color = expanded_button_1_color || '#2563EB';
        const button2Color = expanded_button_2_color || '#FFFFFF';

        return (
            <Modal visible={visible} transparent animationType="none">
                <View style={styles.expandedOverlay}>
                    <Animated.View
                        style={[
                            styles.expandedContainer,
                            { transform: [{ translateY: slideAnim }] }
                        ]}
                    >
                        {/* Header */}
                        <View style={styles.expandedHeader}>
                            <View style={styles.expandedHeaderLeft}>
                                <View style={[styles.expandedIcon, { backgroundColor: iconBgColor }]}>
                                    {icon && icon.startsWith('http') ? (
                                        <Image
                                            source={{ uri: icon }}
                                            style={styles.expandedIconImage}
                                            resizeMode="contain"
                                        />
                                    ) : (
                                        <Text style={styles.expandedIconEmoji}>{icon || '🔔'}</Text>
                                    )}
                                </View>
                                <Text style={styles.expandedTitle} numberOfLines={2}>
                                    {title}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={handleCollapse}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="chevron-up" size={24} color="#1F2937" />
                            </TouchableOpacity>
                        </View>

                        {/* Message */}
                        <Text style={styles.expandedMessage}>{message}</Text>

                        {/* Action Buttons */}
                        <View style={styles.expandedButtons}>
                            {expanded_button_1_text && (
                                <TouchableOpacity
                                    style={[styles.expandedPrimaryButton, { backgroundColor: button1Color }]}
                                    onPress={() => handleButtonAction(expanded_button_1_action)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.expandedPrimaryButtonText}>
                                        {expanded_button_1_text}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            {expanded_button_2_text && (
                                <TouchableOpacity
                                    style={[
                                        styles.expandedSecondaryButton,
                                        {
                                            borderColor: button2Color === '#FFFFFF' ? '#E0E0E0' : button2Color
                                        }
                                    ]}
                                    onPress={() => handleButtonAction(expanded_button_2_action)}
                                    activeOpacity={0.8}
                                >
                                    <Text
                                        style={[
                                            styles.expandedSecondaryButtonText,
                                            {
                                                color: button2Color === '#FFFFFF' ? '#1F2937' : button2Color
                                            }
                                        ]}
                                    >
                                        {expanded_button_2_text}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* View Details Button */}
                        <TouchableOpacity
                            style={styles.viewDetailsButton}
                            onPress={handleOpenFullscreen}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="expand-outline" size={16} color="#2563EB" style={{ marginRight: 4 }} />
                            <Text style={styles.viewDetailsText}>View Details</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Close button */}
                    <TouchableOpacity
                        style={styles.expandedCloseButton}
                        onPress={handleClose}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }

    // Full-Screen State
    if (state === 'fullscreen') {
        const showLogo = fullscreen_show_logo !== false;
        const icon = fullscreen_icon || expanded_icon || collapsed_icon;
        const iconBgColor = fullscreen_icon_bg_color || expanded_icon_bg_color || collapsed_icon_bg_color || '#1E3A8A';
        const heading = fullscreen_heading || expanded_title || collapsed_title;
        const description = fullscreen_description || expanded_message || collapsed_message;
        const primaryColor = fullscreen_primary_button_color || '#2563EB';
        const secondaryColor = fullscreen_secondary_button_color || '#6B7280';

        return (
            <Modal visible={visible} transparent animationType="fade">
                <View style={styles.fullscreenContainer}>
                    <Animated.View style={styles.fullscreenContentContainer}>
                        {/* Close Button */}
                        <TouchableOpacity
                            style={styles.fullscreenCloseButton}
                            onPress={handleClose}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="close" size={28} color="#1F2937" />
                        </TouchableOpacity>

                        <ScrollView
                            contentContainerStyle={styles.fullscreenContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Logo */}
                            {showLogo && (
                                <View style={styles.fullscreenLogo}>
                                    <Image
                                        source={require('../../assets/Logo-main.png')}
                                        style={styles.fullscreenLogoImage}
                                        resizeMode="contain"
                                    />
                                </View>
                            )}

                            {/* Icon */}
                            <View style={[styles.fullscreenIcon, { backgroundColor: iconBgColor }]}>
                                {icon && icon.startsWith('http') ? (
                                    <Image
                                        source={{ uri: icon }}
                                        style={styles.fullscreenIconImage}
                                        resizeMode="contain"
                                    />
                                ) : (
                                    <Text style={styles.fullscreenIconEmoji}>{icon || '🔔'}</Text>
                                )}
                            </View>

                            {/* Heading */}
                            <Text style={styles.fullscreenHeading}>{heading}</Text>

                            {/* Subheading */}
                            {fullscreen_subheading && (
                                <Text style={styles.fullscreenSubheading}>{fullscreen_subheading}</Text>
                            )}

                            {/* Description */}
                            <Text style={styles.fullscreenDescription}>{description}</Text>
                        </ScrollView>

                        {/* Action Buttons */}
                        <View style={styles.fullscreenButtons}>
                            {fullscreen_primary_button_text && (
                                <TouchableOpacity
                                    style={[styles.fullscreenPrimaryButton, { backgroundColor: primaryColor }]}
                                    onPress={() => handleButtonAction(fullscreen_primary_button_action)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.fullscreenPrimaryButtonText}>
                                        {fullscreen_primary_button_text}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            {fullscreen_secondary_button_text && (
                                <TouchableOpacity
                                    style={styles.fullscreenSecondaryButton}
                                    onPress={() => handleButtonAction(fullscreen_secondary_button_action)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.fullscreenSecondaryButtonText, { color: secondaryColor }]}>
                                        {fullscreen_secondary_button_text}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        );
    }

    return null;
};

const styles = StyleSheet.create({
    // COLLAPSED STATE
    collapsedContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 90 : 70, // Increased top margin
        left: 16,
        right: 16,
        zIndex: 9999
    },
    collapsedCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5
    },
    unreadCard: {
        backgroundColor: '#F0F9FF',
        borderLeftWidth: 4,
        borderLeftColor: '#001C64'
    },
    collapsedContent: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    collapsedIcon: {
        width: 40,
        height: 40,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    collapsedIconImage: {
        width: 24,
        height: 24
    },
    collapsedIconEmoji: {
        fontSize: 20
    },
    collapsedText: {
        flex: 1,
        marginRight: 8
    },
    collapsedTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 2
    },
    collapsedMessage: {
        fontSize: 13,
        color: '#000000'
    },
    unreadDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#001C64'
    },
    collapsedCloseButton: {
        position: 'absolute',
        top: 54,
        right: 20,
        padding: 4,
        zIndex: 10
    },

    // SEMI-EXPANDED STATE
    expandedOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)'
    },
    expandedContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 90 : 70, // Increased top margin
        left: 16,
        right: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 10
    },
    expandedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12
    },
    expandedHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
        marginRight: 12
    },
    expandedIcon: {
        width: 40,
        height: 40,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    expandedIconImage: {
        width: 24,
        height: 24
    },
    expandedIconEmoji: {
        fontSize: 20
    },
    expandedTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        flex: 1,
        lineHeight: 22
    },
    expandedMessage: {
        fontSize: 14,
        color: '#000000',
        lineHeight: 20,
        marginBottom: 16
    },
    expandedButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12
    },
    expandedPrimaryButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    expandedPrimaryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600'
    },
    expandedSecondaryButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1
    },
    expandedSecondaryButtonText: {
        fontSize: 14,
        fontWeight: '600'
    },
    viewDetailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8
    },
    viewDetailsText: {
        color: '#2563EB',
        fontSize: 14,
        fontWeight: '500'
    },
    expandedCloseButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 70 : 50,
        right: 26,
        padding: 4,
        zIndex: 10
    },

    // FULL-SCREEN STATE (Now Centered Modal)
    fullscreenContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dimmed background
        justifyContent: 'center',
        padding: 24
    },
    fullscreenContentContainer: { // New wrapper for the card itself
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        maxHeight: '85%',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 15,
        overflow: 'hidden'
    },
    fullscreenCloseButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
        padding: 4
    },
    fullscreenContent: {
        flexGrow: 0, // Important for centered modal
        paddingHorizontal: 24,
        paddingVertical: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    fullscreenLogo: {
        marginBottom: 24,
        alignItems: 'center'
    },
    fullscreenLogoImage: {
        width: 150,
        height: 50
    },
    fullscreenIcon: {
        width: 60, // Increased size for modal
        height: 60,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24
    },
    fullscreenIconImage: {
        width: 48,
        height: 48
    },
    fullscreenIconEmoji: {
        fontSize: 32
    },
    fullscreenHeading: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000000',
        textAlign: 'center',
        marginBottom: 12
    },
    fullscreenSubheading: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 16
    },
    fullscreenDescription: {
        fontSize: 15,
        color: '#000000',
        lineHeight: 24,
        textAlign: 'center',
        marginBottom: 24
    },
    fullscreenButtons: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        gap: 12
    },
    fullscreenPrimaryButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    fullscreenPrimaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600'
    },
    fullscreenSecondaryButton: {
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center'
    },
    fullscreenSecondaryButtonText: {
        fontSize: 16,
        fontWeight: '600'
    }
});

export default CampaignNotificationPopup;
