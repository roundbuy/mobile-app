import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/TranslationContext';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/theme';
import disputeService from '../../services/disputeService';

const CreateIssueScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { advertisementId, otherPartyId, adTitle, sellerName } = route.params || {};

    const [issueDescription, setIssueDescription] = useState('');
    const [buyerRequest, setBuyerRequest] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        loadCurrentUser();
    }, []);

    const loadCurrentUser = async () => {
        try {
            const userData = await AsyncStorage.getItem('@roundbuy:user_data');
            if (userData) {
                setCurrentUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error('Load user error:', error);
        }
    };

    const handleSubmit = async () => {
        console.log('=== CREATE ISSUE SUBMIT ===');
        console.log('Issue Description:', issueDescription);
        console.log('Buyer Request:', buyerRequest);
        console.log('Advertisement ID:', advertisementId);
        console.log('Other Party ID:', otherPartyId);

        // Validation
        if (!issueDescription || issueDescription.trim().length < 10) {
            Alert.alert(t('Error'), 'Please describe the issue (minimum 10 characters)');
            return;
        }

        if (!buyerRequest || buyerRequest.trim().length < 10) {
            Alert.alert(t('Error'), 'Please describe your request (minimum 10 characters)');
            return;
        }

        if (!advertisementId || !otherPartyId) {
            Alert.alert(t('Error'), t('Missing required information'));
            return;
        }

        setLoading(true);

        try {
            const issueData = {
                created_by: currentUser?.id, // Current user ID
                other_party_id: otherPartyId,
                advertisement_id: advertisementId,
                issue_type: 'other', // Default type since we removed selection
                issue_description: issueDescription.trim(),
                buyer_request: buyerRequest.trim(),
                product_name: adTitle || 'Product'
            };

            console.log('Creating issue with data:', issueData);

            const response = await disputeService.createIssue(issueData);

            if (response.success) {
                Alert.alert(
                    t('Issue Created'),
                    t('Your issue has been sent to the seller. They have 3 days to respond.'),
                    [
                        {
                            text: t('OK'),
                            onPress: () => {
                                navigation.goBack();
                                // Navigate to issue detail
                                if (response.data?.id) {
                                    navigation.navigate('IssueDetail', { issueId: response.data.id });
                                }
                            },
                        },
                    ]
                );
            }
        } catch (error) {
            console.error('Create issue error:', error);
            console.error('Error response:', error.response);
            console.error('Error data:', error.response?.data);

            let errorMessage = 'Failed to create issue. Please try again.';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            Alert.alert(t('Error'), errorMessage);
        } finally {
            setLoading(false);
        }
    };

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
                    <Text style={styles.headerTitle}>{t('An Issue')}</Text>
                    <View style={styles.headerRight} />
                </View>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Handshake Icon */}
                    <View style={styles.iconContainer}>
                        <FontAwesome name="handshake-o" size={80} color="#666" />
                    </View>

                    {/* Status Message */}
                    <View style={styles.statusContainer}>
                        <Text style={styles.statusText}>{t('Creating a new issue')}</Text>
                        <Text style={styles.timeText}>{t('Just now')}</Text>
                    </View>

                    {/* Product/Buyer/Seller Info */}
                    <View style={styles.infoSection}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t('Product:')}</Text>
                            <Text style={styles.infoValue}>{adTitle || 'N/A'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t('Issuer:')}</Text>
                            <Text style={styles.infoValue}>{currentUser?.full_name || 'You'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t('Issued to:')}</Text>
                            <Text style={styles.infoValue}>{sellerName || 'Seller'}</Text>
                        </View>
                    </View>

                    {/* Buyer's Issue Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{t("BUYER'S ISSUE")}</Text>
                            <Text style={styles.sectionTime}>{t('Now')}</Text>
                        </View>
                        <Text style={styles.fieldLabel}>{t('The issue with the product:')}</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder={t("Describe the issue you're experiencing...")}
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            value={issueDescription}
                            onChangeText={setIssueDescription}
                            maxLength={2000}
                        />
                        <Text style={styles.charCount}>
                            {issueDescription.length}/2000 characters
                        </Text>
                    </View>

                    {/* Issuer's Request Section */}
                    <View style={styles.section}>
                        <Text style={styles.fieldLabel}>{t('Issuers Requests:')}</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder={t('What would you like the seller to do? (e.g., refund, replacement, etc.)')}
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            value={buyerRequest}
                            onChangeText={setBuyerRequest}
                            maxLength={2000}
                        />
                        <Text style={styles.charCount}>
                            {buyerRequest.length}/2000 characters
                        </Text>
                    </View>

                    {/* Info Link */}
                    <View style={styles.infoLinkContainer}>
                        <Text style={styles.infoLinkText}>
                            More information on Issues & Disputes,{' '}
                        </Text>
                        <TouchableOpacity>
                            <Text style={styles.infoLink}>{t('click here')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.infoIcon}>
                            <Ionicons name="information-circle-outline" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            (issueDescription.length < 10 || buyerRequest.length < 10 || loading) &&
                            styles.submitButtonDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={issueDescription.length < 10 || buyerRequest.length < 10 || loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>{t('Send Issue to Seller')}</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 4,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        flex: 1,
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
    },
    iconContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusText: {
        fontSize: 14,
        color: '#666',
    },
    timeText: {
        fontSize: 12,
        color: '#999',
    },
    infoSection: {
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    infoLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    infoValue: {
        fontSize: 13,
        color: '#000',
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#000',
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
        marginBottom: 8,
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#000',
        minHeight: 120,
        backgroundColor: '#FAFAFA',
    },
    charCount: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 4,
    },
    infoLinkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        flexWrap: 'wrap',
    },
    infoLinkText: {
        fontSize: 12,
        color: '#666',
    },
    infoLink: {
        fontSize: 12,
        color: '#4169E1',
        textDecorationLine: 'underline',
    },
    infoIcon: {
        marginLeft: 4,
    },
    submitButton: {
        backgroundColor: '#F5F5F5',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    submitButtonDisabled: {
        backgroundColor: '#E0E0E0',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
});

export default CreateIssueScreen;
