import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import SafeScreenContainer from '../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../constants/theme';

const SearchScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 26.77777, // Default to India (Lucknow area)
    longitude: 81.0817,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(null);
  const mapRef = React.useRef(null);

  // Sample markers for search results
  const [markers] = useState([
    { id: 1, latitude: 51.5074, longitude: -0.1278, title: 'Location 1' },
    { id: 2, latitude: 51.5155, longitude: -0.1419, title: 'Location 2' },
    { id: 3, latitude: 51.4994, longitude: -0.1245, title: 'Location 3' },
  ]);

  useEffect(() => {
    getLocationAsync();
  }, []);

  const getLocationAsync = async () => {
    try {
      setLoading(true);
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('Location permission denied, using default location');
        // Still show the map with default location
        setLoading(false);
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = currentLocation.coords;
      setLocation({ latitude, longitude });
      
      // Update map region to show user location
      const newRegion = {
        latitude:26.77777,
        longitude:81.0817,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      console.log('newRegion', newRegion);
      
      setRegion(newRegion);
      
      // Animate map to user location
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current?.animateToRegion(newRegion, 1000);
        }, 100);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      // Still show the map even if location fails
    } finally {
      setLoading(false);
    }
  };

  const centerOnUserLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        ...location,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }, 1000);
    } else {
      getLocationAsync();
    }
  };

  const handleFilterPress = () => {
    navigation.navigate('FilterScreen');
  };

  const handleDistancePress = () => {
    navigation.navigate('DistanceFilter');
  };

  const handleCategoryPress = () => {
    navigation.navigate('CategoryFilter');
  };

  const handlePricePress = () => {
    navigation.navigate('PriceFilter');
  };

  const handleMakeAnAd = () => {
    navigation.navigate('MakeAnAd');
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <FontAwesome name="search" size={20} color="#6a6a6a" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Around You"
            placeholderTextColor="#b0b0b0"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Filter Row */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
            <Ionicons name="options-outline" size={18} color="#1a1a1a" />
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton} onPress={handleDistancePress}>
            <Text style={styles.filterButtonText}>Distance</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton} onPress={handleCategoryPress}>
            <Text style={styles.filterButtonText}>Category</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton} onPress={handlePricePress}>
            <Text style={styles.filterButtonText}>Pri...</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Search Results */}
        <Text style={styles.resultCount}>120 hits</Text>
      </View>

      {/* Top User Locations */}
      <View style={styles.topLocations}>
        <View style={styles.locationBadge}>
          <Text style={styles.locationNumber}>1</Text>
        </View>
        <View style={styles.locationBadge}>
          <Text style={styles.locationNumber}>2</Text>
        </View>
        <View style={styles.locationBadge}>
          <Text style={styles.locationNumber}>3</Text>
        </View>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
          {mapError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Map Error: {mapError}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => setMapError(null)}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <MapView
              ref={mapRef}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              style={styles.map}
              initialRegion={region}
              onRegionChangeComplete={setRegion}
              showsUserLocation={true}
              showsMyLocationButton={false}
              showsCompass={true}
              toolbarEnabled={false}
              mapType="standard"
              loadingEnabled={true}
              onMapReady={() => {
                console.log('✅ Map is ready!');
                console.log('📍 Map region:', region);
                setMapError(null);
              }}
              onError={(error) => {
                console.error('❌ Map error:', error);
                const errorMessage = error?.message || error?.nativeEvent?.message || 'Unknown error';
                setMapError(errorMessage);
              }}
              onLayout={() => {
                console.log('📐 MapView onLayout called');
              }}
            >
            {/* 10 km radius circle */}
            <Circle
              center={location || { latitude: region.latitude, longitude: region.longitude }}
              radius={10000} // 10 km in meters
              strokeWidth={2}
              strokeColor={COLORS.primary}
              fillColor="rgba(0, 28, 100, 0.1)" // Semi-transparent primary color
            />

            {/* User location marker */}
            {location && (
              <Marker
                coordinate={location}
                title="Your Location"
                pinColor={COLORS.primary}
              />
            )}

            {/* Search result markers */}
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                coordinate={{
                  latitude: marker.latitude,
                  longitude: marker.longitude,
                }}
                title={marker.title}
              >
                <View style={styles.customMarker}>
                  <Text style={styles.markerText}>{marker.id}</Text>
                </View>
              </Marker>
            ))}
            </MapView>
          )}
        

        {/* Center on user location button */}
        <TouchableOpacity 
          style={styles.centerButton}
          onPress={centerOnUserLocation}
        >
          <Ionicons name="locate" size={24} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Map View Toggle */}
        <TouchableOpacity 
          style={styles.mapViewToggle}
          onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
        >
          <Text style={styles.mapViewText}>Map view</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <FontAwesome name="home" size={26} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <FontAwesome name="bell" size={26} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.addButton]} onPress={handleMakeAnAd}>
          <FontAwesome name="plus" size={26} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <FontAwesome name="envelope" size={26} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <FontAwesome name="user" size={26} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  searchSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    gap: 6,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  resultCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  topLocations: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  locationBadge: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  locationNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#e8f5e9', // Light green background to see if container is rendering
  },
  map: {
    flex: 1,
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
    color: '#6a6a6a',
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
  centerButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  customMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  centerMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
  },
  centerMarkerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  radiusCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 280,
    height: 280,
    borderRadius: 140,
    marginLeft: -140,
    marginTop: -140,
    borderWidth: 3,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  marker: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  serviceMarker: {
    position: 'absolute',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#757575',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  markerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  mapViewToggle: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  mapViewText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  bottomNav: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 10,
    paddingTop: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
  },
});

export default SearchScreen;