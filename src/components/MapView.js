/**
 * MapView Wrapper Component
 * 
 * This component provides a safe wrapper around react-native-maps
 * to handle cases where the native module is not available (e.g., Expo Go)
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

let MapView = null;
let Marker = null;
let Circle = null;
let PROVIDER_GOOGLE = null;

try {
    // Try to import react-native-maps
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    Circle = Maps.Circle;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
} catch (error) {
    console.warn('react-native-maps not available. Using fallback component.');
}

/**
 * Safe MapView Component
 * Falls back to a placeholder if react-native-maps is not available
 */
const SafeMapView = (props) => {
    // If MapView is available, use it
    if (MapView) {
        return <MapView {...props} />;
    }

    // Fallback UI when maps are not available
    return (
        <View style={[styles.fallbackContainer, props.style]}>
            <View style={styles.fallbackContent}>
                <Text style={styles.fallbackTitle}>📍 Map View</Text>
                <Text style={styles.fallbackText}>
                    Maps are not available in Expo Go.
                </Text>
                <Text style={styles.fallbackSubtext}>
                    To use maps, create a development build:
                </Text>
                <Text style={styles.fallbackCode}>
                    npx expo run:ios
                </Text>
                <Text style={styles.fallbackNote}>
                    The app will continue to work without maps.
                </Text>
            </View>
        </View>
    );
};

/**
 * Safe Marker Component
 */
const SafeMarker = (props) => {
    if (Marker) {
        return <Marker {...props} />;
    }
    return null;
};

/**
 * Safe Circle Component
 */
const SafeCircle = (props) => {
    if (Circle) {
        return <Circle {...props} />;
    }
    return null;
};

const styles = StyleSheet.create({
    fallbackContainer: {
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
    },
    fallbackContent: {
        padding: 20,
        alignItems: 'center',
    },
    fallbackTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    fallbackText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 8,
    },
    fallbackSubtext: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginTop: 12,
        marginBottom: 4,
    },
    fallbackCode: {
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        color: '#1E6FD6',
        backgroundColor: '#f0f0f0',
        padding: 8,
        borderRadius: 4,
        marginTop: 4,
        marginBottom: 12,
    },
    fallbackNote: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

// Export the safe components
export default SafeMapView;
export { SafeMarker as Marker, SafeCircle as Circle, PROVIDER_GOOGLE };
export const isMapAvailable = MapView !== null;
