import React from 'react';
import { useTranslation } from '../../../context/TranslationContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';

const ReviewRoundBuyScreen = ({ navigation }) => {
    const { t } = useTranslation();
  const handleBack = () => {
    navigation.goBack();
  };

  const reviewOptions = [
    {
      id: '1',
      title: 'App Review',
      description: 'Review the RoundBuy mobile application',
      icon: 'phone-portrait',
      action: () => navigation.navigate('ReviewAppForm'),
    },
    {
      id: '2',
      title: 'Review the site',
      description: 'Review the RoundBuy website',
      icon: 'globe',
      action: () => navigation.navigate('ReviewSiteForm'),
    },
    {
      id: '3',
      title: 'Review as Google Store',
      description: 'Leave a review on Google Play Store',
      icon: 'logo-google',
      bgColor: '#4285F4',
      action: () => console.log('Open Google Store'),
    },
    {
      id: '4',
      title: 'Review as Apple Store',
      description: 'Leave a review on Apple App Store',
      icon: 'logo-apple',
      bgColor: '#000',
      action: () => console.log('Open Apple Store'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Review RoundBuy')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="star" size={32} color={COLORS.primary} />
          <Text style={styles.infoBannerTitle}>{t('Rate RoundBuy')}</Text>
          <Text style={styles.infoBannerText}>
            We're interested in what you think.{'\n'}
            Please provide us feedback, your experiences, or suggestions of improvement.
          </Text>
          <Text style={styles.infoNote}>{t('Tell us what can be improved, choose below:')}</Text>
        </View>

        {/* Review Options */}
        {reviewOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.optionCard}
            onPress={option.action}
            activeOpacity={0.7}
          >
            <View style={[
              styles.optionIconContainer,
              option.bgColor && { backgroundColor: option.bgColor }
            ]}>
              <Ionicons 
                name={option.icon} 
                size={28} 
                color={option.bgColor ? '#fff' : COLORS.primary} 
              />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
        ))}
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
  infoBanner: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  infoBannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginTop: 12,
    marginBottom: 8,
  },
  infoBannerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  infoNote: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  optionCard: {
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
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});

export default ReviewRoundBuyScreen;