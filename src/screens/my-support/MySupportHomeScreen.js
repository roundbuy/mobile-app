import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import supportService from '../../services/supportService';

const MySupportHomeScreen = ({ navigation }) => {
  const [ticketStats, setTicketStats] = useState(null);
  const [appealStats, setAppealStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ticketResponse, appealResponse] = await Promise.all([
        supportService.getTicketStats(),
        supportService.getAppealStats(),
      ]);
      setTicketStats(ticketResponse.data);
      setAppealStats(appealResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

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
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Support</Text>
          <Text style={styles.subtitle}>
            Get help and manage your support requests
          </Text>
        </View>

        {/* Statistics Overview */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="inbox"
            label="Open Tickets"
            count={ticketStats?.open || 0}
            color="#4169E1"
          />
          <StatCard
            icon="clock"
            label="In Progress"
            count={ticketStats?.in_progress || 0}
            color="#FFA500"
          />
          <StatCard
            icon="check-circle"
            label="Resolved"
            count={ticketStats?.resolved || 0}
            color="#32CD32"
          />
        </View>

        {/* Support Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support Categories</Text>

          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => navigation.navigate('DeletedAds')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#FFE5E5' }]}>
              <Feather name="trash-2" size={24} color="#DC143C" />
            </View>
            <View style={styles.categoryContent}>
              <Text style={styles.categoryTitle}>Deleted Ads</Text>
              <Text style={styles.categorySubtitle}>
                {appealStats?.total_deleted || 0} deleted ads •{' '}
                {appealStats?.can_appeal || 0} can appeal
              </Text>
            </View>
            <Feather name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() =>
              navigation.navigate('SupportTicketList', { category: 'ad_appeal' })
            }
          >
            <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
              <Feather name="alert-circle" size={24} color="#FFA500" />
            </View>
            <View style={styles.categoryContent}>
              <Text style={styles.categoryTitle}>Ad Appeals</Text>
              <Text style={styles.categorySubtitle}>
                {appealStats?.pending || 0} pending appeals
              </Text>
            </View>
            <Feather name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => navigation.navigate('SupportTicketList')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
              <Feather name="help-circle" size={24} color="#4169E1" />
            </View>
            <View style={styles.categoryContent}>
              <Text style={styles.categoryTitle}>Support Tickets</Text>
              <Text style={styles.categorySubtitle}>
                {ticketStats?.total_tickets || 0} total tickets
              </Text>
            </View>
            <Feather name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() =>
              navigation.navigate('SupportTicketList', { category: 'technical' })
            }
          >
            <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
              <Feather name="tool" size={24} color="#9C27B0" />
            </View>
            <View style={styles.categoryContent}>
              <Text style={styles.categoryTitle}>Technical Issues</Text>
              <Text style={styles.categorySubtitle}>
                Get help with technical problems
              </Text>
            </View>
            <Feather name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() =>
              navigation.navigate('SupportTicketList', { category: 'billing' })
            }
          >
            <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
              <Feather name="credit-card" size={24} color="#4CAF50" />
            </View>
            <View style={styles.categoryContent}>
              <Text style={styles.categoryTitle}>Billing & Payments</Text>
              <Text style={styles.categorySubtitle}>
                Payment and subscription help
              </Text>
            </View>
            <Feather name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Create New Ticket Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateTicket')}
        >
          <Feather name="plus-circle" size={24} color="#FFF" />
          <Text style={styles.createButtonText}>Create New Support Ticket</Text>
        </TouchableOpacity>

        {/* Help Info */}
        <View style={styles.infoCard}>
          <Feather name="info" size={20} color="#4169E1" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Need Quick Help?</Text>
            <Text style={styles.infoText}>
              • Check our FAQ for common questions{'\n'}
              • Response time: 24-48 hours{'\n'}
              • Critical issues handled within 24 hours{'\n'}
              • Appeal deleted ads within 30 days
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeScreenContainer>
  );
};

const StatCard = ({ icon, label, count, color }) => (
  <View style={styles.statCard}>
    <Feather name={icon} size={28} color={color} />
    <Text style={styles.statCount}>{count}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

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
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    justifyContent: 'space-around',
  },
  statCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  categoryCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContent: {
    flex: 1,
    marginLeft: 15,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  categorySubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },
  createButton: {
    backgroundColor: '#4169E1',
    padding: 18,
    margin: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  infoCard: {
    backgroundColor: '#FFF',
    padding: 15,
    margin: 15,
    marginTop: 0,
    borderRadius: 12,
    flexDirection: 'row',
    borderLeftWidth: 4,
    borderLeftColor: '#4169E1',
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});

export default MySupportHomeScreen;