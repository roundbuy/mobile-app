import React, { useState } from 'react';
import { useTranslation } from '../../context/TranslationContext';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import claimService from '../../services/claimService';

const CreateClaimScreen = ({ route, navigation }) => {
    const { t } = useTranslation();
    const { dispute } = route.params;
    const [claimReason, setClaimReason] = useState('');
    const [additionalEvidence, setAdditionalEvidence] = useState('');
    const [priority, setPriority] = useState('medium');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!claimReason.trim()) {
            Alert.alert(t('Error'), t('Please enter a reason for escalating to claim'));
            return;
        }

        try {
            setLoading(true);
            const response = await claimService.createClaim(dispute.id, {
                claim_reason: claimReason,
                additional_evidence: additionalEvidence,
                priority
            });

            if (response.success) {
                Alert.alert(
                    t('Success'),
                    t('Claim created successfully. An admin will review your case.'),
                    [
                        {
                            text: t('OK'),
                            onPress: () => {
                                navigation.navigate('ClaimDetail', { claimId: response.data.id });
                            }
                        }
                    ]
                );
            }
        } catch (error) {
            console.error('Create claim error:', error);
            Alert.alert(t('Error'), error.response?.data?.message || t('Failed to create claim'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Escalate to Claim')}</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.content}>
                {/* Info Banner */}
                <View style={styles.infoBanner}>
                    <Ionicons name="information-circle" size={24} color={COLORS.primary} />
                    <Text style={styles.infoBannerText}>{t('Escalating to a claim will involve admin review. Please provide detailed information.')}</Text>
                </View>

                {/* Dispute Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('Dispute Summary')}</Text>
                    <View style={styles.disputeSummary}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>{t('Dispute Number:')}</Text>
                            <Text style={styles.summaryValue}>{dispute.dispute_number}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>{t('Product:')}</Text>
                            <Text style={styles.summaryValue}>{dispute.ad_title}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>{t('Seller:')}</Text>
                            <Text style={styles.summaryValue}>{dispute.seller_name}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>{t('Seller Decision:')}</Text>
                            <Text style={[styles.summaryValue, styles.declinedText]}>{t('Declined')}</Text>
                        </View>
                    </View>
                </View>

                {/* Claim Reason */}
                <View style={styles.section}>
                    <Text style={styles.fieldLabel}>{t('Claim Reason *')}</Text>
                    <Text style={styles.fieldHint}>{t('Explain why you are escalating this dispute to a claim')}</Text>
                    <TextInput
                        style={styles.textArea}
                        multiline
                        numberOfLines={6}
                        placeholder={t('Enter detailed reason for claim...')}
                        value={claimReason}
                        onChangeText={setClaimReason}
                        textAlignVertical="top"
                    />
                </View>

                {/* Additional Evidence */}
                <View style={styles.section}>
                    <Text style={styles.fieldLabel}>{t('Additional Evidence (Optional)')}</Text>
                    <Text style={styles.fieldHint}>{t('Provide any additional information or evidence')}</Text>
                    <TextInput
                        style={styles.textArea}
                        multiline
                        numberOfLines={4}
                        placeholder={t('Enter additional evidence...')}
                        value={additionalEvidence}
                        onChangeText={setAdditionalEvidence}
                        textAlignVertical="top"
                    />
                </View>

                {/* Priority */}
                <View style={styles.section}>
                    <Text style={styles.fieldLabel}>{t('Priority')}</Text>
                    <View style={styles.priorityContainer}>
                        <TouchableOpacity
                            style={[
                                styles.priorityOption,
                                priority === 'low' && styles.priorityOptionActive,
                                { borderColor: '#4CAF50' }
                            ]}
                            onPress={() => setPriority('low')}
                        >
                            <View style={[styles.priorityDot, { backgroundColor: '#4CAF50' }]} />
                            <Text style={[
                                styles.priorityText,
                                priority === 'low' && styles.priorityTextActive
                            ]}>{t('Low')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.priorityOption,
                                priority === 'medium' && styles.priorityOptionActive,
                                { borderColor: '#FFC107' }
                            ]}
                            onPress={() => setPriority('medium')}
                        >
                            <View style={[styles.priorityDot, { backgroundColor: '#FFC107' }]} />
                            <Text style={[
                                styles.priorityText,
                                priority === 'medium' && styles.priorityTextActive
                            ]}>{t('Medium')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.priorityOption,
                                priority === 'high' && styles.priorityOptionActive,
                                { borderColor: '#FF9800' }
                            ]}
                            onPress={() => setPriority('high')}
                        >
                            <View style={[styles.priorityDot, { backgroundColor: '#FF9800' }]} />
                            <Text style={[
                                styles.priorityText,
                                priority === 'high' && styles.priorityTextActive
                            ]}>{t('High')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.priorityOption,
                                priority === 'urgent' && styles.priorityOptionActive,
                                { borderColor: '#F44336' }
                            ]}
                            onPress={() => setPriority('urgent')}
                        >
                            <View style={[styles.priorityDot, { backgroundColor: '#F44336' }]} />
                            <Text style={[
                                styles.priorityText,
                                priority === 'urgent' && styles.priorityTextActive
                            ]}>{t('Urgent')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Warning */}
                <View style={styles.warningBox}>
                    <Ionicons name="warning" size={20} color="#FF9800" />
                    <Text style={styles.warningText}>{t('Once submitted, this claim will be reviewed by an admin. The decision will be final.')}</Text>
                </View>
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.submitButtonText}>{t('Submit Claim')}</Text>
                    )}
                </TouchableOpacity>
            </View>
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
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        padding: 16,
        margin: 16,
        borderRadius: 8,
    },
    infoBannerText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        marginLeft: 12,
        lineHeight: 20,
    },
    section: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 12,
    },
    disputeSummary: {
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    declinedText: {
        color: '#F44336',
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    fieldHint: {
        fontSize: 12,
        color: '#999',
        marginBottom: 12,
    },
    textArea: {
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#000',
        minHeight: 120,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    priorityContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 8,
    },
    priorityOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 2,
        backgroundColor: '#FFF',
    },
    priorityOptionActive: {
        backgroundColor: '#F8F9FA',
    },
    priorityDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    priorityText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    priorityTextActive: {
        color: '#000',
        fontWeight: '600',
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        padding: 16,
        margin: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FFE0B2',
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        marginLeft: 12,
        lineHeight: 18,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        backgroundColor: '#FFF',
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
});

export default CreateClaimScreen;
