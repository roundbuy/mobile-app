import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Animated,
    Dimensions,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../context/NotificationContext';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');

const NotificationPopup = ({ navigation }) => {
    const { popupNotification, closePopup } = useNotifications();
    const slideAnim = useRef(new Animated.Value(-200)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (popupNotification) {
            // Show animation
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 7
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                })
            ]).start();

            // No auto-hide - user must manually close or tap
        }
    }, [popupNotification]);

    const hidePopup = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: -200,
                duration: 300,
                useNativeDriver: true
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            })
        ]).start(() => {
            closePopup();
        });
    };

    const handlePress = () => {
        hidePopup();

        // Handle action
        if (popupNotification?.actionType && popupNotification?.actionData) {
            const actionData = typeof popupNotification.actionData === 'string'
                ? JSON.parse(popupNotification.actionData)
                : popupNotification.actionData;

            if (popupNotification.actionType === 'open_screen' && actionData.screen) {
                navigation?.navigate(actionData.screen);
            } else if (popupNotification.actionType === 'open_url' && actionData.url) {
                // Open URL
                console.log('Open URL:', actionData.url);
            }
        }
    };

    if (!popupNotification) {
        return null;
    }

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY: slideAnim }],
                    opacity: opacityAnim
                }
            ]}
        >
            <TouchableOpacity
                style={styles.popup}
                onPress={handlePress}
                activeOpacity={0.9}
            >
                <View style={styles.content}>
                    {popupNotification.imageUrl && (
                        <Image
                            source={{ uri: popupNotification.imageUrl }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    )}

                    <View style={styles.textContainer}>
                        <View style={styles.header}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="notifications" size={20} color={COLORS.primary} />
                            </View>
                            <Text style={styles.title} numberOfLines={1}>
                                {popupNotification.title}
                            </Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={hidePopup}
                            >
                                <Ionicons name="close" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.message} numberOfLines={2}>
                            {popupNotification.message}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 10,
        left: 16,
        right: 16,
        zIndex: 9999,
        elevation: 999
    },
    popup: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0'
    },
    content: {
        overflow: 'hidden',
        borderRadius: 12
    },
    image: {
        width: '100%',
        height: 120
    },
    textContainer: {
        padding: 16
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8
    },
    title: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#000'
    },
    closeButton: {
        padding: 4,
        marginLeft: 8
    },
    message: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginLeft: 40
    }
});

export default NotificationPopup;
