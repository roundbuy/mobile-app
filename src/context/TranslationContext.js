import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

const TranslationContext = createContext();

const STORAGE_KEY = '@roundbuy:language';
const DEFAULT_LANGUAGE = 'en';

export const TranslationProvider = ({ children }) => {
    const [currentLanguage, setCurrentLanguage] = useState(DEFAULT_LANGUAGE);
    const [translations, setTranslations] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isRTL, setIsRTL] = useState(false);

    // Initialize language on app start
    useEffect(() => {
        initializeLanguage();
    }, []);

    // Fetch translations when language changes
    useEffect(() => {
        if (currentLanguage) {
            fetchTranslations(currentLanguage);
        }
    }, [currentLanguage]);

    /**
     * Initialize language based on:
     * 1. Saved user preference
     * 2. Device locale
     * 3. Default (English)
     */
    const initializeLanguage = async () => {
        try {
            // Check for saved language preference
            const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);

            if (savedLanguage) {
                console.log('📱 Using saved language:', savedLanguage);
                setCurrentLanguage(savedLanguage);
                return;
            }

            // Detect device locale
            const deviceLocale = Localization.locale; // e.g., "en-US", "hi-IN"
            const languageCode = deviceLocale.split('-')[0]; // Extract "en" from "en-US"

            console.log('🌍 Device locale detected:', deviceLocale);
            console.log('🔤 Language code:', languageCode);

            // Check if detected language is supported
            const isSupported = await checkLanguageSupport(languageCode);

            if (isSupported) {
                console.log('✅ Using device language:', languageCode);
                await changeLanguage(languageCode);
            } else {
                console.log('⚠️ Device language not supported, using default:', DEFAULT_LANGUAGE);
                setCurrentLanguage(DEFAULT_LANGUAGE);
            }
        } catch (error) {
            console.error('Error initializing language:', error);
            setCurrentLanguage(DEFAULT_LANGUAGE);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Check if a language code is supported by the backend
     */
    const checkLanguageSupport = async (languageCode) => {
        try {
            const response = await axios.get(`${API_CONFIG.BASE_URL}/translations/languages`);
            if (response.data.success) {
                const supportedLanguages = response.data.data;
                return supportedLanguages.some(lang => lang.code === languageCode && lang.is_active);
            }
            return false;
        } catch (error) {
            console.error('Error checking language support:', error);
            return false;
        }
    };

    /**
     * Fetch translations from backend
     */
    const fetchTranslations = async (languageCode) => {
        try {
            console.log('🔄 Fetching translations for:', languageCode);

            const response = await axios.get(`${API_CONFIG.BASE_URL}/translations`, {
                params: { language: languageCode }
            });

            if (response.data.success) {
                const { translations: translationsMap, language } = response.data.data;

                console.log('✅ Translations loaded:', Object.keys(translationsMap).length, 'keys');

                setTranslations(translationsMap);
                setIsRTL(language.is_rtl || false);
            }
        } catch (error) {
            console.error('Error fetching translations:', error);
            // If fetch fails, keep existing translations or use empty object
            if (Object.keys(translations).length === 0) {
                setTranslations({});
            }
        }
    };

    /**
     * Change the current language
     */
    const changeLanguage = async (languageCode) => {
        try {
            console.log('🔄 Changing language to:', languageCode);

            // Save to AsyncStorage
            await AsyncStorage.setItem(STORAGE_KEY, languageCode);

            // Update state
            setCurrentLanguage(languageCode);

            console.log('✅ Language changed successfully');

            return true;
        } catch (error) {
            console.error('Error changing language:', error);
            return false;
        }
    };

    /**
     * Get translated text for a key
     * Falls back to the key itself if translation not found
     */
    const t = (key, defaultValue = null) => {
        if (!key) return defaultValue || '';

        // Check if translation exists
        if (translations[key]) {
            return translations[key];
        }

        // Return default value if provided
        if (defaultValue) {
            return defaultValue;
        }

        // Return the key itself as fallback (useful for debugging)
        // console.warn(`⚠️ Translation missing for key: ${key}`);
        return key;
    };

    /**
     * Get available languages
     */
    const getAvailableLanguages = async () => {
        try {
            const response = await axios.get(`${API_CONFIG.BASE_URL}/translations/languages`);
            if (response.data.success) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching available languages:', error);
            return [];
        }
    };

    const value = {
        currentLanguage,
        translations,
        isLoading,
        isRTL,
        changeLanguage,
        t,
        getAvailableLanguages,
    };

    return (
        <TranslationContext.Provider value={value}>
            {children}
        </TranslationContext.Provider>
    );
};

/**
 * Hook to use translations in components
 * 
 * Usage:
 * const { t, currentLanguage, changeLanguage } = useTranslation();
 * <Text>{t('auth.login', 'Login')}</Text>
 */
export const useTranslation = () => {
    const context = useContext(TranslationContext);

    if (!context) {
        throw new Error('useTranslation must be used within a TranslationProvider');
    }

    return context;
};

export default TranslationContext;
