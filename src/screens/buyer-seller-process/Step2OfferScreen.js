import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import ActionCardComponent from './ActionCardComponent';

const Step2OfferScreen = ({ navigation, route }) => {
    const { advertisementId, currencySymbol = '£' } = route?.params || {};
    const [offerAmount, setOfferAmount] = useState('');
    const [sending, setSending] = useState(false);

    // Status can be 'make', 'pending', 'accepted', 'declined'
    const [offerStatus, setOfferStatus] = useState('make');

    const handleSendOffer = () => {
        if (!offerAmount.trim()) return;

        setSending(true);
        // Simulate network request
        setTimeout(() => {
            setOfferStatus('pending');
            setSending(false);
        }, 1000);
    };

    const renderOfferState = () => {
        switch (offerStatus) {
            case 'make':
                return (
                    <View style={styles.cardContainer}>
                        <Text style={styles.cardTitle}>Make an Offer</Text>
                        <View style={styles.inputRow}>
                            <Text style={styles.currencySymbol}>{currencySymbol}</Text>
                            <TextInput
                                style={styles.offerInput}
                                placeholder="0.00"
                                keyboardType="decimal-pad"
                                value={offerAmount}
                                onChangeText={setOfferAmount}
                            />
                        </View>
                        <TouchableOpacity style={styles.primaryButton} onPress={handleSendOffer} disabled={sending}>
                            {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Send Offer</Text>}
                        </TouchableOpacity>
                    </View>
                );
            case 'pending':
                return (
                    <View style={styles.cardContainer}>
                        <Text style={styles.cardTitle}>Offer Sent</Text>
                        <Text style={styles.amountDisplay}>{currencySymbol}{offerAmount}</Text>
                        <Text style={styles.statusSubtext}>Waiting for seller's response...</Text>

                        {/* Placeholder buttons for demo purposes */}
                        <View style={{ flexDirection: 'row', marginTop: 20 }}>
                            <TouchableOpacity style={{ flex: 1, padding: 10, backgroundColor: 'green', marginHorizontal: 5, borderRadius: 5, alignItems: 'center' }} onPress={() => setOfferStatus('accepted')}><Text style={{ color: 'white' }}>Simulate Accept</Text></TouchableOpacity>
                            <TouchableOpacity style={{ flex: 1, padding: 10, backgroundColor: 'red', marginHorizontal: 5, borderRadius: 5, alignItems: 'center' }} onPress={() => setOfferStatus('declined')}><Text style={{ color: 'white' }}>Simulate Decline</Text></TouchableOpacity>
                        </View>
                    </View>
                );
            case 'accepted':
                return (
                    <View style={[styles.cardContainer, styles.acceptedCard]}>
                        <Ionicons name="checkmark-circle" size={48} color="green" />
                        <Text style={styles.successTitle}>Offer Accepted!</Text>
                        <Text style={styles.amountDisplay}>{currencySymbol}{offerAmount}</Text>
                        <Text style={styles.statusSubtext}>The seller has accepted your offer.</Text>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => navigation.navigate('Step3DeliverySelectionScreen', { offerAmount })}
                        >
                            <Text style={styles.primaryButtonText}>Proceed to Delivery Selection</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 'declined':
                return (
                    <View style={[styles.cardContainer, styles.declinedCard]}>
                        <Ionicons name="close-circle" size={48} color="red" />
                        <Text style={styles.declinedTitle}>Offer Declined</Text>
                        <Text style={styles.amountDisplayStrikethrough}>{currencySymbol}{offerAmount}</Text>
                        <Text style={styles.statusSubtext}>The seller has declined this offer.</Text>

                        <TouchableOpacity
                            style={styles.outlineButton}
                            onPress={() => {
                                setOfferAmount('');
                                setOfferStatus('make');
                            }}
                        >
                            <Text style={styles.outlineButtonText}>Make a new Offer!</Text>
                        </TouchableOpacity>
                    </View>
                );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Offers</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <ActionCardComponent
                    itemImage="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
                    userAvatar="https://randomuser.me/api/portraits/women/44.jpg"
                    itemTitle="Vintage T-Shirt"
                    username="JaneDoe"
                    statusText="Offer £45.00"
                    stepNumber="Step 2"
                    actionText="Action: See Offer!"
                    timestamp="1d"
                    onPress={() => { }}
                />
                {renderOfferState()}
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
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
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
        padding: 16,
        flex: 1,
        justifyContent: 'center',
    },
    cardContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    acceptedCard: {
        borderColor: 'green',
        borderWidth: 1,
    },
    declinedCard: {
        borderColor: 'red',
        borderWidth: 1,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'green',
        marginVertical: 12,
    },
    declinedTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'red',
        marginVertical: 12,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: COLORS.primary,
        marginBottom: 30,
        paddingBottom: 8,
        width: '80%',
        justifyContent: 'center',
    },
    currencySymbol: {
        fontSize: 32,
        fontWeight: 'bold',
        marginRight: 8,
    },
    offerInput: {
        fontSize: 32,
        fontWeight: 'bold',
        width: '60%',
        textAlign: 'center',
    },
    amountDisplay: {
        fontSize: 36,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    amountDisplayStrikethrough: {
        fontSize: 36,
        fontWeight: 'bold',
        marginVertical: 10,
        textDecorationLine: 'line-through',
        color: '#aaa',
    },
    statusSubtext: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
        textAlign: 'center',
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    outlineButton: {
        borderWidth: 1,
        borderColor: COLORS.primary,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    outlineButtonText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Step2OfferScreen;
