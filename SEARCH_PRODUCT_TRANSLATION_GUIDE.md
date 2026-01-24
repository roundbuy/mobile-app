# 🌍 Translation Integration Guide - Search & Product Screens

## ✅ Current Status

**Completed:**
- ✅ User Account Screen - Fully translated (27 keys)
- ✅ Language Selection Screen - Fully translated
- ✅ Translation system working perfectly

**Next Steps:**
- 🔲 Search Screen
- 🔲 Product Details Screen

---

## 📋 Pattern to Follow

Based on the successful User Account screen integration, here's the exact pattern to use:

### Step 1: Import Translation Hook

```javascript
import { useTranslation } from '../../context/TranslationContext';
```

### Step 2: Use Hook in Component

```javascript
const SearchScreen = ({ navigation }) => {
  const { t } = useTranslation();
  
  // ... rest of component
};
```

### Step 3: Replace Hardcoded Strings

**Before:**
```javascript
<TextInput
  placeholder="Search Around You"
  // ...
/>
```

**After:**
```javascript
<TextInput
  placeholder={t('search.placeholder', 'Search Around You')}
  // ...
/>
```

---

## 🔍 Search Screen - Translation Keys Needed

Based on the SearchScreen.js file, here are the strings that need translation:

### Search & Filters
```javascript
// Search bar
t('search.placeholder', 'Search Around You')

// Filter buttons
t('search.filter', 'Filter')
t('search.distance', 'Distance')
t('search.category', 'Category')
t('search.price', 'Price')

// Results
t('search.loading', 'Loading...')
t('search.results', 'results')
t('search.instructions', 'Instructions')
```

### Messages & Alerts
```javascript
// Subscription required
t('search.subscription_required', 'Active subscription required to browse advertisements')
t('search.view_plans', 'View Plans')

// Location setup
t('search.set_location_title', 'Set Your Location')
t('search.set_location_message', 'Please set your default location to start browsing advertisements.')
t('search.set_location_button', 'Set Location')

// Errors
t('search.subscription_title', 'Subscription Required')
t('search.subscription_message', 'You need an active subscription to browse advertisements.')
t('search.login_title', 'Login Required')
t('search.login_message', 'Please login to browse advertisements.')
t('search.error_title', 'Error')
t('search.error_message', 'Failed to load advertisements. Please try again.')

// Empty state
t('search.no_results', 'No advertisements found')
t('search.adjust_filters', 'Try adjusting your filters')

// Map view
t('search.your_location', 'Your Location')
t('search.selected_location', 'Selected Location')
t('search.tap_to_view', 'Tap to view details')
t('search.locations_approximate', 'Locations are approximate.')
t('search.read_more', 'Read more')

// View toggle
t('search.products', 'Products')
t('search.map', 'Map')

// Distance
t('search.distance_km', 'km')
t('search.distance_label', 'Distance')

// Placeholders
t('search.no_image', 'No Image')
t('search.distance_text', 'Distance')
t('search.min_walk', 'min walk')
```

---

## 📱 Product Details Screen - Translation Keys Needed

### Product Information
```javascript
t('product.title', 'Product Details')
t('product.price', 'Price')
t('product.description', 'Description')
t('product.condition', 'Condition')
t('product.location', 'Location')
t('product.seller', 'Seller')
t('product.views', 'Views')
t('product.posted', 'Posted')
t('product.category', 'Category')
```

### Actions
```javascript
t('product.contact_seller', 'Contact Seller')
t('product.make_offer', 'Make Offer')
t('product.add_to_favorites', 'Add to Favorites')
t('product.share', 'Share')
t('product.report', 'Report')
```

### Seller Info
```javascript
t('product.seller_info', 'Seller Information')
t('product.member_since', 'Member Since')
t('product.rating', 'Rating')
t('product.view_profile', 'View Profile')
```

---

## 🚀 Quick Implementation Steps

### For Search Screen:

1. **Add translation keys to database:**
```bash
# Create seed script for search translations
node backend/scripts/seed-search-translations.js

# Generate translations
node backend/scripts/translate-search-keys.mjs
```

2. **Update SearchScreen.js:**
```javascript
// Line 1: Add import
import { useTranslation } from '../../context/TranslationContext';

// Line 24: Add hook
const { t } = useTranslation();

// Line 585: Update placeholder
placeholder={t('search.placeholder', 'Search Around You')}

// Line 602: Update filter button
<Text style={styles.filterButtonText}>{t('search.filter', 'Filter')}</Text>

// Line 632: Update results count
{loading ? t('search.loading', 'Loading...') : `${advertisements.length} ${t('search.results', 'results')}`}

// And so on...
```

