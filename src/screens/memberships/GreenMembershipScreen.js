import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';

const GreenMembershipScreen = ({ navigation }) => {
    const { t } = useTranslation();
  return (
    <SafeScreenContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('Membership plans')}</Text>
        </View>

        {/* Plan Card */}
        <View style={styles.planCard}>
          <View style={[styles.planHeader, { backgroundColor: '#7FD957' }]}>
            <Text style={styles.planTitle}>{t('Green')}</Text>
          </View>

          <View style={styles.planContent}>
            <Text style={styles.planSubtitle}>{t('Essential features for private users.')}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>{t('Price £2 now for free £0 / year')}</Text>
              <TouchableOpacity style={styles.infoIcon}>
                <Text style={styles.infoIconText}>ⓘ</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.currentPlanBadge}>
              <Text style={styles.currentPlanText}>{t('Current plan')}</Text>
            </View>

            <Text style={styles.featuresTitle}>{t('Green plan includes')}</Text>
            <Text style={styles.featureItem}>{t('• 1 x centre-point (changeable spot to search)')}</Text>
            <Text style={styles.featureItem}>{t('• 1 x product location (a spot to sell)')}</Text>
            <Text style={styles.featureItem}>{t('• Unlimited standard ads')}</Text>
            <Text style={styles.featureItem}>{t('• Display time for ads 60 days')}</Text>
            <Text style={styles.featureItem}>{t('• Highlighted ads for normal price')}</Text>
            <Text style={styles.featureItem}>{t('• Chat service between private users')}</Text>
            <Text style={styles.featureItem}>{t('• Pick & Transaction fee £0.00 for 10 Ads')}</Text>
            <Text style={styles.featureItem}>{t('• Pick & Transaction fee £0.70 for +10 Ads')}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    fontSize: 28,
    color: '#000',
    fontWeight: '300',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planHeader: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  planContent: {
    padding: 20,
  },
  planSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  infoIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconText: {
    fontSize: 12,
    color: '#666',
  },
  currentPlanBadge: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  currentPlanText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  featureItem: {
    fontSize: 13,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default GreenMembershipScreen;