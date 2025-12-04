import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../constants/theme';

const PriceRangeInput = ({ minPrice, maxPrice, onMinPriceChange, onMaxPriceChange }) => {
  const [showRange, setShowRange] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setShowRange(!showRange)}
      >
        <Text style={styles.label}>Price Range</Text>
        <Text style={styles.arrow}>{showRange ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {showRange && (
        <View style={styles.rangeContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Min Price</Text>
            <TextInput
              style={styles.input}
              value={minPrice}
              onChangeText={onMinPriceChange}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.separator}>
            <Text style={styles.separatorText}>to</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Max Price</Text>
            <TextInput
              style={styles.input}
              value={maxPrice}
              onChangeText={onMaxPriceChange}
              placeholder="No limit"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    color: '#000',
  },
  arrow: {
    fontSize: 12,
    color: '#666',
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: '#000',
  },
  separator: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  separatorText: {
    fontSize: 14,
    color: '#666',
  },
});

export default PriceRangeInput;