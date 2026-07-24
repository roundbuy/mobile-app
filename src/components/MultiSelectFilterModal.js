import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, SafeAreaView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const SIZING_SYSTEMS = [
    { key: 'intl', label: 'S/M/L' },
    { key: 'eu', label: 'EU' },
    { key: 'uk', label: 'UK' },
    { key: 'fr', label: 'FR' },
    { key: 'it', label: 'IT' },
    { key: 'us', label: 'US' },
    { key: 'jp', label: 'JP' }
];

const SUB_TABS = [
    { key: 'female', label: 'Women', genderId: 2 },
    { key: 'male', label: 'Men', genderId: 1 },
    { key: 'other', label: 'Other', genderId: 3 }
];

const MultiSelectFilterModal = ({
    visible,
    onClose,
    title,
    options,
    selectedValues, // Array of selected option IDs/values
    onApply
}) => {
    const { user } = useAuth();
    const [tempSelected, setTempSelected] = useState(selectedValues || []);
    const [activeSystem, setActiveSystem] = useState('intl');
    const [activeSubTab, setActiveSubTab] = useState('female');

    useEffect(() => {
        if (visible && title?.toLowerCase() === 'size' && options && options.length > 0) {
            const gendersInOptions = new Set(options.map(opt => opt.gender_id));
            if (gendersInOptions.has(2) && !gendersInOptions.has(1)) {
                setActiveSubTab('female');
            } else if (gendersInOptions.has(1) && !gendersInOptions.has(2)) {
                setActiveSubTab('male');
            } else if (gendersInOptions.has(3) && !gendersInOptions.has(1) && !gendersInOptions.has(2)) {
                setActiveSubTab('other');
            } else {
                setActiveSubTab('female');
            }
        }
    }, [visible, title, options]);

    useEffect(() => {
        if (visible) {
            setTempSelected(selectedValues || []);
        }
    }, [visible, selectedValues]);

    useEffect(() => {
        const loadSavedSystem = async () => {
            try {
                if (user && user.preferred_country) {
                    const countryToSystem = {
                        'USA': 'us',
                        'UK': 'uk',
                        'FR': 'fr',
                        'IT': 'it',
                        'JP': 'jp',
                        'International': 'intl'
                    };
                    const system = countryToSystem[user.preferred_country];
                    if (system) {
                        setActiveSystem(system);
                        return;
                    }
                }

                const saved = await AsyncStorage.getItem('@roundbuy:active_size_system');
                if (saved && ['intl', 'us', 'uk', 'fr', 'it', 'jp', 'eu'].includes(saved)) {
                    setActiveSystem(saved);
                }
            } catch (e) {
                console.error('Error loading size system:', e);
            }
        };
        if (visible && title?.toLowerCase() === 'size') {
            loadSavedSystem();
        }
    }, [visible, title, user]);

    const handleSystemChange = async (system) => {
        setActiveSystem(system);
        try {
            await AsyncStorage.setItem('@roundbuy:active_size_system', system);
        } catch (e) {
            console.error('Error saving size system:', e);
        }
    };

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
        onClose();
    };

    const handleClear = () => {
        setTempSelected([]);
    };

    const getOptionLabel = (option) => {
        if (title?.toLowerCase() !== 'size') {
            return option.label || option.name;
        }
        
        switch (activeSystem) {
            case 'us':
                return option.us_size || option.intl_size || option.name;
            case 'uk':
                return option.uk_size || option.intl_size || option.name;
            case 'fr':
                return option.fr_size || option.intl_size || option.name;
            case 'it':
                return option.it_size || option.intl_size || option.name;
            case 'jp':
                return option.jp_size || option.intl_size || option.name;
            case 'eu':
                return option.euro_size || option.intl_size || option.name;
            case 'intl':
            default:
                return option.intl_size || option.name;
        }
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
                </View>

                <View style={styles.optionsListHeader}>
                    <Text style={styles.optionsListTitle}>{title.toUpperCase()}</Text>
                    <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                        <Text style={styles.clearText}>CLEAR</Text>
                    </TouchableOpacity>
                </View>

                {title?.toLowerCase() === 'size' && (
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

                {title?.toLowerCase() === 'size' && (
                    <View style={styles.subTabsContainer}>
                        {SUB_TABS.map((subTab) => (
                            <TouchableOpacity
                                key={subTab.key}
                                style={[
                                    styles.subTabButton,
                                    activeSubTab === subTab.key && styles.activeSubTabButton
                                ]}
                                onPress={() => setActiveSubTab(subTab.key)}
                            >
                                <Text style={[
                                    styles.subTabText,
                                    activeSubTab === subTab.key && styles.activeSubTabText
                                ]}>
                                    {subTab.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.optionsList}>
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

                        {(() => {
                            if (title?.toLowerCase() !== 'size') return options;
                            
                            const getVal = (opt) => {
                                switch (activeSystem) {
                                    case 'us': return opt.us_size;
                                    case 'uk': return opt.uk_size;
                                    case 'fr': return opt.fr_size;
                                    case 'it': return opt.it_size;
                                    case 'jp': return opt.jp_size;
                                    case 'eu': return opt.euro_size;
                                    case 'intl':
                                    default:
                                        return opt.intl_size;
                                }
                            };

                            const seen = new Set();
                            const targetGenderId = SUB_TABS.find(t => t.key === activeSubTab)?.genderId || 2;

                            return options.filter(opt => {
                                const val = getVal(opt);
                                if (val === null || val === undefined || val === '') return false;
                                
                                // Filter size by active gender category sub-tab
                                if (opt.gender_id !== undefined && opt.gender_id !== null && opt.gender_id !== targetGenderId) {
                                    return false;
                                }

                                if (seen.has(val)) return false;
                                seen.add(val);
                                return true;
                            });
                        })().map((option) => (
                            <TouchableOpacity
                                key={option.id || option.value}
                                style={styles.option}
                                onPress={() => handleToggle(option.id || option.value)}
                            >
                                <Text style={styles.optionText}>{getOptionLabel(option)}</Text>
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
    subTabsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 10,
        backgroundColor: '#fbfbfb',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    subTabButton: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#e8e8e8',
        marginHorizontal: 6,
    },
    activeSubTabButton: {
        backgroundColor: '#1a1a1a',
    },
    subTabText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#606060',
    },
    activeSubTabText: {
        color: '#ffffff',
        fontWeight: '600',
    },
});

export default MultiSelectFilterModal;
