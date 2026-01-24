const { withPodfile, withAppDelegate } = require('@expo/config-plugins');

const withGoogleMapsIOS = (config, { apiKey }) => {
    // 1. Modify Podfile to use the Google subspec
    config = withPodfile(config, (config) => {
        const podfileContent = config.modResults.contents;

        // Check if already added to avoid duplicates
        if (podfileContent.includes("react-native-maps/Google")) {
            return config;
        }

        // Add the Google Maps subspec after the rn_maps_path definition
        // We look for the standard line that Expo generates
        const targetPathLine = `rn_maps_path = File.dirname(\`node --print "require.resolve('react-native-maps/package.json')"\`)`;
        const googlePodLine = `  pod 'react-native-maps/Google', :path => rn_maps_path`;

        if (podfileContent.includes(targetPathLine)) {
            config.modResults.contents = podfileContent.replace(
                targetPathLine,
                `${targetPathLine}\n${googlePodLine}`
            );
        } else {
            // Fallback: append to bottom if we can't find the specific line (unlikely)
            console.warn("Could not find rn_maps_path in Podfile, appending Google Maps pod manually.");
            config.modResults.contents += `\n${googlePodLine}\n`;
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
