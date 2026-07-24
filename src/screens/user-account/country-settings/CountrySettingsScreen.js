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
import { settingsService } from '../../../services';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SuggestionsFooter from '../../../components/SuggestionsFooter';

const CountrySettingsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userPreferences, setUserPreferences] = useState({
    currency_name: '',
    currency_symbol: '',
    language_name: '',
    measurement_unit: '',
  });

  useFocusEffect(
    React.useCallback(() => {
      fetchUserPreferences();
    }, [])
  );

  const fetchUserPreferences = async () => {
    try {
      setIsLoading(true);
      const [response, savedUnit] = await Promise.all([
        settingsService.getUserPreferences(),
        AsyncStorage.getItem('measurementUnit'),
      ]);

      let unitLabel = 'Kilometers (km)'; // Default
      if (savedUnit === 'mi') unitLabel = 'Miles (mi)';
      if (savedUnit === 'm') unitLabel = 'Meters (m)';

      if (response.success && response.data?.preferences) {
        const prefs = response.data.preferences;
        setUserPreferences({
          currency_name: prefs.currency_name || 'Not set',
          currency_symbol: prefs.currency_symbol || '',
          language_name: prefs.language_name || 'Not set',
          measurement_unit: unitLabel,
        });
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      Alert.alert(t('Error'), t('Failed to load your preferences. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCurrencyPress = () => {
    navigation.navigate('CurrencySelection', {
      currentCurrency: userPreferences.currency_name,
      onCurrencySelected: handleCurrencySelected
    });
  };

  const handleLanguagePress = () => {
    navigation.navigate('LanguageSelection', {
      currentLanguage: userPreferences.language_name,
      onLanguageSelected: handleLanguageSelected
    });
  };

  const handleMeasurementPress = () => {
    navigation.navigate('MeasurementSettings');
  };

  const handleCurrencySelected = (currency) => {
    setUserPreferences(prev => ({
      ...prev,
      currency_name: currency.name,
      currency_symbol: currency.symbol,
    }));
  };

  const handleLanguageSelected = (language) => {
    setUserPreferences(prev => ({
      ...prev,
      language_name: language.name,
    }));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>{t('Loading your preferences...')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Country settings')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Preferred Country */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('CountrySelection')}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemText}>{t('Preferred Country')}</Text>
            <Text style={styles.menuItemValue}>
              {user?.preferred_country || 'International'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#303234" />
        </TouchableOpacity>

        {/* Currency */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleCurrencyPress}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemText}>{t('Currency')}</Text>
            <Text style={styles.menuItemValue}>
              {userPreferences.currency_symbol} {userPreferences.currency_name}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#303234" />
        </TouchableOpacity>

        {/* Language */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleLanguagePress}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemText}>{t('Language')}</Text>
            <Text style={styles.menuItemValue}>{userPreferences.language_name}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#303234" />
        </TouchableOpacity>

        {/* Measurement Units */}
        <TouchableOpacity
          style={[styles.menuItem, styles.menuItemLast]}
          onPress={handleMeasurementPress}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemText}>{t('Measurement Units')}</Text>
            <Text style={styles.menuItemValue}>{userPreferences.measurement_unit}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#303234" />
        </TouchableOpacity>

        {/* Copyright */}
        <Text style={styles.copyright}>{t('© 2020-2026 RoundBuy Inc ®')}</Text>
        <SuggestionsFooter sourceRoute="CountrySettings" />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#505050',
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '400',
  },
  menuItemValue: {
    fontSize: 15,
    color: '#505050',
    fontWeight: '400',
  },
  copyright: {
    fontSize: 11,
    fontWeight: '400',
    color: '#303234',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default CountrySettingsScreen;