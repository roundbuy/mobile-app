import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { IMAGES } from '../../assets/images';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, Platform, PanResponder, Image, FlatList, RefreshControl, Dimensions, Modal, Animated } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Circle, Callout, PROVIDER_GOOGLE } from '../../components/MapView';
import * as Location from 'expo-location';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS, SLIDER_CONFIG } from '../../constants/theme';
import { ACTIVITY_COLORS } from '../../constants/demoCities';
import { SafeAreaView } from 'react-native-safe-area-context';
import favoritesService from '../../services/favoritesService';
import { advertisementService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/TranslationContext';
import DistanceFilterModal from '../../components/DistanceFilterModal';
import PriceRangeFilterModal from '../../components/PriceRangeFilterModal';
import CombinedFiltersModal from '../../components/CombinedFiltersModal';
import MultiSelectFilterModal from '../../components/MultiSelectFilterModal';
import SortDropdown from '../../components/SortDropdown';
import { useFocusEffect } from '@react-navigation/native';
import { getFullImageUrl } from '../../utils/imageUtils';
import LocationDisclaimerModal from '../../components/LocationDisclaimerModal';
import ShowcaseCarousel from '../../components/ShowcaseCarousel';
import HomeMarketCarousel from '../../components/HomeMarketCarousel';
import BannerAdCard from '../../components/BannerAdCard';
import SectionHeader from '../../components/SectionHeader';
import PromotionsGrid from '../../components/PromotionsGrid';
import StandardProductCard from '../../components/StandardProductCard';
import Hyperlink from '../../components/common/Hyperlink';
import SearchInstructionsModal from '../../components/SearchInstructionsModal';
import QuickOnboardingPrompt from '../../components/QuickOnboardingPrompt';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import stripeService from '../../services/stripeService';
import PaymentSheet from '../../components/PaymentSheet';

const RECENT_SEARCHES_KEY = '@roundbuy_recent_searches';
const MAX_RECENTS = 8;

const ONBOARDING_PROMPT_KEYS = {
  location: '@roundbuy_onboarding_location',
  profile: '@roundbuy_onboarding_profile',
  payment: '@roundbuy_onboarding_payment',
};
const PROMPTS_ORDER = ['location', 'profile', 'payment'];

const MOCK_GALLERIES = [
  { id: 1, name: 'Streetwear Essentials', hero_image_url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=400&q=80', description: 'The hottest urban outfits.' },
  { id: 2, name: 'Cozy Knitwear & Jackets', hero_image_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80', description: 'Stay warm and stylish.' },
  { id: 3, name: 'Vintage & Retro Finds', hero_image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80', description: 'Timeless denim and tees.' }
];

const MOCK_FEED = {
  general: [
    { id: 't1', title: 'Retro Denim Jacket', price: 2999.00, trending_score: 185, images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80'] },
    { id: 't2', title: 'Chelsea Boots', price: 4499.00, trending_score: 142, images: ['https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=400&q=80'] }
  ],
  women: [
    { id: 'w1', title: 'Floral Silk Midi Dress', price: 3499.00, trending_score: 176, images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=400&q=80'] }
  ],
  men: [
    { id: 'm1', title: 'Hooded Windbreaker', price: 3999.00, trending_score: 154, images: ['https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=400&q=80'] }
  ],
  children: [
    { id: 'c1', title: 'Kids Waterproof Rainboots', price: 899.00, trending_score: 77, images: ['https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=400&q=80'] }
  ]
};

const MOCK_EVENTS = [
  { id: 1, title: 'Summer Thrift Pop-up', start_time: '2026-07-15T18:00:00Z', organizer: 'VintageCo', image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80', viewers_count: 45 },
  { id: 2, title: 'Sneaker Head Bidding Room', start_time: '2026-07-16T20:00:00Z', organizer: 'SoleSupply', image_url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=400&q=80', viewers_count: 120 }
];

const getBadgeConfig = (badge) => {
  const level = badge.level?.toLowerCase();
  const type = badge.type?.toLowerCase();

  // Membership Badges
  if (type === 'membership') {
    switch (level) {
      case 'gold': return { color: '#FFD700', icon: 'star', label: 'Gold' };
      case 'green': return { color: '#4CAF50', icon: 'shield', label: 'Member' };
      case 'orange': return { color: '#FF9800', icon: 'flash', label: 'Member' };
      default: return { color: COLORS.primary, icon: 'user', label: 'Member' };
    }
  }

  // Reward Badges
  if (type === 'reward') {
    switch (level) {
      case 'lottery': return { color: '#9C27B0', icon: 'ticket', label: 'Lottery' };
      case 'top_search': return { color: '#2196F3', icon: 'search', label: 'Top Search' };
      case 'diligent': return { color: '#2196F3', icon: 'star', label: 'Diligent' };
      default: return { color: COLORS.primary, icon: 'gift', label: 'Reward' };
    }
  }

  // Visibility Plans
  switch (level) {
    case 'rise_to_top': return { color: '#FF5722', icon: 'rocket', label: 'Rise Up' };
    case 'top_spot': return { color: '#E91E63', icon: 'trophy', label: 'Top Spot' };
    // case 'show_casing': return { color: '#673AB7', icon: 'diamond', label: 'Showcase' };
    case 'targeted': return { color: '#00BCD4', icon: 'navigate', label: 'Targeted' };
    case 'fast_ad': return { color: '#FFC107', icon: 'flash', label: 'Fast' }; // Using flash for fast ad too
    case 'urgent': return { color: '#FF4500', icon: 'alert-circle', label: 'Urgent' };
    case 'featured': return { color: '#9370DB', icon: 'star', label: 'Featured' };
    default: return null;
  }
};

// ── Skeleton loader ───────────────────────────────────────────────────────────
const SkeletonCard = () => {
  const anim = React.useRef(new Animated.Value(0.4)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 750, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={skStyles.card}>
      <Animated.View style={[skStyles.thumb, { opacity: anim }]} />
      <View style={skStyles.lines}>
        <Animated.View style={[skStyles.line, skStyles.lineLong, { opacity: anim }]} />
        <Animated.View style={[skStyles.line, skStyles.lineShort, { opacity: anim }]} />
        <Animated.View style={[skStyles.line, skStyles.lineMid, { opacity: anim }]} />
      </View>
    </View>
  );
};
const skStyles = StyleSheet.create({
  card: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f0f0f0' },
  thumb: { width: 68, height: 68, borderRadius: 10, backgroundColor: '#e8e8e8', flexShrink: 0 },
  lines: { flex: 1, justifyContent: 'center', gap: 8 },
  line: { height: 12, borderRadius: 6, backgroundColor: '#e8e8e8' },
  lineLong: { width: '85%' },
  lineShort: { width: '40%' },
  lineMid: { width: '60%' },
});

const SearchScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Search and filter state
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState('map');
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Trending section & Social Clubs states
  const [trendingGalleries, setTrendingGalleries] = useState([]);
  const [trendingFeed, setTrendingFeed] = useState([]);
  const [activePopularTab, setActivePopularTab] = useState('all');
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [homeEvents, setHomeEvents] = useState([]);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    category_id: [],
    subcategory_id: [],
    condition_id: [],
    gender_id: [],
    age_id: [],
    size_id: [],
    color_id: [],
    quality: [],
    min_price: null,
    max_price: null,
    radius: 50, // km
    sort: 'views',
    order: 'DESC',
    measurementUnit: 'km' // Default measurement unit
  });

  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    activities: [],
    conditions: [],
    genders: [],
    ages: [],
    sizes: [],
    colors: []
  });

  // Location state
  const [location, setLocation] = useState(null);
  const defaultLocation = { latitude: 51.875462, longitude: -0.372755 };
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
  const UNLIMITED_RADIUS = 100000;
  const [sliderValue, setSliderValue] = useState(2); // Default 2km radius
  const sliderTrackRef = useRef(null);
  const sliderLayout = useRef({ x: 0, width: 0 });
  const [selectedLocation, setSelectedLocation] = useState(1);

  // Listing Type filter: 'all' | 'garage_sales' | 'showcasing' | 'quickfinds'
  const [listingTypeFilter, setListingTypeFilter] = useState('all');
  const [listingTypePickerVisible, setListingTypePickerVisible] = useState(false);
  const [quickFinds, setQuickFinds] = useState([]);

  const LISTING_TYPE_OPTIONS = [
    { key: 'all', label: 'All on sale listings' },
    { key: 'garage_sales', label: 'Garage-Sales' },
    { key: 'showcasing', label: 'ShowCasing' },
    { key: 'quickfinds', label: 'QuickFinds' },
  ];

  // Modal states
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [conditionModalVisible, setConditionModalVisible] = useState(false);
  const [distanceModalVisible, setDistanceModalVisible] = useState(false);
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [ageModalVisible, setAgeModalVisible] = useState(false);
  const [sizeModalVisible, setSizeModalVisible] = useState(false);
  const [colorModalVisible, setColorModalVisible] = useState(false);
  const [qualityModalVisible, setQualityModalVisible] = useState(false);
  const [measurementModalVisible, setMeasurementModalVisible] = useState(false);

  const [combinedFiltersModalVisible, setCombinedFiltersModalVisible] = useState(false);
  const [disclaimerModalVisible, setDisclaimerModalVisible] = useState(false);
  const [searchInstructionsModalVisible, setSearchInstructionsModalVisible] = useState(false);

  // User locations state
  const [userLocations, setUserLocations] = useState([]);

  // Quick Onboarding prompt state
  const [activeOnboardingPrompt, setActiveOnboardingPrompt] = useState(null);

  // No-payment popup
  const [noPaymentPopup, setNoPaymentPopup] = useState(false);
  const [addCardSheet, setAddCardSheet] = useState(false);

  // Listing mode selector
  const [listingMode, setListingMode] = useState('buy');
  const [modeSelectorVisible, setModeSelectorVisible] = useState(false);

  const LISTING_MODES = [
    { key: 'buy', icon: 'cart-outline', label: 'Sell', color: '#1a73e8' },
    { key: 'services', icon: 'construct-outline', label: 'Sell Services', color: '#0f9d58' },
    // { key: 'rental',   icon: 'home-outline',      label: 'Rent',     color: '#f4511e' },
    // { key: 'give',     icon: 'gift-outline',      label: 'Give',     color: '#ab47bc' },
  ];
  const noPaymentCheckedRef = useRef(false);
  const conditionFromChipRef = useRef(false);
  const qualityFromChipRef = useRef(false);

  // Smart search suggestions
  const [searchFocused, setSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const suggestDebounceRef = useRef(null);
  const searchFocusAnim = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef(null);

  // Trigger search focus animation
  useEffect(() => {
    Animated.timing(searchFocusAnim, {
      toValue: searchFocused ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [searchFocused]);

  const deleteRecentSearch = async (termToDelete) => {
    try {
      const updated = recentSearches.filter(s => s !== termToDelete);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (_) { }
  };

  // Map interaction state
  const [clickedLocation, setClickedLocation] = useState(null);
  const [clickedLocationRadius, setClickedLocationRadius] = useState(10); // km
  const [selectedMarker, setSelectedMarker] = useState(null); // Track selected marker for callout
  const [favorites, setFavorites] = useState(new Set()); // Track favorited advertisements

  // Load advertisements on mount and when filters change
  useEffect(() => {
    fetchAdvertisements();
  }, [filters, listingTypeFilter, listingMode]);


  // Quick Onboarding: show first pending prompt after a short delay
  useEffect(() => {
    const timer = setTimeout(async () => {
      for (const key of PROMPTS_ORDER) {
        const value = await AsyncStorage.getItem(ONBOARDING_PROMPT_KEYS[key]);
        if (!value) {
          setActiveOnboardingPrompt(key);
          break;
        }
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleOnboardingPromptDismiss = useCallback(async () => {
    if (!activeOnboardingPrompt) return;
    await AsyncStorage.setItem(ONBOARDING_PROMPT_KEYS[activeOnboardingPrompt], 'dismissed');
    setActiveOnboardingPrompt(null);
  }, [activeOnboardingPrompt]);

  const handleOnboardingPromptCTA = useCallback(async () => {
    if (!activeOnboardingPrompt) return;
    await AsyncStorage.setItem(ONBOARDING_PROMPT_KEYS[activeOnboardingPrompt], 'completed');
    setActiveOnboardingPrompt(null);
    if (activeOnboardingPrompt === 'location') navigation.navigate('SetLocationMap');
    else if (activeOnboardingPrompt === 'profile') navigation.navigate('PersonalInformation');
    else if (activeOnboardingPrompt === 'payment') navigation.navigate('ExtensionShop');
  }, [activeOnboardingPrompt, navigation]);

  // Get user location and locations
  useEffect(() => {
    console.log('🗺️ SearchScreen mounted');
    console.log('🔑 PROVIDER_GOOGLE value:', PROVIDER_GOOGLE);
    console.log('📦 MapView available:', MapView !== null);
    console.log('📍 Initial region:', region);
    getLocationAsync();
    fetchUserLocations();
    fetchFilterOptions();
    fetchHomeEvents();
    loadRecentSearches();
  }, []);

  // Load recent searches from storage
  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch (_) { }
  };

  // Debounced suggestion fetch — only triggers after 3 characters
  useEffect(() => {
    if (!searchFocused || searchText.trim().length < 3) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }
    setSuggestionsLoading(true);
    if (suggestDebounceRef.current) clearTimeout(suggestDebounceRef.current);
    suggestDebounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get('/advertisements/search-suggestions', { params: { q: searchText.trim() } });
        if (res.data?.success) {
          setSuggestions(res.data.data.suggestions || []);
        } else {
          setSuggestions([]);
        }
      } catch (_) {
        setSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 300);
    return () => { if (suggestDebounceRef.current) clearTimeout(suggestDebounceRef.current); };
  }, [searchText, searchFocused]);

  const saveSearch = async (text) => {
    if (!text.trim()) return;
    try {
      const updated = [text, ...recentSearches.filter(s => s !== text)].slice(0, MAX_RECENTS);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (_) { }
  };

  const clearRecentSearches = async () => {
    setRecentSearches([]);
    try { await AsyncStorage.removeItem(RECENT_SEARCHES_KEY); } catch (_) { }
  };

  const applySuggestion = (text, categoryId = null) => {
    setSearchText(text);
    setSearchFocused(false);
    setSuggestions([]);
    saveSearch(text);
    if (categoryId) {
      // Category tap: set filter and let the filters useEffect re-fetch
      setFilters(prev => ({ ...prev, category_id: [String(categoryId)] }));
    } else {
      setPage(1);
      fetchAdvertisements(false, text);
    }
  };

  const fetchTrendingData = async () => {
    try {
      setTrendingLoading(true);
      const galleriesRes = await api.get('/trending/galleries');
      if (galleriesRes.data?.success) {
        setTrendingGalleries(galleriesRes.data.data.galleries || []);
      } else {
        setTrendingGalleries(MOCK_GALLERIES);
      }

      const fetchType = activePopularTab === 'all' ? 'general' : activePopularTab;
      const feedRes = await api.get(`/trending/feed?type=${fetchType}&limit=6`);
      if (feedRes.data?.success) {
        setTrendingFeed(feedRes.data.data.items || []);
      } else {
        setTrendingFeed(MOCK_FEED[fetchType] || MOCK_FEED.general);
      }
    } catch (e) {
      console.error('Error fetching trending data:', e);
      setTrendingGalleries(MOCK_GALLERIES);
      const fetchType = activePopularTab === 'all' ? 'general' : activePopularTab;
      setTrendingFeed(MOCK_FEED[fetchType] || MOCK_FEED.general);
    } finally {
      setTrendingLoading(false);
    }
  };

  const fetchHomeEvents = async () => {
    try {
      const res = await api.get('/events?status=upcoming');
      if (res.data?.success && res.data?.data?.events) {
        setHomeEvents(res.data.data.events.slice(0, 3));
      } else {
        setHomeEvents(MOCK_EVENTS);
      }
    } catch (e) {
      console.error('Error fetching home events:', e);
      setHomeEvents(MOCK_EVENTS);
    }
  };

  useEffect(() => {
    fetchTrendingData();
  }, [activePopularTab]);

  const fetchFilterOptions = async () => {
    try {
      const response = await advertisementService.getFilters();
      if (response.success) {
        setFilterOptions(response.data);
      }
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  // Reload user locations when screen comes into focus (after changing location)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 SearchScreen focused - reloading user locations');

      // Safety guard: if user is an unverified business, reset to verification screen
      if (user) {
        const isBusiness = user.user_type === 'business' ||
          (user.subscription_plan_slug &&
            (user.subscription_plan_slug.toLowerCase().includes('business') ||
              user.subscription_plan_slug.toLowerCase().includes('pro')));
        const isVerified = user.kyc_status === 'verified' || user.kyc_status === 'approved' || user.kyc_completed === 1;

        if (isBusiness && !isVerified) {
          console.log('🔒 SearchScreen: Redirecting unverified business user to BusinessVerification');
          navigation.reset({
            index: 0,
            routes: [{ name: 'BusinessVerification' }],
          });
          return;
        }
      }

      fetchUserLocations();
      // Ensure listingMode has a default value (fallback to buy)
      setListingMode(current => {
        if (current === null) return 'buy';
        return current;
      });

      // Check payment method once per session (only for logged-in users)
      if (user && !noPaymentCheckedRef.current) {
        noPaymentCheckedRef.current = true;
        setTimeout(async () => {
          try {
            const cards = await stripeService.getSavedPaymentMethods();
            if (!cards || cards.length === 0) {
              setNoPaymentPopup(true);
            }
          } catch {
            // silently ignore — don't block the user
          }
        }, 3500);
      }

      return () => {
        console.log('🔄 SearchScreen blurred - resetting search focus');
        setSearchFocused(false);
        setSuggestions([]);
        searchInputRef.current?.blur();
      };
    }, [user])
  );

  // Update radius when slider changes
  useEffect(() => {
    setFilters({ ...filters, radius: sliderValue });
  }, [sliderValue]);

  // Dynamic zoom when radius changes
  useEffect(() => {
    if (mapRef.current && sliderValue) {
      if (sliderValue >= UNLIMITED_RADIUS) {
        // Zoom out for unlimited
        const centerLocation = getSelectedUserLocation();
        mapRef.current.animateToRegion({
          latitude: centerLocation.latitude,
          longitude: centerLocation.longitude,
          latitudeDelta: 5.0, // Large delta for unlimited view
          longitudeDelta: 5.0,
        }, 300);
      } else {
        const radiusInKm = sliderValue;
        const radiusInDegrees = radiusInKm / 111; // Approximate conversion
        const newDelta = radiusInDegrees * 2.5; // Add padding around circle

        const centerLocation = getSelectedUserLocation();

        mapRef.current.animateToRegion({
          latitude: centerLocation.latitude,
          longitude: centerLocation.longitude,
          latitudeDelta: newDelta,
          longitudeDelta: newDelta,
        }, 300); // 300ms animation
      }
    }
  }, [sliderValue, selectedLocation]); // Added selectedLocation dependency

  const fetchAdvertisements = async (loadMore = false, searchTextOverride = null) => {
    const currentSearch = searchTextOverride !== null ? searchTextOverride : searchText;
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
      const badgeLevelMap = { showcasing: 'show_casing', garage_sales: 'garage_sales' };
      const isQuickFinds = listingTypeFilter === 'quickfinds';
      const badgeLevelValue = badgeLevelMap[listingTypeFilter] || null;

      // Map listing mode → activity_id using already-loaded filterOptions
      const MODE_TO_ACTIVITY = { buy: 'Sell', services: 'Services', rental: 'Rent', give: 'Give' };
      const modeActivityName = listingMode ? MODE_TO_ACTIVITY[listingMode] : null;
      const modeActivityId = modeActivityName
        ? filterOptions.activities?.find(a => a.name?.toLowerCase() === modeActivityName.toLowerCase())?.id
        : null;

      if (isQuickFinds && !loadMore) {
        try {
          const qfResp = await advertisementService.getQuickFinds({
            latitude: searchLatitude,
            longitude: searchLongitude,
            radius: filters.radius < 100000 ? filters.radius : 200,
          });
          setQuickFinds(qfResp?.success ? (qfResp.data.quickfinds || []) : []);
        } catch { setQuickFinds([]); }
        setLoading(false);
        setRefreshing(false);
        return;
      } else if (!isQuickFinds) {
        setQuickFinds([]);
      }

      const searchFilters = {
        search: currentSearch || filters.search,
        category_id: filters.category_id?.length ? filters.category_id.join(',') : null,
        subcategory_id: filters.subcategory_id?.length ? filters.subcategory_id.join(',') : null,
        condition_id: filters.condition_id?.length ? filters.condition_id.join(',') : null,
        quality: filters.quality?.length ? filters.quality.join(',') : null,
        min_price: filters.min_price,
        max_price: filters.max_price,
        latitude: searchLatitude,
        longitude: searchLongitude,
        radius: filters.radius,
        sort: filters.sort,
        order: filters.order,
        page: currentPage,
        limit: 20,
        ...(badgeLevelValue ? { badge_level_filter: badgeLevelValue } : {}),
        ...(modeActivityId ? { activity_id: modeActivityId } : {}),
      };

      const response = await advertisementService.browseAdvertisements(searchFilters);

      if (response.success) {
        const newAds = response.data.advertisements;

        // DEBUG: Log received data structure
        console.log('\n🔍 FRONTEND DEBUG: Received data from API');
        console.log(`📊 Total items: ${newAds.length}`);

        // Count item types
        const typeCounts = {};
        newAds.forEach(item => {
          const type = item.type || 'product';
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        console.log('📋 Item types breakdown:');
        Object.entries(typeCounts).forEach(([type, count]) => {
          console.log(`   - ${type}: ${count}`);
        });

        // Show first 15 items
        console.log('\n🏷️  First 15 items:');
        newAds.slice(0, 15).forEach((item, idx) => {
          if (item.type === 'section_header') {
            console.log(`   ${idx + 1}. SECTION HEADER: "${item.title}"`);
          } else if (item.type === 'horizontal_line') {
            console.log(`   ${idx + 1}. ─────────────────`);
          } else if (item.type === 'showcase') {
            console.log(`   ${idx + 1}. SHOWCASE (${item.products?.length || 0} products)`);
          } else if (item.type === 'homemarket_group') {
            console.log(`   ${idx + 1}. HOMEMARKET GROUP (${item.users?.length || 0} users)`);
          } else if (item.type === 'banner') {
            console.log(`   ${idx + 1}. BANNER (${item.size})`);
          } else if (item.type === 'standard') {
            console.log(`   ${idx + 1}. STANDARD BATCH (${item.products?.length || 0} products)`);
          } else if (item.type === 'promotions') {
            console.log(`   ${idx + 1}. PROMOTIONS BATCH (${item.products?.length || 0} products)`);
          } else {
            console.log(`   ${idx + 1}. PRODUCT: ${item.title?.substring(0, 30)} (ID: ${item.id})`);
          }
        });
        console.log('');

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
      if (err.require_login) {
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
    saveSearch(searchText);
    setSearchFocused(false);
    setSuggestions([]);
    setPage(1);
    fetchAdvertisements(false);
  };

  const fetchUserLocations = async () => {
    try {
      const response = await advertisementService.getUserLocations();
      if (response.success) {
        const locations = response.data.locations;
        setUserLocations(locations);

        // If user has no locations, redirect to default location setup
        if (locations.length === 0) {
          console.log('⚠️ No user locations found - redirecting to setup');
          Alert.alert(
            t('Set Your Location'),
            t('Please set your default location to start browsing advertisements.'),
            [
              {
                text: t('Set Location'),
                onPress: () => navigation.navigate('DefaultLocation')
              }
            ],
            { cancelable: false }
          );
          return;
        }

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

  // Get the currently selected user location (1, 2, or 3)
  const getSelectedUserLocation = () => {
    const index = selectedLocation - 1; // Convert 1,2,3 to 0,1,2
    if (userLocations.length > index) {
      const selectedLoc = userLocations[index];
      return {
        latitude: parseFloat(selectedLoc.latitude),
        longitude: parseFloat(selectedLoc.longitude),
      };
    }
    // Fallback to first location or current location
    return getFirstUserLocation() || location || defaultLocation;
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
  const handleCategorySelect = (categoryArray) => {
    setFilters({ ...filters, category_id: categoryArray });
  };


  const handleConditionSelect = (conditionArray) => {
    setFilters({ ...filters, condition_id: conditionArray });
  };

  const handleQualitySelect = (qualityArray) => {
    setFilters({ ...filters, quality: qualityArray });
  };

  const handleGenderSelect = (genderArray) => {
    setFilters({ ...filters, gender_id: genderArray });
  };

  const handleAgeSelect = (ageArray) => {
    setFilters({ ...filters, age_id: ageArray });
  };

  const handleSizeSelect = (sizeArray) => {
    setFilters({ ...filters, size_id: sizeArray });
  };

  const handleColorSelect = (colorArray) => {
    setFilters({ ...filters, color_id: colorArray });
  };

  const handleMeasurementSelect = (measurementArray) => { // Treating measurement unit as multi-select for consistency or single string
    // To match structure, assume taking first selected or keeping array
    setFilters({ ...filters, measurementUnit: measurementArray.length > 0 ? measurementArray[0] : 'km' });
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
    if (ad.activity_id === 4 || Number(ad.activity_id) === 4) {
      navigation.navigate('ServiceDetails', { advertisementId: ad.id, advertisement: ad });
    } else {
      navigation.navigate('ProductDetails', { advertisementId: ad.id, advertisement: ad });
    }
  };

  // Slider handler
  const updateSliderValue = (pageX) => {
    const { x, width } = sliderLayout.current;
    if (width === 0) return;

    const relativeX = pageX - x;
    const percentage = Math.max(0, Math.min(100, (relativeX / width) * 100));
    const actualValue = (percentage / 100) * SLIDER_MAX;
    const roundedValue = parseFloat(actualValue.toFixed(SLIDER_DECIMAL_PRECISION));

    // If slider is at max or very close to it, treat as unlimited
    if (roundedValue >= SLIDER_MAX) {
      setSliderValue(UNLIMITED_RADIUS);
    } else {
      setSliderValue(roundedValue);
    }
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

  const SERVICE_CATEGORY_IMAGES = {
    'house-cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
    'car-washing': 'https://images.unsplash.com/photo-1520340356584-f9917d1ecc6f?auto=format&fit=crop&w=400&q=80',
    'roof-fixing': 'https://images.unsplash.com/photo-1632759162444-183000b12e3e?auto=format&fit=crop&w=400&q=80',
    'lawn-garden-care': 'https://images.unsplash.com/photo-1558905619-8714c64af463?auto=format&fit=crop&w=400&q=80',
    'plumbing-repairs': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=400&q=80',
    'electrical-services': 'https://images.unsplash.com/photo-1621905252507-b354bc25edac?auto=format&fit=crop&w=400&q=80',
    'painting-decorating': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=400&q=80',
    'handyman-services': 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=400&q=80'
  };

  const renderServicesCategoryGrid = () => {
    const servicesCategory = filterOptions.categories?.find(cat => cat.id === 6 || cat.name?.toLowerCase() === 'services');
    const serviceSubcategories = servicesCategory?.subcategories || [];

    if (serviceSubcategories.length === 0) {
      return (
        <View style={styles.servicesGridEmpty}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.servicesGridEmptyText}>Loading service categories...</Text>
        </View>
      );
    }

    const CATEGORY_MAP = {
      'house-cleaning': { image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=300&auto=format&fit=crop' },
      'car-washing': { image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=300&auto=format&fit=crop' },
      'roof-fixing': { image: 'https://images.unsplash.com/photo-1632759190567-3c66d482597e?q=80&w=300&auto=format&fit=crop' },
      'lawn-garden-care': { image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=300&auto=format&fit=crop' },
      'plumbing-repairs': { image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=300&auto=format&fit=crop' },
      'electrical-services': { image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=300&auto=format&fit=crop' },
      'painting-decorating': { image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=300&auto=format&fit=crop' },
      'handyman-services': { image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=300&auto=format&fit=crop' },
    };

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.servicesGridScroll}
      >
        <View style={styles.servicesGrid}>
          {serviceSubcategories.map((subcat) => {
            const styleInfo = CATEGORY_MAP[subcat.slug] || { image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=300&auto=format&fit=crop' };
            return (
              <TouchableOpacity
                key={subcat.id}
                style={styles.serviceGridCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('ServiceList', { categoryId: subcat.id, categoryName: subcat.name })}
              >
                <Image
                  source={{ uri: styleInfo.image }}
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="cover"
                />
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0, 0, 0, 0.45)' }]} />
                <View style={styles.serviceGridCardOverlay}>
                  <Text style={styles.serviceGridCardOverlayTitle} numberOfLines={2}>
                    {subcat.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  const renderListItem = ({ item, index }) => {
    // DEBUG: Log rendering (only first 20 items to avoid spam)
    console.log(`🎨 Rendering [${index}]: ${item.type}`);
    if (index < 40) {
      const itemType = item.type || 'product';
      if (itemType === 'section_header') {
        console.log(`🎨 Rendering [${index}]: SECTION "${item.title}"`);
      } else if (itemType === 'horizontal_line') {
        console.log(`🎨 Rendering [${index}]: ─────────`);
      } else if (itemType === 'showcase' || itemType === 'homemarket_group' || itemType === 'banner') {
        console.log(`🎨 Rendering [${index}]: ${itemType.toUpperCase()}`);
      } else {
        console.log(`🎨 Rendering [${index}]: ${itemType.toUpperCase()}`);
      }
    }

    // Handle horizontal lines
    if (item.type === 'horizontal_line') {
      return null;
    }

    // Handle placeholders (empty space to complete rows)
    if (item.type === 'placeholder') {
      return <View style={{ flex: 1, margin: 8 }} />;
    }

    // Handle section headers
    if (item.type === 'section_header') {
      return null;
    }

    // Check if this is a promotions grid
    if (item.type === 'promotions') {
      return (
        <View style={{ width: Dimensions.get('window').width, marginLeft: -20 }}>
          <PromotionsGrid
            promotions={item.products}
            onProductPress={(product) => {
              navigation.navigate('ProductDetails', {
                advertisementId: product.id,
              });
            }}
          />
        </View>
      );
    }

    // Check if this is a showcase
    if (item.type === 'showcase') {
      return (
        <View style={{ width: Dimensions.get('window').width, marginLeft: -20 }}>
          <ShowcaseCarousel
            showcase={item}
            onProductPress={(product, productIndex, showcaseGroupId) => {
              navigation.navigate('ProductDetails', {
                advertisementId: product.id,
                showcaseGroupId: showcaseGroupId,
                showcaseIndex: productIndex
              });
            }}
          />
        </View>
      );
    }

    // Check if this is a homemarket
    if (item.type === 'homemarket') {
      return (
        <View style={{ width: Dimensions.get('window').width, marginLeft: -20 }}>
          <HomeMarketCarousel
            homemarket={item}
            onProductPress={(product, index, tier) => {
              navigation.navigate('ProductDetails', {
                advertisementId: product.id,
                homeMarketTier: tier,
                homeMarketIndex: index
              });
            }}
          />
        </View>
      );
    }

    // Check if this is a homemarket group
    if (item.type === 'homemarket_group') {
      return (
        <View style={{ width: Dimensions.get('window').width, marginLeft: -20 }}>
          <HomeMarketCarousel
            homemarketGroup={item}
            onProductPress={(product, userIndex, productIndex, tier) => {
              navigation.navigate('ProductDetails', {
                advertisementId: product.id,
                productDetails: product,
                homeMarketTier: tier,
                homeMarketUserIndex: userIndex,
                homeMarketIndex: productIndex
              });
            }}
          />
        </View>
      );
    }

    // Check if this is a standard products batch
    if (item.type === 'standard') {
      return (
        <View style={{ width: Dimensions.get('window').width, marginLeft: -20 }}>
          <StandardProductCard
            products={item.products}
            onProductPress={(product) => {
              navigation.navigate('ProductDetails', {
                advertisementId: product.id,
              });
            }}
          />
        </View>
      );
    }

    // QuickFind "wanted" request card
    if (item.type === 'quickfind_request') {
      const daysLeft = Math.max(0, Math.round((new Date(item.expires_at) - Date.now()) / 86400000));
      return (
        <View style={styles.qfCard}>
          <View style={styles.qfCardHeader}>
            <View style={styles.qfWantedBadge}>
              <Ionicons name="flash" size={11} color="#fff" />
              <Text style={styles.qfWantedText}>WANTED</Text>
            </View>
            <Text style={styles.qfDaysLeft}>{daysLeft}d left</Text>
          </View>
          <Text style={styles.qfCategory}>{item.category}</Text>
          {item.keywords ? <Text style={styles.qfKeywords}>"{item.keywords}"</Text> : null}
          <View style={styles.qfMeta}>
            {item.condition_type ? <Text style={styles.qfMetaText}>Condition: {item.condition_type.replace(/_/g, ' ')}</Text> : null}
            <Text style={styles.qfMetaText}>Within {item.distance_km} km · {item.buyer_name}</Text>
          </View>
        </View>
      );
    }

    // Fallback for individual products (should not happen with batching, but kept for safety)
    if (!item.type || item.type === 'product') {
      console.warn('⚠️ Individual product detected (should be in batch):', item.id, item.title);
      return null; // Skip individual products since they should be in batches
    }

    // Unknown type
    console.warn('⚠️ Unknown item type:', item.type);
    return null;
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchSection}>
        <View style={styles.searchBarWrapper}>
          <Animated.View style={[
            styles.searchBar,
            searchFocused && styles.searchBarFocused,
            {
              marginRight: searchFocusAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 75]
              })
            }
          ]}>
            <Ionicons
              name={searchFocused ? 'search' : 'search-outline'}
              size={19}
              color={searchFocused ? COLORS.primary : '#9a9a9a'}
              style={styles.searchIcon}
            />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder={listingMode === 'services' ? "Search Service Around You" : "Search products, brands or categories"}
              placeholderTextColor="#b8b8b8"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              onFocus={() => setSearchFocused(true)}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => { setSearchText(''); setSuggestions([]); }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.searchClearBtn}
              >
                <Ionicons name="close-circle" size={18} color="#c0c0c0" />
              </TouchableOpacity>
            )}
          </Animated.View>
          <Animated.View
            style={[
              styles.cancelButton,
              {
                opacity: searchFocusAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1]
                }),
                transform: [{
                  translateX: searchFocusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }]
              }
            ]}
            pointerEvents={searchFocused ? 'auto' : 'none'}
          >
            <TouchableOpacity
              onPress={() => { setSearchFocused(false); setSearchText(''); setSuggestions([]); }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Filter Row — hidden while search is focused */}
        {!searchFocused && (
          listingMode === 'services' ? (
            <View style={[styles.filterRow, { paddingHorizontal: 16, marginVertical: 8 }]}>
              {(() => {
                const mode = LISTING_MODES.find(m => m.key === listingMode);
                return (
                  <TouchableOpacity
                    style={[styles.filterButton, styles.modeChip, { borderColor: mode.color, backgroundColor: mode.color + '10' }]}
                    onPress={() => setListingMode(listingMode === 'buy' ? 'services' : 'buy')}
                  >
                    <Ionicons name={mode.icon} size={15} color={mode.color} />
                    <Text style={[styles.filterButtonText, { color: mode.color, fontWeight: '700' }]}>{mode.label}</Text>
                  </TouchableOpacity>
                );
              })()}
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {/* Mode chip — always first, tapping reopens mode selector */}
              {listingMode && (() => {
                const mode = LISTING_MODES.find(m => m.key === listingMode);
                return (
                  <TouchableOpacity
                    style={[styles.filterButton, styles.modeChip, { borderColor: mode.color }]}
                    onPress={() => setListingMode(listingMode === 'buy' ? 'services' : 'buy')}
                  >
                    <Ionicons name={mode.icon} size={15} color={mode.color} />
                    <Text style={[styles.filterButtonText, { color: mode.color, fontWeight: '700' }]}>{mode.label}</Text>
                  </TouchableOpacity>
                );
              })()}

              <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
                <Ionicons name="options-outline" size={18} color="#1a1a1a" />
                <Text style={styles.filterButtonText}>{t('Filter')}</Text>
                {listingTypeFilter !== 'all' && <View style={styles.filterBadge} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterButton, listingTypeFilter !== 'all' && styles.filterButtonActive]}
                onPress={() => setListingTypePickerVisible(true)}
              >
                <Text style={[styles.filterButtonText, listingTypeFilter !== 'all' && styles.filterButtonTextActive]}>
                  {LISTING_TYPE_OPTIONS.find(o => o.key === listingTypeFilter)?.label || 'Listing Type'}
                </Text>
                {listingTypeFilter !== 'all' && <View style={[styles.filterBadge, { backgroundColor: '#fff' }]} />}
              </TouchableOpacity>

              <TouchableOpacity style={styles.filterButton} onPress={handleDistancePress}>
                <Text style={styles.filterButtonText}>
                  Distance{filters.radius >= UNLIMITED_RADIUS ? ' (Unlimited)' : (filters.radius && filters.radius !== 50 ? ` (${filters.radius}km)` : '')}
                </Text>
                {filters.radius && filters.radius !== 50 && <View style={styles.filterBadge} />}
              </TouchableOpacity>

              <TouchableOpacity style={styles.filterButton} onPress={handleCategoryPress}>
                <Text style={styles.filterButtonText}>
                  Category{filters.category_id?.length > 0 ? ` (${filters.category_id.length})` : ''}
                </Text>
                {filters.category_id?.length > 0 && <View style={styles.filterBadge} />}
              </TouchableOpacity>

              <TouchableOpacity style={styles.filterButton} onPress={handlePricePress}>
                <Text style={styles.filterButtonText}>
                  Price{(filters.min_price || filters.max_price) ?
                    ` (₹${filters.min_price || '0'} - ${filters.max_price || '∞'})` : ''}
                </Text>
                {(filters.min_price || filters.max_price) && <View style={styles.filterBadge} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => { conditionFromChipRef.current = true; setConditionModalVisible(true); }}
              >
                <Text style={styles.filterButtonText}>
                  Condition{filters.condition_id?.length ? ` (${filters.condition_id.length})` : ''}
                </Text>
                {filters.condition_id?.length > 0 && <View style={styles.filterBadge} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => { qualityFromChipRef.current = true; setQualityModalVisible(true); }}
              >
                <Text style={styles.filterButtonText}>
                  Quality{filters.quality?.length ? ` (${filters.quality.length})` : ''}
                </Text>
                {filters.quality?.length > 0 && <View style={styles.filterBadge} />}
              </TouchableOpacity>
            </ScrollView>
          )
        )}

        {/* Search Results Count, Instructions, and Sort — hidden while suggestions visible */}
        {!searchFocused && listingMode !== 'services' && <View style={styles.resultRow}>
          <Text style={styles.resultCount}>
            {loading ? 'Loading...' : `${advertisements.length} results`}
          </Text>
          <Hyperlink
            linkKey="search_instructions"
            containerStyle={[styles.instructionsButton, { flexDirection: 'row', alignItems: 'center' }]}
            style={styles.instructionsText}
            onPress={() => setSearchInstructionsModalVisible(true)}
          >
            {t('Instructions')}
          </Hyperlink>
          <SortDropdown
            selectedSort={{ sort: filters.sort, order: filters.order }}
            onSortChange={(sortOptions) => {
              setFilters({ ...filters, ...sortOptions });
            }}
          />
        </View>}
      </View>

      {/* Smart search suggestions — shown while search bar is focused */}
      {searchFocused && (
        <ScrollView
          style={styles.suggestionsContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {/* 1-2 chars: prompt */}
          {searchText.trim().length > 0 && searchText.trim().length < 3 && (
            <View style={styles.suggestHint}>
              <Ionicons name="search-outline" size={28} color="#e0e0e0" />
              <Text style={styles.suggestHintText}>Keep typing — results show after 3 characters</Text>
            </View>
          )}

          {/* Recent searches header (only when empty) */}
          {searchText.trim() === '' && recentSearches.length > 0 && (
            <View style={styles.suggestHeader}>
              <Text style={styles.suggestHeaderText}>Recent</Text>
              <TouchableOpacity onPress={clearRecentSearches} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.suggestClearAll}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Recent rows */}
          {searchText.trim() === '' && recentSearches.map((term, idx) => (
            <TouchableOpacity key={`r-${idx}`} activeOpacity={0.65}
              onPress={() => applySuggestion(term)}>
              <View style={styles.suggestRow}>
                <View style={styles.suggestIconBox}>
                  <Ionicons name="time-outline" size={19} color="#aaa" />
                </View>
                <View style={styles.suggestMiddle}>
                  <Text style={styles.suggestMainText} numberOfLines={1}>{term}</Text>
                </View>
                <TouchableOpacity
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  onPress={() => deleteRecentSearch(term)}
                  style={styles.suggestDeleteBtn}
                >
                  <Ionicons name="close-outline" size={17} color="#aaa" />
                </TouchableOpacity>
                <TouchableOpacity
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  onPress={() => setSearchText(term)}
                  style={styles.suggestFillBtn}
                >
                  <Ionicons name="arrow-up-back-outline" size={16} color="#bbb" style={{ transform: [{ rotate: '45deg' }] }} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

          {/* Empty + no recents */}
          {searchText.trim() === '' && recentSearches.length === 0 && (
            <View style={styles.suggestHint}>
              <Ionicons name="search-outline" size={28} color="#e0e0e0" />
              <Text style={styles.suggestHintText}>Search items, services, rentals and more</Text>
            </View>
          )}

          {/* Smart suggestions grouped categories & products */}
          {(() => {
            if (searchText.trim().length < 3) return null;
            if (suggestionsLoading) {
              return (
                <View style={styles.suggestLoaderBox}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
              );
            }

            const suggestCategories = suggestions.filter(s => s.type === 'category');
            const suggestProducts = suggestions.filter(s => s.type === 'product');

            if (suggestCategories.length === 0 && suggestProducts.length === 0) {
              return (
                <View style={styles.suggestHint}>
                  <Ionicons name="search-outline" size={28} color="#e0e0e0" />
                  <Text style={styles.suggestHintText}>No suggestions found for "{searchText}"</Text>
                </View>
              );
            }

            return (
              <>
                {suggestCategories.length > 0 && (
                  <View style={styles.suggestSection}>
                    <View style={styles.suggestSectionHeader}>
                      <Text style={styles.suggestSectionTitle}>Categories</Text>
                    </View>
                    {suggestCategories.map((s, idx) => {
                      const q = searchText.trim();
                      const lower = s.text.toLowerCase();
                      const matchStart = q ? lower.indexOf(q.toLowerCase()) : -1;
                      const matchEnd = matchStart + q.length;

                      const highlightedTitle = (
                        <Text style={styles.suggestMainText} numberOfLines={1}>
                          {matchStart >= 0 ? (
                            <>
                              <Text>{s.text.slice(0, matchStart)}</Text>
                              <Text style={styles.suggestBoldMatch}>{s.text.slice(matchStart, matchEnd)}</Text>
                              <Text>{s.text.slice(matchEnd)}</Text>
                            </>
                          ) : <Text>{s.text}</Text>}
                        </Text>
                      );

                      return (
                        <TouchableOpacity
                          key={`cat-${idx}`}
                          activeOpacity={0.65}
                          onPress={() => applySuggestion(s.text, s.category_id)}
                        >
                          <View style={styles.suggestRow}>
                            <View style={styles.suggestIconBox}>
                              <Ionicons name="pricetag-outline" size={17} color={COLORS.primary} />
                            </View>
                            <View style={styles.suggestMiddle}>
                              {highlightedTitle}
                              <Text style={styles.suggestSubCategory}>in Categories</Text>
                            </View>
                            <TouchableOpacity
                              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                              onPress={() => setSearchText(s.text)}
                              style={styles.suggestFillBtn}
                            >
                              <Ionicons name="arrow-up-back-outline" size={16} color="#bbb" style={{ transform: [{ rotate: '45deg' }] }} />
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {suggestProducts.length > 0 && (
                  <View style={styles.suggestSection}>
                    <View style={styles.suggestSectionHeader}>
                      <Text style={styles.suggestSectionTitle}>Products</Text>
                    </View>
                    {suggestProducts.map((s, idx) => {
                      const q = searchText.trim();
                      const lower = s.text.toLowerCase();
                      const matchStart = q ? lower.indexOf(q.toLowerCase()) : -1;
                      const matchEnd = matchStart + q.length;

                      const highlightedTitle = (
                        <Text style={styles.suggestMainText} numberOfLines={1}>
                          {matchStart >= 0 ? (
                            <>
                              <Text>{s.text.slice(0, matchStart)}</Text>
                              <Text style={styles.suggestBoldMatch}>{s.text.slice(matchStart, matchEnd)}</Text>
                              <Text>{s.text.slice(matchEnd)}</Text>
                            </>
                          ) : <Text>{s.text}</Text>}
                        </Text>
                      );

                      const imgUri = s.image ? getFullImageUrl(s.image) : null;
                      const currSymbol = s.currency === 'USD' ? '$' : '£';

                      return (
                        <TouchableOpacity
                          key={`prod-${idx}`}
                          activeOpacity={0.65}
                          onPress={() => { setSearchFocused(false); navigation.navigate('ProductDetails', { advertisementId: s.id }); }}
                        >
                          <View style={styles.suggestRow}>
                            <View style={styles.suggestThumbBox}>
                              {imgUri
                                ? <Image source={{ uri: imgUri }} style={styles.suggestThumbImg} resizeMode="cover" />
                                : <View style={styles.suggestThumbFallback}><Ionicons name="image-outline" size={17} color="#ccc" /></View>
                              }
                            </View>

                            <View style={styles.suggestMiddle}>
                              {highlightedTitle}
                              {s.price != null && (
                                <Text style={styles.suggestSubPrice}>{currSymbol}{parseFloat(s.price).toFixed(2)}</Text>
                              )}
                            </View>

                            <TouchableOpacity
                              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                              onPress={() => setSearchText(s.text)}
                              style={styles.suggestFillBtn}
                            >
                              <Ionicons name="arrow-up-back-outline" size={16} color="#bbb" style={{ transform: [{ rotate: '45deg' }] }} />
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </>
            );
          })()}
        </ScrollView>
      )}

      {/* Main Content — hidden while suggestions are visible */}
      {!searchFocused && <View style={{ flex: 1, paddingBottom: 0 }}>
        {listingMode === 'services' && viewMode === 'list' && (!searchText || searchText.trim() === '') ? (
          renderServicesCategoryGrid()
        ) : (
          viewMode === 'list' && (
            <>
              <FlatList
                data={listingTypeFilter === 'quickfinds' ? quickFinds.map(qf => ({ ...qf, type: 'quickfind_request' })) : advertisements}
                renderItem={renderListItem}
                ListHeaderComponent={() => {
                  if (searchText && searchText.trim() !== '') return null;
                  return null;
                }}
                keyExtractor={(item, index) => {
                  if (item.type === 'quickfind_request') return `qf-${item.id}-${index}`;
                  if (item.type === 'promotions') return `promotions-grid-${index}`;
                  if (item.type === 'showcase') return `showcase-${item.showcase_group_id}-${index}`;
                  if (item.type === 'homemarket_group') return `homemarket-group-${index}`;
                  if (item.type === 'banner') return `banner-${item.id}-${index}`;
                  if (item.type === 'section_header') return `section-${item.title}-${index}`;
                  if (item.type === 'horizontal_line') return `line-${index}`;
                  if (item.type === 'placeholder') return `placeholder-${index}`;
                  return item.id ? `${item.id}-${index}` : `item-${index}`;
                }}
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
                      <View style={styles.emptyIconCircle}>
                        <Ionicons name="search-outline" size={36} color={COLORS.primary} />
                      </View>
                      <Text style={styles.emptyText}>No results found</Text>
                      <Text style={styles.emptySubtext}>
                        {searchText.trim()
                          ? `We couldn't find anything for "${searchText.trim()}". Try a different keyword or clear your filters.`
                          : 'Try adjusting your filters or search in a wider area.'}
                      </Text>
                      {(filters.category_id?.length > 0 || filters.condition_id?.length > 0) && (
                        <TouchableOpacity
                          style={styles.emptyClearBtn}
                          onPress={() => setFilters({ ...filters, category_id: [], condition_id: [], subcategory_id: [], quality: [], gender_id: [], age_id: [], size_id: [], color_id: [], min_price: null, max_price: null })}
                        >
                          <Text style={styles.emptyClearBtnText}>Clear all filters</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )
                }
                ListFooterComponent={() => {
                  const activityIndicator = (loading && page > 1) ? (
                    <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
                  ) : null;

                  if ((searchText && searchText.trim() !== '') || listingMode === 'services') {
                    return activityIndicator;
                  }

                  return (
                    <>
                      {/* Social Clubs & Livestream Events */}
                      <View style={[styles.eventsSection, { marginHorizontal: -20 }]}>
                        <Text style={styles.eventsSectionTitle}>Social Clubs & Livestream Events</Text>
                        <Text style={styles.eventsSectionSub}>Join live stream rooms to chat and place bids on featured products</Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.eventsSlider}
                        >
                          {homeEvents.map((event) => (
                            <TouchableOpacity
                              key={event.id}
                              style={styles.eventCard}
                              onPress={() => navigation.navigate('SocialClubs')}
                              activeOpacity={0.8}
                            >
                              <Image source={{ uri: event.image_url || 'https://placehold.co/400' }} style={styles.eventImage} />
                              <View style={styles.eventOverlay}>
                                <View style={styles.eventBadgeRow}>
                                  <View style={styles.liveIndicator}>
                                    <View style={styles.liveDot} />
                                    <Text style={styles.liveText}>LIVE</Text>
                                  </View>
                                  <View style={styles.viewersBadge}>
                                    <Ionicons name="eye-outline" size={12} color="#FFF" />
                                    <Text style={styles.viewersText}>{event.viewers_count || 0}</Text>
                                  </View>
                                </View>
                                <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                                <Text style={styles.eventOrganizer} numberOfLines={1}>by {event.organizer || 'Seller'}</Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                        <TouchableOpacity
                          style={styles.viewAllClubsButton}
                          onPress={() => navigation.navigate('SocialClubs')}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.viewAllClubsText}>View All Social Clubs</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Recommendations section (Recommended) */}
                      <View style={[styles.popularContainer, { marginHorizontal: -20, marginTop: 30, borderTopWidth: 1, borderTopColor: '#eef0f2', paddingTop: 20 }]}>
                        <Text style={styles.popularHeaderTitle}>Trending</Text>
                        <Text style={styles.popularHeaderSubtitle}>Curated for you based on your interests</Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          style={styles.popularTabBar}
                          contentContainerStyle={styles.popularTabBarContent}
                        >
                          {['all', 'women', 'men', 'children'].map((tab) => (
                            <TouchableOpacity
                              key={tab}
                              style={[styles.popularTabButton, activePopularTab === tab && styles.popularActiveTabButton]}
                              onPress={() => setActivePopularTab(tab)}
                              activeOpacity={0.7}
                            >
                              <Text style={[styles.popularTabButtonText, activePopularTab === tab && styles.popularActiveTabButtonText]}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>

                        <Text style={styles.popularSubtitle}>TRENDING RIGHT NOW</Text>
                        {trendingLoading ? (
                          <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
                        ) : (
                          <View style={styles.popularFeedGrid}>
                            {trendingFeed.map((item) => {
                              const imageUrl = item.images && item.images.length > 0 ? getFullImageUrl(item.images[0]) : 'https://placehold.co/400';
                              return (
                                <TouchableOpacity
                                  key={item.id}
                                  style={styles.popularFeedCard}
                                  onPress={() => handleProductPress(item)}
                                  activeOpacity={0.8}
                                >
                                  <View style={styles.popularFeedImageContainer}>
                                    <Image source={{ uri: imageUrl }} style={styles.popularFeedImage} />
                                    {item.trending_score && (
                                      <View style={styles.popularScoreBadge}>
                                        <Text style={styles.popularScoreText}>🔥 {item.trending_score}</Text>
                                      </View>
                                    )}
                                  </View>
                                  <View style={styles.popularFeedInfo}>
                                    <Text style={styles.popularFeedTitle} numberOfLines={1}>{item.title}</Text>
                                    <Text style={styles.popularFeedPrice}>£{parseFloat(item.price).toFixed(2)}</Text>
                                  </View>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        )}

                        <Text style={styles.popularSubtitle}>TOP SELLING COLLECTIONS THIS WEEK</Text>
                        {trendingLoading ? (
                          <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
                        ) : (
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.popularCollectionsSlider}
                          >
                            {trendingGalleries.map((gallery) => (
                              <TouchableOpacity
                                key={gallery.id}
                                style={styles.popularCollectionCard}
                                onPress={() => navigation.navigate('TrendingGallery', { galleryId: gallery.id, gallery })}
                                activeOpacity={0.8}
                              >
                                <Image
                                  source={{ uri: gallery.hero_image_url || 'https://placehold.co/600x800' }}
                                  style={styles.popularCollectionImage}
                                />
                                <View style={styles.popularCollectionOverlay}>
                                  <Text style={styles.popularCollectionName} numberOfLines={1}>{gallery.name}</Text>
                                </View>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        )}

                        <View style={styles.popularViewAllContainer}>
                          <TouchableOpacity
                            style={styles.popularViewAllButton}
                            onPress={() => navigation.navigate('TrendingHub')}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.popularViewAllText}>Explore All Curated Galleries & Feeds</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {activityIndicator}
                    </>
                  );
                }}
              />
            </>
          ))}

        {/* Map View */}
        {viewMode === 'map' && (
          <View key="map-view" style={styles.mapContainer}>
            {console.log('🗺️ Rendering map view, viewMode:', viewMode)}
            {console.log('🗺️ MapView component:', MapView)}
            {console.log('🗺️ PROVIDER_GOOGLE:', PROVIDER_GOOGLE)}
            <View style={styles.fixedButtons}>
              <View style={styles.topLocations}>
                {userLocations.length > 0 ? (
                  userLocations.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.locationBadge,
                        selectedLocation === index + 1 && styles.locationBadgeSelected
                      ]}
                      onPress={() => setSelectedLocation(index + 1)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.locationNumber}>{index + 1}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
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
                )}
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
                {/* Search radius circle - follows selected location */}
                <Circle
                  center={getSelectedUserLocation()}
                  radius={sliderValue * 1000}
                  strokeWidth={0}
                  strokeColor="transparent"
                  fillColor="rgba(74, 144, 226, 0.25)"
                />

                {/* Center location marker */}
                <Marker
                  key={`center-marker-${selectedLocation}`}
                  coordinate={getSelectedUserLocation()}
                  anchor={{ x: 0.5, y: 0.5 }}
                  tracksViewChanges={false}
                >
                  <View style={styles.centerMarkerLocation} />
                </Marker>

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
                    description={`Radius: ${clickedLocationRadius} km - Tap to clear`}
                    pinColor="orange"
                    onPress={() => setClickedLocation(null)}
                  />
                )}


                {/* Advertisement markers - with offset for overlapping items */}
                {(() => {
                  // First, flatten the advertisements array to extract actual products
                  const flattenedAds = [];
                  advertisements.forEach(item => {
                    if (item.type === 'promotions' || item.type === 'standard') {
                      // Extract products from batches
                      if (item.products && Array.isArray(item.products)) {
                        flattenedAds.push(...item.products);
                      }
                    } else if (item.type === 'showcase' || item.type === 'homemarket') {
                      // Extract products from showcase/homemarket
                      if (item.products && Array.isArray(item.products)) {
                        flattenedAds.push(...item.products);
                      }
                    } else if (item.type === 'homemarket_group') {
                      // Extract products from homemarket group
                      if (item.users) {
                        item.users.forEach(u => {
                          if (u.products) {
                            flattenedAds.push(...u.products);
                          }
                        });
                      }
                    } else if (!item.type || item.type === 'product') {
                      // Individual product (shouldn't happen with batching, but handle it)
                      flattenedAds.push(item);
                    }
                    // Skip banners, section_header, horizontal_line, etc.
                  });

                  // Group ads by location to handle overlaps
                  const adsByLocation = {};
                  flattenedAds.forEach(ad => {
                    // Method to add ad to a specific location key
                    const addToLocation = (lat, lng, locationId = null) => {
                      if (lat && lng) {
                        const key = `${parseFloat(lat).toFixed(4)},${parseFloat(lng).toFixed(4)}`;
                        if (!adsByLocation[key]) adsByLocation[key] = [];
                        // Avoid duplicates if same ad is added multiple times for same location (though unlikely with this logic)
                        const isDuplicate = adsByLocation[key].some(existingAd => existingAd.id === ad.id && existingAd.locationId === locationId);
                        if (!isDuplicate) {
                          adsByLocation[key].push({ ...ad, latitude: lat, longitude: lng, locationId });
                        }
                      }
                    };

                    // If we have multiple locations and we want to show all (e.g. unlimited or just general multi-location support)
                    // We can check if we should show all. The user asked "if unlimited then show all", 
                    // but it might be better to ALWAYS show all locations for a product if they exist, 
                    // as that gives better visibility. 
                    // Let's implement showing all locations if available.
                    if (ad.locations && Array.isArray(ad.locations) && ad.locations.length > 0) {
                      ad.locations.forEach(loc => {
                        addToLocation(loc.latitude, loc.longitude, loc.id);
                      });
                    } else {
                      // Fallback to top-level lat/long
                      addToLocation(ad.latitude, ad.longitude);
                    }
                  });

                  // Flatten back to array with offsets
                  const processedMarkers = [];
                  Object.values(adsByLocation).forEach(group => {
                    if (group.length === 1) {
                      processedMarkers.push(group[0]);
                    } else {
                      // Apply circular offset for overlapping markers
                      group.forEach((ad, index) => {
                        const angle = (index / group.length) * 2 * Math.PI;
                        const radius = 0.0002; // Small radius for offset (approx 20m)

                        processedMarkers.push({
                          ...ad,
                          latitude: parseFloat(ad.latitude) + (radius * Math.cos(angle)),
                          longitude: parseFloat(ad.longitude) + (radius * Math.sin(angle)),
                          isOffset: true // Flag to indicate modified position
                        });
                      });
                    }
                  });

                  const getActivityIcon = (activityId) => {
                    switch (Number(activityId)) {
                      case 1: return 'cart';
                      case 2: return 'pricetags';
                      case 3: return 'key';
                      case 4: return 'construct';
                      case 5: return 'gift';
                      case 6: return 'people';
                      default: return 'map';
                    }
                  };

                  const getActivityColor = (activityId, hasBadge) => {
                    if (hasBadge) return '#FF0000';
                    switch (Number(activityId)) {
                      case 1: return '#001C64';
                      case 2: return '#69A7EF';
                      case 3: return '#B2B2B2';
                      case 4: return '#0f9d58';
                      case 5: return '#f4b400';
                      case 6: return '#3FAF46';
                      default: return '#0f9d58';
                    }
                  };

                  return processedMarkers.map((ad, index) => {
                    // Only show ads with location data
                    if (!ad.latitude || !ad.longitude) return null;

                    // Get activity color and label from ACTIVITY_COLORS
                    const activityData = ACTIVITY_COLORS[ad.activity_id] || ACTIVITY_COLORS[1];
                    const markerLabel = activityData.label;

                    // Check if advertisement has any visibility badges
                    const hasVisibilityBadge = ad.badges && ad.badges.some(badge => badge.type === 'visibility');

                    // If has visibility badge, show red color, otherwise use activity color
                    const markerColor = hasVisibilityBadge ? '#FF0000' : activityData.color;
                    const isSelected = selectedMarker === ad.id;

                    return (
                      <Marker
                        key={ad.locationId ? `${ad.id}-${ad.locationId}` : `${ad.id}-${index}`}
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
                        <View style={styles.markerContainer}>
                          <View style={[
                            styles.markerCircle,
                            { backgroundColor: getActivityColor(ad.activity_id, hasVisibilityBadge) },
                            isSelected && styles.selectedMarker
                          ]}>
                            <Ionicons name={getActivityIcon(ad.activity_id)} size={16} color="#ffffff" />
                          </View>
                          <View style={[
                            styles.markerArrow,
                            { borderTopColor: getActivityColor(ad.activity_id, hasVisibilityBadge) }
                          ]} />
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
                                  source={{ uri: getFullImageUrl(ad.images[0]) }}
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
                  });
                })()}

              </MapView>
            )}

            {/* Location Disclaimer */}
            {viewMode === 'map' && (
              <View style={styles.disclaimerContainer}>
                <Text style={styles.disclaimerText}>
                  Our{' '}
                  <Hyperlink
                    linkKey="search_disclaimer"
                    style={styles.disclaimerLink}
                    onPress={() => setDisclaimerModalVisible(true)}
                  >
                    {t('Locations & Safety Disclaimer')}</Hyperlink>
                </Text>
              </View>
            )}
          </View>
        )}
      </View>}

      {/* View Toggle & Distance Slider — hidden while suggestions are visible */}
      {!searchFocused && <View style={[styles.rowa, { marginBottom: viewMode === 'list' ? 65 : 5 }]}>

        <TouchableOpacity style={styles.mapViewToggle}>
          <Text style={styles.mapViewText}></Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mapViewToggle, { alignSelf: 'center' }]}
          onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
        >
          <Text style={styles.mapViewText}>
            {viewMode === 'map' ? (listingMode === 'services' ? 'Categories' : 'Products') : 'Map'}
          </Text>
        </TouchableOpacity>
      </View>}

      {/* Distance Slider (Map View only) */}
      {!searchFocused && viewMode === 'map' && (
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
                { width: `${Math.min(100, (sliderValue >= UNLIMITED_RADIUS ? 100 : (sliderValue / SLIDER_MAX) * 100))}% ` }
              ]}
            />
            <View
              style={[
                styles.sliderThumb,
                { left: `${Math.min(100, (sliderValue >= UNLIMITED_RADIUS ? 100 : (sliderValue / SLIDER_MAX) * 100))}% ` }
              ]}
            />
          </View>
          <View style={styles.rowa}>
            <Text style={[styles.sliderLabel, { alignSelf: 'flex-start' }]}>{t('Distance')}</Text>
            <Text style={[styles.sliderLabel, { alignSelf: 'flex-end' }]}>
              {sliderValue >= UNLIMITED_RADIUS ? 'Unlimited' : `${sliderValue.toFixed(SLIDER_DECIMAL_PRECISION)} km`}
            </Text>
          </View>
        </View>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('SearchScreen')}>
          <FontAwesome name="home" size={28} color={COLORS.primary} />
          <Text style={styles.navLabel}>{t('Search')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ExtensionShop')}>
          <Ionicons name="rocket-outline" size={28} color={COLORS.primary} />
          <Text style={styles.navLabel}>{t('Extensions')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={handleMakeAnAd}>
          <View style={styles.plusCircle}>
            <FontAwesome name="plus" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.navLabel}>{t('Sell')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Inbox')}>
          <Ionicons name="mail-outline" size={32} color={COLORS.primary} />
          <Text style={styles.navLabel}>{t('Inbox')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('UserAccount')}>
          <FontAwesome name="user" size={28} color={COLORS.primary} />
          <Text style={styles.navLabel}>{t('Profile')}</Text>
        </TouchableOpacity>
      </View>

      {/* Loading — skeleton rows instead of blocking overlay */}
      {loading && page === 1 && !searchFocused && (
        <View style={styles.skeletonWrapper}>
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </View>
      )}

      {/* Listing Type Picker Modal */}
      <Modal
        visible={listingTypePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setListingTypePickerVisible(false)}
      >
        <TouchableOpacity style={styles.ltPickerOverlay} activeOpacity={1} onPress={() => setListingTypePickerVisible(false)}>
          <View style={styles.ltPickerSheet}>
            <Text style={styles.ltPickerTitle}>Listing Type</Text>
            {LISTING_TYPE_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.ltPickerRow, listingTypeFilter === opt.key && styles.ltPickerRowActive]}
                onPress={() => { setListingTypeFilter(opt.key); setListingTypePickerVisible(false); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.ltPickerRowText, listingTypeFilter === opt.key && styles.ltPickerRowTextActive]}>{opt.label}</Text>
                {listingTypeFilter === opt.key && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Filter Modals */}
      <MultiSelectFilterModal
        visible={categoryModalVisible}
        onClose={() => {
          setCategoryModalVisible(false);
          setTimeout(() => setCombinedFiltersModalVisible(true), 100);
        }}
        title="Category"
        options={filterOptions.categories?.map(c => ({ id: c.id?.toString(), label: c.name })) || []}
        selectedValues={filters.category_id}
        onApply={handleCategorySelect}
      />

      <MultiSelectFilterModal
        visible={conditionModalVisible}
        onClose={() => {
          setConditionModalVisible(false);
          if (conditionFromChipRef.current) {
            conditionFromChipRef.current = false;
          } else {
            setTimeout(() => setCombinedFiltersModalVisible(true), 100);
          }
        }}
        title="Condition"
        options={filterOptions.conditions?.map(c => ({ id: c.id?.toString(), label: c.name })) || []}
        selectedValues={filters.condition_id}
        onApply={handleConditionSelect}
      />

      <DistanceFilterModal
        visible={distanceModalVisible}
        onClose={() => {
          setDistanceModalVisible(false);
          setTimeout(() => setCombinedFiltersModalVisible(true), 100);
        }}
        selectedRadius={filters.radius}
        onSelectRadius={handleDistanceSelect}
        userLocation={getSelectedUserLocation()}
      />

      <PriceRangeFilterModal
        visible={priceModalVisible}
        onClose={() => {
          setPriceModalVisible(false);
          setTimeout(() => setCombinedFiltersModalVisible(true), 100);
        }}
        minPrice={filters.min_price}
        maxPrice={filters.max_price}
        onSelectPriceRange={handlePriceRangeSelect}
      />

      <MultiSelectFilterModal
        visible={genderModalVisible}
        onClose={() => {
          setGenderModalVisible(false);
          setTimeout(() => setCombinedFiltersModalVisible(true), 100);
        }}
        title="Gender"
        options={filterOptions.genders?.map(c => ({ id: c.id?.toString(), label: c.name })) || []}
        selectedValues={filters.gender_id}
        onApply={handleGenderSelect}
      />

      <MultiSelectFilterModal
        visible={ageModalVisible}
        onClose={() => {
          setAgeModalVisible(false);
          setTimeout(() => setCombinedFiltersModalVisible(true), 100);
        }}
        title="Age"
        options={filterOptions.ages?.map(c => ({ id: c.id?.toString(), label: c.name })) || []}
        selectedValues={filters.age_id}
        onApply={handleAgeSelect}
      />

      <MultiSelectFilterModal
        visible={sizeModalVisible}
        onClose={() => {
          setSizeModalVisible(false);
          setTimeout(() => setCombinedFiltersModalVisible(true), 100);
        }}
        title="Size"
        options={filterOptions.sizes || []}
        selectedValues={filters.size_id}
        onApply={handleSizeSelect}
      />

      <MultiSelectFilterModal
        visible={colorModalVisible}
        onClose={() => {
          setColorModalVisible(false);
          setTimeout(() => setCombinedFiltersModalVisible(true), 100);
        }}
        title="Colour"
        options={filterOptions.colors?.map(c => ({ id: c.id?.toString(), label: c.name })) || []}
        selectedValues={filters.color_id}
        onApply={handleColorSelect}
      />

      <MultiSelectFilterModal
        visible={qualityModalVisible}
        onClose={() => {
          setQualityModalVisible(false);
          if (qualityFromChipRef.current) {
            qualityFromChipRef.current = false;
          } else {
            setTimeout(() => setCombinedFiltersModalVisible(true), 100);
          }
        }}
        title="Quality"
        options={[
          { id: 'high', label: 'High Quality' },
          { id: 'medium', label: 'Medium Quality' },
          { id: 'low', label: 'Low Quality' },
        ]}
        selectedValues={filters.quality}
        onApply={handleQualitySelect}
      />

      <MultiSelectFilterModal
        visible={measurementModalVisible}
        onClose={() => {
          setMeasurementModalVisible(false);
          setTimeout(() => setCombinedFiltersModalVisible(true), 100);
        }}
        title="Measurement Unit"
        options={[
          { id: 'km', label: 'km' },
          { id: 'miles', label: 'miles' }
        ]}
        selectedValues={filters.measurementUnit ? [filters.measurementUnit] : []}
        onApply={handleMeasurementSelect}
      />

      <CombinedFiltersModal
        visible={combinedFiltersModalVisible}
        onClose={() => setCombinedFiltersModalVisible(false)}
        filters={filters}
        filterOptions={filterOptions}
        onUpdateFilters={handleCombinedFiltersUpdate}
        onOpenCategoryModal={() => {
          setCombinedFiltersModalVisible(false);
          setTimeout(() => setCategoryModalVisible(true), 100);
        }}
        listingTypeFilter={listingTypeFilter}
        onOpenListingTypeModal={() => {
          setCombinedFiltersModalVisible(false);
          setTimeout(() => setListingTypePickerVisible(true), 100);
        }}
        onOpenConditionModal={() => {
          setCombinedFiltersModalVisible(false);
          setTimeout(() => setConditionModalVisible(true), 100);
        }}
        onOpenQualityModal={() => {
          setCombinedFiltersModalVisible(false);
          setTimeout(() => setQualityModalVisible(true), 100);
        }}
        onOpenDistanceModal={() => {
          setCombinedFiltersModalVisible(false);
          setTimeout(() => setDistanceModalVisible(true), 100);
        }}
        onOpenPriceModal={() => {
          setCombinedFiltersModalVisible(false);
          setTimeout(() => setPriceModalVisible(true), 100);
        }}
        onOpenGenderModal={() => {
          setCombinedFiltersModalVisible(false);
          setTimeout(() => setGenderModalVisible(true), 100);
        }}
        onOpenAgeModal={() => {
          setCombinedFiltersModalVisible(false);
          setTimeout(() => setAgeModalVisible(true), 100);
        }}
        onOpenSizeModal={() => {
          setCombinedFiltersModalVisible(false);
          setTimeout(() => setSizeModalVisible(true), 100);
        }}
        onOpenColorModal={() => {
          setCombinedFiltersModalVisible(false);
          setTimeout(() => setColorModalVisible(true), 100);
        }}
        onOpenMeasurementModal={() => {
          setCombinedFiltersModalVisible(false);
          setTimeout(() => setMeasurementModalVisible(true), 100);
        }}
      />

      <LocationDisclaimerModal
        visible={disclaimerModalVisible}
        onClose={() => setDisclaimerModalVisible(false)}
      />

      <SearchInstructionsModal
        visible={searchInstructionsModalVisible}
        onClose={() => setSearchInstructionsModalVisible(false)}
        userLocations={userLocations}
        selectedLocation={selectedLocation}
        onLocationSelect={(index) => {
          setSelectedLocation(index);
          setSearchInstructionsModalVisible(false);
        }}
      />


      {activeOnboardingPrompt && (
        <QuickOnboardingPrompt
          prompt={activeOnboardingPrompt}
          onPress={handleOnboardingPromptCTA}
          onDismiss={handleOnboardingPromptDismiss}
        />
      )}

      {/* ── No payment method popup ─────────────────────────────────────────── */}
      <Modal
        visible={noPaymentPopup}
        transparent
        animationType="fade"
        onRequestClose={() => setNoPaymentPopup(false)}
      >
        <TouchableOpacity
          style={noPayStyle.overlay}
          activeOpacity={1}
          onPress={() => setNoPaymentPopup(false)}
        />
        <View style={noPayStyle.card}>
          <View style={noPayStyle.iconWrap}>
            <Ionicons name="card-outline" size={32} color={COLORS.primary} />
          </View>
          <Text style={noPayStyle.title}>No payment card saved</Text>
          <Text style={noPayStyle.subtitle}>
            Add a card so you're ready to buy the moment you find something you love.
          </Text>
          <TouchableOpacity
            style={noPayStyle.addBtn}
            activeOpacity={0.85}
            onPress={() => { setNoPaymentPopup(false); setAddCardSheet(true); }}
          >
            <Ionicons name="add-circle-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={noPayStyle.addBtnText}>Add a card</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={noPayStyle.laterBtn}
            onPress={() => setNoPaymentPopup(false)}
          >
            <Text style={noPayStyle.laterText}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ── Listing Mode Selector ───────────────────────────────────────────── */}
      <Modal
        visible={modeSelectorVisible}
        transparent
        animationType="fade"
        onRequestClose={() => listingMode && setModeSelectorVisible(false)}
      >
        <View style={styles.modeOverlay}>
          <View style={styles.modeSheet}>
            <Text style={styles.modeTitle}>What are you looking for?</Text>
            <Text style={styles.modeSub}>Choose a listing type to search</Text>
            <View style={styles.modeGrid}>
              {LISTING_MODES.map((mode) => (
                <TouchableOpacity
                  key={mode.key}
                  style={[styles.modeTile, { borderColor: mode.color }]}
                  onPress={() => { setListingMode(mode.key); setModeSelectorVisible(false); }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.modeTileIcon, { backgroundColor: mode.color + '18' }]}>
                    <Ionicons name={mode.icon} size={32} color={mode.color} />
                  </View>
                  <Text style={[styles.modeTileLabel, { color: mode.color }]}>{mode.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {listingMode && (
              <TouchableOpacity style={styles.modeDismiss} onPress={() => setModeSelectorVisible(false)}>
                <Text style={styles.modeDismissText}>Keep current: {LISTING_MODES.find(m => m.key === listingMode)?.label}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Add-card PaymentSheet ───────────────────────────────────────────── */}
      <PaymentSheet
        visible={addCardSheet}
        onClose={() => setAddCardSheet(false)}
        title="Add a payment card"
        description="Saved for quick checkout when you buy"
        amount={0.00}
        currency="GBP"
        payload={null}
        onSuccess={() => setAddCardSheet(false)}
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
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#f7f8fa',
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#eaecf0',
    marginBottom: 10,
  },
  searchBarFocused: {
    backgroundColor: '#fff',
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchClearBtn: {
    padding: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '400',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 34,
    paddingHorizontal: 14,
    backgroundColor: '#f5f5f5',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 5,
    position: 'relative',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  filterBadge: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    top: -2,
    right: -2,
    borderWidth: 1.5,
    borderColor: '#fff',
  },

  // Active state for Listing Type chip
  filterButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterButtonTextActive: { color: '#fff', fontWeight: '600' },

  // Mode chip in filter row
  modeChip: { backgroundColor: '#fff', borderWidth: 1.5 },

  // Mode selector modal
  modeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modeSheet: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 4,
  },
  modeSub: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'center',
    width: '100%',
  },
  modeTile: {
    width: '44%',
    borderRadius: 18,
    borderWidth: 2,
    paddingVertical: 22,
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fafafa',
  },
  modeTileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTileLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  modeDismiss: {
    marginTop: 16,
    paddingVertical: 10,
  },
  modeDismissText: {
    fontSize: 13,
    color: '#aaa',
    textDecorationLine: 'underline',
  },

  // Listing Type picker modal
  ltPickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  ltPickerSheet: { backgroundColor: '#fff', borderRadius: 16, width: '78%', overflow: 'hidden', paddingBottom: 8 },
  ltPickerTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  ltPickerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f7f7f7' },
  ltPickerRowActive: { backgroundColor: '#f5f8ff' },
  ltPickerRowText: { fontSize: 15, color: '#1a1a1a' },
  ltPickerRowTextActive: { fontWeight: '600', color: COLORS.primary },

  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    marginTop: 2,
  },
  resultCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    letterSpacing: 0.1,
  },
  instructionsButton: {
    paddingHorizontal: 8,
  },
  instructionsText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.primary,
    textDecorationLine: 'underline',
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
  skeletonWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 100,
    paddingTop: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
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
    color: '#605f5fff',
    fontStyle: 'italic',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    height: 80,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 10,
    paddingTop: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  badgesWrapper: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    zIndex: 10,
  },
  centerMarkerLocation: {
    backgroundColor: '#4285F4',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  centerMarkerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgesWrapperBottomLeft: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    zIndex: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 10,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 2,
  },
  bookIcon: {
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  poundSign: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  plusCircle: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingTop: 0,
    paddingBottom: 0,
  },
  sliderContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 0,
    marginBottom: 80
  },
  sliderLabel: {
    fontSize: 13,
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
    paddingHorizontal: 20,
    paddingBottom: 100
  },
  gridItem: {
    width: '50%',
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
    color: '#303234',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyClearBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  emptyClearBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  subscriptionRequired: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  subscriptionText: {
    fontSize: 16,
    color: '#505050',
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
    fontSize: 13,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  disclaimerContainer: {
    backgroundColor: '#f9f9f9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
    width: '90%',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#505050',
    textAlign: 'left',
  },
  disclaimerLink: {
    fontSize: 12,
    color: COLORS.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  showcaseContainer: {
    marginVertical: 1,
    paddingVertical: 1,
    backgroundColor: 'transparent',
  },
  topBorder: {
    height: 2,
    backgroundColor: '#e0e0e0ff',
    marginHorizontal: 5,
    marginBottom: 12,
    width: 395,
  },
  bottomBorder: {
    height: 2,
    backgroundColor: '#e0e0e0ff',
    marginTop: 12,
    marginHorizontal: 5,
    marginBottom: 12,
    width: 395,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    marginLeft: 16,
    marginRight: 16,
  },
  label: {
    fontSize: 14,
    color: '#e0e0e0ff',
    fontWeight: '600',
    marginLeft: 6,
  },
  recommendationsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  popularContainer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 8,
  },
  popularHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    paddingHorizontal: 16,
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  popularHeaderSubtitle: {
    fontSize: 13,
    color: '#888',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  popularSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#303030',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  popularTabBar: {
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  popularTabBarContent: {
    paddingRight: 32,
  },
  popularTabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F7',
    marginRight: 8,
  },
  popularActiveTabButton: {
    backgroundColor: '#000000',
  },
  popularTabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#606060',
  },
  popularActiveTabButtonText: {
    color: '#FFFFFF',
  },
  popularCollectionsSlider: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  popularCollectionCard: {
    width: 140,
    height: 180,
    marginRight: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  popularCollectionImage: {
    width: '100%',
    height: '100%',
  },
  popularCollectionOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 8,
  },
  popularCollectionName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  popularFeedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  popularFeedCard: {
    width: (Dimensions.get('window').width - 36) / 2,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  popularFeedImageContainer: {
    width: '100%',
    height: (Dimensions.get('window').width - 36) / 2,
    backgroundColor: '#F7F7F9',
  },
  popularFeedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  popularScoreBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  popularScoreText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E65100',
  },
  popularFeedInfo: {
    padding: 8,
  },
  popularFeedTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#303030',
    marginBottom: 2,
  },
  popularFeedPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  popularViewAllContainer: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  popularViewAllButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  popularViewAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  eventsSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    borderTopWidth: 8,
    borderTopColor: '#F2F2F7',
  },
  eventsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    paddingHorizontal: 16,
  },
  eventsSectionSub: {
    fontSize: 12,
    color: '#606060',
    paddingHorizontal: 16,
    marginTop: 2,
    marginBottom: 12,
  },
  eventsSlider: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  eventCard: {
    width: 220,
    height: 140,
    marginRight: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#303030',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  eventOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'space-between',
    padding: 12,
  },
  eventBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  viewersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  viewersText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
    marginLeft: 3,
  },
  eventTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 3,
  },
  eventOrganizer: {
    color: '#E0E0E0',
    fontSize: 11,
    marginTop: 2,
  },
  viewAllClubsButton: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllClubsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // Search bar wrapper — column child, positions Cancel button absolutely
  searchBarWrapper: {
    marginBottom: 12,
    height: 52,
    justifyContent: 'center',
  },
  cancelButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingLeft: 12,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
  },

  // Search bar focused state
  searchBarFocused: {
    borderColor: '#1a1a1a',
  },

  // Suggestions list (replaces map/gallery while search is focused)
  suggestionsContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  suggestHint: {
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 40,
    gap: 12,
  },
  suggestHintText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 21,
  },
  suggestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  suggestHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#aaa',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  suggestClearAll: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Grouped section styles
  suggestSection: {
    marginTop: 16,
  },
  suggestSectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ebebeb',
  },
  suggestSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestLoaderBox: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Unified row
  suggestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ebebeb',
    minHeight: 56,
  },

  // Icon box (for clock / tag icon)
  suggestIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },

  // Product thumbnail
  suggestThumbBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 12,
    flexShrink: 0,
    backgroundColor: '#f0f0f0',
  },
  suggestThumbImg: {
    width: 42,
    height: 42,
  },
  suggestThumbFallback: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },

  // Middle text block
  suggestMiddle: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
    marginRight: 8,
  },
  suggestMainText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#1a1a1a',
    lineHeight: 20,
  },
  suggestBoldMatch: {
    fontWeight: '700',
    color: '#000',
  },
  suggestSubPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 1,
  },
  suggestSubCategory: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: 1,
  },

  // ↗ fill arrow button
  suggestFillBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  suggestDeleteBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: 4,
  },

  // legacy (kept to avoid crash if still referenced somewhere)
  suggestionSectionHeader: { display: 'none' },
  suggestionSectionTitle: { display: 'none' },
  suggestionClearText: { display: 'none' },
  suggestionItem: { display: 'none' },
  suggestionIconWrapper: { display: 'none' },
  suggestionText: { display: 'none' },
  suggestionMatchBold: { display: 'none' },
  suggestionTagPill: { display: 'none' },
  suggestionTagText: { display: 'none' },
  suggestionDivider: { display: 'none' },

  // QuickFind "Wanted" card styles
  qfCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 14,
    backgroundColor: '#fff8e6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  qfCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  qfWantedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ffc107',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  qfWantedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  qfDaysLeft: {
    fontSize: 11,
    color: '#888',
  },
  qfCategory: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  qfKeywords: {
    fontSize: 13,
    color: '#555',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  qfMeta: {
    gap: 2,
  },
  qfMetaText: {
    fontSize: 12,
    color: '#888',
  },

  // QuickFind map marker
  qfMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ffc107',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  qfCallout: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    minWidth: 140,
    borderWidth: 1,
    borderColor: '#ffc107',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  qfCalloutTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  qfCalloutSub: {
    fontSize: 11,
    color: '#666',
  },
  servicesGridEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  servicesGridEmptyText: {
    fontSize: 14,
    color: '#888',
    marginTop: 12,
    fontWeight: '500',
  },
  servicesGridScroll: {
    padding: 16,
    paddingBottom: 120,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceGridCard: {
    width: (Dimensions.get('window').width - 48) / 2,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceGridCardOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 15,
  },
  serviceGridCardOverlayTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  // Upgraded Map Pins Styling
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
});

const noPayStyle = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: 40,
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  laterBtn: {
    paddingVertical: 10,
  },
  laterText: {
    fontSize: 14,
    color: '#aaa',
  },
});

export default SearchScreen;