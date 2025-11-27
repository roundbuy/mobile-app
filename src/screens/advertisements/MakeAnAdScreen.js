import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';

const MakeAnAdScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [displayTime, setDisplayTime] = useState('60days');
  const [images, setImages] = useState([]);

  const handleContinue = () => {
    navigation.navigate('ChooseFilters', {
      title,
      description,
      displayTime,
      images,
    });
  };

  return (
    <SafeScreenContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Make an Ad</Text>
          <Text style={styles.stepIndicator}>1/8</Text>
        </View>

        {/* Choose Images Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose images:</Text>
          <View style={styles.imageUploadArea}>
            <Text style={styles.uploadText}>Add max 3 x images with max picture size 300 kb</Text>
            <Text style={styles.uploadSubtext}>Drop files here</Text>
            <Text style={styles.uploadOr}>or</Text>
            <TouchableOpacity style={styles.selectFilesButton}>
              <Text style={styles.selectFilesText}>Select files</Text>
            </TouchableOpacity>
            <Text style={styles.allowedFiles}>Allowed file</Text>
            <Text style={styles.fileTypes}>
              types: .jpg, .jpe, .jpeg, gif, .png, .bmp, .ico, .webp, .avif, .svg
            </Text>
            <Text style={styles.dragText}>
              Please drag & drop the files to rearrange the order
            </Text>
          </View>

          {/* Image Slots */}
          <View style={styles.imageSlots}>
            <View style={styles.imageSlot}>
              <Text style={styles.trashIcon}>🗑️</Text>
            </View>
            <View style={styles.imageSlot}>
              <Text style={styles.trashIcon}>🗑️</Text>
            </View>
            <View style={styles.imageSlot}>
              <Text style={styles.trashIcon}>🗑️</Text>
            </View>
          </View>
        </View>

        {/* Title and Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose a title and description:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ad title"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
          />
          <Text style={styles.charLimit}>Enter description max 300 words</Text>
        </View>

        {/* Display Time Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose display time:</Text>
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
              >
                60 days
              </Text>
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
              >
                Continuous
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
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
  stepIndicator: {
    fontSize: 16,
    color: '#666',
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
  imageUploadArea: {
    backgroundColor: '#F9F9F9',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    marginBottom: 4,
  },
  uploadOr: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  selectFilesButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginBottom: 16,
  },
  selectFilesText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  allowedFiles: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  fileTypes: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginBottom: 12,
  },
  dragText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
  imageSlots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageSlot: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  trashIcon: {
    fontSize: 24,
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
    color: '#999',
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
    color: '#666',
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
  bottomSpace: {
    height: 30,
  },
});

export default MakeAnAdScreen;