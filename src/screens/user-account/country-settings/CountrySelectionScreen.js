import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../context/TranslationContext';
import { useAuth } from '../../../context/AuthContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { userService } from '../../../services';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COUNTRIES = [
  { code: 'UK', name: 'United Kingdom (UK)', currency: 'GBP', language: 'en' },
  { code: 'USA', name: 'United States (USA)', currency: 'USD', language: 'en' },
  { code: 'FR', name: 'France (FR)', currency: 'EUR', language: 'fr' },
  { code: 'IT', name: 'Italy (IT)', currency: 'EUR', language: 'it' },
  { code: 'JP', name: 'Japan (JP)', currency: 'JPY', language: 'ja' },
  { code: 'International', name: 'International (Default)', currency: 'GBP', language: 'en' }
];

const CountrySelectionScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [selected, setSelected] = useState(user?.preferred_country || 'International');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user?.preferred_country) {
      setSelected(user.preferred_country);
    }
  }, [user]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSelect = async (country) => {
    try {
      setIsUpdating(true);
      setSelected(country.code);

      // Call API to update country preference
      const response = await userService.updateCountryPreference(
        country.code,
        country.currency,
        country.language
      );

      if (response.success) {
        // Also map to active local size system in AsyncStorage
        const countryToSystem = {
          'USA': 'us',
          'UK': 'uk',
          'FR': 'fr',
          'IT': 'it',
          'JP': 'jp',
          'International': 'intl'
        };
        const system = countryToSystem[country.code] || 'intl';
        await AsyncStorage.setItem('@roundbuy:active_size_system', system);

        // Refresh global Auth user state
        if (refreshUser) {
          await refreshUser();
        }

        // Navigate back
        Alert.alert(t('Success'), t('Country preference updated successfully.'));
        setTimeout(() => navigation.goBack(), 300);
      } else {
        throw new Error(response.message || 'Failed to update country preference');
      }
    } catch (error) {
      console.error('Error updating country preference:', error);
      Alert.alert(t('Error'), error.message || t('Failed to update country. Please try again.'));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Preferred Country')}</Text>
        <View style={styles.headerRight}>
          {isUpdating && <ActivityIndicator size="small" color="#000" />}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.instructionText}>
          {t('Select your preferred country standard for sizing, filters, and display:')}
        </Text>

        {COUNTRIES.map((country, index) => (
          <TouchableOpacity
            key={country.code || index}
            style={styles.countryItem}
            onPress={() => !isUpdating && handleSelect(country)}
            activeOpacity={0.7}
            disabled={isUpdating}
          >
            <View style={[styles.checkbox, selected === country.code && styles.checkboxSelected]}>
              {selected === country.code && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.countryText}>
              {country.name}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Copyright */}
        <Text style={styles.copyright}>{t('© 2020-2026 RoundBuy Inc ®')}</Text>
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
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  instructionText: {
    fontSize: 14,
    color: '#505050',
    marginBottom: 20,
    lineHeight: 20,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#d0d0d0',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#000',
  },
  countryText: {
    fontSize: 15,
    color: '#000',
    flex: 1,
  },
  copyright: {
    fontSize: 11,
    fontWeight: '400',
    color: '#303234',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
});

export default CountrySelectionScreen;
