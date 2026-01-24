import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../context/TranslationContext';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';
import userService from '../../../services/userService';

const EditUsernameScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { user, updateUser } = useAuth();
    const isFirstTime = route?.params?.isFirstTime || false;

    const [currentUsername, setCurrentUsername] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [availabilityStatus, setAvailabilityStatus] = useState(null); // null, 'available', 'taken', 'invalid'
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (user?.username) {
            setCurrentUsername(user.username);
        }
    }, [user]);

    useEffect(() => {
        // Debounce username check
        if (!newUsername) {
            setAvailabilityStatus(null);
            setErrorMessage('');
            return;
        }

        const timeoutId = setTimeout(() => {
            checkUsernameAvailability(newUsername);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [newUsername]);

    const validateUsername = (username) => {
        if (!username) {
            return { valid: false, message: 'Username is required' };
        }

        if (username.length < 3) {
            return { valid: false, message: 'Username must be at least 3 characters' };
        }

        if (username.length > 50) {
            return { valid: false, message: 'Username must be less than 50 characters' };
        }

        // Check format: must start with lowercase letter or number
        const usernameRegex = /^[a-z0-9][a-z0-9_-]*$/;
        if (!usernameRegex.test(username)) {
            return { valid: false, message: 'Invalid format. Must start with lowercase letter or number' };
        }

        return { valid: true };
    };

    const checkUsernameAvailability = async (username) => {
        const validation = validateUsername(username);

        if (!validation.valid) {
            setAvailabilityStatus('invalid');
            setErrorMessage(validation.message);
            return;
        }

        // If it's the same as current username, it's available
        if (username === currentUsername) {
            setAvailabilityStatus('available');
            setErrorMessage('This is your current username');
            return;
        }

        try {
            setIsChecking(true);
            const response = await userService.checkUsername(username);

            if (response.success && response.data.available) {
                setAvailabilityStatus('available');
                setErrorMessage('');
            } else {
                setAvailabilityStatus('taken');
                setErrorMessage('Username is already taken');
            }
        } catch (error) {
            console.error('Error checking username:', error);
            setAvailabilityStatus('invalid');
            setErrorMessage(error.message || 'Error checking username');
        } finally {
            setIsChecking(false);
        }
    };

    const handleSave = async () => {
        if (!newUsername) {
            Alert.alert(t('Error'), t('Please enter a username'));
            return;
        }

        if (newUsername === currentUsername) {
            Alert.alert(t('No Changes'), t('Username is the same as current'));
            return;
        }

        if (availabilityStatus !== 'available') {
            Alert.alert(t('Error'), errorMessage || t('Please choose a valid username'));
            return;
        }

        try {
            setIsSaving(true);
            const response = await userService.updateUsername(newUsername);

            if (response.success) {
                // Update user data in context with new username
                if (response.data && response.data.user) {
                    await updateUser({ username: response.data.user.username });
                }

                Alert.alert(
                    t('Success'),
                    t('Username updated successfully'),
                    [
                        {
                            text: t('OK'),
                            onPress: () => {
                                if (isFirstTime) {
                                    // If first time, go back to search screen
                                    navigation.navigate('SearchScreen');
                                } else {
                                    navigation.goBack();
                                }
                            }
                        }
                    ]
                );
            }
        } catch (error) {
            console.error('Error updating username:', error);
            Alert.alert(t('Error'), error.message || t('Failed to update username'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleBack = () => {
        if (isFirstTime) {
            Alert.alert(
                t('Username Required'),
                t('You must create a username to continue'),
                [{ text: t('OK') }]
            );
        } else {
            navigation.goBack();
        }
    };

    const getStatusIcon = () => {
        if (isChecking) {
            return <ActivityIndicator size="small" color={COLORS.primary} />;
        }

        switch (availabilityStatus) {
            case 'available':
                return <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />;
            case 'taken':
            case 'invalid':
                return <Ionicons name="close-circle" size={24} color="#d32f2f" />;
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {isFirstTime ? 'Create Username' : 'Edit Username'}
                </Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {isFirstTime && (
                    <View style={styles.welcomeSection}>
                        <Ionicons name="person-add" size={48} color={COLORS.primary} />
                        <Text style={styles.welcomeTitle}>{t('Welcome to RoundBuy!')}</Text>
                        <Text style={styles.welcomeText}>{t('Please create a username to get started. Your username will be visible on your products, profile, and reviews.')}</Text>
                    </View>
                )}

                {/* Current Username (if exists) */}
                {currentUsername && !isFirstTime && (
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>{t('Current Username')}</Text>
                        <View style={[styles.inputContainer, styles.inputContainerDisabled]}>
                            <TextInput
                                style={styles.input}
                                value={currentUsername}
                                placeholder={t('Current username')}
                                placeholderTextColor="#999"
                                autoCapitalize="none"
                                editable={false}
                            />
                        </View>
                    </View>
                )}

                {/* New Username */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>
                        {isFirstTime ? 'Username' : 'New Username'}
                    </Text>
                    <View style={[
                        styles.inputContainer,
                        availabilityStatus === 'available' && styles.inputContainerSuccess,
                        (availabilityStatus === 'taken' || availabilityStatus === 'invalid') && styles.inputContainerError
                    ]}>
                        <TextInput
                            style={styles.input}
                            value={newUsername}
                            onChangeText={setNewUsername}
                            placeholder={t('Enter username')}
                            placeholderTextColor="#999"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {getStatusIcon()}
                    </View>
                    {errorMessage && (
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    )}
                    {availabilityStatus === 'available' && newUsername !== currentUsername && (
                        <Text style={styles.successText}>{t('Username is available!')}</Text>
                    )}
                </View>

                {/* Username Guidelines */}
                <View style={styles.guidelinesContainer}>
                    {/* Header with info icon */}
                    <View style={styles.guidelinesHeader}>
                        <Ionicons name="information-circle-outline" size={20} color="#666" />
                        <Text style={styles.guidelinesHeaderText}>{t('Your username is shown on your products, profile, and feedbacks or reviews etc.')}</Text>
                    </View>

                    {/* Community Standards */}
                    <Text style={styles.guidelinesTitle}>{t('When creating a username or changing it into a new one, please follow the Community standards below:')}</Text>

                    {/* Refrain from personal info */}
                    <Text style={styles.guidelineWarning}>{t('Refrain from using personal information!')}</Text>

                    {/* Allowed at beginning */}
                    <View style={styles.guidelineSection}>
                        <Text style={styles.guidelineSectionTitle}>{t('These can be at the beginning of the username:')}</Text>
                        <Text style={styles.guidelineItem}>{t('• Lowercase Latin letters (a-z)')}</Text>
                        <Text style={styles.guidelineItem}>{t('• Numbers (0-9)')}</Text>
                    </View>

                    {/* Not allowed at beginning */}
                    <View style={styles.guidelineSection}>
                        <Text style={styles.guidelineSectionTitle}>{t('These cannot be at the beginning of the username:')}</Text>
                        <Text style={styles.guidelineItem}>{t('• Hyphens (-)')}</Text>
                        <Text style={styles.guidelineItem}>{t('• Underscores (_)')}</Text>
                    </View>

                    {/* Not allowed at all */}
                    <View style={styles.guidelineSection}>
                        <Text style={styles.guidelineSectionTitle}>{t('These are not allowed:')}</Text>
                        <Text style={styles.guidelineItem}>{t('• Blank spaces')}</Text>
                        <Text style={styles.guidelineItem}>{t('• Emojis')}</Text>
                        <Text style={styles.guidelineItem}>{t('• Uppercase letters')}</Text>
                    </View>

                    {/* More Info Link */}
                    <View style={styles.moreInfoContainer}>
                        <Text style={styles.moreInfoText}>{t('For more information click')}</Text>
                        <TouchableOpacity onPress={() => console.log('More info pressed')}>
                            <Text style={styles.moreInfoLink}>{t('here.')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        (isSaving || availabilityStatus !== 'available' || !newUsername) && styles.saveButtonDisabled
                    ]}
                    onPress={handleSave}
                    disabled={isSaving || availabilityStatus !== 'available' || !newUsername}
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>
                            {isFirstTime ? 'Create Username' : 'Save Username'}
                        </Text>
                    )}
                </TouchableOpacity>

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
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    headerRight: {
        width: 32,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    welcomeSection: {
        alignItems: 'center',
        paddingVertical: 30,
        marginBottom: 20,
    },
    welcomeTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
        marginTop: 16,
        marginBottom: 8,
    },
    welcomeText: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    fieldContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d0d0d0',
        borderRadius: 8,
        paddingHorizontal: 16,
        minHeight: 48,
    },
    inputContainerDisabled: {
        backgroundColor: '#f5f5f5',
    },
    inputContainerSuccess: {
        borderColor: '#4CAF50',
    },
    inputContainerError: {
        borderColor: '#d32f2f',
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#000',
        paddingVertical: 12,
    },
    errorText: {
        fontSize: 12,
        color: '#d32f2f',
        marginTop: 4,
    },
    successText: {
        fontSize: 12,
        color: '#4CAF50',
        marginTop: 4,
    },
    guidelinesContainer: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    guidelinesHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    guidelinesHeaderText: {
        flex: 1,
        fontSize: 11,
        color: '#666',
        marginLeft: 8,
        lineHeight: 16,
    },
    guidelinesTitle: {
        fontSize: 11,
        color: '#333',
        marginBottom: 8,
        lineHeight: 16,
    },
    guidelineWarning: {
        fontSize: 11,
        color: '#d32f2f',
        fontWeight: '600',
        marginBottom: 8,
    },
    guidelineSection: {
        marginBottom: 8,
    },
    guidelineSectionTitle: {
        fontSize: 11,
        color: '#333',
        fontWeight: '500',
        marginBottom: 6,
    },
    guidelineItem: {
        fontSize: 10,
        color: '#666',
        marginLeft: 8,
        marginBottom: 4,
        lineHeight: 14,
    },
    moreInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    moreInfoText: {
        fontSize: 11,
        color: '#666',
    },
    moreInfoLink: {
        fontSize: 11,
        color: COLORS.primary,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    bottomSpacer: {
        height: 40,
    },
});

export default EditUsernameScreen;
