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
import supportService from '../../services/supportService';

const AppealStatusScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { appealId } = route.params;
  const [appeal, setAppeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAppeal();
  }, []);

  const loadAppeal = async () => {
    try {
      const response = await supportService.getAppealById(appealId);
      setAppeal(response.data);
    } catch (error) {
      console.error('Error loading appeal:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAppeal();
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA500',
      under_review: '#4169E1',
      approved: '#32CD32',
      rejected: '#FF4444',
    };
    return colors[status] || '#666';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'clock',
      under_review: 'eye',
      approved: 'check-circle',
      rejected: 'x-circle',
    };
    return icons[status] || 'help-circle';
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

  if (!appeal) {
    return (
      <SafeScreenContainer>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color="#FF4444" />
          <Text style={styles.errorText}>{t('Appeal not found')}</Text>
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
            { backgroundColor: getStatusColor(appeal.status) },
          ]}
        >
          <Feather name={getStatusIcon(appeal.status)} size={32} color="#FFF" />
          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>
              {supportService.formatAppealStatus(appeal.status)}
            </Text>
            <Text style={styles.statusSubtitle}>
              Appeal #{appeal.appeal_number}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timelineCard}>
          <Feather name="clock" size={20} color="#4169E1" />
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>{t('Review Timeline')}</Text>
            <Text style={styles.timelineText}>
              {appeal.status === 'pending' || appeal.status === 'under_review'
                ? `Expected response within ${supportService.getAppealTimeRemaining(
                  appeal.created_at
                )}`
                : `Reviewed on ${new Date(appeal.reviewed_at).toLocaleDateString()}`}
            </Text>
          </View>
        </View>

        {/* Ad Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Ad Information')}</Text>
          <View style={styles.card}>
            <View style={styles.adHeader}>
              {appeal.ad_image && (
                <Image
                  source={{ uri: appeal.ad_image }}
                  style={styles.adImage}
                />
              )}
              <View style={styles.adInfo}>
                <Text style={styles.adTitle} numberOfLines={2}>
                  {appeal.ad_title}
                </Text>
                <Text style={styles.violationType}>
                  Violation: {appeal.violation_type}
                </Text>
                <Text style={styles.deletedDate}>
                  Deleted: {new Date(appeal.ad_deleted_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Appeal Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Appeal Details')}</Text>
          <View style={styles.card}>
            <InfoRow label={t('Submitted')} value={new Date(appeal.created_at).toLocaleString()} />
            <InfoRow label={t('Status')} value={supportService.formatAppealStatus(appeal.status)} />
          </View>
        </View>

        {/* Your Reason */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Your Reason')}</Text>
          <View style={styles.card}>
            <Text style={styles.reasonText}>{appeal.reason}</Text>
          </View>
        </View>

        {/* Your Explanation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Your Explanation')}</Text>
          <View style={styles.card}>
            <Text style={styles.explanationText}>{appeal.explanation}</Text>
          </View>
        </View>

        {/* Evidence */}
        {appeal.evidence && appeal.evidence.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Evidence Submitted')}</Text>
            <View style={styles.card}>
              <Text style={styles.evidenceCount}>
                {appeal.evidence.length} file{appeal.evidence.length > 1 ? 's' : ''}{' '}
                attached
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {appeal.evidence.map((file, index) => (
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

        {/* Admin Decision */}
        {(appeal.status === 'approved' || appeal.status === 'rejected') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Decision')}</Text>
            <View
              style={[
                styles.card,
                styles.decisionCard,
                {
                  borderLeftColor: getStatusColor(appeal.status),
                  backgroundColor:
                    appeal.status === 'approved' ? '#E8F5E9' : '#FFEBEE',
                },
              ]}
            >
              <View style={styles.decisionHeader}>
                <Feather
                  name={appeal.status === 'approved' ? 'check-circle' : 'x-circle'}
                  size={24}
                  color={getStatusColor(appeal.status)}
                />
                <Text
                  style={[
                    styles.decisionTitle,
                    { color: getStatusColor(appeal.status) },
                  ]}
                >
                  Appeal {appeal.status === 'approved' ? 'Approved' : 'Rejected'}
                </Text>
              </View>

              {appeal.admin_response && (
                <Text style={styles.decisionText}>{appeal.admin_response}</Text>
              )}

              <Text style={styles.decisionDate}>
                Decided on {new Date(appeal.reviewed_at).toLocaleString()}
              </Text>

              {appeal.status === 'approved' && (
                <View style={styles.approvedNotice}>
                  <Feather name="info" size={16} color="#32CD32" />
                  <Text style={styles.approvedNoticeText}>{t('Your ad has been restored and is now live again.')}</Text>
                </View>
              )}

              {appeal.status === 'rejected' && (
                <View style={styles.rejectedNotice}>
                  <Feather name="info" size={16} color="#FF4444" />
                  <Text style={styles.rejectedNoticeText}>{t("The original decision stands. Please review our policies to avoid future violations.")}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Info Card */}
        {(appeal.status === 'pending' || appeal.status === 'under_review') && (
          <View style={styles.infoCard}>
            <Feather name="info" size={20} color="#4169E1" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>{t("What's Next?")}</Text>
              <Text style={styles.infoText}>
                • Our team is reviewing your appeal{'\n'}
                • This usually takes 48-72 hours{'\n'}
                • You'll be notified of the decision{'\n'}
                • Check back here for updates
              </Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {appeal.status === 'approved' && (
            <TouchableOpacity
              style={styles.viewAdButton}
              onPress={() => navigation.navigate('MyAds')}
            >
              <Text style={styles.viewAdButtonText}>{t('View My Ads')}</Text>
            </TouchableOpacity>
          )}

          {appeal.status === 'rejected' && (
            <TouchableOpacity
              style={styles.policiesButton}
              onPress={() => navigation.navigate('PolicySelection')}
            >
              <Text style={styles.policiesButtonText}>{t('Review Community Guidelines')}</Text>
            </TouchableOpacity>
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
  adHeader: {
    flexDirection: 'row',
  },
  adImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  adInfo: {
    marginLeft: 15,
    flex: 1,
  },
  adTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  violationType: {
    fontSize: 14,
    color: '#FF4444',
    marginTop: 5,
    fontWeight: '600',
  },
  deletedDate: {
    fontSize: 12,
    color: '#999',
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
  reasonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    lineHeight: 24,
  },
  explanationText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  evidenceCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  evidenceImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#F0F0F0',
  },
  decisionCard: {
    borderLeftWidth: 4,
  },
  decisionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  decisionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  decisionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 10,
  },
  decisionDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  approvedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#32CD32',
  },
  approvedNoticeText: {
    fontSize: 14,
    color: '#32CD32',
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  rejectedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  rejectedNoticeText: {
    fontSize: 14,
    color: '#FF4444',
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
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
  actionsContainer: {
    padding: 15,
  },
  viewAdButton: {
    backgroundColor: '#32CD32',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewAdButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  policiesButton: {
    backgroundColor: '#4169E1',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  policiesButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AppealStatusScreen;