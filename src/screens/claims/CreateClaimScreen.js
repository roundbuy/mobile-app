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
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import claimService from '../../services/claimService';

const CreateClaimScreen = ({ route, navigation }) => {
    const { t } = useTranslation();
    const { dispute } = route.params;
    const [claimReason, setClaimReason] = useState('');
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
                priority: 'medium' // Defaulting for streamlined experience
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
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('Escalate to Claim')}</Text>
                    <View style={styles.headerRight} />
                </View>

                <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                    {/* Claim Icon */}
                    <View style={styles.iconContainer}>
                        <View style={styles.folderIconContainer}>
                            <FontAwesome5 name="file-contract" size={50} color="#505050" />
                            <View style={styles.claimBadge}>
                                <Text style={styles.claimBadgeText}>CLAIM</Text>
                            </View>
                        </View>
                    </View>

                    {/* Summary Info */}
                    <View style={styles.infoTable}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t('Item:')}</Text>
                            <Text style={styles.infoValue}>{dispute.ad_title}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t('Claimant:')}</Text>
                            <Text style={styles.infoValue}>{dispute.buyer_name || t('You')}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t('Defendant:')}</Text>
                            <Text style={styles.infoValue}>{dispute.seller_name}</Text>
                        </View>
                    </View>

                    {/* Main Input Area */}
                    <View style={styles.inputSection}>
                        <Text style={styles.sectionTitle}>{t("BUYER'S CLAIM")}</Text>
                        <View style={styles.bubbleInputContainer}>
                            <TextInput
                                style={styles.bubbleInput}
                                multiline
                                placeholder={t('Explain why you are escalating this dispute to a claim...')}
                                placeholderTextColor="#999"
                                value={claimReason}
                                onChangeText={setClaimReason}
                                textAlignVertical="top"
                            />
                        </View>
                        
                        {/* Evidence Upload Links */}
                        <View style={styles.evidenceLinks}>
                            <TouchableOpacity style={styles.evidenceLinkItem}>
                                <Text style={styles.evidenceLinkText}>{t('Upload evidence')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.evidenceLinkItem}>
                                <Text style={styles.evidenceLinkText}>{t('Upload evidence')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Disclaimer */}
                    <View style={styles.disclaimerBox}>
                        <Ionicons name="information-circle-outline" size={20} color="#505050" />
                        <Text style={styles.disclaimerText}>
                            {t('Once submitted, Roundbuy support will review all evidence and their decision will be final.')}
                        </Text>
                    </View>
                </ScrollView>

                {/* Submit Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.submitButton, (!claimReason.trim() || loading) && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={!claimReason.trim() || loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>{t('Submit Claim')}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
    },
    headerRight: {
        width: 32,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    iconContainer: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    folderIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    claimBadge: {
        position: 'absolute',
        bottom: 20,
        backgroundColor: '#FFF',
        paddingHorizontal: 3,
        paddingVertical: 1,
        borderRadius: 2,
        borderWidth: 1.5,
        borderColor: '#505050',
    },
    claimBadgeText: {
        fontSize: 7,
        fontWeight: '900',
        color: '#505050',
    },
    infoTable: {
        paddingHorizontal: 24,
        marginBottom: 30,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    infoLabel: {
        width: 100,
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
    },
    infoValue: {
        flex: 1,
        fontSize: 14,
        color: '#505050',
    },
    inputSection: {
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#000',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    bubbleInputContainer: {
        backgroundColor: '#F8F8F8',
        borderRadius: 16,
        padding: 16,
        minHeight: 180,
        borderWidth: 0,
    },
    bubbleInput: {
        flex: 1,
        fontSize: 15,
        color: '#000',
        lineHeight: 22,
    },
    evidenceLinks: {
        marginTop: 16,
        gap: 8,
    },
    evidenceLinkItem: {
        alignSelf: 'flex-start',
    },
    evidenceLinkText: {
        fontSize: 13,
        color: '#003366',
        textDecorationLine: 'underline',
        fontWeight: '500',
    },
    disclaimerBox: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginTop: 30,
        alignItems: 'center',
    },
    disclaimerText: {
        flex: 1,
        fontSize: 12,
        color: '#303234',
        marginLeft: 10,
        lineHeight: 18,
    },
    footer: {
        padding: 24,
        paddingTop: 16,
        backgroundColor: '#FFF',
    },
    submitButton: {
        backgroundColor: '#000',
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#CCC',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
});

export default CreateClaimScreen;
