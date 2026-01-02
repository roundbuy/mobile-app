/**
 * Notification Configuration
 * 
 * Sets up Expo Notifications for push notifications
 * Handles permissions, token registration, and notification handlers
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from '../services/notificationService';

// Set notification handler for foreground notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

/**
 * Register for push notifications and get Expo push token
 * Works for both authenticated users and guests
 */
export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return null;
        }

        // Get Expo push token
        token = (await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig?.extra?.eas?.projectId || 'your-project-id',
        })).data;

        console.log('Expo Push Token:', token);
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

/**
 * Get or create device ID for guest users
 * Persists across app launches
 */
export async function getDeviceId() {
    try {
        let deviceId = await AsyncStorage.getItem('deviceId');

        if (!deviceId) {
            // Generate UUID v4
            deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });

            await AsyncStorage.setItem('deviceId', deviceId);
            console.log('Generated new device ID:', deviceId);
        }

        return deviceId;
    } catch (error) {
        console.error('Error getting device ID:', error);
        return null;
    }
}

/**
 * Register device token with backend
 * Call this on app launch and after login
 */
export async function registerDeviceWithBackend(isAuthenticated = false) {
    try {
        const expoPushToken = await registerForPushNotificationsAsync();

        if (!expoPushToken) {
            console.log('No push token available');
            return false;
        }

        const deviceId = await getDeviceId();
        const platform = Platform.OS;
        const deviceName = Device.deviceName || `${Device.brand} ${Device.modelName}`;

        // Register with backend
        const result = await notificationService.registerDeviceToken(
            expoPushToken,
            platform,
            deviceId,
            deviceName
        );

        console.log('Device registered with backend:', result);

        // Store token locally
        await AsyncStorage.setItem('expoPushToken', expoPushToken);

        return true;
    } catch (error) {
        console.error('Error registering device with backend:', error);
        return false;
    }
}

/**
 * Unregister device token (on logout)
 */
export async function unregisterDeviceToken() {
    try {
        const expoPushToken = await AsyncStorage.getItem('expoPushToken');

        if (expoPushToken) {
            await notificationService.removeDeviceToken(expoPushToken);
            await AsyncStorage.removeItem('expoPushToken');
            console.log('Device token unregistered');
        }
    } catch (error) {
        console.error('Error unregistering device token:', error);
    }
}

/**
 * Handle notification received while app is in foreground
 */
export function handleNotificationReceived(notification) {
    console.log('Notification received:', notification);

    // You can show a custom in-app notification here
    // or update the notification context

    return notification;
}

/**
 * Handle notification tap/click
 */
export async function handleNotificationResponse(response) {
    const notification = response.notification;
    const data = notification.request.content.data;

    console.log('Notification tapped:', data);

    // Mark as clicked in backend
    if (data.notificationId) {
        try {
            await notificationService.markAsClicked(data.notificationId);
        } catch (error) {
            console.error('Error marking notification as clicked:', error);
        }
    }

    // Handle action based on action type
    if (data.actionType && data.actionData) {
        const actionData = typeof data.actionData === 'string'
            ? JSON.parse(data.actionData)
            : data.actionData;

        return {
            actionType: data.actionType,
            actionData: actionData
        };
    }

    return null;
}

/**
 * Get notification badge count
 */
export async function getBadgeCount() {
    try {
        const count = await Notifications.getBadgeCountAsync();
        return count;
    } catch (error) {
        console.error('Error getting badge count:', error);
        return 0;
    }
}

/**
 * Set notification badge count
 */
export async function setBadgeCount(count) {
    try {
        await Notifications.setBadgeCountAsync(count);
    } catch (error) {
        console.error('Error setting badge count:', error);
    }
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications() {
    try {
        await Notifications.dismissAllNotificationsAsync();
        await setBadgeCount(0);
    } catch (error) {
        console.error('Error clearing notifications:', error);
    }
}
