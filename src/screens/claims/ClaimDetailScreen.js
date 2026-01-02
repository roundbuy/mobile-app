import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/theme';
import claimService from '../../services/claimService';

const ClaimDetailScreen = ({ route, navigation }) => {
    const { claimId } = route.params;
    const [claim, setClaim] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        loadCurrentUser();
        loadClaimDetails();
    }, []);

    const loadCurrentUser = async () => {
        try {
            const userStr = await AsyncStorage.getItem('@roundbuy:user_data');
            if (userStr) {
                const user = JSON.parse(userStr);
                setCurrentUserId(user.id);
            }
        } catch (error) {
            console.error('Load user error:', error);
        }
    };

    const loadClaimDetails = async () => {
        try {
            const response = await claimService.getClaimById(claimId);
            if (response.success) {
                setClaim(response.data);
            }
        } catch (error) {
            console.error('Load claim error:', error);
            Alert.alert('Error', 'Failed to load claim details');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return '#FFA726';
            case 'under_review':
                return '#42A5F5';
            case 'resolved':
                return '#66BB6A';
            case 'closed':
                return '#999';
            default:
                return '#999';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'Pending Review';
            case 'under_review':
                return 'Under Review';
            case 'resolved':
                return 'Resolved';
            case 'closed':
                return 'Closed';
            default:
                return status;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent':
                return '#F44336';
            case 'high':
                return '#FF9800';
            case 'medium':
                return '#FFC107';
            case 'low':
                return '#4CAF50';
            default:
                return '#999';
        }
    };

    const handleViewDispute = () => {
        if (claim?.dispute_id) {
            navigation.navigate('DisputeDetail', { disputeId: claim.dispute_id });
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!claim) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Claim not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const isBuyer = currentUserId && claim.user_id && currentUserId === claim.user_id;
    const isSeller = currentUserId && claim.seller_id && currentUserId === claim.seller_id;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Claim Details</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.content}>
                {/* Claim Number & Status */}
                <View style={styles.claimHeader}>
                    <View>
                        <Text style={styles.claimNumber}>{claim.claim_number}</Text>
                        <Text style={styles.claimDate}>Created {formatDate(claim.created_at)}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(claim.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(claim.status)}</Text>
                    </View>
                </View>

                {/* Priority Badge */}
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(claim.priority) }]}>
                    <Ionicons name="flag" size={16} color="#FFF" />
                    <Text style={styles.priorityText}>{claim.priority?.toUpperCase()} PRIORITY</Text>
                </View>

                {/* Advertisement Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Advertisement</Text>
                    <View style={styles.adInfo}>
                        <Text style={styles.adTitle}>{claim.ad_title}</Text>
                        <Text style={styles.adPrice}>${claim.ad_price}</Text>
                    </View>
                </View>

                {/* Original Dispute */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Original Dispute</Text>
                    <TouchableOpacity style={styles.disputeLink} onPress={handleViewDispute}>
                        <Text style={styles.disputeNumber}>{claim.dispute_number}</Text>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                    {claim.dispute_description && (
                        <Text style={styles.disputeDescription} numberOfLines={3}>
                            {claim.dispute_description}
                        </Text>
                    )}
                </View>

                {/* Parties */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Parties Involved</Text>
                    <View style={styles.partiesContainer}>
                        <View style={styles.party}>
                            <Text style={styles.partyLabel}>Claimant (Buyer)</Text>
                            <Text style={styles.partyName}>{claim.buyer_name}</Text>
                            {isBuyer && <Text style={styles.youLabel}>(You)</Text>}
                        </View>
                        <View style={styles.party}>
                            <Text style={styles.partyLabel}>Respondent (Seller)</Text>
                            <Text style={styles.partyName}>{claim.seller_name}</Text>
                            {isSeller && <Text style={styles.youLabel}>(You)</Text>}
                        </View>
                    </View>
                </View>

                {/* Claim Reason */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Claim Reason</Text>
                    <View style={styles.textBox}>
                        <Text style={styles.textBoxContent}>{claim.claim_reason}</Text>
                    </View>
                </View>

                {/* Additional Evidence */}
                {claim.buyer_additional_evidence && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Additional Evidence</Text>
                        <View style={styles.textBox}>
                            <Text style={styles.textBoxContent}>{claim.buyer_additional_evidence}</Text>
                        </View>
                    </View>
                )}

                {/* Admin Decision */}
                {claim.admin_decision && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Admin Decision</Text>
                        <View style={[styles.decisionBox, {
                            backgroundColor: claim.admin_decision === 'favor_buyer' ? '#E8F5E9' :
                                claim.admin_decision === 'favor_seller' ? '#FFEBEE' : '#FFF3E0'
                        }]}>
                            <View style={styles.decisionHeader}>
                                <Ionicons
                                    name={claim.admin_decision === 'favor_buyer' ? 'checkmark-circle' :
                                        claim.admin_decision === 'favor_seller' ? 'close-circle' : 'information-circle'}
                                    size={24}
                                    color={claim.admin_decision === 'favor_buyer' ? '#4CAF50' :
                                        claim.admin_decision === 'favor_seller' ? '#F44336' : '#FF9800'}
                                />
                                <Text style={styles.decisionTitle}>
                                    {claim.admin_decision === 'favor_buyer' ? 'Favor Buyer' :
                                        claim.admin_decision === 'favor_seller' ? 'Favor Seller' : 'Partial Resolution'}
                                </Text>
                            </View>
                            {claim.resolution_amount && (
                                <Text style={styles.resolutionAmount}>
                                    Refund Amount: ${claim.resolution_amount}
                                </Text>
                            )}
                            {claim.admin_notes && (
                                <Text style={styles.adminNotes}>{claim.admin_notes}</Text>
                            )}
                            {claim.admin_name && (
                                <Text style={styles.adminName}>Decided by: {claim.admin_name}</Text>
                            )}
                        </View>
                    </View>
                )}

                {/* Assigned Admin */}
                {claim.admin_name && !claim.admin_decision && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Assigned To</Text>
                        <View style={styles.adminInfo}>
                            <Ionicons name="person-circle" size={24} color={COLORS.primary} />
                            <Text style={styles.adminInfoText}>{claim.admin_name}</Text>
                        </View>
                    </View>
                )}

                {/* Timeline */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Timeline</Text>
                    <View style={styles.timeline}>
                        <View style={styles.timelineItem}>
                            <View style={styles.timelineDot} />
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineTitle}>Claim Created</Text>
                                <Text style={styles.timelineDate}>{formatDate(claim.created_at)}</Text>
                            </View>
                        </View>
                        {claim.assigned_at && (
                            <View style={styles.timelineItem}>
                                <View style={styles.timelineDot} />
                                <View style={styles.timelineContent}>
                                    <Text style={styles.timelineTitle}>Assigned to Admin</Text>
                                    <Text style={styles.timelineDate}>{formatDate(claim.assigned_at)}</Text>
                                </View>
                            </View>
                        )}
                        {claim.resolved_at && (
                            <View style={styles.timelineItem}>
                                <View style={styles.timelineDot} />
                                <View style={styles.timelineContent}>
                                    <Text style={styles.timelineTitle}>Resolved</Text>
                                    <Text style={styles.timelineDate}>{formatDate(claim.resolved_at)}</Text>
                                </View>
                            </View>
                        )}
                        {claim.closed_at && (
                            <View style={styles.timelineItem}>
                                <View style={[styles.timelineDot, styles.timelineDotLast]} />
                                <View style={styles.timelineContent}>
                                    <Text style={styles.timelineTitle}>Closed</Text>
                                    <Text style={styles.timelineDate}>{formatDate(claim.closed_at)}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* Info Link */}
                <View style={styles.infoLinkContainer}>
                    <Text style={styles.infoLinkText}>
                        More information on Claims,{' '}
                        <Text style={styles.infoLinkHighlight}>click here</Text>
                    </Text>
                    <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} style={styles.infoIcon} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
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
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    claimHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    claimNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    claimDate: {
        fontSize: 14,
        color: '#666',
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
    priorityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        margin: 16,
        marginBottom: 8,
    },
    priorityText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFF',
        marginLeft: 6,
    },
    section: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        textTransform: 'uppercase',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    adInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    adTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        flex: 1,
    },
    adPrice: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.primary,
    },
    disputeLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        marginBottom: 8,
    },
    disputeNumber: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary,
    },
    disputeDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    partiesContainer: {
        gap: 12,
    },
    party: {
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 8,
    },
    partyLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    partyName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    youLabel: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
        marginTop: 4,
    },
    textBox: {
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 8,
    },
    textBoxContent: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    decisionBox: {
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    decisionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    decisionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginLeft: 8,
    },
    resolutionAmount: {
        fontSize: 20,
        fontWeight: '700',
        color: '#4CAF50',
        marginBottom: 12,
    },
    adminNotes: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        marginBottom: 12,
    },
    adminName: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
    adminInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
    },
    adminInfoText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginLeft: 8,
    },
    timeline: {
        paddingLeft: 8,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.primary,
        marginRight: 12,
        marginTop: 4,
    },
    timelineDotLast: {
        backgroundColor: '#999',
    },
    timelineContent: {
        flex: 1,
    },
    timelineTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    timelineDate: {
        fontSize: 12,
        color: '#666',
    },
    infoLinkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#E3F2FD',
        marginTop: 8,
    },
    infoLinkText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
    },
    infoLinkHighlight: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    infoIcon: {
        marginLeft: 8,
    },
});

export default ClaimDetailScreen;
