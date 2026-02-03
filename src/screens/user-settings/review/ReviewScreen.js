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
import SuggestionsFooter from '../../../components/SuggestionsFooter';

const ReviewScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const handleBack = () => {
    navigation.goBack();
  };

  const menuOptions = [
    {
      id: '1',
      title: 'Review RoundBuy',
      icon: 'star',
      action: () => navigation.navigate('ReviewRoundBuy'),
    },
    {
      id: '2',
      title: 'View Ratings and Reviews: App',
      icon: 'phone-portrait',
      action: () => navigation.navigate('AppReviews'),
    },
    {
      id: '3',
      title: 'View Ratings and Reviews: Site',
      icon: 'globe',
      action: () => navigation.navigate('SiteReviews'),
    },
    {
      id: '4',
      title: 'View Google Store Reviews',
      icon: 'logo-google',
      action: () => console.log('Open Google Store'),
    },
    {
      id: '5',
      title: 'View Apple Store Reviews',
      icon: 'logo-apple',
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
        <Text style={styles.headerTitle}>{t('Review')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {menuOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.menuItem}
            onPress={option.action}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name={option.icon} size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.menuTitle}>{option.title}</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
        ))}
        <SuggestionsFooter sourceRoute="Review" />
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
});

export default ReviewScreen;