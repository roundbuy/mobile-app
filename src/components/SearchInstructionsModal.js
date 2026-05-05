import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { IMAGES } from '../assets/images';
import { ACTIVITY_COLORS } from '../constants/demoCities';
import { COLORS } from '../constants/theme';

const SearchInstructionsModal = ({ visible, onClose, userLocations, selectedLocation, onLocationSelect }) => {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#000" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Instructions for Searchpage</Text>
                    </View>

                    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {/* Section 1: Default Location */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>1. Your Default Location, near your home:</Text>
                            <View style={styles.locationRow}>
                                <View style={styles.locationItem}>
                                    <Text style={styles.locationLabel}>
                                        HomeMarket: The centre-point for your searches, your address:
                                    </Text>
                                    <View style={styles.iconContainer}>
                                        <Image
                                            source={IMAGES.roundbyIcon}
                                            style={styles.centerIcon}
                                            resizeMode="contain"
                                        />
                                    </View>
                                </View>
                                <View style={styles.locationItem}>
                                    <Text style={styles.locationLabel}>
                                        Radius ring: drawn around your address, limiting the search area.
                                    </Text>
                                    <View style={styles.iconContainer}>
                                        <View style={styles.radiusCircle} />
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Section 2: Products & Services (Small) */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>2. Around you are products & services as circles:</Text>
                            <View style={styles.activityRowMedium}>
                                {Object.entries(ACTIVITY_COLORS).map(([id, activity]) => (
                                    <View key={id} style={styles.activityBadgeMedium}>
                                        <View style={[styles.activityCircleMedium, { backgroundColor: activity.color }]}>
                                            {activity.name === 'Give' ? (
                                                <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingBottom: 2 }}>
                                                    <Text style={styles.activityTextMedium}>G</Text>
                                                    <Text style={[styles.activityTextMedium, { fontSize: 11, marginLeft: -1, marginBottom: 1 }]}>i</Text>
                                                </View>
                                            ) : activity.name === 'Group' ? (
                                                <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingBottom: 2 }}>
                                                    <Text style={styles.activityTextMedium}>G</Text>
                                                    <Text style={[styles.activityTextMedium, { fontSize: 11, marginLeft: -1, marginBottom: 1 }]}>R</Text>
                                                </View>
                                            ) : (
                                                <Text style={[styles.activityTextMedium, activity.name === 'Service' && { fontSize: 13 }]}>{activity.label}</Text>
                                            )}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Section 3: Color Coded Activities (Large) */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>3. These are colour coded activities:</Text>
                            <View style={styles.activityLegend}>
                                {Object.entries(ACTIVITY_COLORS).map(([id, activity]) => (
                                    <View key={id} style={styles.legendItem}>
                                        <View style={[styles.legendBadge, { backgroundColor: activity.color }]}>
                                            <Text style={[styles.legendText, activity.name === 'Service' && { fontSize: 12 }, activity.name === 'Group' && { fontSize: 11 }]}>
                                                {activity.name === 'Group' ? 'GROUP' : activity.short}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Section 4: Choose Locations */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>4. Choose one to three product locations:</Text>
                            <View style={styles.locationNumbersContainer}>
                                {userLocations && userLocations.length > 0 ? (
                                    userLocations.map((loc, index) => {
                                        const isSelected = selectedLocation === (index + 1);
                                        return (
                                            <TouchableOpacity
                                                key={loc.id || index}
                                                style={isSelected ? styles.selectedLocationNumber : null}
                                                onPress={() => {
                                                    if (onLocationSelect) {
                                                        onLocationSelect(index + 1);
                                                    }
                                                }}
                                            >
                                                <Text style={isSelected ? styles.selectedLocationNumberText : styles.locationNumber}>
                                                    {index + 1}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })
                                ) : (
                                    <>
                                        <View style={styles.selectedLocationNumber}>
                                            <Text style={styles.selectedLocationNumberText}>1</Text>
                                        </View>
                                        <Text style={styles.locationNumber}>2</Text>
                                        <Text style={styles.locationNumber}>3</Text>
                                    </>
                                )}
                            </View>
                        </View>

                        {/* Section 5: Zoom & Slider */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>5. Use these to Zoom & change distance:</Text>
                            <View style={styles.zoomSectionContainer}>
                                <View style={styles.zoomControlsContainer}>
                                    <View>
                                        <View style={styles.zoomButtonVisual}>
                                            <Text style={styles.zoomButtonTextVisual}>+</Text>
                                        </View>
                                        <View style={[styles.zoomButtonVisual, { marginTop: 8 }]}>
                                            <View style={styles.minusTextVisual} />
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.sliderVisualContainer}>
                                    <View style={styles.sliderTrackVisual}>
                                        <View style={styles.sliderFillVisual} />
                                        <View style={styles.sliderThumbVisual} />
                                    </View>
                                    <Text style={styles.sliderDistanceText}>2.5 km</Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        width: '90%',
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 16,
    },
    closeButton: {
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 16,
        lineHeight: 22,
    },
    locationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    locationItem: {
        flex: 1,
        alignItems: 'flex-start',
    },
    locationLabel: {
        fontSize: 12,
        color: '#000',
        textAlign: 'left',
        marginBottom: 12,
        lineHeight: 16,
    },
    iconContainer: {
        width: '100%',
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerIcon: {
        width: 60,
        height: 60,
    },
    radiusCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 4,
        borderColor: '#1E6FD6',
        backgroundColor: 'transparent',
    },
    activityRowMedium: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: 6,
    },
    activityBadgeMedium: {
        marginHorizontal: 2,
    },
    activityCircleMedium: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    activityTextMedium: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    activityLegend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: 8,
    },
    legendItem: {
        marginVertical: 4,
    },
    legendBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    legendText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    locationNumbersContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 16,
        marginLeft: 8,
    },
    selectedLocationNumber: {
        borderWidth: 2,
        borderColor: '#1E6FD6',
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedLocationNumberText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E6FD6',
    },
    locationNumber: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E6FD6',
    },
    zoomSectionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingHorizontal: 16,
    },
    zoomControlsContainer: {
        alignItems: 'center',
        marginRight: 32,
    },
    zoomButtonVisual: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    zoomButtonTextVisual: {
        fontSize: 40,
        color: '#1E6FD6',
        lineHeight: 40,
        fontWeight: '300'
    },
    minusTextVisual: {
        width: 24,
        height: 4,
        backgroundColor: '#1E6FD6',
    },
    sliderVisualContainer: {
        flex: 1,
        position: 'relative',
        height: 60,
        justifyContent: 'center',
    },
    sliderTrackVisual: {
        height: 6,
        backgroundColor: '#AAAAAA',
        borderRadius: 3,
        width: '100%',
        position: 'relative',
    },
    sliderFillVisual: {
        position: 'absolute',
        height: 6,
        backgroundColor: '#505050',
        borderRadius: 3,
        width: '60%',
        left: 0,
    },
    sliderThumbVisual: {
        position: 'absolute',
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 3,
        borderColor: '#AAAAAA',
        top: -13,
        left: '55%',
    },
    sliderDistanceText: {
        position: 'absolute',
        right: 0,
        top: 0,
        fontSize: 14,
        color: '#505050',
    },
});

export default SearchInstructionsModal;
