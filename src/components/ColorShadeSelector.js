import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import apiClient from '../services/api';

const ColorShadeSelector = ({ selectedShadeId, onSelect, style }) => {
    const [colors, setColors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedShade, setSelectedShade] = useState(null);

    useEffect(() => {
        fetchColors();
    }, []);

    useEffect(() => {
        if (selectedShadeId && colors.length > 0) {
            // Find the selected shade in colors
            for (const color of colors) {
                const shade = color.shades.find(s => s.id === selectedShadeId);
                if (shade) {
                    setSelectedColor(color);
                    setSelectedShade(shade);
                    break;
                }
            }
        }
    }, [selectedShadeId, colors]);

    const fetchColors = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/mobile-app/colors');
            if (response.data.success) {
                setColors(response.data.data.colors);
            }
        } catch (error) {
            console.error('Error fetching colors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleColorSelect = (color) => {
        setSelectedColor(color);
        // Auto-select medium shade by default
        const mediumShade = color.shades.find(s => s.shade === 'medium');
        if (mediumShade) {
            handleShadeSelect(color, mediumShade);
        }
    };

    const handleShadeSelect = (color, shade) => {
        setSelectedColor(color);
        setSelectedShade(shade);
        onSelect(shade.id, shade.displayName, shade.hexCode);
        setModalVisible(false);
    };

    const getDisplayText = () => {
        if (selectedShade) {
            return selectedShade.displayName;
        }
        return 'Select Color';
    };

    if (loading) {
        return (
            <View style={[styles.container, style]}>
                <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <>
            <TouchableOpacity
                style={[styles.selector, style]}
                onPress={() => setModalVisible(true)}
            >
                <View style={styles.selectorContent}>
                    {selectedShade && (
                        <View
                            style={[
                                styles.colorBox,
                                { backgroundColor: selectedShade.hexCode }
                            ]}
                        />
                    )}
                    <Text style={styles.selectorText}>{getDisplayText()}</Text>
                </View>
                <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Color</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                            {colors.map((color) => (
                                <View key={color.id} style={styles.colorGroup}>
                                    <Text style={styles.colorName}>{color.name}</Text>
                                    <View style={styles.shadesContainer}>
                                        {color.shades.map((shade) => (
                                            <TouchableOpacity
                                                key={shade.id}
                                                style={[
                                                    styles.shadeButton,
                                                    selectedShade?.id === shade.id && styles.shadeButtonSelected
                                                ]}
                                                onPress={() => handleShadeSelect(color, shade)}
                                            >
                                                <View
                                                    style={[
                                                        styles.shadeColorBox,
                                                        { backgroundColor: shade.hexCode }
                                                    ]}
                                                />
                                                <Text style={styles.shadeText}>{shade.shade}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 12,
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    selectorContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    colorBox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectorText: {
        fontSize: 15,
        color: '#333',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    modalContent: {
        padding: 20,
    },
    colorGroup: {
        marginBottom: 24,
    },
    colorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 12,
    },
    shadesContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    shadeButton: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    shadeButtonSelected: {
        borderColor: COLORS.primary,
        backgroundColor: `${COLORS.primary}10`,
    },
    shadeColorBox: {
        width: 40,
        height: 40,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    shadeText: {
        fontSize: 12,
        color: '#666',
        textTransform: 'capitalize',
    },
});

export default ColorShadeSelector;
