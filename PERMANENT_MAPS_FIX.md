# ✅ Permanent Google Maps iOS Configuration

## The Issue
By default, `npx expo prebuild` regenerates the `ios` directory, wiping out any manual changes to `Podfile` or `AppDelegate.swift`. This would cause Google Maps to break (crash or white screen) every time we cleaned the project.

## The Solution: Custom Config Plugin
We created a custom Expo Config Plugin that automatically applies the necessary native changes during the prebuild process.

### 1. Plugin Source Code
Location: `mobile-app/plugins/withGoogleMapsIOS.js`

**What it does:**
- **Podfile**: Automatically adds `pod 'react-native-maps/Google'` subspec.
- **AppDelegate**: Automatically adds `import GoogleMaps` and `GMSServices.provideAPIKey(...)`.

### 2. Configuration
Location: `mobile-app/app.config.js`

We registered the plugin in the `plugins` section:
```javascript
plugins: [
  // ... other plugins
  [
    "./plugins/withGoogleMapsIOS",
    {
      "apiKey": "AIzaSyA7xDzwDpKqHknfWZdIm2yUcKIBtpPk4UE"
    }
  ]
]
```

## How to Maintain

### Updates
If you need to update the API key, change it in **both**:
1. `app.config.js` (under `ios.config.googleMapsApiKey` AND in the plugin config)
2. `app.json` (if you use it)

### Cleaning the Project
Now you can safely run:
```bash
npx expo prebuild --platform ios --clean
```
The plugin will run and re-apply all the fixes automatically. **You verify this by checking `ios/Podfile` after prebuild - it should contain the Google Maps lines.**

## Troubleshooting
If `prebuild` fails with an error about the plugin:
1. Ensure `plugins/withGoogleMapsIOS.js` exists.
2. Ensure `@expo/config-plugins` is installed (it usually is).

This setup ensures your map works reliably forever! 🚀
