const { withPodfile, withAppDelegate } = require('@expo/config-plugins');

const withGoogleMapsIOS = (config, { apiKey }) => {
    // 1. Modify Podfile to use the Google subspec
    // 1. Modify Podfile to use the Google subspec
    config = withPodfile(config, (config) => {
        const podfileContent = config.modResults.contents;

        // Check if already added to avoid duplicates
        if (podfileContent.includes("react-native-maps/Google")) {
            return config;
        }

        // Define the pod code block ensuring rn_maps_path is defined
        const googleMapsPodCode = `
  # React Native Maps dependencies
  rn_maps_path = File.dirname(\`node --print "require.resolve('react-native-maps/package.json')"\`)
  pod 'react-native-maps/Google', :path => rn_maps_path
`;

        // Attempt to insert after use_native_modules! which is standard in Expo Podfiles
        if (podfileContent.includes('use_native_modules!')) {
            config.modResults.contents = podfileContent.replace(
                'use_native_modules!',
                `use_native_modules!${googleMapsPodCode}`
            );
        } else {
            // Fallback: append to the end of the file (might be outside target, but best effort)
            console.warn("Could not find use_native_modules! in Podfile, appending Google Maps pod manually.");
            config.modResults.contents += `\n${googleMapsPodCode}\n`;
        }

        return config;
    });

    // 2. Modify AppDelegate.swift to initialize Google Maps
    config = withAppDelegate(config, (config) => {
        let appDelegate = config.modResults.contents;

        // A. Add Import
        if (!appDelegate.includes('import GoogleMaps')) {
            // Add after the last import
            appDelegate = appDelegate.replace(
                /import (.*)\n(@UIApplicationMain)/s,
                'import $1\nimport GoogleMaps\n$2'
            );
        }

        // B. Add API Key Initialization
        const apiKeyCode = `GMSServices.provideAPIKey("${apiKey}")`;
        if (!appDelegate.includes('GMSServices.provideAPIKey')) {
            // Insert at the start of didFinishLaunchingWithOptions
            // We look for the function signature and insert immediately after the opening brace
            appDelegate = appDelegate.replace(
                /(didFinishLaunchingWithOptions.*)(\) -> Bool {)/,
                `$1$2\n    ${apiKeyCode}`
            );
        }

        config.modResults.contents = appDelegate;
        return config;
    });

    return config;
};

module.exports = withGoogleMapsIOS;
