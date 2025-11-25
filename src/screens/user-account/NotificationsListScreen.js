import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const NotificationsListScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('notifications'); // 'notifications' or 'chat'
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Buyer', 'Seller', 'Promo', 'Reco'];

  const notificationData = [
    {
      id: 1,
      type: 'Buyer',
      title: 'Buyer',
      message: 'Hi! I would be interested of the shoe package. You stil have two pairs?',
      time: '2h ago',
      read: false,
    },
    {
      id: 2,
      type: 'Seller',
      title: 'Limited offer! Visibility Ads',
      message: 'Get 5 x new Green users, and earn reward 2 x Visibility Ads to boost your sales.',
      time: '2h ago',
      read: false,
    },
    {
      id: 3,
      type: 'Buyer',
      title: 'Order Confirmed',
      message: 'We have processed your order of a new membership upgrade, Gold plan. See the new features available...',
      time: '3h ago',
      read: false,
    },
    {
      id: 4,
      type: 'Seller',
      title: 'Payment Received',
      message: 'Great news! We received payment of £3.00 for your order which is succesfully processed. You can now...',
      time: '4h ago',
      read: false,
    },
    {
      id: 5,
      type: 'Seller',
      title: 'Diligent Seller',
      message: 'Congratulations! You have now earned the reward, Diligent Seller, for selling 10 products at RoundBy.',
      time: '5h ago',
      read: false,
    },
    {
      id: 6,
      type: 'Promo',
      title: 'Almost Gone',
      message: 'Limited-time offer! Enjoy 45% off on selected products. Non\'t miss out! Shop now before it\'s too late',
      time: '6h ago',
      read: false,
    },
    {
      id: 7,
      type: 'Reco',
      title: 'Locations',
      message: 'Increase your sales! Go to your user account and check that you are using all 9 product locations to',
      time: '12h ago',
      read: false,
    },
  ];

  const chatData = [
    {
      id: 1,
      username: 'RobMay',
      message: 'Hi! I would be interested of the shoe package. You stil have two pairs?',
      time: '2h ago',
      read: false,
    },
    {
      id: 2,
      username: 'Evenings',
      message: 'Tell me a nice. Still have it?',
      time: '2h ago',
      read: false,
    },
    {
      id: 3,
      username: 'TimeLine88',
      message: 'I get the meal tool for you! Please view the images I send tyo you. You will not think twice...',
      time: '3h ago',
      read: false,
    },
    {
      id: 4,
      username: 'ProveDance1',
      message: 'Here is my last offer £300, no more no less. Check my',
      time: '4h ago',
      read: false,
    },
    {
      id: 5,
      username: 'Quai11',
      message: 'Ihave had it for five years now, and hardly ever used it. If you wonder why I am selling it, it is because...',
      time: '5h ago',
      read: false,
    },
    {
      id: 6,
      username: 'MattenRand2',
      message: 'This size is limited! One down partners.',
      time: '6h ago',
      read: false,
    },
    {
      id: 7,
      username: 'Tomatomator',
      message: 'Ok, see you tomorrow. Around 12.00 I shall come to the location to exchange the products.',
      time: '12h ago',
      read: false,
    },
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity style={styles.notificationItem} activeOpacity={0.7}>
      <View style={styles.notificationDot} />
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationTime}>{item.time}</Text>
        </View>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderChatItem = ({ item }) => (
    <TouchableOpacity style={styles.notificationItem} activeOpacity={0.7}>
      <View style={styles.notificationDot} />
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{item.username}</Text>
          <Text style={styles.notificationTime}>{item.time}</Text>
        </View>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
          <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>
            Notifications
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>
            Chat
          </Text>
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
      <FlatList
        data={activeTab === 'notifications' ? notificationData : chatData}
        renderItem={activeTab === 'notifications' ? renderNotificationItem : renderChatItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  },
  filtersContent: {
    padding: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
});

export default NotificationsListScreen;