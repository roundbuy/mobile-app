import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    Alert,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const UserDrawer = ({ visible, onClose, navigation }) => {
    const { user, logout } = useAuth();
    const slideAnim = React.useRef(new Animated.Value(300)).current;

    React.useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: 300,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                            onClose();
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'SocialLogin' }],
                            });
                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const menuItems = [
        { id: 1, title: 'User Account', icon: 'person-outline', screen: 'UserAccount' },
        { id: 2, title: 'Personal Information', icon: 'person-outline', screen: 'PersonalInformation' },
        { id: 3, title: 'My Ads', icon: 'megaphone-outline', screen: 'MyAds' },
        { id: 4, title: 'Favourites', icon: 'heart-outline', screen: 'Favourites' },
        { id: 5, title: 'Support & Resolution', icon: 'help-circle-outline', screen: 'SupportResolution' },
        { id: 6, title: 'Membership', icon: 'card-outline', screen: 'AllMemberships' },
        { id: 7, title: 'Notifications', icon: 'notifications-outline', screen: 'Notifications' },
        { id: 8, title: 'Settings', icon: 'settings-outline', screen: 'UserAccount' },
    ];

    const handleMenuPress = (item) => {
        onClose();
        if (item.screen) {
            navigation.navigate(item.screen);
        }
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <Animated.View
                    style={[
                        styles.drawer,
                        {
                            transform: [{ translateX: slideAnim }],
                        },
                    ]}
                    onStartShouldSetResponder={() => true}
                >
                    <SafeAreaView style={styles.drawerContent} edges={['top', 'bottom']}>
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={28} color="#000" />
                            </TouchableOpacity>
                        </View>

                        {/* User Info */}
                        <View style={styles.userSection}>
                            <View style={styles.avatarContainer}>
                                <FontAwesome name="user-circle" size={60} color="#666" />
                            </View>
                            <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
                            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
                        </View>

                        {/* Menu Items */}
                        <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
                            {menuItems.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.menuItem}
                                    onPress={() => handleMenuPress(item)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name={item.icon} size={22} color="#666" style={styles.menuIcon} />
                                    <Text style={styles.menuItemText}>{item.title}</Text>
                                    <Ionicons name="chevron-forward" size={20} color="#999" />
                                </TouchableOpacity>
                            ))}

                            {/* Logout Button */}
                            <TouchableOpacity
                                style={[styles.menuItem, styles.logoutItem]}
                                onPress={handleLogout}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="log-out-outline" size={22} color="#d32f2f" style={styles.menuIcon} />
                                <Text style={[styles.menuItemText, styles.logoutText]}>Log Out</Text>
                            </TouchableOpacity>
                        </ScrollView>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>© 2020-2026 RoundBuy Inc ®</Text>
                            <Text style={styles.versionText}>Version 1.7</Text>
                        </View>
                    </SafeAreaView>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
        flexDirection: 'row',
    },
    drawer: {
        width: '80%',
        maxWidth: 320,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    drawerContent: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    closeButton: {
        padding: 4,
    },
    userSection: {
        alignItems: 'center',
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    avatarContainer: {
        marginBottom: 12,
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
    },
    menuContainer: {
        flex: 1,
        paddingTop: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuIcon: {
        marginRight: 16,
        width: 22,
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
    logoutItem: {
        marginTop: 8,
    },
    logoutText: {
        color: '#d32f2f',
    },
    footer: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
    },
    versionText: {
        fontSize: 11,
        color: '#bbb',
    },
});

export default UserDrawer;
