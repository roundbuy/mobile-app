import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { kycService } from '../../../services';
import { COLORS } from '../../../constants/theme';
import GlobalHeader from '../../../components/GlobalHeader';

const { width } = Dimensions.get('window');

const KYCVerificationScreen = ({ route, navigation }) => {
  const { type: initialType = 'kyc' } = route.params || {};

  // Status & Fetching states
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [kycRecord, setKycRecord] = useState(null);

  // Form states
  const [step, setStep] = useState(1); // 1: Setup, 2: Upload
  const [countryCode, setCountryCode] = useState('GB');
  const [verificationType, setVerificationType] = useState(initialType); // 'kyc' or 'kyb'
  const [docTypes, setDocTypes] = useState([]);
  const [selectedDocType, setSelectedDocType] = useState('national_id');

  // Business fields
  const [businessName, setBusinessName] = useState('');
  const [businessRegNumber, setBusinessRegNumber] = useState('');

  // Uploaded files states
  const [frontDoc, setFrontDoc] = useState(null);
  const [backDoc, setBackDoc] = useState(null);
  const [selfieDoc, setSelfieDoc] = useState(null);
  const [businessDoc, setBusinessDoc] = useState(null);

  useEffect(() => {
    checkKycStatus();
  }, []);

  const checkKycStatus = async () => {
    try {
      setLoading(true);
      const res = await kycService.getKycStatus();
      if (res?.success && res?.data) {
        setKycRecord(res.data);
      } else {
        setKycRecord({ status: 'unverified' });
      }
    } catch (err) {
      console.error('Error checking KYC status:', err);
      setKycRecord({ status: 'unverified' });
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentTypes = async () => {
    try {
      setLoading(true);
      const res = await kycService.getDocumentTypes(countryCode);
      if (res?.success && res?.data) {
        setDocTypes(res.data);
        if (res.data.length > 0) {
          setSelectedDocType(res.data[0].document_type || 'national_id');
        }
      } else {
        // Fallback default doc types
        setDocTypes([
          { id: '1', document_type: 'passport', name: 'Passport' },
          { id: '2', document_type: 'national_id', name: 'National ID Card' },
          { id: '3', document_type: 'drivers_license', name: 'Driving License' },
        ]);
      }
      setStep(2);
    } catch (err) {
      console.error('Error fetching document types:', err);
      // Fallback
      setDocTypes([
        { id: '1', document_type: 'passport', name: 'Passport' },
        { id: '2', document_type: 'national_id', name: 'National ID Card' },
        { id: '3', document_type: 'drivers_license', name: 'Driving License' },
      ]);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async (field) => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      const libraryResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.status !== 'granted' && libraryResult.status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera and photo library access is required to upload documents.');
        return;
      }

      Alert.alert(
        'Upload Document',
        'Choose a source',
        [
          {
            text: 'Camera',
            onPress: async () => {
              const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
              });
              if (!result.canceled && result.assets?.length > 0) {
                const img = result.assets[0];
                setFileState(field, img);
              }
            },
          },
          {
            text: 'Photo Library',
            onPress: async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
              });
              if (!result.canceled && result.assets?.length > 0) {
                const img = result.assets[0];
                setFileState(field, img);
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (e) {
      console.error('Image picking error:', e);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setBusinessDoc(result.assets[0]);
      }
    } catch (e) {
      console.error('Document picking error:', e);
    }
  };

  const setFileState = (field, img) => {
    if (field === 'front') setFrontDoc(img);
    if (field === 'back') setBackDoc(img);
    if (field === 'selfie') setSelfieDoc(img);
    if (field === 'business') setBusinessDoc(img);
  };

  const handleSubmit = async () => {
    const isKyb = verificationType === 'kyb';

    if (isKyb) {
      if (!businessName.trim() || !businessRegNumber.trim()) {
        Alert.alert('Missing Fields', 'Please fill in all business information.');
        return;
      }
      if (!businessDoc) {
        Alert.alert('Missing Upload', 'Please upload your business registration document.');
        return;
      }
    } else {
      if (!frontDoc) {
        Alert.alert('Missing Upload', 'Please upload at least the front side of your ID.');
        return;
      }
      if (!selfieDoc) {
        Alert.alert('Missing Upload', 'Please upload a verification selfie.');
        return;
      }
    }

    try {
      setSubmitLoading(true);
      const formData = new FormData();
      formData.append('country_code', countryCode.toUpperCase());
      formData.append('document_type', selectedDocType);

      if (isKyb) {
        formData.append('business_name', businessName);
        formData.append('business_reg_number', businessRegNumber);
        
        const fileUri = businessDoc.uri;
        const fileName = businessDoc.name || 'business_cert.pdf';
        const fileType = businessDoc.mimeType || 'application/pdf';
        formData.append('business_reg', {
          uri: fileUri,
          name: fileName,
          type: fileType,
        });
      } else {
        formData.append('front_document', {
          uri: frontDoc.uri,
          name: frontDoc.fileName || 'front.jpg',
          type: frontDoc.mimeType || 'image/jpeg',
        });
        if (backDoc) {
          formData.append('back_document', {
            uri: backDoc.uri,
            name: backDoc.fileName || 'back.jpg',
            type: backDoc.mimeType || 'image/jpeg',
          });
        }
        formData.append('selfie', {
          uri: selfieDoc.uri,
          name: selfieDoc.fileName || 'selfie.jpg',
          type: selfieDoc.mimeType || 'image/jpeg',
        });
      }

      console.log('Sending KYC Payload:', formData);
      const res = await kycService.submitKyc(formData);
      if (res?.success) {
        Alert.alert('Success', 'Your verification documents have been submitted successfully.', [
          { text: 'OK', onPress: () => checkKycStatus() }
        ]);
      } else {
        Alert.alert('Submission Failed', res?.message || 'Verification submit failed.');
      }
    } catch (err) {
      console.error('Submit kyc error:', err);
      Alert.alert('Error', 'Failed to submit verification. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReset = () => {
    setFrontDoc(null);
    setBackDoc(null);
    setSelfieDoc(null);
    setBusinessDoc(null);
    setBusinessName('');
    setBusinessRegNumber('');
    setKycRecord({ status: 'unverified' });
    setStep(1);
  };

  // Render Loading
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <GlobalHeader title="Verification Status" navigation={navigation} showBackButton />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Fetching verification status...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Case 1: Verification Pending
  if (kycRecord?.status === 'pending') {
    return (
      <SafeAreaView style={styles.container}>
        <GlobalHeader title="Verification Status" navigation={navigation} showBackButton />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.statusCard, styles.pendingCard]}>
            <Ionicons name="time-outline" size={80} color="#FF9500" />
            <Text style={styles.statusTitle}>Verification Pending</Text>
            <Text style={styles.statusDescription}>
              Our compliance agents are currently reviewing your documents. This process usually takes 24-48 business hours. We will notify you once completed.
            </Text>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: '#FF9500', width: '100%', marginTop: 24 }]}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Case 2: Verification Approved / Verified
  if (kycRecord?.status === 'approved' || kycRecord?.status === 'verified') {
    return (
      <SafeAreaView style={styles.container}>
        <GlobalHeader title="Verification Status" navigation={navigation} showBackButton />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.statusCard, styles.successCard]}>
            <Ionicons name="checkmark-circle-outline" size={80} color="#34C759" />
            <Text style={styles.statusTitle}>Identity Verified</Text>
            <Text style={styles.statusDescription}>
              Congratulations! Your identity verification has been approved. You now have full access to trading limits, payouts, and listings.
            </Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={16} color="#34C759" style={{ marginRight: 4 }} />
              <Text style={styles.verifiedBadgeText}>VERIFIED USER</Text>
            </View>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: '#34C759', width: '100%', marginTop: 24 }]}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryButtonText}>Back to Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Case 3: Verification Failed / Rejected
  if (kycRecord?.status === 'rejected' || kycRecord?.status === 'failed') {
    return (
      <SafeAreaView style={styles.container}>
        <GlobalHeader title="Verification Status" navigation={navigation} showBackButton />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.statusCard, styles.errorCard]}>
            <Ionicons name="close-circle-outline" size={80} color="#FF3B30" />
            <Text style={styles.statusTitle}>Verification Failed</Text>
            <Text style={styles.statusDescription}>
              Your identity verification documents were rejected by our compliance team.
            </Text>
            {kycRecord.rejection_reason && (
              <View style={styles.rejectionReasonBox}>
                <Text style={styles.rejectionReasonTitle}>Reason for rejection:</Text>
                <Text style={styles.rejectionReasonText}>{kycRecord.rejection_reason}</Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: '#FF3B30', width: '100%', marginTop: 24 }]}
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryButtonText}>Re-try Verification</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Case 4: Unverified -> Render Multi-step verification form
  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeader title="Identity Verification" navigation={navigation} showBackButton />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step Indicator */}
        <View style={styles.stepIndicatorRow}>
          <View style={[styles.stepDot, step >= 1 && styles.activeStepDot]}>
            <Text style={styles.stepDotText}>1</Text>
          </View>
          <View style={[styles.stepLine, step >= 2 && styles.activeStepLine]} />
          <View style={[styles.stepDot, step >= 2 && styles.activeStepDot]}>
            <Text style={styles.stepDotText}>2</Text>
          </View>
        </View>

        {step === 1 ? (
          // STEP 1: SETUP COUNTRY & TYPE
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Verification Setup</Text>
            <Text style={styles.sectionSub}>Please select your country of residence and the type of account you want to verify.</Text>

            {/* Country Input */}
            <Text style={styles.fieldLabel}>Country (2-Letter Code)</Text>
            <TextInput
              style={styles.inputField}
              value={countryCode}
              onChangeText={(text) => setCountryCode(text.toUpperCase().substring(0, 2))}
              placeholder="e.g. IN, GB, US"
              autoCapitalize="characters"
            />

            {/* Verification Type Select */}
            <Text style={styles.fieldLabel}>Verification Type</Text>
            <View style={styles.typeSelectorRow}>
              <TouchableOpacity
                style={[styles.typeButton, verificationType === 'kyc' && styles.activeTypeButton]}
                onPress={() => setVerificationType('kyc')}
                activeOpacity={0.8}
              >
                <Ionicons name="person-outline" size={24} color={verificationType === 'kyc' ? '#FFF' : '#303030'} />
                <Text style={[styles.typeButtonText, verificationType === 'kyc' && styles.activeTypeButtonText]}>Personal KYC</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, verificationType === 'kyb' && styles.activeTypeButton]}
                onPress={() => setVerificationType('kyb')}
                activeOpacity={0.8}
              >
                <Ionicons name="business-outline" size={24} color={verificationType === 'kyb' ? '#FFF' : '#303030'} />
                <Text style={[styles.typeButtonText, verificationType === 'kyb' && styles.activeTypeButtonText]}>Business KYB</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, { marginTop: 32 }]}
              onPress={loadDocumentTypes}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        ) : (
          // STEP 2: UPLOADS
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Upload Documents</Text>
            <Text style={styles.sectionSub}>Please upload the required verification files. Images must be clear with legible text.</Text>

            {verificationType === 'kyc' ? (
              // KYC Upload Form
              <View>
                <Text style={styles.fieldLabel}>Select Document Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.docTypesScroll}>
                  {docTypes.map((doc) => (
                    <TouchableOpacity
                      key={doc.id}
                      style={[
                        styles.docTypeChip,
                        selectedDocType === doc.document_type && styles.activeDocTypeChip
                      ]}
                      onPress={() => setSelectedDocType(doc.document_type)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.docTypeChipText,
                        selectedDocType === doc.document_type && styles.activeDocTypeChipText
                      ]}>
                        {doc.name || doc.document_type?.toUpperCase().replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Upload Fields */}
                <Text style={styles.fieldLabel}>ID Front Photo</Text>
                <TouchableOpacity
                  style={[styles.uploadBox, frontDoc && styles.uploadedBox]}
                  onPress={() => handlePickImage('front')}
                  activeOpacity={0.8}
                >
                  {frontDoc ? (
                    <Image source={{ uri: frontDoc.uri }} style={styles.previewImage} />
                  ) : (
                    <View style={styles.uploadBoxContent}>
                      <Ionicons name="camera-outline" size={32} color="#808080" />
                      <Text style={styles.uploadBoxText}>Take Photo or Upload Front</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <Text style={styles.fieldLabel}>ID Back Photo (Optional)</Text>
                <TouchableOpacity
                  style={[styles.uploadBox, backDoc && styles.uploadedBox]}
                  onPress={() => handlePickImage('back')}
                  activeOpacity={0.8}
                >
                  {backDoc ? (
                    <Image source={{ uri: backDoc.uri }} style={styles.previewImage} />
                  ) : (
                    <View style={styles.uploadBoxContent}>
                      <Ionicons name="camera-outline" size={32} color="#808080" />
                      <Text style={styles.uploadBoxText}>Take Photo or Upload Back</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <Text style={styles.fieldLabel}>Verification Selfie</Text>
                <Text style={styles.uploadHelpText}>Hold your document next to your face and take a portrait selfie.</Text>
                <TouchableOpacity
                  style={[styles.uploadBox, selfieDoc && styles.uploadedBox]}
                  onPress={() => handlePickImage('selfie')}
                  activeOpacity={0.8}
                >
                  {selfieDoc ? (
                    <Image source={{ uri: selfieDoc.uri }} style={styles.previewImage} />
                  ) : (
                    <View style={styles.uploadBoxContent}>
                      <Ionicons name="person-add-outline" size={32} color="#808080" />
                      <Text style={styles.uploadBoxText}>Take Selfie</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              // KYB Upload Form
              <View>
                <Text style={styles.fieldLabel}>Business Legal Name</Text>
                <TextInput
                  style={styles.inputField}
                  value={businessName}
                  onChangeText={setBusinessName}
                  placeholder="e.g. Acme Corp Ltd"
                />

                <Text style={styles.fieldLabel}>Business Registration Number</Text>
                <TextInput
                  style={styles.inputField}
                  value={businessRegNumber}
                  onChangeText={setBusinessRegNumber}
                  placeholder="e.g. 12345678"
                />

                <Text style={styles.fieldLabel}>Business Reg Certificate Document</Text>
                <Text style={styles.uploadHelpText}>Upload your certificate of incorporation (PDF, JPG, PNG)</Text>
                <TouchableOpacity
                  style={[styles.uploadBox, businessDoc && styles.uploadedBox]}
                  onPress={handlePickDocument}
                  activeOpacity={0.8}
                >
                  {businessDoc ? (
                    <View style={styles.uploadedDocumentView}>
                      <Ionicons name="document-text" size={36} color={COLORS.primary} />
                      <Text style={styles.uploadedDocName} numberOfLines={1}>
                        {businessDoc.name || 'document_uploaded.pdf'}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.uploadBoxContent}>
                      <Ionicons name="cloud-upload-outline" size={32} color="#808080" />
                      <Text style={styles.uploadBoxText}>Select Certificate File</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Buttons */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setStep(1)}
                disabled={submitLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, { flex: 1.5 }]}
                onPress={handleSubmit}
                disabled={submitLoading}
                activeOpacity={0.7}
              >
                {submitLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Submit Verification</Text>
                    <Ionicons name="shield-checkmark-outline" size={18} color="#FFF" style={{ marginLeft: 6 }} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 14,
    color: '#606060',
    marginTop: 12,
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  statusCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 40,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  pendingCard: {
    backgroundColor: '#FFF9F0',
    borderColor: '#FFE0B2',
  },
  successCard: {
    backgroundColor: '#F4FBF7',
    borderColor: '#C6F0D6',
  },
  errorCard: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FFD1D1',
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    color: '#404040',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8EE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 20,
  },
  verifiedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34C759',
  },
  rejectionReasonBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginTop: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#FFC1C1',
  },
  rejectionReasonTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D32F2F',
    marginBottom: 4,
  },
  rejectionReasonText: {
    fontSize: 13,
    color: '#606060',
    lineHeight: 18,
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F0F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStepDot: {
    backgroundColor: '#000000',
  },
  stepDotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#808080',
  },
  stepLine: {
    width: 60,
    height: 3,
    backgroundColor: '#F0F0F7',
  },
  activeStepLine: {
    backgroundColor: '#000000',
  },
  formContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -0.5,
  },
  sectionSub: {
    fontSize: 14,
    color: '#606060',
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#303030',
    marginBottom: 8,
    marginTop: 16,
  },
  inputField: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D0D0D8',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#000',
    backgroundColor: '#FCFCFD',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderWidth: 1,
    borderColor: '#D0D0D8',
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: '#FCFCFD',
  },
  activeTypeButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#303030',
    marginLeft: 6,
  },
  activeTypeButtonText: {
    color: '#FFFFFF',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    backgroundColor: '#000000',
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: '#D0D0D8',
    borderRadius: 12,
    marginRight: 12,
  },
  secondaryButtonText: {
    color: '#303030',
    fontSize: 15,
    fontWeight: '700',
  },
  docTypesScroll: {
    marginBottom: 16,
  },
  docTypeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D0D0D8',
    marginRight: 8,
    backgroundColor: '#FCFCFD',
  },
  activeDocTypeChip: {
    backgroundColor: '#E8E8FF',
    borderColor: COLORS.primary,
  },
  docTypeChipText: {
    fontSize: 12,
    color: '#606060',
    fontWeight: '600',
  },
  activeDocTypeChipText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  uploadBox: {
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C0C0C8',
    borderStyle: 'dashed',
    backgroundColor: '#FCFCFD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  uploadedBox: {
    borderStyle: 'solid',
    borderColor: '#D0D0D8',
  },
  uploadBoxContent: {
    alignItems: 'center',
  },
  uploadBoxText: {
    fontSize: 12,
    color: '#808080',
    fontWeight: '600',
    marginTop: 6,
  },
  uploadHelpText: {
    fontSize: 11,
    color: '#808080',
    marginBottom: 8,
    lineHeight: 14,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadedDocumentView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  uploadedDocName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#303030',
    marginLeft: 12,
    flex: 1,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    marginTop: 32,
    marginBottom: 40,
  },
});

export default KYCVerificationScreen;
