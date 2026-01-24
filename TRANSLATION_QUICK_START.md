# 🚀 Quick Start: Adding Translations to Your Screens

This guide shows you how to quickly add translation support to any screen in the RoundBuy mobile app.

---

## 📋 Step-by-Step Guide

### Step 1: Import the Translation Hook

At the top of your component file, import the `useTranslation` hook:

```javascript
import { useTranslation } from '../context/TranslationContext';
// Adjust the path based on your file location
// From screens/: '../context/TranslationContext'
// From screens/user-account/: '../../context/TranslationContext'
// From screens/user-account/billing-payments/: '../../../context/TranslationContext'
```

### Step 2: Use the Hook in Your Component

```javascript
const MyScreen = ({ navigation }) => {
  const { t, currentLanguage, changeLanguage } = useTranslation();
  
  // Your component code...
};
```

### Step 3: Replace Hardcoded Strings

**Before:**
```javascript
<Text style={styles.title}>Welcome to RoundBuy</Text>
<Button title="Login" onPress={handleLogin} />
<Text>Loading...</Text>
```

**After:**
```javascript
<Text style={styles.title}>{t('home.welcome', 'Welcome to RoundBuy')}</Text>
<Button title={t('auth.login', 'Login')} onPress={handleLogin} />
<Text>{t('common.loading', 'Loading...')}</Text>
```

---

## 🎯 Translation Key Naming Convention

Follow this pattern for consistency:

```
{category}.{specific_key}
```

### Examples:

| Category | Key | Full Key | English Text |
|----------|-----|----------|--------------|
| auth | login | `auth.login` | Login |
| auth | register | `auth.register` | Register |
| home | welcome | `home.welcome` | Welcome to RoundBuy |
| products | price | `products.price` | Price |
| common | save | `common.save` | Save |
| error | network | `error.network` | Network error |

---

## 📱 Real-World Examples

### Example 1: Login Screen

```javascript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTranslation } from '../../context/TranslationContext';

const LoginScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.sign_in', 'Sign In')}</Text>
      
      <TextInput
        placeholder={t('auth.email', 'Email')}
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      
      <TextInput
        placeholder={t('auth.password', 'Password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>{t('auth.login', 'Login')}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.link}>{t('auth.forgot_password', 'Forgot Password?')}</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Example 2: Product Card

```javascript
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useTranslation } from '../../context/TranslationContext';

const ProductCard = ({ product, onPress }) => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <Text style={styles.title}>{product.title}</Text>
      <Text style={styles.price}>
        {t('products.price', 'Price')}: ${product.price}
      </Text>
      <Text style={styles.location}>
        {t('products.location', 'Location')}: {product.location}
      </Text>
      <Text style={styles.views}>
        {t('ads.views', 'Views')}: {product.views}
      </Text>
    </TouchableOpacity>
  );
};
```

### Example 3: Settings Screen with Language Switcher

```javascript
import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from '../../context/TranslationContext';

const SettingsScreen = ({ navigation }) => {
  const { t, currentLanguage, changeLanguage } = useTranslation();

  const handleLanguageChange = async (langCode) => {
    const success = await changeLanguage(langCode);
    if (success) {
      Alert.alert(
        t('common.success', 'Success'),
        t('settings.language_changed', 'Language changed successfully')
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('profile.settings', 'Settings')}</Text>
      
      <TouchableOpacity 
        style={styles.item}
        onPress={() => navigation.navigate('LanguageSelection')}
      >
        <Text style={styles.itemText}>{t('settings.language', 'Language')}</Text>
        <Text style={styles.itemValue}>{currentLanguage.toUpperCase()}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.item}>
        <Text style={styles.itemText}>{t('settings.currency', 'Currency')}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.item}>
        <Text style={styles.itemText}>{t('settings.privacy', 'Privacy')}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.item}>
        <Text style={styles.itemText}>{t('settings.help', 'Help & Support')}</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Example 4: Error Handling

```javascript
import React, { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTranslation } from '../../context/TranslationContext';

const DataFetchingScreen = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.example.com/data');
      if (!response.ok) throw new Error('Network error');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(t('error.network', 'Network error. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>{t('common.loading', 'Loading...')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Render data */}
    </View>
  );
};
```

---

## 🎨 Advanced Usage

### Dynamic Translation Keys

```javascript
const { t } = useTranslation();

const statuses = ['pending', 'approved', 'rejected'];

statuses.map(status => (
  <Text key={status}>
    {t(`ads.status.${status}`, status.charAt(0).toUpperCase() + status.slice(1))}
  </Text>
));
```

