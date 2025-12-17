# RoundBuy Mobile App - TestFlight & Google Play Deployment Guide 🚀

## Complete Guide for iOS TestFlight and Android Internal Testing

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Build Checklist](#pre-build-checklist)
3. [EAS Build Setup](#eas-build-setup)
4. [iOS TestFlight Deployment](#ios-testflight-deployment)
5. [Android Internal Testing Deployment](#android-internal-testing-deployment)
6. [Testing & Distribution](#testing--distribution)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts:

#### ✅ Apple Developer Account
- **Cost:** $99/year
- **URL:** https://developer.apple.com
- **Required for:** TestFlight, App Store
- **Status:** ⚠️ Must be enrolled in Apple Developer Program

#### ✅ Google Play Console Account
- **Cost:** $25 one-time fee
- **URL:** https://play.google.com/console
- **Required for:** Internal Testing, Google Play Store
- **Status:** ⚠️ Must have active Google Play Developer account

#### ✅ Expo Account
- **Cost:** Free (or paid for advanced features)
- **URL:** https://expo.dev
- **Required for:** EAS Build
- **Status:** ⚠️ Sign up at expo.dev

### Required Software:

```bash
# Node.js (v20.19.4 or higher recommended)
node --version

# npm (v10.8.2 or higher)
npm --version

# Expo CLI
npm install -g expo-cli

# EAS CLI
npm install -g eas-cli
```

### Required Files:

- ✅ App Icon (1024x1024 PNG)
- ✅ Splash Screen
- ✅ Privacy Policy URL
- ✅ Terms of Service URL
- ✅ App Description
- ✅ Screenshots (various sizes)
- ✅ Keywords for App Store

---

## Pre-Build Checklist

### 1. Update App Configuration

**File:** `mobile-app/app.json`

```json
{
  "expo": {
    "name": "RoundBuy",
    "slug": "roundbuy",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.roundbuy.app",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.roundbuy.app",
      "versionCode": 1
    }
  }
}
```

**⚠️ Important:**
- `bundleIdentifier` must be unique (reverse domain notation)
- `buildNumber` (iOS) increments with each build
- `versionCode` (Android) increments with each build

### 2. Update Environment Variables

**File:** `mobile-app/.env`

```bash
# Production API URL
API_URL=https://your-production-api.com/api/v1

# Google Maps API Key (Production)
GOOGLE_MAPS_API_KEY=your_production_google_maps_key

# Other production keys
PADDLE_VENDOR_ID=your_paddle_vendor_id
```

**⚠️ Security:**
- Never commit `.env` to git
- Use different keys for production
- Enable API key restrictions on Google Cloud Console

### 3. Update API Configuration

**File:** `mobile-app/src/config/api.config.js`

```javascript
export const API_CONFIG = {
  BASE_URL: process.env.API_URL || 'https://your-production-api.com/api/v1',
  TIMEOUT: 30000,
  // ... other config
};
```

### 4. Remove Development Code

**Check for:**
- ❌ `console.log` statements (or use production logging)
- ❌ Debug alerts
- ❌ Test data
- ❌ Localhost URLs
- ❌ Development API keys

### 5. Test Thoroughly

```bash
# Test on iOS
npx expo run:ios

# Test on Android
npx expo run:android

# Test all features:
# - Login/Registration
# - Search
# - Map
# - Product details
# - Favorites
# - Payments
# - Demo mode
```

---

## EAS Build Setup

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

Enter your Expo credentials.

### Step 3: Configure EAS Project

```bash
cd /Users/ravisvyas/Code/roundbuy-new/mobile-app
eas init
```

This will:
- Create an Expo project
- Generate a project ID
- Update `app.json` with project ID

### Step 4: Create EAS Configuration

**File:** `mobile-app/eas.json`

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "ios": {
        "autoIncrement": true
      },
      "android": {
        "autoIncrement": true
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-apple-team-id"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

---

## iOS TestFlight Deployment

### Step 1: Apple Developer Setup

#### 1.1 Create App ID

1. Go to https://developer.apple.com/account
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+** (Add)
4. Select **App IDs** → **Continue**
5. Select **App** → **Continue**
6. Fill in:
   - **Description:** RoundBuy
   - **Bundle ID:** `com.roundbuy.app` (Explicit)
   - **Capabilities:** Enable required capabilities:
     - ✅ Push Notifications
     - ✅ Sign in with Apple (if using)
     - ✅ Associated Domains (if using)
7. Click **Continue** → **Register**

#### 1.2 Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform:** iOS
   - **Name:** RoundBuy
   - **Primary Language:** English
   - **Bundle ID:** Select `com.roundbuy.app`
   - **SKU:** `roundbuy-ios` (unique identifier)
   - **User Access:** Full Access
4. Click **Create**

#### 1.3 Configure App Information

1. In App Store Connect, select your app
2. Go to **App Information**
3. Fill in:
   - **Privacy Policy URL:** https://your-website.com/privacy
   - **Category:** Shopping (Primary), Lifestyle (Secondary)
   - **Content Rights:** Check if applicable
4. Save changes

### Step 2: Build for iOS

```bash
cd /Users/ravisvyas/Code/roundbuy-new/mobile-app

# Build for production
eas build --platform ios --profile production
```

**What happens:**
1. EAS uploads your code to Expo servers
2. Builds the app on Expo's infrastructure
3. Creates an `.ipa` file
4. Provides download link

**⏱️ Build Time:** 10-30 minutes

**Output:**
```
✔ Build successful!
📦 Download: https://expo.dev/artifacts/eas/...
```

### Step 3: Submit to TestFlight

#### Option A: Automatic Submission (Recommended)

```bash
eas submit --platform ios --profile production
```

**You'll be prompted for:**
- Apple ID
- App-specific password (create at appleid.apple.com)
- App Store Connect app ID

#### Option B: Manual Upload

1. Download the `.ipa` file from EAS
2. Open **Transporter** app (Mac App Store)
3. Sign in with Apple ID
4. Drag and drop `.ipa` file
5. Click **Deliver**

### Step 4: Configure TestFlight

1. Go to App Store Connect
2. Select your app
3. Go to **TestFlight** tab
4. Wait for build to process (10-30 minutes)
5. Once processed:
   - Click on the build
   - Fill in **What to Test** (release notes)
   - Add **Test Information**
   - Submit for review (if required)

### Step 5: Add Testers

#### Internal Testers (No Review Required):
1. Go to **TestFlight** → **Internal Testing**
2. Click **+** next to testers
3. Add team members (up to 100)
4. They'll receive email invitation

#### External Testers (Requires Review):
1. Go to **TestFlight** → **External Testing**
2. Create a new group
3. Add testers (up to 10,000)
4. Submit for Beta App Review
5. Wait for approval (1-2 days)

### Step 6: Distribute to Testers

Testers will:
1. Receive email invitation
2. Install **TestFlight** app from App Store
3. Accept invitation
4. Install **RoundBuy** from TestFlight

---

## Android Internal Testing Deployment

### Step 1: Google Play Console Setup

#### 1.1 Create App

1. Go to https://play.google.com/console
2. Click **Create app**
3. Fill in:
   - **App name:** RoundBuy
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** Free (or Paid)
   - **Declarations:** Check all boxes
4. Click **Create app**

#### 1.2 Set Up App Details

1. **Store listing:**
   - App name: RoundBuy
   - Short description: (80 characters)
   - Full description: (4000 characters)
   - App icon: 512x512 PNG
   - Feature graphic: 1024x500 PNG
   - Screenshots: Various sizes
   - Category: Shopping
   - Contact details: Email, website

2. **Content rating:**
   - Complete questionnaire
   - Submit for rating

3. **Target audience:**
   - Select age groups
   - Declare if app is for children

4. **Privacy policy:**
   - Add URL: https://your-website.com/privacy

5. **App access:**
   - Declare if app requires login
   - Provide demo credentials if needed

6. **Ads:**
   - Declare if app contains ads

### Step 2: Create Service Account

#### 2.1 Google Cloud Console

1. Go to https://console.cloud.google.com
2. Create new project or select existing
3. Enable **Google Play Android Developer API**
4. Go to **IAM & Admin** → **Service Accounts**
5. Click **Create Service Account**
6. Fill in:
   - **Name:** RoundBuy EAS Deploy
   - **Description:** Service account for EAS builds
7. Click **Create and Continue**
8. Grant role: **Service Account User**
9. Click **Done**

#### 2.2 Create Key

1. Click on the service account
2. Go to **Keys** tab
3. Click **Add Key** → **Create new key**
4. Select **JSON**
5. Click **Create**
6. Save file as `google-play-service-account.json`

#### 2.3 Grant Access in Play Console

1. Go to Play Console
2. Go to **Users and permissions**
3. Click **Invite new users**
4. Enter service account email
5. Grant permissions:
   - ✅ View app information
   - ✅ Manage production releases
   - ✅ Manage testing track releases
6. Click **Invite user**

### Step 3: Build for Android

```bash
cd /Users/ravisvyas/Code/roundbuy-new/mobile-app

# Build for production
eas build --platform android --profile production
```

**What happens:**
1. EAS creates Android App Bundle (`.aab`)
2. Signs with your keystore
3. Provides download link

**⏱️ Build Time:** 10-30 minutes

**Output:**
```
✔ Build successful!
📦 Download: https://expo.dev/artifacts/eas/...
```

### Step 4: Submit to Internal Testing

#### Option A: Automatic Submission (Recommended)

```bash
eas submit --platform android --profile production
```

**You'll be prompted for:**
- Service account key path
- Track: internal

#### Option B: Manual Upload

1. Download the `.aab` file from EAS
2. Go to Play Console
3. Select your app
4. Go to **Testing** → **Internal testing**
5. Click **Create new release**
6. Upload `.aab` file
7. Fill in release notes
8. Click **Review release**
9. Click **Start rollout to Internal testing**

### Step 5: Add Testers

1. Go to **Testing** → **Internal testing**
2. Go to **Testers** tab
3. Create email list:
   - Click **Create email list**
   - Name: Internal Testers
   - Add emails (up to 100)
4. Save

### Step 6: Distribute to Testers

Testers will:
1. Receive email invitation
2. Click link to opt-in
3. Install app from Google Play

---

## Testing & Distribution

### iOS TestFlight Testing

#### Tester Instructions:

**Email to send to testers:**

```
Subject: RoundBuy iOS Beta - TestFlight Invitation

Hi [Name],

You've been invited to test RoundBuy on iOS!

Steps to install:
1. Install TestFlight from the App Store (if not already installed)
2. Open the invitation email on your iPhone
3. Tap "View in TestFlight"
4. Tap "Accept" then "Install"

What to test:
- Login and registration
- Browse products
- Search functionality
- Map features
- Favorites
- Demo mode

Please report any bugs or issues to: support@roundbuy.com

Thanks for testing!
The RoundBuy Team
```

#### Collecting Feedback:

1. **TestFlight Feedback:**
   - Testers can send feedback through TestFlight app
   - View in App Store Connect → TestFlight → Feedback

2. **Crash Reports:**
   - View in App Store Connect → TestFlight → Crashes

3. **Analytics:**
   - View in App Store Connect → TestFlight → Metrics

### Android Internal Testing

#### Tester Instructions:

**Email to send to testers:**

```
Subject: RoundBuy Android Beta - Internal Testing Invitation

Hi [Name],

You've been invited to test RoundBuy on Android!

Steps to install:
1. Open the invitation email on your Android device
2. Tap the link to opt-in
3. Open Google Play Store
4. Search for "RoundBuy" or use the direct link
5. Tap "Install"

What to test:
- Login and registration
- Browse products
- Search functionality
- Map features
- Favorites
- Demo mode

Please report any bugs or issues to: support@roundbuy.com

Thanks for testing!
The RoundBuy Team
```

#### Collecting Feedback:

1. **Play Console Feedback:**
   - View in Play Console → Testing → Internal testing → Feedback

2. **Crash Reports:**
   - View in Play Console → Quality → Android vitals

3. **Pre-launch Reports:**
   - Automatic testing on various devices
   - View in Play Console → Release → Pre-launch report

---

## Build Commands Reference

### Development Builds

```bash
# iOS development build
eas build --platform ios --profile development

# Android development build
eas build --platform android --profile development

# Both platforms
eas build --platform all --profile development
```

### Preview Builds (Internal Distribution)

```bash
# iOS preview
eas build --platform ios --profile preview

# Android preview
eas build --platform android --profile preview
```

### Production Builds

```bash
# iOS production
eas build --platform ios --profile production

# Android production
eas build --platform android --profile production

# Both platforms
eas build --platform all --profile production
```

### Submit to Stores

```bash
# Submit iOS to TestFlight
eas submit --platform ios --profile production

# Submit Android to Internal Testing
eas submit --platform android --profile production

# Submit both
eas submit --platform all --profile production
```

---

## Troubleshooting

### Common iOS Issues

#### Issue: "No valid code signing identity found"

**Solution:**
```bash
# Let EAS handle code signing
eas build --platform ios --profile production --clear-credentials
```

#### Issue: "Bundle identifier already exists"

**Solution:**
- Change `bundleIdentifier` in `app.json`
- Must be unique across all apps

#### Issue: "Build failed during compilation"

**Solution:**
```bash
# Clear cache and rebuild
eas build --platform ios --profile production --clear-cache
```

### Common Android Issues

#### Issue: "Keystore not found"

**Solution:**
```bash
# Let EAS generate keystore
eas build --platform android --profile production --clear-credentials
```

#### Issue: "Package name already exists"

**Solution:**
- Change `package` in `app.json`
- Must be unique across all apps

#### Issue: "Service account permission denied"

**Solution:**
- Verify service account has correct permissions in Play Console
- Re-invite service account with all permissions

### EAS Build Issues

#### Issue: "Build queue is full"

**Solution:**
- Wait for queue to clear
- Upgrade to paid Expo plan for priority builds

#### Issue: "Out of build credits"

**Solution:**
- Upgrade Expo plan
- Or wait for monthly credits to reset

#### Issue: "Environment variables not working"

**Solution:**
```bash
# Set environment variables in eas.json
{
  "build": {
    "production": {
      "env": {
        "API_URL": "https://your-api.com"
      }
    }
  }
}
```

---

## Version Management

### Incrementing Versions

#### iOS:

**File:** `app.json`

```json
{
  "expo": {
    "version": "1.0.1",  // User-facing version
    "ios": {
      "buildNumber": "2"  // Increment for each build
    }
  }
}
```

#### Android:

```json
{
  "expo": {
    "version": "1.0.1",  // User-facing version
    "android": {
      "versionCode": 2  // Increment for each build
    }
  }
}
```

### Version Naming Convention

- **1.0.0** - Initial release
- **1.0.1** - Bug fixes
- **1.1.0** - Minor features
- **2.0.0** - Major changes

---

## Checklist Before Each Release

### Pre-Build:
- [ ] Update version numbers
- [ ] Update release notes
- [ ] Test all features
- [ ] Check API endpoints (production)
- [ ] Verify environment variables
- [ ] Remove debug code
- [ ] Update screenshots (if needed)
- [ ] Review privacy policy
- [ ] Check app permissions

### Post-Build:
- [ ] Test build on real device
- [ ] Verify all features work
- [ ] Check crash reports
- [ ] Monitor tester feedback
- [ ] Fix critical bugs
- [ ] Prepare for production release

---

## Quick Start Commands

### First Time Setup:

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login to Expo
eas login

# 3. Initialize project
cd /Users/ravisvyas/Code/roundbuy-new/mobile-app
eas init

# 4. Configure builds
# Edit eas.json with your settings

# 5. Build for both platforms
eas build --platform all --profile production

# 6. Submit to stores
eas submit --platform all --profile production
```

### Subsequent Builds:

```bash
# 1. Update version in app.json
# 2. Build
eas build --platform all --profile production

# 3. Submit
eas submit --platform all --profile production
```

---

## Support & Resources

### Documentation:
- **Expo EAS:** https://docs.expo.dev/eas/
- **App Store Connect:** https://developer.apple.com/app-store-connect/
- **Google Play Console:** https://support.google.com/googleplay/android-developer

### Support:
- **Expo Discord:** https://chat.expo.dev
- **Expo Forums:** https://forums.expo.dev
- **Stack Overflow:** Tag with `expo` and `eas`

---

## Summary

You now have a complete guide to:

1. ✅ Set up EAS Build
2. ✅ Build for iOS and Android
3. ✅ Submit to TestFlight
4. ✅ Submit to Google Play Internal Testing
5. ✅ Distribute to testers
6. ✅ Collect feedback
7. ✅ Troubleshoot issues

**Next Steps:**
1. Complete Apple Developer enrollment
2. Complete Google Play Developer registration
3. Run `eas init` to set up project
4. Create `eas.json` configuration
5. Run first build: `eas build --platform all --profile production`

Good luck with your deployment! 🚀
