import React from 'react';
import { IMAGES } from '../../assets/images';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';

import * as Notifications from 'expo-notifications';

const NotificationPermissionScreen = ({ navigation }) => {
    const { t } = useTranslation();

    const handleAllow = async () => {
        try {
            const { status } = await Notifications.requestPermissionsAsync();
            console.log('Notification permission status:', status);
        } catch (error) {
            console.error('Error requesting notification permissions:', error);
        } finally {
            navigation.navigate('ATTPrompt');
        }
    };

    const handleDontAllow = () => {
        console.log('User denied notifications (skipped request)');
        navigation.navigate('ATTPrompt');
    };

    const handlePatentInfo = () => {
        navigation.navigate('PatentPending');
    };

    return (
        <SafeScreenContainer>
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

            {/* Content */}
            <View style={styles.content}>
                {/* <Text style={styles.title}>{t('ENABLE NOTIFICATIONS')}</Text> */}

                {/* Mock Phone UI with Alert */}
                {/* <View style={styles.mockPhone}>
                    <View style={styles.alertBox}>
                        <Text style={styles.alertTitle}>{t('"RoundBuy" Would Like to Send You Notifications')}</Text>
                        <Text style={styles.alertBody}>{t('Notifications may include alerts, sounds, and icon badges. These can be configured in Settings.')}</Text>
                        <View style={styles.alertButtons}>
                            <TouchableOpacity onPress={handleDontAllow} style={styles.alertButton}>
                                <Text style={styles.alertButtonTextBlue}>{t("Don't Allow")}</Text>
                            </TouchableOpacity>
                            <View style={styles.verticalDivider} />
                            <TouchableOpacity onPress={handleAllow} style={styles.alertButton}>
                                <Text style={styles.alertButtonTextBlue}>{t('Allow')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View> */}


            </View>

            {/* Footer with Action Buttons */}
            {/* Keeping a Continue button at the bottom as well, consistent with ATTPrompt style, although the popup is interactive */}
            <View style={styles.footer}>
                {/* Content */}
                <View style={styles.contentNotification}>
                    {/* Title */}
                    <Text style={styles.titleNotification}>{t('ENABLE NOTIFICATIONS')}</Text>

                    {/* Description */}
                    <Text style={styles.descriptionNotification}>{t('"RoundBuy" would like permission to send you notifications.')}</Text>

                    {/* Explanation */}
                    <Text style={styles.explanation}>{t('Notifications may include alerts, sounds, and icon badges. These can be configured in Settings.')}</Text>
                    <Text style={styles.explanation}>{t('* Some notifications cannot be switched off, they are essential to the function of the app. ')}</Text>
                </View>
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleAllow}
                >
                    <Text style={styles.buttonText}>{t('Allow')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleDontAllow}
                >
                    <Text style={styles.buttonText}>{t('Don\'t Allow')}</Text>
                </TouchableOpacity>
            </View>
        </SafeScreenContainer>
    );
};

const styles = StyleSheet.create({
    header: {
        alignItems: 'flex-start',
        marginBottom: 20,
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
    contentNotification: {
        flex: 1,
        justifyContent: 'center', // Center vertically
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    titleNotification: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 20,
        letterSpacing: -0.3,
    },
    descriptionNotification: {
        fontSize: 17,
        fontWeight: '800',
        color: '#1a1a1a',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 20,
        lineHeight: 20,
        letterSpacing: -0.1,
    },
    explanation: {
        fontSize: 14,
        fontWeight: '400',
        color: '#1a1a1a',
        textAlign: 'center',
        lineHeight: 20,
        letterSpacing: -0.1,
        marginBottom: 20,
    },
    content: {
        flex: 1,
        justifyContent: 'center', // Center vertically
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: -0.3,
    },
    description: {
        fontSize: 14,
        fontWeight: '400',
        color: '#6a6a6a',
        textAlign: 'center',
        marginTop: 30,
        lineHeight: 20,
        letterSpacing: -0.1,
    },
    // Mock Phone Styles
    mockPhone: {
        width: '100%',
        maxWidth: 300,
        padding: 20,
        // Removed fixed height to let content dictate size or be flexible
        // Removed border to make it look cleaner on white background, or keep it subtle
        borderRadius: 20,
        backgroundColor: '#f5f5f5', // Light grey background to represent phone screen area if needed? 
        // Or just transparent if we want the popup floating.
        // User said "mockPhone" so I'll keep a subtle container.
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertBox: {
        backgroundColor: 'rgba(255,255,255,0.98)',
        borderRadius: 14,
        width: 270, // Slightly wider
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    alertTitle: {
        fontSize: 17,
        fontWeight: '600',
        textAlign: 'center',
        paddingTop: 15,
        paddingHorizontal: 15,
        paddingBottom: 5,
        color: '#000',
    },
    alertBody: {
        fontSize: 13,
        textAlign: 'center',
        paddingHorizontal: 15,
        paddingBottom: 15,
        color: '#000',
        lineHeight: 18,
    },
    alertButtons: {
        flexDirection: 'row',
        borderTopWidth: 0.5,
        borderTopColor: '#3d3d3d30', // Subtle separator
    },
    alertButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    alertButtonTextBlue: {
        color: '#007AFF',
        fontSize: 17,
        fontWeight: '600',
    },
    verticalDivider: {
        width: 0.5,
        backgroundColor: '#3d3d3d30',
    },
    // Footer
    footer: {
        paddingTop: 10,
        paddingBottom: 20,
    },
    button: {
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderTopColor: '#dfddddff',
        borderTopWidth: 2,
    },
    buttonText: {
        fontSize: 17,
        fontWeight: '500',
        color: COLORS.primary,
        letterSpacing: 0.1,
    },
});

export default NotificationPermissionScreen;
