import React from 'react';
import { useTranslation } from '../../../context/TranslationContext';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import GlobalHeader from '../../../components/GlobalHeader';

const AccessRightsConfirmationScreen = ({ route, navigation }) => {
    const { t } = useTranslation();
    const { requestType, title, email } = route.params;

    const getRequestInfo = () => {
        switch (requestType) {
            case 'deletion':
                return {
                    icon: 'trash-outline',
                    color: '#FF9800',
                    description: 'You are requesting deletion of your user data. This will remove your personal information from our records while keeping your account active.',
                    warning: 'This action will delete your personal data but keep your account active.',
                };
            case 'download':
                return {
                    icon: 'download-outline',
                    color: COLORS.primary,
                    description: 'You are requesting to download all your personal data in PDF format. This includes your profile information, activity history, and preferences.',
                    warning: 'The download link will be sent to your email within 24-48 hours.',
                };
            case 'delete_data':
                return {
                    icon: 'document-text-outline',
                    color: '#d32f2f',
                    description: 'You are requesting permanent deletion of your personal data. This will remove all your information from our systems.',
                    warning: 'This action cannot be undone. Your data will be permanently deleted.',
                };
            case 'delete_account':
                return {
                    icon: 'close-circle-outline',
                    color: '#d32f2f',
                    description: 'You are requesting to permanently delete your account. This will remove your account and all associated data from our platform.',
                    warning: 'This action is permanent and cannot be undone. All your data will be lost.',
                };
            default:
                return {
                    icon: 'information-circle-outline',
                    color: COLORS.primary,
                    description: 'Processing your request.',
                    warning: 'Please review the details carefully.',
                };
        }
    };

    const requestInfo = getRequestInfo();

    const handleProceed = () => {
        navigation.navigate('DataRequestForm', {
            requestType,
            title,
            email,
        });
    };

    const handleCancel = () => {
        navigation.navigate('PrivacyAccount');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <GlobalHeader
                title={t('Confirm Access Rights')}
                navigation={navigation}
                showBackButton={true}
                showIcons={false}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Success Icon */}
                <View style={styles.successSection}>
                    <View style={[styles.iconCircle, { backgroundColor: `${requestInfo.color}20` }]}>
                        <Ionicons name="checkmark-circle" size={64} color={COLORS.primary} />
                    </View>
                    <Text style={styles.successTitle}>{t('Identity Verified')}</Text>
                    <Text style={styles.successText}>{t('Your access rights have been confirmed')}</Text>
                </View>

                {/* Request Details */}
                <View style={styles.detailsSection}>
                    <View style={styles.detailsHeader}>
                        <Ionicons name={requestInfo.icon} size={32} color={requestInfo.color} />
                        <Text style={styles.detailsTitle}>{title}</Text>
                    </View>

                    <View style={styles.infoCard}>
                        <Text style={styles.infoLabel}>{t('Request Type')}</Text>
                        <Text style={styles.infoValue}>{title}</Text>
                    </View>

                    <View style={styles.infoCard}>
                        <Text style={styles.infoLabel}>{t('Email Address')}</Text>
                        <Text style={styles.infoValue}>{email}</Text>
                    </View>

                    <View style={styles.infoCard}>
                        <Text style={styles.infoLabel}>{t('Description')}</Text>
                        <Text style={styles.infoDescription}>{requestInfo.description}</Text>
                    </View>
                </View>

                {/* Warning Section */}
                <View style={[styles.warningSection, { backgroundColor: `${requestInfo.color}10` }]}>
                    <Ionicons name="warning-outline" size={24} color={requestInfo.color} />
                    <Text style={[styles.warningText, { color: requestInfo.color }]}>
                        {requestInfo.warning}
                    </Text>
                </View>

                {/* What Happens Next */}
                <View style={styles.nextStepsSection}>
                    <Text style={styles.nextStepsTitle}>{t('What Happens Next?')}</Text>
                    <View style={styles.stepItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>1</Text>
                        </View>
                        <Text style={styles.stepText}>{t('Fill out the request form with details')}</Text>
                    </View>
                    <View style={styles.stepItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>2</Text>
                        </View>
                        <Text style={styles.stepText}>{t('Your request will be sent to our admin team')}</Text>
                    </View>
                    <View style={styles.stepItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>3</Text>
                        </View>
                        <Text style={styles.stepText}>{t("You'll receive a confirmation email")}</Text>
                    </View>
                    <View style={styles.stepItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>4</Text>
                        </View>
                        <Text style={styles.stepText}>{t('Admin will process your request within 7-14 days')}</Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonSection}>
                    <TouchableOpacity
                        style={styles.proceedButton}
                        onPress={handleProceed}
                    >
                        <Text style={styles.proceedButtonText}>{t('Proceed to Form')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancel}
                    >
                        <Text style={styles.cancelButtonText}>{t('Cancel Request')}</Text>
                    </TouchableOpacity>
                </View>

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
    successSection: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
        marginBottom: 8,
    },
    successText: {
        fontSize: 15,
        color: '#666',
    },
    detailsSection: {
        marginTop: 20,
    },
    detailsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    detailsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        flex: 1,
    },
    infoCard: {
        backgroundColor: '#f8f8f8',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#666',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
    },
    infoDescription: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    warningSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        marginTop: 20,
        gap: 12,
    },
    warningText: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
        lineHeight: 20,
    },
    nextStepsSection: {
        marginTop: 30,
    },
    nextStepsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 16,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        gap: 12,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepNumberText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
    },
    stepText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
        lineHeight: 20,
    },
    buttonSection: {
        marginTop: 30,
    },
    proceedButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
    },
    proceedButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    bottomSpacer: {
        height: 40,
    },
});

export default AccessRightsConfirmationScreen;
