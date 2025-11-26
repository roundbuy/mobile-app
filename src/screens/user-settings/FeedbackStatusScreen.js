import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const FeedbackStatusScreen = ({ navigation, route }) => {
  const { product } = route.params;
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'done'

  const handleBack = () => {
    navigation.goBack();
  };

  // Sample data - replace with actual API data
  const [feedbacks, setFeedbacks] = useState([
    {
      id: '1',
      username: 'HandsOm',
      message: 'The product is beautiful.',
      status: 'pending',
      action: 'GIVE FEEDBACK',
    },
    {
      id: '2',
      username: 'RobRoy',
      message: 'The product is beautiful.',
      status: 'pending',
      action: 'CHANGE',
    },
    {
      id: '3',
      username: 'RBtester',
      message: 'The product is beautiful.',
      status: 'pending',
      action: 'CHANGE',
    },
    {
      id: '4',
      username: 'BonnyA',
      message: 'The product is beautiful.',
      status: 'done',
      action: 'DONE',
    },
    {
      id: '5',
      username: 'RaviV',
      message: 'The product is beautiful.',
      status: 'done',
      action: 'DONE',
    },
    {
      id: '6',
      username: 'Gush11',
      message: 'The product is beautiful.',
      status: 'done',
      action: 'DONE',
    },
    {
      id: '7',
      username: 'MatterStand2',
      message: 'The product is beautiful.',
      status: 'done',
      action: 'DONE',
    },
  ]);

  const getFilteredFeedbacks = () => {
    if (activeTab === 'all') return feedbacks;
    return feedbacks.filter(f => f.status === activeTab);
  };

  const handleActionPress = (feedback) => {
    if (feedback.action === 'GIVE FEEDBACK') {
      navigation.navigate('GiveFeedbackForm', { product, user: feedback });
    } else if (feedback.action === 'CHANGE') {
      navigation.navigate('GiveFeedbackForm', { product, user: feedback, isEdit: true });
    }
  };

  const renderFeedbackItem = ({ item }) => (
    <View style={styles.feedbackItem}>
      <View style={styles.feedbackLeft}>
        <View style={styles.avatar}>
          <FontAwesome name="user-circle" size={40} color={COLORS.primary} />
        </View>
        <View style={styles.feedbackInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.message}>{item.message}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.actionButton,
          item.status === 'done' && styles.actionButtonDone
        ]}
        onPress={() => handleActionPress(item)}
        activeOpacity={0.7}
        disabled={item.status === 'done'}
      >
        <Text style={[
          styles.actionButtonText,
          item.status === 'done' && styles.actionButtonTextDone
        ]}>
          {item.action}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Feedback Status</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'done' && styles.activeTab]}
          onPress={() => setActiveTab('done')}
        >
          <Text style={[styles.tabText, activeTab === 'done' && styles.activeTabText]}>
            Done
          </Text>
        </TouchableOpacity>
      </View>

      {/* Feedbacks List */}
      <FlatList
        data={getFilteredFeedbacks()}
        renderItem={renderFeedbackItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              No {activeTab} feedbacks found
            </Text>
          </View>
        }
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
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
    color: COLORS.primary,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  feedbackItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  feedbackLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: 12,
  },
  feedbackInfo: {
    flex: 1,
  },
  username: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: '#666',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  actionButtonDone: {
    backgroundColor: 'transparent',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  actionButtonTextDone: {
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});

export default FeedbackStatusScreen;