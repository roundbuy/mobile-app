import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, SafeAreaView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const MultiSelectFilterModal = ({
    visible,
    onClose,
    title,
    options,
    selectedValues, // Array of selected option IDs/values
    onApply
}) => {
    const [tempSelected, setTempSelected] = useState(selectedValues || []);

    useEffect(() => {
        if (visible) {
            setTempSelected(selectedValues || []);
        }
    }, [visible, selectedValues]);

    const handleToggle = (value) => {
        setTempSelected(prev => {
            if (prev.includes(value)) {
                return prev.filter(item => item !== value);
            } else {
                return [...prev, value];
            }
        });
    };

    const handleApply = () => {
        onApply(tempSelected);
        // Modal closure depends on logic in parent component, typically we don't close until Show Results on the MAIN layout
        // But since this replaces individual category popups, "Show results" usually applies it.
        onClose();
    };

    const handleClear = () => {
        setTempSelected([]);
    };

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
                    {/* <Text style={styles.headerTitle}>{title.toUpperCase()}</Text>
                    <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                        <Text style={styles.clearText}>CLEAR</Text>
                    </TouchableOpacity> */}
                </View>

                <View style={styles.optionsListHeader}>
                    <Text style={styles.optionsListTitle}>{title.toUpperCase()}</Text>
                    <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                        <Text style={styles.clearText}>CLEAR</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.optionsList}>
                        {/* Added the All default option acting as a clear function */}
                        <TouchableOpacity
                            style={styles.option}
                            onPress={handleClear}
                        >
                            <Text style={styles.optionText}>All</Text>
                            <View style={[styles.checkbox, tempSelected.length === 0 && styles.checkboxActive]}>
                                {tempSelected.length === 0 && (
                                    <Text style={styles.checkboxIcon}>X</Text>
                                )}
                            </View>
                        </TouchableOpacity>

                        {options.map((option) => (
                            <TouchableOpacity
                                key={option.id || option.value}
                                style={styles.option}
                                onPress={() => handleToggle(option.id || option.value)}
                            >
                                <Text style={styles.optionText}>{option.label}</Text>
                                <View style={[styles.checkbox, tempSelected.includes(option.id || option.value) && styles.checkboxActive]}>
                                    {tempSelected.includes(option.id || option.value) && (
                                        <Text style={styles.checkboxIcon}>X</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                        <Text style={styles.applyButtonText}>Show results</Text>
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
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'flex-start',
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
        paddingTop: 10,
    },
    optionsListHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    optionsListTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    optionsList: {
        paddingHorizontal: 20,
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    optionText: {
        fontSize: 15,
        fontWeight: '400',
        color: '#1a1a1a',
    },
    checkbox: {
        width: 22,
        height: 22,
        borderWidth: 1,
        borderColor: '#1a1a1a',
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        borderColor: '#1a1a1a',
        backgroundColor: '#ffffff',
    },
    checkboxIcon: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
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
        backgroundColor: '#f5f5f5', // Pale grey background per design
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a', // Black text per design
    },
});

export default MultiSelectFilterModal;
