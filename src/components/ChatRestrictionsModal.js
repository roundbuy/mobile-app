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

const ChatRestrictionsModal = ({ visible, onClose }) => {
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
                        <Text style={styles.modalTitle}>Chat Safety & Restrictions</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#1a1a1a" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={true}>
                        <Text style={styles.disclaimerText}>
                            <Text style={styles.boldText}>Important: Keep Your Conversations Safe</Text>
                        </Text>

                        <Text style={styles.disclaimerText}>
                            To protect all users, our chat system is monitored and certain types of content are restricted. Please follow these guidelines to ensure a safe and positive experience for everyone.
                        </Text>

                        <Text style={styles.disclaimerText}>
                            <Text style={styles.boldText}>🚫 Prohibited Content:</Text>
                        </Text>

                        <Text style={styles.bulletPoint}>
                            • <Text style={styles.boldText}>No Phone Numbers:</Text> Do not share phone numbers, mobile numbers, or any direct contact information
                        </Text>
                        <Text style={styles.bulletPoint}>
                            • <Text style={styles.boldText}>No Email Addresses:</Text> Sharing email addresses is not permitted
                        </Text>
                        <Text style={styles.bulletPoint}>
                            • <Text style={styles.boldText}>No External Links:</Text> Do not share links to external websites, social media, or messaging apps
                        </Text>
                        <Text style={styles.bulletPoint}>
                            • <Text style={styles.boldText}>No Personal Addresses:</Text> Never share your home address or exact location
                        </Text>
                        <Text style={styles.bulletPoint}>
                            • <Text style={styles.boldText}>No Payment Details:</Text> Do not share bank account numbers, credit card information, or payment app details
                        </Text>

                        <Text style={styles.disclaimerText}>
                            <Text style={styles.boldText}>⚠️ Content Moderation:</Text>
                        </Text>

                        <Text style={styles.bulletPoint}>
                            • All messages are automatically scanned for prohibited content
                        </Text>
                        <Text style={styles.bulletPoint}>
                            • Messages containing restricted information will be blocked
                        </Text>
                        <Text style={styles.bulletPoint}>
                            • Repeated violations may result in account suspension
                        </Text>
                        <Text style={styles.bulletPoint}>
                            • We use AI and human moderation to ensure compliance
                        </Text>

                        <Text style={styles.disclaimerText}>
                            <Text style={styles.boldText}>✅ Safe Communication Practices:</Text>
                        </Text>

                        <Text style={styles.bulletPoint}>
                            • Use only the in-app messaging system for all communications
                        </Text>
                        <Text style={styles.bulletPoint}>
                            • Arrange meetings in public, well-lit locations
                        </Text>
                        <Text style={styles.bulletPoint}>
                            • Use the "Pick Up Exchange" feature to schedule safe meetups
                        </Text>
                        <Text style={styles.bulletPoint}>
                            • Report suspicious behavior or messages immediately
                        </Text>
                        <Text style={styles.bulletPoint}>
                            • Never send money before inspecting the item in person
                        </Text>

                        <Text style={styles.disclaimerText}>
                            <Text style={styles.boldText}>🔒 Why These Restrictions Exist:</Text>
                        </Text>

                        <Text style={styles.disclaimerText}>
                            These rules protect you from scams, fraud, and privacy violations. By keeping all communication within the app, we can:
                        </Text>

                        <Text style={styles.bulletPoint}>
                            • Monitor for fraudulent activity
                        </Text>
                        <Text style={styles.bulletPoint}>
                            • Provide evidence in case of disputes
                        </Text>
                        <Text style={styles.bulletPoint}>
                            • Protect your personal information
                        </Text>
                        <Text style={styles.bulletPoint}>
                            • Ensure accountability for all users
                        </Text>

                        <Text style={styles.disclaimerText}>
                            <Text style={styles.boldText}>📞 How to Arrange Meetups:</Text>
                        </Text>

                        <Text style={styles.disclaimerText}>
                            Instead of sharing phone numbers, use our "Pick Up Exchange" feature to:
                        </Text>

                        <Text style={styles.bulletPoint}>
                            • Schedule a meeting time and date
                        </Text>
                        <Text style={styles.bulletPoint}>
                            • Choose a safe, public meeting location
                        </Text>
                        <Text style={styles.bulletPoint}>
                            • Get notifications and reminders
                        </Text>
                        <Text style={styles.bulletPoint}>
                            • Keep a record of the transaction
                        </Text>

                        <Text style={styles.disclaimerText}>
                            <Text style={styles.boldText}>🚨 Report Violations:</Text>
                        </Text>

                        <Text style={styles.disclaimerText}>
                            If someone asks you to move the conversation off-platform or share personal information, please report them immediately using the report button.
                        </Text>

                        <Text style={styles.disclaimerText}>
                            By using our chat system, you agree to follow these guidelines and understand that violations may result in account restrictions or termination.
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

export default ChatRestrictionsModal;
