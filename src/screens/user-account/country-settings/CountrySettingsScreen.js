import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const CountrySettingsScreen = ({ navigation }) => {
  const [selectedCurrency, setSelectedCurrency] = useState('£ sterling pounds');
  const [selectedLanguage, setSelectedLanguage] = useState('United Kingdom');

  const currencies = [
    '£ sterling pounds',
    '€ euroe',
    '$ USD',
    'India',
  ];

  const languages = [
    'United Kingdom',
    'India',
    'United Kingdom',
    'India',
    'United Kingdom',
    'India',
    'United Kingdom',
    'Indpia',
    'United Kingdom',
    'India',
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCurrencyPress = () => {
    navigation.navigate('CurrencySelection', { selectedCurrency });
  };

  const handleLanguagePress = () => {
    navigation.navigate('LanguageSelection', { selectedLanguage });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Country settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Currency */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleCurrencyPress}
          activeOpacity={0.7}
        >
          <Text style={styles.menuItemText}>Currency</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        {/* Language */}
        <TouchableOpacity
          style={[styles.menuItem, styles.menuItemLast]}
          onPress={handleLanguagePress}
          activeOpacity={0.7}
        >
          <Text style={styles.menuItemText}>Language</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        {/* Copyright */}
        <Text style={styles.copyright}>© 2020-2025 RoundBuy Inc ®</Text>
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
  menuItemText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '400',
    flex: 1,
  },
  copyright: {
    fontSize: 11,
    fontWeight: '400',
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default CountrySettingsScreen;