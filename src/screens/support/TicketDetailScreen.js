import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import disputeService from '../../services/disputeService';

const TicketDetailScreen = ({ route, navigation }) => {
    const { ticketId } = route.params;
    const [ticket, setTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadTicketDetail();
    }, [ticketId]);

    const loadTicketDetail = async () => {
        try {
            setLoading(true);
            const response = await disputeService.getTicketDetail(ticketId);
            setTicket(response.data);
            setMessages(response.data.messages || []);
        } catch (error) {
            console.error('Load ticket error:', error);
            Alert.alert('Error', 'Failed to load ticket details');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) {
            Alert.alert('Error', 'Please enter a message');
            return;
        }

        try {
            setSending(true);
            await disputeService.addTicketMessage(ticketId, newMessage.trim());
            setNewMessage('');
            await loadTicketDetail();
        } catch (error) {
            console.error('Send message error:', error);
            Alert.alert('Error', 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleCloseTicket = () => {
        Alert.alert(
            'Close Ticket',
            'Are you sure you want to close this ticket?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Close',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await disputeService.closeTicket(ticketId);
                            Alert.alert('Success', 'Ticket closed successfully', [
                                { text: 'OK', onPress: () => navigation.goBack() }
                            ]);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to close ticket');
                        }
                    },
                },
            ]
        );
    };

    const getStatusColor = (status) => {
        const colors = {
            open: '#4169E1',
            pending: '#FFA500',
            resolved: '#32CD32',
            closed: '#999',
        };
        return colors[status] || '#999';
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4169E1" />
                </View>
            </SafeAreaView>
        );
    }

    if (!ticket) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Ticket not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back" size={28} color="#000" />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>{ticket.ticket_number}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) }]}>
                            <Text style={styles.statusText}>{ticket.status?.toUpperCase()}</Text>
                        </View>
                    </View>
                </View>

                {/* Ticket Info */}
                <View style={styles.ticketInfo}>
                    <Text style={styles.subject}>{ticket.subject}</Text>
                    <View style={styles.metaRow}>
                        <View style={styles.categoryBadge}>
                            <Ionicons name="pricetag" size={14} color="#666" />
                            <Text style={styles.categoryText}>{ticket.category}</Text>
                        </View>
                        <Text style={styles.dateText}>
                            {new Date(ticket.created_at).toLocaleDateString()}
                        </Text>
                    </View>
                </View>

                {/* Messages */}
                <ScrollView style={styles.messagesContainer}>
                    {messages.map((message, index) => (
                        <View
                            key={message.id}
                            style={[
                                styles.messageCard,
                                message.is_staff_reply && styles.staffMessageCard,
                            ]}
                        >
                            <View style={styles.messageHeader}>
                                <View style={styles.messageAuthor}>
                                    <Ionicons
                                        name={message.is_staff_reply ? 'shield-checkmark' : 'person-circle'}
                                        size={20}
                                        color={message.is_staff_reply ? '#4169E1' : '#666'}
                                    />
                                    <Text style={styles.authorName}>
                                        {message.is_staff_reply ? 'Support Team' : 'You'}
                                    </Text>
                                </View>
                                <Text style={styles.messageTime}>
                                    {new Date(message.created_at).toLocaleString()}
                                </Text>
                            </View>
                            <Text style={styles.messageText}>{message.message}</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* Input Area */}
                {ticket.status !== 'closed' && (
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Type your message..."
                            value={newMessage}
                            onChangeText={setNewMessage}
                            multiline
                            maxLength={1000}
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, sending && styles.sendButtonDisabled]}
                            onPress={handleSendMessage}
                            disabled={sending}
                        >
                            {sending ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Ionicons name="send" size={20} color="#FFF" />
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {/* Actions */}
                {ticket.status !== 'closed' && (
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleCloseTicket}
                        >
                            <Ionicons name="close-circle" size={20} color="#DC143C" />
                            <Text style={styles.closeButtonText}>Close Ticket</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    keyboardView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#999',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 4,
        marginRight: 12,
    },
    headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4169E1',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFF',
    },
    ticketInfo: {
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    subject: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    categoryText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    dateText: {
        fontSize: 12,
        color: '#999',
    },
    messagesContainer: {
        flex: 1,
        padding: 16,
    },
    messageCard: {
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#E0E0E0',
    },
    staffMessageCard: {
        backgroundColor: '#F0F7FF',
        borderLeftColor: '#4169E1',
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    messageAuthor: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginLeft: 6,
    },
    messageTime: {
        fontSize: 11,
        color: '#999',
    },
    messageText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        alignItems: 'flex-end',
    },
    input: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 8,
        maxHeight: 100,
        fontSize: 14,
    },
    sendButton: {
        backgroundColor: '#4169E1',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#CCC',
    },
    actionsContainer: {
        padding: 16,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    closeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#DC143C',
    },
    closeButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#DC143C',
        marginLeft: 8,
    },
});

export default TicketDetailScreen;
