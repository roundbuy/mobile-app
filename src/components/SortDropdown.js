import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const SORT_OPTIONS = [
    { label: 'Most Popular', value: 'popular', sort: 'views', order: 'DESC' },
    { label: 'Cheapest First', value: 'cheapest', sort: 'price', order: 'ASC' },
    { label: 'Most Expensive First', value: 'expensive', sort: 'price', order: 'DESC' },
    { label: 'Average Price', value: 'average', sort: 'price', order: 'ASC' },
    { label: 'Newest First', value: 'newest', sort: 'created_at', order: 'DESC' },
    { label: 'Alphabetical Order', value: 'alphabetical', sort: 'title', order: 'ASC' },
];

const SortDropdown = ({ selectedSort, onSortChange }) => {
    const [modalVisible, setModalVisible] = useState(false);

    // Find current selection
    const currentOption = SORT_OPTIONS.find(
        opt => opt.sort === selectedSort?.sort && opt.order === selectedSort?.order
    ) || SORT_OPTIONS[0];

    const handleSelect = (option) => {
        onSortChange({ sort: option.sort, order: option.order });
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
            >
                <Text style={styles.dropdownButtonText} numberOfLines={1}>
                    {currentOption.label}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Sort By</Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.optionsList}>
                            {SORT_OPTIONS.map((option) => {
                                const isSelected = option.value === currentOption.value;
                                return (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.optionItem,
                                            isSelected && styles.optionItemSelected
                                        ]}
                                        onPress={() => handleSelect(option)}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                isSelected && styles.optionTextSelected
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                        {isSelected && (
                                            <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        zIndex: 1000,
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d0d0d0',
        minWidth: 140,
        maxWidth: 180,
        gap: 6,
    },
    dropdownButtonText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1a1a1a',
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        width: '80%',
        maxHeight: '60%',
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    closeButton: {
        padding: 4,
    },
    optionsList: {
        maxHeight: 400,
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    optionItemSelected: {
        backgroundColor: '#f5f8ff',
    },
    optionText: {
        fontSize: 16,
        color: '#1a1a1a',
    },
    optionTextSelected: {
        fontWeight: '600',
        color: COLORS.primary,
    },
});

export default SortDropdown;
