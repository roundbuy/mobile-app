import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/TranslationContext';
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

const TicketDetailScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
  const { ticketId } = route.params;
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTicket();
  }, []);

  const loadTicket = async () => {
    try {
      const response = await supportService.getSupportTicketById(ticketId);
      setTicket(response.data);
    } catch (error) {
      console.error('Error loading ticket:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTicket();
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

  const getStatusIcon = (status) => {
    const icons = {
      open: 'clock',
      in_progress: 'trending-up',
      resolved: 'check-circle',
      closed: 'x-circle',
    };
    return icons[status] || 'help-circle';
  };

  const handleSendMessage = () => {
    navigation.navigate('TicketMessaging', { ticketId: ticket.id });
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

  if (!ticket) {
    return (
      <SafeScreenContainer>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color="#FF4444" />
          <Text style={styles.errorText}>{t('Ticket not found')}</Text>
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
        {/* Status Header */}
        <View
          style={[
            styles.statusHeader,
            { backgroundColor: getStatusColor(ticket.status) },
          ]}
        >
          <Feather name={getStatusIcon(ticket.status)} size={32} color="#FFF" />
          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>
              {supportService.formatTicketStatus(ticket.status)}
            </Text>
            <Text style={styles.statusSubtitle}>
              Ticket #{ticket.ticket_number}
            </Text>
          </View>
        </View>

        {/* Ticket Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Ticket Information')}</Text>
          <View style={styles.card}>
            <InfoRow label={t('Category')} value={ticket.category_name} />
            <InfoRow
              label={t('Priority')}
              value={ticket.priority.toUpperCase()}
              valueColor={getPriorityColor(ticket.priority)}
            />
            <InfoRow
              label={t('Created')}
              value={new Date(ticket.created_at).toLocaleString()}
            />
            {ticket.updated_at !== ticket.created_at && (
              <InfoRow
                label={t('Last Updated')}
                value={new Date(ticket.updated_at).toLocaleString()}
              />
            )}
          </View>
        </View>

        {/* Subject */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Subject')}</Text>
          <View style={styles.card}>
            <Text style={styles.subjectText}>{ticket.subject}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Description')}</Text>
          <View style={styles.card}>
            <Text style={styles.descriptionText}>{ticket.description}</Text>
          </View>
        </View>

        {/* Admin Response */}
        {ticket.admin_response && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Support Response')}</Text>
            <View style={[styles.card, styles.responseCard]}>
              <View style={styles.responseHeader}>
                <Feather name="shield" size={20} color="#4169E1" />
                <Text style={styles.responseTitle}>{t('Support Team')}</Text>
              </View>
              <Text style={styles.descriptionText}>{ticket.admin_response}</Text>
              <Text style={styles.responseDate}>
                {new Date(ticket.response_date).toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        {/* Resolution Details */}
        {ticket.status === 'resolved' && ticket.resolution && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Resolution')}</Text>
            <View style={[styles.card, styles.resolvedCard]}>
              <View style={styles.resolvedHeader}>
                <Feather name="check-circle" size={24} color="#32CD32" />
                <Text style={styles.resolvedTitle}>{t('Ticket Resolved')}</Text>
              </View>
              <Text style={styles.descriptionText}>{ticket.resolution}</Text>
              <Text style={styles.resolvedDate}>
                Resolved on {new Date(ticket.resolved_at).toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        {/* Messages Count */}
        {ticket.message_count > 0 && (
          <View style={styles.messagesCard}>
            <Feather name="message-circle" size={20} color="#4169E1" />
            <View style={styles.messagesContent}>
              <Text style={styles.messagesTitle}>
                {ticket.message_count} message{ticket.message_count > 1 ? 's' : ''}
              </Text>
              {ticket.unread_messages > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>
                    {ticket.unread_messages} new
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {['open', 'in_progress'].includes(ticket.status) && (
            <TouchableOpacity
              style={styles.messageButton}
              onPress={handleSendMessage}
            >
              <Feather name="message-circle" size={20} color="#FFF" />
              <Text style={styles.messageButtonText}>{t('View Messages')}</Text>
            </TouchableOpacity>
          )}

          {ticket.status === 'resolved' && (
            <View style={styles.resolvedBanner}>
              <Feather name="check-circle" size={24} color="#32CD32" />
              <Text style={styles.resolvedBannerText}>{t('This ticket has been resolved')}</Text>
            </View>
          )}

          {ticket.status === 'closed' && (
            <View style={styles.closedBanner}>
              <Feather name="x-circle" size={24} color="#666" />
              <Text style={styles.closedBannerText}>{t('This ticket is closed')}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeScreenContainer>
  );
};

const InfoRow = ({ label, value, valueColor }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={[styles.infoValue, valueColor && { color: valueColor }]}>
      {value}
    </Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
  },
  statusHeader: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusContent: {
    marginLeft: 15,
    flex: 1,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statusSubtitle: {
    fontSize: 16,
    color: '#FFF',
    marginTop: 5,
    opacity: 0.9,
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  subjectText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    lineHeight: 26,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  responseCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4169E1',
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4169E1',
    marginLeft: 8,
  },
  responseDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
    textAlign: 'right',
  },
  resolvedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#32CD32',
    backgroundColor: '#E8F5E9',
  },
  resolvedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  resolvedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#32CD32',
    marginLeft: 10,
  },
  resolvedDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
    textAlign: 'right',
  },
  messagesCard: {
    backgroundColor: '#FFF',
    padding: 15,
    margin: 15,
    marginTop: 0,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#4169E1',
  },
  messagesContent: {
    marginLeft: 15,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messagesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  unreadBadge: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unreadText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionsContainer: {
    padding: 15,
  },
  messageButton: {
    backgroundColor: '#4169E1',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  resolvedBanner: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#32CD32',
  },
  resolvedBannerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#32CD32',
    marginLeft: 10,
  },
  closedBanner: {
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#999',
  },
  closedBannerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginLeft: 10,
  },
});

export default TicketDetailScreen;