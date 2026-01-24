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
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import disputeService from '../../services/disputeService';

const DisputeDetailScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
  const { disputeId } = route.params;
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDispute();
  }, []);

  const loadDispute = async () => {
    try {
      const response = await disputeService.getDisputeById(disputeId);
      setDispute(response.data);
    } catch (error) {
      console.error('Error loading dispute:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDispute();
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA500',
      under_review: '#4169E1',
      negotiating: '#9370DB',
      resolved: '#32CD32',
      escalated: '#FF6347',
      closed: '#666',
    };
    return colors[status] || '#666';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'clock',
      under_review: 'eye',
      negotiating: 'message-circle',
      resolved: 'check-circle',
      escalated: 'alert-triangle',
      closed: 'x-circle',
    };
    return icons[status] || 'help-circle';
  };

  const handleSendMessage = () => {
    navigation.navigate('DisputeMessaging', { disputeId: dispute.id });
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

  if (!dispute) {
    return (
      <SafeScreenContainer>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color="#FF4444" />
          <Text style={styles.errorText}>{t('Dispute not found')}</Text>
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
        <View style={[
          styles.statusHeader,
          { backgroundColor: getStatusColor(dispute.status) }
        ]}>
          <Feather 
            name={getStatusIcon(dispute.status)} 
            size={32} 
            color="#FFF" 
          />
          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>
              {disputeService.formatDisputeStatus(dispute.status)}
            </Text>
            <Text style={styles.statusSubtitle}>
              Case #{dispute.dispute_number}
            </Text>
          </View>
        </View>

        {/* Timeline Info */}
        {dispute.deadline && (
          <View style={styles.timelineCard}>
            <Feather name="clock" size={20} color="#4169E1" />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>{t('Response Deadline')}</Text>
              <Text style={styles.timelineText}>
                {disputeService.getTimeRemaining(dispute.deadline)}
              </Text>
            </View>
          </View>
        )}

        {/* Order Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Order Details')}</Text>
          <View style={styles.card}>
            <View style={styles.orderHeader}>
              {dispute.product_image && (
                <Image
                  source={{ uri: dispute.product_image }}
                  style={styles.productImage}
                />
              )}
              <View style={styles.orderInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {dispute.product_name}
                </Text>
                <Text style={styles.orderNumber}>
                  Order #{dispute.order_number}
                </Text>
                <Text style={styles.orderAmount}>
                  ${dispute.order_amount}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Dispute Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Dispute Information')}</Text>
          <View style={styles.card}>
            <InfoRow label={t('Category')} value={dispute.category_name} />
            <InfoRow label={t('Problem')} value={dispute.problem_name} />
            <InfoRow 
              label={t('Created')} 
              value={new Date(dispute.created_at).toLocaleDateString()} 
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Your Description')}</Text>
          <View style={styles.card}>
            <Text style={styles.descriptionText}>{dispute.description}</Text>
          </View>
        </View>

        {/* Expected Resolution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Expected Resolution')}</Text>
          <View style={styles.card}>
            <Text style={styles.descriptionText}>
              {dispute.expected_resolution}
            </Text>
          </View>
        </View>

        {/* Evidence */}
        {dispute.evidence && dispute.evidence.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Evidence')}</Text>
            <View style={styles.card}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {dispute.evidence.map((file, index) => (
                  <Image
                    key={index}
                    source={{ uri: file.url }}
                    style={styles.evidenceImage}
                  />
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Admin Response */}
        {dispute.admin_response && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Admin Response')}</Text>
            <View style={[styles.card, styles.adminCard]}>
              <Text style={styles.descriptionText}>
                {dispute.admin_response}
              </Text>
              <Text style={styles.responseDate}>
                {new Date(dispute.response_date).toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {['pending', 'under_review', 'negotiating'].includes(dispute.status) && (
            <TouchableOpacity
              style={styles.messageButton}
              onPress={handleSendMessage}
            >
              <Feather name="message-circle" size={20} color="#FFF" />
              <Text style={styles.messageButtonText}>{t('Send Message')}</Text>
            </TouchableOpacity>
          )}

          {dispute.status === 'resolved' && (
            <View style={styles.resolvedBanner}>
              <Feather name="check-circle" size={24} color="#32CD32" />
              <Text style={styles.resolvedText}>{t('This dispute has been resolved')}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeScreenContainer>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
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
  timelineCard: {
    backgroundColor: '#FFF',
    padding: 15,
    margin: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#4169E1',
  },
  timelineContent: {
    marginLeft: 15,
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    color: '#666',
  },
  timelineText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 3,
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
  orderHeader: {
    flexDirection: 'row',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  orderInfo: {
    marginLeft: 15,
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  orderNumber: {
    fontSize: 14,
    color: '#4169E1',
    marginTop: 5,
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#32CD32',
    marginTop: 5,
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
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  evidenceImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#F0F0F0',
  },
  adminCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4169E1',
  },
  responseDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
    textAlign: 'right',
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
  resolvedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#32CD32',
    marginLeft: 10,
  },
});

export default DisputeDetailScreen;