import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';
import FilterDropdown from '../../components/FilterDropdown';
import { advertisementService } from '../../services';
import { useTranslation } from '../../context/TranslationContext';

const ChooseRestFiltersScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    age_id: route.params?.age_id || null,
    size_id: route.params?.size_id || null,
    color_id: route.params?.color_id || null,
    size_type: route.params?.size_type || 'not_applicable',
    // Dimensions
    dim_length: route.params?.dim_length || '',
    dim_width: route.params?.dim_width || '',
    dim_height: route.params?.dim_height || '',
    dim_unit: route.params?.dim_unit || 'cm'
  });

  const [filterOptions, setFilterOptions] = useState({
    ages: [],
    sizes: [],
    colors: [],
  });

  // Size type options
  const sizeTypeOptions = [
    { id: 'not_applicable', name: t('Not Applicable') },
    { id: 'dimensions', name: t('Dimension') },
    { id: 'clothing', name: t('Clothe Size') },
  ];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get gender_id and category_id from previous screen
  const selectedGenderId = route.params?.gender_id;
  const selectedCategoryId = route.params?.category_id;

  useEffect(() => {
    loadFilterOptions();
  }, []);



  const loadFilterOptions = async () => {
    try {
      setLoading(true);
      const response = await advertisementService.getFilters();
      if (response.success) {
        // Load all sizes (not filtered by gender anymore)
        setFilterOptions({
          ...response.data,
          sizes: response.data.sizes
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

    // Check size type from user selection
    if (filters.size_type === 'clothing') {
      if (!filters.size_id) {
        Alert.alert(t('Validation Error'), t('Please select a size'));
        return false;
      }
    } else if (filters.size_type === 'dimensions') {
      if (!filters.dim_length || !filters.dim_width || !filters.dim_height) {
        Alert.alert(t('Validation Error'), t('Please enter all dimensions (H x W x L)'));
        return false;
      }
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

    // Determine size display name based on user-selected type
    let sizeName = null;

    if (filters.size_type === 'clothing' && filters.size_id) {
      sizeName = filterOptions.sizes.find(s => s.id === filters.size_id)?.name;
    } else if (filters.size_type === 'dimensions') {
      sizeName = `${filters.dim_height}x${filters.dim_width}x${filters.dim_length} ${filters.dim_unit}`;
    } else if (filters.size_type === 'not_applicable') {
      sizeName = t('Not Applicable');
    }

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

  const renderSizeInput = () => {
    if (filters.size_type === 'not_applicable') {
      return null; // Hide size input
    }

    if (filters.size_type === 'dimensions') {
      return (
        <View style={styles.dimensionsContainer}>
          <Text style={styles.label}>{t('Dimensions (H x W x L) *')}</Text>
          <View style={styles.dimensionsInputs}>
            <TextInput
              style={styles.dimensionInput}
              placeholder="H"
              keyboardType="numeric"
              value={filters.dim_height}
              onChangeText={(val) => handleFilterChange('dim_height', val)}
            />
            <Text style={styles.xDivider}>x</Text>
            <TextInput
              style={styles.dimensionInput}
              placeholder="W"
              keyboardType="numeric"
              value={filters.dim_width}
              onChangeText={(val) => handleFilterChange('dim_width', val)}
            />
            <Text style={styles.xDivider}>x</Text>
            <TextInput
              style={styles.dimensionInput}
              placeholder="L"
              keyboardType="numeric"
              value={filters.dim_length}
              onChangeText={(val) => handleFilterChange('dim_length', val)}
            />
            <View style={styles.unitContainer}>
              <Text style={styles.unitText}>{filters.dim_unit}</Text>
            </View>
          </View>
        </View>
      );
    }

    // Clothing size dropdown
    return (
      <FilterDropdown
        label={t('Size *')}
        value={filters.size_id}
        options={filterOptions.sizes}
        onSelect={(value) => handleFilterChange('size_id', value)}
        placeholder={t('Select size')}
      />
    );
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

            {/* Size Type Dropdown - explicit render */}
            <FilterDropdown
              label={t('Size Type *')}
              value={filters.size_type || 'not_applicable'}
              options={sizeTypeOptions}
              onSelect={(value) => handleFilterChange('size_type', value)}
              placeholder={t('Select size type')}
            />

            {/* Dynamic Size Input based on Size Type */}
            {renderSizeInput()}

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
            * {t('Required fields')}
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
  dimensionsContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  dimensionsInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dimensionInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#000',
    textAlign: 'center',
  },
  xDivider: {
    paddingHorizontal: 10,
    color: '#666',
    fontSize: 16,
  },
  unitContainer: {
    marginLeft: 10,
    backgroundColor: '#E0E0E0',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  unitText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  }
});

export default ChooseRestFiltersScreen;