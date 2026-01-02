import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    TextInput,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/theme';
import disputeService from '../../services/disputeService';

const IssueDetailScreen = ({ navigation, route }) => {
    const { issueId } = route.params;

    const [issue, setIssue] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    // Seller response state
    const [sellerDecision, setSellerDecision] = useState(null); // 'accept' or 'decline'
    const [sellerResponseText, setSellerResponseText] = useState('');

    useEffect(() => {
        loadCurrentUser();
        loadIssueDetails();
    }, [issueId]);

    const loadCurrentUser = async () => {
        try {
            const userData = await AsyncStorage.getItem('@roundbuy:user_data');
            if (userData) {
                const user = JSON.parse(userData);
                setCurrentUserId(user.id);
            }
        } catch (error) {
            console.error('Load user error:', error);
        }
    };

    const loadIssueDetails = async () => {
        try {
            setLoading(true);
            const [issueResponse, messagesResponse] = await Promise.all([
                disputeService.getIssueById(issueId),
                disputeService.getIssueMessages(issueId),
            ]);

            if (issueResponse.success) {
                setIssue(issueResponse.data);
            }

            if (messagesResponse.success) {
                setMessages(messagesResponse.data);
            }
        } catch (error) {
            console.error('Load issue details error:', error);
            Alert.alert('Error', 'Failed to load issue details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadIssueDetails();
    };

    // Seller sends response
    const handleSendResponse = async () => {
        if (!sellerDecision || !sellerResponseText.trim()) {
            Alert.alert('Error', 'Please select a decision and provide a response');
            return;
        }

        setActionLoading(true);
        try {
            const response = await disputeService.respondToIssue(issueId, {
                decision: sellerDecision,
                response_text: sellerResponseText.trim()
            });

            if (response.success) {
                Alert.alert(
                    'Response Sent',
                    'Your response has been sent to the buyer.',
                    [{ text: 'OK', onPress: () => loadIssueDetails() }]
                );
                setSellerDecision(null);
                setSellerResponseText('');
            }
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to send response');
        } finally {
            setActionLoading(false);
        }
    };

    // Buyer closes issue
    const handleCloseIssue = () => {
        Alert.alert(
            'Close Issue',
            'Are you sure you want to close this issue? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Close',
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            const response = await disputeService.closeIssue(issueId);
                            if (response.success) {
                                Alert.alert(
                                    'Issue Closed',
                                    'This issue has been closed.',
                                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                                );
                            }
                        } catch (error) {
                            Alert.alert('Error', error.message || 'Failed to close issue');
                        } finally {
                            setActionLoading(false);
                        }
                    }
                }
            ]
        );
    };

    // Buyer escalates to dispute
    const handleDisputeIssue = () => {
        // Navigate to the 4-screen dispute flow
        navigation.navigate('IssueDisputeInfo', {
            issueId: issueId,
            issueNumber: issue.issue_number
        });
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        setSendingMessage(true);
        try {
            const response = await disputeService.addIssueMessage(issueId, newMessage.trim());
            if (response.success) {
                setNewMessage('');
                loadIssueDetails();
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to send message');
        } finally {
            setSendingMessage(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            open: '#FFA500',
            seller_responded: '#4169E1',
            settled: '#32CD32',
            closed_by_buyer: '#808080',
            escalated_to_dispute: '#9370DB',
        };
        return colors[status] || '#666';
    };

    const getStatusLabel = (status) => {
        const labels = {
            open: 'Waiting for Seller',
            seller_responded: 'Seller Responded',
            settled: 'Settled',
            closed_by_buyer: 'Closed',
            escalated_to_dispute: 'Escalated to Dispute',
        };
        return labels[status] || status;
    };

    const calculateTimeRemaining = (deadline) => {
        if (!deadline) return null;

        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diff = deadlineDate - now;

        if (diff < 0) return 'Expired';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} remaining`;
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
        } else {
            return 'Less than 1 hour';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading issue details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!issue) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#CCC" />
                    <Text style={styles.errorText}>Issue not found</Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Check user role
    const isSeller = issue.other_party_id === currentUserId;
    const isBuyer = issue.created_by === currentUserId;
    const canRespond = isSeller && issue.status === 'open';
    const sellerHasResponded = ['seller_responded', 'settled'].includes(issue.status);
    const canBuyerAct = isBuyer && !['closed_by_buyer', 'escalated_to_dispute'].includes(issue.status);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.headerBackButton}
                >
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>An Issue #{issue.issue_number}</Text>
                    <Text style={styles.headerSubtitle}>{issue.issue_number}</Text>
                </View>
                <View style={styles.headerRight} />
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Handshake Icon */}
                <View style={styles.iconContainer}>
                    <FontAwesome name="handshake-o" size={60} color="#666" />
                </View>

                {/* Creation Message */}
                <View style={styles.creationMessage}>
                    <Text style={styles.creationText}>
                        An Issue #{issue.issue_number} was created
                    </Text>
                    <Text style={styles.creationTime}>
                        {formatDate(issue.created_at)}
                    </Text>
                </View>

                {/* Status Card */}
                <View style={styles.statusCard}>
                    {/* Product Info */}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Product:</Text>
                        <Text style={styles.infoValue}>{issue.product_name || issue.ad_title}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Issuer:</Text>
                        <Text style={styles.infoValue}>{isBuyer ? 'You' : issue.other_party_name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Issued to:</Text>
                        <Text style={styles.infoValue}>{isSeller ? 'You' : issue.other_party_name}</Text>
                    </View>

                    {/* For Seller: Show link to view buyer's issue */}
                    {isSeller ? (
                        <>
                            <Text style={styles.sectionTitle}>Buyer's Issue</Text>
                            <TouchableOpacity
                                style={styles.viewIssueLink}
                                onPress={() => navigation.navigate('AttachEvidence', {
                                    issueId: issue.id,
                                    issueNumber: issue.issue_number,
                                    userRole: 'seller',
                                    showIssueDetails: true
                                })}
                            >
                                <Text style={styles.viewIssueLinkText}>
                                    To view Buyer's Issue & Request click{' '}
                                    <Text style={styles.viewIssueLinkHighlight}>here</Text>
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            {/* For Buyer: Show full issue details */}
                            <Text style={styles.sectionTitle}>Buyer's Issue:</Text>
                            <Text style={styles.fieldLabel}>The issue with the product:</Text>
                            <Text style={styles.issueDescription}>{issue.issue_description}</Text>

                            {issue.buyer_request && (
                                <>
                                    <Text style={styles.fieldLabel}>Issuers Requests:</Text>
                                    <Text style={styles.issueDescription}>{issue.buyer_request}</Text>
                                </>
                            )}

                            {/* Attach Evidence Button for Buyer */}
                            <TouchableOpacity
                                style={styles.attachEvidenceButton}
                                onPress={() => navigation.navigate('AttachEvidence', {
                                    issueId: issue.id,
                                    issueNumber: issue.issue_number,
                                    userRole: 'buyer'
                                })}
                            >
                                <Ionicons name="attach" size={18} color={COLORS.primary} />
                                <Text style={styles.attachEvidenceText}>Attach Evidence</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    <Text style={styles.createdDate}>
                        Created: {formatDate(issue.created_at)}
                    </Text>
                </View>

                {/* Seller Response Section (for seller to respond) */}
                {canRespond && !actionLoading && (
                    <View style={styles.sellerResponseSection}>
                        <Text style={styles.sectionTitle}>Seller's Response</Text>
                        <Text style={styles.sectionSubtitle}>Response to the issue:</Text>

                        {/* Response text */}
                        <TextInput
                            style={styles.responseTextArea}
                            placeholder="Explain your decision..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                            value={sellerResponseText}
                            onChangeText={setSellerResponseText}
                            maxLength={1000}
                        />

                        {/* Decision checkboxes */}
                        <Text style={styles.sectionSubtitle}>Seller's Decision:</Text>
                        <TouchableOpacity
                            style={styles.checkboxRow}
                            onPress={() => setSellerDecision('accept')}
                        >
                            <View style={[
                                styles.checkbox,
                                sellerDecision === 'accept' && styles.checkboxChecked
                            ]}>
                                {sellerDecision === 'accept' && (
                                    <Ionicons name="checkmark" size={16} color="#FFF" />
                                )}
                            </View>
                            <Text style={styles.checkboxLabel}>
                                I Accept the Request and Cancel the deal!
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.checkboxRow}
                            onPress={() => setSellerDecision('decline')}
                        >
                            <View style={[
                                styles.checkbox,
                                sellerDecision === 'decline' && styles.checkboxChecked
                            ]}>
                                {sellerDecision === 'decline' && (
                                    <Text style={styles.checkboxX}>X</Text>
                                )}
                            </View>
                            <Text style={styles.checkboxLabel}>
                                I decline the Request and keep to the Agreement!
                            </Text>
                        </TouchableOpacity>

                        {/* Info Link */}
                        <View style={styles.infoLinkContainer}>
                            <Text style={styles.infoLinkText}>
                                More information on Issues & Disputes,{' '}
                                <Text style={styles.infoLinkHighlight}>click here</Text>
                            </Text>
                            <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} style={styles.infoIcon} />
                        </View>

                        {/* Send Response Button */}
                        <TouchableOpacity
                            style={[
                                styles.sendResponseButton,
                                (!sellerDecision || !sellerResponseText.trim()) && styles.buttonDisabled
                            ]}
                            onPress={handleSendResponse}
                            disabled={!sellerDecision || !sellerResponseText.trim()}
                        >
                            <Text style={styles.sendResponseButtonText}>
                                Send Response to
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Display Seller's Response (for buyer to see) */}
                {sellerHasResponded && issue.seller_response_text && (
                    <View style={styles.sellerResponseDisplay}>
                        <Text style={styles.sectionTitle}>Seller's Response</Text>
                        <Text style={styles.responseText}>{issue.seller_response_text}</Text>

                        <View style={styles.decisionDisplay}>
                            <Text style={styles.decisionLabel}>Seller's Decision:</Text>
                            <View style={styles.decisionBadge}>
                                <Ionicons
                                    name={issue.seller_decision === 'accept' ? 'checkmark-circle' : 'close-circle'}
                                    size={16}
                                    color={issue.seller_decision === 'accept' ? '#32CD32' : '#DC143C'}
                                />
                                <Text style={[
                                    styles.decisionText,
                                    { color: issue.seller_decision === 'accept' ? '#32CD32' : '#DC143C' }
                                ]}>
                                    {issue.seller_decision === 'accept' ? 'Accepted' : 'Declined'}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Buyer Action Buttons */}
                {canBuyerAct && !actionLoading && (
                    <View style={styles.buyerActions}>
                        {sellerHasResponded && (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.disputeButton]}
                                onPress={handleDisputeIssue}
                            >
                                <Ionicons name="alert-circle" size={20} color="#FFF" />
                                <Text style={styles.actionButtonText}>Dispute the Issue</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.actionButton, styles.closeButton]}
                            onPress={handleCloseIssue}
                        >
                            <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                            <Text style={styles.actionButtonText}>Close the Issue</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {actionLoading && (
                    <View style={styles.actionLoadingContainer}>
                        <ActivityIndicator size="small" color={COLORS.primary} />
                        <Text style={styles.actionLoadingText}>Processing...</Text>
                    </View>
                )}

                {/* Messages Section */}
                <View style={styles.messagesSection}>
                    <Text style={styles.sectionTitle}>Messages</Text>
                    {messages.length === 0 ? (
                        <View style={styles.noMessages}>
                            <Ionicons name="chatbubbles-outline" size={48} color="#CCC" />
                            <Text style={styles.noMessagesText}>No messages yet</Text>
                        </View>
                    ) : (
                        messages.map((message) => (
                            <View
                                key={message.id}
                                style={[
                                    styles.messageCard,
                                    message.is_system_message && styles.systemMessage,
                                ]}
                            >
                                {!message.is_system_message && (
                                    <Text style={styles.messageSender}>
                                        {message.full_name || 'User'}
                                    </Text>
                                )}
                                <Text style={styles.messageText}>{message.message}</Text>
                                <Text style={styles.messageTime}>
                                    {formatDate(message.created_at)}
                                </Text>
                            </View>
                        ))
                    )}
                </View>

                {/* Message Input */}
                {!['closed_by_buyer', 'escalated_to_dispute'].includes(issue.status) && (
                    <View style={styles.messageInputContainer}>
                        <TextInput
                            style={styles.messageInput}
                            placeholder="Type a message..."
                            placeholderTextColor="#999"
                            value={newMessage}
                            onChangeText={setNewMessage}
                            multiline
                            maxLength={500}
                        />
                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                (!newMessage.trim() || sendingMessage) && styles.sendButtonDisabled,
                            ]}
                            onPress={handleSendMessage}
                            disabled={!newMessage.trim() || sendingMessage}
                        >
                            {sendingMessage ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Ionicons name="send" size={20} color="#FFF" />
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
        marginBottom: 24,
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
    headerBackButton: {
        padding: 4,
        marginRight: 12,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    iconContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: '#FFF',
    },
    creationMessage: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    creationText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    creationTime: {
        fontSize: 12,
        color: '#999',
    },
    statusCard: {
        backgroundColor: '#FFF',
        padding: 16,
        marginBottom: 8,
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFF',
    },
    deadlineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deadlineText: {
        fontSize: 12,
        color: '#FF6347',
        fontWeight: '600',
        marginLeft: 4,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    infoValue: {
        fontSize: 14,
        color: '#000',
        flex: 1,
        textAlign: 'right',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginTop: 16,
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginTop: 12,
        marginBottom: 6,
    },
    issueDescription: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        marginBottom: 12,
    },
    createdDate: {
        fontSize: 12,
        color: '#999',
        marginTop: 8,
    },
    viewIssueLink: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F8F8F8',
        borderRadius: 8,
        marginTop: 8,
    },
    viewIssueLinkText: {
        fontSize: 14,
        color: '#666',
    },
    viewIssueLinkHighlight: {
        color: COLORS.primary,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    attachEvidenceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F0F7FF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.primary,
        marginTop: 12,
    },
    attachEvidenceText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
        marginLeft: 8,
    },
    sellerResponseSection: {
        backgroundColor: '#FFF',
        padding: 16,
        marginBottom: 8,
    },
    responseTextArea: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#000',
        minHeight: 100,
        backgroundColor: '#FAFAFA',
        marginBottom: 16,
        textAlignVertical: 'top',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#CCC',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#333',
        flex: 1,
        lineHeight: 20,
    },
    checkboxX: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFF',
    },
    infoIcon: {
        marginLeft: 6,
    },
    infoLinkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginTop: 8,
    },
    infoLinkText: {
        fontSize: 13,
        color: '#666',
    },
    infoLinkHighlight: {
        color: COLORS.primary,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    sendResponseButton: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    sendResponseButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    buttonDisabled: {
        backgroundColor: '#CCC',
    },
    sellerResponseDisplay: {
        backgroundColor: '#FFF',
        padding: 16,
        marginBottom: 8,
    },
    responseText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        marginBottom: 12,
    },
    decisionDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    decisionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    decisionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    decisionText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    buyerActions: {
        padding: 16,
        backgroundColor: '#FFF',
        marginBottom: 8,
    },
    actionButton: {
        flexDirection: 'row',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    disputeButton: {
        backgroundColor: '#DC143C',
    },
    closeButton: {
        backgroundColor: '#32CD32',
    },
    actionButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFF',
        marginLeft: 6,
    },
    actionLoadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#FFF',
        marginBottom: 8,
    },
    actionLoadingText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    messagesSection: {
        backgroundColor: '#FFF',
        padding: 16,
        marginBottom: 8,
    },
    noMessages: {
        alignItems: 'center',
        padding: 32,
    },
    noMessagesText: {
        fontSize: 14,
        color: '#999',
        marginTop: 12,
    },
    messageCard: {
        backgroundColor: '#F5F5F5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    systemMessage: {
        backgroundColor: '#E3F2FD',
    },
    messageSender: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    messageText: {
        fontSize: 14,
        color: '#000',
        lineHeight: 18,
    },
    messageTime: {
        fontSize: 11,
        color: '#999',
        marginTop: 4,
    },
    messageInputContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        alignItems: 'flex-end',
    },
    messageInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 14,
        maxHeight: 100,
        marginRight: 8,
    },
    sendButton: {
        backgroundColor: COLORS.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#CCC',
    },
    backButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default IssueDetailScreen;
