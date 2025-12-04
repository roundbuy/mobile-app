import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import SafeScreenContainer from '../components/SafeScreenContainer';
import FilterDropdown from '../components/FilterDropdown';
import { COLORS } from '../constants/theme';
import { getFilters } from '../services/advertisementService';

const ChooseRestFiltersScreen = ({ navigation, route }) => {
  const [filters, setFilters] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected values
  const [age, setAge] = useState('');
  const [size, setSize] = useState('');
  const [colour, setColour] = useState('');

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

  const handleContinue = () => {
    navigation.navigate('PreviewAd', {
      ...route.params,
      age,
      size,
      colour,
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
          <Text style={styles.stepIndicator}>3/8</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Choose rest of the filters:</Text>

        {/* Filter Fields */}
        <View style={styles.filtersContainer}>
          <FilterDropdown
            label="Age"
            value={age}
            options={filters?.ages || []}
            onSelect={setAge}
            placeholder="Select age"
          />

          <FilterDropdown
            label="Size"
            value={size}
            options={filters?.sizes || []}
            onSelect={setSize}
            placeholder="Select size"
          />

          <FilterDropdown
            label="Colour"
            value={colour}
            options={filters?.colors || []}
            onSelect={setColour}
            placeholder="Select colour"
            isColorPicker={true}
          />
        </View>

        {/* Location Section */}
        <View style={styles.locationSection}>
          <Text style={styles.locationTitle}>Choose location(s):</Text>
          <Text style={styles.locationItem}>Location 1 (centre-point; near to your home)</Text>
          <Text style={styles.locationSubitem}>Trafalgar Square (autodil user default location)</Text>
          <Text style={styles.locationItem}>Location 2 (e.g. you near to work)</Text>
          <Text style={styles.locationItem}>Location 3 (e.g. close to cottage)</Text>
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
  locationSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  locationItem: {
    fontSize: 14,
    color: '#000',
    marginBottom: 12,
    lineHeight: 20,
  },
  locationSubitem: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
    marginLeft: 16,
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