import React, { useState, useEffect, useRef } from 'react';
import { IMAGES } from '../../assets/images';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, Platform, PanResponder, Image, FlatList, RefreshControl } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS, SLIDER_CONFIG } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { advertisementService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import CategoryFilterModal from '../../components/CategoryFilterModal';
import DistanceFilterModal from '../../components/DistanceFilterModal';
import PriceRangeFilterModal from '../../components/PriceRangeFilterModal';
import CombinedFiltersModal from '../../components/CombinedFiltersModal';

const SearchScreen = ({ navigation, route }) => {
  const { user, hasActiveSubscription } = useAuth();
  
  // Search and filter state
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState('map');
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    category_id: null,
    subcategory_id: null,
    activity_id: null,
    condition_id: null,
    min_price: null,
    max_price: null,
    radius: 50, // km
    sort: 'created_at',
    order: 'DESC'
  });

  // Location state
  const [location, setLocation] = useState(null);
  const defaultLocation = { latitude: 26.77777, longitude: 81.0817 };
  const [region, setRegion] = useState({
    latitude: defaultLocation.latitude,
    longitude: defaultLocation.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [mapError, setMapError] = useState(null);
  const mapRef = useRef(null);
  
  // Slider for distance
  const SLIDER_MAX = SLIDER_CONFIG.max;
  const SLIDER_MIN = SLIDER_CONFIG.min;
  const SLIDER_DECIMAL_PRECISION = SLIDER_CONFIG.decimalPrecision;
  const [sliderValue, setSliderValue] = useState(SLIDER_CONFIG.defaultValue);
  const sliderTrackRef = useRef(null);
  const sliderLayout = useRef({ x: 0, width: 0 });
  const [selectedLocation, setSelectedLocation] = useState(1);

  // Modal states
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [distanceModalVisible, setDistanceModalVisible] = useState(false);
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [combinedFiltersModalVisible, setCombinedFiltersModalVisible] = useState(false);

  // User locations state
  const [userLocations, setUserLocations] = useState([]);

  // Map interaction state
  const [clickedLocation, setClickedLocation] = useState(null);
  const [clickedLocationRadius, setClickedLocationRadius] = useState(10); // km

  // Load advertisements on mount and when filters change
  useEffect(() => {
    if (hasActiveSubscription()) {
      fetchAdvertisements();
    }
  }, [filters]);


  // Get user location and locations
  useEffect(() => {
    getLocationAsync();
    fetchUserLocations();
  }, []);

  // Update radius when slider changes
  useEffect(() => {
    setFilters({ ...filters, radius: sliderValue });
  }, [sliderValue]);

  const fetchAdvertisements = async (loadMore = false) => {
    try {
      if (!loadMore) {
        setLoading(true);
        setError(null);
      }

      const currentPage = loadMore ? page + 1 : 1;
      
      // Determine search center: user's first location > GPS location > default location
      let searchLatitude, searchLongitude;
      if (userLocations.length > 0) {
        // Use user's first saved location
        const firstLocation = userLocations[0];
        searchLatitude = parseFloat(firstLocation.latitude);
        searchLongitude = parseFloat(firstLocation.longitude);
      } else if (location) {
        // Use GPS location
        searchLatitude = location.latitude;
        searchLongitude = location.longitude;
      } else {
        // Use default location
        searchLatitude = defaultLocation.latitude;
        searchLongitude = defaultLocation.longitude;
      }

      // Build filter object
      const searchFilters = {
        search: searchText || filters.search,
        category_id: filters.category_id,
        subcategory_id: filters.subcategory_id,
        activity_id: filters.activity_id,
        condition_id: filters.condition_id,
        min_price: filters.min_price,
        max_price: filters.max_price,
        latitude: searchLatitude,
        longitude: searchLongitude,
        radius: filters.radius,
        sort: filters.sort,
        order: filters.order,
        page: currentPage,
        limit: 20
      };

      const response = await advertisementService.browseAdvertisements(searchFilters);

      if (response.success) {
        const newAds = response.data.advertisements;
        
        if (loadMore) {
          setAdvertisements([...advertisements, ...newAds]);
        } else {
          setAdvertisements(newAds);
        }

        setPage(currentPage);
        setHasMore(newAds.length === 20); // If we got full page, there might be more
      }
    } catch (err) {
      console.error('Error fetching advertisements:', err);
      setError(err.message || 'Failed to load advertisements');
      
      // Handle specific errors
      if (err.require_subscription) {
        Alert.alert(
          'Subscription Required',
          'You need an active subscription to browse advertisements.',
          [{ text: 'View Plans', onPress: () => navigation.navigate('AllMemberships') }]
        );
      } else if (err.require_login) {
        Alert.alert(
          'Login Required',
          'Please login to browse advertisements.',
          [{ text: 'Login', onPress: () => navigation.navigate('SocialLogin') }]
        );
      } else {
        Alert.alert('Error', 'Failed to load advertisements. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchAdvertisements(false);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchAdvertisements(true);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchAdvertisements(false);
  };

  const fetchUserLocations = async () => {
    try {
      const response = await advertisementService.getUserLocations();
      if (response.success) {
        const locations = response.data.locations;
        setUserLocations(locations);

        // Set initial region to user's first location if available
        if (locations.length > 0) {
          const firstLocation = locations[0];
          const userLocation = {
            latitude: parseFloat(firstLocation.latitude),
            longitude: parseFloat(firstLocation.longitude),
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          };
          setRegion(userLocation);

          // Also animate map to user's location
          if (mapRef.current) {
            setTimeout(() => {
              mapRef.current?.animateToRegion(userLocation, 1000);
            }, 100);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user locations:', error);
    }
  };

  const getLocationAsync = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.log('Location permission denied, using default location');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = currentLocation.coords;
      setLocation({ latitude, longitude });

      // Only set region to GPS location if user doesn't have saved locations
      if (userLocations.length === 0) {
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };

        setRegion(newRegion);

        if (mapRef.current) {
          setTimeout(() => {
            mapRef.current?.animateToRegion(newRegion, 1000);
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
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

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    setClickedLocation(coordinate);

    // Animate to the clicked location
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        ...coordinate,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }, 1000);
    }
  };

  // Get user's first location for default circle
  const getFirstUserLocation = () => {
    if (userLocations.length > 0) {
      const firstLocation = userLocations[0];
      return {
        latitude: parseFloat(firstLocation.latitude),
        longitude: parseFloat(firstLocation.longitude),
      };
    }
    return null;
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
    setCombinedFiltersModalVisible(true);
  };

  const handleDistancePress = () => {
    setDistanceModalVisible(true);
  };

  const handleCategoryPress = () => {
    setCategoryModalVisible(true);
  };

  const handlePricePress = () => {
    setPriceModalVisible(true);
  };

  // Modal handlers
  const handleCategorySelect = (category) => {
    setFilters({ ...filters, category_id: category });
  };

  const handleDistanceSelect = (radius) => {
    setFilters({ ...filters, radius });
    setSliderValue(radius);
  };

  const handlePriceRangeSelect = (minPrice, maxPrice) => {
    setFilters({ ...filters, min_price: minPrice, max_price: maxPrice });
  };

  const handleCombinedFiltersUpdate = (updatedFilters) => {
    setFilters(updatedFilters);
  };

  const handleMakeAnAd = () => {
    navigation.navigate('MakeAnAd');
  };

  const handleProductPress = (ad) => {
    navigation.navigate('ProductDetails', { advertisementId: ad.id, advertisement: ad });
  };

  // Slider handler
  const updateSliderValue = (pageX) => {
    const { x, width } = sliderLayout.current;
    if (width === 0) return;
    
    const relativeX = pageX - x;
    const percentage = Math.max(0, Math.min(100, (relativeX / width) * 100));
    const actualValue = (percentage / 100) * SLIDER_MAX;
    const roundedValue = parseFloat(actualValue.toFixed(SLIDER_DECIMAL_PRECISION));
    setSliderValue(roundedValue);
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
      onPanResponderRelease: () => {},
    })
  ).current;

  const renderListItem = ({ item }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.7}
    >
      {item.images && item.images.length > 0 ? (
        <Image 
          source={{ uri: item.images[0] }} 
          style={styles.image}
          defaultSource={IMAGES.placeholder}
        />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}
      <View style={styles.itemInfo}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.priceText}>₹{item.price}</Text>
        {item.distance && (
          <Text style={styles.itemDetails}>Distance: {item.distance} km</Text>
        )}
        <Text style={styles.itemDetails}>{item.city || item.location_name}</Text>
      </View>
    </TouchableOpacity>
  );

  // Check subscription before showing content
  if (!hasActiveSubscription()) {
    return (
      <SafeScreenContainer>
        <View style={styles.subscriptionRequired}>
          <FontAwesome name="lock" size={48} color="#ccc" />
          <Text style={styles.subscriptionText}>
            Active subscription required to browse advertisements
          </Text>
          <TouchableOpacity 
            style={styles.subscribeButton}
            onPress={() => navigation.navigate('AllMemberships')}
          >
            <Text style={styles.subscribeButtonText}>View Plans</Text>
          </TouchableOpacity>
        </View>
      </SafeScreenContainer>
    );
  }

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
            onSubmitEditing={handleSearch}
            returnKeyType="search"
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
            {filters.activity_id && <View style={styles.filterBadge} />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton} onPress={handleDistancePress}>
            <Text style={styles.filterButtonText}>
              Distance{filters.radius && filters.radius !== 50 ? ` (${filters.radius}km)` : ''}
            </Text>
            {filters.radius && filters.radius !== 50 && <View style={styles.filterBadge} />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton} onPress={handleCategoryPress}>
            <Text style={styles.filterButtonText}>
              Category{filters.category_id ? ` (${filters.category_id})` : ''}
            </Text>
            {filters.category_id && <View style={styles.filterBadge} />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton} onPress={handlePricePress}>
            <Text style={styles.filterButtonText}>
              Price{(filters.min_price || filters.max_price) ?
                ` (₹${filters.min_price || '0'}-${filters.max_price || '∞'})` : ''}
            </Text>
            {(filters.min_price || filters.max_price) && <View style={styles.filterBadge} />}
          </TouchableOpacity>
        </ScrollView>

        {/* Search Results Count */}
        <Text style={styles.resultCount}>
          {loading ? 'Loading...' : `${advertisements.length} results`}
        </Text>
      </View>

      {/* Main Content */}
      <View style={{flex:1, paddingBottom:50}}>
        {/* List View */}
        {viewMode === 'list' && (
          <FlatList
            data={advertisements}
            renderItem={renderListItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[COLORS.primary]}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              !loading && (
                <View style={styles.emptyContainer}>
                  <FontAwesome name="search" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No advertisements found</Text>
                  <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
                </View>
              )
            }
            ListFooterComponent={
              loading && page > 1 && (
                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
              )
            }
          />
        )}

        {/* Map View */}
        {viewMode === 'map' && (
          <View style={styles.mapContainer}>
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
                onPress={handleMapPress}
                customMapStyle={[
                  {
                    featureType: "poi",
                    stylers: [{ visibility: "off" }]
                  }
                ]}
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
                {/* Search radius circle */}
                <Circle
                  center={getFirstUserLocation() || location || defaultLocation}
                  radius={sliderValue * 1000}
                  strokeWidth={2}
                  strokeColor={COLORS.primary}
                  fillColor="rgba(63, 81, 181, 0.1)"
                />

                {/* Default circle around user's first location */}
                {getFirstUserLocation() && (
                  <Circle
                    center={getFirstUserLocation()}
                    radius={5000} // 5km default circle
                    strokeWidth={2}
                    strokeColor="#4CAF50"
                    fillColor="rgba(76, 175, 80, 0.1)"
                  />
                )}

                {/* Circle around clicked location */}
                {clickedLocation && (
                  <Circle
                    center={clickedLocation}
                    radius={clickedLocationRadius * 1000}
                    strokeWidth={2}
                    strokeColor="#FF9800"
                    fillColor="rgba(255, 152, 0, 0.1)"
                  />
                )}

                {/* User location marker */}
                {location && (
                  <Marker
                    coordinate={location}
                    title="Your Location"
                    image={IMAGES.roundbyIcon}
                  />
                )}

                {/* Clicked location marker */}
                {clickedLocation && (
                  <Marker
                    coordinate={clickedLocation}
                    title="Selected Location"
                    description={`Radius: ${clickedLocationRadius}km - Tap to clear`}
                    pinColor="orange"
                    onPress={() => setClickedLocation(null)}
                  />
                )}

                {/* Advertisement markers */}
                {advertisements.map((ad) => {
                  // Only show ads with location data
                  if (!ad.latitude || !ad.longitude) return null;

                  // Get first letter of activity name or fallback to price
                  const activityFirstLetter = ad.activity_name ? ad.activity_name.charAt(0).toUpperCase() : '₹';

                  return (
                    <Marker
                      key={ad.id}
                      coordinate={{
                        latitude: parseFloat(ad.latitude),
                        longitude: parseFloat(ad.longitude),
                      }}
                      title={ad.title}
                      description={`₹${ad.price} - ${ad.activity_name || 'General'}`}
                      onPress={() => handleProductPress(ad)}
                    >
                      <View style={styles.customMarker}>
                        <Text style={styles.markerText}>{activityFirstLetter}</Text>
                      </View>
                    </Marker>
                  );
                })}
              </MapView>
            )}
          </View>
        )}
      </View>

      {/* View Toggle & Distance Slider */}
      <View style={styles.rowa}>
        {viewMode === 'map' && (
          <TouchableOpacity style={styles.mapViewToggle}>
            <Text style={styles.mapViewText}>Distance</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.mapViewToggle, {alignSelf:'flex-end'}]}
          onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
        >
          <Text style={styles.mapViewText}>{viewMode === 'map' ? 'List' : 'Map'}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Distance Slider (Map View Only) */}
      {viewMode === 'map' && (
        <View style={styles.sliderContainer}>
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
        </View>
      )}

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

      {/* Loading Overlay */}
      {loading && page === 1 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading advertisements...</Text>
        </View>
      )}

      {/* Filter Modals */}
      <CategoryFilterModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        selectedCategory={filters.category_id}
        onSelectCategory={handleCategorySelect}
      />

      <DistanceFilterModal
        visible={distanceModalVisible}
        onClose={() => setDistanceModalVisible(false)}
        selectedRadius={filters.radius}
        onSelectRadius={handleDistanceSelect}
      />

      <PriceRangeFilterModal
        visible={priceModalVisible}
        onClose={() => setPriceModalVisible(false)}
        minPrice={filters.min_price}
        maxPrice={filters.max_price}
        onSelectPriceRange={handlePriceRangeSelect}
      />

      <CombinedFiltersModal
        visible={combinedFiltersModalVisible}
        onClose={() => setCombinedFiltersModalVisible(false)}
        filters={filters}
        onUpdateFilters={handleCombinedFiltersUpdate}
        onOpenCategoryModal={() => setCategoryModalVisible(true)}
        onOpenDistanceModal={() => setDistanceModalVisible(true)}
        onOpenPriceModal={() => setPriceModalVisible(true)}
      />
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
    position: 'relative',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  filterBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    top: -2,
    right: -2,
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
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  map: {
    width: '90%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
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
  customMarker: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
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
  rowa:{
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
    zIndex: 1000,
  },
  zoomButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal:10,
    paddingBottom:100
  },
  gridItem:{
    width: '48%',
    marginBottom:16,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  image:{
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#888888',
  },
  itemInfo: {
    padding: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  subscriptionRequired: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  subscriptionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  subscribeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mapViewToggle: {
  },
  mapViewText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
  },
});

export default SearchScreen;