import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import SafeScreenContainer from '../components/SafeScreenContainer';
import FilterDropdown from '../components/FilterDropdown';
import PriceRangeInput from '../components/PriceRangeInput';
import { COLORS } from '../constants/theme';
import { getFilters } from '../services/advertisementService';

const ChooseFiltersScreen = ({ navigation, route }) => {
  const [filters, setFilters] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected values
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [activity, setActivity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [gender, setGender] = useState('');

  // Get available subcategories for selected category
  const availableSubcategories = filters?.categories?.find(cat => cat.id === category)?.subcategories || [];

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getFilters();
        if (response.success) {
          setFilters(response.data);
        } else {
          setError('Failed to load filters');
        }
      } catch (err) {
        setError('Network error. Please try again.');
        console.error('Error fetching filters:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

  // Reset subcategory when category changes
  useEffect(() => {
    if (category && !availableSubcategories.find(sub => sub.id === subcategory)) {
      setSubcategory('');
    }
  }, [category, availableSubcategories, subcategory]);

  const handleContinue = () => {
    navigation.navigate('ChooseRestFilters', {
      ...route.params,
      category,
      subcategory,
      activity,
      minPrice,
      maxPrice,
      condition,
      gender,
    });
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Re-fetch filters
    const fetchFilters = async () => {
      try {
        const response = await getFilters();
        if (response.success) {
          setFilters(response.data);
        } else {
          setError('Failed to load filters');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchFilters();
  };

  if (loading) {
    return (
      <SafeScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading filters...</Text>
        </View>
      </SafeScreenContainer>
    );
  }

  if (error) {
    return (
      <SafeScreenContainer>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeScreenContainer>
    );
  }

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

        {/* Filter Fields */}
        <View style={styles.filtersContainer}>
          <FilterDropdown
            label="Category"
            value={category}
            options={filters?.categories || []}
            onSelect={setCategory}
            placeholder="Select a category"
          />

          <FilterDropdown
            label="Subcategory"
            value={subcategory}
            options={availableSubcategories}
            onSelect={setSubcategory}
            placeholder="Select a subcategory"
            disabled={!category}
          />

          <FilterDropdown
            label="Activity"
            value={activity}
            options={filters?.activities || []}
            onSelect={setActivity}
            placeholder="Select activity"
          />

          <PriceRangeInput
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
          />

          <FilterDropdown
            label="Condition"
            value={condition}
            options={filters?.conditions || []}
            onSelect={setCondition}
            placeholder="Select condition"
          />

          <FilterDropdown
            label="Gender"
            value={gender}
            options={filters?.genders || []}
            onSelect={setGender}
            placeholder="Select gender"
          />
        </View>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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

export default ChooseFiltersScreen;