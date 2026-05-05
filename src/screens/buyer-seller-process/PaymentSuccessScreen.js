import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import moment from 'moment';

const PaymentSuccessScreen = ({ navigation, route }) => {
    // Extract passed parameters or use fallbacks for display
    const {
        conversationId,
        advertisementId,
        title,
        amount,
        paymentMethod,
        transactionId
    } = route?.params || {};

    const handleDone = () => {
        // Use replace instead of navigate so that PaymentSuccessScreen is removed from the history stack,
        // meaning if they press "back" on SingleItemActionScreen they go straight to ActionCenter.
        if (conversationId && advertisementId) {
            navigation.replace('SingleItemActionScreen', {
                conversationId,
                advertisementId,
                title: title || 'Item'
            });
        } else {
            // Fallback if params are missing
            navigation.navigate('ActionCenterMessagesScreen');
        }
    };

    // Formatting date and time
    const currentTime = moment().format('hh:mm A');
    const currentDate = moment().format('DD MMMM YYYY');

    // Masking the transaction ID for display purposes if it's long, or just showing the DB ID
    const displayTransactionId = transactionId ? `**** **** ${String(transactionId).padStart(4, '0')}` : '**** **** 1234 2345';
    const displaySessionId = `CHG${Math.floor(Math.random() * 100000000)}`;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleDone} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment Details</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Success Icon Block */}
                <View style={styles.successBlock}>
                    <View style={styles.iconOuterCircle}>
                        <View style={styles.iconInnerCircle}>
                            <Ionicons name="checkmark" size={40} color="#fff" />
                        </View>
                    </View>
                    <Text style={styles.successTitle}>Payment Successful</Text>
                    <Text style={styles.successSubtitle}>Successfully Paid £{amount ? parseFloat(amount).toFixed(2) : '0.00'}</Text>
                </View>

                {/* Details Block */}
                <View style={styles.detailsBlock}>
                    <Text style={styles.detailsHeader}>DETAILS</Text>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Transaction ID</Text>
                        <Text style={styles.detailValue}>{displayTransactionId}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Time</Text>
                        <Text style={styles.detailValue}>{currentTime}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Date</Text>
                        <Text style={styles.detailValue}>{currentDate}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Payment method</Text>
                        <Text style={styles.detailValue}>{paymentMethod || 'Visa Debit Card'}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Session ID</Text>
                        <Text style={styles.detailValue}>{displaySessionId}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Total Amount</Text>
                        <Text style={styles.detailValueBold}>£{amount ? parseFloat(amount).toFixed(2) : '0.00'}</Text>
                    </View>
                </View>

                {/* Footnotes */}
                <View style={styles.footnotesContainer}>
                    <Text style={styles.emailNoteText}>A copy of this receipt has been sent to your email as a PDF</Text>
                    <Text style={styles.sellerNoteText}>Seller receives the payment, after succesfull Pick Up & Inspection</Text>
                </View>

                {/* Done Button */}
                <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
                    <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>

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
        paddingBottom: 16,
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
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    successBlock: {
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 32,
    },
    iconOuterCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E0F7FA', // Light cyan background
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    iconInnerCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#00D09E', // Bright green/teal
        alignItems: 'center',
        justifyContent: 'center',
    },
    successTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    successSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    detailsBlock: {
        marginBottom: 24,
    },
    detailsHeader: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
    },
    detailValue: {
        fontSize: 14,
        color: '#000',
    },
    detailValueBold: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
    },
    footnotesContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    emailNoteText: {
        fontSize: 10,
        color: '#666',
        textAlign: 'center',
        marginBottom: 12,
    },
    sellerNoteText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#000',
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 18,
    },
    doneButton: {
        backgroundColor: '#001b54', // Dark blue from the mockup
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 'auto',
    },
    doneButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default PaymentSuccessScreen;
