# React Native Maps Fix Guide

## Problem
The error `RNMapsAirModule could not be found` occurs because `react-native-maps` with `PROVIDER_GOOGLE` requires native code that isn't available in Expo Go.

## Solution Applied

1. ✅ Installed `expo-location` package
2. ✅ Cleared Expo cache
3. ✅ Prebuilt native directories (`/ios` and `/android`)

## Next Steps - Run Your App

Since we've prebuilt the native code, you **cannot** use Expo Go anymore. You need to run the app with a development build:

### For Android:
```bash
cd mobile-app
npx expo run:android
```

### For iOS (macOS only):
```bash
cd mobile-app
npx expo run:ios
```

## Alternative Solutions

### Option 1: Use Default Provider (Recommended for Quick Testing)
If you want to use Expo Go for faster development, modify `SearchScreen.js` to use the default map provider:

```javascript
// Change from:
<MapView
  provider={PROVIDER_GOOGLE}
  ...
/>

// To:
<MapView
  ...
/>
```

Then remove the `PROVIDER_GOOGLE` import and it will work in Expo Go.

### Option 2: Create EAS Build
For production or testing on physical devices:

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to Expo
eas login

# Create a development build
eas build --profile development --platform android
# or
eas build --profile development --platform ios
```

## Important Notes

- **Native modules require native builds** - Expo Go has limitations
- After running `npx expo prebuild`, your `/ios` and `/android` folders contain native code
- You can now use any React Native library, not just Expo-compatible ones
- Development builds are faster than production builds and include dev tools

## To Test Your Fix

1. Connect your Android device or start Android emulator
2. Run: `npm run android` or `npx expo run:android`
3. The app will build and install on your device
4. The map should now work without the `RNMapsAirModule` error

## Reverting to Expo Go (if needed)

If you want to go back to using Expo Go:
```bash
# Remove native directories
rm -rf ios android

# Remove the PROVIDER_GOOGLE usage from your code
# Use default MapView without provider prop