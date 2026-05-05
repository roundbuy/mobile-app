import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, PanResponder, SafeAreaView } from 'react-native';
import { COLORS } from '../constants/theme';

const PriceRangeFilterModal = ({ visible, onClose, minPrice, maxPrice, onSelectPriceRange }) => {
  const MAX_PRICE = 1000; // Maximum price limit (₹1,00,000)
  const MIN_PRICE = 10;

  // Safely clamp incoming values so old cached filters (e.g. 17521) don't blow past the new 1000 limit
  const safeMin = Math.min(Math.max(minPrice || MIN_PRICE, MIN_PRICE), MAX_PRICE);
  const safeMax = Math.min(Math.max(maxPrice || MAX_PRICE, MIN_PRICE), MAX_PRICE);

  const [tempMinPrice, setTempMinPrice] = useState(safeMin);
  const [tempMaxPrice, setTempMaxPrice] = useState(safeMax);

  // Refs for PanResponders to read the absolute latest state avoiding closure staleness
  const currentMinPrice = useRef(safeMin);
  const currentMaxPrice = useRef(safeMax);
  const sliderLayout = useRef({ x: 0, width: 0 });
  const sliderTrackRef = useRef(null);

  // Starting values at the moment a touch drag begins
  const initialDragMin = useRef(safeMin);
  const initialDragMax = useRef(safeMax);

  // Sync refs with state
  useEffect(() => {
    currentMinPrice.current = tempMinPrice;
    currentMaxPrice.current = tempMaxPrice;
  }, [tempMinPrice, tempMaxPrice]);

  useEffect(() => {
    if (visible) {
      const effectSafeMin = Math.min(Math.max(minPrice || MIN_PRICE, MIN_PRICE), MAX_PRICE);
      const effectSafeMax = Math.min(Math.max(maxPrice || MAX_PRICE, MIN_PRICE), MAX_PRICE);
      setTempMinPrice(effectSafeMin);
      setTempMaxPrice(effectSafeMax);
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
    if (value >= 1000) {
      return `£${(value / 1000).toFixed(1)}K`;
    }
    return `£${value}`;
  };

  // Pan responder for min handle using robust relative delta tracking (dx)
  const minPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        initialDragMin.current = currentMinPrice.current;
      },
      onPanResponderMove: (evt, gestureState) => {
        const { width } = sliderLayout.current;
        if (width === 0) return;
        const priceRangeScale = MAX_PRICE - MIN_PRICE;
        const rawNewValue = initialDragMin.current + (gestureState.dx / width) * priceRangeScale;

        // Clamp: not below MIN_PRICE, not above currentMaxPrice - small gap (10)
        const newMinClamp = Math.max(MIN_PRICE, Math.min(rawNewValue, currentMaxPrice.current - 10));
        setTempMinPrice(Math.round(newMinClamp));
      },
      onPanResponderRelease: () => { },
    })
  ).current;

  // Pan responder for max handle
  const maxPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        initialDragMax.current = currentMaxPrice.current;
      },
      onPanResponderMove: (evt, gestureState) => {
        const { width } = sliderLayout.current;
        if (width === 0) return;
        const priceRangeScale = MAX_PRICE - MIN_PRICE;
        const rawNewValue = initialDragMax.current + (gestureState.dx / width) * priceRangeScale;

        // Clamp: not above MAX_PRICE, not below currentMinPrice + small gap (10)
        const newMaxClamp = Math.min(MAX_PRICE, Math.max(rawNewValue, currentMinPrice.current + 10));
        setTempMaxPrice(Math.round(newMaxClamp));
      },
      onPanResponderRelease: () => { },
    })
  ).current;

  const priceRangeAmount = MAX_PRICE - MIN_PRICE;
  // Guard against divide by zero or negative percentages
  const safeRangeAmount = priceRangeAmount > 0 ? priceRangeAmount : 1;
  const minPercentage = Math.max(0, Math.min(100, ((tempMinPrice - MIN_PRICE) / safeRangeAmount) * 100));
  const maxPercentage = Math.max(0, Math.min(100, ((tempMaxPrice - MIN_PRICE) / safeRangeAmount) * 100));

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
          <Text style={styles.headerTitle}>PRICE</Text>
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearText}>CLEAR</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Price Range Display */}
            <View style={styles.rangePreview}>
              <Text style={styles.rangeLabel}>Price range</Text>
              <Text style={styles.rangeText}>
                £{tempMinPrice} - £{tempMaxPrice >= MAX_PRICE ? `${MAX_PRICE}+` : tempMaxPrice}
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
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Use</Text>
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
    marginBottom: 20,
  },
  rangeLabel: {
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 8,
    fontWeight: '400',
  },
  rangeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
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
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  applyButton: {
    height: 50,
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});

export default PriceRangeFilterModal;