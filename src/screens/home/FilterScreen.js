import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../../constants/theme';

const FilterScreen = ({ navigation }) => {
  const [selectedFilters, setSelectedFilters] = useState({
    buy: false,
    sell: false,
    wanted: false,
    service: false,
    community: false,
    giveaway: false,
  });

  const handleFilterToggle = (filter) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  const handleShowResults = () => {
    navigation.goBack();
  };

  const handleClearAll = () => {
    setSelectedFilters({
      buy: false,
      sell: false,
      wanted: false,
      service: false,
      community: false,
      giveaway: false,
    });
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

  return (
    <SafeScreenContainer>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>FILTERS menu</Text>
        </View>

        {/* Clear All */}
        <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear all</Text>
        </TouchableOpacity>

        {/* Filter Options */}
        <View style={styles.filterList}>
          <FilterOption label="Buy" value={selectedFilters.buy} onToggle={() => handleFilterToggle('buy')} />
          <FilterOption label="Sell" value={selectedFilters.sell} onToggle={() => handleFilterToggle('sell')} />
          <FilterOption label="Wanted" value={selectedFilters.wanted} onToggle={() => handleFilterToggle('wanted')} />
          <FilterOption label="Service" value={selectedFilters.service} onToggle={() => handleFilterToggle('service')} />
          <FilterOption label="Community" value={selectedFilters.community} onToggle={() => handleFilterToggle('community')} />
          <FilterOption label="Giveaway" value={selectedFilters.giveaway} onToggle={() => handleFilterToggle('giveaway')} />
        </View>

        {/* Additional Filter Options */}
        <TouchableOpacity 
          style={styles.additionalFilter}
          onPress={() => navigation.navigate('ActivityFilter')}
        >
          <Text style={styles.additionalFilterText}>Activity</Text>
          <FontAwesome name="chevron-right" size={14} color="#6a6a6a" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.additionalFilter}
          onPress={() => navigation.navigate('CategoryFilter')}
        >
          <Text style={styles.additionalFilterText}>Category</Text>
          <FontAwesome name="chevron-right" size={14} color="#6a6a6a" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.additionalFilter}
          onPress={() => navigation.navigate('DistanceFilter')}
        >
          <Text style={styles.additionalFilterText}>Distance</Text>
          <FontAwesome name="chevron-right" size={14} color="#6a6a6a" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.additionalFilter}
          onPress={() => navigation.navigate('PriceFilter')}
        >
          <Text style={styles.additionalFilterText}>Price</Text>
          <FontAwesome name="chevron-right" size={14} color="#6a6a6a" />
        </TouchableOpacity>
      </ScrollView>

      {/* Show Results Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.showResultsButton}
          onPress={handleShowResults}
        >
          <Text style={styles.showResultsButtonText}>Show results</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>
          <Text style={styles.footerLink}>Terms of service</Text>
        </Text>
      </View>
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 16,
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
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  clearButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  filterList: {
    marginBottom: 24,
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
  additionalFilterText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#1a1a1a',
    letterSpacing: -0.1,
  },
  footer: {
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  showResultsButton: {
    height: 54,
    backgroundColor: COLORS.primary,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  showResultsButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  footerText: {
    fontSize: 10,
    fontWeight: '400',
    color: '#8a8a8a',
    textAlign: 'center',
  },
  footerLink: {
    textDecorationLine: 'underline',
  },
});

export default FilterScreen;