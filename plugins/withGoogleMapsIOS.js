const { withDangerousMod, withPodfile } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withGoogleMapsIOS = (config, { apiKey }) => {
    // 1. Modify Podfile to use the Google subspec
    config = withPodfile(config, (config) => {
        const podfileContent = config.modResults.contents;
        if (podfileContent.includes("react-native-maps/Google")) {
            return config;
        }

        const googleMapsPodCode = `
  # Added by withGoogleMapsIOS plugin
  if !defined?(rn_maps_path)
    rn_maps_path = File.dirname(\`node --print "require.resolve('react-native-maps/package.json')"\`)
  end
  pod 'react-native-maps/Google', :path => rn_maps_path
`;

        if (podfileContent.includes('use_expo_modules!')) {
            config.modResults.contents = podfileContent.replace(
                'use_expo_modules!',
                `use_expo_modules!${googleMapsPodCode}`
            );
        }
        return config;
    });

    // 2. Use DangerousMod to ensure Swift AppDelegate is modified on disk
    config = withDangerousMod(config, [
        'ios',
        async (config) => {
            const projectRoot = config.modRequest.projectRoot;
            const projectName = config.modRequest.projectName;
            const appDelegatePath = path.join(projectRoot, 'ios', projectName, 'AppDelegate.swift');

            if (!fs.existsSync(appDelegatePath)) {
                console.warn(`AppDelegate.swift not found at ${appDelegatePath}`);
                return config;
            }

            let contents = fs.readFileSync(appDelegatePath, 'utf8');
            const apiKeyCode = `GMSServices.provideAPIKey("${apiKey}")`;

            // A. Add Import
            if (!contents.includes('import GoogleMaps')) {
                contents = contents.replace(/import Expo/, 'import GoogleMaps\nimport Expo');
            }

            // B. Add API Key Initialization
            if (!contents.includes('GMSServices.provideAPIKey')) {
                // Find didFinishLaunchingWithOptions body start
                contents = contents.replace(
                    /(func\s+application\(.*?didFinishLaunchingWithOptions.*?\)\s*->\s*Bool\s*{)/s,
                    `$1\n    ${apiKeyCode}`
                );
            }

            fs.writeFileSync(appDelegatePath, contents);
            return config;
        }
    ]);

    return config;
};

module.exports = withGoogleMapsIOS;
