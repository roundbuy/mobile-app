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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import disputeService from '../../services/disputeService';

const CreateTicketScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        category: '',
        subject: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoadingCategories(true);
            const response = await disputeService.getSupportCategories();
            setCategories(response.data || []);
            if (response.data && response.data.length > 0) {
                setFormData(prev => ({ ...prev, category: response.data[0].name }));
            }
        } catch (error) {
            console.error('Load categories error:', error);
            // Default categories if API fails
            const defaultCategories = [
                { id: 1, name: 'Account Issues' },
                { id: 2, name: 'Technical Support' },
                { id: 3, name: 'Billing' },
                { id: 4, name: 'Advertisement Issues' },
                { id: 5, name: 'Other' },
            ];
            setCategories(defaultCategories);
            setFormData(prev => ({ ...prev, category: 'Account Issues' }));
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.category) {
            Alert.alert(t('Error'), t('Please select a category'));
            return;
        }

        if (!formData.subject.trim()) {
            Alert.alert(t('Error'), t('Please enter a subject'));
            return;
        }

        if (!formData.description.trim()) {
            Alert.alert(t('Error'), t('Please describe your issue'));
            return;
        }

        if (formData.description.trim().length < 20) {
            Alert.alert(t('Error'), 'Please provide more details (at least 20 characters)');
            return;
        }

        try {
            setLoading(true);
            const response = await disputeService.createTicket({
                category: formData.category,
                subject: formData.subject.trim(),
                description: formData.description.trim(),
            });

            Alert.alert(
                t('Success'),
                t('Your support ticket has been created successfully. Our team will respond soon.'),
                [
                    {
                        text: t('View Ticket'),
                        onPress: () => {
                            navigation.replace('TicketDetail', { ticketId: response.data.id });
                        },
                    },
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error) {
            console.error('Create ticket error:', error);
            Alert.alert(
                t('Error'),
                error.response?.data?.message || t('Failed to create ticket. Please try again.')
            );
        } finally {
            setLoading(false);
        }
    };

    if (loadingCategories) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4169E1" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back" size={28} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('Create Support Ticket')}</Text>
                    <View style={{ width: 28 }} />
                </View>

                {/* Info Banner */}
                <View style={styles.infoBanner}>
                    <Ionicons name="information-circle" size={24} color="#4169E1" />
                    <Text style={styles.infoText}>{t('Our support team typically responds within 24 hours')}</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {/* Category */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Category <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.category}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, category: value })
                                }
                                style={styles.picker}
                            >
                                {categories.map((cat) => (
                                    <Picker.Item
                                        key={cat.id}
                                        label={cat.name}
                                        value={cat.name}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    {/* Subject */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Subject <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder={t('Brief summary of your issue')}
                            value={formData.subject}
                            onChangeText={(text) =>
                                setFormData({ ...formData, subject: text })
                            }
                            maxLength={100}
                        />
                        <Text style={styles.charCount}>
                            {formData.subject.length}/100
                        </Text>
                    </View>

                    {/* Description */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Description <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder={t('Please describe your issue in detail...')}
                            value={formData.description}
                            onChangeText={(text) =>
                                setFormData({ ...formData, description: text })
                            }
                            multiline
                            numberOfLines={8}
                            textAlignVertical="top"
                            maxLength={1000}
                        />
                        <Text style={styles.charCount}>
                            {formData.description.length}/1000
                        </Text>
                    </View>

                    {/* Tips */}
                    <View style={styles.tipsContainer}>
                        <Text style={styles.tipsTitle}>{t('Tips for faster resolution:')}</Text>
                        <View style={styles.tip}>
                            <Ionicons name="checkmark-circle" size={16} color="#32CD32" />
                            <Text style={styles.tipText}>{t("Be specific about the issue you're experiencing")}</Text>
                        </View>
                        <View style={styles.tip}>
                            <Ionicons name="checkmark-circle" size={16} color="#32CD32" />
                            <Text style={styles.tipText}>{t('Include any error messages you see')}</Text>
                        </View>
                        <View style={styles.tip}>
                            <Ionicons name="checkmark-circle" size={16} color="#32CD32" />
                            <Text style={styles.tipText}>{t('Mention steps to reproduce the problem')}</Text>
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <>
                                <Ionicons name="send" size={20} color="#FFF" />
                                <Text style={styles.submitButtonText}>{t('Submit Ticket')}</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F4FF',
        padding: 12,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 8,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#4169E1',
        marginLeft: 8,
    },
    form: {
        padding: 16,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
    },
    required: {
        color: '#DC143C',
    },
    pickerContainer: {
        backgroundColor: '#FFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    picker: {
        height: 50,
    },
    input: {
        backgroundColor: '#FFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 14,
        color: '#000',
    },
    textArea: {
        height: 150,
        paddingTop: 12,
    },
    charCount: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 4,
    },
    tipsContainer: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
    },
    tipsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 12,
    },
    tip: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    tipText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        marginLeft: 8,
    },
    submitButton: {
        flexDirection: 'row',
        backgroundColor: '#4169E1',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#CCC',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
        marginLeft: 8,
    },
});

export default CreateTicketScreen;
