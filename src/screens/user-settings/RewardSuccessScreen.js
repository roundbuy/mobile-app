import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

const RewardSuccessScreen = ({ navigation, route }) => {
  const { category, selectedPlan, selectedProducts } = route.params;

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDone = () => {
    // Navigate back to rewards screen or home
    navigation.navigate('Rewards');
  };

  const handleViewRewards = () => {
    navigation.navigate('Rewards');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Success Animation */}
        <Animated.View
          style={[
            styles.successIconContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={80} color="#fff" />
          </View>
        </Animated.View>

        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="logo-dropbox" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.logoText}>RoundBuy</Text>
        </View>

        <Animated.View
          style={[
            styles.messageContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.successTitle}>Reward Redeemed Successfully</Text>
          <Text style={styles.successMessage}>
            Thank you! Your Ad has been spot-listed.
          </Text>

          {/* Reward Details */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Ionicons name="gift" size={20} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Reward Type:</Text>
              <Text style={styles.detailValue}>
                {category.type === 'plan_upgrade' 
                  ? 'Membership Upgrade' 
                  : 'Visibility Boost'}
              </Text>
            </View>
            
            {selectedPlan && (
              <View style={styles.detailRow}>
                <Ionicons name="star" size={20} color={COLORS.primary} />
                <Text style={styles.detailLabel}>Plan:</Text>
                <Text style={styles.detailValue}>{selectedPlan.toUpperCase()}</Text>
              </View>
            )}
            
            {selectedProducts && selectedProducts.length > 0 && (
              <View style={styles.detailRow}>
                <Ionicons name="cube" size={20} color={COLORS.primary} />
                <Text style={styles.detailLabel}>Products:</Text>
                <Text style={styles.detailValue}>{selectedProducts.length} selected</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleDone}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Done</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleViewRewards}
            activeOpacity={0.8}
          >
            <Ionicons name="gift-outline" size={20} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>View More Rewards</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <Text style={styles.footerText}>© 2024-2025 RoundBuy Inc ®</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successIconContainer: {
    marginBottom: 32,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  messageContainer: {
    width: '100%',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginRight: 8,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  secondaryButton: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: 24,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    position: 'absolute',
    bottom: 20,
  },
});

export default RewardSuccessScreen;