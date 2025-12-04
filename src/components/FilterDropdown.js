import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const FilterDropdown = ({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Select an option',
  disabled = false,
  isColorPicker = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options?.find(option => option.id === value);

  const handleSelect = (option) => {
    onSelect(option.id);
    setModalVisible(false);
  };

  const renderOption = ({ item }) => (
    <TouchableOpacity
      style={styles.optionItem}
      onPress={() => handleSelect(item)}
    >
      {isColorPicker ? (
        <View style={styles.colorOption}>
          <View style={[styles.colorSwatch, { backgroundColor: item.hex_code }]} />
          <Text style={styles.optionText}>{item.name}</Text>
        </View>
      ) : (
        <Text style={styles.optionText}>{item.name}</Text>
      )}
    </TouchableOpacity>
  );

  const renderSubcategoryOption = ({ item }) => (
    <TouchableOpacity
      style={styles.optionItem}
      onPress={() => handleSelect(item)}
    >
      <Text style={styles.optionText}>{item.name}</Text>
      {item.subcategories && item.subcategories.length > 0 && (
        <Text style={styles.subcategoryCount}>
          ({item.subcategories.length} subcategories)
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={[styles.container, disabled && styles.disabled]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueContainer}>
          <Text style={[styles.value, !selectedOption && styles.placeholder]}>
            {selectedOption ? selectedOption.name : placeholder}
          </Text>
          <Text style={styles.arrow}>▼</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.id.toString()}
              renderItem={label === 'Category' ? renderSubcategoryOption : renderOption}
              showsVerticalScrollIndicator={false}
              style={styles.optionsList}
            />
          </View>
        </View>
      </Modal>
    </>
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
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 15,
    color: '#000',
    marginBottom: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  value: {
    fontSize: 15,
    color: '#000',
    flex: 1,
  },
  placeholder: {
    color: '#999',
  },
  arrow: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.7,
    minHeight: height * 0.3,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 18,
    color: '#666',
  },
  optionsList: {
    paddingHorizontal: 20,
  },
  optionItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
  },
  colorOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  subcategoryCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default FilterDropdown;