### For Product Details Screen:

Similar pattern - import hook, use `t()` function for all text.

---

## 📝 Script Template

Here's a template for creating translation seed scripts:

```javascript
// backend/scripts/seed-search-translations.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const translations = {
  'search.placeholder': 'Search Around You',
  'search.filter': 'Filter',
  'search.distance': 'Distance',
  'search.category': 'Category',
  'search.price': 'Price',
  'search.loading': 'Loading...',
  'search.results': 'results',
  // ... add all keys
};

async function seedSearchTranslations() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'roundbuy',
      port: process.env.DB_PORT || 3306,
    });

    console.log('✅ Connected to database');

    let addedCount = 0;

    for (const [keyName, defaultText] of Object.entries(translations)) {
      const [existing] = await connection.query(
        'SELECT id FROM translation_keys WHERE key_name = ?',
        [keyName]
      );

      if (existing.length > 0) {
        console.log(`⏭️  Skipped: ${keyName}`);
        continue;
      }

      const category = keyName.split('.')[0];

      const [result] = await connection.query(
        `INSERT INTO translation_keys (key_name, category, default_text, description)
         VALUES (?, ?, ?, ?)`,
        [keyName, category, defaultText, `Translation for ${keyName}`]
      );

      const translationKeyId = result.insertId;

      const [languages] = await connection.query(
        'SELECT id, code FROM languages WHERE is_active = TRUE'
      );

      const englishLang = languages.find(l => l.code === 'en');
      if (englishLang) {
        await connection.query(
          `INSERT INTO translations (translation_key_id, language_id, translated_text, is_auto_translated)
           VALUES (?, ?, ?, FALSE)`,
          [translationKeyId, englishLang.id, defaultText]
        );
      }

      console.log(`✅ Added: ${keyName}`);
      addedCount++;
    }

    console.log(`\n✅ Added ${addedCount} translation keys`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

seedSearchTranslations();
```

---

## 🎯 Recommended Approach

Given the size of SearchScreen (1622 lines) and ProductDetailsScreen, I recommend:

### Option 1: Gradual Translation
Start with the most visible text:
1. ✅ Search placeholder
2. ✅ Filter buttons
3. ✅ Results count
4. ✅ Error messages
5. ✅ Empty states

### Option 2: Full Translation
Create comprehensive translation keys for all text in one go.

### Option 3: Component-by-Component
Break down large screens into smaller components and translate each.

---

## 📊 Estimated Translation Keys

| Screen | Estimated Keys | Priority |
|--------|---------------|----------|
| Search Screen | ~40 keys | High |
| Product Details | ~30 keys | High |
| Home Screen | ~20 keys | Medium |
| Favorites | ~15 keys | Medium |
| Messages | ~25 keys | Medium |

**Total**: ~130 additional keys needed for full app translation

---

## ✅ What's Already Working

The translation system is **fully functional** and ready to use:

1. ✅ Backend API serving translations
2. ✅ Google Translate auto-generating missing translations
3. ✅ Frontend context managing state
4. ✅ Language switching working
5. ✅ User Account screen fully translated (proof of concept)

---

## 🚀 Next Steps

**Immediate:**
1. Review this guide
2. Decide which screens to translate next
3. I can help create the translation scripts

**Short-term:**
1. Translate Search Screen (highest priority)
2. Translate Product Details Screen
3. Translate Home Screen

**Long-term:**
1. Translate all remaining screens
2. Add more languages (German, Italian, Chinese, etc.)
3. Implement RTL support for Arabic/Hebrew

---

## 💡 Tips

1. **Use descriptive keys**: `search.placeholder` not `text1`
2. **Always provide fallback**: `t('key', 'Fallback Text')`
3. **Group by category**: All search-related keys start with `search.`
4. **Test immediately**: Change language after adding translations
5. **Use route properties**: For navigation, use stable identifiers not translated text

---

**Would you like me to:**
1. ✅ Create translation scripts for Search Screen?
2. ✅ Add translations to Product Details Screen?
3. ✅ Translate another specific screen?

Let me know which screen you'd like me to tackle next!

---

**Date**: January 22, 2026  
**Status**: Translation System Ready  
**Next**: Your choice of screen to translate
