import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
} from 'react-native';
import { COLORS } from '../constants/theme';

const LocationSelectionModal = ({ visible, onClose, locations, selectedLocation, onSelectLocation }) => {
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
                        <Text style={styles.modalTitle}>Select Location</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.locationsList} showsVerticalScrollIndicator={false}>
                        {locations.map((location) => (
                            <TouchableOpacity
                                key={location.id}
                                style={[
                                    styles.locationItem,
                                    selectedLocation === location.id && styles.locationItemSelected
                                ]}
                                onPress={() => {
                                    onSelectLocation(location.id);
                                    onClose();
                                }}
                            >
                                <View style={styles.locationHeader}>
                                    <Text style={[
                                        styles.locationName,
                                        selectedLocation === location.id && styles.locationNameSelected
                                    ]}>
                                        {location.name}
                                    </Text>
                                    {selectedLocation === location.id && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                </View>
                                <Text style={styles.locationAddress}>
                                    {[
                                        location.street,
                                        location.street2,
                                        location.city,
                                        location.region,
                                        location.country,
                                        location.zip_code
                                    ].filter(Boolean).join(', ')}
                                </Text>
                                {location.is_default && (
                                    <View style={styles.defaultBadge}>
                                        <Text style={styles.defaultBadgeText}>Default</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {locations.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No locations found</Text>
                            <Text style={styles.emptyStateSubtext}>Please add a location first</Text>
                        </View>
                    )}
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
        fontSize: 24,
        color: '#666',
        fontWeight: '300',
    },
    locationsList: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    locationItem: {
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
    locationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    locationName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        flex: 1,
    },
    locationNameSelected: {
        color: COLORS.primary,
    },
    checkmark: {
        fontSize: 20,
        color: COLORS.primary,
        fontWeight: '700',
    },
    locationAddress: {
        fontSize: 14,
        color: '#666',
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
    emptyState: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#999',
    },
});

export default LocationSelectionModal;
