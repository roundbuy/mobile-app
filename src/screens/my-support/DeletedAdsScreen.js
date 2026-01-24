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
  Image,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import supportService from '../../services/supportService';

const DeletedAdsScreen = ({ navigation }) => {
    const { t } = useTranslation();
  const [deletedAds, setDeletedAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDeletedAds();
  }, []);

  const loadDeletedAds = async () => {
    try {
      const response = await supportService.getDeletedAds();
      setDeletedAds(response.data);
    } catch (error) {
      console.error('Error loading deleted ads:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDeletedAds();
  };

  const handleAppeal = (ad) => {
    if (ad.can_appeal) {
      navigation.navigate('AdAppeal', { adId: ad.id });
    } else {
      Alert.alert(
        t('Cannot Appeal'),
        t('The appeal window for this ad has expired or an appeal has already been submitted.'),
        [{ text: t('OK') }]
      );
    }
  };

  const getReasonColor = (severity) => {
    const colors = {
      low: '#FFA500',
      medium: '#FF6347',
      high: '#FF0000',
    };
    return colors[severity] || '#FF6347';
  };

  const renderAd = ({ item }) => (
    <View style={styles.adCard}>
      <View style={styles.adHeader}>
        <Image
          source={{ uri: item.image_url }}
          style={styles.adImage}
        />
        <View style={styles.adInfo}>
          <Text style={styles.adTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.adPrice}>${item.price}</Text>
          <Text style={styles.deletedDate}>
            Deleted: {new Date(item.deleted_at).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={[styles.reasonCard, { borderLeftColor: getReasonColor(item.severity) }]}>
        <View style={styles.reasonHeader}>
          <Feather name="alert-triangle" size={20} color={getReasonColor(item.severity)} />
          <Text style={[styles.reasonTitle, { color: getReasonColor(item.severity) }]}>
            Violation: {item.violation_type}
          </Text>
        </View>
        <Text style={styles.reasonText}>{item.reason}</Text>
      </View>

      {item.appeal_status && (
        <View style={styles.appealStatusCard}>
          <Feather 
            name={item.appeal_status === 'approved' ? 'check-circle' : item.appeal_status === 'rejected' ? 'x-circle' : 'clock'} 
            size={16} 
            color={item.appeal_status === 'approved' ? '#32CD32' : item.appeal_status === 'rejected' ? '#FF4444' : '#FFA500'} 
          />
          <Text style={styles.appealStatusText}>
            Appeal Status: {supportService.formatAppealStatus(item.appeal_status)}
          </Text>
        </View>
      )}

      <View style={styles.adActions}>
        {item.can_appeal ? (
          <>
            <Text style={styles.appealDeadline}>
              Appeal before: {new Date(item.appeal_deadline).toLocaleDateString()}
            </Text>
            <TouchableOpacity
              style={styles.appealButton}
              onPress={() => handleAppeal(item)}
            >
              <Feather name="file-text" size={16} color="#FFF" />
              <Text style={styles.appealButtonText}>{t('Appeal')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.noAppealText}>
            {item.appeal_status ? 'Appeal submitted' : 'Appeal window expired'}
          </Text>
        )}
      </View>
    </View>
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
        <View style={styles.header}>
          <Text style={styles.title}>{t('Deleted Ads')}</Text>
          <Text style={styles.subtitle}>{t('View ads removed for policy violations')}</Text>
        </View>

        <FlatList
          data={deletedAds}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAd}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="check-circle" size={64} color="#32CD32" />
              <Text style={styles.emptyTitle}>{t('No Deleted Ads')}</Text>
              <Text style={styles.emptyText}>{t("You don't have any deleted ads. Keep following our community guidelines!")}</Text>
            </View>
          }
        />

        <View style={styles.infoCard}>
          <Feather name="info" size={20} color="#4169E1" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>{t('About Appeals')}</Text>
            <Text style={styles.infoText}>
              • You have 30 days to appeal{'\n'}
              • Provide evidence why the decision should be reversed{'\n'}
              • Appeals are reviewed within 48-72 hours{'\n'}
              • Multiple violations may limit appeal rights
            </Text>
          </View>
        </View>
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
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  listContainer: {
    padding: 15,
  },
  adCard: {
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
  adHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  adImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  adInfo: {
    flex: 1,
    marginLeft: 15,
  },
  adTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  adPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4169E1',
    marginTop: 5,
  },
  deletedDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  reasonCard: {
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 12,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reasonTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  reasonText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  appealStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 12,
  },
  appealStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  adActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appealDeadline: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  appealButton: {
    backgroundColor: '#4169E1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  appealButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  noAppealText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
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
    paddingHorizontal: 40,
  },
  infoCard: {
    backgroundColor: '#FFF',
    padding: 15,
    margin: 15,
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

export default DeletedAdsScreen;