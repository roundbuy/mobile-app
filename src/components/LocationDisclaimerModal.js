import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const LocationDisclaimerModal = ({ visible, onClose }) => {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Location Disclaimer</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#1a1a1a" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={true}>
                        <Text style={styles.disclaimerText}>
                            <Text style={styles.boldText}>Important Information About Locations</Text>
                        </Text>

                        <Text style={styles.disclaimerText}>
                            The locations displayed on the map are approximate and may not reflect the exact position of items or users. Location data is provided for general reference purposes only.
                        </Text>

                        <Text style={styles.disclaimerText}>
                            <Text style={styles.boldText}>Privacy & Accuracy:</Text>
                        </Text>

                        <Text style={styles.bulletPoint}>
                            • User locations are approximated to protect privacy and security
                        </Text>
                        <Text style={styles.bulletPoint}>
                            • Actual item locations may vary from what is shown on the map
                        </Text>
                        <Text style={styles.bulletPoint}>
                            • Distance calculations are estimates based on approximate coordinates
                        </Text>
                        <Text style={styles.bulletPoint}>
                            • Always verify exact meeting locations directly with the seller/buyer
                        </Text>

                        <Text style={styles.disclaimerText}>
                            <Text style={styles.boldText}>Map Data:</Text>
                        </Text>

                        <Text style={styles.bulletPoint}>
                            • Map data is provided by Google Maps and is subject to their terms of service
                        </Text>
                        <Text style={styles.bulletPoint}>
                            • We are not responsible for inaccuracies in third-party map data
                        </Text>
                        <Text style={styles.bulletPoint}>
                            • Map features and availability may vary by region
                        </Text>

                        <Text style={styles.disclaimerText}>
                            <Text style={styles.boldText}>Safety Recommendations:</Text>
                        </Text>

                        <Text style={styles.bulletPoint}>
                            • Always meet in public, well-lit areas
                        </Text>
                        <Text style={styles.bulletPoint}>
                            • Verify the exact meeting location before traveling
                        </Text>
                        <Text style={styles.bulletPoint}>
                            • Never share your exact home address publicly
                        </Text>
                        <Text style={styles.bulletPoint}>
                            • Use the in-app messaging system for all communications
                        </Text>

                        <Text style={styles.disclaimerText}>
                            By using the map feature, you acknowledge that location data is approximate and agree to verify all details independently before any transaction or meeting.
                        </Text>

                        <Text style={styles.disclaimerText}>
                            For questions or concerns about location privacy, please contact our support team.
                        </Text>
                    </ScrollView>

                    {/* Footer Button */}
                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.acceptButton} onPress={onClose}>
                            <Text style={styles.acceptButtonText}>I Understand</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
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
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '85%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    closeButton: {
        padding: 4,
    },
    modalContent: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    disclaimerText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#333',
        marginBottom: 16,
    },
    boldText: {
        fontWeight: '700',
        color: '#1a1a1a',
        fontSize: 16,
    },
    bulletPoint: {
        fontSize: 14,
        lineHeight: 20,
        color: '#555',
        marginBottom: 8,
        paddingLeft: 8,
    },
    modalFooter: {
        paddingHorizontal: 20,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    acceptButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    acceptButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default LocationDisclaimerModal;
