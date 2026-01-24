import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';

const PriceFilterScreen = ({ navigation }) => {
    const { t } = useTranslation();
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

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
          <Text style={styles.headerTitle}>{t('Price')}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.priceRange}>£150 - £2700</Text>

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('Minimum')}</Text>
              <TextInput
                style={styles.input}
                placeholder="£150"
                placeholderTextColor="#c7c7cc"
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('Maximum')}</Text>
              <TextInput
                style={styles.input}
                placeholder="£2700"
                placeholderTextColor="#c7c7cc"
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.useText}>{t('Use')}</Text>
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
  content: { paddingHorizontal: 20 },
  priceRange: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginVertical: 30,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  inputContainer: { flex: 1 },
  label: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 8 },
  input: {
    height: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#1a1a1a',
  },
  useText: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 16,
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

export default PriceFilterScreen;