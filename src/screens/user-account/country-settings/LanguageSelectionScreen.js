import React, { useState, useEffect } from 'react';
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

const LanguageSelectionScreen = ({ route, navigation }) => {
  const { currentLanguage, onLanguageSelected } = route?.params || {};
  const [languages, setLanguages] = useState([]);
  const [selected, setSelected] = useState(currentLanguage || '');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch languages on component mount
  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      setIsLoading(true);
      const response = await settingsService.getLanguages();

      if (response.success && response.data?.languages) {
        setLanguages(response.data.languages);
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
      Alert.alert('Error', 'Failed to load languages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSelect = async (language) => {
    try {
      setSelected(language.name);

      // Update user preferences
      const response = await settingsService.updateUserPreferences({
        language_preference: language.code
      });

      if (response.success) {
        // Call the callback if provided
        if (onLanguageSelected) {
          onLanguageSelected(language);
        }

        // Navigate back after successful update
        setTimeout(() => navigation.goBack(), 300);
      } else {
        throw new Error(response.message || 'Failed to update language');
      }
    } catch (error) {
      console.error('Error updating language:', error);
      Alert.alert('Error', error.message || 'Failed to update your language preference. Please try again.');
    }
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
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.loadingText}>Loading languages...</Text>
          </View>
        ) : (
          languages.map((language, index) => (
            <TouchableOpacity
              key={language.id || index}
              style={styles.languageItem}
              onPress={() => handleSelect(language)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, selected === language.name && styles.checkboxSelected]}>
                {selected === language.name && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
              <Text style={styles.languageText}>
                {language.name} ({language.code.toUpperCase()})
              </Text>
            </TouchableOpacity>
          ))
        )}

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