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

const CurrencySelectionScreen = ({ route, navigation }) => {
  const { selectedCurrency } = route?.params || {};
  const [selected, setSelected] = useState(selectedCurrency || '£ sterling pounds');

  const currencies = [
    '£ sterling pounds',
    '€ euroe',
    '$ USD',
    'India',
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSelect = (currency) => {
    setSelected(currency);
    // Auto navigate back after selection (optional)
    // setTimeout(() => navigation.goBack(), 300);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Currency</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currencies.map((currency, index) => (
          <TouchableOpacity
            key={index}
            style={styles.currencyItem}
            onPress={() => handleSelect(currency)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, selected === currency && styles.checkboxSelected]}>
              {selected === currency && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.currencyText}>{currency}</Text>
          </TouchableOpacity>
        ))}

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