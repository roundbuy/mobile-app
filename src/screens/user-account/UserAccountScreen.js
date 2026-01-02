import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import GlobalHeader from '../../components/GlobalHeader';

const UserAccountScreen = ({ navigation }) => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('account'); // 'account' or 'settings'

  // Use real user data from AuthContext
  const userData = {
    name: user?.full_name || user?.name || 'User',
    username: user?.email?.split('@')[0] || 'user',
    email: user?.email || '',
    memberId: user?.id?.toString() || 'N/A',
    appVersion: 'Version 1.7',
    profileImage: user?.profile_image || null, // Profile image URL
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const handleLogout = async () => {
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
              // Navigate to login screen and reset navigation stack
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

  const menuItems = {
    account: [
      { id: 1, title: 'Personal information', icon: 'person-outline' },
      { id: 2, title: 'Privacy & Account', icon: 'shield-checkmark-outline' },
      { id: 3, title: 'Login & security', icon: 'lock-closed-outline' },
      { id: 4, title: 'Billing & payments', icon: 'card-outline' },
      { id: 5, title: 'Password & Account', icon: 'key-outline' },
      { id: 6, title: 'Customer support', icon: 'help-circle-outline' },
      { id: 7, title: 'Country settings', icon: 'globe-outline' },
      { id: 8, title: 'Notifications', icon: 'notifications-outline' },
      { id: 9, title: 'Report content', icon: 'flag-outline' },
      { id: 10, title: 'Legal info', icon: 'document-text-outline' },
      { id: 11, title: 'Log out', icon: 'log-out-outline', isLogout: true },
    ],
    settings: [
      { id: 1, title: 'Manage offers', icon: 'pricetag-outline' },
      { id: 2, title: 'My Ads', icon: 'megaphone-outline' },
      { id: 3, title: 'Support & Resolution', icon: 'help-circle-outline', badge: 0 },
      { id: 4, title: 'Purchase Visibility', icon: 'eye-outline' },
      { id: 5, title: 'Default location & Product locations', icon: 'location-outline' },
      { id: 6, title: 'Membership', icon: 'card-outline' },
      { id: 7, title: 'Feedbacks', icon: 'chatbubble-outline' },
      { id: 8, title: 'Favourites', icon: 'heart-outline' },
      { id: 9, title: 'Rewards', icon: 'gift-outline' },
      { id: 10, title: 'Review', icon: 'star-outline' },
      { id: 11, title: 'Share', icon: 'share-social-outline' },
      { id: 12, title: 'Follow', icon: 'person-add-outline' },
    ],
  };

  const renderMenuItem = (item) => {
    const handlePress = () => {
      if (item.isLogout) {
        handleLogout();
      } else if (item.title === 'Personal information') {
        navigation.navigate('PersonalInformation');
      } else if (item.title === 'Privacy & Account') {
        navigation.navigate('PrivacyAccount');
      } else if (item.title === 'Login & security') {
        navigation.navigate('LoginSecurity');
      } else if (item.title === 'Billing & payments') {
        navigation.navigate('BillingPayments');
      } else if (item.title === 'Legal info') {
        navigation.navigate('LegalInfo');
      } else if (item.title === 'Country settings') {
        navigation.navigate('CountrySettings');
      } else if (item.title === 'Customer support') {
        navigation.navigate('CustomerSupport');
      } else if (item.title === 'Notifications') {
        navigation.navigate('Notifications');
      } else if (item.title === 'Report content') {
        navigation.navigate('ContactSupport');
      } else if (item.title === 'Manage offers') {
        navigation.navigate('ManageOffers');
      } else if (item.title === 'My Ads') {
        navigation.navigate('MyAds');
      } else if (item.title === 'Support & Resolution') {
        navigation.navigate('SupportResolution');
      } else if (item.title === 'Purchase Visibility') {
        navigation.navigate('PurchaseVisibility');
      } else if (item.title === 'Default location & Product locations') {
        navigation.navigate('DefaultLocation');
      } else if (item.title === 'Membership') {
        navigation.navigate('AllMemberships');
      } else if (item.title === 'Feedbacks') {
        navigation.navigate('Feedbacks');
      } else if (item.title === 'Favourites') {
        navigation.navigate('Favourites');
      } else if (item.title === 'Rewards') {
        navigation.navigate('Rewards');
      } else if (item.title === 'Review') {
        navigation.navigate('Review');
      } else if (item.title === 'Share') {
        navigation.navigate('Share');
      } else {
        console.log('Navigate to:', item.title);
      }
    };

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.menuItem}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemContent}>
          <Ionicons name={item.icon} size={24} color="#666" style={styles.menuIcon} />
          <Text style={[styles.menuItemText, item.isLogout && styles.logoutText]}>
            {item.title}
          </Text>
          {item.badge !== undefined && item.badge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Global Header */}
      <GlobalHeader
        title="User account"
        navigation={navigation}
        showBackButton={true}
        showIcons={true}
      />

      {/* User Info */}
      <View style={styles.userSection}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => navigation.navigate('PersonalInformation')}
          activeOpacity={0.7}
        >
          {userData.profileImage ? (
            <Image
              source={{ uri: userData.profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <FontAwesome name="user-circle" size={60} color="#666" />
          )}
          <View style={styles.editBadge}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.userName}>{userData.name}</Text>
        <Text style={styles.username}>{userData.username}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'account' && styles.activeTab]}
          onPress={() => setActiveTab('account')}
        >
          <Text style={[styles.tabText, activeTab === 'account' && styles.activeTabText]}>
            User account
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
            User settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuItems[activeTab].map((item) => renderMenuItem(item))}

        {/* Footer Information (only on account tab) */}
        {activeTab === 'account' && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>Member ID</Text>
            <Text style={styles.footerValue}>{userData.memberId}</Text>
            <Text style={styles.footerText}>RoundBuy App</Text>
            <Text style={styles.footerValue}>{userData.appVersion}</Text>
            <Text style={styles.copyright}>© 2020-2025, RoundBuy Inc ®</Text>
          </View>
        )}

        {/* Footer for settings tab */}
        {activeTab === 'settings' && (
          <View style={styles.footer}>
            <Text style={styles.copyright}>© 2020-2025 RoundBuy Inc ®</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  userSection: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    marginBottom: 12,
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#999',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '700',
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  logoutText: {
    color: '#d32f2f',
  },
  footer: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  footerText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    marginTop: 8,
  },
  footerValue: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
  },
  copyright: {
    fontSize: 12,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
    width: '100%',
  },
  badge: {
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default UserAccountScreen;