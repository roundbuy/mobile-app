// app.config.js - Consolidated Expo configuration
export default {
    expo: {
        name: "RoundBuy",
        slug: "roundbuy",
        version: "2.0.1",
        orientation: "portrait",
        icon: "./assets/appleicon.png",
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
            buildNumber: "1",
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
                googleMapsApiKey: "AIzaSyA7xDzwDpKqHknfWZdIm2yUcKIBtpPk4UE"
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
            "expo-apple-authentication",
            "expo-localization",
            "expo-web-browser",
            [
                "expo-tracking-transparency",
                {
                    "userTrackingPermission": "RoundBuy would like permission to track your activity across apps and websites owned by other companies. Your data will be used to deliver personalized ads to you."
                }
            ],
            "@react-native-community/datetimepicker"
            // Note: react-native-maps is configured via ios/Podfile (react-native-google-maps pod)
            // and ios/RoundBuy/AppDelegate.swift (GMSServices.provideAPIKey). No app.plugin.js.
        ],
        scheme: "roundbuy",
        extra: {
            eas: {
                projectId: "e99b7176-13bb-4556-b403-08d45d1ec1fe"
            },
            apiUrl: process.env.EXPO_PUBLIC_API_URL,
            localIp: process.env.EXPO_PUBLIC_LOCAL_IP
        }
    }
};
