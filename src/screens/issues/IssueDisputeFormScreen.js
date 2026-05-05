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
import { COLORS } from '../../constants/theme';
import disputeService from '../../services/disputeService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IssueDisputeFormScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { issueId, issueNumber } = route.params || {};
    const [loading, setLoading] = useState(false);
    const [issueData, setIssueData] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [disputeDescription, setDisputeDescription] = useState('');

    useEffect(() => {
        loadIssueData();
        loadCurrentUser();
    }, []);

    const loadCurrentUser = async () => {
        try {
            const userStr = await AsyncStorage.getItem('@roundbuy:user');
            if (userStr) {
                setCurrentUser(JSON.parse(userStr));
            }
        } catch (error) {
            console.error('Load user error:', error);
        }
    };

    const loadIssueData = async () => {
        try {
            const response = await disputeService.getIssueById(issueId);
            if (response.success) {
                setIssueData(response.data);
                // Initialize editable fields with issue data
                setDisputeDescription(response.data.issue_description || '');
            }
        } catch (error) {
            console.error('Load issue error:', error);
        }
    };

    const handleSendDispute = async () => {
        // Validate fields
        if (!disputeDescription.trim()) {
            Alert.alert(t('Error'), t('Please describe the disputed issue'));
            return;
        }

        setLoading(true);
        try {
            const response = await disputeService.escalateIssueToDispute(issueId, {
                dispute_description: disputeDescription.trim()
            });

            if (response.success) {
                Alert.alert(
                    t('Dispute Created'),
                    t('Your dispute has been sent to the seller.'),
                    [
                        {
                            text: t('OK'),
                            onPress: () => {
                                navigation.navigate('SupportResolution');
                            },
                        },
                    ]
                );
            }
        } catch (error) {
            console.error('Escalate error:', error);
            Alert.alert(t('Error'), error.message || t('Failed to create dispute'));
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    if (!issueData) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
            </SafeAreaView>
        );
    }

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
                <Text style={styles.headerTitle}>Dispute {issueNumber}</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.content}>
                {/* Handshake Icon with Scales */}
                <View style={styles.iconContainer}>
                    <View style={styles.iconWrapper}>
                        <FontAwesome name="balance-scale" size={30} color="#505050" style={styles.balanceIcon} />
                        <FontAwesome name="handshake-o" size={50} color="#505050" />
                    </View>
                </View>

                {/* Guidelines Link */}
                <TouchableOpacity style={styles.guidelinesLink}>
                    <Text style={styles.guidelinesText}>{t('ROUNDBUY DISPUTE GUIDELINES')}</Text>
                    <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
                </TouchableOpacity>

                {/* Creation Message */}
                <View style={styles.creationMessage}>
                    <Text style={styles.creationText}>
                        {t('Dispute #')}{issueNumber} {t('was created')}
                    </Text>
                    <Text style={styles.creationTime}>
                        {formatDate(issueData.created_at)}
                    </Text>
                </View>

0                {/* Product Info */}
                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t('Item:')}</Text>
                        <Text style={styles.infoValue}>{issueData.product_name || issueData.ad_title}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t('Complainant:')}</Text>
                        <Text style={styles.infoValue}>{currentUser?.full_name || 'You'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t('Respondent:')}</Text>
                        <Text style={styles.infoValue}>{issueData.other_party_name}</Text>
                    </View>
                </View>

                {/* Buyer's Issue */}
                <View style={styles.issueSection}>
                    <View style={styles.issueSectionHeader}>
                        <Text style={styles.sectionTitle}>{t("COMPLAINANT'S DISPUTE")}</Text>
                        <Text style={styles.sectionTime}>{formatDate(issueData.created_at)}</Text>
                    </View>

                    <Text style={styles.fieldLabel}>{t('The dispute with the Note and chat is:')}</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder={t('Describe the dispute and what you demand...')}
                        placeholderTextColor="#303234"
                        multiline
                        numberOfLines={8}
                        value={disputeDescription}
                        onChangeText={setDisputeDescription}
                        textAlignVertical="top"
                    />
                </View>

                {/* Evidence Upload Link */}
                <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => navigation.navigate('AttachEvidence', {
                        issueId: issueId,
                        issueNumber: issueNumber,
                        userRole: 'buyer'
                    })}
                >
                    <Text style={styles.linkText}>
                        Buyer Upload evidence in PDF format click{' '}
                        <Text style={styles.linkHighlight}>{t('here')}</Text>
                    </Text>
                </TouchableOpacity>

                {/* Chat History Link */}
                <TouchableOpacity style={styles.linkButton}>
                    <Text style={styles.linkText}>
                        <Text style={styles.linkHighlight}>{t('Chat history.pdf (uploaded)')}</Text> click to view
                    </Text>
                </TouchableOpacity>

                {/* Info Link */}
                <View style={styles.infoLinkContainer}>
                    <Text style={styles.infoLinkText}>
                        More information on Issues & Disputes,{' '}
                        <Text style={styles.infoLinkHighlight}>{t('click here')}</Text>
                    </Text>
                    <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} style={styles.infoIcon} />
                </View>

                {/* Send Dispute Button */}
                <TouchableOpacity
                    style={[styles.sendButton, loading && styles.sendButtonDisabled]}
                    onPress={handleSendDispute}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.sendButtonText}>{t('Send Dispute to Seller')}</Text>
                    )}
                </TouchableOpacity>
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
    },
    iconWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    balanceIcon: {
        marginBottom: -10,
        zIndex: 1,
    },
    guidelinesLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    guidelinesText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
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
        color: '#505050',
    },
    creationTime: {
        fontSize: 12,
        color: '#303234',
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
        color: '#505050',
    },
    infoValue: {
        fontSize: 14,
        color: '#000',
    },
    issueSection: {
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
        color: '#505050',
        letterSpacing: 0.5,
    },
    sectionTime: {
        fontSize: 12,
        color: '#303234',
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
        borderWidth: 1,
        borderColor: '#E0E0E0',
        padding: 12,
        fontSize: 14,
        color: '#333',
        minHeight: 100,
        marginBottom: 8,
        textAlignVertical: 'top',
    },
    linkButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    linkText: {
        fontSize: 13,
        color: '#505050',
    },
    linkHighlight: {
        color: COLORS.primary,
        fontWeight: '600',
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
        color: '#505050',
    },
    infoLinkHighlight: {
        color: COLORS.primary,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    infoIcon: {
        marginLeft: 6,
    },
    sendButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 8,
        marginHorizontal: 24,
        marginVertical: 24,
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#CCC',
    },
    sendButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
});

export default IssueDisputeFormScreen;
