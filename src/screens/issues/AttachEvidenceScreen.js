import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS } from '../../constants/theme';
import disputeService from '../../services/disputeService';

const AttachEvidenceScreen = ({ navigation, route }) => {
    const { issueId, issueNumber, userRole } = route.params || {}; // userRole: 'buyer' or 'seller'

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant camera roll permissions');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
                maxFiles: 5,
            });

            if (!result.canceled && result.assets) {
                const newFiles = result.assets.map(asset => ({
                    uri: asset.uri,
                    type: 'image',
                    name: asset.fileName || `image_${Date.now()}.jpg`,
                    size: asset.fileSize,
                }));
                setSelectedFiles([...selectedFiles, ...newFiles]);
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                multiple: true,
            });

            if (result.type === 'success') {
                const newFile = {
                    uri: result.uri,
                    type: result.mimeType?.includes('pdf') ? 'pdf' : 'image',
                    name: result.name,
                    size: result.size,
                };
                setSelectedFiles([...selectedFiles, newFile]);
            }
        } catch (error) {
            console.error('Document picker error:', error);
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const removeFile = (index) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            Alert.alert('No Files', 'Please select at least one file to upload');
            return;
        }

        setUploading(true);

        try {
            // Upload each file
            for (const file of selectedFiles) {
                await disputeService.uploadIssueEvidence(issueId, file);
            }

            Alert.alert(
                'Success',
                'Evidence uploaded successfully',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Failed to upload evidence. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.headerBackButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Attach Evidence</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.content}>
                {/* Handshake Icon */}
                <View style={styles.iconContainer}>
                    <FontAwesome name="file-text-o" size={60} color="#666" />
                </View>

                {/* Info Message */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Issue #{issueNumber}</Text>
                    <Text style={styles.infoSubtitle}>
                        {userRole === 'buyer'
                            ? 'Upload evidence to support your issue'
                            : 'Upload evidence to support your response'}
                    </Text>
                </View>

                {/* Upload Buttons */}
                <View style={styles.uploadSection}>
                    <Text style={styles.sectionTitle}>SELECT FILES</Text>

                    <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={pickImage}
                    >
                        <Ionicons name="image-outline" size={24} color={COLORS.primary} />
                        <Text style={styles.uploadButtonText}>Choose from Gallery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={pickDocument}
                    >
                        <Ionicons name="document-outline" size={24} color={COLORS.primary} />
                        <Text style={styles.uploadButtonText}>Choose PDF Document</Text>
                    </TouchableOpacity>

                    <Text style={styles.uploadHint}>
                        • Maximum file size: 3MB{'\n'}
                        • Accepted formats: JPG, PNG, PDF{'\n'}
                        • You can upload up to 5 files
                    </Text>
                </View>

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                    <View style={styles.filesSection}>
                        <Text style={styles.sectionTitle}>
                            SELECTED FILES ({selectedFiles.length})
                        </Text>
                        {selectedFiles.map((file, index) => (
                            <View key={index} style={styles.fileCard}>
                                <View style={styles.fileInfo}>
                                    {file.type === 'image' ? (
                                        <Image
                                            source={{ uri: file.uri }}
                                            style={styles.fileThumbnail}
                                        />
                                    ) : (
                                        <View style={styles.pdfIcon}>
                                            <Ionicons name="document-text" size={32} color="#DC143C" />
                                        </View>
                                    )}
                                    <View style={styles.fileDetails}>
                                        <Text style={styles.fileName} numberOfLines={1}>
                                            {file.name}
                                        </Text>
                                        <Text style={styles.fileSize}>
                                            {formatFileSize(file.size)}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={() => removeFile(index)}
                                    style={styles.removeButton}
                                >
                                    <Ionicons name="close-circle" size={24} color="#DC143C" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                {/* Info Link */}
                <View style={styles.infoLinkContainer}>
                    <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.infoLinkText}>
                        More information on Issues & Disputes, click here
                    </Text>
                </View>

                {/* Upload Button */}
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        (selectedFiles.length === 0 || uploading) && styles.submitButtonDisabled,
                    ]}
                    onPress={handleUpload}
                    disabled={selectedFiles.length === 0 || uploading}
                >
                    {uploading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.submitButtonText}>Upload Evidence</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerBackButton: {
        padding: 4,
        marginRight: 12,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    iconContainer: {
        alignItems: 'center',
        paddingVertical: 24,
        backgroundColor: '#FFF',
    },
    infoCard: {
        backgroundColor: '#FFF',
        padding: 16,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    infoSubtitle: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    uploadSection: {
        backgroundColor: '#FFF',
        padding: 16,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F8F8F8',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 12,
    },
    uploadButtonText: {
        fontSize: 15,
        color: '#333',
        marginLeft: 12,
        fontWeight: '500',
    },
    uploadHint: {
        fontSize: 12,
        color: '#999',
        lineHeight: 18,
        marginTop: 8,
    },
    filesSection: {
        backgroundColor: '#FFF',
        padding: 16,
        marginBottom: 8,
    },
    fileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#F8F8F8',
        borderRadius: 8,
        marginBottom: 8,
    },
    fileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    fileThumbnail: {
        width: 50,
        height: 50,
        borderRadius: 4,
        backgroundColor: '#E0E0E0',
    },
    pdfIcon: {
        width: 50,
        height: 50,
        borderRadius: 4,
        backgroundColor: '#FFE5E5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fileDetails: {
        flex: 1,
        marginLeft: 12,
    },
    fileName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
        marginBottom: 2,
    },
    fileSize: {
        fontSize: 12,
        color: '#999',
    },
    removeButton: {
        padding: 4,
    },
    infoLinkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#FFF',
        marginBottom: 8,
    },
    infoLinkText: {
        fontSize: 13,
        color: COLORS.primary,
        marginLeft: 6,
    },
    submitButton: {
        backgroundColor: '#999',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        margin: 16,
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

export default AttachEvidenceScreen;
