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
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

const EarnMembershipDetailsScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleStartNow = () => {
    navigation.navigate('ReferralCode', { category });
  };

  const steps = [
    {
      id: '1',
      icon: 'person-add',
      title: 'Become a Green member',
      description: 'Blengineer, create yourself a User Account, and start helping your friends.',
    },
    {
      id: '2',
      icon: 'share-social',
      title: 'Give your Referral code to 5 friends',
      description: 'Share your unique code with friends. Once they use it, you earn free membership for yourself!',
    },
    {
      id: '3',
      icon: 'trophy',
      title: 'Earn reward, get Gold membership',
      description: 'As you get your 5 friends to subscribe, you earn a reward (GOLD membership) for yourself!',
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
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Earn Gold membership for free</Text>
          <Text style={styles.subtitle}>
            Welcome to RoundBuy. How to use this referral code to 5 friends. 
            Share and receive Gold membership for free of charge.
          </Text>
        </View>

        {/* Steps Section */}
        <View style={styles.stepsSection}>
          {steps.map((step, index) => (
            <View key={step.id} style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepIconContainer}>
                  <Ionicons name={step.icon} size={32} color={COLORS.primary} />
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color={COLORS.primary} />
            <Text style={styles.infoHeaderText}>For more information, click here</Text>
          </View>
          <TouchableOpacity style={styles.infoLink}>
            <Ionicons name="help-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.infoLinkText}>Learn more about rewards</Text>
          </TouchableOpacity>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartNow}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>Start now</Text>
        </TouchableOpacity>

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
  titleSection: {
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  stepsSection: {
    marginBottom: 24,
  },
  stepCard: {
    marginBottom: 24,
    position: 'relative',
  },
  stepNumber: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  stepContent: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    paddingTop: 24,
    marginLeft: 16,
  },
  stepIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
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
    flex: 1,
  },
  infoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLinkText: {
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default EarnMembershipDetailsScreen;