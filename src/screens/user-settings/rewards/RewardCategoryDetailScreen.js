import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';

const RewardCategoryDetailScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEarnMembership = () => {
    navigation.navigate('EarnMembershipDetails', { category });
  };

  const handleReferralCode = () => {
    navigation.navigate('ReferralCode', { category });
  };

  const handleReferralStatus = () => {
    navigation.navigate('ReferralStatus', { category });
  };

  const menuOptions = [
    {
      id: '1',
      title: 'Earn Gold membership',
      subtitle: 'Learn how to earn this reward',
      icon: 'information-circle',
      action: handleEarnMembership,
      color: '#007AFF',
    },
    {
      id: '2',
      title: 'Referral Code',
      subtitle: 'Share your referral code with friends',
      icon: 'share-social',
      action: handleReferralCode,
      color: '#34C759',
    },
    {
      id: '3',
      title: 'Referral status',
      subtitle: 'Check your referral progress',
      icon: 'stats-chart',
      action: handleReferralStatus,
      color: '#FF9500',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Referral Get Gold Plan</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Info Card */}
        <View style={styles.categoryCard}>
          <View style={[styles.categoryIconContainer, { backgroundColor: category.color + '20' }]}>
            <MaterialCommunityIcons name={category.icon} size={48} color={category.color} />
          </View>
          <Text style={styles.categoryTitle}>{category.name}</Text>
          <Text style={styles.categoryDescription}>{category.description}</Text>
          <View style={styles.requirementBadge}>
            <Ionicons name="people" size={16} color={COLORS.primary} />
            <Text style={styles.requirementText}>
              Requires {category.requiredReferrals} referrals
            </Text>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Actions</Text>
          {menuOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.menuItem}
              onPress={option.action}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: option.color + '15' }]}>
                <Ionicons name={option.icon} size={24} color={option.color} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{option.title}</Text>
                <Text style={styles.menuSubtitle}>{option.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.infoHeaderText}>How it works</Text>
          </View>
          <Text style={styles.infoText}>
            1. Share your unique referral code with friends{'\n'}
            2. When they sign up using your code, it counts as a referral{'\n'}
            3. Track your progress in the Referral Status section{'\n'}
            4. Once you reach the required number, redeem your reward!
          </Text>
        </View>
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
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginRight: 36,
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  categoryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  categoryIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  requirementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  requirementText: {
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 6,
    fontWeight: '600',
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  infoSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});

export default RewardCategoryDetailScreen;