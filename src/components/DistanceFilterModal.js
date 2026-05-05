import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, PanResponder, SafeAreaView } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from './MapView';
import { COLORS, SLIDER_CONFIG } from '../constants/theme';

const DistanceFilterModal = ({ visible, onClose, selectedRadius, onSelectRadius, userLocation }) => {
  const [tempRadius, setTempRadius] = useState(selectedRadius || SLIDER_CONFIG.defaultValue);
  const [location, setLocation] = useState(userLocation || null);
  const [region, setRegion] = useState({
    latitude: userLocation?.latitude || 26.77777,
    longitude: userLocation?.longitude || 81.0817,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  const mapRef = useRef(null);
  const SLIDER_MAX = SLIDER_CONFIG.max;
  const SLIDER_MIN = SLIDER_CONFIG.min;
  const SLIDER_DECIMAL_PRECISION = SLIDER_CONFIG.decimalPrecision;
  const UNLIMITED_RADIUS = 100000; // Value to represent unlimited

  const sliderTrackRef = useRef(null);
  const sliderLayout = useRef({ x: 0, width: 0 });

  // Refs for precise relativity tracking
  const currentRadius = useRef(tempRadius);
  const initialDragRadius = useRef(tempRadius);

  useEffect(() => {
    currentRadius.current = tempRadius;
  }, [tempRadius]);

  useEffect(() => {
    if (visible) {
      if (selectedRadius >= SLIDER_MAX) {
        setTempRadius(SLIDER_MAX);
      } else {
        setTempRadius(selectedRadius || SLIDER_CONFIG.defaultValue);
      }
      getLocationAsync();
    }
  }, [visible, selectedRadius]);

  // Update map zoom when radius changes
  useEffect(() => {
    if (mapRef.current && location) {
      if (tempRadius >= SLIDER_MAX) {
        // Zoom out for unlimited
        mapRef.current.animateToRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 2.0, // Large delta for view
          longitudeDelta: 2.0,
        }, 300);
      } else {
        const radiusInKm = tempRadius;
        const radiusInDegrees = radiusInKm / 111; // Approximate conversion
        const newDelta = radiusInDegrees * 2.5; // Add padding around circle

        mapRef.current.animateToRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: newDelta,
          longitudeDelta: newDelta,
        }, 300);
      }
    }
  }, [tempRadius]);

  const getLocationAsync = async () => {
    try {
      if (userLocation) {
        setLocation(userLocation);
        setRegion({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = currentLocation.coords;
      const newLocation = { latitude, longitude };
      setLocation(newLocation);
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const sliderPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        initialDragRadius.current = currentRadius.current;
      },
      onPanResponderMove: (evt, gestureState) => {
        const { width } = sliderLayout.current;
        if (width === 0) return;
        const deltaValue = (gestureState.dx / width) * SLIDER_MAX;
        const rawNewValue = initialDragRadius.current + deltaValue;
        const newRadiusValue = Math.max(SLIDER_MIN, Math.min(rawNewValue, SLIDER_MAX));
        const roundedValue = parseFloat(newRadiusValue.toFixed(SLIDER_DECIMAL_PRECISION));
        setTempRadius(roundedValue);
      },
      onPanResponderRelease: () => { },
    })
  ).current;

  const handleApply = () => {
    if (tempRadius >= SLIDER_MAX) {
      onSelectRadius(UNLIMITED_RADIUS);
    } else {
      onSelectRadius(tempRadius);
    }
    onClose();
  };

  const handleClear = () => {
    setTempRadius(SLIDER_CONFIG.defaultValue);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backArrow}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>DISTANCE</Text>
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearText}>CLEAR</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Map Section */}
          <View style={styles.mapContainer}>
            {location && (
              <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={region}
                showsUserLocation={true}
                showsMyLocationButton={true}
                zoomEnabled={true}
                scrollEnabled={true}
              >
                <Marker coordinate={location} />
                {tempRadius < SLIDER_MAX && (
                  <Circle
                    center={location}
                    radius={tempRadius * 1000} // Convert km to meters
                    fillColor="rgba(26, 26, 26, 0.15)"
                    strokeColor={COLORS.primary}
                    strokeWidth={1}
                  />
                )}
              </MapView>
            )}
          </View>

          <View style={styles.content}>
            {/* Slider */}
            <View style={styles.sliderSection}>
              <View style={styles.sliderHeaderRow}>
                <Text style={styles.sliderLabel}>Search radius</Text>
                <Text style={styles.distanceValueText}>
                  {tempRadius >= SLIDER_MAX ? 'Unlimited' : `${tempRadius.toFixed(SLIDER_DECIMAL_PRECISION)} km`}
                </Text>
              </View>
              <View
                style={styles.sliderTrack}
                ref={sliderTrackRef}
                onLayout={(event) => {
                  const { x, width } = event.nativeEvent.layout;
                  sliderLayout.current = { x, width };
                }}
                {...sliderPanResponder.panHandlers}
              >
                <View
                  style={[
                    styles.sliderFill,
                    { width: `${(tempRadius / SLIDER_MAX) * 100}%` }
                  ]}
                />
                <View
                  style={[
                    styles.sliderThumb,
                    { left: `${(tempRadius / SLIDER_MAX) * 100}%` }
                  ]}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Use</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 24,
    fontWeight: '300',
    color: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  clearButton: {
    paddingVertical: 6,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  mapContainer: {
    height: 300,
    width: '100%',
    overflow: 'hidden', // Add rounded corners if desired
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  sliderSection: {
    marginBottom: 30,
    marginTop: 20,
  },
  sliderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  distanceValueText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  sliderTrack: {
    height: 5,
    backgroundColor: '#AAAAAA',
    borderRadius: 10,
    position: 'relative',
    width: '100%',
    marginBottom: 12,
  },
  sliderFill: {
    position: 'absolute',
    height: 5,
    backgroundColor: COLORS.slider,
    borderRadius: 10,
    top: 0,
    left: 0,
  },
  sliderThumb: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: '#AAAAAA',
    top: -10,
    marginLeft: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderLabelText: {
    fontSize: 12,
    color: '#888888',
  },
  description: {
    fontSize: 14,
    color: '#303234',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  applyButton: {
    height: 50,
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});

export default DistanceFilterModal;