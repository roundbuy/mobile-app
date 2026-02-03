import React, { useState, useEffect } from 'react';
import { IMAGES } from '../../../assets/images';
import { getFullImageUrl } from '../../../utils/imageUtils';
import { useTranslation } from '../../../context/TranslationContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { feedbackService } from '../../../services';

const GiveFeedbackListScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEligibleTransactions();
  }, []);

  const fetchEligibleTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await feedbackService.getEligibleForFeedback();

      if (response.success) {
        setTransactions(response.data.transactions || []);
      } else {
        setError(response.message || 'Failed to load transactions');
      }
    } catch (err) {
      console.error('Error fetching eligible transactions:', err);
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEligibleTransactions();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleGiveFeedback = (transaction) => {
    navigation.navigate('GiveFeedbackForm', {
      transaction,
      advertisementId: transaction.advertisementId,
      offerId: transaction.offerId,
      reviewedUserId: transaction.otherParty.id,
      transactionType: transaction.transactionType,
      images: transaction.images // Explicitly pass images
    });
  };

  const handleProductPress = (transaction) => {
    navigation.navigate('FeedbackStatus', { transaction });
  };

  const getTypeBadgeStyle = (type) => {
    switch (type?.toLowerCase()) {
      case 'sell':
        return styles.sellBadge;
      case 'rent':
        return styles.rentBadge;
      case 'buy':
        return styles.buyBadge;
      case 'give':
        return styles.giveBadge;
      default:
        return styles.sellBadge;
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('Loading transactions...')}</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#999" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchEligibleTransactions}>
            <Text style={styles.retryButtonText}>{t('Retry')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (transactions.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="checkmark-circle-outline" size={64} color="#4CAF50" />
          <Text style={styles.emptyTitle}>{t('All Caught Up!')}</Text>
          <Text style={styles.emptyText}>{t("You don't have any completed transactions waiting for feedback.")}</Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {transactions.map((transaction) => (
          <TouchableOpacity
            key={`${transaction.advertisementId}-${transaction.offerId || 'no-offer'}`}
            style={styles.productCard}
            onPress={() => handleProductPress(transaction)}
            activeOpacity={0.7}
          >
            <Image
              source={(() => {
                try {
                  const images = typeof transaction.images === 'string' ? JSON.parse(transaction.images) : transaction.images;
                  if (images && images.length > 0) {
                    const url = getFullImageUrl(images[0]);
                    if (url) return { uri: url };
                  }
                } catch (e) {
                  console.log('Error parsing transaction image:', e);
                }
                return IMAGES.chair1;
              })()}
              style={styles.productImage}
            />

            <View style={styles.productContent}>
              <View style={styles.productHeader}>
                <Text style={styles.productTitle} numberOfLines={2}>
                  {transaction.title}
                </Text>
                <View style={[styles.typeBadge, getTypeBadgeStyle(transaction.transactionType)]}>
                  <Text style={styles.typeBadgeText}>
                    {transaction.transactionType?.toUpperCase() || 'SELL'}
                  </Text>
                </View>
              </View>

              <Text style={styles.otherPartyText}>
                {transaction.transactionType === 'sell' ? 'Buyer' : 'Seller'}: {transaction.otherParty.name}
              </Text>

              <Text style={styles.priceText}>
                Price: £{transaction.offeredPrice || transaction.price}
              </Text>

              <Text style={styles.dateText}>
                {new Date(transaction.transactionDate).toLocaleDateString()}
              </Text>

              <TouchableOpacity
                style={styles.feedbackButton}
                onPress={() => handleGiveFeedback(transaction)}
                activeOpacity={0.7}
              >
                <Text style={styles.feedbackButtonText}>{t('Give Feedback')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Give Feedback')}</Text>
        <View style={styles.headerRight} />
      </View>

      {renderContent()}
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
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  productImage: {
    width: 140,
    height: 140,
    backgroundColor: '#f5f5f5',
  },
  productContent: {
    flex: 1,
    padding: 12,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  sellBadge: {
    backgroundColor: '#4CAF50',
  },
  rentBadge: {
    backgroundColor: '#FF9800',
  },
  buyBadge: {
    backgroundColor: COLORS.primary,
  },
  giveBadge: {
    backgroundColor: '#9C27B0',
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  otherPartyText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 13,
    color: '#000',
    fontWeight: '600',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  feedbackButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  feedbackButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  bottomSpacer: {
    height: 24,
  },
});

export default GiveFeedbackListScreen;