import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, PanResponder } from 'react-native';
import { COLORS } from '../constants/theme';

const PriceRangeFilterModal = ({ visible, onClose, minPrice, maxPrice, onSelectPriceRange }) => {
  const MAX_PRICE = 100000; // Maximum price limit (₹1,00,000)
  const MIN_PRICE = 0;

  const [tempMinPrice, setTempMinPrice] = useState(minPrice || MIN_PRICE);
  const [tempMaxPrice, setTempMaxPrice] = useState(maxPrice || MAX_PRICE);

  const sliderLayout = useRef({ x: 0, width: 0 });
  const sliderTrackRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setTempMinPrice(minPrice || MIN_PRICE);
      setTempMaxPrice(maxPrice || MAX_PRICE);
    }
  }, [visible, minPrice, maxPrice]);

  const handleApply = () => {
    const min = tempMinPrice === MIN_PRICE ? null : tempMinPrice;
    const max = tempMaxPrice === MAX_PRICE ? null : tempMaxPrice;

    onSelectPriceRange(min, max);
    onClose();
  };

  const handleClear = () => {
    setTempMinPrice(MIN_PRICE);
    setTempMaxPrice(MAX_PRICE);
  };

  const formatPrice = (value) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    return `₹${value}`;
  };

  // Update slider value based on touch position
  const updateSliderValue = (pageX, isMin) => {
    const { x, width } = sliderLayout.current;
    if (width === 0) return;

    const relativeX = pageX - x;
    const percentage = Math.max(0, Math.min(100, (relativeX / width) * 100));
    const value = Math.round((percentage / 100) * MAX_PRICE);

    if (isMin) {
      // Update min price, but don't exceed max price
      const newMin = Math.min(value, tempMaxPrice - 100);
      setTempMinPrice(Math.max(MIN_PRICE, newMin));
    } else {
      // Update max price, but don't go below min price
      const newMax = Math.max(value, tempMinPrice + 100);
      setTempMaxPrice(Math.min(MAX_PRICE, newMax));
    }
  };

  // Pan responder for min handle
  const minPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        updateSliderValue(evt.nativeEvent.pageX, true);
      },
      onPanResponderMove: (evt) => {
        updateSliderValue(evt.nativeEvent.pageX, true);
      },
      onPanResponderRelease: () => { },
    })
  ).current;

  // Pan responder for max handle
  const maxPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        updateSliderValue(evt.nativeEvent.pageX, false);
      },
      onPanResponderMove: (evt) => {
        updateSliderValue(evt.nativeEvent.pageX, false);
      },
      onPanResponderRelease: () => { },
    })
  ).current;

  const minPercentage = (tempMinPrice / MAX_PRICE) * 100;
  const maxPercentage = (tempMaxPrice / MAX_PRICE) * 100;

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
          <Text style={styles.headerTitle}>Price Range</Text>
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.description}>
              Drag the handles to set your preferred price range.
            </Text>

            {/* Price Range Display */}
            <View style={styles.rangePreview}>
              <Text style={styles.rangeText}>
                {formatPrice(tempMinPrice)} - {formatPrice(tempMaxPrice)}
              </Text>
            </View>

            {/* Dual Handle Slider */}
            <View style={styles.sliderContainer}>
              <View
                style={styles.sliderTrack}
                ref={sliderTrackRef}
                onLayout={(event) => {
                  const { x, width } = event.nativeEvent.layout;
                  sliderLayout.current = { x, width };
                }}
              >
                {/* Background track */}
                <View style={styles.sliderTrackBackground} />

                {/* Active range fill */}
                <View
                  style={[
                    styles.sliderFill,
                    {
                      left: `${minPercentage}%`,
                      width: `${maxPercentage - minPercentage}%`,
                    },
                  ]}
                />

                {/* Min handle */}
                <View
                  style={[styles.sliderThumb, { left: `${minPercentage}%` }]}
                  {...minPanResponder.panHandlers}
                >
                  <View style={styles.thumbInner} />
                </View>

                {/* Max handle */}
                <View
                  style={[styles.sliderThumb, { left: `${maxPercentage}%` }]}
                  {...maxPanResponder.panHandlers}
                >
                  <View style={styles.thumbInner} />
                </View>
              </View>

              {/* Labels */}
              <View style={styles.labelsContainer}>
                <Text style={styles.labelText}>₹0</Text>
                <Text style={styles.labelText}>₹1L</Text>
              </View>
            </View>

            <Text style={styles.hint}>
              Drag the handles to adjust minimum and maximum price limits.
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
  description: {
    fontSize: 16,
    color: '#303234',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  rangePreview: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  rangeText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.primary,
  },
  sliderContainer: {
    marginBottom: 40,
  },
  sliderTrack: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderTrackBackground: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  sliderFill: {
    position: 'absolute',
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    width: 28,
    height: 28,
    marginLeft: -14,
    marginTop: -12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  labelText: {
    fontSize: 12,
    color: '#888888',
  },
  hint: {
    fontSize: 14,
    color: '#888888',
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

export default PriceRangeFilterModal;