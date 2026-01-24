import React, { useState } from 'react';
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
import { useAuth } from '../../../context/AuthContext';

const ConfirmAccessRightsScreen = ({ route, navigation }) => {
    const { t } = useTranslation();
    const { requestType, title } = route.params;
    const { user } = useAuth();
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        if (!email || !password) {
            Alert.alert(t('Error'), t('Please enter your email and password'));
            return;
        }

        try {
            setIsLoading(true);

            // TODO: Verify credentials with backend
            // For now, simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Navigate to email verification
            navigation.navigate('PrivacyEmailVerification', {
                requestType,
                title,
                email,
            });
        } catch (error) {
            Alert.alert(t('Error'), t('Failed to verify credentials. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <GlobalHeader
                title={t('Confirm Your Access Rights')}
                navigation={navigation}
                showBackButton={true}
                showIcons={false}
            />

            <View style={styles.content}>
                {/* Info Section */}
                <View style={styles.infoSection}>
                    <Ionicons name="shield-checkmark" size={64} color={COLORS.primary} />
                    <Text style={styles.infoTitle}>{t('Verify Your Identity')}</Text>
                    <Text style={styles.infoText}>
                        To proceed with "{title}", please confirm your identity by signing in.
                    </Text>
                </View>

                {/* Form Section */}
                <View style={styles.formSection}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('Email Address')}</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder={t('Enter your email')}
                            placeholderTextColor="#999"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!user?.email} // Disable if user is logged in
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('Password')}</Text>
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder={t('Enter your password')}
                            placeholderTextColor="#999"
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.confirmButton, isLoading && styles.buttonDisabled]}
                        onPress={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.confirmButtonText}>{t('Confirm Identity')}</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Security Notice */}
                <View style={styles.securityNotice}>
                    <Ionicons name="lock-closed" size={16} color="#666" />
                    <Text style={styles.securityText}>{t('Your credentials are encrypted and secure')}</Text>
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
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    formSection: {
        marginTop: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d0d0d0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#000',
    },
    confirmButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12,
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    securityNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        paddingHorizontal: 20,
    },
    securityText: {
        fontSize: 13,
        color: '#666',
        marginLeft: 8,
    },
});

export default ConfirmAccessRightsScreen;
