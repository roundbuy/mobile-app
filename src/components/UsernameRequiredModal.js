import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const UsernameRequiredModal = ({ visible, onCreateUsername }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => { }} // Prevent closing
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <Ionicons name="person-add" size={64} color={COLORS.primary} />
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Username Required</Text>

                    {/* Message */}
                    <Text style={styles.message}>
                        To start browsing and interacting with the community, you need to create a username first.
                    </Text>

                    <Text style={styles.submessage}>
                        Your username will be visible on your products, profile, and reviews.
                    </Text>

                    {/* Create Username Button */}
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={onCreateUsername}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.createButtonText}>Create Username</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </TouchableOpacity>

                    {/* Info */}
                    <View style={styles.infoContainer}>
                        <Ionicons name="information-circle-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>
                            This is a one-time setup
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: `${COLORS.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 8,
    },
    submessage: {
        fontSize: 13,
        color: '#999',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    createButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 8,
        width: '100%',
        gap: 8,
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        gap: 6,
    },
    infoText: {
        fontSize: 12,
        color: '#666',
    },
});

export default UsernameRequiredModal;
