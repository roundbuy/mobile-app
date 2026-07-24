import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const SIZING_SYSTEMS = [
  { key: 'intl', label: 'Intl' },
  { key: 'us', label: 'US' },
  { key: 'uk', label: 'UK' },
  { key: 'eu', label: 'EU' }
];

const FilterDropdown = ({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Select an option',
  disabled = false,
  isColorPicker = false,
  onInfoPress,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSystem, setActiveSystem] = useState('intl');

  const isSizeDropdown = label?.toLowerCase()?.includes('size');

  useEffect(() => {
    const loadSavedSystem = async () => {
      try {
        const saved = await AsyncStorage.getItem('@roundbuy:active_size_system');
        if (saved && ['intl', 'us', 'uk', 'eu'].includes(saved)) {
          setActiveSystem(saved);
        }
      } catch (e) {
        console.error('Error loading size system:', e);
      }
    };
    if (modalVisible && isSizeDropdown) {
      loadSavedSystem();
    }
  }, [modalVisible, isSizeDropdown]);

  const handleSystemChange = async (system) => {
    setActiveSystem(system);
    try {
      await AsyncStorage.setItem('@roundbuy:active_size_system', system);
    } catch (e) {
      console.error('Error saving size system:', e);
    }
  };

  const selectedOption = options?.find(option => option.id === value);

  const handleSelect = (option) => {
    onSelect(option.id);
    setModalVisible(false);
  };

  const getOptionLabel = (option) => {
    if (!option) return '';
    if (!isSizeDropdown) {
      return option.name;
    }
    switch (activeSystem) {
      case 'us':
        return option.us_size ? `US ${option.us_size}` : option.name;
      case 'uk':
        return option.uk_size ? `UK ${option.uk_size}` : option.name;
      case 'eu':
        return option.euro_size ? `EU ${option.euro_size}` : option.name;
      case 'intl':
      default:
        return option.intl_size ? `Intl ${option.intl_size}` : option.name;
    }
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
        <Text style={styles.optionText}>{getOptionLabel(item)}</Text>
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
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {onInfoPress && (
            <TouchableOpacity
              onPress={onInfoPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.infoBtn}
            >
              <Ionicons name="information-circle-outline" size={18} color="#505050" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.valueContainer}>
          <Text style={[styles.value, !selectedOption && styles.placeholder]}>
            {selectedOption ? getOptionLabel(selectedOption) : placeholder}
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

            {isSizeDropdown && (
              <View style={styles.tabsContainer}>
                {SIZING_SYSTEMS.map((system) => (
                  <TouchableOpacity
                    key={system.key}
                    style={[
                      styles.tabButton,
                      activeSystem === system.key && styles.activeTabButton
                    ]}
                    onPress={() => handleSystemChange(system.key)}
                  >
                    <Text style={[
                      styles.tabText,
                      activeSystem === system.key && styles.activeTabText
                    ]}>
                      {system.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    color: '#000',
    flex: 1,
  },
  infoBtn: {
    padding: 2,
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
    color: '#303234',
  },
  arrow: {
    fontSize: 12,
    color: '#505050',
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
    color: '#505050',
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
    color: '#505050',
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activeTabButton: {
    borderColor: COLORS.primary || '#1a1a1a',
    backgroundColor: COLORS.primary || '#1a1a1a',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666666',
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default FilterDropdown;