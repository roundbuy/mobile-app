import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from '../../components/MapView';
import { COLORS } from '../../constants/theme';
import { decodePolyline } from '../../utils/mapUtils';

const GOOGLE_MAPS_KEY = 'AIzaSyA7xDzwDpKqHknfWZdIm2yUcKIBtpPk4UE';

const ProductDirectionsScreen = ({ route, navigation }) => {
  const { product, latitude: destLat, longitude: destLng } = route.params || {};
  const [travelMode, setTravelMode] = useState('walking'); // 'walking' or 'driving'
  const [loading, setLoading] = useState(true);
  const [routeData, setRouteData] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  
  const mapRef = useRef(null);

  useEffect(() => {
    getUserLocationAndFetchRoute();
  }, [travelMode]);

  const getUserLocationAndFetchRoute = async () => {
    try {
      setLoading(true);
      
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      let originCoords = { latitude: 51.875462, longitude: -0.372755 }; // Fallback default
      
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        originCoords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setUserLocation(originCoords);
      } else {
        console.warn('Location permission denied, using default coordinates');
      }

      // Hit Directions API
      const modeParam = travelMode === 'walking' ? 'walking' : 'driving';
      const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${originCoords.latitude},${originCoords.longitude}&destination=${destLat},${destLng}&mode=${modeParam}&key=${GOOGLE_MAPS_KEY}`;
      
      const response = await fetch(apiUrl);
      const json = await response.json();

      if (json.status === 'OK' && json.routes?.length > 0) {
        const route = json.routes[0];
        const leg = route.legs[0];
        
        setRouteData({
          distance: leg.distance.text,
          duration: leg.duration.text,
          steps: leg.steps.map(step => ({
            instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // strip html tags
            distance: step.distance.text,
            duration: step.duration.text,
          })),
        });

        const points = decodePolyline(route.overview_polyline.points);
        setRouteCoords(points);

        // Adjust map to fit route
        fitMapToCoordinates(originCoords, { latitude: destLat, longitude: destLng });
      } else {
        console.warn('Google Directions API returned error status:', json.status);
        generateFallbackRoute(originCoords, { latitude: destLat, longitude: destLng });
      }
    } catch (error) {
      console.error('Fetch route error:', error);
      generateFallbackRoute(userLocation || { latitude: 51.875462, longitude: -0.372755 }, { latitude: destLat, longitude: destLng });
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackRoute = (origin, dest) => {
    // Soft Fallback: Direct geodesic line
    setRouteCoords([origin, dest]);

    const dist = calculateDistance(origin.latitude, origin.longitude, dest.latitude, dest.longitude);
    const walkTime = Math.round(dist * 20); // 20 mins per km walking
    const driveTime = Math.round(dist * 3); // 3 mins per km driving

    setRouteData({
      distance: `${dist.toFixed(1)} km`,
      duration: travelMode === 'walking' ? `${walkTime} mins` : `${driveTime} mins`,
      steps: [
        { instruction: `Start navigation from your location`, distance: '0 m', duration: '1 min' },
        { instruction: `Head towards ${product?.location?.city || 'seller location'} along direct path`, distance: `${dist.toFixed(1)} km`, duration: travelMode === 'walking' ? `${walkTime} mins` : `${driveTime} mins` },
        { instruction: `Arrive at destination: ${product?.title || 'Item Location'}`, distance: '0 m', duration: '0 min' },
      ],
      isFallback: true,
    });

    fitMapToCoordinates(origin, dest);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const fitMapToCoordinates = (origin, dest) => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.animateToRegion({
          latitude: (origin.latitude + dest.latitude) / 2,
          longitude: (origin.longitude + dest.longitude) / 2,
          latitudeDelta: Math.abs(origin.latitude - dest.latitude) * 1.8 || 0.05,
          longitudeDelta: Math.abs(origin.longitude - dest.longitude) * 1.8 || 0.05,
        }, 1000);
      }, 300);
    }
  };

  const getRegionForCoordinate = () => {
    const origin = userLocation || { latitude: 51.875462, longitude: -0.372755 };
    return {
      latitude: (origin.latitude + destLat) / 2,
      longitude: (origin.longitude + destLng) / 2,
      latitudeDelta: Math.abs(origin.latitude - destLat) * 2 || 0.09,
      longitudeDelta: Math.abs(origin.longitude - destLng) * 2 || 0.04,
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Directions to Item</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Map View */}
      <View style={styles.mapWrapper}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={getRegionForCoordinate()}
        >
          {/* User Location Marker */}
          <Marker
            coordinate={userLocation || { latitude: 51.875462, longitude: -0.372755 }}
            title="Your Location"
            pinColor="#007AFF"
          />

          {/* Product Destination Marker */}
          <Marker
            coordinate={{ latitude: destLat, longitude: destLng }}
            title={product?.title || 'Destination'}
            pinColor="#FF3B30"
          />

          {/* Polyline Route */}
          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeWidth={4}
              strokeColor={travelMode === 'walking' ? '#34C759' : '#007AFF'}
            />
          )}
        </MapView>

        {/* Travel Mode Toggle overlay */}
        <View style={styles.modeToggleContainer}>
          <TouchableOpacity
            style={[styles.modeButton, travelMode === 'walking' && styles.activeModeButton]}
            onPress={() => setTravelMode('walking')}
            activeOpacity={0.8}
          >
            <Ionicons name="walk" size={20} color={travelMode === 'walking' ? '#FFF' : '#303030'} />
            <Text style={[styles.modeText, travelMode === 'walking' && styles.activeModeText]}>Walk</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, travelMode === 'driving' && styles.activeModeButton]}
            onPress={() => setTravelMode('driving')}
            activeOpacity={0.8}
          >
            <Ionicons name="car" size={20} color={travelMode === 'driving' ? '#FFF' : '#303030'} />
            <Text style={[styles.modeText, travelMode === 'driving' && styles.activeModeText]}>Drive</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Info panel at bottom */}
      <View style={styles.infoPanel}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loaderText}>Calculating path...</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Distance</Text>
                <Text style={styles.statVal}>{routeData?.distance || '0 km'}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Est. Time</Text>
                <Text style={styles.statVal}>{routeData?.duration || '0 mins'}</Text>
              </View>
            </View>

            {routeData?.isFallback && (
              <View style={styles.fallbackAlert}>
                <Ionicons name="information-circle" size={16} color="#FF9500" style={{ marginRight: 6 }} />
                <Text style={styles.fallbackAlertText}>Showing straight line path (Google restrictions applied)</Text>
              </View>
            )}

            <ScrollView style={styles.stepsScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.stepsTitle}>Navigation Steps</Text>
              {routeData?.steps?.map((step, idx) => (
                <View key={idx} style={styles.stepItem}>
                  <View style={styles.stepNumberBadge}>
                    <Text style={styles.stepNumberText}>{idx + 1}</Text>
                  </View>
                  <View style={styles.stepDetails}>
                    <Text style={styles.stepInstruction}>{step.instruction}</Text>
                    <Text style={styles.stepDistance}>{step.distance} ({step.duration})</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  mapWrapper: {
    flex: 1.2,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  modeToggleContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeModeButton: {
    backgroundColor: '#000',
  },
  modeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#303030',
    marginLeft: 6,
  },
  activeModeText: {
    color: '#FFF',
  },
  infoPanel: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    fontSize: 14,
    color: '#606060',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#808080',
    marginBottom: 4,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#EAEAEA',
  },
  fallbackAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    padding: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  fallbackAlertText: {
    fontSize: 11,
    color: '#E65100',
    fontWeight: '500',
    flex: 1,
  },
  stepsScroll: {
    flex: 1,
    marginTop: 16,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F0F0F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#606060',
  },
  stepDetails: {
    flex: 1,
  },
  stepInstruction: {
    fontSize: 13,
    color: '#303030',
    lineHeight: 18,
  },
  stepDistance: {
    fontSize: 11,
    color: '#909090',
    marginTop: 2,
  },
});

export default ProductDirectionsScreen;
