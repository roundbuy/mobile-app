import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../../constants/theme';

const ActivityFilterScreen = ({ navigation }) => {
  const [selectedActivities, setSelectedActivities] = useState({
    buy: false,
    sell: false,
    rent: false,
    wanted: false,
    service: false,
    sale: false,
    free: false,
  });

  const handleToggle = (activity) => {
    setSelectedActivities(prev => ({
      ...prev,
      [activity]: !prev[activity]
    }));
  };

  const handleShowResults = () => {
    navigation.goBack();
  };

  const ActivityOption = ({ label, value, onPress }) => (
    <TouchableOpacity style={styles.option} onPress={onPress}>
      <Text style={styles.optionText}>{label}</Text>
      <View style={styles.checkbox}>
        {value && <FontAwesome name="check" size={16} color={COLORS.primary} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeScreenContainer>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backArrow}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Activity</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsList}>
          <ActivityOption label="Buy" value={selectedActivities.buy} onPress={() => handleToggle('buy')} />
          <ActivityOption label="Sell" value={selectedActivities.sell} onPress={() => handleToggle('sell')} />
          <ActivityOption label="Rent" value={selectedActivities.rent} onPress={() => handleToggle('rent')} />
          <ActivityOption label="Wanted" value={selectedActivities.wanted} onPress={() => handleToggle('wanted')} />
          <ActivityOption label="Service" value={selectedActivities.service} onPress={() => handleToggle('service')} />
          <ActivityOption label="Sale" value={selectedActivities.sale} onPress={() => handleToggle('sale')} />
          <ActivityOption label="Free" value={selectedActivities.free} onPress={() => handleToggle('free')} />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.showResultsButton} onPress={handleShowResults}>
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
  },
  optionsList: {
    paddingHorizontal: 4,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#1a1a1a',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  showResultsButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  footerText: {
    fontSize: 10,
    color: '#8a8a8a',
    textAlign: 'center',
  },
  footerLink: {
    textDecorationLine: 'underline',
  },
});

export default ActivityFilterScreen;