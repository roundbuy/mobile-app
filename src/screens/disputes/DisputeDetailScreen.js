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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/theme';
import disputeService from '../../services/disputeService';

const DisputeDetailScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { disputeId } = route.params || {};
    const [loading, setLoading] = useState(true);
    const [dispute, setDispute] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    // Seller response states
    const [sellerResponse, setSellerResponse] = useState('');
    const [sellerDecision, setSellerDecision] = useState(null); // 'accept' or 'decline'

    useEffect(() => {
        loadCurrentUser();
        loadDisputeDetails();
    }, []);

    const loadCurrentUser = async () => {
        try {
            console.log('=== LOADING USER FROM STORAGE ===');

            // Try 'user' key first
            let userStr = await AsyncStorage.getItem('user');
            console.log('User from "user" key:', userStr);

            // Try 'userData' key
            if (!userStr) {
                userStr = await AsyncStorage.getItem('userData');
                console.log('User from "userData" key:', userStr);
            }

            // Try 'currentUser' key
            if (!userStr) {
                userStr = await AsyncStorage.getItem('currentUser');
                console.log('User from "currentUser" key:', userStr);
            }

            // Try '@user' key
            if (!userStr) {
                userStr = await AsyncStorage.getItem('@user');
                console.log('User from "@user" key:', userStr);
            }

            // Try '@roundbuy:user_data' key (CORRECT KEY!)
            if (!userStr) {
                userStr = await AsyncStorage.getItem('@roundbuy:user_data');
                console.log('User from "@roundbuy:user_data" key:', userStr);
            }

            if (userStr) {
                const user = JSON.parse(userStr);
                console.log('Parsed user:', user);
                console.log('User ID:', user.id);
                setCurrentUserId(user.id);
            } else {
                console.log('❌ No user found in AsyncStorage!');
                // List all keys to debug
                const allKeys = await AsyncStorage.getAllKeys();
                console.log('All AsyncStorage keys:', allKeys);
            }
            console.log('=================================');
        } catch (error) {
            console.error('Load user error:', error);
        }
    };

    const loadDisputeDetails = async () => {
        try {
            const response = await disputeService.getDisputeById(disputeId);
            if (response.success) {
                setDispute(response.data);
                console.log('=== DISPUTE DATA FROM API ===');
                console.log('Full dispute object:', JSON.stringify(response.data, null, 2));
                console.log('============================');
                // Pre-fill seller response if exists
                if (response.data.seller_response) {
                    setSellerResponse(response.data.seller_response);
                }
                if (response.data.seller_decision) {
                    setSellerDecision(response.data.seller_decision);
                }
            }
        } catch (error) {
            console.error('Load dispute error:', error);
            Alert.alert(t('Error'), t('Failed to load dispute details'));
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    const handleSendResponse = async () => {
        if (!sellerResponse.trim()) {
            Alert.alert(t('Error'), t('Please enter your response'));
            return;
        }
        if (!sellerDecision) {
            Alert.alert(t('Error'), t('Please select your decision'));
            return;
        }

        setActionLoading(true);
        try {
            await disputeService.sendSellerResponse(disputeId, {
                response: sellerResponse,
                decision: sellerDecision,
            });
            Alert.alert(t('Success'), t('Response sent to buyer'));
            loadDisputeDetails(); // Reload to show updated state
        } catch (error) {
            Alert.alert(t('Error'), t('Failed to send response'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleCloseDispute = () => {
        Alert.alert(
            t('Close Dispute'),
            t('Are you sure you want to close this dispute?'),
            [
                { text: t('Cancel'), style: t('cancel') },
                {
                    text: t('Close'),
                    style: t('destructive'),
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            await disputeService.closeDispute(disputeId);
                            Alert.alert(t('Success'), t('Dispute closed successfully'));
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert(t('Error'), t('Failed to close dispute'));
                        } finally {
                            setActionLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleEscalateToClaim = () => {
        navigation.navigate('CreateClaim', { dispute });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
            </SafeAreaView>
        );
    }

    if (!dispute) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>{t('Dispute not found')}</Text>
            </SafeAreaView>
        );
    }

    // Determine if current user is the seller (respondent)
    // seller_id is the respondent, user_id is the buyer/issuer
    const isSeller = currentUserId && dispute.seller_id && currentUserId === dispute.seller_id;
    const hasSellerResponded = dispute.seller_response && dispute.seller_response.trim() !== '';

    // Debug logs
    console.log('=== DISPUTE DEBUG ===');
    console.log('Current User ID:', currentUserId);
    console.log('Dispute User ID (Buyer):', dispute.user_id);
    console.log('Dispute Seller ID:', dispute.seller_id);
    console.log('Is Seller?', isSeller);
    console.log('Has Seller Responded?', hasSellerResponded);
    console.log('Seller Response:', dispute.seller_response);
    console.log('====================');

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.headerBackButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Dispute #{dispute.dispute_number}</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.content}>
                {/* Icon */}
                <View style={styles.iconContainer}>
                    <FontAwesome name="clipboard" size={60} color="#666" />
                    <View style={styles.checkBadge}>
                        <Ionicons name="checkmark-circle" size={24} color="#32CD32" />
                    </View>
                </View>

                {/* Creation Message */}
                <View style={styles.creationMessage}>
                    <Text style={styles.creationText}>
                        A Disputed Issue #{dispute.dispute_number} was created
                    </Text>
                    <Text style={styles.creationTime}>{formatDate(dispute.created_at)}</Text>
                </View>

                {/* Product Info */}
                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t('Product:')}</Text>
                        <Text style={styles.infoValue}>{dispute.ad_title || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t('Issuer:')}</Text>
                        <Text style={styles.infoValue}>{dispute.user_name || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t('Issued to:')}</Text>
                        <Text style={styles.infoValue}>{dispute.respondent_name || 'Seller'}</Text>
                    </View>
                </View>

                {/* Link to view buyer's issue */}
                <TouchableOpacity style={styles.linkButton}>
                    <Text style={styles.linkText}>
                        To view Buyer's Issue & Request click{' '}
                        <Text style={styles.linkHighlight}>{t('here')}</Text>
                    </Text>
                </TouchableOpacity>

                {/* Buyer's Issue */}
                <View style={styles.issueSection}>
                    <View style={styles.issueSectionHeader}>
                        <Text style={styles.sectionTitle}>{t("BUYER'S ISSUE")}</Text>
                        <Text style={styles.sectionTime}>{formatDate(dispute.created_at)}</Text>
                    </View>

                    <Text style={styles.fieldLabel}>{t('The Disputed Issue with the product:')}</Text>
                    <View style={styles.textBox}>
                        <Text style={styles.textBoxContent}>{dispute.problem_description}</Text>
                    </View>

                    <Text style={styles.fieldLabel}>{t('Issuers Demand:')}</Text>
                    <View style={styles.textBox}>
                        <Text style={styles.textBoxContent}>{dispute.dispute_category || dispute.buyer_demand || 'Full refund requested'}</Text>
                    </View>

                    {/* Buyer's Evidence */}
                    <TouchableOpacity style={styles.evidenceLink}>
                        <Text style={styles.linkText}>
                            Buyer's Upload evidence in PDF format{' '}
                            <Text style={styles.linkHighlight}>{t('Chat history.pdf (uploaded) click to view')}</Text>
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Seller's Response Section */}
                {isSeller && !hasSellerResponded ? (
                    // SELLER VIEW - Pending Response (Image 1)
                    <View style={styles.responseSection}>
                        <View style={styles.issueSectionHeader}>
                            <Text style={styles.sectionTitle}>{t("SELLER'S RESPONSE")}</Text>
                            <Text style={styles.sectionTime}>{formatDate(new Date())}</Text>
                        </View>

                        <Text style={styles.fieldLabel}>{t('Response to the Disputed Issue:')}</Text>
                        <TextInput
                            style={styles.textInput}
                            multiline
                            numberOfLines={6}
                            placeholder={t("Enter your response to the buyer's issue...")}
                            value={sellerResponse}
                            onChangeText={setSellerResponse}
                            textAlignVertical="top"
                        />

                        <Text style={styles.fieldLabel}>{t("SELLER'S DECISION")}</Text>
                        <View style={styles.decisionContainer}>
                            <TouchableOpacity
                                style={styles.decisionTextRow}
                                onPress={() => setSellerDecision('accept')}
                            >
                                <View style={styles.decisionRowContent}>
                                    <Ionicons
                                        name={sellerDecision === 'accept' ? 'checkbox' : 'square-outline'}
                                        size={20}
                                        color={sellerDecision === 'accept' ? COLORS.primary : '#999'}
                                        style={styles.checkbox}
                                    />
                                    <Text style={[
                                        styles.decisionRowText,
                                        sellerDecision === 'accept' && styles.decisionRowTextSelected
                                    ]}>{t('I accept the Demand and Cancel the deal!')}</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.decisionTextRow}
                                onPress={() => setSellerDecision('decline')}
                            >
                                <View style={styles.decisionRowContent}>
                                    <Ionicons
                                        name={sellerDecision === 'decline' ? 'checkbox' : 'square-outline'}
                                        size={20}
                                        color={sellerDecision === 'decline' ? COLORS.primary : '#999'}
                                        style={styles.checkbox}
                                    />
                                    <Text style={[
                                        styles.decisionRowText,
                                        sellerDecision === 'decline' && styles.decisionRowTextSelected
                                    ]}>{t('I decline the Demand and keep to the Agreement!')}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Seller Upload Evidence */}
                        <TouchableOpacity style={styles.evidenceLink}>
                            <Text style={styles.linkText}>
                                Seller Upload evidence in PDF format click{' '}
                                <Text style={styles.linkHighlight}>{t('here')}</Text>
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.evidenceLink}>
                            <Text style={styles.linkText}>
                                <Text style={styles.linkHighlight}>{t('My Chat history.pdf (uploaded)')}</Text> click to view
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : hasSellerResponded && (
                    // SELLER HAS RESPONDED - Show response (Image 2)
                    <View style={styles.responseSection}>
                        <View style={styles.issueSectionHeader}>
                            <Text style={styles.sectionTitle}>{t("SELLER'S RESPONSE")}</Text>
                            <Text style={styles.sectionTime}>{formatDate(dispute.updated_at)}</Text>
                        </View>

                        <Text style={styles.fieldLabel}>{t('Response to the Issue:')}</Text>
                        <View style={styles.textBox}>
                            <Text style={styles.textBoxContent}>{dispute.seller_response}</Text>
                        </View>

                        <Text style={styles.fieldLabel}>{t("SELLER'S DECISION")}</Text>
                        <View style={styles.decisionBox}>
                            <Text style={styles.decisionText}>
                                {dispute.seller_decision === 'accept'
                                    ? 'I accept the Request and Cancel the deal!'
                                    : 'I decline the Request and keep to the Agreement!'}
                            </Text>
                        </View>

                        {/* Seller's Evidence */}
                        <TouchableOpacity style={styles.evidenceLink}>
                            <Text style={styles.linkText}>
                                Seller's Uploaded evidence in PDF format{' '}
                                <Text style={styles.linkHighlight}>{t('My Chat history.pdf (uploaded) click to view')}</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Info Link */}
                <View style={styles.infoLinkContainer}>
                    <Text style={styles.infoLinkText}>
                        More information on Issues & Disputes,{' '}
                        <Text style={styles.infoLinkHighlight}>{t('click here')}</Text>
                    </Text>
                    <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} style={styles.infoIcon} />
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    {isSeller && !hasSellerResponded ? (
                        // Seller pending response - Show "Send Response to Buyer"
                        <TouchableOpacity
                            style={styles.sendResponseButton}
                            onPress={handleSendResponse}
                            disabled={actionLoading}
                        >
                            <Text style={styles.sendResponseButtonText}>
                                {actionLoading ? 'Sending...' : 'Send Response to Buyer'}
                            </Text>
                        </TouchableOpacity>
                    ) : isSeller && hasSellerResponded ? (
                        // Seller has responded - Show confirmation message
                        <Text style={styles.waitingText}>{t("Your response has been sent to the buyer. Waiting for buyer's action...")}</Text>
                    ) : !isSeller && hasSellerResponded && dispute.seller_decision === 'decline' ? (
                        // BUYER view - Seller declined - Show Escalate and Close buttons
                        <>
                            <TouchableOpacity
                                style={styles.escalateButton}
                                onPress={handleEscalateToClaim}
                                disabled={actionLoading}
                            >
                                <Text style={styles.escalateButtonText}>{t('Escalate to Claim')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={handleCloseDispute}
                                disabled={actionLoading}
                            >
                                <Text style={styles.closeButtonText}>{t('Close the Dispute')}</Text>
                            </TouchableOpacity>
                        </>
                    ) : !isSeller && hasSellerResponded && dispute.seller_decision === 'accept' ? (
                        // BUYER view - Seller accepted - Show Close button only
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleCloseDispute}
                            disabled={actionLoading}
                        >
                            <Text style={styles.closeButtonText}>{t('Close the Dispute')}</Text>
                        </TouchableOpacity>
                    ) : !isSeller && !hasSellerResponded ? (
                        // BUYER view - waiting for seller response
                        <Text style={styles.waitingText}>{t("Waiting for seller's response...")}</Text>
                    ) : null}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
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
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    iconContainer: {
        alignItems: 'center',
        paddingVertical: 24,
        position: 'relative',
    },
    checkBadge: {
        position: 'absolute',
        bottom: 20,
        right: '38%',
    },
    creationMessage: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    creationText: {
        fontSize: 14,
        color: '#666',
    },
    creationTime: {
        fontSize: 12,
        color: '#999',
    },
    infoSection: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    infoValue: {
        fontSize: 14,
        color: '#000',
    },
    linkButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    linkText: {
        fontSize: 13,
        color: '#666',
    },
    linkHighlight: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    issueSection: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    responseSection: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    issueSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        letterSpacing: 0.5,
    },
    sectionTime: {
        fontSize: 12,
        color: '#999',
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginTop: 12,
        marginBottom: 8,
    },
    textBox: {
        backgroundColor: '#F8F8F8',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    textBoxContent: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    textInput: {
        backgroundColor: '#F8F8F8',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 14,
        color: '#333',
        minHeight: 120,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    decisionOption: {
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 14,
        marginBottom: 12,
    },
    decisionOptionSelected: {
        borderColor: COLORS.primary,
        backgroundColor: '#E8F4FD',
    },
    decisionOptionText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    decisionOptionTextSelected: {
        color: '#000',
        fontWeight: '600',
    },
    decisionContainer: {
        backgroundColor: '#F8F8F8',
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
        marginBottom: 12,
    },
    decisionTextRow: {
        paddingVertical: 8,
    },
    decisionRowContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        marginRight: 10,
    },
    decisionRowText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    decisionRowTextSelected: {
        color: '#000',
        fontWeight: '600',
    },
    decisionBox: {
        backgroundColor: '#E8F4FD',
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
    },
    decisionText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    evidenceLink: {
        paddingVertical: 8,
    },
    infoLinkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
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
    infoIcon: {
        marginLeft: 6,
    },
    actionButtons: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        gap: 12,
    },
    sendResponseButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    sendResponseButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    escalateButton: {
        backgroundColor: '#FF6B6B',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    escalateButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    closeButton: {
        backgroundColor: '#FFF',
        paddingVertical: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    waitingText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    errorText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginTop: 50,
    },
});

export default DisputeDetailScreen;
