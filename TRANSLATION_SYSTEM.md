# 🌍 Google Translate Integration - Complete Implementation Guide

## Overview
Automatic translation system integrated with Google Translate API through the backend. The app automatically detects the user's device language and displays content in their preferred language.

---

## ✅ What Was Implemented

### 1. **Translation Context** (`src/context/TranslationContext.js`)
- Global state management for translations
- Automatic language detection based on device locale
- AsyncStorage persistence for user language preference
- Integration with backend translation API
- RTL (Right-to-Left) language support

### 2. **Updated Components**
- **App.js**: Wrapped with `TranslationProvider`
- **LanguageSelectionScreen.js**: Integrated with TranslationContext
- **app.config.js**: Added `expo-localization` plugin

### 3. **New Dependencies**
- `expo-localization`: For device locale detection

---

## 🚀 How It Works

### Automatic Language Detection Flow:

```
1. App Starts
   ↓
2. TranslationContext Initializes
   ↓
3. Check AsyncStorage for saved language
   ↓
4. If not found → Detect device locale (e.g., "en-US")
   ↓
5. Extract language code (e.g., "en")
   ↓
6. Check if language is supported by backend
   ↓
7. Fetch translations from backend API
   ↓
8. App renders in detected/saved language
```

### Language Change Flow:

```
User selects language in LanguageSelectionScreen
   ↓
changeLanguage() called
   ↓
Save to AsyncStorage
   ↓
Fetch new translations from backend
   ↓
All components re-render automatically
```

---

## 📝 Usage in Components

### Basic Usage:

```javascript
import { useTranslation } from '../context/TranslationContext';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <View>
      <Text>{t('auth.login', 'Login')}</Text>
      <Text>{t('auth.register', 'Register')}</Text>
    </View>
  );
};
```

### With Language Switching:

```javascript
const MyComponent = () => {
  const { t, currentLanguage, changeLanguage } = useTranslation();
  
  const switchLanguage = async (languageCode) => {
    await changeLanguage(languageCode);
  };
  
  return (
    <View>
      <Text>Current: {currentLanguage}</Text>
      <Button title="Switch to Hindi" onPress={() => switchLanguage('hi')} />
    </View>
  );
};
```

### RTL Support:

```javascript
const MyComponent = () => {
  const { t, isRTL } = useTranslation();
  
  return (
    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
      <Text>{t('common.hello', 'Hello')}</Text>
    </View>
  );
};
```

---

## 🔑 Translation Key Naming Convention

Use dot notation for hierarchical organization:

```
auth.login
auth.register
auth.forgot_password
products.add_to_cart
products.view_details
cart.checkout
cart.empty_cart
profile.edit_profile
profile.change_password
settings.language
settings.notifications
common.save
common.cancel
common.delete
errors.network_error
errors.invalid_credentials
success.saved
success.updated
validation.required_field
validation.invalid_email
```

### Categories:
- **auth**: Authentication related
- **products**: Product related
- **cart**: Shopping cart
- **profile**: User profile
- **settings**: Settings
- **common**: Common/shared text
- **errors**: Error messages
- **success**: Success messages
- **validation**: Form validation messages

---

## 🔧 Backend API Endpoints

### Get Translations:
```
GET /api/v1/mobile-app/translations?language=en

Response:
{
  "success": true,
  "data": {
    "language": { "code": "en", "name": "English" },
    "translations": {
      "auth.login": "Login",
      "auth.register": "Register",
      ...
    },
    "total": 150
  }
}
```

### Get Available Languages:
```
GET /api/v1/mobile-app/translations/languages

Response:
{
  "success": true,
  "data": [
    { "id": 1, "code": "en", "name": "English", "native_name": "English", "is_rtl": false },
    { "id": 2, "code": "hi", "name": "Hindi", "native_name": "हिन्दी", "is_rtl": false },
    { "id": 3, "code": "ar", "name": "Arabic", "native_name": "العربية", "is_rtl": true }
  ]
}
```

### Get Translations by Category:
```
GET /api/v1/mobile-app/translations/auth?language=hi

Response:
{
  "success": true,
  "data": {
    "category": "auth",
    "translations": {
      "auth.login": "लॉगिन",
      "auth.register": "रजिस्टर करें"
    }
  }
}
```

---

## 📊 Database Structure

### Tables:
1. **languages**: Stores available languages
   - id, code, name, native_name, is_rtl, is_active, is_default

