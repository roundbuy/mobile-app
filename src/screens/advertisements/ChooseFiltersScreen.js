import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';
import FilterDropdown from '../../components/FilterDropdown';
import PriceRangeInput from '../../components/PriceRangeInput';
import { advertisementService } from '../../services';

const ChooseFiltersScreen = ({ navigation, route }) => {
  const [filters, setFilters] = useState({
    category_id: null,
    subcategory_id: null,
    activity_id: null,
    min_price: '',
    max_price: '',
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
  const [selectedLocation, setSelectedLocation] = useState(1); // Default to location 1
  const [userLocations, setUserLocations] = useState([]);

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
        setUserLocations(response.data.locations || []);
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

  const handleContinue = () => {
    // Get selected location data
    const selectedLocationData = userLocations.find(loc => loc.id === selectedLocation);

    navigation.navigate('ChooseRestFilters', {
      ...route.params,
      ...filters,
      location_id: selectedLocation,
      location: selectedLocationData,
    });
  };

  return (
    <SafeScreenContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>2/8</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Choose filters:</Text>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading filter options...</Text>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadFilterOptions}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Filter Fields */}
        {!loading && !error && (
          <View style={styles.filtersContainer}>
            <FilterDropdown
              label="Category"
              value={filters.category_id}
              options={filterOptions.categories}
              onSelect={(value) => handleFilterChange('category_id', value)}
              placeholder="Select a category"
            />

            <FilterDropdown
              label="Subcategory"
              value={filters.subcategory_id}
              options={getSubcategories()}
              onSelect={(value) => handleFilterChange('subcategory_id', value)}
              placeholder="Select a subcategory"
              disabled={!filters.category_id}
            />

            <FilterDropdown
              label="Activity"
              value={filters.activity_id}
              options={filterOptions.activities}
              onSelect={(value) => handleFilterChange('activity_id', value)}
              placeholder="Select activity type"
            />

            <PriceRangeInput
              minPrice={filters.min_price}
              maxPrice={filters.max_price}
              onMinPriceChange={(value) => handleFilterChange('min_price', value)}
              onMaxPriceChange={(value) => handleFilterChange('max_price', value)}
            />

            <FilterDropdown
              label="Condition"
              value={filters.condition_id}
              options={filterOptions.conditions}
              onSelect={(value) => handleFilterChange('condition_id', value)}
              placeholder="Select condition"
            />

            <FilterDropdown
              label="Gender"
              value={filters.gender_id}
              options={filterOptions.genders}
              onSelect={(value) => handleFilterChange('gender_id', value)}
              placeholder="Select gender"
            />

            {/* Location Selection */}
            <View style={styles.locationContainer}>
              <Text style={styles.locationLabel}>Choose location:</Text>
              <View style={styles.locationOptions}>
                {[1, 2, 3].map((locationId) => {
                  const location = userLocations.find(loc => loc.id === locationId);
                  return (
                    <TouchableOpacity
                      key={locationId}
                      style={[
                        styles.locationOption,
                        selectedLocation === locationId && styles.locationOptionSelected
                      ]}
                      onPress={() => setSelectedLocation(locationId)}
                    >
                      <Text style={[
                        styles.locationNumber,
                        selectedLocation === locationId && styles.locationNumberSelected
                      ]}>
                        {locationId}
                      </Text>
                      {location && (
                        <Text style={[
                          styles.locationName,
                          selectedLocation === locationId && styles.locationNameSelected
                        ]} numberOfLines={1}>
                          {location.name}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Info Link */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>For more information, </Text>
          <TouchableOpacity>
            <Text style={styles.infoLink}>click here</Text>
          </TouchableOpacity>
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconText}>ⓘ</Text>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
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
  stepIndicator: {
    fontSize: 16,
    color: '#666',
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
  },
  locationOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  locationOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F8FF',
  },
  locationNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#666',
    marginBottom: 4,
  },
  locationNumberSelected: {
    color: COLORS.primary,
  },
  locationName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  locationNameSelected: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
  },
  infoLink: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  infoIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  infoIconText: {
    fontSize: 12,
    color: '#999',
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