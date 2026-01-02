# Android SDK Setup Fix ✅

## Issue
Android build failed with error:
```
SDK location not found. Define a valid SDK location with an ANDROID_HOME 
environment variable or by setting the sdk.dir path in your project's 
local properties file at 'android/local.properties'.
```

## Root Cause
- Android SDK was installed but not configured
- Missing `local.properties` file
- Missing `ANDROID_HOME` environment variable

## Solution

### Step 1: Created local.properties File

**File:** `android/local.properties`
```properties
sdk.dir=/Users/ravisvyas/Library/Android/sdk
```

This tells Gradle where to find the Android SDK.

### Step 2: Set ANDROID_HOME Environment Variable

Added to `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## How to Run Android Build

### Option 1: With Environment Variable (Recommended)
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
npx expo run:android
```

### Option 2: After Restarting Terminal
```bash
# Close and reopen terminal (to load .zshrc)
npx expo run:android
```

### Option 3: Source .zshrc
```bash
source ~/.zshrc
npx expo run:android
```

## What Was Fixed

✅ Created `android/local.properties` with SDK path
✅ Added `ANDROID_HOME` to shell environment
✅ Added Android tools to PATH
✅ Build now proceeds successfully

## Verification

Check if SDK is configured:
```bash
echo $ANDROID_HOME
# Should output: /Users/ravisvyas/Library/Android/sdk

cat android/local.properties
# Should output: sdk.dir=/Users/ravisvyas/Library/Android/sdk
```

## Android SDK Location

Your Android SDK is installed at:
```
/Users/ravisvyas/Library/Android/sdk
```

This includes:
- `build-tools/` - Build tools
- `platform-tools/` - ADB, fastboot, etc.
- `platforms/` - Android API levels
- `emulator/` - Android emulator
- `ndk/` - Native Development Kit

## Environment Variables Explained

### ANDROID_HOME
Points to the Android SDK root directory. Required by Gradle and other Android tools.

### PATH Additions
- `$ANDROID_HOME/emulator` - Access to Android emulator
- `$ANDROID_HOME/platform-tools` - Access to adb, fastboot

## Running on Android

### Physical Device:
1. Enable USB debugging on your Android device
2. Connect via USB
3. Run: `npx expo run:android`

### Emulator:
1. Open Android Studio
2. Start an emulator (AVD Manager)
3. Run: `npx expo run:android`

## Common Commands

```bash
# List connected devices
adb devices

# Start emulator
emulator -avd Pixel_5_API_33

# Run on specific device
npx expo run:android --device <device-id>

# Clean build
cd android && ./gradlew clean && cd ..
npx expo run:android
```

## Troubleshooting

### If build still fails:

**1. Verify SDK location:**
```bash
ls ~/Library/Android/sdk
```

**2. Check local.properties:**
```bash
cat android/local.properties
```

**3. Clean and rebuild:**
```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

**4. Update Android SDK:**
Open Android Studio → SDK Manager → Update components

## Summary

**Problem:** Android SDK not configured

**Solution:**
1. Created `android/local.properties` with SDK path
2. Set `ANDROID_HOME` environment variable
3. Added Android tools to PATH

**Result:** ✅ Android build now works!

**Command to run:**
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
npx expo run:android
```

Android build is now configured! 🤖✨
