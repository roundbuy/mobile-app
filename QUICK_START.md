# RoundBuy Mobile App - Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Navigate to Mobile App Directory
```bash
cd mobile-app
```

### 2. Start the Development Server
```bash
npm start
```

### 3. Choose Your Platform

Once the server starts, you'll see a QR code and options:

- **Press `w`** - Open in web browser
- **Press `i`** - Open iOS Simulator (requires macOS with Xcode)
- **Press `a`** - Open Android Emulator (requires Android Studio)
- **Scan QR code** - Open on physical device with Expo Go app

## 📱 Testing on Physical Device

### iOS (iPhone/iPad)
1. Install **Expo Go** from App Store
2. Open Expo Go app
3. Scan QR code from terminal
4. App will load on your device

### Android
1. Install **Expo Go** from Play Store
2. Open Expo Go app
3. Scan QR code from terminal
4. App will load on your device

## 🎨 What's Implemented

The app includes the complete onboarding flow as per your design:

1. ✅ **Splash Screen** - RoundBuy logo with auto-transition (2 seconds)
2. ✅ **License Agreement** - EULA with Accept/Cancel buttons
3. ✅ **Policy Selection** - Links to Terms, License Agreement, and Privacy Policy
4. ✅ **Policy Details** - Full text view with Download PDF option
5. ✅ **ATT Prompt** - App Tracking Transparency permission (modal)
6. ✅ **Cookies Consent** - Accept All / Reject All / More Info (modal)
7. ✅ **Cookie Settings** - Granular preferences for 6 cookie types

## 🎯 Screen Flow

```
Splash → License Agreement → Policy Selection → ATT Prompt → Cookies → (Main App)
```

## 🎨 Design Elements

- **Primary Color:** #1E6FD6 (RoundBuy Blue)
- **Logo:** Custom circular design with location pin
- **Buttons:** Rounded, primary/secondary styles
- **Modals:** Semi-transparent overlays for prompts
- **Typography:** Clear, readable font sizes

## 🔧 Development Tips

### Quick Commands
```bash
# Reload app
Press 'r' in terminal

# Open developer menu
Press 'd' in terminal

# Clear cache
npm start -- --clear

# View logs
Press 'j' to open debugger
```

### Common Issues

**Port already in use:**
```bash
lsof -ti:8081 | xargs kill -9
npm start
```

**Metro bundler issues:**
```bash
npm start -- --reset-cache
```

## 📂 Project Structure

```
mobile-app/
├── src/
│   ├── screens/          # 7 onboarding screens
│   ├── navigation/       # Stack navigator setup
│   ├── constants/        # Colors, sizes, fonts
│   ├── components/       # (Ready for reusable components)
│   └── assets/          # (Ready for images/fonts)
├── App.js               # Main entry point
└── app.json            # Expo configuration
```

## 🎯 Next Steps

After testing the onboarding flow, you can:

1. **Add Main App Screens**
   - Home/Dashboard
   - Product Listings
   - Shopping Cart
   - User Profile
   - Orders

2. **Backend Integration**
   - Connect to API (http://localhost:5000)
   - User authentication
   - Product data
   - Order management

3. **Additional Features**
   - Push notifications
   - Location services
   - Payment integration
   - Social features

## 📖 Full Documentation

See [`README.md`](./README.md) for complete documentation.

## 💡 Design Reference

The UI matches your provided design image with:
- Splash screen with RoundBuy branding
- Sequential policy acceptance flow
- Modal prompts for ATT and cookies
- Detailed cookie preference settings
- Professional, clean, modern design

## 🚨 Important Notes

- The logo is currently implemented with React Native components
- For production, replace with actual RoundBuy logo image
- All screens are fully functional and navigable
- Ready for backend integration
- Compatible with iOS, Android, and Web

## 📞 Support

For issues or questions:
- Check `README.md` for detailed documentation
- Review screen components in `src/screens/`
- Check navigation setup in `src/navigation/AppNavigator.js`

---

**Ready to start?** Run `npm start` and press `w` for web preview! 🎉