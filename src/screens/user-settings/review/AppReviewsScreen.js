import React, { useState } from 'react';
import { useTranslation } from '../../../context/TranslationContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { platformReviewService } from '../../../services';
import { ActivityIndicator, RefreshControl, Image } from 'react-native';

const AppReviewsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [reviewsData, setReviewsData] = useState({
    averageRating: 0,
    totalReviews: 0,
    reviews: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const fetchReviews = async () => {
    try {
      const data = await platformReviewService.getReviews('app');
      setReviewsData({
        averageRating: data.stats ? data.stats.averageRating : 0,
        totalReviews: data.stats ? data.stats.totalReviews : 0,
        reviews: data.reviews || []
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchReviews();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };

  const renderStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color="#FFD700"
          />
        ))}
      </View>
    );
  };

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Ionicons name="person-circle" size={40} color="#666" />
            </View>
          )}
          <View style={styles.userDetails}>
            <Text style={styles.username}>{item.full_name || t('User')}</Text>
            {renderStars(item.rating)}
          </View>
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.experience}</Text>
      {item.improvements ? (
        <Text style={[styles.reviewComment, { fontStyle: 'italic', marginTop: 4 }]}>
          {t('Improvements')}: {item.improvements}
        </Text>
      ) : null}
      <Text style={styles.reviewDate}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Ratings and Reviews: App')}</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={reviewsData.reviews}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            <View style={styles.summarySection}>
              <Text style={styles.averageRating}>{Number(reviewsData.averageRating).toFixed(1)}</Text>
              <View style={styles.averageStars}>
                {renderStars(Math.round(reviewsData.averageRating))}
              </View>
              <Text style={styles.totalReviews}>{t('RoundBuy App and service')}</Text>
              <Text style={styles.totalCount}>{reviewsData.totalReviews} {t('reviews')}</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>{t('No reviews yet')}</Text>
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
    flex: 1,
    textAlign: 'center',
    marginRight: 36,
  },
  headerRight: {
    width: 32,
  },
  listContent: {
    padding: 16,
  },
  summarySection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    marginBottom: 24,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  averageStars: {
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
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

export default AppReviewsScreen;