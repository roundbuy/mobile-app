import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../../constants/theme';
import { userService } from '../../../services';
import GlobalHeader from '../../../components/GlobalHeader';
import { useAuth } from '../../../context/AuthContext';

const PersonalInformationScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    billingAddress: '',
  });

  // Fetch user profile data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getUserProfile();

      if (response.success && response.data) {
        const userData = response.data;
        setFormData({
          name: userData.full_name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          billingAddress: userData.billing_address || '',
        });
        setProfileImage(userData.profile_image || null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load user information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload a profile picture.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadProfileImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadProfileImage = async (imageAsset) => {
    try {
      setIsUploadingImage(true);

      // Create form data
      const formData = new FormData();
      const filename = imageAsset.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('profile_image', {
        uri: imageAsset.uri,
        name: filename,
        type: type,
      });

      // Upload to backend
      const response = await userService.updateProfileImage(formData);

      if (response.success) {
        setProfileImage(response.data.profile_image);
        // Update AuthContext
        if (updateUser) {
          updateUser({ ...user, profile_image: response.data.profile_image });
        }
        Alert.alert('Success', 'Profile picture updated successfully!');
      } else {
        throw new Error(response.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', error.message || 'Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const updateData = {
        full_name: formData.name,
        phone: formData.phone,
        billing_address: formData.billingAddress,
      };

      const response = await userService.updateUserProfile(updateData);

      if (response.success) {
        Alert.alert('Success', 'Your information has been updated successfully.');
        setIsEditMode(false);
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update your information. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Global Header */}
      <GlobalHeader
        title={isEditMode ? 'Edit my personal information' : 'My personal information'}
        navigation={navigation}
        showBackButton={true}
        showIcons={true}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Image Section */}
        <View style={styles.profileImageSection}>
          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={handleImagePick}
            activeOpacity={0.7}
            disabled={isUploadingImage}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <FontAwesome name="user" size={40} color="#999" />
              </View>
            )}
            <View style={styles.cameraIconContainer}>
              {isUploadingImage ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="camera" size={18} color="#fff" />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.profileImageHint}>Tap to change profile picture</Text>
        </View>

        {/* Your Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={[styles.input, !isEditMode && styles.inputDisabled]}
            value={formData.name}
            onChangeText={(text) => updateField('name', text)}
            editable={isEditMode}
            placeholder="Enter your name"
            placeholderTextColor="#999"
          />
        </View>

        {/* Email Address */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={[styles.input, !isEditMode && styles.inputDisabled]}
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
            editable={isEditMode}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Phone Number */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Phone number</Text>
          <TextInput
            style={[styles.input, !isEditMode && styles.inputDisabled]}
            value={formData.phone}
            onChangeText={(text) => updateField('phone', text)}
            editable={isEditMode}
            placeholder="Enter your phone number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>

        {/* Billing Address */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Billing address</Text>
          <TextInput
            style={[styles.input, !isEditMode && styles.inputDisabled]}
            value={formData.billingAddress}
            onChangeText={(text) => updateField('billingAddress', text)}
            editable={isEditMode}
            placeholder="Enter your billing address"
            placeholderTextColor="#999"
            multiline
          />
        </View>

        {/* Info Note */}
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={20} color="#666" />
          <Text style={styles.infoText}>
            Please note! The billing address is only used for billing, and it is not shared at the service with other users, and it's neither centre-point nor product location address.
          </Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.actionButton, isEditMode && styles.saveButton]}
          onPress={isEditMode ? handleSave : handleEdit}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[styles.actionButtonText, isEditMode && styles.saveButtonText]}>
              {isEditMode ? 'Save changes' : 'Edit'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
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
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#000',
    minHeight: 48,
  },
  inputDisabled: {
    backgroundColor: '#f8f8f8',
    color: '#666',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginLeft: 8,
  },
  actionButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    color: '#fff',
  },
  bottomSpacer: {
    height: 40,
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 8,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileImageHint: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
});

export default PersonalInformationScreen;