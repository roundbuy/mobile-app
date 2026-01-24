import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, PanResponder } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from '../components/MapView';
import * as Location from 'expo-location';
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

  const sliderTrackRef = useRef(null);
  const sliderLayout = useRef({ x: 0, width: 0 });

  useEffect(() => {
    if (visible) {
      setTempRadius(selectedRadius || SLIDER_CONFIG.defaultValue);
      getLocationAsync();
    }
  }, [visible, selectedRadius]);

  // Update map zoom when radius changes
  useEffect(() => {
    if (mapRef.current && location) {
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

  const updateSliderValue = (pageX) => {
    const { x, width } = sliderLayout.current;
    if (width === 0) return;

    const relativeX = pageX - x;
    const percentage = Math.max(0, Math.min(100, (relativeX / width) * 100));
    const actualValue = (percentage / 100) * SLIDER_MAX;
    const roundedValue = parseFloat(actualValue.toFixed(SLIDER_DECIMAL_PRECISION));
    setTempRadius(roundedValue);
  };

  const sliderPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        updateSliderValue(evt.nativeEvent.pageX);
      },
      onPanResponderMove: (evt) => {
        updateSliderValue(evt.nativeEvent.pageX);
      },
      onPanResponderRelease: () => { },
    })
  ).current;

  const handleApply = () => {
    onSelectRadius(tempRadius);
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
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backArrow}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Distance</Text>
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Map Preview with Radius Circle */}
            <View style={styles.mapContainer}>
              {location ? (
                <MapView
                  ref={mapRef}
                  provider={PROVIDER_GOOGLE}
                  style={styles.map}
                  initialRegion={region}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  rotateEnabled={false}
                  pitchEnabled={false}
                  showsUserLocation={false}
                  showsMyLocationButton={false}
                  showsCompass={false}
                  toolbarEnabled={false}
                >
                  {/* Radius Circle */}
                  <Circle
                    center={location}
                    radius={tempRadius * 1000} // Convert km to meters
                    strokeWidth={2}
                    strokeColor={COLORS.primary}
                    fillColor={`${COLORS.primary}20`} // 20% opacity
                  />

                  {/* Center Marker */}
                  <Marker
                    coordinate={location}
                    anchor={{ x: 0.5, y: 0.5 }}
                  >
                    <View style={styles.centerMarker}>
                      <FontAwesome name="map-marker" size={24} color={COLORS.primary} />
                    </View>
                  </Marker>
                </MapView>
              ) : (
                <View style={styles.mapPlaceholder}>
                  <FontAwesome name="map-marker" size={32} color={COLORS.primary} />
                  <Text style={styles.placeholderText}>Loading location...</Text>
                </View>
              )}

              {/* Distance Overlay */}
              <View style={styles.distanceOverlay}>
                <Text style={styles.distanceText}>{tempRadius.toFixed(SLIDER_DECIMAL_PRECISION)} km</Text>
              </View>
            </View>

            {/* Slider */}
            <View style={styles.sliderSection}>
              <Text style={styles.sliderLabel}>Search radius</Text>
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
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>0 km</Text>
                <Text style={styles.sliderLabelText}>{SLIDER_MAX} km</Text>
              </View>
            </View>

            <Text style={styles.description}>
              Drag the slider to adjust your search radius. The map shows the area that will be searched.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
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
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 30,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#303234',
  },
  centerMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  distanceOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sliderSection: {
    marginBottom: 30,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
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
    paddingBottom: 34,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  applyButton: {
    height: 54,
    backgroundColor: COLORS.primary,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default DistanceFilterModal;