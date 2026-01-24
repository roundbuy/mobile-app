import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';
import FilterDropdown from '../../components/FilterDropdown';
import { advertisementService } from '../../services';
import { useTranslation } from '../../context/TranslationContext';

const ChooseRestFiltersScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
  const [filters, setFilters] = useState({
    age_id: null,
    size_id: null,
    color_id: null,
  });

  const [filterOptions, setFilterOptions] = useState({
    ages: [],
    sizes: [],
    colors: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryData, setCategoryData] = useState(null);

  // Get gender_id and category_id from previous screen
  const selectedGenderId = route.params?.gender_id;
  const selectedCategoryId = route.params?.category_id;

  useEffect(() => {
    loadFilterOptions();
    loadCategoryData();
  }, []);

  const loadCategoryData = async () => {
    try {
      // Fetch category details to check requires_size
      const response = await advertisementService.getFilters();
      if (response.success && response.data.categories) {
        const category = response.data.categories.find(c => c.id === selectedCategoryId);
        setCategoryData(category);
      }
    } catch (err) {
      console.error('Error loading category data:', err);
    }
  };

  const loadFilterOptions = async () => {
    try {
      setLoading(true);
      const response = await advertisementService.getFilters();
      if (response.success) {
        // Filter sizes based on selected gender_id
        const filteredSizes = selectedGenderId
          ? response.data.sizes.filter(size => size.gender_id === selectedGenderId)
          : response.data.sizes;

        setFilterOptions({
          ...response.data,
          sizes: filteredSizes
        });
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const validateFilters = () => {
    if (!filters.age_id) {
      Alert.alert(t('Validation Error'), t('Please select an age group'));
      return false;
    }

    // Check if size is required based on category
    const requiresSize = categoryData?.requires_size;

    if (requiresSize === 'required' && !filters.size_id) {
      Alert.alert(t('Validation Error'), t('Size is required for this category. Please select a size.'));
      return false;
    }

    if (!filters.color_id) {
      Alert.alert(t('Validation Error'), t('Please select a color'));
      return false;
    }

    return true;
  };

  const handleContinue = () => {
    // Validate before continuing
    if (!validateFilters()) {
      return;
    }

    // Get filter names for display
    const ageName = filters.age_id
      ? filterOptions.ages.find(a => a.id === filters.age_id)?.name
      : null;
    const sizeName = filters.size_id
      ? filterOptions.sizes.find(s => s.id === filters.size_id)?.name
      : null;
    const colorName = filters.color_id
      ? filterOptions.colors.find(c => c.id === filters.color_id)?.name
      : null;

    navigation.navigate('PreviewAd', {
      ...route.params,
      ...filters,
      // Add filter names for preview
      ageName,
      sizeName,
      colorName,
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
          {/* <Text style={styles.stepIndicator}>3/8</Text> */}
        </View>

        {/* Title */}
        <Text style={styles.title}>{t('Choose rest of the filters:')}</Text>

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
              label={t('Age *')}
              value={filters.age_id}
              options={filterOptions.ages}
              onSelect={(value) => handleFilterChange('age_id', value)}
              placeholder={t('Select age group')}
            />

            {/* Only show size if category requires it (required or optional) */}

            <FilterDropdown
              label={`Size ${categoryData?.requires_size === 'required' ? '*' : '(Optional)'}`}
              value={filters.size_id}
              options={filterOptions.sizes}
              onSelect={(value) => handleFilterChange('size_id', value)}
              placeholder={t('Select size')}
            />

            <FilterDropdown
              label={t('Color *')}
              value={filters.color_id}
              options={filterOptions.colors}
              onSelect={(value) => handleFilterChange('color_id', value)}
              placeholder={t('Select color')}
              isColorPicker={true}
            />
          </View>
        )}

        {/* Info Text */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            * Required fields
            {categoryData?.requires_size === 'not_applicable' && ' (Size not applicable for this category)'}
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>{t('Continue')}</Text>
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

export default ChooseRestFiltersScreen;