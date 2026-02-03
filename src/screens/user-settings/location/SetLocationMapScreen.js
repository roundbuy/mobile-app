import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../../context/TranslationContext';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from '../../../components/MapView';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as Location from 'expo-location';
import { COLORS, SPACING } from '../../../constants/theme';
import Constants from 'expo-constants';

const SetLocationMapScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { locationType = 'centrePoint', onSave, existingLocation } = route.params || {};

  const [selectedAddress, setSelectedAddress] = useState('');
  const [mapType, setMapType] = useState('standard');
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(null);
  const [markerCoordinate, setMarkerCoordinate] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Get Google Maps API key from config
  const GOOGLE_MAPS_API_KEY = Platform.select({
    ios: Constants.expoConfig?.ios?.config?.googleMapsApiKey,
    android: Constants.expoConfig?.android?.config?.googleMaps?.apiKey,
  }) || 'AIzaSyA7xDzwDpKqHknfWZdIm2yUcKIBtpPk4UE';

  // Set initial location
  const getInitialLocation = () => {
    if (existingLocation && existingLocation.latitude && existingLocation.longitude) {
      return {
        latitude: parseFloat(existingLocation.latitude),
        longitude: parseFloat(existingLocation.longitude)
      };
    }
    return { latitude: 51.5081, longitude: -0.1279 };
  };

  const initialLocation = getInitialLocation();
  const [region, setRegion] = useState({
    latitude: initialLocation.latitude,
    longitude: initialLocation.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    getLocationPermission();
    setMarkerCoordinate(initialLocation);

    if (existingLocation) {
      const address = existingLocation.street || existingLocation.city
        ? `${existingLocation.street || ''} ${existingLocation.city || ''} ${existingLocation.country || ''}`.trim()
        : `${existingLocation.latitude}, ${existingLocation.longitude}`;

      setSelectedAddress(existingLocation.name || address);

      if (autocompleteRef.current) {
        autocompleteRef.current.setAddressText(address);
      }
    } else {
      setSelectedAddress('12 Trafalgar square');
      if (autocompleteRef.current) {
        autocompleteRef.current.setAddressText('12 Trafalgar Square, London, WC2N');
      }
    }
  }, [existingLocation]);

  const getLocationPermission = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
      }
    } catch (error) {
      console.error('Error getting location permission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = (event) => {
    const coordinate = event.nativeEvent.coordinate;
    setMarkerCoordinate(coordinate);
    reverseGeocode(coordinate);
  };

  const handleMarkerDragStart = () => {
    setIsDragging(true);
  };

  const handleMarkerDragEnd = (event) => {
    setIsDragging(false);
    const coordinate = event.nativeEvent.coordinate;
    setMarkerCoordinate(coordinate);
    reverseGeocode(coordinate);
  };

  const reverseGeocode = async (coordinate) => {
    try {
      const { latitude, longitude } = coordinate;
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const address = data.results[0].formatted_address;
        setSelectedAddress(address);

        if (autocompleteRef.current) {
          autocompleteRef.current.setAddressText(address);
        }
      } else {
        const fallbackAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        setSelectedAddress(fallbackAddress);
        if (autocompleteRef.current) {
          autocompleteRef.current.setAddressText(fallbackAddress);
        }
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      const fallbackAddress = `${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}`;
      setSelectedAddress(fallbackAddress);
      if (autocompleteRef.current) {
        autocompleteRef.current.setAddressText(fallbackAddress);
      }
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const zoomIn = () => {
    if (mapRef.current) {
      const newRegion = {
        ...region,
        latitudeDelta: region.latitudeDelta * 0.5,
        longitudeDelta: region.longitudeDelta * 0.5,
      };
      mapRef.current.animateToRegion(newRegion, 300);
      setRegion(newRegion);
    }
  };

  const zoomOut = () => {
    if (mapRef.current) {
      const newRegion = {
        ...region,
        latitudeDelta: Math.min(region.latitudeDelta * 2, 180),
        longitudeDelta: Math.min(region.longitudeDelta * 2, 360),
      };
      mapRef.current.animateToRegion(newRegion, 300);
      setRegion(newRegion);
    }
  };

  const handleSaveLocation = () => {
    if (!markerCoordinate) {
      Alert.alert(t('Error'), t('Please select a location on the map'));
      return;
    }

    const locationData = {
      name: getLocationTitle(),
      address: selectedAddress,
      fullAddress: selectedAddress,
      city: selectedAddress.split(',')[0] || 'Unknown',
      region: '',
      country: selectedAddress.split(',').pop()?.trim() || 'Unknown',
      zipCode: '',
      coordinates: {
        latitude: markerCoordinate.latitude,
        longitude: markerCoordinate.longitude,
      },
      timestamp: new Date().toISOString(),
    };

    if (onSave) {
      onSave(locationData);
    } else {
      navigation.goBack();
      Alert.alert(
        t('Success'),
        t('Location saved successfully!'),
        [{ text: t('OK'), onPress: () => navigation.goBack() }]
      );
    }
  };

  const getLocationTitle = () => {
    switch (locationType) {
      case 'centrePoint':
        return 'Centre-point & Product Location 1';
      case 'productLocation2':
        return 'Product Location 2';
      case 'productLocation3':
        return 'Product Location 3';
      default:
        return 'Location';
    }
  };

  const getHeaderTitle = () => {
    const isEditing = !!existingLocation;
    const action = isEditing ? 'Edit' : 'Set';
    return `${action} ${getLocationTitle()}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Location Title */}
            <View style={styles.titleSection}>
              <Text style={styles.locationTitle}>{t('Your default location:')}</Text>
              <Text style={styles.locationSubtitle}>{getLocationTitle()}</Text>
            </View>

            {/* Google Places Autocomplete */}
            <View style={styles.searchWrapper}>
              <GooglePlacesAutocomplete
                ref={autocompleteRef}
                placeholder={t('Search for a location')}
                onPress={(data, details = null) => {
                  if (details) {
                    const { lat, lng } = details.geometry.location;
                    const newRegion = {
                      latitude: lat,
                      longitude: lng,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    };

                    setRegion(newRegion);
                    setMarkerCoordinate({ latitude: lat, longitude: lng });
                    setSelectedAddress(data.description);

                    if (mapRef.current) {
                      mapRef.current.animateToRegion(newRegion, 1000);
                    }

                    Keyboard.dismiss();

                    setTimeout(() => {
                      if (autocompleteRef.current) {
                        autocompleteRef.current.setAddressText(data.description);
                      }
                    }, 100);
                  }
                }}
                query={{
                  key: GOOGLE_MAPS_API_KEY,
                  language: 'en',
                }}
                fetchDetails={true}
                enablePoweredByContainer={false}
                keepResultsAfterBlur={false}
                listViewDisplayed="auto"
                minLength={2}
                debounce={300}
                styles={{
                  container: {
                    flex: 0,
                    zIndex: 1000,
                  },
                  textInputContainer: {
                    backgroundColor: '#fff',
                    borderWidth: 1,
                    borderColor: '#d0d0d0',
                    borderRadius: 8,
                    paddingHorizontal: 8,
                  },
                  textInput: {
                    height: 44,
                    fontSize: 14,
                    color: '#000',
                    backgroundColor: '#fff',
                  },
                  listView: {
                    backgroundColor: '#fff',
                    borderWidth: 1,
                    borderColor: '#d0d0d0',
                    borderTopWidth: 0,
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                    marginTop: -1,
                  },
                  row: {
                    backgroundColor: '#fff',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                  },
                  separator: {
                    height: 1,
                    backgroundColor: '#f0f0f0',
                  },
                  description: {
                    fontSize: 14,
                    color: '#000',
                  },
                  poweredContainer: {
                    display: 'none',
                  },
                }}
                renderLeftButton={() => (
                  <View style={styles.searchIconContainer}>
                    <Ionicons name="search" size={20} color="#666" />
                  </View>
                )}
                renderRightButton={() => (
                  <TouchableOpacity
                    onPress={() => {
                      if (autocompleteRef.current) {
                        autocompleteRef.current.setAddressText('');
                        autocompleteRef.current.clear();
                      }
                    }}
                    style={styles.clearButton}
                  >
                    <Ionicons name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
                )}
              />
            </View>

            {/* Map Container */}
            <View style={styles.mapContainer}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>{t('Loading map...')}</Text>
                </View>
              ) : mapError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>Map Error: {mapError}</Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => setMapError(null)}
                  >
                    <Text style={styles.retryButtonText}>{t('Retry')}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <MapView
                  ref={mapRef}
                  provider={PROVIDER_GOOGLE}
                  style={styles.map}
                  initialRegion={region}
                  onRegionChangeComplete={setRegion}
                  onPress={handleMapPress}
                  showsUserLocation={false}
                  showsMyLocationButton={false}
                  showsCompass={true}
                  toolbarEnabled={false}
                  mapType={mapType}
                  loadingEnabled={true}
                  showsPointsOfInterest={true}
                  showsBuildings={true}
                  onMapReady={() => {
                    console.log('✅ Map is ready!');
                    setMapError(null);
                  }}
                  onError={(error) => {
                    console.error('❌ Map error:', error);
                    const errorMessage = error?.message || error?.nativeEvent?.message || 'Unknown error';
                    setMapError(errorMessage);
                  }}
                >
                  {markerCoordinate && (
                    <Marker
                      coordinate={markerCoordinate}
                      title={selectedAddress}
                      draggable
                      onDragStart={handleMarkerDragStart}
                      onDragEnd={handleMarkerDragEnd}
                      pinColor={COLORS.primary}
                    >
                      <View style={[styles.customMarker, isDragging && styles.customMarkerDragging]}>
                        <Ionicons
                          name="location"
                          size={40}
                          color={isDragging ? COLORS.secondary : COLORS.primary}
                        />
                      </View>
                    </Marker>
                  )}
                </MapView>
              )}

              {/* Map Controls */}
              <View style={styles.mapControls}>
                <View style={styles.mapTypeSelector}>
                  <TouchableOpacity
                    style={[styles.mapTypeButton, mapType === 'standard' && styles.mapTypeButtonActive]}
                    onPress={() => setMapType('standard')}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.mapTypeText, mapType === 'standard' && styles.mapTypeTextActive]}>{t('Map')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.mapTypeButton, mapType === 'satellite' && styles.mapTypeButtonActive]}
                    onPress={() => setMapType('satellite')}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.mapTypeText, mapType === 'satellite' && styles.mapTypeTextActive]}>{t('Satellite')}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Zoom Controls */}
              <View style={styles.zoomControls}>
                <TouchableOpacity style={styles.zoomButton} onPress={zoomIn} activeOpacity={0.7}>
                  <Ionicons name="add" size={24} color="#666" />
                </TouchableOpacity>
                <View style={styles.zoomDivider} />
                <TouchableOpacity style={styles.zoomButton} onPress={zoomOut} activeOpacity={0.7}>
                  <Ionicons name="remove" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Drag Instruction */}
              {isDragging && (
                <View style={styles.dragInstruction}>
                  <Text style={styles.dragInstructionText}>{t('Drag marker to adjust location')}</Text>
                </View>
              )}
            </View>

            {/* Selected Address Display */}
            <View style={styles.addressDisplay}>
              <Ionicons name="location-outline" size={20} color={COLORS.primary} style={styles.addressIcon} />
              <Text style={styles.addressText} numberOfLines={2}>
                {selectedAddress || 'No address selected'}
              </Text>
            </View>

            {/* Safety Info */}
            <View style={styles.safetyInfo}>
              <Text style={styles.safetyText}>{t('For more information on')}</Text>
              <Text style={styles.safetyTextBold}>{t('Safety')}</Text>
              <Text style={styles.safetyText}>{t(', click')}</Text>
              <Text style={[styles.safetyText, styles.safetyLink]}>{t('here')}</Text>
              <Ionicons name="information-circle-outline" size={20} color="#666" style={styles.safetyIcon} />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveLocation}
              activeOpacity={0.7}
            >
              <Text style={styles.saveButtonText}>
                {existingLocation ? 'Update' : 'Save'} {getLocationTitle()}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  headerRight: {
    width: 32,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 16,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  locationSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  searchWrapper: {
    marginBottom: 16,
    zIndex: 1000,
  },
  searchIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 4,
  },
  clearButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 8,
    paddingLeft: 4,
  },
  mapContainer: {
    height: 400,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#c62828',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  customMarkerDragging: {
    transform: [{ scale: 1.2 }],
  },
  mapControls: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapTypeSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  mapTypeButtonActive: {
    backgroundColor: '#f0f0f0',
  },
  mapTypeText: {
    fontSize: 14,
    color: '#666',
  },
  mapTypeTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  zoomControls: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  zoomButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dragInstruction: {
    position: 'absolute',
    bottom: 70,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  dragInstructionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addressDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  addressIcon: {
    marginRight: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 15,
    color: '#000',
  },
  safetyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  safetyText: {
    fontSize: 13,
    color: '#666',
  },
  safetyTextBold: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  safetyLink: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  safetyIcon: {
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default SetLocationMapScreen;