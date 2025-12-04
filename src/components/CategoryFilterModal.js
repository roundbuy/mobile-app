import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const CategoryFilterModal = ({ visible, onClose, selectedCategory, onSelectCategory }) => {
  const [tempSelectedCategory, setTempSelectedCategory] = useState(selectedCategory);

  const categories = [
    'All', 'Art', 'Vehicles', 'Hobbies',
    'Kids & baby products', 'Electronics', 'Housing',
    'Fashion', 'Film/Cinema', 'Music',
    'New/Local', 'Pets', 'Sport & Leisure'
  ];

  useEffect(() => {
    if (visible) {
      setTempSelectedCategory(selectedCategory);
    }
  }, [visible, selectedCategory]);

  const handleApply = () => {
    onSelectCategory(tempSelectedCategory);
    onClose();
  };

  const handleClear = () => {
    setTempSelectedCategory(null);
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
          <Text style={styles.headerTitle}>Category</Text>
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.optionsList}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={styles.option}
                onPress={() => setTempSelectedCategory(category === 'All' ? null : category)}
              >
                <Text style={styles.optionText}>{category}</Text>
                <View style={styles.checkbox}>
                  {tempSelectedCategory === (category === 'All' ? null : category) && (
                    <FontAwesome name="check" size={16} color={COLORS.primary} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
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
  optionsList: {
    paddingHorizontal: 20,
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

export default CategoryFilterModal;