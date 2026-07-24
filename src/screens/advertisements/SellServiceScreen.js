import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';
import { uploadImages } from '../../services/advertisementService';
import { checkMultipleFields, formatModerationError } from '../../services/moderationService';
import { advertisementService, userService } from '../../services';
import { useTranslation } from '../../context/TranslationContext';
import LocationSelectionModal from '../../components/LocationSelectionModal';

const SellServiceScreen = ({ navigation }) => {
  const { t } = useTranslation();

  const [companyImage, setCompanyImage] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [subcategoryId, setSubcategoryId] = useState(null);

  // Loaded metadata
  const [subcategories, setSubcategories] = useState([]);
  const [userLocations, setUserLocations] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [moderationError, setModerationError] = useState('');
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    loadServiceMetadata();
  }, []);

  const loadServiceMetadata = async () => {
    try {
      setInitialLoading(true);
      // Fetch filters to get Services (Category ID 6) and its subcategories
      const filterRes = await advertisementService.getFilters();
      if (filterRes.success) {
        // Services category is usually ID 6 or slug 'services'
        const servicesCategory = (filterRes.data.categories || []).find(
          c => c.slug === 'services' || parseInt(c.id) === 6
        );
        if (servicesCategory && servicesCategory.subcategories) {
          setSubcategories(servicesCategory.subcategories);
          if (servicesCategory.subcategories.length > 0) {
            setSubcategoryId(servicesCategory.subcategories[0].id);
          }
        }
      }

      // Fetch user locations
      const locRes = await advertisementService.getUserLocations();
      if (locRes.success) {
        const locations = locRes.data.locations || [];
        setUserLocations(locations);
        const defaultLoc = locations.find(l => l.is_default);
        if (defaultLoc) {
          setSelectedLocations([defaultLoc.id]);
        } else if (locations.length > 0) {
          setSelectedLocations([locations[0].id]);
        }
      }
    } catch (e) {
      console.log('Error loading metadata for SellServiceScreen:', e);
    } finally {
      setInitialLoading(false);
    }
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        t('Permissions Required'),
        t('Camera and media library permissions are required to select your company image.'),
        [{ text: t('OK') }]
      );
      return false;
    }
    return true;
  };

  const pickImage = async (fromCamera = false) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      };

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setCompanyImage(asset);
        setUploadError('');
      }
    } catch (error) {
      if (fromCamera && error?.message?.includes('Camera not available')) {
        Alert.alert(t('Camera Unavailable'), t('Camera is not available on simulator. Please pick an image from Gallery instead.'));
      } else {
        console.warn('Image picking error:', error);
        Alert.alert(t('Error'), t('Failed to select image. Please try again.'));
      }
    }
  };

  const handlePublish = async () => {
    if (!companyImage) {
      Alert.alert(t('Error'), t('Please select a company image or logo.'));
      return;
    }
    if (!companyName.trim()) {
      Alert.alert(t('Error'), t('Please enter your company/service name.'));
      return;
    }
    if (!description.trim()) {
      Alert.alert(t('Error'), t('Please enter a description of your service.'));
      return;
    }
    if (!price.trim()) {
      Alert.alert(t('Error'), t('Please enter a starting price.'));
      return;
    }
    if (selectedLocations.length === 0) {
      Alert.alert(t('Error'), t('Please select at least one location.'));
      return;
    }

    setLoading(true);
    setModerationError('');
    setUploadError('');

    try {
      // 1. Run Content Moderation Check
      const moderationResult = await checkMultipleFields({
        title: companyName.trim(),
        description: description.trim()
      });

      if (!moderationResult.isClean) {
        const errMsg = formatModerationError(moderationResult.violations);
        setModerationError(errMsg);
        Alert.alert(
          t('Content Moderation'),
          t('Your text contains inappropriate language. Please review and try again:\n\n') + errMsg,
          [{ text: t('OK') }]
        );
        setLoading(false);
        return;
      }

      // 2. Upload Company Image
      const uploadRes = await uploadImages([companyImage]);
      if (!uploadRes.success || !uploadRes.data?.images || uploadRes.data.images.length === 0) {
        throw new Error('Image upload failed');
      }
      const imageUrls = uploadRes.data.images;

      // 3. Create Advertisement (Services category = 6, activity_id = 4)
      const payload = {
        title: companyName.trim(),
        description: description.trim(),
        images: imageUrls,
        category_id: 6, // Services parent ID
        subcategory_id: subcategoryId,
        location_ids: selectedLocations,
        price: parseFloat(price),
        display_duration_days: null, // Services are continuous
        activity_id: 4, // Services activity ID
      };

      const publishRes = await advertisementService.createAdvertisement(payload);
      if (publishRes.success) {
        Alert.alert(
          t('Success'),
          t('Your service listing has been successfully published!'),
          [
            {
              text: t('OK'),
              onPress: () => {
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert(t('Error'), publishRes.message || t('Failed to publish service.'));
      }
    } catch (err) {
      console.error('Publish service error:', err);
      Alert.alert(t('Error'), err.message || t('An error occurred while publishing your service.'));
    } finally {
      setLoading(false);
    }
  };

  const getSelectedLocationName = () => {
    if (selectedLocations.length === 0) return t('No location selected');
    const matched = userLocations.find(l => l.id === selectedLocations[0]);
    return matched ? `${matched.name}, ${matched.city}` : t('Location selected');
  };

  if (initialLoading) {
    return (
      <SafeScreenContainer>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('Loading service options...')}</Text>
        </View>
      </SafeScreenContainer>
    );
  }

  return (
    <SafeScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('List a Service')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Company Image Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Company Image / Logo *')}</Text>
          <Text style={styles.subtext}>{t('Add 1 main image or company logo (max 300KB)')}</Text>

          {companyImage ? (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: companyImage.uri }} style={styles.previewImage} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => setCompanyImage(null)}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadOptions}>
              <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage(false)}>
                <Ionicons name="images-outline" size={32} color={COLORS.primary} />
                <Text style={styles.uploadBoxText}>{t('Gallery')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage(true)}>
                <Ionicons name="camera-outline" size={32} color={COLORS.primary} />
                <Text style={styles.uploadBoxText}>{t('Camera')}</Text>
              </TouchableOpacity>
            </View>
          )}
          {uploadError ? <Text style={styles.errorText}>{uploadError}</Text> : null}
        </View>

        {/* Company Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Company / Provider Name *')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('Enter company or provider name')}
            placeholderTextColor="#888"
            value={companyName}
            onChangeText={setCompanyName}
          />
        </View>

        {/* Starting Price */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Starting Price (£) *')}</Text>
          <View style={styles.priceInputWrapper}>
            <Text style={styles.currencyPrefix}>£</Text>
            <TextInput
              style={styles.priceInput}
              placeholder={t('0.00')}
              placeholderTextColor="#888"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Service Category */}
        {subcategories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Service Category *')}</Text>
            <View style={styles.categoryGrid}>
              {subcategories.map((sub) => (
                <TouchableOpacity
                  key={sub.id}
                  style={[
                    styles.categoryChip,
                    subcategoryId === sub.id && styles.categoryChipActive
                  ]}
                  onPress={() => setSubcategoryId(sub.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      subcategoryId === sub.id && styles.categoryChipTextActive
                    ]}
                  >
                    {sub.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Location Display */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Service Coverage Location *')}</Text>
          <TouchableOpacity
            style={styles.locationSelector}
            onPress={() => setShowLocationModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="location" size={20} color={COLORS.primary} />
            <Text style={styles.locationText}>{getSelectedLocationName()}</Text>
            <Ionicons name="chevron-forward" size={16} color="#aaa" />
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Description of the Service *')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t('Explain the details of what is offered, duration, specifications, etc.')}
            placeholderTextColor="#888"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          <Text style={styles.charLimit}>{t('Max 300 words')}</Text>
          {moderationError ? <Text style={styles.errorText}>{moderationError}</Text> : null}
        </View>

        {/* Publish Button */}
        <TouchableOpacity
          style={[styles.publishBtn, loading && styles.publishBtnDisabled]}
          onPress={handlePublish}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.publishBtnText}>{t('Publish Service')}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Location Modal */}
      <LocationSelectionModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        locations={userLocations}
        selectedLocations={selectedLocations}
        onSelectLocations={setSelectedLocations}
      />
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  headerRight: { width: 32 },

  scroll: { padding: 20, gap: 20 },

  section: { gap: 8 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtext: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },

  imageWrapper: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f5f5f5',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  uploadOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadBox: {
    flex: 1,
    height: 90,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fafafa',
  },
  uploadBoxText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },

  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#000',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charLimit: {
    fontSize: 11,
    color: '#aaa',
    alignSelf: 'flex-end',
  },

  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginRight: 6,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#000',
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  categoryChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EEF2FF',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  publishBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  publishBtnDisabled: {
    opacity: 0.6,
  },
  publishBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 13,
    marginTop: 4,
  },
  bottomSpacer: { height: 40 },
});

const stylesMock = styles;

export default SellServiceScreen;
