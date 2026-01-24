// app.config.js - Expo configuration with environment variable support
export default {
    expo: {
        name: "RoundBuy",
        slug: "roundbuy",
        version: "2.0.0",
        orientation: "portrait",
        icon: "./assets/logo-crop.png",
        userInterfaceStyle: "light",
        splash: {
            image: "./assets/logo-crop.png",
            resizeMode: "contain",
            backgroundColor: "#1E6FD6"
        },
        assetBundlePatterns: [
            "**/*"
        ],
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.buyaround.roundbuy",
            buildNumber: "2.0.0",
            deploymentTarget: "13.4",
            infoPlist: {
                ITSAppUsesNonExemptEncryption: false,
                NSUserTrackingUsageDescription: "RoundBuy would like permission to track your activity across apps and websites owned by other companies. Your data will be used to deliver personalized ads to you.",
                NSLocationWhenInUseUsageDescription: "RoundBuy needs your location to show nearby search results on the map.",
                NSLocationAlwaysAndWhenInUseUsageDescription: "RoundBuy needs your location to show nearby search results on the map.",
                NSCameraUsageDescription: "RoundBuy needs camera access to take photos for your advertisements.",
                NSPhotoLibraryUsageDescription: "RoundBuy needs access to your photo library to select images for your advertisements.",
                NSAppTransportSecurity: {
                    NSAllowsLocalNetworking: true,
                    NSExceptionDomains: {
                        localhost: {
                            NSExceptionAllowsInsecureHTTPLoads: true
                        }
                    }
                }
            },
            config: {
                // Testing with old API key
                googleMapsApiKey: "AIzaSyA7xDzwDpKqHknfWZdIm2yUcKIBtpPk4UE"
                // googleMapsApiKey: "AIzaSyCHDy59MC8-BniPHZ32X4szqh9kXSOBsi0"
                // Current key (might have restrictions): AIzaSyA7xDzwDpKqHknfWZdIm2yUcKIBtpPk4UE
            }
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/logo-crop.png",
                backgroundColor: "#1E6FD6"
            },
            package: "com.buyaround.roundbuy",
            versionCode: 1,
            permissions: [
                "ACCESS_FINE_LOCATION",
                "ACCESS_COARSE_LOCATION",
                "CAMERA",
                "READ_EXTERNAL_STORAGE",
                "WRITE_EXTERNAL_STORAGE"
            ],
            config: {
                googleMaps: {
                    // Old API key: AIzaSyCHDy59MC8-BniPHZ32X4szqh9kXSOBsi0
                    apiKey: "AIzaSyA7xDzwDpKqHknfWZdIm2yUcKIBtpPk4UE"
                }
            }
        },
        web: {
            favicon: "./assets/logo-crop.png",
            bundler: "metro"
        },
        plugins: [
            "expo-font",
            "expo-localization",
            [
                "react-native-maps",
                {
                    "provider": "google",
                    "useGoogleMaps": true
                }
            ],
            [
                "./plugins/withGoogleMapsIOS",
                {
                    "apiKey": "AIzaSyA7xDzwDpKqHknfWZdIm2yUcKIBtpPk4UE"
                }
            ]
        ],
        scheme: "roundbuy",
        extra: {
            eas: {
                projectId: "e99b7176-13bb-4556-b403-08d45d1ec1fe"
            },
            // Environment variables for API configuration
            apiUrl: process.env.EXPO_PUBLIC_API_URL,
            localIp: process.env.EXPO_PUBLIC_LOCAL_IP
        }
    }
};
