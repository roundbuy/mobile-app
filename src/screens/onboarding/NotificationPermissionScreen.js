import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, ScrollView } from 'react-native'; // Removed PermissionsAndroid/PushNotificationIOS for now, simulating UI
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { useTranslation } from '../../context/TranslationContext';

// Placeholder for notification permission logic
// In a real app, use expo-notifications or react-native-push-notification

const NotificationPermissionScreen = ({ navigation }) => {
    const { t } = useTranslation();

    const handleAllow = async () => {
        console.log('User allowed notifications');
        // Logic to request actual permission would go here
        // const { status } = await Notifications.requestPermissionsAsync();
        navigation.navigate('ATTPrompt'); // Proceed to ATT Prompt
    };

    const handleDontAllow = () => {
        console.log('User denied notifications');
        navigation.navigate('ATTPrompt');
    };

    return (
        <SafeScreenContainer>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>{t('ENABLE NOTIFICATIONS')}</Text>

                    {/* Mocking the UI from the screenshot */}
                    <View style={styles.mockPhone}>
                        <View style={styles.alertBox}>
                            <Text style={styles.alertTitle}>"RoundBuy" Would Like to Send You Notifications</Text>
                            <Text style={styles.alertBody}>Notifications may include alerts, sounds, and icon badges. These can be configured in Settings.</Text>
                            <View style={styles.alertButtons}>
                                <TouchableOpacity onPress={handleDontAllow} style={styles.alertButton}>
                                    <Text style={styles.alertButtonTextBlue}>Don't Allow</Text>
                                </TouchableOpacity>
                                <View style={styles.verticalDivider} />
                                <TouchableOpacity onPress={handleAllow} style={styles.alertButton}>
                                    <Text style={styles.alertButtonTextBlue}>Allow</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.footerText}>
                        {t('Select "ALLOW" to receive notifications on real-time information, deals and messages from your friends.')}
                    </Text>

                    <TouchableOpacity style={styles.nextButton} onPress={handleAllow}>
                        <Text style={styles.nextButtonText}>{t('NEXT')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E3A5F', // Dark Blue background from screenshot
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#D4AF37', // Gold/Beige color
        letterSpacing: 2,
        marginBottom: 40,
        textAlign: 'center',
    },
    mockPhone: {
        width: 280,
        height: 400,
        backgroundColor: '#f0f0f0',
        borderRadius: 30,
        borderWidth: 10,
        borderColor: '#d0d0d0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        opacity: 0.9
    },
    alertBox: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 14,
        width: 240,
        overflow: 'hidden',
    },
    alertTitle: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        padding: 15,
        paddingBottom: 5,
        color: '#000',
    },
    alertBody: {
        fontSize: 13,
        textAlign: 'center',
        paddingHorizontal: 15,
        paddingBottom: 15,
        color: '#000',
    },
    alertButtons: {
        flexDirection: 'row',
        borderTopWidth: 0.5,
        borderTopColor: '#ccc',
    },
    alertButton: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
    },
    alertButtonTextBlue: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '500',
    },
    verticalDivider: {
        width: 0.5,
        backgroundColor: '#ccc',
    },
    footerText: {
        color: '#a0b0c0',
        textAlign: 'center',
        fontSize: 14,
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    nextButton: {
        backgroundColor: '#D4AF37',
        paddingVertical: 15,
        paddingHorizontal: 60,
        borderRadius: 5,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});

export default NotificationPermissionScreen;
