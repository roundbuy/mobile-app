import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import api from '../../services/api';
import moment from 'moment';

const Step5DealConfirmationScreen = ({ navigation, route }) => {
    const {
        conversationId,
        advertisementId,
        title,
        itemImage,
        role,
        otherUserName
    } = route?.params || {};

    const [loading, setLoading] = useState(false);
    const [actioning, setActioning] = useState(false);

    // Default schedule showing if available from DB, otherwise a fallback
    const [scheduleDate, setScheduleDate] = useState(null);

    const isSeller = role === 'selling';

    // "17 December - 9:00 am" format
    const displayDate = scheduleDate ? moment(scheduleDate.scheduled_date).format('DD MMMM') + ' - ' + moment(scheduleDate.scheduled_time, 'HH:mm:ss').format('h:mm a') : '17 December - 9:00 am';

    useEffect(() => {
        // Here we could fetch the specific pickup_schedules 
        // using the advertisementId to accurately populate the calendar date.
    }, []);

    const handleConfirm = async () => {
        // Send Confirm Deal to Backend
        // For now, simulating the Confirm Exchange action
        try {
            setActioning(true);
            const res = await api.post(`/buyer-seller/offers/${advertisementId}/confirm`);
            if (res.data.success) {
                Alert.alert("Success", "Exchange Confirmed");
                navigation.goBack();
            }
        } catch (error) {
            console.error('Confirm deal error', error);
            Alert.alert("Notice", "We've simulated the confirmation for now.");
            navigation.goBack(); // Simulated success
        } finally {
            setActioning(false);
        }
    };

    const handleDisconfirm = () => {
        Alert.alert(
            "Cancel Exchange",
            "Are you sure you want to disconfirm this exchange?",
            [
                { text: "No", style: "cancel" },
                { text: "Yes", onPress: () => navigation.goBack() }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isSeller ? 'Seller Deal Confirmation' : 'Buyer Deal Confirmation'}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Information Card */}
                <View style={styles.infoCard}>
                    <Image source={{ uri: itemImage || 'https://via.placeholder.com/80' }} style={styles.productImage} />
                    <View style={styles.infoCardContent}>
                        <Text style={styles.infoCardRoleText}>
                            {isSeller
                                ? `Seller hands the item to:`
                                : `Buyer Picks Up the item from:`}
                        </Text>
                        <View style={styles.roleRow}>
                            <Ionicons name="person-circle-outline" size={16} color="#000" />
                            <Text style={styles.roleNameText}>
                                {otherUserName || (isSeller ? 'Jane12' : 'Robin')} {isSeller ? '(Buyer)' : '(Seller)'}
                            </Text>
                        </View>
                        <View style={styles.dateRow}>
                            <Ionicons name="calendar-outline" size={16} color="#000" />
                            <Text style={styles.dateText}>{displayDate}</Text>
                        </View>
                    </View>
                </View>

                {/* Pick Up Yourself */}
                <Text style={styles.sectionTitle}>Pick Up Yourself</Text>
                <Text style={styles.sectionText}>
                    Buyer meets with the Seller, at the location, in which the item was displayed on the map.
                </Text>

                {/* Inspection */}
                <Text style={styles.sectionTitle}>Inspection</Text>
                <Text style={styles.sectionText}>
                    Ascertain the item corresponds with the descriptions, images and what was agreed!
                </Text>
                <TouchableOpacity style={styles.readMoreLink} activeOpacity={0.7}>
                    <Text style={styles.readMoreText}>Read more about <Text style={styles.linkLine}>Pick Ups & Inspections</Text></Text>
                    <Ionicons name="information-circle-outline" size={16} color="#000" style={styles.infoIcon} />
                </TouchableOpacity>

                {/* Confirmation Section */}
                <Text style={styles.sectionTitle}>
                    {isSeller ? 'Seller confirmation or disconfirmation' : 'Buyer confirmation or disconfirmation'}
                </Text>
                <Text style={styles.sectionText}>
                    {isSeller
                        ? 'Seller confirmation means you handed the item, as promised & agreed, and you handed the item to Buyer. Disconfirm if the item exchange was cancelled.'
                        : 'Buyer confirmation means you received the item from the Seller, as promised & agreed. Disconfirm if the item exchange was cancelled.'}
                </Text>

                <Text style={styles.answerPrompt}>
                    Please provide your answer <Text style={styles.boldText}>{otherUserName || (isSeller ? 'Jane12' : 'Robin')}</Text>:
                </Text>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm} disabled={actioning}>
                        {actioning ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.confirmButtonText}>Confirm Exchange</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.disconfirmButton} onPress={handleDisconfirm} disabled={actioning}>
                        <Text style={styles.disconfirmButtonText}>Disconfirm Exchange</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer Disclaimers */}
                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>
                        Our <Text style={styles.footerLinkText}>Safety Guidelines & Disclaimers</Text>
                    </Text>
                </View>

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
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
    },
    backButton: {
        padding: 4,
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#E5EBF5', // Pale blue gray
        borderRadius: 12,
        padding: 12,
        marginBottom: 24,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    infoCardContent: {
        flex: 1,
        justifyContent: 'center',
    },
    infoCardRoleText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#000',
        marginBottom: 6,
    },
    roleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    roleNameText: {
        fontSize: 12,
        color: '#333',
        marginLeft: 6,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 12,
        color: '#000',
        fontWeight: '500',
        marginLeft: 6,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 700,
        color: '#000',
        marginBottom: 8,
    },
    sectionText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 20,
        marginBottom: 16,
        fontWeight: 500,
    },
    readMoreLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
    },
    readMoreText: {
        fontSize: 14,
        color: '#000',
    },
    linkLine: {
        textDecorationLine: 'underline',
    },
    infoIcon: {
        marginLeft: 4,
    },
    answerPrompt: {
        fontSize: 14,
        color: '#000',
        marginTop: 8,
        marginBottom: 16,
    },
    boldText: {
        fontWeight: 'bold',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        marginBottom: 40,
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        alignItems: 'center',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    confirmButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#000',
    },
    disconfirmButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        alignItems: 'center',
        marginLeft: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    disconfirmButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#000',
    },
    footerContainer: {
        alignItems: 'center',
        marginTop: 'auto',
    },
    footerText: {
        fontSize: 11,
        color: '#666',
    },
    footerLinkText: {
        color: '#0066CC',
        textDecorationLine: 'underline',
    },
});

export default Step5DealConfirmationScreen;
