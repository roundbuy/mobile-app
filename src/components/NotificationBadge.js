import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../context/NotificationContext';

const NotificationBadge = ({ navigation, iconSize = 24, iconColor = '#000' }) => {
    const { unreadCount } = useNotifications();

    const handlePress = () => {
        navigation.navigate('NotificationCenter');
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <Ionicons name="notifications-outline" size={iconSize} color={iconColor} />
            {unreadCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        padding: 8
    },
    badge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: '#FFFFFF'
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700'
    }
});

export default NotificationBadge;
