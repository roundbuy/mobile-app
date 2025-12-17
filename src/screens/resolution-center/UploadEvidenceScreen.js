import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import disputeService from '../../services/disputeService';

const UploadEvidenceScreen = ({ navigation, route }) => {
  const { category, order, problem, formData } = route.params;
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    Alert.alert(
      'Feature Coming Soon',
      'Image upload functionality requires expo-image-picker package. You can proceed without uploading evidence for now.',
      [{ text: 'OK' }]
    );
  };

  const takePhoto = async () => {
    Alert.alert(
      'Feature Coming Soon',
      'Camera functionality requires expo-image-picker package. You can proceed without uploading evidence for now.',
      [{ text: 'OK' }]
    );
  };

  const pickDocument = async () => {
    Alert.alert(
      'Feature Coming Soon',
      'Document upload functionality requires expo-document-picker package. You can proceed without uploading evidence for now.',
      [{ text: 'OK' }]
    );
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    if (files.length === 0) {
      Alert.alert(
        'No Evidence',
        'Would you like to continue without uploading evidence? Adding evidence strengthens your case.',
        [
          { text: 'Go Back', style: 'cancel' },
          { 
            text: 'Continue Anyway', 
            onPress: () => proceedToReview(),
          },
        ]
      );
    } else {
      proceedToReview();
    }
  };

  const proceedToReview = () => {
    navigation.navigate('DisputeConfirmation', {
      category,
      order,
      problem,
      formData,
      files,
    });
  };

  return (
    <SafeScreenContainer>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Upload Evidence</Text>
          <Text style={styles.subtitle}>
            Add photos or documents to support your claim
          </Text>
        </View>

        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Add Evidence (Optional)</Text>
          
          <View style={styles.uploadButtons}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={takePhoto}
            >
              <Feather name="camera" size={32} color="#4169E1" />
              <Text style={styles.uploadButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={pickImage}
            >
              <Feather name="image" size={32} color="#4169E1" />
              <Text style={styles.uploadButtonText}>Choose Photos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={pickDocument}
            >
              <Feather name="file" size={32} color="#4169E1" />
              <Text style={styles.uploadButtonText}>Upload Document</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>
            Accepted: JPEG, PNG, PDF • Max 5 files • 10MB each
          </Text>
        </View>

        {files.length > 0 && (
          <View style={styles.filesSection}>
            <Text style={styles.sectionTitle}>
              Selected Files ({files.length})
            </Text>
            
            {files.map((file, index) => (
              <View key={index} style={styles.fileCard}>
                <View style={styles.fileIcon}>
                  <Feather
                    name={file.type === 'image' ? 'image' : 'file-text'}
                    size={40}
                    color="#4169E1"
                  />
                </View>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <Text style={styles.fileType}>
                    {file.type === 'image' ? 'Image' : 'Document'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeFile(index)}
                >
                  <Feather name="x" size={24} color="#FF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.infoCard}>
          <Feather name="info" size={20} color="#FFA500" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Note</Text>
            <Text style={styles.infoText}>
              File upload requires additional packages (expo-image-picker & expo-document-picker).{'\n\n'}
              You can proceed without evidence for now, or install the packages:{'\n'}
              • npm install expo-image-picker{'\n'}
              • npm install expo-document-picker
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={proceedToReview}
          >
            <Text style={styles.skipButtonText}>Skip for Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.continueButtonText}>Review & Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  uploadSection: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  uploadButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 12,
    color: '#4169E1',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  filesSection: {
    padding: 15,
    paddingTop: 0,
  },
  fileCard: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  fileImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  fileIcon: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  fileType: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  removeButton: {
    padding: 5,
  },
  infoCard: {
    backgroundColor: '#FFF',
    padding: 15,
    margin: 15,
    borderRadius: 12,
    flexDirection: 'row',
    borderLeftWidth: 4,
    borderLeftColor: '#4169E1',
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  buttonContainer: {
    padding: 15,
    paddingTop: 0,
  },
  skipButton: {
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 10,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#4169E1',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default UploadEvidenceScreen;