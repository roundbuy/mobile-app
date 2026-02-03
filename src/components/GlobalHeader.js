import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import UserDrawer from './UserDrawer';

const GlobalHeader = ({
    title,
    showBackButton = true,
    onBackPress,
    navigation,
    showIcons = true,
}) => {
    const [drawerVisible, setDrawerVisible] = useState(false);

    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
        } else if (navigation) {
            navigation.goBack();
        }
    };

    const handleNotificationPress = () => {
        navigation?.navigate('Notifications');
    };

    const handleEmailPress = () => {
        // TODO: Navigate to Messages screen when implemented
        // For now, show a placeholder alert
        if (navigation?.navigate) {
            try {
                navigation.navigate('Messages');
            } catch (error) {
                console.log('Messages screen not yet implemented');
            }
        }
    };

    const handleMenuPress = () => {
        setDrawerVisible(true);
    };

    const handleSuggestionsPress = () => {
        // Pass current route name if available, or just a generic one
        const currentRoute = navigation?.getState()?.routes[navigation.getState().index]?.name || 'Unknown';
        navigation?.navigate('Suggestion', { sourceRoute: currentRoute });
    };

    return (
        <>
            <View style={styles.container}>
                {/* Left Side - Back Button */}
                <View style={styles.leftSection}>
                    {showBackButton ? (
                        <TouchableOpacity
                            onPress={handleBackPress}
                            style={styles.iconButton}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="chevron-back" size={28} color="#000" />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.iconButton} />
                    )}
                </View>

                {/* Center - Title */}
                <View style={styles.centerSection}>
                    <Text style={styles.title} numberOfLines={1}>
                        {title}
                    </Text>
                </View>

                {/* Right Side - Icons */}
                <View style={styles.rightSection}>
                    {showIcons && (
                        <>
                            {/* Notification Icon with Badge */}
                            <TouchableOpacity
                                onPress={handleNotificationPress}
                                style={styles.iconButton}
                                activeOpacity={0.7}
                            >
                                <View style={styles.iconWrapper}>
                                    <Ionicons name="notifications-outline" size={24} color="#000" />
                                    {/* Badge - can be controlled via props if needed */}
                                    {/* Uncomment to show badge:
                                    <View style={styles.notificationBadge}>
                                        <Text style={styles.badgeText}>3</Text>
                                    </View>
                                    */}
                                </View>
                            </TouchableOpacity>

                            {/* Email Icon */}
                            <TouchableOpacity
                                onPress={handleEmailPress}
                                style={styles.iconButton}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="mail-outline" size={24} color="#000" />
                            </TouchableOpacity>

                            {/* Suggestions Icon */}
                            <TouchableOpacity
                                onPress={handleSuggestionsPress}
                                style={styles.iconButton}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="chatbox-ellipses-outline" size={24} color="#000" />
                            </TouchableOpacity>

                            {/* Hamburger Menu */}
                            <TouchableOpacity
                                onPress={handleMenuPress}
                                style={styles.iconButton}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="menu" size={28} color="#000" />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>

            {/* User Drawer */}
            <UserDrawer
                visible={drawerVisible}
                onClose={() => setDrawerVisible(false)}
                navigation={navigation}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        minHeight: 56,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 40,
    },
    centerSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    iconButton: {
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 36,
        minHeight: 36,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
    },
    iconWrapper: {
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
});

export default GlobalHeader;
