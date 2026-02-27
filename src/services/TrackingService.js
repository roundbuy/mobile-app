import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestTrackingPermissionsAsync, getTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { Platform } from 'react-native';

const TRACKING_KEYS = {
    ATT_ENABLED: 'att_tracking_enabled',
    ANALYTICS_ENABLED: 'analytics_tracking_enabled',
    ADVERTISING_ENABLED: 'advertising_tracking_enabled',
};

class TrackingService {
    constructor() {
        this.canTrack = false;
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
            }

            // 2. Check User Preferences (In-App)
            const storedAtt = await AsyncStorage.getItem(TRACKING_KEYS.ATT_ENABLED);
            const userAllowed = storedAtt ? JSON.parse(storedAtt) : false;

            // 3. Determine final tracking status
            // We can only track if BOTH system says yes (or is not iOS) AND user app preference says yes
            this.canTrack = systemAllowed && userAllowed;

            this.isInitialized = true;
            console.log('🛡️ TrackingService Initialized. Can Track:', this.canTrack);
        } catch (error) {
            console.error('Error initializing TrackingService:', error);
            this.canTrack = false;
        }
    }

    /**
     * Request System Tracking Permission (ATT)
     * Should be called from UI (e.g. ATTPromptScreen)
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
            // Android/Other: Default to true or handle specific logic
            await this.setTrackingPreference(true);
            return 'granted';
        } catch (error) {
            console.error('Error requesting tracking permission:', error);
            return 'denied';
        }
    }

    /**
     * Update User Permission Preference directly
     * (e.g. from Settings screen)
     */
    async setTrackingPreference(isEnabled) {
        try {
            await AsyncStorage.setItem(TRACKING_KEYS.ATT_ENABLED, JSON.stringify(isEnabled));

            // If disabling, also disable sub-categories
            if (!isEnabled) {
                await AsyncStorage.setItem(TRACKING_KEYS.ANALYTICS_ENABLED, JSON.stringify(false));
                await AsyncStorage.setItem(TRACKING_KEYS.ADVERTISING_ENABLED, JSON.stringify(false));
            }

            // Re-evaluate global status
            await this.initialize();

        } catch (error) {
            console.error('Error setting tracking preference:', error);
        }
    }

    /**
     * Check if we are allowed to track
     * Use this before initializing any SDK or WebView with tracking
     */
    canTrackUser() {
        return this.canTrack;
    }

    /**
     * Get HTTP Headers for API calls
     * Backend can use this to decide whether to log analytics
     */
    getTrackingHeaders() {
        return {
            'X-Tracking-Status': this.canTrack ? 'allowed' : 'denied',
            'X-Do-Not-Track': this.canTrack ? '0' : '1'
        };
    }
}

export const trackingService = new TrackingService();
export default trackingService;
