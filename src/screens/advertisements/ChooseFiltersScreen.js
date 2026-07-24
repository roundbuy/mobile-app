import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';
import FilterDropdown from '../../components/FilterDropdown';
import PriceInput from '../../components/PriceInput';
import LocationSelectionModal from '../../components/LocationSelectionModal';
import { advertisementService } from '../../services';
import { useTranslation } from '../../context/TranslationContext';

const QUALITY_OPTIONS = [
  { id: 'high', name: 'High Quality' },
  { id: 'medium', name: 'Medium Quality' },
  { id: 'low', name: 'Low Quality' },
];

// Which fields to show per listing type
const LISTING_TYPE_CONFIG = {
  sell:    { showPrice: true,  showCondition: true,  showQuality: true,  showGender: true,  priceLabel: 'Price *',       priceLocked: false },
  service: { showPrice: true,  showCondition: false, showQuality: false, showGender: false, priceLabel: 'Service Price *', priceLocked: false },
  rent:    { showPrice: true,  showCondition: true,  showQuality: false, showGender: false, priceLabel: 'Rental Price *', priceLocked: false },
  give:    { showPrice: false, showCondition: true,  showQuality: true,  showGender: false, priceLabel: 'Price',          priceLocked: true  },
};

// Map listing type → activity slug
const LISTING_TYPE_ACTIVITY = {
  sell: 'sell', service: 'services', rent: 'rent', give: 'give',
};

const ChooseFiltersScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const listingType = route.params?.listingType || 'sell';
  const typeConfig = LISTING_TYPE_CONFIG[listingType] || LISTING_TYPE_CONFIG.sell;

  const [filters, setFilters] = useState({
    category_id: route.params?.category_id || null,
    subcategory_id: route.params?.subcategory_id || null,
    activity_id: route.params?.activity_id || null,
    price: typeConfig.priceLocked ? '0' : (route.params?.price || ''),
    condition_id: route.params?.condition_id || null,
    quality: route.params?.quality || null,
    gender_id: route.params?.gender_id || null,
  });

  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    activities: [],
    conditions: [],
    genders: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Location selection state
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [userLocations, setUserLocations] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    loadFilterOptions();
    loadUserLocations();
  }, []);

  const loadFilterOptions = async () => {
    try {
      setLoading(true);
      const response = await advertisementService.getFilters();
      if (response.success) {
        setFilterOptions(response.data);
        // Auto-set activity_id from listingType
        const targetSlug = LISTING_TYPE_ACTIVITY[listingType] || 'sell';
        const matchedActivity = (response.data.activities || []).find(a => a.slug === targetSlug);
        if (matchedActivity) {
          setFilters(prev => ({ ...prev, activity_id: matchedActivity.id }));
        }
      } else {
        setError('Failed to load filter options');
      }
    } catch (err) {
      console.error('Error loading filters:', err);
      setError('Failed to load filter options');
    } finally {
      setLoading(false);
    }
  };

  const loadUserLocations = async () => {
    try {
      const response = await advertisementService.getUserLocations();
      if (response.success) {
        const locations = response.data.locations || [];
        setUserLocations(locations);

        // Auto-select default location or first location
        const defaultLocation = locations.find(loc => loc.is_default);
        if (defaultLocation) {
          setSelectedLocations([defaultLocation.id]);
        } else if (locations.length > 0) {
          setSelectedLocations([locations[0].id]);
        }
      }
    } catch (err) {
      console.error('Error loading user locations:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Reset subcategory when category changes
      ...(key === 'category_id' && { subcategory_id: null })
    }));
  };

  const getSubcategories = () => {
    if (!filters.category_id) return [];
    const selectedCategory = filterOptions.categories.find(cat => cat.id === filters.category_id);
    return selectedCategory?.subcategories || [];
  };

  const validateFilters = () => {
    if (!filters.category_id) {
      Alert.alert(t('Validation Error'), t('Please select a category'));
      return false;
    }

    if (typeConfig.showPrice && !typeConfig.priceLocked && (!filters.price || filters.price === '0')) {
      Alert.alert(t('Validation Error'), t('Please enter a valid price'));
      return false;
    }

    if (typeConfig.showCondition && !filters.condition_id) {
      Alert.alert(t('Validation Error'), t('Please select a condition'));
      return false;
    }

    if (typeConfig.showQuality && !filters.quality) {
      Alert.alert(t('Validation Error'), t('Please select a quality level'));
      return false;
    }

    if (typeConfig.showGender && !filters.gender_id) {
      Alert.alert(t('Validation Error'), t('Please select a gender'));
      return false;
    }

    if (!selectedLocations || selectedLocations.length === 0) {
      Alert.alert(t('Validation Error'), t('Please select at least one location'));
      return false;
    }

    return true;
  };

  const handleContinue = () => {
    if (!validateFilters()) {
      return;
    }

    // Get selected location data
    const selectedLocationsData = userLocations.filter(loc => selectedLocations.includes(loc.id));

    // Get filter names for display
    const categoryName = filterOptions.categories.find(c => c.id === filters.category_id)?.name;
    const subcategoryName = filters.subcategory_id
      ? getSubcategories().find(s => s.id === filters.subcategory_id)?.name
      : null;
    const activityName = filterOptions.activities.find(a => a.id === filters.activity_id)?.name;
    const conditionName = filters.condition_id
      ? filterOptions.conditions.find(c => c.id === filters.condition_id)?.name
      : null;
    const qualityName = filters.quality
      ? QUALITY_OPTIONS.find(q => q.id === filters.quality)?.name
      : null;
    const genderName = filters.gender_id
      ? filterOptions.genders.find(g => g.id === filters.gender_id)?.name
      : null;

    navigation.navigate('ChooseRestFilters', {
      ...route.params,
      ...filters,
      location_ids: selectedLocations,
      locations: selectedLocationsData,
      categoryName,
      subcategoryName,
      activityName,
      conditionName,
      qualityName,
      genderName,
      // Pass through edit params
      isEdit: route.params?.isEdit,
      adId: route.params?.adId,
    });
  };

  const getSelectedLocationDisplay = () => {
    if (!selectedLocations || selectedLocations.length === 0) return 'No location selected';

    if (selectedLocations.length === 1) {
      const location = userLocations.find(loc => loc.id === selectedLocations[0]);
      return location ? `${location.name} - ${location.city}, ${location.country}` : 'Unknown Location';
    }

    return `${selectedLocations.length} locations selected`;
  };

  const getSelectedLocationAddressDisplay = () => {
    if (!selectedLocations || selectedLocations.length === 0) return 'No location selected';

    if (selectedLocations.length === 1) {
      const location = userLocations.find(loc => loc.id === selectedLocations[0]);
      if (!location) return '';
      return [
        location.street,
        location.street2,
        location.city,
        location.region,
        location.country,
        location.zip_code
      ].filter(Boolean).join(', ');
    }

    // List first 2 names...
    const names = userLocations
      .filter(loc => selectedLocations.includes(loc.id))
      .map(loc => loc.name)
      .slice(0, 2)
      .join(', ');

    return selectedLocations.length > 2 ? `${names}, ...` : names;
  };

  return (
    <SafeScreenContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.title}>{t('Choose filters:')}</Text>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>{t('Loading filter options...')}</Text>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadFilterOptions}>
              <Text style={styles.retryButtonText}>{t('Retry')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Filter Fields */}
        {!loading && !error ? (
          <View style={styles.filtersContainer}>
            <FilterDropdown
              label={t('Category *')}
              value={filters.category_id}
              options={filterOptions.categories}
              onSelect={(value) => handleFilterChange('category_id', value)}
              placeholder={t('Select a category')}
            />

            <FilterDropdown
              label={t('Subcategory *')}
              value={filters.subcategory_id}
              options={getSubcategories()}
              onSelect={(value) => handleFilterChange('subcategory_id', value)}
              placeholder={t('Select a subcategory')}
              disabled={!filters.category_id}
            />

            {typeConfig.showPrice && !typeConfig.priceLocked && (
              <PriceInput
                label={t(typeConfig.priceLabel)}
                price={filters.price}
                onPriceChange={(value) => handleFilterChange('price', value)}
              />
            )}

            {typeConfig.priceLocked && (
              <View style={styles.lockedPriceRow}>
                <Text style={styles.lockedPriceLabel}>{t('Price')}</Text>
                <Text style={styles.lockedPriceValue}>Free (£0)</Text>
              </View>
            )}

            {typeConfig.showCondition && (
              <FilterDropdown
                label={t('Condition *')}
                value={filters.condition_id}
                options={filterOptions.conditions}
                onSelect={(value) => handleFilterChange('condition_id', value)}
                placeholder={t('Select condition')}
              />
            )}

            {typeConfig.showQuality && (
              <FilterDropdown
                label={t('Quality *')}
                value={filters.quality}
                options={QUALITY_OPTIONS}
                onSelect={(value) => handleFilterChange('quality', value)}
                placeholder={t('Select quality level')}
                onInfoPress={() => navigation.navigate('QualityInfo')}
              />
            )}

            {typeConfig.showGender && (
              <FilterDropdown
                label={t('Gender *')}
                value={filters.gender_id}
                options={filterOptions.genders}
                onSelect={(value) => handleFilterChange('gender_id', value)}
                placeholder={t('Select gender')}
              />
            )}

            {/* Location Selection */}
            <View style={styles.locationContainer}>
              <Text style={styles.locationLabel}>{t('Choose location: *')}</Text>

              {userLocations.length > 0 ? (
                <View>
                  {/* Show selected location */}
                  <TouchableOpacity
                    style={styles.selectedLocationCard}
                    onPress={() => setShowLocationModal(true)}
                  >
                    <View style={styles.locationInfo}>
                      <Text style={styles.selectedLocationName}>
                        {getSelectedLocationDisplay()}
                      </Text>
                      <Text style={styles.selectedLocationAddress} numberOfLines={2}>
                        {getSelectedLocationAddressDisplay()}
                      </Text>
                    </View>
                    <Text style={styles.changeText}>{t('Change')}</Text>
                  </TouchableOpacity>

                  {/* Show more info link */}
                  <TouchableOpacity
                    style={styles.showMoreButton}
                    onPress={() => setShowLocationModal(true)}
                  >
                    <Text style={styles.showMoreText}>Show all locations ({userLocations.length})</Text>
                    <Text style={styles.showMoreIcon}>→</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.noLocationContainer}>
                  <Text style={styles.noLocationText}>{t('No locations found')}</Text>
                  <TouchableOpacity style={styles.addLocationButton}>
                    <Text style={styles.addLocationButtonText}>{t('Add Location')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ) : null}

        {/* Info Text */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>{t('* All fields are required')}</Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>{t('Continue')}</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Location Selection Modal */}
      <LocationSelectionModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        locations={userLocations}
        selectedLocations={selectedLocations}
        onSelectLocations={setSelectedLocations}
      />
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  lockedPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 16,
  },
  lockedPriceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  lockedPriceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    fontSize: 28,
    color: '#000',
    fontWeight: '300',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#505050',
  },
  errorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  locationContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  locationLabel: {
    fontSize: 15,
    color: '#000',
    marginBottom: 12,
    fontWeight: '500',
  },
  selectedLocationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  locationInfo: {
    flex: 1,
    marginRight: 12,
  },
  selectedLocationName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  selectedLocationAddress: {
    fontSize: 13,
    color: '#505050',
    lineHeight: 18,
  },
  changeText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  showMoreButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  showMoreText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  showMoreIcon: {
    fontSize: 16,
    color: COLORS.primary,
  },
  noLocationContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noLocationText: {
    fontSize: 14,
    color: '#505050',
    marginBottom: 12,
  },
  addLocationButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addLocationButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 13,
    color: '#303234',
    fontStyle: 'italic',
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpace: {
    height: 30,
  },
});

export default ChooseFiltersScreen;