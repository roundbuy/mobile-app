import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../context/TranslationContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../../../context/NotificationContext';
import messagingService from '../../../services/messagingService';
import { COLORS } from '../../../constants/theme';

const NotificationsListScreen = ({ navigation }) => {
    const { t } = useTranslation();
  const {
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('notifications'); // 'notifications' or 'chat'
  const [activeFilter, setActiveFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);

  const filters = ['All', 'Buyer', 'Seller', 'Promo', 'Reco'];

  useEffect(() => {
    loadNotifications();
    if (activeTab === 'chat') {
      loadConversations();
    }
  }, [activeTab]);

  const loadConversations = async () => {
    try {
      setConversationsLoading(true);
      const response = await messagingService.getConversations();
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setConversationsLoading(false);
    }
  };

  const loadNotifications = async () => {
    await fetchNotifications();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'chat') {
      await loadConversations();
    } else {
      await loadNotifications();
    }
    setRefreshing(false);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNotificationPress = async (notification) => {
    // Mark as read
    if (!notification.is_read) {
      await markAsRead(notification.user_notification_id);
    }

    // Handle navigation based on notification type
    if (notification.action_type && notification.action_data) {
      handleAction(notification.action_type, notification.action_data);
    }
  };

  const handleAction = (actionType, actionData) => {
    if (actionType === 'open_screen' && actionData.screen) {
      navigation.navigate(actionData.screen, actionData.params || {});
    }
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;

    // Filter by tab
    if (activeTab === 'chat') {
      // Chat tab - show only chat-related notifications
      filtered = filtered.filter(n =>
        ['new_message', 'offer_received', 'offer_accepted', 'offer_rejected', 'offer_counter'].includes(n.type)
      );
    } else {
      // Notifications tab - exclude chat notifications
      filtered = filtered.filter(n =>
        !['new_message', 'offer_received', 'offer_accepted', 'offer_rejected', 'offer_counter'].includes(n.type)
      );

      // Apply sub-filters for notifications tab
      if (activeFilter !== 'All') {
        // Map filter to notification types
        const filterTypeMap = {
          'Buyer': ['buyer_message', 'buyer_offer', 'order_confirmed'],
          'Seller': ['seller_message', 'payment_received', 'seller_reward'],
          'Promo': ['promo', 'limited_offer', 'discount'],
          'Reco': ['recommendation', 'location_tip', 'feature_tip'],
        };

        const types = filterTypeMap[activeFilter] || [];
        if (types.length > 0) {
          filtered = filtered.filter(n => types.includes(n.type));
        }
      }
    }

    return filtered;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.notificationItem}
      activeOpacity={0.7}
      onPress={() => handleNotificationPress(item)}
    >
      {!item.is_read && <View style={styles.notificationDot} />}
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{item.title || 'Notification'}</Text>
          <Text style={styles.notificationTime}>{formatTimestamp(item.created_at)}</Text>
        </View>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message || ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderConversationItem = ({ item }) => {
    const otherUser = item.buyer_id === item.current_user_id ? item.seller : item.buyer;
    const productImage = item.advertisement?.images?.[0] || item.advertisement?.image_url;

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ProductChat', {
          advertisement: item.advertisement,
          conversationId: item.id
        })}
      >
        {productImage && (
          <Image
            source={{ uri: productImage }}
            style={styles.productImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.productTitle} numberOfLines={1}>
              {item.advertisement?.title || 'Product'}
            </Text>
            <Text style={styles.conversationTime}>
              {formatTimestamp(item.last_message_at)}
            </Text>
          </View>
          <Text style={styles.otherUserName} numberOfLines={1}>
            {otherUser?.name || 'User'}
          </Text>
          {item.last_message && (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.last_message}
            </Text>
          )}
        </View>
        {item.unread_count > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{item.unread_count}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerRight} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
          onPress={() => setActiveTab('notifications')}
        >
          <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>{t('Notifications')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>{t('Chat')}</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {activeTab === 'notifications' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                activeFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === filter && styles.filterChipTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {activeTab === 'chat' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {['All', 'New', 'Old'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                activeFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === filter && styles.filterChipTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Notifications/Chat List */}
      {(activeTab === 'chat' ? conversationsLoading : loading) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={activeTab === 'chat' ? conversations : getFilteredNotifications()}
          renderItem={activeTab === 'chat' ? renderConversationItem : renderNotificationItem}
          keyExtractor={(item) => activeTab === 'chat' ? item.id?.toString() : (item.user_notification_id?.toString() || item.id?.toString())}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name={activeTab === 'chat' ? "chatbubbles-outline" : "notifications-off-outline"}
                size={64}
                color="#D1D5DB"
              />
              <Text style={styles.emptyText}>
                {activeTab === 'chat' ? 'No conversations yet' : 'No notifications yet'}
              </Text>
              <Text style={styles.emptySubtext}>
                {activeTab === 'chat'
                  ? 'Start chatting with buyers and sellers to see your conversations here'
                  : "You'll see notifications here when you receive them"
                }
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerRight: {
    width: 32,
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
    borderBottomColor: COLORS.primary,
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
  filtersContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    maxHeight: 60,
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    marginTop: 4,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  conversationItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f5f5f5',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  conversationTime: {
    fontSize: 12,
    color: '#999',
  },
  otherUserName: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 14,
    color: '#999',
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default NotificationsListScreen;