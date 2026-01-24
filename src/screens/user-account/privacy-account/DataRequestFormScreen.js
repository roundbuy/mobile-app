import React, { useState } from 'react';
import { useTranslation } from '../../../context/TranslationContext';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import GlobalHeader from '../../../components/GlobalHeader';

const DataRequestFormScreen = ({ route, navigation }) => {
    const { t } = useTranslation();
    const { requestType, title, email } = route.params;
    const [reason, setReason] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getFormFields = () => {
        switch (requestType) {
            case 'deletion':
                return {
                    reasonLabel: 'Reason for Data Deletion Request',
                    reasonPlaceholder: 'Please explain why you want to delete your data...',
                    additionalLabel: 'Additional Information (Optional)',
                    additionalPlaceholder: 'Any additional details you want to share...',
                };
            case 'download':
                return {
                    reasonLabel: 'Purpose of Data Download',
                    reasonPlaceholder: 'Please explain why you need to download your data...',
                    additionalLabel: 'Specific Data Required (Optional)',
                    additionalPlaceholder: 'Specify if you need specific data categories...',
                };
            case 'delete_data':
                return {
                    reasonLabel: 'Reason for Deleting Personal Data',
                    reasonPlaceholder: 'Please explain why you want to delete your personal data...',
                    additionalLabel: 'Confirmation Statement',
                    additionalPlaceholder: 'Type "I confirm deletion" to proceed...',
                };
            case 'delete_account':
                return {
                    reasonLabel: 'Reason for Account Deletion',
                    reasonPlaceholder: 'Please tell us why you want to delete your account...',
                    additionalLabel: 'Confirmation Statement',
                    additionalPlaceholder: 'Type "DELETE MY ACCOUNT" to confirm...',
                };
            default:
                return {
                    reasonLabel: 'Reason for Request',
                    reasonPlaceholder: 'Please provide details...',
                    additionalLabel: 'Additional Information',
                    additionalPlaceholder: 'Any additional details...',
                };
        }
    };

    const formFields = getFormFields();

    const validateForm = () => {
        if (!reason.trim()) {
            Alert.alert(t('Error'), t('Please provide a reason for your request'));
            return false;
        }

        if (requestType === 'delete_data' && additionalInfo.trim() !== 'I confirm deletion') {
            Alert.alert(t('Error'), t('Please type "I confirm deletion" to proceed'));
            return false;
        }

        if (requestType === 'delete_account' && additionalInfo.trim() !== 'DELETE MY ACCOUNT') {
            Alert.alert(t('Error'), t('Please type "DELETE MY ACCOUNT" to confirm'));
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setIsSubmitting(true);

            // TODO: Submit request to backend
            const requestData = {
                requestType,
                email,
                reason: reason.trim(),
                additionalInfo: additionalInfo.trim(),
                timestamp: new Date().toISOString(),
            };

            console.log('Submitting request:', requestData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Show success and navigate back
            Alert.alert(
                t('Request Submitted'),
                `Your ${title.toLowerCase()} request has been submitted successfully. Our admin team will review it and contact you within 7-14 business days.`,
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('PrivacyAccount'),
                    },
                ]
            );
        } catch (error) {
            Alert.alert(t('Error'), t('Failed to submit request. Please try again.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <GlobalHeader
                title={t('Submit Request')}
                navigation={navigation}
                showBackButton={true}
                showIcons={false}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={styles.headerSection}>
                    <Ionicons name="document-text" size={48} color={COLORS.primary} />
                    <Text style={styles.headerTitle}>{title}</Text>
                    <Text style={styles.headerSubtitle}>{t('Please fill out the form below to submit your request to our admin team')}</Text>
                </View>

                {/* Request Info */}
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t('Email:')}</Text>
                        <Text style={styles.infoValue}>{email}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t('Request Type:')}</Text>
                        <Text style={styles.infoValue}>{title}</Text>
                    </View>
                </View>

                {/* Form Section */}
                <View style={styles.formSection}>
                    {/* Reason Field */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>
                            {formFields.reasonLabel} <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.textArea}
                            value={reason}
                            onChangeText={setReason}
                            placeholder={formFields.reasonPlaceholder}
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                        />
                        <Text style={styles.charCount}>{reason.length} / 500</Text>
                    </View>

                    {/* Additional Info Field */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>
                            {formFields.additionalLabel}
                            {(requestType === 'delete_data' || requestType === 'delete_account') && (
                                <Text style={styles.required}> *</Text>
                            )}
                        </Text>
                        <TextInput
                            style={styles.textArea}
                            value={additionalInfo}
                            onChangeText={setAdditionalInfo}
                            placeholder={formFields.additionalPlaceholder}
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                {/* Important Notice */}
                <View style={styles.noticeSection}>
                    <Ionicons name="information-circle" size={20} color={COLORS.primary} />
                    <View style={styles.noticeContent}>
                        <Text style={styles.noticeTitle}>{t('Important Notice')}</Text>
                        <Text style={styles.noticeText}>
                            • Your request will be reviewed by our admin team{'\n'}
                            • Processing time: 7-14 business days{'\n'}
                            • You will receive email updates on your request status{'\n'}
                            • For urgent matters, please contact support
                        </Text>
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <Text style={styles.submitButtonText}>{t('Submit Request')}</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </>
                    )}
                </TouchableOpacity>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    headerSection: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginTop: 16,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    infoCard: {
        backgroundColor: '#f8f8f8',
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        flex: 1,
        textAlign: 'right',
    },
    formSection: {
        marginBottom: 24,
    },
    fieldContainer: {
        marginBottom: 24,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
    },
    required: {
        color: '#d32f2f',
    },
    textArea: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d0d0d0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#000',
        minHeight: 120,
    },
    charCount: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 4,
    },
    noticeSection: {
        flexDirection: 'row',
        backgroundColor: `${COLORS.primary}10`,
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
        gap: 12,
    },
    noticeContent: {
        flex: 1,
    },
    noticeTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
    },
    noticeText: {
        fontSize: 13,
        color: '#666',
        lineHeight: 20,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    bottomSpacer: {
        height: 40,
    },
});

export default DataRequestFormScreen;
