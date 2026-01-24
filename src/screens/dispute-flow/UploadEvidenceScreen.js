import React, { useState } from 'react';
import { useTranslation } from '../../context/TranslationContext';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import disputeService from '../../services/disputeService';

const UploadEvidenceScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { disputeType, problems, formData } = route.params;

    const [files, setFiles] = useState([]);
    const [agreed, setAgreed] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const evidenceTypes = [
        'Exchange confirmation & proof',
        'Tracking/return information (if by postage)',
        'Seller & Buyer communication history',
    ];

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                multiple: true,
            });

            if (result.type === 'success') {
                // Check file size (16MB = 16777216 bytes)
                if (result.size > 16777216) {
                    Alert.alert(t('File Too Large'), t('Maximum file size is 16MB'));
                    return;
                }

                setFiles([...files, result]);
            }
        } catch (error) {
            console.error('Document picker error:', error);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(t('Permission Required'), t('Please grant permission to access photos'));
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets) {
            const newFiles = result.assets.map(asset => ({
                name: asset.fileName || 'image.jpg',
                uri: asset.uri,
                type: asset.type || 'image/jpeg',
                size: asset.fileSize,
            }));

            // Check total size
            const totalSize = newFiles.reduce((sum, file) => sum + (file.size || 0), 0);
            if (totalSize > 16777216) {
                Alert.alert(t('Files Too Large'), t('Total file size must be less than 16MB'));
                return;
            }

            setFiles([...files, ...newFiles]);
        }
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!agreed) {
            Alert.alert(t('Agreement Required'), t('Please agree to the terms before submitting'));
            return;
        }

        if (files.length === 0) {
            Alert.alert(t('Evidence Required'), t('Please upload at least one piece of evidence'));
            return;
        }

        setSubmitting(true);

        try {
            // Create dispute with form data
            const disputeData = {
                dispute_type: disputeType,
                problems: problems,
                issue_description: formData.issue,
                amount: parseFloat(formData.amount),
                additional_notes: formData.additionalInfo,
                // Add other required fields
            };

            const response = await disputeService.createDispute(disputeData);

            if (response.success) {
                // Upload evidence files
                // Note: This would need a separate endpoint for file uploads

                Alert.alert(
                    t('Dispute Submitted'),
                    t('Your dispute has been submitted successfully. We will review it and get back to you soon.'),
                    [
                        {
                            text: t('OK'),
                            onPress: () => {
                                navigation.navigate('SupportResolution');
                            },
                        },
                    ]
                );
            }
        } catch (error) {
            console.error('Submit dispute error:', error);
            Alert.alert(t('Error'), error.message || t('Failed to submit dispute. Please try again.'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>{t('Dispute')}</Text>
                    <Text style={styles.headerStep}>5/5</Text>
                </View>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {/* Title */}
                <Text style={styles.title}>{t('Upload dispute evidence')}</Text>
                <Text style={styles.subtitle}>{t('Please provide evidence for the dispute')}</Text>

                {/* Evidence Types */}
                <View style={styles.evidenceTypesCard}>
                    <Text style={styles.evidenceTypesTitle}>{t('List of evidence types:')}</Text>
                    {evidenceTypes.map((type, index) => (
                        <View key={index} style={styles.evidenceTypeItem}>
                            <View style={styles.bullet}>
                                <View style={styles.bulletDot} />
                            </View>
                            <Text style={styles.evidenceTypeText}>{type}</Text>
                        </View>
                    ))}
                </View>

                {/* Evidence List Label */}
                <Text style={styles.evidenceListLabel}>{t('Evidence List')}</Text>

                {/* Upload Area */}
                <TouchableOpacity
                    style={styles.uploadArea}
                    onPress={() => {
                        Alert.alert(
                            t('Choose Upload Method'),
                            t('Select how you want to upload files'),
                            [
                                { text: t('Photos'), onPress: pickImage },
                                { text: t('Documents'), onPress: pickDocument },
                                { text: t('Cancel'), style: t('cancel') },
                            ]
                        );
                    }}
                >
                    <Ionicons name="cloud-upload-outline" size={48} color="#999" />
                    <Text style={styles.uploadText}>
                        <Text style={styles.uploadLink}>{t('Choose file(s)')}</Text> or drag file(s) here
                    </Text>
                </TouchableOpacity>

                {/* File Size Info */}
                <Text style={styles.fileSizeInfo}>{t('Maximum file size: 16MB')}</Text>

                {/* Uploaded Files */}
                {files.length > 0 && (
                    <View style={styles.filesContainer}>
                        {files.map((file, index) => (
                            <View key={index} style={styles.fileItem}>
                                <Ionicons name="document-outline" size={24} color="#4169E1" />
                                <Text style={styles.fileName} numberOfLines={1}>
                                    {file.name}
                                </Text>
                                <TouchableOpacity onPress={() => removeFile(index)}>
                                    <Ionicons name="close-circle" size={24} color="#DC143C" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                {/* Info Link */}
                <TouchableOpacity style={styles.infoLink}>
                    <Text style={styles.infoLinkText}>
                        More information on Disputes & Resolution, <Text style={styles.linkText}>{t('click here')}</Text>
                    </Text>
                    <Ionicons name="information-circle-outline" size={20} color="#666" style={styles.infoIcon} />
                </TouchableOpacity>

                {/* Agreement Checkbox */}
                <TouchableOpacity
                    style={styles.agreementContainer}
                    onPress={() => setAgreed(!agreed)}
                >
                    <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                        {agreed && <Ionicons name="checkmark" size={16} color="#FFF" />}
                    </View>
                    <Text style={styles.agreementText}>{t("By clicking the \"Submit dispute\" button below you're agreeing to abide by provided information will RoundBuy once you submit this case")}</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        (!agreed || files.length === 0 || submitting) && styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={!agreed || files.length === 0 || submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.submitButtonText}>{t('Submit dispute')}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 4,
        marginRight: 12,
    },
    headerTitleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    headerStep: {
        fontSize: 14,
        color: '#666',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
    },
    evidenceTypesCard: {
        backgroundColor: '#F9F9F9',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 24,
    },
    evidenceTypesTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 12,
    },
    evidenceTypeItem: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    bullet: {
        width: 20,
        paddingTop: 6,
    },
    bulletDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#000',
    },
    evidenceTypeText: {
        flex: 1,
        fontSize: 13,
        color: '#333',
        lineHeight: 18,
    },
    evidenceListLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 12,
    },
    uploadArea: {
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
        borderRadius: 8,
        padding: 40,
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        marginBottom: 8,
    },
    uploadText: {
        fontSize: 14,
        color: '#666',
        marginTop: 12,
        textAlign: 'center',
    },
    uploadLink: {
        color: '#4169E1',
        textDecorationLine: 'underline',
    },
    fileSizeInfo: {
        fontSize: 12,
        color: '#999',
        marginBottom: 16,
    },
    filesContainer: {
        marginBottom: 16,
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        marginBottom: 8,
    },
    fileName: {
        flex: 1,
        fontSize: 14,
        color: '#000',
        marginLeft: 12,
    },
    infoLink: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    infoLinkText: {
        fontSize: 13,
        color: '#666',
        flex: 1,
    },
    linkText: {
        color: '#4169E1',
        textDecorationLine: 'underline',
    },
    infoIcon: {
        marginLeft: 8,
    },
    agreementContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#CCC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: '#4169E1',
        borderColor: '#4169E1',
    },
    agreementText: {
        flex: 1,
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    submitButton: {
        backgroundColor: '#4169E1',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#CCC',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
});

export default UploadEvidenceScreen;
