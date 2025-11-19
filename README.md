# RoundBuy Mobile App

A React Native mobile application for RoundBuy - Shop Round The Corner. Built with Expo for iOS, Android, and Web platforms.

## Features Implemented

### Onboarding Flow
1. **Splash Screen** - Animated RoundBuy logo with brand tagline
2. **License Agreement** - End User License Agreement with accept/cancel options
3. **Policy Selection** - Navigate to Terms, License, or Privacy Policy details
4. **Policy Detail Views** - Full-text display of each policy with download option
5. **ATT Prompt** - App Tracking Transparency permission request (iOS)
6. **Cookies Consent** - Cookie usage consent with accept/reject options
7. **Cookie Settings** - Granular cookie preferences (Necessary, Functional, Analytics, Performance, Advertising, Uncategorized)

## Tech Stack

- **React Native** - Mobile app framework
- **Expo** - Development platform
- **React Navigation** - Navigation library
  - Stack Navigator for screen transitions
  - Modal presentations for prompts
- **React Native Safe Area Context** - Safe area handling

## Project Structure

```
mobile-app/
├── src/
│   ├── screens/               # All app screens
│   │   ├── SplashScreen.js
│   │   ├── LicenseAgreementScreen.js
│   │   ├── PolicySelectionScreen.js
│   │   ├── PolicyDetailScreen.js
│   │   ├── ATTPromptScreen.js
│   │   ├── CookiesConsentScreen.js
│   │   └── CookieSettingsScreen.js
│   ├── navigation/            # Navigation configuration
│   │   └── AppNavigator.js
│   ├── constants/             # App constants
│   │   └── theme.js          # Colors, sizes, fonts
│   ├── components/            # Reusable components
│   └── assets/               # Images, fonts, etc.
├── App.js                    # Main app component
├── app.json                  # Expo configuration
└── package.json              # Dependencies

```

## Installation

1. **Navigate to the mobile-app directory:**
   ```bash
   cd mobile-app
   ```

2. **Install dependencies** (already done during setup):
   ```bash
   npm install
   ```

## Running the App

### Start Development Server
```bash
npm start
```

This will open Expo DevTools in your browser.

### Run on Different Platforms

#### iOS (requires macOS)
```bash
npm run ios
```

#### Android
```bash
npm run android
```

#### Web Browser
```bash
npm run web
```

### Using Expo Go App
1. Install Expo Go on your iOS or Android device
2. Scan the QR code from the terminal or Expo DevTools
3. The app will load on your device

## Screen Flow

```
Splash Screen (2s auto-transition)
    ↓
License Agreement
    ↓ [Accept]
Policy Selection (Optional: View individual policies)
    ↓ [Accept]
ATT Prompt (Modal)
    ↓ [Allow/Deny]
Cookies Consent (Modal)
    ↓ [Accept All / Reject All / More Info]
Cookie Settings (if More Info selected)
    ↓ [Save Choices]
→ Main App (To be implemented)
```

## Design Features

### Branding
- **Primary Color:** #1E6FD6 (RoundBuy Blue)
- **Logo:** Circular design with location pin icon
- **Tagline:** "Shop Round The Corner"

### UI Components
- Custom logo component with circular design
- Modal overlays for prompts
- Scrollable policy content
- Toggle switches for cookie preferences
- Rounded buttons with primary/secondary styles

### Accessibility
- Safe area support for notched devices
- High contrast text
- Clear button hierarchies
- Readable font sizes

## Configuration

### App Branding (app.json)
- App name: RoundBuy
- Bundle ID: com.roundbuy.app
- Orientation: Portrait only
- Color scheme: Light mode

### iOS Specific
- ATT permission message configured
- Supports tablets
- Bundle identifier ready for App Store

### Android Specific
- Adaptive icon with RoundBuy blue background
- Location permissions included
- Version code management

## Dependencies

```json
{
  "@react-navigation/native": "^6.x",
  "@react-navigation/stack": "^6.x",
  "react-native-screens": "latest",
  "react-native-safe-area-context": "latest",
  "expo-splash-screen": "latest"
}
```

## Next Steps

1. **Main App Implementation**
   - Home screen
   - Product listings
   - User profile
   - Shopping cart
   - Order management

2. **Backend Integration**
   - Connect to RoundBuy API (http://localhost:5000)
   - User authentication
   - Product data fetching
   - Order processing

3. **Additional Features**
   - Push notifications
   - Location services
   - Payment integration
   - Social sharing
   - Product search and filters

4. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests with Detox

5. **Deployment**
   - iOS App Store submission
   - Google Play Store submission
   - Web hosting

## Development Tips

### Hot Reloading
- Changes to JavaScript files will automatically reload
- Use `r` in terminal to manually reload
- Use `j` to open Chrome DevTools

### Debugging
- Use console.log() statements
- Chrome DevTools for web version
- React Native Debugger for mobile
- Expo DevTools for network requests

### Common Commands
```bash
# Clear cache and restart
npm start -- --clear

# Update dependencies
npm install

# Check for Expo updates
expo upgrade

# Generate Android/iOS builds
eas build --platform ios
eas build --platform android
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9
```

### Metro Bundler Issues
```bash
# Clear watchman
watchman watch-del-all

# Clear Metro cache
npm start -- --reset-cache
```

### iOS Build Issues
```bash
cd ios && pod install && cd ..
```

## Contributing

When adding new screens or features:
1. Create screen component in `src/screens/`
2. Add route to `src/navigation/AppNavigator.js`
3. Update this README with new features
4. Follow the existing design patterns

## License

Copyright © 2025 RoundBuy Private Ltd. All rights reserved.

## Contact

For support or queries:
- Email: support@roundbuy.in
- Website: https://roundbuy.in