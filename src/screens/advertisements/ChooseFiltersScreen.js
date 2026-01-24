import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';
import FilterDropdown from '../../components/FilterDropdown';
import PriceInput from '../../components/PriceInput';
import LocationSelectionModal from '../../components/LocationSelectionModal';
import { advertisementService } from '../../services';
import { useTranslation } from '../../context/TranslationContext';

const ChooseFiltersScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
  const [filters, setFilters] = useState({
    category_id: null,
    subcategory_id: null,
    activity_id: null,
    price: '',
    condition_id: null,
    gender_id: null,
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
  const [selectedLocation, setSelectedLocation] = useState(null);
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
          setSelectedLocation(defaultLocation.id);
        } else if (locations.length > 0) {
          setSelectedLocation(locations[0].id);
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
    // Check required fields
    if (!filters.category_id) {
      Alert.alert(t('Validation Error'), t('Please select a category'));
      return false;
    }

    // if (!filters.subcategory_id) {
    //   Alert.alert(t('Validation Error'), t('Please select a subcategory'));
    //   return false;
    // }

    if (!filters.activity_id) {
      Alert.alert(t('Validation Error'), t('Please select an activity'));
      return false;
    }

    if (!filters.price || filters.price === '0') {
      Alert.alert(t('Validation Error'), t('Please enter a valid price'));
      return false;
    }

    if (!filters.condition_id) {
      Alert.alert(t('Validation Error'), t('Please select a condition'));
      return false;
    }

    if (!filters.gender_id) {
      Alert.alert(t('Validation Error'), t('Please select a gender'));
      return false;
    }

    if (!selectedLocation) {
      Alert.alert(t('Validation Error'), t('Please select a location'));
      return false;
    }

    return true;
  };

  const handleContinue = () => {
    // Validate before continuing
    if (!validateFilters()) {
      return;
    }

    // Get selected location data
    const selectedLocationData = userLocations.find(loc => loc.id === selectedLocation);

    // Get filter names for display
    const categoryName = filterOptions.categories.find(c => c.id === filters.category_id)?.name;
    const subcategoryName = filters.subcategory_id
      ? getSubcategories().find(s => s.id === filters.subcategory_id)?.name
      : null;
    const activityName = filterOptions.activities.find(a => a.id === filters.activity_id)?.name;
    const conditionName = filters.condition_id
      ? filterOptions.conditions.find(c => c.id === filters.condition_id)?.name
      : null;
    const genderName = filters.gender_id
      ? filterOptions.genders.find(g => g.id === filters.gender_id)?.name
      : null;

    navigation.navigate('ChooseRestFilters', {
      ...route.params,
      ...filters,
      location_id: selectedLocation,
      location: selectedLocationData,
      // Add filter names for preview
      categoryName,
      subcategoryName,
      activityName,
      conditionName,
      genderName,
    });
  };

  const getSelectedLocationDisplay = () => {
    const location = userLocations.find(loc => loc.id === selectedLocation);
    if (!location) return 'No location selected';

    return `${location.name} - ${location.city}, ${location.country}`;
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
        {!loading && !error && (
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

            <FilterDropdown
              label={t('Activity *')}
              value={filters.activity_id}
              options={filterOptions.activities}
              onSelect={(value) => handleFilterChange('activity_id', value)}
              placeholder={t('Select activity type')}
            />

            <PriceInput
              label={t('Price *')}
              price={filters.price}
              onPriceChange={(value) => handleFilterChange('price', value)}
            />

            <FilterDropdown
              label={t('Condition *')}
              value={filters.condition_id}
              options={filterOptions.conditions}
              onSelect={(value) => handleFilterChange('condition_id', value)}
              placeholder={t('Select condition')}
            />

            <FilterDropdown
              label={t('Gender *')}
              value={filters.gender_id}
              options={filterOptions.genders}
              onSelect={(value) => handleFilterChange('gender_id', value)}
              placeholder={t('Select gender')}
            />

            {/* Location Selection */}
            <View style={styles.locationContainer}>
              <Text style={styles.locationLabel}>{t('Choose location: *')}</Text>

              {userLocations.length > 0 ? (
                <>
                  {/* Show selected location */}
                  <TouchableOpacity
                    style={styles.selectedLocationCard}
                    onPress={() => setShowLocationModal(true)}
                  >
                    <View style={styles.locationInfo}>
                      <Text style={styles.selectedLocationName}>
                        {userLocations.find(loc => loc.id === selectedLocation)?.name || 'Select location'}
                      </Text>
                      <Text style={styles.selectedLocationAddress} numberOfLines={2}>
                        {selectedLocation && userLocations.find(l => l.id === selectedLocation)
                          ? [
                            userLocations.find(l => l.id === selectedLocation)?.street,
                            userLocations.find(l => l.id === selectedLocation)?.street2,
                            userLocations.find(l => l.id === selectedLocation)?.city,
                            userLocations.find(l => l.id === selectedLocation)?.region,
                            userLocations.find(l => l.id === selectedLocation)?.country,
                            userLocations.find(l => l.id === selectedLocation)?.zip_code
                          ].filter(Boolean).join(', ')
                          : 'No location selected'}
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
                </>
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
        )}

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
        selectedLocation={selectedLocation}
        onSelectLocation={setSelectedLocation}
      />
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
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
    color: '#666',
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
    color: '#666',
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
    color: '#666',
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
    color: '#999',
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