2. **translation_keys**: Stores translation keys
   - id, key_name, category, default_text

3. **translations**: Stores actual translations
   - id, translation_key_id, language_id, translated_text, is_auto_translated

---

## 🌐 Supported Languages (Default Setup)

The backend supports any language you add. Common examples:

- **en** - English
- **hi** - Hindi (हिन्दी)
- **es** - Spanish (Español)
- **fr** - French (Français)
- **de** - German (Deutsch)
- **ar** - Arabic (العربية) - RTL
- **zh** - Chinese (中文)
- **ja** - Japanese (日本語)
- **pt** - Portuguese (Português)
- **ru** - Russian (Русский)

---

## 🔄 Auto-Translation Feature

The backend supports automatic translation via Google Translate API:

1. Add translation keys with default English text
2. Backend can auto-translate to other languages
3. Translations are cached in the database
4. Manual translations can override auto-translations

---

## 📱 User Experience

### First Time User:
1. App detects device language (e.g., Hindi)
2. If Hindi is supported → App displays in Hindi
3. If not supported → Falls back to English
4. User can change language anytime in Settings

### Returning User:
1. App loads saved language preference from AsyncStorage
2. Displays app in saved language immediately
3. No need to select language again

---

## 🛠️ Adding New Translations

### Option 1: Via Backend Admin Panel
1. Add translation key (e.g., "products.new_feature")
2. Add default English text
3. Use auto-translate or add manual translations
4. Translations available immediately in app

### Option 2: Via Database
```sql
-- Add translation key
INSERT INTO translation_keys (key_name, category, default_text)
VALUES ('products.new_feature', 'products', 'New Feature');

-- Add translations for each language
INSERT INTO translations (translation_key_id, language_id, translated_text)
VALUES (1, 2, 'नई सुविधा'); -- Hindi
```

---

## 🎯 Best Practices

1. **Always provide fallback text**:
   ```javascript
   t('auth.login', 'Login') // ✅ Good
   t('auth.login')          // ⚠️ Works but less user-friendly
   ```

2. **Use consistent naming**:
   ```javascript
   t('auth.login')    // ✅ Good
   t('Login')         // ❌ Bad
   t('auth_login')    // ❌ Bad (use dots, not underscores)
   ```

3. **Group related translations**:
   ```javascript
   t('auth.login')
   t('auth.register')
   t('auth.logout')
   ```

4. **Keep keys descriptive**:
   ```javascript
   t('products.add_to_cart')      // ✅ Good
   t('products.btn1')             // ❌ Bad
   ```

---

## 🐛 Troubleshooting

### Translations not loading:
1. Check backend API is running
2. Verify API_CONFIG.BASE_URL is correct
3. Check network connection
4. Look for errors in console

### Language not changing:
1. Verify language code is correct
2. Check if language exists in backend
3. Clear AsyncStorage and restart app
4. Check TranslationContext is properly wrapped

### Missing translations:
1. Check if translation key exists in backend
2. Verify fallback text is provided
3. Check console for warnings about missing keys

---

## 📦 Files Created/Modified

### New Files:
- `src/context/TranslationContext.js` - Translation context and hook
- `src/utils/translationExamples.js` - Usage examples and guide

### Modified Files:
- `App.js` - Added TranslationProvider
- `src/screens/user-account/country-settings/LanguageSelectionScreen.js` - Integrated with context
- `app.config.js` - Added expo-localization plugin

### Dependencies Added:
- `expo-localization` - Device locale detection

---

## 🚀 Next Steps

1. **Add translation keys** to backend database
2. **Update existing screens** to use `t()` function
3. **Test with different languages**
4. **Add more supported languages** as needed
5. **Implement RTL layouts** for Arabic/Hebrew if needed

---

## 📞 Support

For issues or questions about the translation system:
1. Check this documentation
2. Review `translationExamples.js` for usage patterns
3. Check backend translation API documentation
4. Review console logs for debugging

---

## ✨ Features

✅ Automatic language detection
✅ Device locale-based language selection
✅ Persistent language preference
✅ Real-time language switching
✅ RTL language support
✅ Fallback to English
✅ Integration with backend API
✅ Easy-to-use hook (useTranslation)
✅ Category-based translations
✅ Auto-translation support (backend)

---

**Implementation Date**: January 22, 2026
**Status**: ✅ Complete and Ready to Use
