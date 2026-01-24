import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/TranslationContext';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import supportService from '../../services/supportService';

const SupportTicketListScreen = ({ navigation }) => {
    const { t } = useTranslation();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, open, closed

  useEffect(() => {
    loadTickets();
  }, [filter]);

  const loadTickets = async () => {
    try {
      const response = await supportService.getSupportTickets(
        filter === 'all' ? undefined : filter
      );
      setTickets(response.data);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTickets();
  };

  const getStatusColor = (status) => {
    const colors = {
      open: '#FFA500',
      in_progress: '#4169E1',
      resolved: '#32CD32',
      closed: '#666',
    };
    return colors[status] || '#666';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#32CD32',
      medium: '#FFA500',
      high: '#FF6347',
      urgent: '#FF0000',
    };
    return colors[priority] || '#666';
  };

  const renderTicket = ({ item }) => (
    <TouchableOpacity
      style={styles.ticketCard}
      onPress={() => navigation.navigate('TicketDetail', { ticketId: item.id })}
    >
      <View style={styles.ticketHeader}>
        <View style={styles.ticketNumber}>
          <Feather name="hash" size={16} color="#666" />
          <Text style={styles.ticketNumberText}>{item.ticket_number}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(item.status)}20` },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {supportService.formatTicketStatus(item.status)}
          </Text>
        </View>
      </View>

      <Text style={styles.ticketSubject} numberOfLines={2}>
        {item.subject}
      </Text>

      <Text style={styles.ticketCategory}>{item.category_name}</Text>

      <View style={styles.ticketFooter}>
        <View style={styles.ticketInfo}>
          <Feather name="clock" size={14} color="#666" />
          <Text style={styles.ticketDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>

        <View
          style={[
            styles.priorityBadge,
            { borderColor: getPriorityColor(item.priority) },
          ]}
        >
          <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
            {item.priority.toUpperCase()}
          </Text>
        </View>

        {item.unread_messages > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread_messages}</Text>
          </View>
        )}
      </View>
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
        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'all' && styles.filterTabTextActive,
              ]}
            >{t('All')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'open' && styles.filterTabActive]}
            onPress={() => setFilter('open')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'open' && styles.filterTabTextActive,
              ]}
            >{t('Open')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'closed' && styles.filterTabActive]}
            onPress={() => setFilter('closed')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'closed' && styles.filterTabTextActive,
              ]}
            >{t('Closed')}</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTicket}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="inbox" size={64} color="#CCC" />
              <Text style={styles.emptyTitle}>{t('No Tickets')}</Text>
              <Text style={styles.emptyText}>{t("You don't have any support tickets yet")}</Text>
            </View>
          }
        />

        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateTicket')}
        >
          <Feather name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
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
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  filterTabActive: {
    backgroundColor: '#4169E1',
  },
  filterTabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#FFF',
  },
  listContainer: {
    padding: 15,
  },
  ticketCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ticketNumber: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 5,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  ticketCategory: {
    fontSize: 14,
    color: '#4169E1',
    marginBottom: 10,
  },
  ticketFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ticketInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ticketDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 10,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  unreadBadge: {
    backgroundColor: '#FF4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  unreadText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4169E1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default SupportTicketListScreen;