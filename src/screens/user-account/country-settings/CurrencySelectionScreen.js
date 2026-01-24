import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../context/TranslationContext';
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

const CurrencySelectionScreen = ({ route, navigation }) => {
    const { t } = useTranslation();
  const { currentCurrency, onCurrencySelected } = route?.params || {};
  const [currencies, setCurrencies] = useState([]);
  const [selected, setSelected] = useState(currentCurrency || '');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch currencies on component mount
  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      setIsLoading(true);
      const response = await settingsService.getCurrencies();

      if (response.success && response.data?.currencies) {
        setCurrencies(response.data.currencies);
      }
    } catch (error) {
      console.error('Error fetching currencies:', error);
      Alert.alert(t('Error'), t('Failed to load currencies. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSelect = async (currency) => {
    try {
      setSelected(currency.name);

      // Update user preferences
      const response = await settingsService.updateUserPreferences({
        currency_code: currency.code
      });

      if (response.success) {
        // Call the callback if provided
        if (onCurrencySelected) {
          onCurrencySelected(currency);
        }

        // Navigate back after successful update
        setTimeout(() => navigation.goBack(), 300);
      } else {
        throw new Error(response.message || 'Failed to update currency');
      }
    } catch (error) {
      console.error('Error updating currency:', error);
      Alert.alert(t('Error'), error.message || t('Failed to update your currency preference. Please try again.'));
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Currency')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.loadingText}>{t('Loading currencies...')}</Text>
          </View>
        ) : (
          currencies.map((currency, index) => (
            <TouchableOpacity
              key={currency.id || index}
              style={styles.currencyItem}
              onPress={() => handleSelect(currency)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, selected === currency.name && styles.checkboxSelected]}>
                {selected === currency.name && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
              <Text style={styles.currencyText}>
                {currency.symbol} {currency.name} ({currency.code})
              </Text>
            </TouchableOpacity>
          ))
        )}

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
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  currencyItem: {
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
  currencyText: {
    fontSize: 15,
    color: '#000',
    flex: 1,
  },
  copyright: {
    fontSize: 11,
    fontWeight: '400',
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
});

export default CurrencySelectionScreen;