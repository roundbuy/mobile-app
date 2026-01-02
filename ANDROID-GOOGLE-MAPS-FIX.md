# Google Maps API Key Fix for Android ✅

## Issue
Android app crashed on SearchScreen with error:
```
java.lang.RuntimeException: API key not found. Check that <meta-data
android:name="com.google.android.geo.API_KEY"
android:value="your API key"/>
is in the <application> element of AndroidManifest.xml
```

## Root Cause
The Google Maps API key was configured in `app.config.js` but not injected into `AndroidManifest.xml` during the build process.

## Solution

### Step 1: Ran Expo Prebuild
```bash
npx expo prebuild --platform android --clean
```

This regenerates the Android native code with the latest configuration.

### Step 2: Added API Key to AndroidManifest.xml
```bash
sed -i.bak '36i\
    <meta-data android:name="com.google.android.geo.API_KEY" android:value="AIzaSyA7xDzwDpKqHknfWZdIm2yUcKIBtpPk4UE"/>\
' android/app/src/main/AndroidManifest.xml
```

This adds the Google Maps API key meta-data to the AndroidManifest.xml file.

### Step 3: Rebuilt the App
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
npx expo run:android
```

## What Was Added

**File:** `android/app/src/main/AndroidManifest.xml`

```xml
<application>
    <!-- ... other configuration ... -->
    
    <!-- Google Maps API Key -->
    <meta-data 
        android:name="com.google.android.geo.API_KEY" 
        android:value="AIzaSyA7xDzwDpKqHknfWZdIm2yUcKIBtpPk4UE"/>
    
</application>
```

## API Key Configuration

The API key is defined in `app.config.js`:

```javascript
android: {
    config: {
        googleMaps: {
            apiKey: "AIzaSyA7xDzwDpKqHknfWZdIm2yUcKIBtpPk4UE"
        }
    }
}
```

## Verification

Check if API key is in manifest:
```bash
grep "com.google.android.geo.API_KEY" android/app/src/main/AndroidManifest.xml
```

Should output:
```xml
<meta-data android:name="com.google.android.geo.API_KEY" android:value="AIzaSyA7xDzwDpKqHknfWZdIm2yUcKIBtpPk4UE"/>
```

## Why This Happened

1. **Expo Prebuild Not Run:** The Android native code wasn't regenerated with the latest config
2. **Manual Native Code:** If you manually modified Android code, prebuild might not have run
3. **Config Changes:** Changes to `app.config.js` require prebuild to take effect

## When to Run Prebuild

Run `npx expo prebuild` when you:
- Change `app.config.js` configuration
- Add new native dependencies
- Update Expo SDK version
- Need to regenerate native code

## Important Notes

### API Key Security
⚠️ The API key in the manifest is visible in the APK. For production:
1. Restrict the API key in Google Cloud Console
2. Add package name restriction: `com.roundbuy.app`
3. Add SHA-1 fingerprint restriction

### Get SHA-1 Fingerprint
```bash
# Debug keystore
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Release keystore
keytool -list -v -keystore android/app/release.keystore -alias roundbuy
```

## Google Cloud Console Setup

1. Go to: https://console.cloud.google.com/
2. Select your project
3. Navigate to: APIs & Services → Credentials
4. Find your API key
5. Click "Edit API key"
6. Under "Application restrictions":
   - Select "Android apps"
   - Add package name: `com.roundbuy.app`
   - Add SHA-1 fingerprint (from keytool command above)

## Troubleshooting

### If Maps Still Don't Work:

**1. Check API Key is Enabled:**
```bash
grep "com.google.android.geo.API_KEY" android/app/src/main/AndroidManifest.xml
```

**2. Check Google Cloud Console:**
- Maps SDK for Android is enabled
- API key has no restrictions OR is restricted to your app

**3. Clean and Rebuild:**
```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

**4. Check Logs:**
```bash
adb logcat | grep -i "maps\|google"
```

## Common Errors

### Error: "API key not found"
**Solution:** Add meta-data to AndroidManifest.xml (as shown above)

### Error: "This API key is not authorized"
**Solution:** 
1. Check API key restrictions in Google Cloud Console
2. Add your app's package name and SHA-1 fingerprint

### Error: "Maps SDK for Android is not enabled"
**Solution:** Enable it in Google Cloud Console

## Summary

**Problem:** Google Maps API key not in AndroidManifest.xml

**Solution:**
1. ✅ Ran `npx expo prebuild --platform android --clean`
2. ✅ Added API key meta-data to AndroidManifest.xml
3. ✅ Rebuilt the app

**Result:** Google Maps now works on Android! 🗺️

**API Key:** `AIzaSyA7xDzwDpKqHknfWZdIm2yUcKIBtpPk4UE`

**Location in Code:**
- Config: `app.config.js` → `android.config.googleMaps.apiKey`
- Manifest: `android/app/src/main/AndroidManifest.xml`

Maps should now load correctly on Android! 🤖✨
