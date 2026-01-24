/**
 * Notification Context
 * 
 * Manages notification state, heartbeat polling, and real-time updates
 */

import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from '../services/notificationService';
import {
    registerDeviceWithBackend,
    handleNotificationReceived,
    handleNotificationResponse,
    setBadgeCount,
    getDeviceId
} from '../config/notifications.config';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [popupNotification, setPopupNotification] = useState(null);

    const notificationListener = useRef();
    const responseListener = useRef();
    const heartbeatInterval = useRef();
    const lastCheckTime = useRef(null);

    // Initialize on mount
    useEffect(() => {
        // Initialize notifications asynchronously without blocking
        initializeNotifications().catch(err => {
            console.error('Failed to initialize notifications:', err);
        });

        setupNotificationListeners();
        startHeartbeat();

        return () => {
            stopHeartbeat();
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    /**
     * Initialize notifications
     */
    const initializeNotifications = async () => {
        try {
            // Register device with backend
            await registerDeviceWithBackend();

            // Fetch initial unread count
            await fetchUnreadCount();
        } catch (error) {
            console.error('Error initializing notifications:', error);
        }
    };

    /**
     * Setup notification listeners
     */
    const setupNotificationListeners = () => {
        // Foreground notification listener
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            handleNotificationReceived(notification);

            // Show as popup if type is popup or fullscreen
            const data = notification.request.content.data;
            if (data.type === 'popup' || data.type === 'fullscreen') {
                setPopupNotification({
                    id: data.notificationId,
                    title: notification.request.content.title,
                    message: notification.request.content.body,
                    type: data.type,
                    imageUrl: notification.request.content.data.imageUrl,
                    actionType: data.actionType,
                    actionData: data.actionData
                });
            }

            // Update unread count
            fetchUnreadCount();
        });

        // Notification tap listener
        responseListener.current = Notifications.addNotificationResponseReceivedListener(async response => {
            const action = await handleNotificationResponse(response);

            // Handle navigation based on action
            if (action && action.actionType) {
                handleNotificationAction(action);
            }

            // Update unread count
            fetchUnreadCount();
        });
    };

    /**
     * Start heartbeat polling
     * Checks for new notifications every 30 seconds
     */
    const startHeartbeat = () => {
        // Initial check
        checkHeartbeat();

        // Poll every 30 seconds
        heartbeatInterval.current = setInterval(() => {
            checkHeartbeat();
        }, 30000); // 30 seconds
    };

    /**
     * Stop heartbeat polling
     */
    const stopHeartbeat = () => {
        if (heartbeatInterval.current) {
            clearInterval(heartbeatInterval.current);
            heartbeatInterval.current = null;
        }
    };

    /**
     * Check for new notifications via heartbeat
     */
    const checkHeartbeat = async () => {
        try {
            const deviceId = await getDeviceId();

            // Skip heartbeat if no device ID (simulator)
            if (!deviceId) {
                console.log('Skipping heartbeat - no device ID available');
                return;
            }

            const lastCheck = lastCheckTime.current;

            const result = await notificationService.heartbeat(deviceId, lastCheck);

            if (result.hasNew && result.notifications && result.notifications.length > 0) {
                console.log(`Heartbeat: ${result.count} new notification(s)`);

                // Show popup notifications
                result.notifications.forEach(notif => {
                    if (notif.type === 'popup' || notif.type === 'fullscreen') {
                        setPopupNotification({
                            id: notif.notification_id,
                            title: notif.title,
                            message: notif.message,
                            type: notif.type,
                            imageUrl: notif.image_url,
                            actionType: notif.action_type,
                            actionData: notif.action_data
                        });
                    }
                });

                // Update unread count
                fetchUnreadCount();
            }

            // Update last check time
            lastCheckTime.current = result.lastCheckAt || new Date().toISOString();
        } catch (error) {
            console.error('Heartbeat error:', error);
        }
    };

    /**
     * Fetch unread notification count
     */
    const fetchUnreadCount = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                // User not logged in
                setUnreadCount(0);
                return;
            }

            const result = await notificationService.getUnreadCount();
            setUnreadCount(result.unreadCount || 0);

            // Update badge
            await setBadgeCount(result.unreadCount || 0);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    /**
     * Fetch user notifications
     */
    const fetchNotifications = async (limit = 50, offset = 0) => {
        try {
            setLoading(true);
            const result = await notificationService.getMyNotifications(limit, offset);
            setNotifications(result.notifications || []);
            return result.notifications || [];
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    /**
     * Mark notification as read
     */
    const markAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);

            // Update local state
            setNotifications(prev =>
                prev.map(n => n.user_notification_id === notificationId ? { ...n, is_read: true } : n)
            );

            // Update unread count
            fetchUnreadCount();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    /**
     * Mark all as read
     */
    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();

            // Update local state
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

            // Update unread count
            setUnreadCount(0);
            await setBadgeCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    /**
     * Delete notification
     */
    const deleteNotification = async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId);

            // Update local state
            setNotifications(prev => prev.filter(n => n.user_notification_id !== notificationId));

            // Update unread count
            fetchUnreadCount();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    /**
     * Handle notification action
     */
    const handleNotificationAction = (action) => {
        // This will be implemented based on your navigation setup
        console.log('Handle notification action:', action);

        // Example:
        // if (action.actionType === 'open_screen') {
        //   navigation.navigate(action.actionData.screen);
        // } else if (action.actionType === 'open_url') {
        //   Linking.openURL(action.actionData.url);
        // }
    };

    /**
     * Close popup notification
     */
    const closePopup = () => {
        setPopupNotification(null);
    };

    const value = {
        unreadCount,
        notifications,
        loading,
        popupNotification,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        closePopup,
        refreshNotifications: fetchNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationContext;
