import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
} from 'react-native';
import { COLORS } from '../constants/theme';

const LocationSelectionModal = ({ visible, onClose, locations, selectedLocations, onSelectLocations }) => {
    // Local state to manage selections before confirming
    const [tempSelectedLocations, setTempSelectedLocations] = useState([]);

    // Initialize temp state when modal opens or props change
    useEffect(() => {
        if (visible) {
            setTempSelectedLocations(selectedLocations || []);
        }
    }, [visible, selectedLocations]);

    const toggleLocation = (locationId) => {
        setTempSelectedLocations(prev => {
            if (prev.includes(locationId)) {
                return prev.filter(id => id !== locationId);
            } else {
                return [...prev, locationId];
            }
        });
    };

    const handleConfirm = () => {
        onSelectLocations(tempSelectedLocations);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Locations</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeButton}>X</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.locationsList} showsVerticalScrollIndicator={false}>
                        {locations.map((location) => {
                            const isSelected = tempSelectedLocations.includes(location.id);
                            const addressParts = [
                                location.street,
                                location.street2,
                                location.city,
                                location.region,
                                location.country,
                                location.zip_code
                            ].filter(Boolean).join(', ');

                            return (
                                <TouchableOpacity
                                    key={location.id}
                                    style={[
                                        styles.locationItem,
                                        isSelected && styles.locationItemSelected
                                    ]}
                                    onPress={() => toggleLocation(location.id)}
                                >
                                    <View style={styles.locationInfoContainer}>
                                        <View style={styles.locationHeader}>
                                            <Text style={[
                                                styles.locationName,
                                                isSelected && styles.locationNameSelected
                                            ]}>
                                                {location.name}
                                            </Text>
                                        </View>
                                        <Text style={styles.locationAddress}>
                                            {addressParts}
                                        </Text>
                                        {location.is_default ? (
                                            <View style={styles.defaultBadge}>
                                                <Text style={styles.defaultBadgeText}>Default</Text>
                                            </View>
                                        ) : null}
                                    </View>

                                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                        {isSelected ? <Text style={styles.checkmark}>✓</Text> : null}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {locations.length > 0 ? (
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[styles.confirmButton, tempSelectedLocations.length === 0 && styles.disabledButton]}
                                onPress={handleConfirm}
                                disabled={tempSelectedLocations.length === 0}
                            >
                                <Text style={styles.confirmButtonText}>
                                    Confirm ({tempSelectedLocations.length})
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    {locations.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No locations found</Text>
                            <Text style={styles.emptyStateSubtext}>Please add a location first</Text>
                        </View>
                    ) : null}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
        paddingBottom: 20,
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
        fontWeight: '700',
        color: '#000',
    },
    closeButton: {
        fontSize: 18,
        color: '#505050',
        fontWeight: '700',
        padding: 4,
    },
    locationsList: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    locationItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    locationItemSelected: {
        borderColor: COLORS.primary,
        backgroundColor: '#F0F8FF',
    },
    locationInfoContainer: {
        flex: 1,
        marginRight: 10,
    },
    locationHeader: {
        marginBottom: 4,
    },
    locationName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    locationNameSelected: {
        color: COLORS.primary,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#C0C0C0',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    checkboxSelected: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary,
        borderWidth: 0,
    },
    checkmark: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    locationAddress: {
        fontSize: 14,
        color: '#505050',
        lineHeight: 20,
    },
    defaultBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    defaultBadgeText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    footer: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    confirmButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#CCC',
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyState: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#505050',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#303234',
    },
});

export default LocationSelectionModal;
