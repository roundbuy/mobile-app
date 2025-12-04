import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, PanResponder } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS, SLIDER_CONFIG } from '../constants/theme';

const DistanceFilterModal = ({ visible, onClose, selectedRadius, onSelectRadius }) => {
  const [tempRadius, setTempRadius] = useState(selectedRadius || SLIDER_CONFIG.defaultValue);

  const SLIDER_MAX = SLIDER_CONFIG.max;
  const SLIDER_MIN = SLIDER_CONFIG.min;
  const SLIDER_DECIMAL_PRECISION = SLIDER_CONFIG.decimalPrecision;

  const sliderTrackRef = useRef(null);
  const sliderLayout = useRef({ x: 0, width: 0 });

  useEffect(() => {
    if (visible) {
      setTempRadius(selectedRadius || SLIDER_CONFIG.defaultValue);
    }
  }, [visible, selectedRadius]);

  const updateSliderValue = (pageX) => {
    const { x, width } = sliderLayout.current;
    if (width === 0) return;

    const relativeX = pageX - x;
    const percentage = Math.max(0, Math.min(100, (relativeX / width) * 100));
    const actualValue = (percentage / 100) * SLIDER_MAX;
    const roundedValue = parseFloat(actualValue.toFixed(SLIDER_DECIMAL_PRECISION));
    setTempRadius(roundedValue);
  };

  const sliderPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        updateSliderValue(evt.nativeEvent.pageX);
      },
      onPanResponderMove: (evt) => {
        updateSliderValue(evt.nativeEvent.pageX);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const handleApply = () => {
    onSelectRadius(tempRadius);
    onClose();
  };

  const handleClear = () => {
    setTempRadius(SLIDER_CONFIG.defaultValue);
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
          <Text style={styles.headerTitle}>Distance</Text>
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Distance Preview */}
            <View style={styles.mapPreview}>
              <View style={styles.mapCircle}>
                <FontAwesome name="map-marker" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.distanceText}>{tempRadius.toFixed(SLIDER_DECIMAL_PRECISION)} km</Text>
            </View>

            {/* Slider */}
            <View style={styles.sliderSection}>
              <Text style={styles.sliderLabel}>Search radius</Text>
              <View
                style={styles.sliderTrack}
                ref={sliderTrackRef}
                onLayout={(event) => {
                  const { x, width } = event.nativeEvent.layout;
                  sliderLayout.current = { x, width };
                }}
                {...sliderPanResponder.panHandlers}
              >
                <View
                  style={[
                    styles.sliderFill,
                    { width: `${(tempRadius / SLIDER_MAX) * 100}%` }
                  ]}
                />
                <View
                  style={[
                    styles.sliderThumb,
                    { left: `${(tempRadius / SLIDER_MAX) * 100}%` }
                  ]}
                />
              </View>
              <Text style={styles.sliderValue}>{tempRadius.toFixed(SLIDER_DECIMAL_PRECISION)} km</Text>
            </View>

            <Text style={styles.description}>
              Adjust the slider to set your search radius from your current location.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply</Text>
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
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  mapPreview: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 30,
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
  sliderSection: {
    marginBottom: 30,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  sliderTrack: {
    height: 5,
    backgroundColor: '#AAAAAA',
    borderRadius: 10,
    position: 'relative',
    width: '100%',
    marginBottom: 12,
  },
  sliderFill: {
    position: 'absolute',
    height: 5,
    backgroundColor: COLORS.slider,
    borderRadius: 10,
    top: 0,
    left: 0,
  },
  sliderThumb: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: '#AAAAAA',
    top: -10,
    marginLeft: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
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
  },
  applyButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default DistanceFilterModal;