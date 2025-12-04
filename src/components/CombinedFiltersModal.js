import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Switch } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const CombinedFiltersModal = ({
  visible,
  onClose,
  filters,
  onUpdateFilters,
  onOpenCategoryModal,
  onOpenDistanceModal,
  onOpenPriceModal
}) => {
  const [tempFilters, setTempFilters] = useState({
    buy: false,
    sell: false,
    wanted: false,
    service: false,
    community: false,
    giveaway: false,
  });

  useEffect(() => {
    if (visible) {
      // Initialize with current filter values
      setTempFilters({
        buy: filters.activity_id === 'buy',
        sell: filters.activity_id === 'sell',
        wanted: filters.activity_id === 'wanted',
        service: filters.activity_id === 'service',
        community: filters.activity_id === 'community',
        giveaway: filters.activity_id === 'giveaway',
      });
    }
  }, [visible, filters]);

  const handleActivityToggle = (activity) => {
    setTempFilters(prev => ({
      ...prev,
      [activity]: !prev[activity]
    }));
  };

  const handleClearAll = () => {
    setTempFilters({
      buy: false,
      sell: false,
      wanted: false,
      service: false,
      community: false,
      giveaway: false,
    });
  };

  const handleApply = () => {
    // Convert activity toggles to activity_id
    const activeActivities = Object.keys(tempFilters).filter(key => tempFilters[key]);
    const activity_id = activeActivities.length === 1 ? activeActivities[0] : null;

    onUpdateFilters({
      ...filters,
      activity_id,
    });
    onClose();
  };

  const FilterOption = ({ label, value, onToggle }) => (
    <View style={styles.filterOption}>
      <Text style={styles.filterLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#d1d1d6', true: COLORS.primary }}
        thumbColor='#ffffff'
        ios_backgroundColor="#d1d1d6"
      />
    </View>
  );

  const hasActiveFilters = () => {
    return Object.values(tempFilters).some(value => value) ||
           filters.category_id ||
           filters.min_price ||
           filters.max_price ||
           (filters.radius && filters.radius !== 50);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backArrow}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>FILTERS</Text>
          {hasActiveFilters() && (
            <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
              <Text style={styles.clearText}>Clear all</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Activity Filters */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity Type</Text>
            <View style={styles.filterList}>
              <FilterOption
                label="Buy"
                value={tempFilters.buy}
                onToggle={() => handleActivityToggle('buy')}
              />
              <FilterOption
                label="Sell"
                value={tempFilters.sell}
                onToggle={() => handleActivityToggle('sell')}
              />
              <FilterOption
                label="Wanted"
                value={tempFilters.wanted}
                onToggle={() => handleActivityToggle('wanted')}
              />
              <FilterOption
                label="Service"
                value={tempFilters.service}
                onToggle={() => handleActivityToggle('service')}
              />
              <FilterOption
                label="Community"
                value={tempFilters.community}
                onToggle={() => handleActivityToggle('community')}
              />
              <FilterOption
                label="Giveaway"
                value={tempFilters.giveaway}
                onToggle={() => handleActivityToggle('giveaway')}
              />
            </View>
          </View>

          {/* Other Filters */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Other Filters</Text>

            <TouchableOpacity
              style={styles.additionalFilter}
              onPress={() => {
                onClose();
                onOpenCategoryModal();
              }}
            >
              <View style={styles.filterInfo}>
                <Text style={styles.additionalFilterText}>Category</Text>
                {filters.category_id && (
                  <Text style={styles.filterValue}>{filters.category_id}</Text>
                )}
              </View>
              <FontAwesome name="chevron-right" size={14} color="#6a6a6a" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.additionalFilter}
              onPress={() => {
                onClose();
                onOpenDistanceModal();
              }}
            >
              <View style={styles.filterInfo}>
                <Text style={styles.additionalFilterText}>Distance</Text>
                {filters.radius && filters.radius !== 50 && (
                  <Text style={styles.filterValue}>{filters.radius} km</Text>
                )}
              </View>
              <FontAwesome name="chevron-right" size={14} color="#6a6a6a" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.additionalFilter}
              onPress={() => {
                onClose();
                onOpenPriceModal();
              }}
            >
              <View style={styles.filterInfo}>
                <Text style={styles.additionalFilterText}>Price Range</Text>
                {(filters.min_price || filters.max_price) && (
                  <Text style={styles.filterValue}>
                    ₹{filters.min_price || '0'} - {filters.max_price ? `₹${filters.max_price}` : 'No limit'}
                  </Text>
                )}
              </View>
              <FontAwesome name="chevron-right" size={14} color="#6a6a6a" />
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 24,
    fontWeight: '300',
    color: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
    letterSpacing: -0.1,
  },
  filterList: {
    marginBottom: 8,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: '#1a1a1a',
    letterSpacing: -0.1,
  },
  additionalFilter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterInfo: {
    flex: 1,
  },
  additionalFilterText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#1a1a1a',
    letterSpacing: -0.1,
  },
  filterValue: {
    fontSize: 13,
    color: COLORS.primary,
    marginTop: 2,
  },
  footer: {
    paddingTop: 16,
    paddingBottom: 34,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  applyButton: {
    height: 54,
    backgroundColor: COLORS.primary,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  applyButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
});

export default CombinedFiltersModal;