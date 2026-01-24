import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../../context/TranslationContext';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import GlobalHeader from '../../../components/GlobalHeader';

const EmailVerificationScreen = ({ route, navigation }) => {
    const { t } = useTranslation();
    const { requestType, title, email } = route.params;
    const [code, setCode] = useState(['', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

    useEffect(() => {
        // Start countdown timer
        const timer = setInterval(() => {
            setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleCodeChange = (text, index) => {
        // Only allow numbers
        if (text && !/^\d+$/.test(text)) return;

        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        // Auto-focus next input
        if (text && index < 3) {
            inputRefs[index + 1].current?.focus();
        }

        // Auto-submit when all 4 digits are entered
        if (newCode.every(digit => digit !== '') && index === 3) {
            handleVerify(newCode.join(''));
        }
    };

    const handleKeyPress = (e, index) => {
        // Handle backspace
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const handleVerify = async (verificationCode = code.join('')) => {
        if (verificationCode.length !== 4) {
            Alert.alert(t('Error'), t('Please enter the 4-digit verification code'));
            return;
        }

        try {
            setIsLoading(true);

            // TODO: Verify code with backend
            // For now, simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // For demo, accept any code (in production, verify with backend)
            // Navigate to access rights confirmation
            navigation.navigate('AccessRightsConfirmation', {
                requestType,
                title,
                email,
            });
        } catch (error) {
            Alert.alert(t('Error'), t('Invalid verification code. Please try again.'));
            setCode(['', '', '', '']);
            inputRefs[0].current?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendTimer > 0) return;

        try {
            // TODO: Resend verification code via backend
            await new Promise(resolve => setTimeout(resolve, 500));

            Alert.alert(t('Success'), t('Verification code has been resent to your email'));
            setResendTimer(60);
        } catch (error) {
            Alert.alert(t('Error'), t('Failed to resend code. Please try again.'));
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <GlobalHeader
                title={t('Email Verification')}
                navigation={navigation}
                showBackButton={true}
                showIcons={false}
            />

            <View style={styles.content}>
                {/* Info Section */}
                <View style={styles.infoSection}>
                    <Ionicons name="mail" size={64} color={COLORS.primary} />
                    <Text style={styles.infoTitle}>{t('Check Your Email')}</Text>
                    <Text style={styles.infoText}>{t("We've sent a 4-digit verification code to")}</Text>
                    <Text style={styles.emailText}>{email}</Text>
                </View>

                {/* Code Input Section */}
                <View style={styles.codeSection}>
                    <Text style={styles.codeLabel}>{t('Enter Verification Code')}</Text>
                    <View style={styles.codeInputContainer}>
                        {code.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={inputRefs[index]}
                                style={styles.codeInput}
                                value={digit}
                                onChangeText={(text) => handleCodeChange(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                selectTextOnFocus
                            />
                        ))}
                    </View>
                </View>

                {/* Verify Button */}
                <TouchableOpacity
                    style={[styles.verifyButton, isLoading && styles.buttonDisabled]}
                    onPress={() => handleVerify()}
                    disabled={isLoading || code.some(digit => digit === '')}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.verifyButtonText}>{t('Verify Code')}</Text>
                    )}
                </TouchableOpacity>

                {/* Resend Code */}
                <View style={styles.resendSection}>
                    <Text style={styles.resendText}>{t("Didn't receive the code?")}</Text>
                    <TouchableOpacity
                        onPress={handleResendCode}
                        disabled={resendTimer > 0}
                    >
                        <Text style={[
                            styles.resendLink,
                            resendTimer > 0 && styles.resendLinkDisabled
                        ]}>
                            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
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
    infoSection: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    infoTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
        marginTop: 20,
        marginBottom: 12,
    },
    infoText: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
    },
    emailText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.primary,
        marginTop: 4,
    },
    codeSection: {
        marginTop: 40,
    },
    codeLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
        marginBottom: 16,
        textAlign: 'center',
    },
    codeInputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    codeInput: {
        width: 60,
        height: 60,
        borderWidth: 2,
        borderColor: '#d0d0d0',
        borderRadius: 12,
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        color: '#000',
    },
    verifyButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 40,
    },
    verifyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    resendSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        gap: 8,
    },
    resendText: {
        fontSize: 14,
        color: '#666',
    },
    resendLink: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
        textDecorationLine: 'underline',
    },
    resendLinkDisabled: {
        color: '#999',
        textDecorationLine: 'none',
    },
});

export default EmailVerificationScreen;
