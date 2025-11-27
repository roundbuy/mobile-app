import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';

const RewardsScreen = ({ navigation }) => {
  // Sample reward categories with dummy data
  const [categories] = useState([
    {
      id: '1',
      name: 'Referral Earn Gold Plan',
      description: 'Earn Gold membership for free',
      icon: 'trophy',
      color: '#FFD700',
      type: 'plan_upgrade',
      requiredReferrals: 5,
    },
    {
      id: '2',
      name: 'Referral Earn 3 x Visibility Ads',
      description: 'Make 5 x Ads and Earn 3 Visibility Ads',
      icon: 'eye',
      color: '#4CAF50',
      type: 'visibility_upgrade',
      requiredReferrals: 5,
    },
    {
      id: '3',
      name: 'Sell 7 x products and Earn Delgeet Seller mark',
      description: 'Sell 7 products and receive special seller badge',
      icon: 'star',
      color: '#FF6B6B',
      type: 'badge',
      requiredReferrals: 7,
    },
  ]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCategoryPress = (category) => {
    navigation.navigate('RewardCategoryDetail', { category });
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
        <MaterialCommunityIcons name={item.icon} size={32} color={item.color} />
      </View>
      <View style={styles.categoryContent}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryDescription}>{item.description}</Text>
        <View style={styles.referralBadge}>
          <Ionicons name="people" size={14} color={COLORS.primary} />
          <Text style={styles.referralText}>
            {item.requiredReferrals} referrals required
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#999" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rewards</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.infoCard}>
            <Ionicons name="gift" size={32} color={COLORS.primary} />
            <Text style={styles.infoTitle}>Earn Rewards</Text>
            <Text style={styles.infoText}>
              Complete tasks and refer friends to unlock exclusive rewards and benefits!
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="gift-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No rewards available</Text>
          </View>
        }
      />
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
  },
  headerRight: {
    width: 32,
  },
  listContent: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  referralBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  referralText: {
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '500',
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

export default RewardsScreen;