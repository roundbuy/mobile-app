/**
 * Translation System - Usage Guide
 * 
 * This file demonstrates how to use the translation system in your components.
 */

import { useTranslation } from '../context/TranslationContext';

/**
 * EXAMPLE 1: Basic Usage in a Component
 */
export const ExampleComponent1 = () => {
    const { t } = useTranslation();

    return (
        <View>
            <Text>{t('auth.login', 'Login')}</Text>
            <Text>{t('auth.register', 'Register')}</Text>
            <Text>{t('common.welcome', 'Welcome')}</Text>
        </View>
    );
};

/**
 * EXAMPLE 2: Using Current Language
 */
export const ExampleComponent2 = () => {
    const { t, currentLanguage } = useTranslation();

    return (
        <View>
            <Text>{t('settings.current_language', 'Current Language')}: {currentLanguage}</Text>
        </View>
    );
};

/**
 * EXAMPLE 3: Changing Language Programmatically
 */
export const ExampleComponent3 = () => {
    const { changeLanguage, t } = useTranslation();

    const switchToSpanish = async () => {
        await changeLanguage('es');
    };

    const switchToHindi = async () => {
        await changeLanguage('hi');
    };

    return (
        <View>
            <TouchableOpacity onPress={switchToSpanish}>
                <Text>{t('settings.switch_to_spanish', 'Switch to Spanish')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={switchToHindi}>
                <Text>{t('settings.switch_to_hindi', 'Switch to Hindi')}</Text>
            </TouchableOpacity>
        </View>
    );
};

/**
 * EXAMPLE 4: RTL Support
 */
export const ExampleComponent4 = () => {
    const { t, isRTL } = useTranslation();

    return (
        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <Text>{t('common.hello', 'Hello')}</Text>
        </View>
    );
};

/**
 * TRANSLATION KEY NAMING CONVENTION:
 * 
 * Use dot notation for hierarchical organization:
 * - auth.login
 * - auth.register
 * - auth.forgot_password
 * - products.add_to_cart
 * - products.view_details
 * - common.save
 * - common.cancel
 * - errors.network_error
 * - errors.invalid_credentials
 * 
 * Categories:
 * - auth: Authentication related
 * - products: Product related
 * - cart: Shopping cart
 * - profile: User profile
 * - settings: Settings
 * - common: Common/shared text
 * - errors: Error messages
 * - success: Success messages
 * - validation: Form validation messages
 */

/**
 * HOW IT WORKS:
 * 
 * 1. On app start, TranslationContext:
 *    - Checks AsyncStorage for saved language preference
 *    - If not found, detects device locale (e.g., "en-US" → "en")
 *    - Falls back to English if device language not supported
 * 
 * 2. Translations are fetched from backend API:
 *    GET /api/v1/mobile-app/translations?language=en
 *    Returns: { "auth.login": "Login", "auth.register": "Register", ... }
 * 
 * 3. When user changes language:
 *    - New translations are fetched from backend
 *    - Language preference is saved to AsyncStorage
 *    - All components using useTranslation() re-render automatically
 * 
 * 4. The t() function:
 *    - First parameter: translation key
 *    - Second parameter: fallback text (optional but recommended)
 *    - Returns translated text or fallback if translation not found
 */

/**
 * BACKEND INTEGRATION:
 * 
 * The backend already has a complete translation system:
 * - Database tables: languages, translation_keys, translations
 * - API endpoints for fetching translations
 * - Support for auto-translation via Google Translate
 * 
 * To add new translations:
 * 1. Add translation keys to the database (translation_keys table)
 * 2. Add translations for each language (translations table)
 * 3. Or use auto-translation feature for automatic translation
 */

export default {
    ExampleComponent1,
    ExampleComponent2,
    ExampleComponent3,
    ExampleComponent4,
};