### Pluralization (Manual)

```javascript
const { t } = useTranslation();

const itemCount = 5;
const text = itemCount === 1 
  ? t('products.item_singular', '1 item')
  : t('products.items_plural', `${itemCount} items`);
```

### String Interpolation

```javascript
const { t } = useTranslation();

const userName = 'John';
const greeting = t('home.greeting', 'Hello').replace('{name}', userName);
// Or use template literals with fallback:
const message = `${t('home.welcome', 'Welcome')}, ${userName}!`;
```

---

## 📊 Available Translation Categories

### 1. Authentication (`auth`)
- login, register, sign_in, sign_up
- email, password, confirm_password
- forgot_password, reset_password
- verify_email, full_name, phone

### 2. Home (`home`)
- welcome, categories, featured
- new_arrivals, search_placeholder

### 3. Products (`products`)
- price, description, seller, location
- condition, add_to_favorites, contact_seller
- share, report, search, filter, sort

### 4. Advertisements (`ads`)
- create, title, images, upload_images
- publish, draft, status, views, category

### 5. Common (`common`)
- save, cancel, delete, edit, update
- loading, yes, no, ok, confirm
- back, next, previous, close, submit

### 6. Profile (`profile`)
- my_profile, edit_profile, favorites
- my_ads, notifications, settings, subscription

### 7. Chat (`chat`)
- messages, send_message, type_message
- typing, online, offline

### 8. Filters (`filter`)
- apply, clear, price_range
- min_price, max_price

### 9. Sorting (`sort`)
- newest, oldest, popular
- price_low, price_high

### 10. Settings (`settings`)
- language, currency, theme
- privacy, terms, help

### 11. Errors (`error`)
- network, server, unauthorized
- not_found, required_field
- invalid_email, password_mismatch

### 12. Success Messages (`success`)
- saved, updated, deleted, sent

---

## 🔍 Finding the Right Translation Key

1. **Check existing keys** in the backend:
   ```bash
   curl http://localhost:5001/api/v1/mobile-app/translations?language=en | jq '.data.translations | keys'
   ```

2. **Search in the database**:
   ```sql
   SELECT key_name, default_text FROM translation_keys WHERE key_name LIKE '%search_term%';
   ```

3. **If key doesn't exist**, use a descriptive fallback:
   ```javascript
   t('new.key.name', 'Descriptive Fallback Text')
   ```

---

## ✅ Best Practices

### DO ✅
- Always provide a fallback text as the second parameter
- Use descriptive, semantic key names
- Group related keys by category
- Keep translation keys lowercase with dots
- Test with multiple languages

### DON'T ❌
- Don't hardcode strings directly in JSX
- Don't use generic keys like `text1`, `text2`
- Don't forget the fallback parameter
- Don't mix languages in key names
- Don't use special characters in keys

---

## 🧪 Testing Your Translations

### 1. Visual Test
```javascript
// Add this to your screen temporarily
<View style={{ padding: 20, backgroundColor: '#f0f0f0' }}>
  <Text>Current Language: {currentLanguage}</Text>
  <Text>{t('your.key', 'Your Fallback')}</Text>
</View>
```

### 2. Language Switching Test
1. Navigate to Language Selection screen
2. Switch between languages
3. Verify your text updates correctly

### 3. Device Locale Test
1. Change device language settings
2. Restart the app
3. Verify automatic language detection

---

## 📝 Quick Reference Card

```javascript
// Import
import { useTranslation } from '../context/TranslationContext';

// Use in component
const { t, currentLanguage, changeLanguage } = useTranslation();

// Translate text
{t('category.key', 'Fallback Text')}

// Change language
await changeLanguage('hi'); // Hindi
await changeLanguage('es'); // Spanish
await changeLanguage('fr'); // French
await changeLanguage('en'); // English

// Get current language
console.log(currentLanguage); // 'en', 'hi', 'es', 'fr'
```

---

## 🎯 Priority Screens to Translate

Start with these high-impact screens:

1. ✅ **LanguageSelectionScreen** - Already done!
2. 🔲 **LoginScreen** / **RegisterScreen**
3. 🔲 **HomeScreen**
4. 🔲 **ProductDetailScreen**
5. 🔲 **CreateAdvertisementScreen**
6. 🔲 **UserProfileScreen**
7. 🔲 **SettingsScreen**
8. 🔲 **NotificationSettingsScreen**
9. 🔲 **BillingPaymentsScreen**
10. 🔲 **SearchScreen**

---

**Happy Translating! 🌍**
