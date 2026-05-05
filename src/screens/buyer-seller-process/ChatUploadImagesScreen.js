import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    FlatList,
    Image,
    Alert,
    Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';
import { getFullImageUrl } from '../../utils/imageUtils';
import { getMyAdvertisement, updateAdvertisement, uploadImages } from '../../services/advertisementService';
import { messagingService } from '../../services';

const ChatUploadImagesScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { advertisementId, conversationId } = route.params;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [advertisement, setAdvertisement] = useState(null);
    const [images, setImages] = useState([]);

    useEffect(() => {
        loadAdvertisement();
    }, [advertisementId]);

    const loadAdvertisement = async () => {
        try {
            setLoading(true);
            const res = await getMyAdvertisement(advertisementId);
            if (res.data && res.data.advertisement) {
                setAdvertisement(res.data.advertisement);
                let parsedImages = [];
                try {
                    if (typeof res.data.advertisement.images === 'string') {
                        parsedImages = JSON.parse(res.data.advertisement.images);
                    } else if (Array.isArray(res.data.advertisement.images)) {
                        parsedImages = res.data.advertisement.images;
                    }
                } catch (e) { console.log(e); }
                setImages(parsedImages || []);
            }
        } catch (error) {
            console.error('Failed to load advertisement:', error);
            Alert.alert(t('Error'), t('Could not load product details.'));
        } finally {
            setLoading(false);
        }
    };

    const handleSelectImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('Permissions Required'), t('Media library permissions are required to select images.'));
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const image = result.assets[0];
                setSaving(true);

                // 1. Upload the image to our server to get the URL
                const uploadResponse = await uploadImages([image]);
                if (uploadResponse.success && uploadResponse.data?.images?.length > 0) {
                    const newImageUrl = uploadResponse.data.images[0];
                    const updatedImages = [...images, newImageUrl];

                    // 2. Update the advertisement with the new list of images
                    await updateAdvertisement(advertisementId, { images: updatedImages });

                    // 3. Update local state
                    setImages(updatedImages);
                    Alert.alert(t('Success'), t('Image added to product gallery!'));
                } else {
                    throw new Error('Upload failed');
                }
            }
        } catch (error) {
            console.error('Image upload error:', error);
            Alert.alert(t('Upload Failed'), t('Could not upload the image.'));
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveImage = async (indexToRemove) => {
        Alert.alert(
            t('Remove Image'),
            t('Are you sure you want to remove this image?'),
            [
                { text: t('Cancel'), style: 'cancel' },
                {
                    text: t('Remove'),
                    style: 'destructive',
                    onPress: async () => {
                        setSaving(true);
                        try {
                            const updatedImages = images.filter((_, idx) => idx !== indexToRemove);
                            await updateAdvertisement(advertisementId, { images: updatedImages });
                            setImages(updatedImages);
                        } catch (error) {
                            console.error('Failed to remove image:', error);
                            Alert.alert(t('Error'), t('Could not remove the image.'));
                        } finally {
                            setSaving(false);
                        }
                    }
                }
            ]
        );
    };

    const sendToBuyer = async () => {
        setSaving(true);
        try {
            let activeConvId = conversationId;

            if (!activeConvId) {
                const messageResponse = await messagingService.sendMessage({
                    advertisement_id: advertisementId,
                    message: '[PRODUCT_IMAGES_UPDATE]'
                });
                if (messageResponse.data && messageResponse.data.success) {
                    activeConvId = messageResponse.data.conversation_id;
                }
            } else {
                await messagingService.sendMessage({
                    conversation_id: activeConvId,
                    advertisement_id: advertisementId,
                    message: '[PRODUCT_IMAGES_UPDATE]'
                });
            }

            navigation.goBack();
        } catch (error) {
            console.error('Failed to send notification:', error);
            Alert.alert(t('Error'), t('Could not send notification to buyer.'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Product Images')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <Text style={styles.description}>
                    {t('Upload additional images so the buyer can inspect the item. These images will be added to your product listing.')}
                </Text>

                <FlatList
                    data={images}
                    keyExtractor={(item, index) => index.toString()}
                    numColumns={3}
                    contentContainerStyle={styles.galleryContainer}
                    renderItem={({ item, index }) => (
                        <View style={styles.imageWrapper}>
                            <Image source={{ uri: getFullImageUrl(item) }} style={styles.thumbnail} />
                            {saving ? null : (
                                <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveImage(index)}>
                                    <Ionicons name="close-circle" size={24} color={COLORS.danger} />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                    ListFooterComponent={() => (
                        <TouchableOpacity
                            style={[styles.addImageButton, saving && { opacity: 0.5 }]}
                            onPress={handleSelectImage}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color={COLORS.primary} />
                            ) : (
                                <>
                                    <Ionicons name="camera-outline" size={32} color={COLORS.primary} />
                                    <Text style={styles.addImageText}>{t('Add Image')}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                />
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.sendButton, saving && { opacity: 0.7 }]}
                    onPress={sendToBuyer}
                    disabled={saving}
                >
                    <Text style={styles.sendButtonText}>{t('Send link to Buyer')}</Text>
                    <Ionicons name="send" size={18} color={COLORS.white} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    backButton: {
        padding: 5,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        lineHeight: 20,
    },
    galleryContainer: {
        paddingBottom: 20,
    },
    imageWrapper: {
        flex: 1,
        aspectRatio: 1,
        margin: 5,
        position: 'relative',
        borderRadius: 8,
        overflow: 'hidden',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    removeButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 12,
    },
    addImageButton: {
        flex: 1,
        aspectRatio: 1,
        margin: 5,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(84, 114, 211, 0.05)',
    },
    addImageText: {
        marginTop: 8,
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        backgroundColor: COLORS.white,
    },
    sendButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default ChatUploadImagesScreen;
