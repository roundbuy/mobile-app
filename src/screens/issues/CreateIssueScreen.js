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

// Custom SVG icon component for the balance scales
const BalanceScaleIcon = () => (
    <View style={styles.iconContainer}>
        <View style={styles.iconWrapper}>
            <FontAwesome name="balance-scale" size={30} color="#505050" style={styles.balanceIcon} />
            <FontAwesome name="handshake-o" size={50} color="#505050" />
        </View>
    </View>
);

const CreateIssueScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { advertisementId, otherPartyId, adTitle, sellerName } = route.params || {};

    const [currentStep, setCurrentStep] = useState(1);
    const [issueDescription, setIssueDescription] = useState('');
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

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            navigation.goBack();
        }
    };

    const handleSubmit = async () => {
        if (!issueDescription || issueDescription.trim().length < 10) {
            Alert.alert(t('Error'), 'Please describe the issue (minimum 10 characters)');
            return;
        }

        if (!advertisementId || !otherPartyId) {
            Alert.alert(t('Error'), t('Missing required information'));
            return;
        }

        setLoading(true);

        try {
            const issueData = {
                created_by: currentUser?.id,
                other_party_id: otherPartyId,
                advertisement_id: advertisementId,
                issue_type: 'other',
                issue_description: issueDescription.trim(),
                buyer_request: issueDescription.trim(), // Combined request into single field
                product_name: adTitle || 'Product'
            };

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
                                if (response.data?.id) {
                                    navigation.navigate('IssueDetail', { issueId: response.data.id });
                                }
                            },
                        },
                    ]
                );
            }
        } catch (error) {
            let errorMessage = 'Failed to create issue. Please try again.';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            Alert.alert(t('Error'), errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const renderSlide1 = () => (
        <View style={styles.guideContainer}>
            <Text style={styles.guideTitle}>{t('RoundBuy Negotiation Guidelines for Issues')}</Text>
            
            <Text style={styles.guideSubtitle}>{t('How to Negotiate a Compromise')}</Text>
            <Text style={styles.guideParagraph}>{t('Before the matter gets esclated, try to reach a mutual understanding by negotiating: price reduction, refund or fix of the product or service.')}</Text>
            <Text style={styles.guideParagraph}>{t('If possible try to prevent disagreement, and an escalation by "Issuing a Dispute".')}</Text>
            <Text style={styles.guideParagraph}>{t('Key strategies for effective negotiations: be prepared by knowing what you agreed and what was described. Be flexible, explore multiple solutions witn mutual win-win mindset. Know when to walk away, werigh dispute costs (time/energy) gainst the value.')}</Text>
            <Text style={styles.guideParagraph}>{t('Best prevention for disputes for next time is to research sellers, understand trms, check for fraud.')}</Text>
            
            <View style={{flexDirection: 'row', marginBottom: 20}}>
                <Text style={{fontSize: 13, color:'#000'}}>{t('More on ')}</Text>
                <Text style={styles.blueLink}>{t('Disputes')}</Text>
            </View>

            <Text style={styles.guideSubtitle}>{t('RoundBuy Guidelines for compromise')}</Text>
            <Text style={styles.guideBulletPoint}>{t('• Reduce price as a first choice if the defect is minor')}</Text>
            <Text style={styles.guideBulletPoint}>{t('• Try to fix the defected item')}</Text>
            <Text style={styles.guideBulletPoint}>{t('• Make a full refund (receive back the item) & Cancel the deal.')}</Text>
            
            <View style={styles.paginationDots}>
                <View style={[styles.dot, styles.dotActive]} />
                <View style={styles.dot} />
            </View>
            
            <TouchableOpacity style={styles.readMoreButton} onPress={() => setCurrentStep(2)}>
                <Text style={styles.readMoreText}>{t('Read more')}</Text>
            </TouchableOpacity>
        </View>
    );

    const renderSlide2 = () => (
        <View style={styles.guideContainer}>
            <Text style={styles.guideTitle}>{t('RoundBuy Settlement Suggestions for Issues')}</Text>
            
            <Text style={styles.guideBulletPointDark}>{t('• lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum')}</Text>
            <Text style={styles.guideBulletPointDark}>{t('• lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum')}</Text>
            <Text style={styles.guideBulletPointDark}>{t('• lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum')}</Text>
            <Text style={styles.guideBulletPointDark}>{t('• lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum')}</Text>
            <Text style={styles.guideBulletPointDark}>{t('• lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum')}</Text>
            <Text style={styles.guideBulletPointDark}>{t('• lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum')}</Text>
            
            <View style={[styles.paginationDots, {marginTop: 40}]}>
                <View style={styles.dot} />
                <View style={[styles.dot, styles.dotActive]} />
            </View>
            
            <TouchableOpacity style={styles.readMoreButton} onPress={() => setCurrentStep(3)}>
                <Text style={styles.readMoreText}>{t('Read more')}</Text>
            </TouchableOpacity>
        </View>
    );

    const renderSlide3 = () => (
        <View style={styles.formContainer}>
            <View style={styles.guidanceBarRow}>
                <Text style={styles.guidanceBarText}>{t('ROUNDBUY GUIDANCE ON NEGOTIATION & SETTLEMENT')}</Text>
                <Ionicons name="information-circle-outline" size={18} color="#000" style={{marginLeft: 4}} />
            </View>

            <View style={styles.statusContainer}>
                <Text style={styles.statusText}>{t(`An Issue #${advertisementId || '21122'} was created`)}</Text>
                <Text style={styles.timeText}>{t('just now')}</Text>
            </View>

            <View style={styles.infoSectionNoBorder}>
                <View style={styles.infoRowAligned}>
                    <Text style={styles.infoLabelFixed}>{t('Item:')}</Text>
                    <Text style={styles.infoValueLeft}>{adTitle || 'Coffee maker'}</Text>
                </View>
                <View style={styles.infoRowAligned}>
                    <Text style={styles.infoLabelFixed}>{t('Issuer:')}</Text>
                    <Text style={styles.infoValueLeft}>{currentUser?.username || currentUser?.full_name || 'Johnnie8121'}</Text>
                </View>
                <View style={styles.infoRowAligned}>
                    <Text style={styles.infoLabelFixed}>{t('Issued to:')}</Text>
                    <Text style={styles.infoValueLeft}>{sellerName || 'BMiranda'}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitleCaps}>{t("BUYER'S ISSUE")}</Text>
                    <Text style={styles.sectionTime}>{t('just now')}</Text>
                </View>
                <Text style={styles.fieldLabelSmall}>{t('The Issue with the item and request:')}</Text>
                
                <View style={styles.bubbleInputContainer}>
                    <TextInput
                        style={styles.textArea}
                        placeholder={t("The coffee maker was good upon inspection. However, as I came home and boiled coffee, it leaked water. I didn't drop it, or anything else.\n\nI demand full money back (refund). Can we cancel the deal?")}
                        placeholderTextColor="#666"
                        multiline
                        numberOfLines={8}
                        textAlignVertical="top"
                        value={issueDescription}
                        onChangeText={setIssueDescription}
                        maxLength={2000}
                    />
                </View>
                
                <Text style={[styles.fieldLabelSmall, {marginTop: 20, marginBottom: 8}]}>{t('Evidence for the Issue:')}</Text>
                <View style={styles.evidenceLinkColumn}>
                    <TouchableOpacity style={{marginBottom: 6}}>
                        <Text style={styles.evidenceLinkTextBlue}>{t('Upload evidence')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text style={styles.evidenceLinkTextBlue}>{t('Upload evidence')}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                style={[
                    styles.submitButtonRoundedBase,
                    (issueDescription.length < 10 || loading) && styles.submitButtonDisabledBase,
                ]}
                onPress={handleSubmit}
                disabled={issueDescription.length < 10 || loading}
            >
                {loading ? (
                    <ActivityIndicator color="#000" />
                ) : (
                    <Text style={styles.submitButtonTextBase}>{t('Send Issue to Seller')}</Text>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t(`An Issue #${advertisementId || '21122'}`)}</Text>
                    <View style={styles.headerRight} />
                </View>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <BalanceScaleIcon />

                    {currentStep === 1 && renderSlide1()}
                    {currentStep === 2 && renderSlide2()}
                    {currentStep === 3 && renderSlide3()}

                    <View style={styles.footerInfoLink}>
                        <Text style={styles.footerLinkText}>
                            More on <Text style={styles.footerLinkHighlight}>{t('Issues & Resolution')}</Text>
                        </Text>
                    </View>
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
    },
    backButton: {
        padding: 4,
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
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
        padding: 24,
        paddingBottom: 40,
    },
    iconContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    iconWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    balanceIcon: {
        marginBottom: -10,
        zIndex: 1,
    },
    guideContainer: {
        flex: 1,
    },
    guideTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 16,
    },
    guideSubtitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
    },
    guideParagraph: {
        fontSize: 13,
        color: '#000',
        marginBottom: 14,
        lineHeight: 18,
    },
    blueLink: {
        fontSize: 13,
        color: '#0066CC',
        textDecorationLine: 'underline',
    },
    guideBulletPoint: {
        fontSize: 13,
        color: '#888',
        marginBottom: 8,
        lineHeight: 18,
        paddingLeft: 4,
    },
    guideBulletPointDark: {
        fontSize: 13,
        color: '#000',
        marginBottom: 10,
        lineHeight: 18,
        paddingLeft: 4,
    },
    paginationDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 24,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ccc',
        marginHorizontal: 6,
    },
    dotActive: {
        backgroundColor: '#555',
    },
    readMoreButton: {
        backgroundColor: '#F5F5F5',
        paddingVertical: 14,
        borderRadius: 24,
        alignItems: 'center',
    },
    readMoreText: {
        fontSize: 16,
        color: '#000',
    },
    formContainer: {
        flex: 1,
    },
    guidanceBarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    guidanceBarText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#333',
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    timeText: {
        fontSize: 12,
        color: '#888',
    },
    infoSectionNoBorder: {
        marginBottom: 24,
    },
    infoRowAligned: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    infoLabelFixed: {
        fontSize: 13,
        color: '#303234',
        width: 100,
    },
    infoValueLeft: {
        fontSize: 13,
        color: '#000',
        flex: 1,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    sectionTitleCaps: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#303234',
        letterSpacing: 0.5,
    },
    sectionTime: {
        fontSize: 12,
        color: '#888',
    },
    fieldLabelSmall: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#303234',
        marginBottom: 10,
    },
    bubbleInputContainer: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        overflow: 'hidden',
    },
    textArea: {
        padding: 14,
        fontSize: 14,
        color: '#000',
        minHeight: 140,
        backgroundColor: '#FFF',
    },
    evidenceLinkTextBlue: {
        fontSize: 13,
        color: '#0066CC',
        textDecorationLine: 'underline',
    },
    submitButtonRoundedBase: {
        backgroundColor: '#F5F5F5',
        paddingVertical: 14,
        borderRadius: 24,
        alignItems: 'center',
    },
    submitButtonDisabledBase: {
        opacity: 0.5,
    },
    submitButtonTextBase: {
        fontSize: 16,
        color: '#000',
    },
    footerInfoLink: {
        marginTop: 40,
        alignItems: 'center',
    },
    footerLinkText: {
        fontSize: 12,
        color: '#333',
    },
    footerLinkHighlight: {
        color: '#0066CC',
        textDecorationLine: 'underline',
    },
});

export default CreateIssueScreen;
