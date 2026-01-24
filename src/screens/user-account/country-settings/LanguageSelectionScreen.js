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
import { useTranslation } from '../../../context/TranslationContext';

const LanguageSelectionScreen = ({ route, navigation }) => {
  const { currentLanguage: contextLanguage, changeLanguage, getAvailableLanguages, t } = useTranslation();
  const { onLanguageSelected } = route?.params || {};
  const [languages, setLanguages] = useState([]);
  const [selected, setSelected] = useState(contextLanguage || 'en');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch languages on component mount
  useEffect(() => {
    fetchLanguages();
  }, []);

  // Update selected when context language changes
  useEffect(() => {
    if (contextLanguage) {
      setSelected(contextLanguage);
    }
  }, [contextLanguage]);

  const fetchLanguages = async () => {
    try {
      setIsLoading(true);
      const availableLanguages = await getAvailableLanguages();

      if (availableLanguages && availableLanguages.length > 0) {
        setLanguages(availableLanguages);
      } else {
        Alert.alert(t('Error'), t('No languages available. Please try again later.'));
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
      Alert.alert(t('Error'), t('Failed to load languages. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSelect = async (language) => {
    try {
      setSelected(language.code);

      // Change language using TranslationContext
      const success = await changeLanguage(language.code);

      if (success) {
        // Call the callback if provided
        if (onLanguageSelected) {
          onLanguageSelected(language);
        }

        Alert.alert(
          t('Success'),
          `Language changed to ${language.name}`,
          [
            {
              text: t('OK'),
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        throw new Error('Failed to change language');
      }
    } catch (error) {
      console.error('Error updating language:', error);
      Alert.alert(t('Error'), error.message || t('Failed to update your language preference. Please try again.'));
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Language')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Translation Demo Section */}
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>{t('settings.language', 'Language')}</Text>
          <Text style={styles.demoSubtitle}>{t('home.welcome', 'Welcome to RoundBuy')}</Text>
          <Text style={styles.demoText}>
            {t('common.loading', 'Loading...')} • {t('common.save', 'Save')} • {t('common.cancel', 'Cancel')}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.loadingText}>{t('common.loading', 'Loading languages...')}</Text>
          </View>
        ) : (
          languages.map((language, index) => (
            <TouchableOpacity
              key={language.id || index}
              style={styles.languageItem}
              onPress={() => handleSelect(language)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, selected === language.code && styles.checkboxSelected]}>
                {selected === language.code && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
              <View style={styles.languageInfo}>
                <Text style={styles.languageText}>{language.name}</Text>
              </View>
              <Text style={styles.languageCode}>{language.code.toUpperCase()}</Text>
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
  demoSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  demoSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
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
  languageInfo: {
    flex: 1,
  },
  languageText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  nativeNameText: {
    fontSize: 13,
    color: '#666',
  },
  languageCode: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
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