import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Image,
    ScrollView,
    Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

/**
 * Campaign Notification Modal - Full-Screen View
 * Displays notification in a full-screen modal with detailed content
 */
const CampaignNotificationModal = ({
    visible,
    notification,
    onClose,
    navigation
}) => {
    if (!notification) return null;

    const {
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
        // Fallbacks
        expanded_icon,
        expanded_icon_bg_color,
        expanded_title,
        expanded_message
    } = notification;

    const showLogo = fullscreen_show_logo !== false;
    const icon = fullscreen_icon || expanded_icon;
    const iconBgColor = fullscreen_icon_bg_color || expanded_icon_bg_color || notification.collapsed_icon_bg_color || '#1E3A8A';
    const heading = fullscreen_heading || expanded_title;
    const description = fullscreen_description || expanded_message;
    const primaryColor = fullscreen_primary_button_color || '#2563EB';
    const secondaryColor = fullscreen_secondary_button_color || '#6B7280';

    const handleButtonAction = (action) => {
        if (!action) return;

        if (action.type === 'dismiss') {
            onClose();
        } else if (action.type === 'open_url' && action.url) {
            Linking.openURL(action.url);
            onClose();
        } else if (action.type === 'open_screen' && action.screen) {
            onClose();
            navigation?.navigate(action.screen, action.params || {});
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                {/* Close Button */}
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="close" size={28} color="#1F2937" />
                </TouchableOpacity>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Logo */}
                    {showLogo && (
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoText}>RoundBuy</Text>
                        </View>
                    )}

                    {/* Icon */}
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

                    {/* Heading */}
                    <Text style={styles.heading}>{heading}</Text>

                    {/* Subheading */}
                    {fullscreen_subheading && (
                        <Text style={styles.subheading}>{fullscreen_subheading}</Text>
                    )}

                    {/* Description */}
                    <Text style={styles.description}>{description}</Text>
                </ScrollView>

                {/* Action Buttons */}
                <View style={styles.buttonsContainer}>
                    {fullscreen_primary_button_text && (
                        <TouchableOpacity
                            style={[styles.primaryButton, { backgroundColor: primaryColor }]}
                            onPress={() => handleButtonAction(fullscreen_primary_button_action)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.primaryButtonText}>
                                {fullscreen_primary_button_text}
                            </Text>
                        </TouchableOpacity>
                    )}
                    {fullscreen_secondary_button_text && (
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => handleButtonAction(fullscreen_secondary_button_action)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.secondaryButtonText, { color: secondaryColor }]}>
                                {fullscreen_secondary_button_text}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
        padding: 4
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 24,
        alignItems: 'center'
    },
    logoContainer: {
        marginBottom: 24
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2563EB'
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24
    },
    iconImage: {
        width: 48,
        height: 48
    },
    iconEmoji: {
        fontSize: 40
    },
    heading: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 12
    },
    subheading: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 16
    },
    description: {
        fontSize: 15,
        color: '#1F2937',
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 24
    },
    buttonsContainer: {
        paddingHorizontal: 24,
        paddingBottom: 16,
        gap: 12
    },
    primaryButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600'
    },
    secondaryButton: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center'
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600'
    }
});

export default CampaignNotificationModal;
