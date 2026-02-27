import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import ActionCardComponent from './ActionCardComponent';

const Step3DeliverySelectionScreen = ({ navigation, route }) => {
    const { offerAmount } = route?.params || {};
    const [selectedOption, setSelectedOption] = useState(null);

    // Delivery options per client request
    const options = [
        { id: 'pickup', title: 'Pick up', subtitle: 'Meet the seller in person', available: true },
        { id: 'ship', title: 'Ship to you', subtitle: 'Delivery via standard post', available: false },
        { id: 'courier', title: 'Courier delivery', subtitle: 'Fastest delivery method', available: false },
    ];

    const handleSelect = (option) => {
        if (!option.available) {
            Alert.alert('Not Available', 'This option is not available yet.');
            return;
        }
        setSelectedOption(option.id);
    };

    const handleProceed = () => {
        if (selectedOption === 'pickup') {
            // Proceed to Step 4 (Schedule Pick Up)
            navigation.navigate('Step4ScheduleScreen');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Delivery Option</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <ActionCardComponent
                    itemImage="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
                    userAvatar="https://randomuser.me/api/portraits/women/44.jpg"
                    itemTitle="Vintage T-Shirt"
                    username="JaneDoe"
                    statusText="Delivery Option"
                    stepNumber="Step 3"
                    actionText="Action: Select Delivery!"
                    timestamp="1d"
                    onPress={() => { }}
                />

                <Text style={styles.pageTitle}>How would you like to receive your item?</Text>
                <Text style={styles.pageSubtitle}>Select your preferred delivery method below.</Text>

                {options.map((option) => (
                    <TouchableOpacity
                        key={option.id}
                        style={[
                            styles.optionCard,
                            selectedOption === option.id && styles.selectedCard,
                            !option.available && styles.disabledCard
                        ]}
                        onPress={() => handleSelect(option)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.optionContent}>
                            <View style={[styles.radioButton, selectedOption === option.id && styles.radioButtonSelected]}>
                                {selectedOption === option.id && <View style={styles.radioButtonInner} />}
                            </View>
                            <View style={styles.optionTextContainer}>
                                <Text style={[styles.optionTitle, !option.available && styles.disabledText]}>{option.title}</Text>
                                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                            </View>
                        </View>
                        {!option.available && (
                            <View style={styles.badgeContainer}>
                                <Text style={styles.badgeText}>Coming Soon</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.primaryButton, !selectedOption && styles.disabledButton]}
                    onPress={handleProceed}
                    disabled={!selectedOption}
                >
                    <Text style={styles.primaryButtonText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff', // Matches the clean look of the Sign In page per specs
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
        padding: 24,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#000',
    },
    pageSubtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    selectedCard: {
        borderColor: COLORS.primary,
        backgroundColor: '#f8f4ff', // Light primary tint
    },
    disabledCard: {
        opacity: 0.7,
        backgroundColor: '#f9f9f9',
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#ccc',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    radioButtonSelected: {
        borderColor: COLORS.primary,
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.primary,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    disabledText: {
        color: '#888',
    },
    optionSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    badgeContainer: {
        backgroundColor: '#ffedd5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ea580c',
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Step3DeliverySelectionScreen;
