import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';
import { uploadImages } from '../../services/advertisementService';
import { checkMultipleFields, formatModerationError } from '../../services/moderationService';

import { useTranslation } from '../../context/TranslationContext';
import { rewardsService } from '../../services/rewardsService';
import { getFullImageUrl } from '../../utils/imageUtils';

const EditAnAdScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { adData } = route.params || {};

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [displayTime, setDisplayTime] = useState('60days');
    const [referralCode, setReferralCode] = useState('');
    const [referralError, setReferralError] = useState('');
    const [referrerName, setReferrerName] = useState('');

    const [selectedImages, setSelectedImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [moderationError, setModerationError] = useState('');

    // Pre-fill data on mount
    useEffect(() => {
        if (adData) {
            setTitle(adData.title || '');
            setDescription(adData.description || '');
            // adData.display_duration_days might be null/undefined, specific logic needed if backend returns it
            setDisplayTime(adData.display_duration_days === null ? 'continuous' : '60days');

            // Parse images
            try {
                let images = [];
                if (typeof adData.images === 'string') {
                    images = JSON.parse(adData.images);
                } else if (Array.isArray(adData.images)) {
                    images = adData.images;
                }

                // Map to format expected by Upload (uri)
                // For existing images, we might need a flag to know they don't need re-uploading
                // But for now, let's treat them as URIs. 
                // NOTE: Implementation of re-uploading existing images might depend on backend.
                // Usually we send list of kept image URLs + new files.
                // For simplicity/compatibility with current flow, we might need to download them or just pass them through if uploadImages handles strings.
                // checking uploadImages service... it expects objects with uri. 

                // Strategy: We will pass existing images as is to the next screen if they aren't modified.
                // But the UI needs to show them.
                const formattedImages = images.map(img => ({
                    uri: getFullImageUrl(img),
                    isExisting: true,
                    originalPath: img
                }));
                setSelectedImages(formattedImages);

            } catch (e) {
                console.error('Error parsing images for edit:', e);
            }
        }
    }, [adData]);

    // Request camera/gallery permissions
    const requestPermissions = async () => {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
            Alert.alert(
                t('Permissions Required'),
                t('Camera and media library permissions are required to select images.'),
                [{ text: t('OK') }]
            );
            return false;
        }
        return true;
    };

    // Pick image from camera
    const pickFromCamera = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8, // Compress to reduce file size
                base64: false,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const image = result.assets[0];
                validateAndAddImage(image);
            }
        } catch (error) {
            console.error('Camera error:', error);
            Alert.alert(t('Error'), t('Failed to take photo. Please try again.'));
        }
    };

    // Pick image from gallery
    const pickFromGallery = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8, // Compress to reduce file size
                selectionLimit: 3 - selectedImages.length, // Allow selecting remaining slots
                base64: false,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                result.assets.forEach(image => validateAndAddImage(image));
            }
        } catch (error) {
            console.error('Gallery error:', error);
            Alert.alert(t('Error'), t('Failed to select images. Please try again.'));
        }
    };

    // Validate and add image
    const validateAndAddImage = (image) => {
        // Check file size (300KB limit)
        const fileSizeKB = image.fileSize ? image.fileSize / 1024 : 0;
        if (fileSizeKB > 300) {
            Alert.alert(t('File Too Large'), t('Please select an image smaller than 300KB.'));
            return;
        }

        // Check total count
        if (selectedImages.length >= 3) {
            Alert.alert(t('Maximum Images'), t('You can only select up to 3 images.'));
            return;
        }

        setSelectedImages(prev => [...prev, image]);
    };

    // Remove image
    const removeImage = (index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    // Continue to next screen
    const handleContinue = async () => {
        // Validate images
        if (selectedImages.length === 0) {
            Alert.alert(t('Error'), t('Please select at least one image for your advertisement.'));
            return;
        }

        // Validate title and description
        if (!title.trim()) {
            Alert.alert(t('Error'), t('Please enter a title for your advertisement.'));
            return;
        }

        if (!description.trim()) {
            Alert.alert(t('Error'), t('Please enter a description for your advertisement.'));
            return;
        }

        setIsUploading(true);
        setUploadError('');
        setModerationError('');

        try {
            // Check for moderation violations
            const moderationResult = await checkMultipleFields({
                title: title.trim(),
                description: description.trim()
            });

            if (!moderationResult.isClean) {
                const errorMessage = formatModerationError(moderationResult.violations);
                setModerationError(errorMessage);
                Alert.alert(
                    t('Content Moderation'),
                    t('Your content contains inappropriate words. Please remove them and try again.\n\n') + errorMessage,
                    [{ text: t('OK') }]
                );
                setIsUploading(false);
                return;
            }

            // Separate new images from existing ones
            const newImages = selectedImages.filter(img => !img.isExisting);
            const existingImages = selectedImages.filter(img => img.isExisting).map(img => img.originalPath);

            let uploadedImageUrls = [];

            // Upload new images if any
            if (newImages.length > 0) {
                const uploadResponse = await uploadImages(newImages);
                uploadedImageUrls = uploadResponse.data.images;
            }

            // Combine existing and new image URLs
            const finalImageUrls = [...existingImages, ...uploadedImageUrls];

            // Navigate to next screen with uploaded image URLs
            navigation.navigate('ChooseFilters', {
                title,
                description,
                displayTime,
                images: finalImageUrls,
                referralCode,
                // Edit mode params
                isEdit: true,
                adId: adData.id,
                // Pass existing attributes to pre-fill filters
                category_id: adData.category_id,
                subcategory_id: adData.subcategory_id,
                activity_id: adData.activity_id,
                condition_id: adData.condition_id,
                quality: adData.quality || null,
                price: adData.price ? adData.price.toString() : '',
                gender_id: adData.gender_id,
                // Additional attributes for next screens
                age_id: adData.age_id,
                size_id: adData.size_id,
                color_id: adData.color_id,
                size_type: adData.size_type, // Assuming this is saved, otherwise might need logic
                dim_length: adData.dim_length,
                dim_width: adData.dim_width,
                dim_height: adData.dim_height,
                dim_unit: adData.dim_unit,
            });
        } catch (error) {
            console.error('Error:', error);

            // Check if it's a moderation error
            if (error.response && error.response.data && error.response.data.message) {
                setModerationError(error.response.data.message);
                Alert.alert(t('Error'), error.response.data.message);
            } else {
                setUploadError(error.message || 'Failed to process your request. Please try again.');
                Alert.alert(t('Error'), error.message || t('Failed to process your request. Please try again.'));
            }
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <SafeScreenContainer>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backButton}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('Edit Ad')}</Text>
                </View>

                {/* Choose Images Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('Images:')}</Text>
                    <Text style={styles.uploadText}>{t('Add max 3 x images with max picture size 300 kb')}</Text>

                    {/* Image Selection Buttons */}
                    <View style={styles.selectionButtons}>
                        <TouchableOpacity style={styles.selectionButton} onPress={pickFromCamera}>
                            <Text style={styles.selectionButtonText}>{t('📷 Camera')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.selectionButton} onPress={pickFromGallery}>
                            <Text style={styles.selectionButtonText}>{t('🖼️ Gallery')}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Selected Images Grid */}
                    <View style={styles.imageGrid}>
                        {selectedImages.map((image, index) => (
                            <View key={index} style={styles.imageContainer}>
                                <Image source={{ uri: image.uri }} style={styles.selectedImage} />
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => removeImage(index)}
                                >
                                    <Text style={styles.removeButtonText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))}

                        {/* Empty slots */}
                        {Array.from({ length: 3 - selectedImages.length }).map((_, index) => (
                            <View key={`empty-${index}`} style={styles.emptySlot}>
                                <Text style={styles.emptySlotText}>+</Text>
                            </View>
                        ))}
                    </View>

                    {/* Upload Error */}
                    {uploadError ? (
                        <Text style={styles.errorText}>{uploadError}</Text>
                    ) : null}
                </View>

                {/* Title and Description Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('Title and description:')}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={t('Ad title')}
                        placeholderTextColor="#303234"
                        value={title}
                        onChangeText={setTitle}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder={t('Description')}
                        placeholderTextColor="#303234"
                        value={description}
                        onChangeText={setDescription}
                    />
                    <Text style={styles.charLimit}>{t('Enter description max 300 words')}</Text>

                    {/* Moderation Error */}
                    {moderationError ? (
                        <Text style={styles.errorText}>{moderationError}</Text>
                    ) : null}
                </View>

                {/* Referral Code (Disabled in Edit Mode usually, or optional) */}
                {/* Skipping for Edit Mode or keeping as read-only if needed */}

                {/* Display Time Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('Display time:')}</Text>
                    <View style={styles.displayTimeButtons}>
                        <TouchableOpacity
                            style={[
                                styles.timeButton,
                                displayTime === '60days' && styles.timeButtonActive,
                            ]}
                            onPress={() => setDisplayTime('60days')}
                        >
                            <Text
                                style={[
                                    styles.timeButtonText,
                                    displayTime === '60days' && styles.timeButtonTextActive,
                                ]}
                            >{t('60 days')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.timeButton,
                                displayTime === 'continuous' && styles.timeButtonActive,
                            ]}
                            onPress={() => setDisplayTime('continuous')}
                        >
                            <Text
                                style={[
                                    styles.timeButtonText,
                                    displayTime === 'continuous' && styles.timeButtonTextActive,
                                ]}
                            >{t('Continuous')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Continue Button */}
                <TouchableOpacity
                    style={[styles.continueButton, isUploading && styles.continueButtonDisabled]}
                    onPress={handleContinue}
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#FFFFFF" />
                            <Text style={styles.continueButtonText}>{t('Processing...')}</Text>
                        </View>
                    ) : (
                        <Text style={styles.continueButtonText}>{t('Continue')}</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.bottomSpace} />
            </ScrollView>
        </SafeScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
        justifyContent: 'space-between',
    },
    backButton: {
        fontSize: 28,
        color: '#000',
        fontWeight: '300',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        flex: 1,
        marginLeft: 16,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
        marginBottom: 12,
    },
    uploadText: {
        fontSize: 13,
        color: '#505050',
        marginBottom: 8,
    },
    selectionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    selectionButton: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    selectionButtonText: {
        fontSize: 14,
        color: '#000',
        fontWeight: '500',
    },
    imageGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    imageContainer: {
        width: '31%',
        aspectRatio: 1,
        position: 'relative',
    },
    selectedImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    removeButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#FF4444',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    emptySlot: {
        width: '31%',
        aspectRatio: 1,
        backgroundColor: '#F9F9F9',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptySlotText: {
        fontSize: 24,
        color: '#CCCCCC',
    },
    errorText: {
        color: '#FF4444',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#000',
        marginBottom: 12,
    },
    charLimit: {
        fontSize: 12,
        color: '#303234',
        marginTop: 4,
    },
    displayTimeButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    timeButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 6,
    },
    timeButtonActive: {
        backgroundColor: COLORS.primary,
    },
    timeButtonText: {
        fontSize: 15,
        color: '#505050',
        fontWeight: '500',
    },
    timeButtonTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    continueButton: {
        backgroundColor: COLORS.primary,
        marginHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 28,
        alignItems: 'center',
        marginTop: 8,
    },
    continueButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    continueButtonDisabled: {
        opacity: 0.6,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomSpace: {
        height: 30,
    },
});

export default EditAnAdScreen;
