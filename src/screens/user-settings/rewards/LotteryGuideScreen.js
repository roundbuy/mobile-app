import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../../context/TranslationContext';
import { COLORS } from '../../../constants/theme';

const LotteryGuideScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { category } = route.params;

    const handleBack = () => {
        navigation.goBack();
    };

    const handleStartNow = () => {
        // Navigate to ReferralCodeScreen, passing the category context
        navigation.navigate('ReferralCode', { category });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Info on Monthly Lottery')}</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Title Section */}
                <Text style={styles.title}>
                    {t('Win £100.00 of credit usable at RoundBuy for Visibility ads')}
                </Text>
                <Text style={styles.subtitle}>
                    {t('Get more visibility for your Ad and sell faster!')}
                </Text>
                <Text style={styles.description}>
                    {t('With Highlighted Ad your product or service gets noticed easier and by more viewers. Get your products sold faster!')}
                </Text>

                {/* Steps */}
                <View style={styles.stepsContainer}>
                    {/* Step 1 */}
                    <View style={styles.stepItem}>
                        <View style={styles.stepCircle}>
                            <Text style={styles.stepNumber}>1</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>{t('Get a membership or plan upgrade')}</Text>
                            <Text style={styles.stepText}>
                                {t('Get RoundBuy membership or purchase an upgrade for it.')}
                            </Text>
                        </View>
                    </View>

                    {/* Connector Line 1 */}
                    <View style={styles.connectorLine} />

                    {/* Step 2 */}
                    <View style={styles.stepItem}>
                        <View style={styles.stepCircle}>
                            <Text style={styles.stepNumber}>2</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>{t('Participate in the lottery')}</Text>
                            <Text style={styles.stepText}>
                                {t('Go to "Participate in the Lottery" page, and insert your Lottery Referral code, and username.')}
                            </Text>
                        </View>
                    </View>

                    {/* Connector Line 2 */}
                    <View style={styles.connectorLine} />

                    {/* Step 3 */}
                    <View style={styles.stepItem}>
                        <View style={styles.stepCircle}>
                            <Text style={styles.stepNumber}>3</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>{t('Win £100.00 worth of RoundBuy credit')}</Text>
                            <Text style={styles.stepText}>
                                {t('Wait for the monthly lottery, and see if you won £100.00 of credit (See the limitations here).')}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Info Link */}
                <TouchableOpacity style={styles.infoLink}>
                    <Text style={styles.infoLinkText}>{t('For more information, click here.')}</Text>
                    <Ionicons name="information-circle-outline" size={20} color="#666" />
                </TouchableOpacity>

                {/* Start Button */}
                <TouchableOpacity
                    style={styles.startButton}
                    onPress={handleStartNow}
                    activeOpacity={0.8}
                >
                    <Text style={styles.startButtonText}>{t('Start now')}</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    headerRight: {
        width: 32,
    },
    content: {
        padding: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginBottom: 12,
        lineHeight: 28,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 32,
    },
    stepsContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    stepItem: {
        alignItems: 'center',
        width: '100%',
        zIndex: 1,
    },
    stepCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    stepNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    stepContent: {
        alignItems: 'center',
    },
    stepTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
        textAlign: 'center',
    },
    stepText: {
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
        lineHeight: 18,
        paddingHorizontal: 10,
    },
    connectorLine: {
        width: 2,
        height: 40,
        backgroundColor: '#e0e0e0',
        marginVertical: 8,
    },
    infoLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    infoLinkText: {
        fontSize: 13,
        color: '#666',
        textDecorationLine: 'underline',
        marginRight: 6,
    },
    startButton: {
        backgroundColor: '#0047AB', // Deep blue
        paddingVertical: 16,
        borderRadius: 25,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#0047AB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    startButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
});

export default LotteryGuideScreen;
