import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/TranslationContext';
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
    const { t } = useTranslation();
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
    const [sellerDecision, setSellerDecision] = useState(null); // 'accept' or 'decline' or 'negotiate'
    const [sellerResponseText, setSellerResponseText] = useState('');

    // Negotiation state
    const [suggestionText, setSuggestionText] = useState('');
    const [negotiationDecision, setNegotiationDecision] = useState(null);

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
            Alert.alert(t('Error'), t('Failed to load issue details'));
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
            Alert.alert(t('Error'), t('Please select a decision and provide a response'));
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
                    t('Response Sent'),
                    t('Your response has been sent to the buyer.'),
                    [{ text: t('OK'), onPress: () => loadIssueDetails() }]
                );
                setSellerDecision(null);
                setSellerResponseText('');
            }
        } catch (error) {
            Alert.alert(t('Error'), error.message || t('Failed to send response'));
        } finally {
            setActionLoading(false);
        }
    };

    // Negotiation commands
    const handleSendSuggestion = async () => {
        if (!suggestionText.trim()) return;
        setActionLoading(true);
        try {
            const response = await disputeService.submitNegotiationSuggestion(issueId, suggestionText.trim());
            if (response.success) {
                setSuggestionText('');
                loadIssueDetails();
            }
        } catch (error) {
            Alert.alert(t('Error'), error.message || t('Failed to submit suggestion'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleNegotiationDecision = async () => {
        if (!negotiationDecision) return;
        setActionLoading(true);
        try {
            const response = await disputeService.submitNegotiationDecision(issueId, negotiationDecision);
            if (response.success) {
                loadIssueDetails();
            }
        } catch (error) {
            Alert.alert(t('Error'), error.message || t('Failed to submit decision'));
        } finally {
            setActionLoading(false);
        }
    };

    // Buyer closes issue
    const handleCloseIssue = () => {
        Alert.alert(
            t('Close Issue'),
            t('Are you sure you want to close this issue? This action cannot be undone.'),
            [
                { text: t('Cancel'), style: t('cancel') },
                {
                    text: t('Close'),
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            const response = await disputeService.closeIssue(issueId);
                            if (response.success) {
                                Alert.alert(
                                    t('Issue Closed'),
                                    t('This issue has been closed.'),
                                    [{ text: t('OK'), onPress: () => navigation.goBack() }]
                                );
                            }
                        } catch (error) {
                            Alert.alert(t('Error'), error.message || t('Failed to close issue'));
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
            Alert.alert(t('Error'), t('Failed to send message'));
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
        return colors[status] || '#505050';
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
                    <Text style={styles.loadingText}>{t('Loading issue details...')}</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!issue) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#CCC" />
                    <Text style={styles.errorText}>{t('Issue not found')}</Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>{t('Go Back')}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Check user role
    const isSeller = issue.other_party_id === currentUserId;
    const isBuyer = issue.created_by === currentUserId;
    const canRespond = isSeller && issue.status === 'open';
    const sellerHasResponded = !!issue.seller_decision;
    const canBuyerAct = isBuyer && !['closed_by_buyer', 'escalated_to_dispute', 'negotiating'].includes(issue.status);

    const isNegotiating = issue.status === 'negotiating' || issue.seller_decision === 'negotiate';
    const mySuggestionSubmitted = isBuyer ? !!issue.buyer_suggestion : !!issue.seller_suggestion;
    const bothSuggestionsSubmitted = !!issue.buyer_suggestion && !!issue.seller_suggestion;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.headerBackButton}
                >
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>
                        {issue.seller_confirmed && issue.buyer_confirmed
                            ? t('Settled Issue #') + issue.issue_number
                            : t('An Issue #') + issue.issue_number}
                    </Text>
                </View>
                <View style={styles.headerRight} />
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Handshake Icon with Scales */}
                <View style={styles.iconContainer}>
                    <View style={styles.iconWrapper}>
                        <FontAwesome name="balance-scale" size={30} color="#505050" style={styles.balanceIcon} />
                        <FontAwesome name="handshake-o" size={50} color="#505050" />
                    </View>
                </View>

                {/* Creation Message */}
                <View style={styles.creationMessage}>
                    <Text style={styles.creationText}>
                        An Issue #{issue.issue_number} was created
                    </Text>
                    <Text style={styles.creationTime}>
                        {calculateTimeRemaining(issue.created_at) || '2h ago'}
                    </Text>
                </View>

                {/* Info Card - Simplified for Screenshot match */}
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t('Item:')}</Text>
                        <Text style={styles.infoValue}>{issue.product_name || issue.ad_title}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t('Issuer:')}</Text>
                        <Text style={styles.infoValue}>{isBuyer ? 'You' : issue.other_party_name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t('Issued to:')}</Text>
                        <Text style={styles.infoValue}>{isSeller ? 'You' : issue.other_party_name}</Text>
                    </View>
                </View>

                {/* Buyer's Issue Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitleCaps}>{t("BUYER'S ISSUE")}</Text>
                        <Text style={styles.sectionTime}>{t('1h ago')}</Text>
                    </View>

                    {sellerHasResponded || isNegotiating ? (
                        <View>
                            <TouchableOpacity
                                style={styles.viewIssueLinkSimple}
                                onPress={() => navigation.navigate('AttachEvidence', {
                                    issueId: issue.id,
                                    issueNumber: issue.issue_number,
                                    userRole: isBuyer ? 'buyer' : 'seller',
                                    showIssueDetails: true
                                })}
                            >
                                <Text style={styles.viewIssueLinkTextSimple}>{t('View Issue & Request')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.viewIssueLinkSimple}
                                onPress={() => navigation.navigate('AttachEvidence', { issueId: issue.id, userRole: 'buyer', readOnly: true })}
                            >
                                <Text style={styles.viewIssueLinkTextSimple}>{t('View Uploaded evidence')}</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.fieldLabelSmall}>{t('The Issue with the item:')}</Text>
                            <View style={styles.bubbleMessage}>
                                <Text style={styles.issueDescription}>{issue.issue_description}</Text>
                            </View>

                            {issue.buyer_request && (
                                <>
                                    <Text style={styles.fieldLabelSmall}>{t('Issuers Requests:')}</Text>
                                    <View style={styles.bubbleMessage}>
                                        <Text style={styles.issueDescription}>{issue.buyer_request}</Text>
                                    </View>
                                </>
                            )}
                        </>
                    )}
                </View>

                {/* Seller Response Section (for seller to respond) */}
                {canRespond && !actionLoading && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitleCaps}>{t("SELLER'S RESPONSE")}</Text>
                            <Text style={styles.sectionTime}>{t('1h ago')}</Text>
                        </View>
                        <Text style={styles.fieldLabelSmall}>{t('Response to the Issue:')}</Text>

                        {/* Response text */}
                        <View style={styles.bubbleInputContainer}>
                            <TextInput
                                style={styles.responseTextArea}
                                placeholder={t('Explain your decision...')}
                                placeholderTextColor="#303234"
                                multiline
                                numberOfLines={4}
                                value={sellerResponseText}
                                onChangeText={setSellerResponseText}
                                maxLength={1000}
                            />
                        </View>

                        {/* Decision checkboxes */}
                        <Text style={styles.sectionTitleCaps}>{t("SELLER'S DECISION")}</Text>

                        <View style={styles.decisionOptions}>
                            <TouchableOpacity
                                style={styles.checkboxOption}
                                onPress={() => setSellerDecision('accept')}
                            >
                                <Text style={styles.checkboxLabel}>{t('I Accept the Request and Cancel the deal!')}</Text>
                                <View style={[
                                    styles.radioCircle,
                                    sellerDecision === 'accept' && styles.radioCircleSelectedBlack
                                ]} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.checkboxOption}
                                onPress={() => setSellerDecision('decline')}
                            >
                                <Text style={styles.checkboxLabel}>{t('I decline the Request and keep to the Agreement!')}</Text>
                                <View style={[
                                    styles.radioCircle,
                                    sellerDecision === 'decline' && styles.radioCircleSelectedGray
                                ]} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.checkboxOptionNoBorder}
                                onPress={() => setSellerDecision('negotiate')}
                            >
                                <Text style={styles.checkboxLabel}>{t('Continue and Negotiate to find a solution.')}</Text>
                                <View style={[
                                    styles.radioCircle,
                                    sellerDecision === 'negotiate' && styles.radioCircleSelectedGray
                                ]} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.subtextSmall}>
                            {sellerDecision === 'accept' || sellerDecision === null
                                ? t("Please note! Accepting cancels the deal and returns Buyer's Fee to Buyer!")
                                : t("Please note! Cancellation returns Buyer's Fee to Buyer!")}
                        </Text>

                        {/* Send Response Button */}
                        <TouchableOpacity
                            style={[
                                styles.sendResponseButtonRounded,
                                (!sellerDecision || !sellerResponseText.trim()) && styles.buttonDisabled
                            ]}
                            onPress={handleSendResponse}
                            disabled={!sellerDecision || !sellerResponseText.trim()}
                        >
                            <Text style={styles.sendResponseButtonTextGray}>{t('Send Response to')}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Display Seller's Response (Post-Response View) */}
                {sellerHasResponded && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitleCaps}>{t("SELLER'S RESPONSE")}</Text>
                            <Text style={styles.sectionTime}>{t('1h ago')}</Text>
                        </View>

                        {isNegotiating ? (
                            <View>
                                <TouchableOpacity style={styles.viewIssueLinkSimple}>
                                    <Text style={styles.viewIssueLinkTextSimple}>{t('View Response to the Issue')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.viewIssueLinkSimple}>
                                    <Text style={styles.viewIssueLinkTextSimple}>{t('View Uploaded evidence')}</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            isSeller ? (
                                <TouchableOpacity style={styles.viewIssueLinkSimple}>
                                    <Text style={styles.viewIssueLinkTextSimple}>{t('View Response to the Issue')}</Text>
                                </TouchableOpacity>
                            ) : (
                                <>
                                    <Text style={styles.fieldLabelSmall}>{t('Response to the Issue:')}</Text>
                                    <View style={styles.bubbleMessage}>
                                        <Text style={styles.issueDescription}>{issue.seller_response_text || t('No response text provided.')}</Text>
                                    </View>
                                </>
                            )
                        )}

                        {!isNegotiating && (
                            <>
                                {/* SELLER'S DECISION display */}
                                <View style={styles.decisionDisplayRow}>
                                    <Text style={styles.sectionTitleCaps}>{t("DECISIONS BY SELLER AND BUYER")}</Text>
                                </View>

                                {/* Seller row */}
                                <View style={styles.checkboxOptionInline}>
                                    <Text style={styles.checkboxLabelInline}>
                                        <Text style={{ fontWeight: '700' }}>SELLER: </Text>
                                        {issue.seller_decision === 'accept'
                                            ? t('I Accept the Request and Cancel the deal!')
                                            : issue.seller_decision === 'decline'
                                                ? t('I decline the Request and keep to the original Deal!')
                                                : t('Continue and Negotiate to find a solution.')}
                                    </Text>
                                    <View style={[
                                        styles.radioCircle,
                                        styles.radioCircleSelectedBlack
                                    ]} />
                                </View>

                                {/* Buyer row (awaiting) */}
                                <View style={styles.checkboxOptionInline}>
                                    <Text style={styles.checkboxLabelInline}>
                                        <Text style={{ fontWeight: '700' }}>BUYER: </Text>
                                        {t('Awaiting buyer decision...')}
                                    </Text>
                                    <View style={styles.radioCircle} />
                                </View>

                                <Text style={styles.subtextSmall}>
                                    {issue.seller_decision === 'accept'
                                        ? t("Please note! Accepting cancels the deal and returns Buyer's Fee to Buyer!")
                                        : t("Please note! Cancellation returns Buyer's Fee to Buyer!")}
                                </Text>
                            </>
                        )}

                        {/* Evidence and Chat Links (Added for Settled/Responded state) */}
                        <View style={styles.evidenceLinksRow}>
                            <View style={styles.linkColumn}>
                                <TouchableOpacity onPress={() => navigation.navigate('AttachEvidence', { issueId: issue.id, userRole: 'seller', readOnly: true })}>
                                    <Text style={styles.evidenceLinkText}>{t('Seller evidence')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => navigation.navigate('ActionCenterMessagesScreen', { conversationId: issue.conversation_id || issue.id })}>
                                    <Text style={styles.evidenceLinkText}>{t('My Chat history')}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.linkColumn}>
                                <TouchableOpacity onPress={() => navigation.navigate('AttachEvidence', { issueId: issue.id, userRole: 'buyer', readOnly: true })}>
                                    <Text style={styles.evidenceLinkText}>{t('Buyer evidence')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => navigation.navigate('ActionCenterMessagesScreen', { conversationId: issue.conversation_id || issue.id })}>
                                    <Text style={styles.evidenceLinkText}>{t('My Chat history')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {/* NEGOTIATING FLOW */}
                {isNegotiating && (
                    <View style={styles.section}>
                        {!bothSuggestionsSubmitted && !mySuggestionSubmitted && (
                            <View>
                                <Text style={styles.fieldLabelSmall}>{isBuyer ? t("Buyer's suggestion for settlement:") : t("Seller's suggestion for settlement:")}</Text>
                                <View style={styles.bubbleInputContainer}>
                                    <TextInput
                                        style={styles.responseTextArea}
                                        placeholder={t('Let us settle the matter...')}
                                        placeholderTextColor="#303234"
                                        multiline
                                        numberOfLines={4}
                                        value={suggestionText}
                                        onChangeText={setSuggestionText}
                                        maxLength={1000}
                                    />
                                </View>
                                <Text style={styles.fieldLabelSmall}>{t('Evidence for the issue:')}</Text>
                                <TouchableOpacity style={styles.viewIssueLinkSimple}>
                                    <Text style={styles.viewIssueLinkTextSimple}>{t('Upload evidence')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.viewIssueLinkSimple}>
                                    <Text style={styles.viewIssueLinkTextSimple}>{t('Upload evidence')}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.sendResponseButtonRounded,
                                        (!suggestionText.trim()) && styles.buttonDisabled
                                    ]}
                                    onPress={handleSendSuggestion}
                                    disabled={!suggestionText.trim() || actionLoading}
                                >
                                    <Text style={styles.sendResponseButtonTextGray}>{t('Give Suggestion')}</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {!bothSuggestionsSubmitted && mySuggestionSubmitted && (
                            <View>
                                <Text style={styles.fieldLabelSmall}>{t('Waiting for the other party to provide their suggestion...')}</Text>
                            </View>
                        )}
                        {bothSuggestionsSubmitted && (
                            <View>
                                <Text style={styles.fieldLabelSmall}>{t("Buyer's suggestion for settlement:")}</Text>
                                <View style={styles.bubbleMessage}>
                                    <Text style={styles.issueDescription}>{issue.buyer_suggestion}</Text>
                                </View>
                                <Text style={styles.fieldLabelSmall}>{t('Evidence for the issue:')}</Text>
                                <TouchableOpacity style={styles.viewIssueLinkSimple}>
                                    <Text style={styles.viewIssueLinkTextSimple}>{t('Upload evidence')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.viewIssueLinkSimple}>
                                    <Text style={styles.viewIssueLinkTextSimple}>{t('Upload evidence')}</Text>
                                </TouchableOpacity>

                                <Text style={[styles.fieldLabelSmall, { marginTop: 20 }]}>{t("Seller's suggestion for settlement:")}</Text>
                                <View style={styles.bubbleMessage}>
                                    <Text style={styles.issueDescription}>{issue.seller_suggestion}</Text>
                                </View>
                                <Text style={styles.fieldLabelSmall}>{t('Evidence for the issue:')}</Text>
                                <TouchableOpacity style={styles.viewIssueLinkSimple}>
                                    <Text style={styles.viewIssueLinkTextSimple}>{t('Upload evidence')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.viewIssueLinkSimple}>
                                    <Text style={styles.viewIssueLinkTextSimple}>{t('Upload evidence')}</Text>
                                </TouchableOpacity>

                                <View style={styles.decisionDisplayRow}>
                                    <Text style={styles.sectionTitleCaps}>{t("DECISIONS BY SELLER AND BUYER")}</Text>
                                </View>

                                <View style={styles.decisionOptions}>
                                    <TouchableOpacity style={styles.checkboxOption} onPress={() => setNegotiationDecision('accept')}>
                                        <Text style={styles.checkboxLabel}>{t('Accept the negotiated settlement!')}</Text>
                                        <View style={[styles.radioCircle, negotiationDecision === 'accept' && styles.radioCircleSelectedGray]} />
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.checkboxOption} onPress={() => setNegotiationDecision('decline')}>
                                        <Text style={styles.checkboxLabel}>{t('I decline the negotiated settlement!')}</Text>
                                        <View style={[styles.radioCircle, negotiationDecision === 'decline' && styles.radioCircleSelectedGray]} />
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.checkboxOptionNoBorder} onPress={() => { }}>
                                        <Text style={styles.checkboxLabel}>{t('Continue and Negotiate to find a solution.')}</Text>
                                        <View style={[styles.radioCircle]} />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={[styles.sendResponseButtonRounded, (!negotiationDecision) && styles.buttonDisabled]}
                                    onPress={handleNegotiationDecision}
                                    disabled={!negotiationDecision || actionLoading}
                                >
                                    <Text style={styles.sendResponseButtonTextGray}>{t('Give Decision')}</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {/* STATUS & ACTION BUTTONS */}
                {(issue.status === 'settled' || (issue.status === 'seller_responded' && issue.seller_decision === 'accept')) && (
                    <View style={styles.statusBlock}>
                        <Text style={styles.statusGreenBold}>{t('The Issue has been settled successfully!')}</Text>
                        <Text style={styles.statusGreenSmall}>{t("Buyer's Fee will be returned in 2-4 days to Buyer.")}</Text>

                        <View style={styles.actionButtonsContainer}>
                            <TouchableOpacity style={styles.actionButtonRoundedLarge} onPress={handleCloseIssue} disabled={actionLoading}>
                                <Text style={styles.actionButtonTextGrayLarge}>{t('Close the Issue')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {issue.status === 'seller_responded' && issue.seller_decision === 'decline' && (
                    <View style={styles.statusBlock}>
                        <Text style={styles.statusRedBold}>{t('The Issue has not been settled!')}</Text>
                        <Text style={styles.statusBlackBold}>{t('Consider negotiating')}</Text>

                        <View style={styles.actionButtonsContainer}>
                            <TouchableOpacity style={styles.actionButtonRoundedLarge} onPress={handleDisputeIssue} disabled={actionLoading}>
                                <Text style={styles.actionButtonTextGrayLarge}>{t('Dispute the Issue')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionButtonRoundedLarge} onPress={handleCloseIssue} disabled={actionLoading}>
                                <Text style={styles.actionButtonTextGrayLarge}>{t('Close the Issue')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionButtonRoundedLarge} onPress={() => { /* Placeholder */ }} disabled={actionLoading}>
                                <Text style={styles.actionButtonTextGrayLarge}>{t('Continue Negotiating')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {issue.status === 'escalated_to_dispute' && (
                    <View style={styles.statusBlock}>
                        <Text style={styles.statusRedBold}>{t('This Issue has been escalated to a dispute.')}</Text>
                        <View style={styles.actionButtonsContainer}>
                            <TouchableOpacity style={styles.actionButtonRoundedLarge} onPress={() => { /* Navigate to Dispute detail later */ }}>
                                <Text style={styles.actionButtonTextGrayLarge}>{t('View Dispute')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {issue.status === 'closed_by_buyer' && (
                    <View style={styles.statusBlock}>
                        <Text style={styles.statusBlackBold}>{t('This Issue has been closed.')}</Text>
                    </View>
                )}

                {/* Footer Info Link */}
                <View style={styles.footerInfoLink}>
                    <Text style={styles.footerLinkText}>
                        More on{' '}
                        <Text style={styles.footerLinkHighlight}>{t('Dispute Resolution')}</Text>
                    </Text>
                    <Ionicons name="information-circle-outline" size={20} color="#505050" style={styles.footerIcon} />
                </View>

                {/* Messages Section - Optional based on design match */}
                {!['settled', 'closed_by_buyer', 'escalated_to_dispute'].includes(issue.status) && (
                    <View style={styles.messagesSection}>
                        <Text style={styles.sectionTitle}>{t('Messages')}</Text>
                        {messages.length === 0 ? (
                            <View style={styles.noMessages}>
                                <Text style={styles.noMessagesText}>{t('No messages yet')}</Text>
                            </View>
                        ) : (
                            messages.map((message) => (
                                <View key={message.id} style={styles.messageCard}>
                                    <Text style={styles.messageText}>{message.message}</Text>
                                </View>
                            ))
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerBackButton: {
        padding: 4,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#000',
    },
    headerRight: {
        width: 32,
    },
    content: {
        flex: 1,
    },
    iconContainer: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    iconWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    balanceIcon: {
        marginBottom: -10,
        zIndex: 1,
    },
    creationMessage: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    creationText: {
        fontSize: 14,
        color: '#505050',
    },
    creationTime: {
        fontSize: 13,
        color: '#303234',
    },
    infoCard: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        paddingVertical: 4,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#505050',
        width: 80,
    },
    infoValue: {
        fontSize: 14,
        color: '#000',
        fontWeight: '500',
    },
    section: {
        paddingHorizontal: 16,
        marginBottom: 24,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitleCaps: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000',
        letterSpacing: 0.5,
    },
    sectionTime: {
        fontSize: 12,
        color: '#303234',
    },
    fieldLabelSmall: {
        fontSize: 13,
        fontWeight: '600',
        color: '#505050',
        marginBottom: 8,
    },
    bubbleMessage: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    issueDescription: {
        fontSize: 14,
        color: '#303234',
        lineHeight: 20,
    },
    viewIssueLinkSimple: {
        marginBottom: 8,
    },
    viewIssueLinkTextSimple: {
        fontSize: 14,
        color: '#003366',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    decisionDisplayRow: {
        marginTop: 8,
        marginBottom: 12,
    },
    checkboxOptionInline: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    checkboxLabelInline: {
        fontSize: 14,
        color: '#303234',
        flex: 1,
    },
    checkboxOptionNoBorder: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    subtextSmall: {
        fontSize: 10,
        color: '#888',
        marginTop: 4,
        marginBottom: 8,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#000',
        backgroundColor: '#FFF',
    },
    radioCircleSelectedBlack: {
        backgroundColor: '#000',
        borderWidth: 4,
        borderColor: '#000',
    },
    radioCircleSelectedGray: {
        backgroundColor: '#CCC',
        borderWidth: 0,
    },
    statusBlock: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    statusGreenBold: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#00C853',
        marginBottom: 4,
    },
    statusGreenSmall: {
        fontSize: 11,
        color: '#00C853',
        marginBottom: 20,
    },
    statusRedBold: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    statusBlackBold: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 20,
    },
    statusX: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000',
    },
    successMessageContainer: {
        marginTop: 30,
        marginBottom: 10,
        alignItems: 'center',
    },
    successMessageText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#00C853',
        textAlign: 'center',
    },
    actionButtonsContainer: {
        width: '100%',
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    actionButtonRoundedLarge: {
        backgroundColor: '#F2F2F2',
        paddingVertical: 14,
        borderRadius: 24,
        alignItems: 'center',
        marginBottom: 12,
        width: '100%',
    },
    actionButtonTextGrayLarge: {
        fontSize: 17,
        fontWeight: '600',
        color: '#303234',
    },
    footerInfoLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    footerLinkText: {
        fontSize: 12,
        color: '#303234',
    },
    footerLinkHighlight: {
        color: '#003366',
        textDecorationLine: 'underline',
    },
    footerIcon: {
        marginLeft: 6,
    },
    messagesSection: {
        padding: 16,
        backgroundColor: '#FAFAFA',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 12,
    },
    noMessagesText: {
        fontSize: 13,
        color: '#999',
    },
    messageCard: {
        padding: 10,
        backgroundColor: '#FFF',
        borderRadius: 8,
        marginBottom: 8,
    },
    messageText: {
        fontSize: 14,
        color: '#333',
    },
    bubbleInputContainer: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        padding: 4,
        marginBottom: 16,
    },
    responseTextArea: {
        padding: 12,
        fontSize: 14,
        color: '#000',
        minHeight: 100,
        textAlignVertical: 'top',
    },
    decisionOptions: {
        marginTop: 12,
    },
    checkboxOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    sendResponseButtonRounded: {
        backgroundColor: '#F2F2F2',
        paddingVertical: 14,
        borderRadius: 24,
        alignItems: 'center',
        marginTop: 20,
    },
    sendResponseButtonTextGray: {
        fontSize: 16,
        fontWeight: '600',
        color: '#303234',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});

export default IssueDetailScreen;
