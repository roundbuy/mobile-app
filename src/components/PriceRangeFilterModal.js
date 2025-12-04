import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { COLORS } from '../constants/theme';

const PriceRangeFilterModal = ({ visible, onClose, minPrice, maxPrice, onSelectPriceRange }) => {
  const [tempMinPrice, setTempMinPrice] = useState(minPrice || '');
  const [tempMaxPrice, setTempMaxPrice] = useState(maxPrice || '');

  useEffect(() => {
    if (visible) {
      setTempMinPrice(minPrice || '');
      setTempMaxPrice(maxPrice || '');
    }
  }, [visible, minPrice, maxPrice]);

  const handleApply = () => {
    const min = tempMinPrice ? parseFloat(tempMinPrice) : null;
    const max = tempMaxPrice ? parseFloat(tempMaxPrice) : null;

    // Validation
    if (min !== null && max !== null && min >= max) {
      Alert.alert('Invalid Range', 'Minimum price must be less than maximum price.');
      return;
    }

    if (min !== null && min < 0) {
      Alert.alert('Invalid Price', 'Minimum price cannot be negative.');
      return;
    }

    if (max !== null && max < 0) {
      Alert.alert('Invalid Price', 'Maximum price cannot be negative.');
      return;
    }

    onSelectPriceRange(min, max);
    onClose();
  };

  const handleClear = () => {
    setTempMinPrice('');
    setTempMaxPrice('');
  };

  const formatPrice = (value) => {
    if (!value) return '';
    const num = parseFloat(value);
    return isNaN(num) ? '' : num.toString();
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
          <Text style={styles.headerTitle}>Price Range</Text>
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.description}>
              Set your preferred price range to find items within your budget.
            </Text>

            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Minimum Price</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#c7c7cc"
                    value={tempMinPrice}
                    onChangeText={(text) => setTempMinPrice(formatPrice(text))}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Maximum Price</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="No limit"
                    placeholderTextColor="#c7c7cc"
                    value={tempMaxPrice}
                    onChangeText={(text) => setTempMaxPrice(formatPrice(text))}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Price Range Preview */}
            <View style={styles.rangePreview}>
              <Text style={styles.rangeText}>
                {tempMinPrice || tempMaxPrice ?
                  `₹${tempMinPrice || '0'} - ${tempMaxPrice ? `₹${tempMaxPrice}` : 'No limit'}` :
                  'No price range set'
                }
              </Text>
            </View>

            <Text style={styles.hint}>
              Leave fields empty for no minimum or maximum limit.
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
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 30,
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  rangePreview: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  rangeText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
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