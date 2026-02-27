import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import ActionCardComponent from './ActionCardComponent';

const Step5DealConfirmationScreen = ({ navigation }) => {
    const [confirming, setConfirming] = useState(false);
    const [dealStatus, setDealStatus] = useState('pending'); // 'pending', 'waiting_partner', 'completed'

    const handleConfirmDeal = () => {
        setConfirming(true);
        // Simulate API call
        setTimeout(() => {
            // Here we simulate that we are now waiting for the other party
            // In reality, this would be driven by real-time backend state
            setDealStatus('completed');
            setConfirming(false);
        }, 1500);
    };

    const renderContent = () => {
        if (dealStatus === 'completed') {
            return (
                <View style={styles.cardContainer}>
                    <View style={styles.successIconContainer}>
                        <Ionicons name="checkmark-circle" size={80} color={COLORS.primary} />
                    </View>
                    <Text style={styles.successTitle}>Deal Completed!</Text>
                    <Text style={styles.successMessage}>
                        Both parties have confirmed the exchange.
                    </Text>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoBoxText}>
                            Payment released to Seller 2-4 days
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.outlineButton} onPress={() => navigation.navigate('ActionCenterScreen')}>
                        <Text style={styles.outlineButtonText}>Back to Action Center</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (dealStatus === 'waiting_partner') {
            return (
                <View style={styles.cardContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginBottom: 20 }} />
                    <Text style={styles.waitingTitle}>Waiting for Partner</Text>
                    <Text style={styles.waitingMessage}>
                        You have confirmed the deal. Waiting for the other party to confirm.
                    </Text>
                </View>
            );
        }

        // Initial pending state
        return (
            <View style={styles.cardContainer}>
                <Text style={styles.title}>Confirm the Deal!</Text>
                <Text style={styles.subtitle}>
                    Please ensure you are with the other party and have inspected the item before confirming.
                </Text>

                <View style={styles.warningBox}>
                    <Ionicons name="warning-outline" size={24} color="#ea580c" />
                    <Text style={styles.warningText}>
                        This action cannot be undone. Once both parties confirm, payment will be released.
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.primaryButton, confirming && styles.disabledButton]}
                    onPress={handleConfirmDeal}
                    disabled={confirming}
                >
                    {confirming ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.primaryButtonText}>Confirm the Deal!</Text>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Deal Confirmation</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <ActionCardComponent
                    itemImage="https://images.unsplash.com/photo-1542291026-7eec264c27ff"
                    userAvatar="https://randomuser.me/api/portraits/men/32.jpg"
                    itemTitle="Football leather"
                    username="Robin37"
                    statusText="Buyer confirm the Deal"
                    stepNumber="Step 1"
                    actionText="Action: Confirm the Deal!"
                    timestamp="2min"
                    onPress={() => { }}
                />
                {renderContent()}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 4,
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    cardContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#eee',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1a1a1a',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    warningBox: {
        flexDirection: 'row',
        backgroundColor: '#ffedd5',
        padding: 16,
        borderRadius: 8,
        marginBottom: 32,
        alignItems: 'center',
    },
    warningText: {
        flex: 1,
        marginLeft: 12,
        color: '#ea580c',
        fontSize: 14,
        lineHeight: 20,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        width: '100%',
    },
    disabledButton: {
        opacity: 0.7,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    successIconContainer: {
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 12,
    },
    successMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    infoBox: {
        backgroundColor: '#f8f4ff',
        padding: 16,
        borderRadius: 8,
        width: '100%',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    infoBoxText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    outlineButton: {
        borderWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 14,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    outlineButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
    waitingTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    waitingMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    }
});

export default Step5DealConfirmationScreen;
