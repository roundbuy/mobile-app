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

const LanguageSelectionScreen = ({ route, navigation }) => {
  const { selectedLanguage } = route?.params || {};
  const [selected, setSelected] = useState(selectedLanguage || 'United Kingdom');

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

  const handleSelect = (language) => {
    setSelected(language);
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
        <Text style={styles.headerTitle}>Language</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {languages.map((language, index) => (
          <TouchableOpacity
            key={index}
            style={styles.languageItem}
            onPress={() => handleSelect(language)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, selected === language && styles.checkboxSelected]}>
              {selected === language && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.languageText}>{language}</Text>
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
  languageItem: {
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
  languageText: {
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

export default LanguageSelectionScreen;