import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';
import FilterDropdown from '../../components/FilterDropdown';
import { advertisementService } from '../../services';

const ChooseRestFiltersScreen = ({ navigation, route }) => {
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

  useEffect(() => {
    loadFilterOptions();
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleContinue = () => {
    navigation.navigate('PreviewAd', {
      ...route.params,
      ...filters,
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
          <Text style={styles.stepIndicator}>3/8</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Choose rest of the filters:</Text>

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
              label="Age"
              value={filters.age_id}
              options={filterOptions.ages}
              onSelect={(value) => handleFilterChange('age_id', value)}
              placeholder="Select age group"
            />

            <FilterDropdown
              label="Size"
              value={filters.size_id}
              options={filterOptions.sizes}
              onSelect={(value) => handleFilterChange('size_id', value)}
              placeholder="Select size"
            />

            <FilterDropdown
              label="Color"
              value={filters.color_id}
              options={filterOptions.colors}
              onSelect={(value) => handleFilterChange('color_id', value)}
              placeholder="Select color"
              isColorPicker={true}
            />
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