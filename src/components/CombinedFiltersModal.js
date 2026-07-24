import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, SafeAreaView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/theme';

const QUALITY_OPTIONS = [
  { id: 'high', name: 'High Quality' },
  { id: 'medium', name: 'Medium Quality' },
  { id: 'low', name: 'Low Quality' },
];

const CombinedFiltersModal = ({
  visible,
  onClose,
  filters,
  onUpdateFilters,
  onOpenCategoryModal,
  onOpenSubcategoryModal,
  listingTypeFilter,
  onOpenListingTypeModal,
  onOpenConditionModal,
  onOpenQualityModal,
  onOpenDistanceModal,
  onOpenPriceModal,
  onOpenGenderModal,
  onOpenAgeModal,
  onOpenSizeModal,
  onOpenColorModal,
  onOpenMeasurementModal,
  filterOptions = {},
}) => {
  const [activeSizeSystem, setActiveSizeSystem] = useState('intl');

  useEffect(() => {
    const loadSavedSystem = async () => {
      try {
        const saved = await AsyncStorage.getItem('@roundbuy:active_size_system');
        if (saved && ['intl', 'us', 'uk', 'eu'].includes(saved)) {
          setActiveSizeSystem(saved);
        }
      } catch (e) {
        console.error('Error loading size system:', e);
      }
    };
    if (visible) {
      loadSavedSystem();
    }
  }, [visible]);

  // Extract summary text for UI
  const getSummaryText = (item, optionsArray = [], defaultText = 'All', isSize = false) => {
    if (!item || item.length === 0) return defaultText;

    const resolveSizeLabel = (o) => {
      if (!isSize) return o.name;
      switch (activeSizeSystem) {
        case 'us': return o.us_size ? `US ${o.us_size}` : o.name;
        case 'uk': return o.uk_size ? `UK ${o.uk_size}` : o.name;
        case 'eu': return o.euro_size ? `EU ${o.euro_size}` : o.name;
        case 'intl':
        default: return o.intl_size ? `Intl ${o.intl_size}` : o.name;
      }
    };

    let labels = [];
    if (Array.isArray(item)) {
      labels = item.map(i => {
        const o = optionsArray?.find(opt => opt.id?.toString() === i?.toString());
        return o ? resolveSizeLabel(o) : i;
      });
    } else if (typeof item === 'string') {
      const parts = item.split(',').filter(p => p.trim());
      labels = parts.map(i => {
        const o = optionsArray?.find(opt => opt.id?.toString() === i?.toString());
        return o ? resolveSizeLabel(o) : i;
      });
    } else {
      const o = optionsArray?.find(opt => opt.id?.toString() === item?.toString());
      labels = [o ? resolveSizeLabel(o) : item];
    }

    const joined = labels.join(', ');
    if (joined.length > 15) {
      return joined.substring(0, 15) + '...';
    }
    return joined;
  };

  const getPriceSummaryText = () => {
    if (filters.min_price || filters.max_price) {
      return `£${filters.min_price || '0'} - ${filters.max_price ? `£${filters.max_price}` : 'No limit'}`;
    }
    return 'All';
  };

  const getDistanceSummaryText = () => {
    if (filters.radius && filters.radius < 100000) { // 100000 is our UNLIMITED_RADIUS constant
      return `${filters.radius} km`;
    }
    return 'All';
  };

  const LISTING_TYPE_LABELS = {
    all: 'All on sale listings',
    garage_sales: 'Garage-Sales',
    showcasing: 'ShowCasing',
    quickfinds: 'QuickFinds',
  };

  const hasActiveFilters = () => {
    return (listingTypeFilter && listingTypeFilter !== 'all') ||
      filters.category_id ||
      filters.subcategory_id ||
      filters.condition_id ||
      (filters.quality && filters.quality.length > 0) ||
      filters.min_price ||
      filters.max_price ||
      (filters.radius && filters.radius !== 50);
  };

  const handleClearAll = () => {
    if (onOpenListingTypeModal) onUpdateFilters({ ...filters }); // signal reset via parent
    onUpdateFilters({
      ...filters,
      category_id: [],
      subcategory_id: [],
      condition_id: [],
      quality: [],
      gender_id: [],
      age_id: [],
      size_id: [],
      color_id: [],
      min_price: null,
      max_price: null,
      radius: 100000,
    });
    // Can auto close or stay open
  };

  const handleApply = () => {
    // Current state is passed immediately from modals to SearchScreen, 
    // so simply closing this modal implicitly "applies" the current SearchScreen filter state.
    onClose();
  };

  const FilterRow = ({ label, value, onPress, isSelected }) => (
    <TouchableOpacity style={styles.filterRow} onPress={onPress}>
      {/* Left Column - Fixed Label */}
      <View style={styles.leftColumn}>
        <Text style={styles.filterLabel}>{label}</Text>
      </View>

      {/* Middle Column - Selected Value or 'All' */}
      <View style={styles.middleColumn}>
        <Text
          style={[styles.filterValue, isSelected && styles.filterValueActive]}
          numberOfLines={1}
        >
          {value || 'All'}
        </Text>
      </View>

      {/* Right Column - Arrow */}
      <View style={styles.rightColumn}>
        {/* <Text style={styles.rightLabel}>{label}</Text> */}
        <FontAwesome name="chevron-right" size={14} color="#1a1a1a" style={styles.chevron} />
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backArrow}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>FILTER</Text>
          <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
            <Text style={styles.clearText}>CLEAR</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>

            <FilterRow
              label="Listing Type"
              value={LISTING_TYPE_LABELS[listingTypeFilter] || 'All listings'}
              isSelected={listingTypeFilter && listingTypeFilter !== 'all'}
              onPress={onOpenListingTypeModal}
            />

            <FilterRow
              label="Category"
              value={getSummaryText(filters.category_id, filterOptions.categories)}
              isSelected={filters.category_id && filters.category_id.length > 0}
              onPress={onOpenCategoryModal}
            />

            <FilterRow
              label="Distance"
              value={getDistanceSummaryText()}
              isSelected={filters.radius && filters.radius < 100000}
              onPress={onOpenDistanceModal}
            />

            <FilterRow
              label="Price"
              value={getPriceSummaryText()}
              isSelected={filters.min_price || filters.max_price}
              onPress={onOpenPriceModal}
            />

            <FilterRow
              label="Condition"
              value={getSummaryText(filters.condition_id, filterOptions.conditions)}
              isSelected={filters.condition_id && filters.condition_id.length > 0}
              onPress={onOpenConditionModal}
            />

            <FilterRow
              label="Quality"
              value={getSummaryText(filters.quality, QUALITY_OPTIONS)}
              isSelected={filters.quality && filters.quality.length > 0}
              onPress={onOpenQualityModal}
            />

            <FilterRow
              label="Gender"
              value={getSummaryText(filters.gender_id, filterOptions.genders)}
              isSelected={filters.gender_id && filters.gender_id.length > 0}
              onPress={onOpenGenderModal}
            />

            <FilterRow
              label="Age"
              value={getSummaryText(filters.age_id, filterOptions.ages)}
              isSelected={filters.age_id && filters.age_id.length > 0}
              onPress={onOpenAgeModal}
            />

            <FilterRow
              label="Size"
              value={getSummaryText(filters.size_id, filterOptions.sizes, 'All', true)}
              isSelected={filters.size_id && filters.size_id.length > 0}
              onPress={onOpenSizeModal}
            />

            <FilterRow
              label="Colour"
              value={getSummaryText(filters.color_id, filterOptions.colors)}
              isSelected={filters.color_id && filters.color_id.length > 0}
              onPress={onOpenColorModal}
            />

            <FilterRow
              label="Measurement unit"
              value={filters.measurementUnit || "km"}
              isSelected={false}
              onPress={onOpenMeasurementModal}
            />

          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Show results</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backArrow: {
    fontSize: 24,
    fontWeight: '300',
    color: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  clearButton: {
    paddingVertical: 6,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
    paddingTop: 10,
  },
  section: {
    paddingHorizontal: 20,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  leftColumn: {
    flex: 2,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  middleColumn: {
    flex: 1,
    alignItems: 'flex-start',
    paddingRight: 0,
  },
  filterValue: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1a1a1a',
  },
  filterValueActive: {
    color: COLORS.blue, // Highlighting selected options in blue to match mockup
  },
  rightColumn: {
    flex: 1.2,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  rightLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1a1a1a',
    marginRight: 12,
  },
  chevron: {
    marginLeft: 4,
  },
  footer: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  applyButton: {
    height: 50,
    backgroundColor: '#f5f5f5', // Pale grey background
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a', // Black text
  },
});

export default CombinedFiltersModal;