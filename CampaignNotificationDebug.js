import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNotifications } from './src/context/NotificationContext';

/**
 * Simple test component to verify campaign notifications are loading
 * Add this to your App.js temporarily to debug
 */
const CampaignNotificationDebug = () => {
    const { campaignNotifications, notifications } = useNotifications();

    useEffect(() => {
        console.log('=== CAMPAIGN NOTIFICATION DEBUG ===');
        console.log('Regular notifications:', notifications?.length || 0);
        console.log('Campaign notifications:', campaignNotifications?.length || 0);
        if (campaignNotifications && campaignNotifications.length > 0) {
            console.log('First campaign notification:', JSON.stringify(campaignNotifications[0], null, 2));
        }
    }, [campaignNotifications, notifications]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Campaign Notification Debug</Text>

            <Text style={styles.label}>Regular Notifications: {notifications?.length || 0}</Text>
            <Text style={styles.label}>Campaign Notifications: {campaignNotifications?.length || 0}</Text>

            {campaignNotifications && campaignNotifications.length > 0 ? (
                <ScrollView style={styles.list}>
                    {campaignNotifications.map((notif, index) => (
                        <View key={index} style={styles.item}>
                            <Text style={styles.itemTitle}>
                                {notif.collapsed_title || notif.type_key}
                            </Text>
                            <Text style={styles.itemMessage}>
                                {notif.collapsed_message}
                            </Text>
                            <Text style={styles.itemMeta}>
                                ID: {notif.user_notification_id} | Type: {notif.type_key}
                            </Text>
                        </View>
                    ))}
                </ScrollView>
            ) : (
                <Text style={styles.empty}>No campaign notifications found</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 100,
        left: 20,
        right: 20,
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        maxHeight: 400,
        zIndex: 9999
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#000'
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
        color: '#333'
    },
    list: {
        marginTop: 12
    },
    item: {
        backgroundColor: '#F0F9FF',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#2563EB'
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4
    },
    itemMessage: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4
    },
    itemMeta: {
        fontSize: 10,
        color: '#999'
    },
    empty: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
        marginTop: 12
    }
});

export default CampaignNotificationDebug;
