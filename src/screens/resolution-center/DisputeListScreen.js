import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import disputeService from '../../services/disputeService';

const DisputeListScreen = ({ navigation }) => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadDisputes();
  }, [filter]);

  const loadDisputes = async () => {
    try {
      const filters = filter !== 'all' ? { status: filter } : {};
      const response = await disputeService.getUserDisputes(filters);
      setDisputes(response.data);
    } catch (error) {
      console.error('Error loading disputes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDisputes();
  };

  const renderDisputeCard = ({ item }) => {
    const statusInfo = disputeService.formatDisputeStatus(item.status);
    const disputeType = disputeService.formatDisputeType(item.dispute_type);

    return (
      <TouchableOpacity
        style={styles.disputeCard}
        onPress={() => navigation.navigate('DisputeDetail', { disputeId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.disputeNumber}>{item.dispute_number}</Text>
            <Text style={styles.disputeType}>{disputeType}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <Text style={styles.statusText}>{statusInfo.label}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.category}>{item.dispute_category}</Text>
          <Text style={styles.adTitle} numberOfLines={1}>
            {item.ad_title}
          </Text>
          {item.negotiation_deadline && item.status === 'negotiation' && (
            <View style={styles.deadlineContainer}>
              <Feather name="clock" size={14} color="#FFA500" />
              <Text style={styles.deadline}>
                {disputeService.calculateTimeRemaining(item.negotiation_deadline)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.metaItem}>
            <Feather name="message-square" size={16} color="#666" />
            <Text style={styles.metaText}>{item.message_count || 0} messages</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="paperclip" size={16} color="#666" />
            <Text style={styles.metaText}>{item.evidence_count || 0} files</Text>
          </View>
          <Text style={styles.date}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterButton = (label, value) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === value && styles.filterButtonActive]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filter === value && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4169E1" />
        </View>
      </SafeScreenContainer>
    );
  }

  return (
    <SafeScreenContainer>
      <View style={styles.container}>
        {/* Filter Buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {renderFilterButton('All', 'all')}
          {renderFilterButton('Pending', 'pending')}
          {renderFilterButton('Under Review', 'under_review')}
          {renderFilterButton('Negotiation', 'negotiation')}
          {renderFilterButton('Resolved', 'resolved')}
        </ScrollView>

        {/* Dispute List */}
        <FlatList
          data={disputes}
          renderItem={renderDisputeCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="inbox" size={64} color="#CCC" />
              <Text style={styles.emptyTitle}>No Disputes Found</Text>
              <Text style={styles.emptyText}>
                {filter === 'all'
                  ? "You haven't created any disputes yet"
                  : `No disputes with status: ${filter}`}
              </Text>
              {filter === 'all' && (
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => navigation.navigate('DisputeCategory')}
                >
                  <Text style={styles.createButtonText}>Create New Dispute</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </View>
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#F5F5F5',
  },
  filterButtonActive: {
    backgroundColor: '#4169E1',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFF',
  },
  listContainer: {
    padding: 15,
  },
  disputeCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  disputeNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  disputeType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 12,
  },
  category: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  adTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  deadline: {
    fontSize: 12,
    color: '#FFA500',
    marginLeft: 6,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginLeft: 'auto',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  createButton: {
    backgroundColor: '#4169E1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DisputeListScreen;