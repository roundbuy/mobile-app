import React, { useState, useEffect, useRef } from 'react';
import { IMAGES } from '../../assets/images';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, Platform, PanResponder, Image, FlatList } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS, SLIDER_CONFIG } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { responseObject } from '../../constants/appConstants';

const SearchScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [location, setLocation] = useState(null);
  const initialLocation = { latitude: 26.77777, longitude: 81.0817 }; // Default to India (Lucknow area)
  const [region, setRegion] = useState({
    latitude: initialLocation.latitude,
    longitude: initialLocation.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(null);
  const mapRef = React.useRef(null);
  
  // Slider configuration - can be made dynamic in the future by updating SLIDER_CONFIG
  const SLIDER_MAX = SLIDER_CONFIG.max;
  const SLIDER_MIN = SLIDER_CONFIG.min;
  const SLIDER_DECIMAL_PRECISION = SLIDER_CONFIG.decimalPrecision;
  const [sliderValue, setSliderValue] = useState(SLIDER_CONFIG.defaultValue);
  const sliderTrackRef = useRef(null);
  const sliderLayout = useRef({ x: 0, width: 0 });
  const [selectedLocation, setSelectedLocation] = useState(1); // Default to first item

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

  // Slider handler with decimal support
  const updateSliderValue = (pageX) => {
    const { x, width } = sliderLayout.current;
    if (width === 0) return;
    
    const relativeX = pageX - x;
    const percentage = Math.max(0, Math.min(100, (relativeX / width) * 100));
    // Convert percentage to actual value based on SLIDER_MAX
    const actualValue = (percentage / 100) * SLIDER_MAX;
    // Round to specified decimal precision
    const roundedValue = parseFloat(actualValue.toFixed(SLIDER_DECIMAL_PRECISION));
    setSliderValue(roundedValue);
  };


  const handleProductPress = (product) => {
    navigation.navigate('ProductDetails', { product });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.7}
    >
      {item.image ? (
        <Image source={item.image} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}
      <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center',marginTop:4}} >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={[styles.title,{fontWeight:'700'}]}>{item.amount}</Text>

      </View>
      <Text style={styles.itemDetails}>Distance: {item.distance} / {item.duration}</Text>
    </TouchableOpacity>
  );

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
      onPanResponderRelease: () => {},
    })
  ).current;

  return (
    <SafeAreaView edges={['top','bottom']} style={styles.container}>
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
    

      {/* Map View */}
      <View style={{flex:1,
        paddingBottom:50
      }}>
            {viewMode === 'list' && (
        <FlatList
          data={responseObject.data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[styles.listContainer]} // Added extra padding at the bottom
        />
      )}
    { viewMode=== 'map'&& <View style={styles.mapContainer}>
      <View style={styles.fixedButtons}>
    <View style={styles.topLocations}>
        <TouchableOpacity 
          style={[
            styles.locationBadge,
            selectedLocation === 1 && styles.locationBadgeSelected
          ]}
          onPress={() => setSelectedLocation(1)}
          activeOpacity={0.7}
        >
          <Text style={styles.locationNumber}>1</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.locationBadge,
            selectedLocation === 2 && styles.locationBadgeSelected
          ]}
          onPress={() => setSelectedLocation(2)}
          activeOpacity={0.7}
        >
          <Text style={styles.locationNumber}>2</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.locationBadge,
            selectedLocation === 3 && styles.locationBadgeSelected
          ]}
          onPress={() => setSelectedLocation(3)}
          activeOpacity={0.7}
        >
          <Text style={styles.locationNumber}>3</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.zoomControls}>
          <TouchableOpacity 
            style={styles.zoomButton}
            onPress={zoomIn}
            activeOpacity={0.7}
          >
            <Text style={styles.zoomButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.zoomButton, styles.zoomButtonBottom]}
            onPress={zoomOut}
            activeOpacity={0.7}
          >
            <View style={styles.minusText}/>
          </TouchableOpacity>
        </View>
        </View>
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
              showsUserLocation={false}
              showsMyLocationButton={false}
              showsCompass={true}
              toolbarEnabled={false}
              mapType="standard"
              loadingEnabled={true}
              showsPointsOfInterest={false}
              showsBuildings={false}
              
              customMapStyle={[
                {
                  featureType: "poi",
                  stylers: [{ visibility: "off" }]
                }
              ]}
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
              {/* Circle on initial location */}
              <Circle
                center={initialLocation}
                radius={sliderValue * 1000} // Convert km to meters
                strokeWidth={5}
                strokeColor={COLORS.blue}
                fillColor="rgba(0, 28, 100, 0)" // Semi-transparent primary color
              />

              {/* Circle on current location */}
              {location && (
                <Circle
                  center={location}
                  radius={sliderValue * 1000} // Convert km to meters
                  strokeWidth={2}
                  strokeColor={COLORS.success}
                  fillColor="rgba(76, 175, 80, 0.1)" // Semi-transparent green color
                />
              )}

              {/* Initial location marker */}
              <Marker
                coordinate={initialLocation}
                title="Initial Location"
                image={IMAGES.roundbyIcon}
              />

              {/* User location marker */}
              {/* {location && (
                <Marker
                  coordinate={location}
                  title="Your Location"
                  pinColor={COLORS.success}
                />
              )} */}

              {/* Search result markers */}
              {responseObject.data.map((marker) => (
                <Marker
                  key={marker.id}
                  coordinate={{
                    latitude: marker.location?.latitude,
                    longitude: marker.location?.longitude,
                  }}
                  title={marker.title}
                  onPress={() => handleProductPress(marker)}
                >
                  <View style={styles.customMarker}>
                    <Text style={styles.markerText}>{marker.id}</Text>
                  </View>
                </Marker>
              ))}
            </MapView>
          )}

        {/* Zoom Controls */}
       
        
       
        
        {/* Center on user location button */}
        {/* <TouchableOpacity 
          style={styles.centerButton}
          onPress={centerOnUserLocation}
        >
          <Ionicons name="locate" size={24} color={COLORS.primary} />
        </TouchableOpacity> */} 

        {/* Map View Toggle */}
       
      </View>}
      <View style={styles.row}>
        { viewMode === 'map' ? <TouchableOpacity 
          style={styles.mapViewToggle}
          // onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
        >
          <Text style={styles.mapViewText}>Distance</Text>
        </TouchableOpacity>:<View/>}
        <TouchableOpacity 
          style={[styles.mapViewToggle,{alignSelf:'flex-end'}]}
          onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
        >
          <Text style={styles.mapViewText}>Map</Text>
        </TouchableOpacity>
        </View>
        
        {/* Slider Bar */}
        { viewMode === 'map' && <View style={styles.sliderContainer}>
          
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
                { width: `${(sliderValue / SLIDER_MAX) * 100}%` }
              ]}
            />
            <View
              style={[
                styles.sliderThumb,
                { left: `${(sliderValue / SLIDER_MAX) * 100}%` }
              ]}
            />
          </View>
            <Text style={styles.sliderLabel}>{sliderValue.toFixed(SLIDER_DECIMAL_PRECISION)} km</Text>
        </View>}
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
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('UserAccount')}
        >
          <FontAwesome name="user" size={26} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    paddingTop: 10,
    paddingBottom: 12,
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
  },
  locationBadge: {
    width: 32,
    height: 32,
    // borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  locationBadgeSelected: {
    borderWidth: 2.5,
    borderColor: COLORS.blue,
  },
  locationNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.blue,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: COLORS.white, // Light green background to see if container is rendering
    alignItems: 'center',
  },
  map: {
    width: '90%',
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
  markerImage: {
    width: 40,
    height: 40,
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
  },
  mapViewText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  bottomNav: {
    position:'absolute',
    bottom:0,
    left:0,
    right:0,
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
  row:{
    width:'100%',
    flexDirection:'row',
    justifyContent:'space-between',
    paddingHorizontal:20,
    paddingTop:10
  },
  sliderContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop:10
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom:10  
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginTop:12,
    textAlign:'right'
  },
  sliderTrack: {
    height: 5,
    backgroundColor: '#AAAAAA',
    borderRadius: 10,
    position: 'relative',
    width: '100%',
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
  zoomControls: {
    // transform: [{ translateY: -48 }], // Center both buttons (44px + 8px + 44px) / 2 = 48px
    zIndex: 1000,
  },
  zoomButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 2,
    borderColor: COLORS.primary,
    marginTop:12
  },
  zoomButtonBottom: {
    marginTop: 8,
  },
  zoomButtonText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.blue,
    lineHeight: 28,
  },
  fixedButtons:{
    position:'absolute',
    left:32,
    top:12,
    zIndex:99999
  },
  minusText:{
    width:18,
    backgroundColor:COLORS.blue,
    height:4
  },
  listContainer:{
    flex:1,
    paddingHorizontal:10,
    paddingBottom:100
  },
  gridItem:{
    width:400/2.5,
    marginBottom:10
  },
  image:{
    width: '100%',
    height:  400/2.5, // Adjusted for 3:2 ratio (e.g., 120px width -> 80px height)
    borderRadius: 8,
  },
  placeholder: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#888888',
  },
  itemDetails: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  }
});

export default SearchScreen;