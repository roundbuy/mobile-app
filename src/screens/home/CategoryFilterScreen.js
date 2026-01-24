import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';

const CategoryFilterScreen = ({ navigation }) => {
    const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    'All', 'Art', 'Vehicles', 'Hobbies',
    'Kids & baby products', 'Electronics', 'Housing',
    'Fashion', 'Film/Cinema', 'Music',
    'New/Local', 'Pets', 'Sport & Leisure'
  ];

  const handleShowResults = () => {
    navigation.goBack();
  };

  return (
    <SafeScreenContainer>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backArrow}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('Category')}</Text>
        </View>

        <View style={styles.optionsList}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={styles.option}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={styles.optionText}>{category}</Text>
              <View style={styles.checkbox}>
                {selectedCategory === category && <FontAwesome name="check" size={16} color={COLORS.primary} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.showResultsButton} onPress={handleShowResults}>
          <Text style={styles.showResultsButtonText}>{t('Show results')}</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>
          <Text style={styles.footerLink}>{t('Terms of service')}</Text>
        </Text>
      </View>
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 16,
  },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  backArrow: { fontSize: 24, fontWeight: '300', color: '#1a1a1a' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginLeft: 8 },
  optionsList: { paddingHorizontal: 4 },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: { fontSize: 15, fontWeight: '400', color: '#1a1a1a' },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  showResultsButton: {
    height: 54,
    backgroundColor: COLORS.primary,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  showResultsButtonText: { fontSize: 18, fontWeight: '600', color: '#ffffff' },
  footerText: { fontSize: 10, color: '#8a8a8a', textAlign: 'center' },
  footerLink: { textDecorationLine: 'underline' },
});

export default CategoryFilterScreen;