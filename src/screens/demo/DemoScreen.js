import React, { useState, useEffect, useRef } from 'react';
import { IMAGES } from '../../assets/images';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, Platform, PanResponder, Image, FlatList, RefreshControl } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Circle, Callout, PROVIDER_GOOGLE } from '../../components/MapView';
import * as Location from 'expo-location';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS, SLIDER_CONFIG } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { demoService } from '../../services/demo.service';
import CategoryFilterModal from '../../components/CategoryFilterModal';
import DistanceFilterModal from '../../components/DistanceFilterModal';
import PriceRangeFilterModal from '../../components/PriceRangeFilterModal';
import CombinedFiltersModal from '../../components/CombinedFiltersModal';
import DemoInstructionsModal from '../../components/DemoInstructionsModal';
import SortDropdown from '../../components/SortDropdown';
import { DEMO_CITIES, ACTIVITY_COLORS, getDefaultCity } from '../../constants/demoCities';
import LocationDisclaimerModal from '../../components/LocationDisclaimerModal';
import { useTranslation } from '../../context/TranslationContext';

const DemoScreen = ({ navigation, route }) => {
  const { t } = useTranslation();

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
    sort: 'views',
    order: 'DESC',
    measurementUnit: 'km' // Default measurement unit
  });

  // Location state - Use London as default for demo
  const [location, setLocation] = useState(null);
  const defaultCity = getDefaultCity(); // London
  const defaultLocation = { latitude: defaultCity.latitude, longitude: defaultCity.longitude };
  const [region, setRegion] = useState({
    latitude: defaultCity.latitude,
    longitude: defaultCity.longitude,
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

  // Modal states
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [distanceModalVisible, setDistanceModalVisible] = useState(false);
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [combinedFiltersModalVisible, setCombinedFiltersModalVisible] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [disclaimerModalVisible, setDisclaimerModalVisible] = useState(false);

  // Demo city state
  const [selectedCity, setSelectedCity] = useState(getDefaultCity());
  const [selectedMarker, setSelectedMarker] = useState(null); // Track selected marker for callout
  const [favorites, setFavorites] = useState(new Set()); // Track favorited items

  // User locations state
  const [userLocations, setUserLocations] = useState([]);

  // Map interaction state
  const [clickedLocation, setClickedLocation] = useState(null);
  const [clickedLocationRadius, setClickedLocationRadius] = useState(10); // km

  // Load advertisements on mount and when city changes (debounced)
  useEffect(() => {
    console.log('🌍 City Changed:');
    console.log(`  City: ${selectedCity.name}`);
    console.log(`  Location: ${selectedCity.location}`);
    console.log(`  Coordinates: ${selectedCity.latitude.toFixed(6)}, ${selectedCity.longitude.toFixed(6)}`);
    console.log(`  Radius: ${selectedCity.radius} km`);

    const timer = setTimeout(() => {
      fetchAdvertisements();
    }, 500); // Debounce 500ms

    return () => clearTimeout(timer);
  }, [selectedCity]);



  // Get user location and locations
  useEffect(() => {
    console.log('🗺️ SearchScreen mounted');
    console.log('🔑 PROVIDER_GOOGLE value:', PROVIDER_GOOGLE);
    console.log('📦 MapView available:', MapView !== null);
    console.log('📍 Initial region:', region);
    getLocationAsync();
    fetchUserLocations();
  }, []);

  // Update radius when slider changes and adjust map zoom (no API call)
  useEffect(() => {
    // Only update zoom, don't trigger API call
    // API call will happen after debounce when user stops dragging

    // Auto-zoom map based on radius to keep circle visible
    if (mapRef.current) {
      // Calculate zoom to fit circle in view
      // Formula: delta should be ~2.5x the radius to show circle comfortably
      // This ensures the circle is always visible with some padding

      const radiusInKm = sliderValue;
      const radiusInDegrees = radiusInKm / 111; // Rough conversion: 1 degree ≈ 111 km

      // Add 50% padding so circle doesn't touch edges
      const latitudeDelta = radiusInDegrees * 2.5;
      const longitudeDelta = radiusInDegrees * 2.5;

      const newRegion = {
        latitude: selectedCity.latitude,
        longitude: selectedCity.longitude,
        latitudeDelta,
        longitudeDelta,
      };

      console.log('🔍 Zoom Update:');
      console.log(`  Radius: ${radiusInKm} km`);
      console.log(`  Latitude Delta: ${latitudeDelta.toFixed(4)}`);
      console.log(`  Longitude Delta: ${longitudeDelta.toFixed(4)}`);
      console.log(`  Zoom Level: ~${(1 / latitudeDelta).toFixed(2)}x`);

      setRegion(newRegion);
      mapRef.current.animateToRegion(newRegion, 300);
    }
  }, [sliderValue, selectedCity]);

  // Debounced API call when slider stops moving
  useEffect(() => {
    setFilters({ ...filters, radius: sliderValue });
    const timer = setTimeout(() => {
      fetchAdvertisements();
    }, 800); // Wait 800ms after user stops dragging

    return () => clearTimeout(timer);
  }, [sliderValue]);

  const fetchAdvertisements = async (loadMore = false) => {
    try {
      if (!loadMore) {
        setLoading(true);
        setError(null);
      }

      const currentPage = loadMore ? page + 1 : 1;

      // For demo, use selected city location
      let searchLatitude, searchLongitude;
      searchLatitude = selectedCity.latitude;
      searchLongitude = selectedCity.longitude;

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
        radius: selectedCity.radius, // Use city's radius
        sort: filters.sort,
        order: filters.order,
        page: currentPage,
        limit: 50 // Show all markers
      };

      const response = await demoService.getDemoAdvertisements(searchFilters);

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
          t('Subscription Required'),
          t('You need an active subscription to browse advertisements.'),
          [{ text: t('View Plans'), onPress: () => navigation.navigate('AllMemberships') }]
        );
      } else if (err.require_login) {
        Alert.alert(
          t('Login Required'),
          t('Please login to browse advertisements.'),
          [{ text: t('Login'), onPress: () => navigation.navigate('SocialLogin') }]
        );
      } else {
        Alert.alert(t('Error'), t('Failed to load advertisements. Please try again.'));
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
    // Demo mode - no user locations
    return;
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
    navigation.navigate('DemoProductDetails', { advertisementId: ad.id, advertisement: ad });
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
      onPanResponderRelease: () => { },
    })
  ).current;

  const renderListItem = ({ item }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {item.images && item.images.length > 0 ? (
          <Image
            source={{ uri: item.images[0] }}
            style={styles.image}
            defaultSource={IMAGES.placeholder}
          />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderText}>{t('No Image')}</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            // Toggle favorite locally
            setFavorites(prev => {
              const newFavorites = new Set(prev);
              if (newFavorites.has(item.id)) {
                newFavorites.delete(item.id);
              } else {
                newFavorites.add(item.id);
              }
              return newFavorites;
            });
          }}
        >
          <FontAwesome
            name={favorites.has(item.id) ? "heart" : "heart-o"}
            size={24}
            color="#333"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.itemInfo}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.priceText}>£{item.price}</Text>
        </View>
        <Text style={styles.distanceText} numberOfLines={1}>
          Distance: {Math.round((item.distance || 0) * 1000)} m / {Math.round((item.distance || 0) * 20)} min walk
        </Text>
      </View>
    </TouchableOpacity>
  );



  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <FontAwesome name="search" size={20} color="#6a6a6a" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('Search Around You')}
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
            <Text style={styles.filterButtonText}>{t('Filter')}</Text>
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

        {/* Search Results Count, Instructions, and Sort */}
        <View style={styles.resultRow}>
          <Text style={styles.resultCount}>
            {loading ? 'Loading...' : `${advertisements.length} results`}
          </Text>
          <TouchableOpacity
            style={styles.instructionsButton}
            onPress={() => setShowInstructions(true)}
          >
            <Text style={styles.instructionsText}>{t('Instructions')}</Text>
          </TouchableOpacity>
          <SortDropdown
            selectedSort={{ sort: filters.sort, order: filters.order }}
            onSortChange={(sortOptions) => {
              setFilters({ ...filters, ...sortOptions });
            }}
          />
        </View>
      </View>

      {/* Main Content */}
      <View style={{ flex: 1, paddingBottom: 0 }}>
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
                  <Text style={styles.emptyText}>{t('No advertisements found')}</Text>
                  <Text style={styles.emptySubtext}>{t('Try adjusting your filters')}</Text>
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
          <View key="map-view" style={styles.mapContainer}>
            <View style={styles.fixedButtons}>
              <View style={styles.topLocations}>
                <TouchableOpacity
                  style={[
                    styles.locationBadge,
                    selectedCity.id === 1 && styles.locationBadgeSelected
                  ]}
                  onPress={() => {
                    const london = DEMO_CITIES[0]; // London
                    setSelectedCity(london);
                    const newRegion = {
                      latitude: london.latitude,
                      longitude: london.longitude,
                      latitudeDelta: 0.0922,
                      longitudeDelta: 0.0421,
                    };
                    setRegion(newRegion);
                    if (mapRef.current) {
                      mapRef.current.animateToRegion(newRegion, 1000);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.locationNumber}>1</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.locationBadge,
                    selectedCity.id === 2 && styles.locationBadgeSelected
                  ]}
                  onPress={() => {
                    const paris = DEMO_CITIES[1]; // Paris
                    setSelectedCity(paris);
                    const newRegion = {
                      latitude: paris.latitude,
                      longitude: paris.longitude,
                      latitudeDelta: 0.0922,
                      longitudeDelta: 0.0421,
                    };
                    setRegion(newRegion);
                    if (mapRef.current) {
                      mapRef.current.animateToRegion(newRegion, 1000);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.locationNumber}>2</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.locationBadge,
                    selectedCity.id === 3 && styles.locationBadgeSelected
                  ]}
                  onPress={() => {
                    const newYork = DEMO_CITIES[2]; // New York
                    setSelectedCity(newYork);
                    const newRegion = {
                      latitude: newYork.latitude,
                      longitude: newYork.longitude,
                      latitudeDelta: 0.0922,
                      longitudeDelta: 0.0421,
                    };
                    setRegion(newRegion);
                    if (mapRef.current) {
                      mapRef.current.animateToRegion(newRegion, 1000);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.locationNumber}>3</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.locationBadge,
                    selectedCity.id === 4 && styles.locationBadgeSelected
                  ]}
                  onPress={() => {
                    const tokyo = DEMO_CITIES[3]; // Tokyo
                    setSelectedCity(tokyo);
                    const newRegion = {
                      latitude: tokyo.latitude,
                      longitude: tokyo.longitude,
                      latitudeDelta: 0.0922,
                      longitudeDelta: 0.0421,
                    };
                    setRegion(newRegion);
                    if (mapRef.current) {
                      mapRef.current.animateToRegion(newRegion, 1000);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.locationNumber}>4</Text>
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
                  <View style={styles.minusText} />
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
                    elementType: "labels",
                    stylers: [{ visibility: "off" }]
                  },
                  {
                    featureType: "poi.business",
                    stylers: [{ visibility: "off" }]
                  },
                  {
                    featureType: "poi.park",
                    elementType: "labels",
                    stylers: [{ visibility: "off" }]
                  },
                  {
                    featureType: "poi.attraction",
                    stylers: [{ visibility: "off" }]
                  },
                  {
                    featureType: "poi.government",
                    stylers: [{ visibility: "off" }]
                  },
                  {
                    featureType: "poi.medical",
                    stylers: [{ visibility: "off" }]
                  },
                  {
                    featureType: "poi.place_of_worship",
                    stylers: [{ visibility: "off" }]
                  },
                  {
                    featureType: "poi.school",
                    stylers: [{ visibility: "off" }]
                  },
                  {
                    featureType: "poi.sports_complex",
                    stylers: [{ visibility: "off" }]
                  },
                  {
                    featureType: "transit",
                    elementType: "labels",
                    stylers: [{ visibility: "off" }]
                  }
                ]}
                onMapReady={() => {
                  console.log('✅ Map is ready!');
                  console.log('📍 Current region:', region);
                  console.log('🔑 Using PROVIDER_GOOGLE:', PROVIDER_GOOGLE);
                  setMapError(null);
                }}
                onMapLoaded={() => {
                  console.log('✅ Map loaded successfully!');
                }}
                onError={(error) => {
                  console.error('❌ Map error:', error);
                  console.error('❌ Error details:', JSON.stringify(error, null, 2));
                  const errorMessage = error?.message || error?.nativeEvent?.message || 'Unknown error';
                  setMapError(errorMessage);
                }}
              >
                {/* Search radius circle - follows selected city */}
                <Circle
                  center={{
                    latitude: selectedCity.latitude,
                    longitude: selectedCity.longitude
                  }}
                  radius={sliderValue * 1000}
                  strokeWidth={2}
                  strokeColor="#001C64"
                  fillColor="rgba(0, 28, 100, 0.1)"
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
                    title={t('Your Location')}
                    image={IMAGES.roundbyIcon}
                  />
                )}

                {/* Clicked location marker */}
                {clickedLocation && (
                  <Marker
                    coordinate={clickedLocation}
                    title={t('Selected Location')}
                    description={`Radius: ${clickedLocationRadius}km - Tap to clear`}
                    pinColor="orange"
                    onPress={() => setClickedLocation(null)}
                  />
                )}

                {/* Advertisement markers */}
                {advertisements.map((ad) => {
                  // Only show ads with location data
                  if (!ad.latitude || !ad.longitude) return null;

                  // Get activity color and label
                  const activityData = ACTIVITY_COLORS[ad.activity_id] || ACTIVITY_COLORS[1];
                  const markerLabel = activityData.label;
                  const markerColor = activityData.color;
                  const isSelected = selectedMarker === ad.id;

                  return (
                    <Marker
                      key={ad.id}
                      coordinate={{
                        latitude: parseFloat(ad.latitude),
                        longitude: parseFloat(ad.longitude),
                      }}
                      onPress={() => {
                        // Tap marker: callout will show automatically
                        setSelectedMarker(ad.id);

                        // Animate map to position marker at 20% from bottom
                        if (mapRef.current) {
                          const markerCoordinate = {
                            latitude: parseFloat(ad.latitude),
                            longitude: parseFloat(ad.longitude),
                          };

                          // Calculate offset to position marker at 20% from bottom (80% from top)
                          // This is done by adjusting the latitude
                          const latitudeDelta = region.latitudeDelta || 0.0922;
                          const offsetLatitude = markerCoordinate.latitude + (latitudeDelta * 0.3); // Shift up by 30% of delta

                          mapRef.current.animateToRegion({
                            latitude: offsetLatitude,
                            longitude: markerCoordinate.longitude,
                            latitudeDelta: latitudeDelta,
                            longitudeDelta: region.longitudeDelta || 0.0421,
                          }, 300);
                        }
                      }}
                      onCalloutPress={() => {
                        // Tap callout: navigate to product
                        handleProductPress(ad);
                      }}
                    >
                      <View style={[styles.customMarker, { backgroundColor: markerColor }, isSelected && styles.selectedMarker]}>
                        <Text style={styles.markerText}>{markerLabel}</Text>
                      </View>


                      {/* Callout - Always present, shows when marker is tapped */}
                      <Callout tooltip onPress={() => handleProductPress(ad)}>
                        <TouchableOpacity
                          style={styles.calloutContainer}
                          onPress={() => handleProductPress(ad)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.calloutImageContainer}>
                            {ad.images && ad.images.length > 0 ? (
                              <Image
                                source={{ uri: ad.images[0] }}
                                style={styles.calloutImage}
                              />
                            ) : (
                              <View style={styles.calloutImagePlaceholder}>
                                <FontAwesome name="image" size={20} color="#ccc" />
                              </View>
                            )}
                          </View>
                          <View style={styles.calloutInfo}>
                            <Text style={styles.calloutTitle} numberOfLines={2}>
                              {ad.title}
                            </Text>
                            <Text style={styles.calloutPrice}>£{ad.price}</Text>
                            <Text style={styles.calloutTap}>{t('Tap to view details')}</Text>
                          </View>
                        </TouchableOpacity>
                      </Callout>
                    </Marker>
                  );
                })}
              </MapView>
            )}

            {/* Location Disclaimer */}
            {viewMode === 'map' && (
              <View style={styles.disclaimerContainer}>
                <Text style={styles.disclaimerText}>
                  Locations are approximate. {' '}
                  <Text
                    style={styles.disclaimerLink}
                    onPress={() => setDisclaimerModalVisible(true)}
                  >
                    {t('Read more')}</Text>
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* View Toggle & Distance Slider */}
      <View style={[styles.rowa, { marginBottom: viewMode === 'list' ? 35 : 5 }]}>
        {viewMode === 'map' && (
          <TouchableOpacity style={styles.mapViewToggle}>
            <Text style={styles.mapViewText}></Text>
          </TouchableOpacity>
        )} else {
          <TouchableOpacity style={styles.mapViewToggle}>
            <Text style={styles.mapViewText}></Text>
          </TouchableOpacity>
        }
        <TouchableOpacity
          style={[styles.mapViewToggle, { alignSelf: 'center' }]}
          onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
        >
          <Text style={[styles.mapViewText, { marginRight: viewMode === 'list' ? 8 : 0 }]}>{viewMode === 'map' ? 'Products' : 'Map'}</Text>
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
          <View style={styles.rowa}>
            <Text style={[styles.sliderLabel, { alignSelf: 'left' }]}>{t('Distance')}</Text>
            <Text style={[styles.sliderLabel, { alignSelf: 'right' }]}>{sliderValue.toFixed(SLIDER_DECIMAL_PRECISION)} km</Text>
          </View>
        </View>
      )}

      {/* Quit Demo Button */}
      <TouchableOpacity
        style={styles.quitButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.quitButtonText}>{t('Quit Demo & Register')}</Text>
      </TouchableOpacity>

      {/* Loading Overlay */}
      {loading && page === 1 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('Loading advertisements...')}</Text>
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

      <DemoInstructionsModal
        visible={showInstructions}
        onClose={() => setShowInstructions(false)}
        onCitySelect={(city) => {
          setSelectedCity(city);
          const newRegion = {
            latitude: city.latitude,
            longitude: city.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          };
          setRegion(newRegion);
          if (mapRef.current) {
            setTimeout(() => {
              mapRef.current?.animateToRegion(newRegion, 1000);
            }, 100);
          }
        }}
      />

      <LocationDisclaimerModal
        visible={disclaimerModalVisible}
        onClose={() => setDisclaimerModalVisible(false)}
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
  instructionsButton: {
    backgroundColor: '#E3F2FD',
    borderColor: '#1E6FD6',
  },
  instructionsButtonText: {
    color: '#1E6FD6',
    fontWeight: '600',
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
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  instructionsButton: {
    paddingHorizontal: 8,
  },
  instructionsText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1a1a1a',
    textDecorationLine: 'underline',
  },
  instructionsButtonSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E3F2FD',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E6FD6',
    shadowColor: '#1E6FD6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionsSectionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1E6FD6',
    marginLeft: 10,
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
    marginBottom: 10,
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
    borderRadius: 20,
    // backgroundColor set dynamically based on activity
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  selectedMarker: {
    transform: [{ scale: 1.2 }],
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  calloutContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  calloutImageContainer: {
    width: '100%',
    height: 100,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  calloutImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  calloutImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calloutInfo: {
    gap: 4,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  calloutPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  calloutTap: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10
  },
  rowa: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 0
  },
  sliderContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#303234',
    marginTop: 12,
    textAlign: 'right'
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
    marginTop: 12
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
  fixedButtons: {
    position: 'absolute',
    left: 32,
    top: 12,
    zIndex: 99999
  },
  minusText: {
    width: 18,
    backgroundColor: COLORS.blue,
    height: 4
  },
  listContainer: {
    paddingHorizontal: 0,
    paddingBottom: 100
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    margin: 8,
    width: 'calc(100% - 16px)',
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
    paddingTop: 0,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  distanceText: {
    fontSize: 11,
    color: '#303234',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mapViewText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  quitButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    marginVertical: 15,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  quitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disclaimerContainer: {
    backgroundColor: '#f9f9f9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'left',
    width: '90%',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'left',
  },
  disclaimerLink: {
    fontSize: 12,
    color: COLORS.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});

export default DemoScreen;