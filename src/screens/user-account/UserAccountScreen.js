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
import offerIcon from '../../../assets/Offer.png';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/TranslationContext';
import GlobalHeader from '../../components/GlobalHeader';
import SuggestionsFooter from '../../components/SuggestionsFooter';

const UserAccountScreen = ({ navigation }) => {
  const { logout, user } = useAuth();
  const { t, currentLanguage } = useTranslation();
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
      t(t('auth.logout'), t('Logout')),
      t('account.logout_confirm', 'Are you sure you want to logout?'),
      [
        {
          text: t('common.cancel', 'Cancel'),
          style: 'cancel',
        },
        {
          text: t('auth.logout', 'Logout'),
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
              Alert.alert(
                t(t('common.error'), t('Error')),
                t('account.logout_failed', 'Failed to logout. Please try again.')
              );
            }
          },
        },
      ]
    );
  };

  const menuItems = {
    account: [
      { id: 1, route: 'PersonalInformation', title: t('account.personal_info', 'Personal information'), icon: 'person-outline' },
      { id: 2, route: 'PrivacyAccount', title: t('account.privacy', 'Privacy & Account'), icon: 'shield-checkmark-outline' },
      { id: 3, route: 'LoginSecurity', title: t('account.login_security', 'Login & security'), icon: 'lock-closed-outline' },
      { id: 4, route: 'BillingPayments', title: t('account.billing', 'Billing & payments'), icon: 'card-outline' },
      { id: 5, route: 'Wallet', title: t('account.wallet', 'My Wallet'), icon: 'wallet-outline' },
      { id: 6, route: 'CustomerSupport', title: t('account.support', 'Customer support'), icon: 'help-circle-outline' },
      { id: 7, route: 'CountrySettings', title: t('account.country_settings', 'Country settings'), icon: 'globe-outline' },
      { id: 13, route: 'MeasurementSettings', title: t('account.measurement', 'Measurement Unit'), icon: 'resize-outline' },
      { id: 8, route: 'Notifications', title: t('profile.notifications', 'Notifications'), icon: 'notifications-outline' },
      { id: 9, route: 'ContactSupport', title: t('account.report_content', 'Report content'), icon: 'flag-outline' },
      { id: 10, route: 'LegalInfo', title: t('account.legal_info', 'Legal info'), icon: 'document-text-outline' },
      { id: 11, route: 'logout', title: t('auth.logout', 'Log out'), icon: 'log-out-outline', isLogout: true },
    ],
    settings: [
      { id: 1, route: 'ManageOffers', title: t('account.manage_offers', 'Manage offers'), icon: 'pricetag-outline' },
      { id: 12, route: 'PickUpExchange', title: t('account.pickups', 'Pick Ups & Exchanges'), icon: 'calendar-outline' },
      { id: 2, route: 'MyAds', title: 'My Ads', icon: 'megaphone-outline' },
      { id: 3, route: 'SupportResolution', title: t('account.support_resolution', 'Support & Resolution'), icon: 'help-circle-outline', badge: 0 },
      { id: 4, route: 'PurchaseVisibility', title: t('account.purchase_visibility', 'Purchase Visibility'), icon: 'eye-outline' },
      { id: 5, route: 'DefaultLocation', title: t('account.locations', 'Default location & Product locations'), icon: 'location-outline' },
      { id: 6, route: 'MyMembership', title: t('account.membership', 'Membership'), icon: 'card-outline' },
      { id: 7, route: 'Feedbacks', title: t('account.feedbacks', 'Feedbacks'), icon: 'chatbubble-outline' },
      { id: 8, route: 'Favourites', title: t('profile.favorites', 'Favourites'), icon: 'heart-outline' },
      { id: 9, route: 'Rewards', title: t('account.rewards', 'Rewards'), icon: 'gift-outline' },
      { id: 10, route: 'Review', title: t('account.review', 'Review'), icon: 'star-outline' },
      { id: 11, route: 'Share', title: t('account.share', 'Share'), icon: 'share-social-outline' },
    ],
  };

  const renderMenuItem = (item) => {
    const handlePress = () => {
      if (item.isLogout) {
        handleLogout();
      } else if (item.route) {
        navigation.navigate(item.route);
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
          {item.route === 'ManageOffers' ? (
            <Image source={offerIcon} style={styles.customMenuIcon} />
          ) : (
            <Ionicons name={item.icon} size={24} color="#666" style={styles.menuIcon} />
          )}
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
        title={t('account.title', 'User account')}
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
            {t('account.tab_account', 'User account')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
            {t('account.tab_settings', 'User settings')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuItems[activeTab].map((item) => renderMenuItem(item))}

        {/* Footer Information (only on account tab) */}
        {activeTab === 'account' && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('account.member_id', 'Member ID')}</Text>
            <Text style={styles.footerValue}>{userData.memberId}</Text>
            <Text style={styles.footerText}>{t('account.app_name', 'RoundBuy App')}</Text>
            <Text style={styles.footerValue}>{userData.appVersion}</Text>
            <View style={styles.languageIndicator}>
              <Text style={styles.languageText}>
                {t('settings.language', 'Language')}: {currentLanguage.toUpperCase()}
              </Text>
            </View>


            <Text style={styles.copyright}>{t('© 2020-2026, RoundBuy Inc ®')}</Text>
          </View>
        )}

        {/* Footer for settings tab */}
        {activeTab === 'settings' && (
          <View style={styles.footer}>
            <Text style={styles.copyright}>{t('© 2020-2026 RoundBuy Inc ®')}</Text>
          </View>
        )}
        {/* Suggestions Footer - Only on Account tab */}
        {activeTab === 'account' && (
          <SuggestionsFooter sourceRoute="UserAccount" />
        )}
      </ScrollView>

      {/* Fixed Footer for Suggestions - Only on Account tab */}
      {/* Moved inside ScrollView as per request */}
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
  customMenuIcon: {
    width: 17,
    height: 23,
    tintColor: '#666',
    marginRight: 20,
    marginLeft: 5,
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
  languageIndicator: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  languageText: {
    fontSize: 13,
    color: '#000',
    fontWeight: '600',
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