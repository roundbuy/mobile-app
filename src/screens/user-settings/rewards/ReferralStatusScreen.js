import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';

const ReferralStatusScreen = ({ navigation, route }) => {
  const { category } = route.params;

  // Dummy data - replace with actual API data
  const [referralData] = useState({
    completed: 5, // Change this to test different states (0-5)
    required: 5,
    referrals: [
      { id: 1, code: 'RBV9F9H', username: 'HeH1232', status: 'completed' },
      { id: 2, code: 'RBV9F9H', username: 'Bob12', status: 'completed' },
      { id: 3, code: 'RBV9F9H', username: 'Blueuser', status: 'completed' },
      { id: 4, code: 'RBV9F9H', username: 'CoolJane', status: 'completed' },
      { id: 5, code: 'RBV9F9H', username: 'Jawdy', status: 'completed' },
    ],
  });

  const isCompleted = referralData.completed >= referralData.required;
  const progress = (referralData.completed / referralData.required) * 100;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleRedeem = () => {
    if (isCompleted) {
      navigation.navigate('RedeemReward', { category, referralData });
    }
  };

  const renderReferralItem = (index) => {
    const referral = referralData.referrals[index];
    const isActive = index < referralData.completed;

    return (
      <View key={index} style={styles.referralItem}>
        <View style={styles.referralNumber}>
          <Text style={styles.referralNumberText}>{index + 1}</Text>
        </View>
        <View style={styles.referralContent}>
          {isActive && referral ? (
            <>
              <Text style={styles.referralCode}>
                REFERRAL CODE {referral.code}
              </Text>
              <Text style={styles.referralUsername}>
                Username: {referral.username}
              </Text>
            </>
          ) : (
            <Text style={styles.referralPending}>
              {index === referralData.completed ? 'You need 1 more' : 'Pending...'}
            </Text>
          )}
        </View>
        {isActive && (
          <View style={styles.checkmarkContainer}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          </View>
        )}
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
        <Text style={styles.headerTitle}>Referral status</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Header */}
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>
            {referralData.completed} of {referralData.required}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill,
                { width: `${progress}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
        </View>

        {/* Success Message */}
        {isCompleted && (
          <View style={styles.successBanner}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
            </View>
            <Text style={styles.successTitle}>Gold membership earned!</Text>
            <Text style={styles.successMessage}>
              Congratulations! You've completed all required referrals. 
              Click the button below to redeem your reward.
            </Text>
          </View>
        )}

        {/* Referrals List */}
        <View style={styles.referralsList}>
          {Array.from({ length: referralData.required }).map((_, index) => 
            renderReferralItem(index)
          )}
        </View>

        {/* Redeem Button */}
        {isCompleted && (
          <TouchableOpacity
            style={styles.redeemButton}
            onPress={handleRedeem}
            activeOpacity={0.8}
          >
            <Text style={styles.redeemButtonText}>Redeem your Reward</Text>
            <Ionicons name="gift" size={20} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Info Section */}
        {!isCompleted && (
          <View style={styles.infoSection}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={20} color={COLORS.primary} />
              <Text style={styles.infoHeaderText}>Keep going!</Text>
            </View>
            <Text style={styles.infoText}>
              You need {referralData.required - referralData.completed} more referral
              {referralData.required - referralData.completed > 1 ? 's' : ''} to 
              unlock your Gold membership reward. Share your code with friends!
            </Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footerText}>© 2024-2025 RoundBuy Inc ®</Text>
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
    padding: 20,
    paddingBottom: 40,
  },
  progressHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
  },
  progressBarContainer: {
    marginBottom: 24,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  successBanner: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  successIconContainer: {
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 20,
  },
  referralsList: {
    marginBottom: 24,
  },
  referralItem: {
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
  referralNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  referralNumberText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  referralContent: {
    flex: 1,
  },
  referralCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  referralUsername: {
    fontSize: 13,
    color: '#666',
  },
  referralPending: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  checkmarkContainer: {
    marginLeft: 8,
  },
  redeemButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  redeemButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginRight: 8,
  },
  infoSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoHeaderText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default ReferralStatusScreen;