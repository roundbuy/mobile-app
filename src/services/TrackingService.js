import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestTrackingPermissionsAsync, getTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { Platform } from 'react-native';

const TRACKING_KEYS = {
    ATT_ENABLED: 'att_tracking_enabled',
    ANALYTICS_ENABLED: 'analytics_tracking_enabled',
    ADVERTISING_ENABLED: 'advertising_tracking_enabled',
    FUNCTIONAL_ENABLED: 'functional_tracking_enabled',
    PERFORMANCE_ENABLED: 'performance_tracking_enabled',
};

class TrackingService {
    constructor() {
        this.canTrack = false;
        this.preferences = {
            analytics: false,
            advertising: false,
            functional: false,
            performance: false,
        };
        this.isInitialized = false;
    }

    /**
     * Initialize tracking service
     * Checks current permission status and loads preferences
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            // 1. Check System Level Permission (iOS ATT)
            let systemAllowed = true;
            if (Platform.OS === 'ios') {
                const { status } = await getTrackingPermissionsAsync();
                systemAllowed = status === 'granted';
                // Sync system status to local storage if not already set
                const storedAtt = await AsyncStorage.getItem(TRACKING_KEYS.ATT_ENABLED);
                if (storedAtt === null) {
                    await AsyncStorage.setItem(TRACKING_KEYS.ATT_ENABLED, JSON.stringify(systemAllowed));
                }
            }

            // 2. Load Granular User Preferences
            const [
                storedAtt,
                storedAnalytics,
                storedAds,
                storedFunctional,
                storedPerformance
            ] = await Promise.all([
                AsyncStorage.getItem(TRACKING_KEYS.ATT_ENABLED),
                AsyncStorage.getItem(TRACKING_KEYS.ANALYTICS_ENABLED),
                AsyncStorage.getItem(TRACKING_KEYS.ADVERTISING_ENABLED),
                AsyncStorage.getItem(TRACKING_KEYS.FUNCTIONAL_ENABLED),
                AsyncStorage.getItem(TRACKING_KEYS.PERFORMANCE_ENABLED),
            ]);

            const userAttAllowed = storedAtt ? JSON.parse(storedAtt) : false;

            this.preferences = {
                analytics: storedAnalytics ? JSON.parse(storedAnalytics) : userAttAllowed,
                advertising: storedAds ? JSON.parse(storedAds) : userAttAllowed,
                functional: storedFunctional ? JSON.parse(storedFunctional) : true, // Functional often defaults to true
                performance: storedPerformance ? JSON.parse(storedPerformance) : userAttAllowed,
            };

            // 3. Determine final tracking status
            // Core tracking depends on ATT status (system + user pref)
            this.canTrack = systemAllowed && userAttAllowed;

            this.isInitialized = true;
            console.log('🛡️ TrackingService Initialized. Status:', {
                canTrack: this.canTrack,
                preferences: this.preferences,
                systemAllowed
            });
        } catch (error) {
            console.error('Error initializing TrackingService:', error);
            this.canTrack = false;
        }
    }

    /**
     * Request System Tracking Permission (ATT)
     */
    async requestPermission() {
        try {
            if (Platform.OS === 'ios') {
                const { status } = await requestTrackingPermissionsAsync();
                const isGranted = status === 'granted';

                // Sync with local storage
                await this.setTrackingPreference(isGranted);

                return status;
            }
            // Android/Other: Default to true
            await this.setTrackingPreference(true);
            return 'granted';
        } catch (error) {
            console.error('Error requesting tracking permission:', error);
            return 'denied';
        }
    }

    /**
     * Update Global Tracking Preference
     */
    async setTrackingPreference(isEnabled) {
        try {
            await AsyncStorage.setItem(TRACKING_KEYS.ATT_ENABLED, JSON.stringify(isEnabled));

            if (!isEnabled) {
                // If disabling global tracking, disable ads and analytics too
                await Promise.all([
                    this.updatePreference('analytics', false),
                    this.updatePreference('advertising', false),
                ]);
            } else {
                // If enabling, enable by default
                await Promise.all([
                    this.updatePreference('analytics', true),
                    this.updatePreference('advertising', true),
                ]);
            }

            this.isInitialized = false;
            await this.initialize();
        } catch (error) {
            console.error('Error setting tracking preference:', error);
        }
    }

    /**
     * Update Granular Preference
     */
    async updatePreference(type, isEnabled) {
        const keyMap = {
            analytics: TRACKING_KEYS.ANALYTICS_ENABLED,
            advertising: TRACKING_KEYS.ADVERTISING_ENABLED,
            functional: TRACKING_KEYS.FUNCTIONAL_ENABLED,
            performance: TRACKING_KEYS.PERFORMANCE_ENABLED,
        };

        const key = keyMap[type];
        if (key) {
            await AsyncStorage.setItem(key, JSON.stringify(isEnabled));
            this.preferences[type] = isEnabled;
        }
    }

    /**
     * Check if we are allowed to track (Global)
     */
    canTrackUser() {
        return this.canTrack;
    }

    /**
     * Get Granular Preference Status
     */
    getPreferences() {
        return this.preferences;
    }

    /**
     * Get HTTP Headers for API calls
     */
    getTrackingHeaders() {
        return {
            'X-Tracking-Status': this.canTrack ? 'allowed' : 'denied',
            'X-Do-Not-Track': this.canTrack ? '0' : '1',
            'X-Cookie-Preferences': JSON.stringify(this.preferences)
        };
    }
}

export const trackingService = new TrackingService();
export default trackingService;
