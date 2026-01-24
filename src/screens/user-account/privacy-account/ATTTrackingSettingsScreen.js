import React, { useState, useEffect } from 'react';
import { IMAGES } from '../../../assets/images';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Image, ScrollView } from 'react-native';
import SafeScreenContainer from '../../../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../../../constants/theme';
import { useTranslation } from '../../../context/TranslationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ATTTrackingSettingsScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [trackingEnabled, setTrackingEnabled] = useState(false);
    const [analyticsTracking, setAnalyticsTracking] = useState(false);
    const [advertisingTracking, setAdvertisingTracking] = useState(false);

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            const attPref = await AsyncStorage.getItem('att_tracking_enabled');
            const analyticsPref = await AsyncStorage.getItem('analytics_tracking_enabled');
            const advertisingPref = await AsyncStorage.getItem('advertising_tracking_enabled');

            if (attPref !== null) {
                setTrackingEnabled(JSON.parse(attPref));
            }
            if (analyticsPref !== null) {
                setAnalyticsTracking(JSON.parse(analyticsPref));
            }
            if (advertisingPref !== null) {
                setAdvertisingTracking(JSON.parse(advertisingPref));
            }
        } catch (error) {
            console.error('Error loading ATT preferences:', error);
        }
    };

    const handleSaveChoices = async () => {
        try {
            await AsyncStorage.setItem('att_tracking_enabled', JSON.stringify(trackingEnabled));
            await AsyncStorage.setItem('analytics_tracking_enabled', JSON.stringify(analyticsTracking));
            await AsyncStorage.setItem('advertising_tracking_enabled', JSON.stringify(advertisingTracking));

            console.log('ATT preferences saved:', {
                trackingEnabled,
                analyticsTracking,
                advertisingTracking,
            });

            navigation.goBack();
        } catch (error) {
            console.error('Error saving ATT preferences:', error);
        }
    };

    const handlePatentInfo = () => {
        navigation.navigate('PatentPending');
    };

    const TrackingOption = ({ title, description, value, onValueChange, disabled }) => (
        <View style={styles.trackingSection}>
            <View style={styles.trackingHeader}>
                <Text style={styles.trackingTitle}>{title}</Text>
                <View style={styles.trackingRight}>
                    <Switch
                        value={value}
                        onValueChange={onValueChange}
                        disabled={disabled}
                        trackColor={{ false: '#d1d1d6', true: COLORS.primary }}
                        thumbColor='#ffffff'
                        ios_backgroundColor="#d1d1d6"
                    />
                    <Text style={styles.arrow}>›</Text>
                </View>
            </View>
            <View style={styles.divider} />
            <Text style={styles.trackingDescription}>{description}</Text>
        </View>
    );

    return (
        <SafeScreenContainer>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header with Logo and Patent Info */}
                <View style={styles.header}>
                    <Image
                        source={IMAGES.logoMain}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.patentText}>{t('Patent Pending')}</Text>
                    <TouchableOpacity onPress={handlePatentInfo}>
                        <Text style={styles.infoLink}>
                            for more information{' '}
                            <Text style={styles.clickHere}>{t('click here')}</Text>
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Title */}
                <Text style={styles.title}>{t('ATT Tracking Settings')}</Text>

                {/* Description */}
                <Text style={styles.description}>{t('We would like your permission to track you across apps and websites owned by other companies for the following purposes:')}</Text>

                {/* Tracking Options */}
                <TrackingOption
                    title={t('General Tracking')}
                    description="Allow RoundBuy to track your activity across other companies' apps and websites for personalized experience."
                    value={trackingEnabled}
                    onValueChange={setTrackingEnabled}
                />



            </ScrollView>

            {/* Footer Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveChoices}
                >
                    <Text style={styles.saveButtonText}>{t('Save my Choices')}</Text>
                </TouchableOpacity>
            </View>
        </SafeScreenContainer>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    header: {
        alignItems: 'flex-start',
        marginBottom: 10,
        marginTop: 10,
    },
    logo: {
        width: 140,
        height: 60,
    },
    patentText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1a1a1a',
        marginTop: 12,
        marginBottom: 6,
        letterSpacing: -0.2,
    },
    infoLink: {
        fontSize: 13,
        fontWeight: '400',
        color: '#6a6a6a',
        letterSpacing: -0.1,
    },
    clickHere: {
        color: COLORS.primary,
        textDecorationLine: 'underline',
        fontWeight: '500',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000000ff',
        marginBottom: 20,
        letterSpacing: -0.3,
    },
    description: {
        fontSize: 14,
        fontWeight: '400',
        color: '#000000ff',
        marginBottom: 4,
        lineHeight: 20,
        letterSpacing: -0.1,
    },
    trackingSection: {
        marginBottom: 2,
    },
    trackingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    trackingTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1a1a1a',
        flex: 1,
        letterSpacing: -0.2,
    },
    trackingRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    arrow: {
        fontSize: 24,
        fontWeight: '400',
        color: '#000000ff',
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginTop: 8,
        marginBottom: 1,
    },
    trackingDescription: {
        fontSize: 15,
        fontWeight: '700',
        color: '#000000ff',
        lineHeight: 19,
        letterSpacing: -0.1,
    },
    viewPolicyButton: {
        paddingVertical: 12,
        marginTop: 8,
        marginBottom: 20,
    },
    viewPolicyText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#000000ff',
        letterSpacing: -0.1,
    },
    footer: {
        paddingTop: 16,
        paddingBottom: 2,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    saveButton: {
        height: 54,
        borderRadius: 27,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    saveButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        letterSpacing: 0.3,
    },
});

export default ATTTrackingSettingsScreen;
