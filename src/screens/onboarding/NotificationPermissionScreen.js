import React from 'react';
import { IMAGES } from '../../assets/images';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { ONBOARDING_THEME } from '../../constants/theme';
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
            navigation.navigate('LicenseAgreement');
        }
    };

    const handleDontAllow = () => {
        console.log('User denied notifications (skipped request)');
        navigation.navigate('LicenseAgreement');
    };

    const handlePatentInfo = () => {
        navigation.navigate('PatentPending');
    };

    const { colors, typography, spacing } = ONBOARDING_THEME;

    return (
        <SafeScreenContainer>
            {/* Header with Logo and Patent Info */}
            <View style={styles.header}>
                <Image
                    source={IMAGES.logoMain}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.patentText}>{t('Patents Pending')}</Text>
                <TouchableOpacity onPress={handlePatentInfo}>
                    <Text style={styles.infoLink}>
                        {t('Read more about')} <Text style={[styles.infoLink, { color: colors.link, textDecorationLine: 'underline' }]}>{t('patents')}</Text>
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Title */}
                <Text style={[styles.title, typography.heading]}>{t('Notifications')}</Text>

                {/* Description */}
                <Text style={[styles.description]}>
                    <Text style={{ fontWeight: '700' }}>"RoundBuy" {t('would like permission to send you notifications.')} </Text><Text style={{ fontWeight: '500' }}>{t('Your Notifications may include alerts, updates on messages, discounts and favourites. You can configure them in Settings.')}</Text>
                </Text>
            </View>

            {/* Footer with Action Buttons */}
            <View style={styles.footer}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleAllow}
                    >
                        <Text style={[styles.buttonText, { color: colors.link }]}>{t('Allow')}</Text>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleDontAllow}
                    >
                        <Text style={[styles.buttonText, { color: colors.link }]}>{t('Don\'t Allow')}</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.safetyLink}>
                    <Text style={styles.safetyText}>{t('Our')} <Text style={{ color: colors.link, textDecorationLine: 'underline' }}>{t('Safety Disclaimers')}</Text></Text>
                </TouchableOpacity>
            </View>
        </SafeScreenContainer>
    );
};

const styles = StyleSheet.create({
    header: {
        alignItems: 'flex-start',
        marginBottom: 40,
        marginTop: 10,
        paddingHorizontal: 20,
    },
    logo: {
        width: 150,
        height: 60,
        marginBottom: 5,
    },
    patentText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#001C64',
        marginBottom: 2,
    },
    infoLink: {
        fontSize: 14,
        fontWeight: '500',
        color: '#001C64',
    },
    content: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 30,
        alignItems: 'center',
        paddingBottom: 30, // Space above footer
    },
    title: {
        marginBottom: 30,
    },
    description: {
        fontSize: 18,
        textAlign: 'center',
        color: '#000000',
        lineHeight: 24,
        paddingHorizontal: 15,
    },
    footer: {
        paddingBottom: 40,
        paddingHorizontal: 0,
    },
    buttonContainer: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#FFFFFF',
    },
    button: {
        height: 55,
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    buttonText: {
        fontSize: 20,
        fontWeight: '600',
    },
    safetyLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    safetyText: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 22,
        textAlign: 'center',
        color: '#333333',
    }
});

export default NotificationPermissionScreen;
