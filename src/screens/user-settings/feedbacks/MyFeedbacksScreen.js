import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';

const MyFeedbacksScreen = ({ navigation }) => {
  const handleBack = () => {
    navigation.goBack();
  };

  // Sample data - replace with actual API data
  const feedbackStats = {
    positive: 80,
    negative: 10,
    neutral: 10,
    rating: 5.0,
  };

  const feedbacks = [
    {
      id: '1',
      rating: 5,
      comment: 'A true gentleman, nice to do business with!',
      username: 'SteveM',
      productCode: 'XE192843234',
      avatar: null,
    },
    {
      id: '2',
      rating: 5,
      comment: 'This is a good seller. I Recommend.',
      username: 'jonnie12',
      productCode: 'XE188845663',
      avatar: null,
    },
    {
      id: '3',
      rating: 5,
      comment: 'Rather decent chap to work with.',
      username: 'ChuckieC',
      productCode: 'XE192843234',
      avatar: null,
    },
  ];

  const renderStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[...Array(5)].map((_, index) => (
          <Ionicons
            key={index}
            name={index < rating ? 'star' : 'star-outline'}
            size={20}
            color="#FFD700"
          />
        ))}
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
        <Text style={styles.headerTitle}>My Feedbacks</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Description */}
        <Text style={styles.description}>
          Feedbacks you have received from other users.
        </Text>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Feedbacks by type:</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Positive</Text>
              <Text style={styles.statValue}>{feedbackStats.positive}%</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Negative</Text>
              <Text style={styles.statValue}>{feedbackStats.negative}%</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Neutral</Text>
              <Text style={styles.statValue}>{feedbackStats.neutral}%</Text>
            </View>
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingText}>Rating {feedbackStats.rating.toFixed(1)}</Text>
          {renderStars(Math.round(feedbackStats.rating))}
        </View>

        {/* Feedbacks List */}
        {feedbacks.map((feedback) => (
          <View key={feedback.id} style={styles.feedbackCard}>
            {renderStars(feedback.rating)}
            <Text style={styles.commentText}>{feedback.comment}</Text>
            <View style={styles.userInfo}>
              <View style={styles.userLeft}>
                <View style={styles.avatar}>
                  <FontAwesome name="user-circle" size={40} color="#666" />
                </View>
                <Text style={styles.username}>{feedback.username}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productLabel}>Product code</Text>
                <Text style={styles.productCode}>{feedback.productCode}</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    fontWeight: '700',
    color: '#000',
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginRight: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  feedbackCard: {
    backgroundColor: '#f8f8f8',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
  },
  commentText: {
    fontSize: 14,
    color: '#000',
    marginVertical: 12,
    lineHeight: 20,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: 12,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  productInfo: {
    alignItems: 'flex-end',
  },
  productLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  productCode: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default MyFeedbacksScreen;