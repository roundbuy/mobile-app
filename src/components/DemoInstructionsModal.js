import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IMAGES } from '../assets/images';
import { DEMO_CITIES, ACTIVITY_COLORS } from '../constants/demoCities';

const DemoInstructionsModal = ({ visible, onClose, onCitySelect }) => {
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
                        <Text style={styles.headerTitle}>Instructions for Demo</Text>
                    </View>

                    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {/* Section 1: Default Location */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>1. Your Default Location, near your home:</Text>
                            <View style={styles.locationRow}>
                                <View style={styles.locationItem}>
                                    <Text style={styles.locationLabel}>
                                        HomeMarket: The centre point for your searches, your address:
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
                                        Radius ring: drawn around your address, limiting the search area:
                                    </Text>
                                    <View style={styles.iconContainer}>
                                        <View style={styles.radiusCircle} />
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Section 2: Products & Services */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>2. Around you are products & services as circles:</Text>
                            <View style={styles.activityRow}>
                                {Object.entries(ACTIVITY_COLORS).map(([id, activity]) => (
                                    <View key={id} style={styles.activityBadge}>
                                        <View style={[styles.activityCircle, { backgroundColor: activity.color }]}>
                                            <Text style={styles.activityText}>{activity.label}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Section 3: Color Coded Activities */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>3. These are colour coded activities:</Text>
                            <View style={styles.activityLegend}>
                                {Object.entries(ACTIVITY_COLORS).map(([id, activity]) => (
                                    <View key={id} style={styles.legendItem}>
                                        <View style={[styles.legendBadge, { backgroundColor: activity.color }]}>
                                            <Text style={styles.legendText}>{activity.short}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Section 4: Choose Test City */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>4. Choose a test city with a test location:</Text>
                            <View style={styles.citiesGrid}>
                                {DEMO_CITIES.map((city, index) => (
                                    <TouchableOpacity
                                        key={city.id}
                                        style={styles.cityButton}
                                        onPress={() => {
                                            onCitySelect(city);
                                            onClose();
                                        }}
                                    >
                                        <Text style={styles.cityLocation}>{city.location}</Text>
                                        <Text style={styles.cityName}>{city.name}</Text>
                                    </TouchableOpacity>
                                ))}
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
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        width: '95%',
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
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    closeButton: {
        padding: 4,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
        marginBottom: 12,
        lineHeight: 18,
    },
    locationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    locationItem: {
        flex: 1,
        alignItems: 'center',
    },
    locationLabel: {
        fontSize: 10,
        color: '#000',
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 14,
    },
    iconContainer: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerIcon: {
        width: 50,
        height: 50,
    },
    radiusCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 3,
        borderColor: '#FF0000',
        backgroundColor: 'transparent',
    },
    activityRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 2,
    },
    activityBadge: {
        marginHorizontal: 2,
    },
    activityCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    activityText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    activityLegend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 2,
    },
    legendItem: {
        marginHorizontal: 2,
        marginVertical: 2,
    },
    legendBadge: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    legendText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    citiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    cityButton: {
        width: '47%',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    cityLocation: {
        fontSize: 11,
        color: '#666',
        marginBottom: 4,
    },
    cityName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E6FD6',
    },
});

export default DemoInstructionsModal;
