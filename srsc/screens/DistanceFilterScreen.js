import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import SafeScreenContainer from '../components/SafeScreenContainer';
import { COLORS } from '../constants/theme';

const DistanceFilterScreen = ({ navigation }) => {
  const [selectedDistance, setSelectedDistance] = useState('unlimited');

  const distances = [
    { label: 'Unlimited - distance is displayed in each product', value: 'unlimited' },
    { label: '100 km', value: '100' },
    { label: '50k', value: '50' },
    { label: '25k', value: '25' },
    { label: '10k', value: '10' },
    { label: '3km', value: '3' },
    { label: '800 m', value: '0.8' },
  ];

  const handleShowResults = () => {
    navigation.goBack();
  };

  return (
    <SafeScreenContainer>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backArrow}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Distance from you + unlimited</Text>
        </View>

        {/* Distance Map Preview */}
        <View style={styles.mapPreview}>
          <View style={styles.mapCircle}>
            <FontAwesome name="map-marker" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.distanceText}>100 km</Text>
        </View>

        {/* Distance Options */}
        <View style={styles.optionsList}>
          {distances.map((distance) => (
            <TouchableOpacity
              key={distance.value}
              style={styles.option}
              onPress={() => setSelectedDistance(distance.value)}
            >
              <Text style={styles.optionText}>{distance.label}</Text>
              <View style={styles.checkbox}>
                {selectedDistance === distance.value && <FontAwesome name="check" size={16} color={COLORS.primary} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.useText}>Use</Text>
      </ScrollView>

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
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 16,
  },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  backArrow: { fontSize: 24, fontWeight: '300', color: '#1a1a1a' },
  headerTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginLeft: 8, flex: 1 },
  mapPreview: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },
  mapCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  optionsList: { paddingHorizontal: 4 },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: { fontSize: 13, fontWeight: '400', color: '#1a1a1a', flex: 1 },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  useText: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 16,
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
  showResultsButtonText: { fontSize: 18, fontWeight: '600', color: '#ffffff' },
  footerText: { fontSize: 10, color: '#8a8a8a', textAlign: 'center' },
  footerLink: { textDecorationLine: 'underline' },
});

export default DistanceFilterScreen;