import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Image,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { IMAGES } from '../assets/images';

const { width } = Dimensions.get('window');

const PlanUpgradeRestrictionModal = ({ visible, onClose }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Close Button */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="close" size={24} color="#999" />
                    </TouchableOpacity>

                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <Image
                            source={IMAGES.roundbyIcon}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Action Required</Text>

                    {/* Message */}
                    <Text style={styles.message}>
                        You cannot switch directly from a Private account to a Business plan.
                    </Text>

                    <View style={styles.divider} />

                    {/* Instruction */}
                    <View style={styles.instructionContainer}>
                        <Text style={styles.instructionTitle}>How to upgrade:</Text>
                        <Text style={styles.instructionText}>
                            To access Business features and plans, you need to register a new account as a Business user.
                        </Text>
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.actionButtonText}>Got it</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1,
    },
    logoContainer: {
        marginBottom: 20,
        marginTop: 10,
    },
    logo: {
        width: 60,
        height: 60,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#444',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 20,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        width: '100%',
        marginBottom: 20,
    },
    instructionContainer: {
        backgroundColor: '#F5F7FA',
        borderRadius: 12,
        padding: 16,
        width: '100%',
        marginBottom: 24,
    },
    instructionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
        marginBottom: 8,
    },
    instructionText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    actionButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

export default PlanUpgradeRestrictionModal;
