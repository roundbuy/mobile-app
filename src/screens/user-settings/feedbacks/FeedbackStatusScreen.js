import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../context/TranslationContext';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { feedbackService } from '../../../services';

const FeedbackStatusScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [activeMainTab, setActiveMainTab] = useState('received'); // 'received', 'given'
  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all', 'pending', 'approved'
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFeedbacks();
  }, [activeMainTab, activeSubTab]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      let data = [];

      if (activeMainTab === 'received') {
        const status = activeSubTab === 'all' ? null : activeSubTab;
        const response = await feedbackService.getMyFeedbacks(50, 0, status);
        data = response.feedbacks || [];
      } else {
        // For given feedbacks, we don't usually filter by status in API yet, but we can filter locally or update API later
        // Currently getGivenFeedbacks returns all
        const response = await feedbackService.getGivenFeedbacks(50, 0);
        data = response.feedbacks || response.data?.feedbacks || [];

        // Local filter for subtabs if needed (though user requirements mainly imply received needs approval)
        // If 'pending' in Given tab, it means I gave it but it's pending approval?
        // Or maybe Given tab doesn't need pending/approved subtabs as critically. 
        // Let's filter locally for now if subtab is active
        if (activeSubTab !== 'all' && Array.isArray(data)) {
          data = data.filter(f => f.status === activeSubTab);
        }
      }

      setFeedbacks(data);
    } catch (error) {
      console.error('Error loading feedbacks:', error);
      Alert.alert(t('Error'), t('Failed to load feedbacks'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFeedbacks();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleActionPress = async (feedback, action) => {
    try {
      if (action === 'APPROVE') {
        await feedbackService.updateFeedbackStatus(feedback.id, 'approved');
        Alert.alert(t('Success'), t('Feedback approved'));
        loadFeedbacks();
      } else if (action === 'DISAPPROVE') {
        await feedbackService.updateFeedbackStatus(feedback.id, 'rejected');
        Alert.alert(t('Success'), t('Feedback disapproved'));
        loadFeedbacks();
      } else if (action === 'EDIT') {
        // Navigate to edit form
        navigation.navigate('GiveFeedbackForm', {
          isEdit: true,
          feedback: feedback
        });
      }
    } catch (error) {
      console.error('Action error:', error);
      Alert.alert(t('Error'), t('Action failed'));
    }
  };

  const isEditable = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const renderFeedbackItem = ({ item }) => {
    const isReceived = activeMainTab === 'received';
    const user = (isReceived ? item.reviewer : item.reviewedUser) || { name: t('Unknown User'), avatar: null };

    // Determine actions based on tab and status
    let actions = [];

    if (isReceived) {
      if (item.status === 'pending') {
        actions.push({ label: t('Approve'), type: 'APPROVE', primary: true });
        actions.push({ label: t('Disapprove'), type: 'DISAPPROVE', primary: false });
      } else {
        // Maybe show status label?
      }
    } else {
      // Given tab
      if (isEditable(item.createdAt)) {
        actions.push({ label: t('Change'), type: 'EDIT', primary: false });
      }
    }

    return (
      <View style={styles.feedbackItem}>
        <View style={styles.itemHeader}>
          <View style={styles.userInfo}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.placeholderAvatar]}>
                <FontAwesome name="user" size={20} color="#666" />
              </View>
            )}
            <View>
              <Text style={styles.username}>{user.name}</Text>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>
            {item.transactionType === 'buy' ? t('Bought') : t('Sold')}: {item.advertisement.title}
          </Text>
        </View>

        <Text style={styles.message}>{item.comment}</Text>

        <View style={styles.statusRow}>
          <View style={[styles.statusBadge,
          item.status === 'approved' ? styles.statusApproved :
            item.status === 'rejected' ? styles.statusRejected : styles.statusPending]}>
            <Text style={styles.statusText}>{t(item.status ? item.status.toUpperCase() : 'PENDING')}</Text>
          </View>

          <View style={styles.actionsContainer}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionButton, action.primary ? styles.actionButtonPrimary : styles.actionButtonSecondary]}
                onPress={() => handleActionPress(item, action.type)}
              >
                <Text style={[styles.actionButtonText, action.primary ? styles.primaryText : styles.secondaryText]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Feedback')}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Main Tabs (Received / Given) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeMainTab === 'received' && styles.activeTab]}
          onPress={() => setActiveMainTab('received')}
        >
          <Text style={[styles.tabText, activeMainTab === 'received' && styles.activeTabText]}>
            {t('Received')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeMainTab === 'given' && styles.activeTab]}
          onPress={() => setActiveMainTab('given')}
        >
          <Text style={[styles.tabText, activeMainTab === 'given' && styles.activeTabText]}>
            {t('Given')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sub Tabs (All / Pending / Done) */}
      <View style={styles.subTabContainer}>
        <TouchableOpacity
          style={[styles.subTab, activeSubTab === 'all' && styles.activeSubTab]}
          onPress={() => setActiveSubTab('all')}
        >
          <Text style={[styles.subTabText, activeSubTab === 'all' && styles.activeSubTabText]}>{t('All')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.subTab, activeSubTab === 'pending' && styles.activeSubTab]}
          onPress={() => setActiveSubTab('pending')}
        >
          <Text style={[styles.subTabText, activeSubTab === 'pending' && styles.activeSubTabText]}>{t('Pending')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.subTab, activeSubTab === 'approved' && styles.activeSubTab]}
          onPress={() => setActiveSubTab('approved')}
        >
          <Text style={[styles.subTabText, activeSubTab === 'approved' && styles.activeSubTabText]}>{t('Approved')}</Text>
        </TouchableOpacity>
      </View>

      {/* Feedbacks List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={feedbacks}
          renderItem={renderFeedbackItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {t('No feedbacks found')}
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
  subTabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 16,
  },
  subTab: {
    marginRight: 24,
    paddingVertical: 12,
  },
  activeSubTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  subTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
  },
  activeSubTabText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  feedbackItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  placeholderAvatar: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: '700',
    color: '#000',
  },
  productInfo: {
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  message: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusApproved: {
    backgroundColor: '#E8F5E9',
  },
  statusRejected: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  actionButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  actionButtonSecondary: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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