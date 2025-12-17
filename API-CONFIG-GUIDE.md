# Mobile App API Configuration Guide

This guide explains how to configure the API URL for different development and testing scenarios.

## 🚀 Quick Start

### For iOS Simulator (Mac only)
No configuration needed! The app will automatically use `http://localhost:5001/api/v1/mobile-app`

### For Android Emulator
No configuration needed! The app will automatically use `http://10.0.2.2:5001/api/v1/mobile-app`
(10.0.2.2 is a special alias to your host machine's localhost)

### For Physical Devices (iPhone/Android)
You need to set your computer's local IP address:

1. **Find your computer's IP address:**
   - **macOS:** Open Terminal and run: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - **Windows:** Open Command Prompt and run: `ipconfig`
   - **Linux:** Open Terminal and run: `ip addr show`
   
   Look for something like `192.168.1.100` or `10.0.0.5`

2. **Create a `.env` file in the mobile-app directory:**
   ```bash
   cd mobile-app
   cp .env.example .env
   ```

3. **Edit `.env` and add your IP:**
   ```env
   EXPO_PUBLIC_LOCAL_IP=192.168.1.100
   ```
   Replace `192.168.1.100` with your actual IP address.

4. **Restart the Expo development server:**
   ```bash
   npm start
   ```

## 📋 Configuration Options

### Option 1: Auto-Detection (Recommended)
The app automatically detects your platform and uses the appropriate URL:
- **iOS Simulator:** `http://localhost:5001/api/v1/mobile-app`
- **Android Emulator:** `http://10.0.2.2:5001/api/v1/mobile-app`
- **Physical Device:** `http://YOUR_IP:5001/api/v1/mobile-app` (if EXPO_PUBLIC_LOCAL_IP is set)

### Option 2: Override with Custom URL
If you need to use a specific URL (e.g., testing against a staging server):

1. Edit `.env`:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.100:5001/api/v1/mobile-app
   ```

2. Restart Expo:
   ```bash
   npm start
   ```

### Option 3: Production Mode
When you build the app for production (not in development mode), it automatically uses:
```
https://api.roundbuy.com/backend/api/v1/mobile-app
```

## 🔧 Environment Variables

All environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the app.

| Variable | Description | Example |
|----------|-------------|---------|
| `EXPO_PUBLIC_API_URL` | Override API URL | `http://192.168.1.100:5001/api/v1/mobile-app` |
| `EXPO_PUBLIC_LOCAL_IP` | Your computer's IP for physical devices | `192.168.1.100` |

## 🐛 Troubleshooting

### Problem: "Network request failed" on physical device

**Solution:** Make sure:
1. Your phone and computer are on the same WiFi network
2. You've set `EXPO_PUBLIC_LOCAL_IP` in `.env`
3. Your computer's firewall allows connections on port 5001
4. The backend server is running (`cd backend && npm run dev`)

### Problem: "Network request failed" on Android Emulator

**Solution:** 
1. Make sure you're using `10.0.2.2` (auto-detected)
2. If you set `EXPO_PUBLIC_API_URL`, make sure it uses `10.0.2.2` not `localhost`
3. Check that the backend is running

### Problem: Changes to .env not taking effect

**Solution:**
1. Stop the Expo server (Ctrl+C)
2. Clear cache: `npx expo start --clear`
3. Restart: `npm start`

### Problem: "Unable to resolve module 'expo-constants'"

**Solution:**
```bash
npm install expo-constants
```

## 📱 Testing Different Scenarios

### Test on iOS Simulator
```bash
npm run ios
```
Uses: `http://localhost:5001/api/v1/mobile-app`

### Test on Android Emulator
```bash
npm run android
```
Uses: `http://10.0.2.2:5001/api/v1/mobile-app`

### Test on Physical Device
1. Set `EXPO_PUBLIC_LOCAL_IP` in `.env`
2. Scan QR code with Expo Go app
3. Uses: `http://YOUR_IP:5001/api/v1/mobile-app`

### Test with Production API
1. Build the app in production mode
2. Or temporarily set: `EXPO_PUBLIC_API_URL=https://api.roundbuy.com/backend/api/v1/mobile-app`

## 🔍 Debugging

The app logs which API URL it's using when it starts. Check the console output:

```
📱 iOS Development - Using: http://localhost:5001/api/v1/mobile-app
```
or
```
🤖 Android Development - Using: http://10.0.2.2:5001/api/v1/mobile-app
```
or
```
📡 Using API URL from environment: http://192.168.1.100:5001/api/v1/mobile-app
```

## 📚 Additional Resources

- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Expo Constants](https://docs.expo.dev/versions/latest/sdk/constants/)
- [React Native Networking](https://reactnative.dev/docs/network)

## 🎯 Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use `.env.example` as template** - Document all required variables
3. **Use auto-detection when possible** - Less configuration needed
4. **Test on all platforms** - iOS Simulator, Android Emulator, and physical devices
5. **Keep production URL secure** - Don't expose API keys in the code

## 🔐 Security Notes

- The production API URL is hardcoded in `api.config.js`
- Environment variables are only for development/testing
- Never commit sensitive API keys to version control
- Use different API keys for development and production
