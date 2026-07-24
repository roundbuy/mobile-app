import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { kycService } from '../../services';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/TranslationContext';
import { IMAGES } from '../../assets/images';

const REQUIRED_DOCS = [
  {
    key: 'company_registration',
    label: 'Company Registration Certificate',
    hint: 'Certificate of Incorporation or equivalent',
  },
  {
    key: 'proof_of_address',
    label: 'Proof of Business Address',
    hint: 'Utility bill or bank statement (within 3 months)',
  },
  {
    key: 'director_id',
    label: "Director's ID or Passport",
    hint: 'Valid government-issued photo ID',
  },
];

const STEPS = ['Upload Docs', 'Review', 'Account Ready'];

const BusinessVerificationScreen = ({ navigation }) => {
  const { isAuthenticated, user, logout, refreshUser } = useAuth();
  const { t } = useTranslation();

  const [screenState, setScreenState] = useState('upload');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [reviewMessage, setReviewMessage] = useState('');

  // Guard: only fetch status once per mount to prevent loops caused by
  // refreshUser() triggering NavigationGuard which re-focuses this screen.
  const hasFetchedRef = useRef(false);
  const isNavigatingAwayRef = useRef(false);

  const fetchStatus = useCallback(async () => {
    if (!isAuthenticated) return;
    // Prevent re-fetching if we already fetched and are approved/navigating
    if (isNavigatingAwayRef.current) return;
    try {
      setLoading(true);
      const response = await kycService.getKycStatus();
      if (response?.success && response?.data) {
        const status = response.data.status;
        if (status === 'pending') {
          setScreenState('pending');
        } else if (status === 'approved') {
          // Mark as navigating to prevent loop on re-focus
          isNavigatingAwayRef.current = true;
          setScreenState('approved');
          // Refresh user data then navigate away so this screen won't be re-focused
          try {
            await refreshUser();
          } catch {
            // Even if refresh fails, we still navigate away
          }
          // Navigate away immediately — use reset so back-button can't return here
          navigation.reset({
            index: 0,
            routes: [{ name: 'SearchScreen' }],
          });
          return;
        } else if (status === 'rejected') {
          setScreenState('rejected');
          setReviewMessage(response.data.message || '');
        } else if (status === 'more_info') {
          setScreenState('more_info');
          setReviewMessage(response.data.message || '');
        } else {
          setScreenState('upload');
        }
      } else {
        setScreenState('upload');
      }
    } catch {
      setScreenState('upload');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, refreshUser, navigation]);

  useFocusEffect(
    useCallback(() => {
      // Only run fetchStatus once. On subsequent focus events (e.g. back navigation),
      // we skip to avoid the refresh-user → NavigationGuard → re-focus loop.
      if (!hasFetchedRef.current) {
        hasFetchedRef.current = true;
        fetchStatus();
      } else if (!isNavigatingAwayRef.current) {
        // Allow re-check on manual "Check status" button but not automatic refocus loops
        fetchStatus();
      }
    }, [fetchStatus])
  );

  const pickDocument = async (docKey) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow access to your photo library.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        setUploadedDocs((prev) => ({ ...prev, [docKey]: result.assets[0] }));
      }
    } catch {
      Alert.alert('Error', 'Could not open photo library.');
    }
  };

  const handleSubmit = async () => {
    const missing = REQUIRED_DOCS.filter((d) => !uploadedDocs[d.key]);
    if (missing.length > 0) {
      Alert.alert('Documents required', `Please upload: ${missing.map((d) => d.label).join(', ')}`);
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      // Required fields for the KYC endpoint
      formData.append('country_code', 'GB');
      formData.append('document_type', 'kyb');
      formData.append('business_name', user?.company_name || user?.full_name || '');

      // Map our doc keys to the backend's expected field names
      const fieldMap = {
        company_registration: 'business_reg',
        proof_of_address: 'front_document',
        director_id: 'back_document',
      };

      REQUIRED_DOCS.forEach(({ key }) => {
        const doc = uploadedDocs[key];
        const fieldName = fieldMap[key] || key;
        if (doc) {
          formData.append(fieldName, {
            uri: doc.uri,
            type: doc.mimeType || 'image/jpeg',
            name: `${fieldName}.jpg`,
          });
        }
      });

      const response = await kycService.submitKyc(formData);
      if (response?.success) {
        // Docs submitted — now prompt email verification
        navigation.navigate('EmailVerification', { email: user?.email, account_type: 'business' });
      } else {
        Alert.alert('Submission failed', response?.message || 'Please try again.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to submit documents. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartSelling = () => {
    isNavigatingAwayRef.current = true;
    navigation.reset({
      index: 0,
      routes: [{ name: 'SearchScreen' }],
    });
  };

  const handleReUpload = () => {
    setUploadedDocs({});
    setScreenState('upload');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      Alert.alert(t('Error'), t('Failed to log out. Please try again.'));
    }
  };

  const stepIndex = screenState === 'upload' ? 0
    : screenState === 'pending' ? 1
    : 2;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Logo */}
      <View style={styles.logoRow}>
        <Image source={IMAGES.logoMain} style={styles.logo} resizeMode="contain" />
      </View>

      {/* Step indicator */}
      <View style={styles.stepRow}>
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, i <= stepIndex && styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, i <= stepIndex && styles.stepNumberActive]}>
                  {i + 1}
                </Text>
              </View>
              <Text style={[styles.stepLabel, i === stepIndex && styles.stepLabelActive]}>
                {label}
              </Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={[styles.stepLine, i < stepIndex && styles.stepLineActive]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── UPLOAD STATE ─────────────────────────────── */}
        {screenState === 'upload' && (
          <>
            <Text style={styles.heading}>Verify your business</Text>
            <Text style={styles.subheading}>
              Upload the required documents to activate your Pro Seller account.
            </Text>

            {REQUIRED_DOCS.map(({ key, label, hint }) => {
              const uploaded = uploadedDocs[key];
              return (
                <View key={key} style={styles.docCard}>
                  <View style={styles.docInfo}>
                    <Ionicons
                      name={uploaded ? 'checkmark-circle' : 'document-outline'}
                      size={24}
                      color={uploaded ? '#34c759' : '#888'}
                    />
                    <View style={styles.docText}>
                      <Text style={styles.docLabel}>{label}</Text>
                      <Text style={styles.docHint}>{hint}</Text>
                    </View>
                  </View>
                  {uploaded ? (
                    <View style={styles.uploadedRow}>
                      <Image source={{ uri: uploaded.uri }} style={styles.docThumb} />
                      <TouchableOpacity onPress={() => pickDocument(key)} style={styles.rePickBtn}>
                        <Text style={styles.rePickText}>Change</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.uploadBtn} onPress={() => pickDocument(key)}>
                      <Ionicons name="cloud-upload-outline" size={18} color={COLORS.primary} />
                      <Text style={styles.uploadBtnText}>Upload</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}

            <TouchableOpacity
              style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Submit for Review</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {/* ── PENDING STATE ─────────────────────────────── */}
        {screenState === 'pending' && (
          <View style={styles.stateContainer}>
            <Ionicons name="time-outline" size={64} color={COLORS.primary} style={styles.stateIcon} />
            <Text style={styles.heading}>Review in progress</Text>
            <Text style={styles.subheading}>
              We're verifying your credentials. We'll email you within 1–3 business days.
            </Text>
            <Text style={styles.hint}>
              You can close the app and come back later — we'll notify you when it's ready.
            </Text>
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => {
                hasFetchedRef.current = false;
                fetchStatus();
              }}
            >
              <Text style={styles.outlineButtonText}>Check status</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── APPROVED STATE ─────────────────────────────── */}
        {screenState === 'approved' && (
          <View style={styles.stateContainer}>
            <View style={[styles.iconCircle, { backgroundColor: '#34c759' }]}>
              <Ionicons name="checkmark" size={44} color="#fff" />
            </View>
            <Text style={styles.heading}>Your Business Account is ready!</Text>
            <Text style={styles.subheading}>
              Congratulations — you're now a verified Pro Seller on RoundBuy.
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleStartSelling}>
              <Text style={styles.primaryButtonText}>Start Selling</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── REJECTED STATE ─────────────────────────────── */}
        {screenState === 'rejected' && (
          <View style={styles.stateContainer}>
            <View style={[styles.iconCircle, { backgroundColor: '#ff3b30' }]}>
              <Ionicons name="close" size={44} color="#fff" />
            </View>
            <Text style={styles.heading}>Verification unsuccessful</Text>
            <Text style={styles.subheading}>
              We couldn't verify your credentials.
            </Text>
            {!!reviewMessage && (
              <View style={styles.messageBox}>
                <Text style={styles.messageText}>{reviewMessage}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.primaryButton} onPress={handleReUpload}>
              <Text style={styles.primaryButtonText}>Upload new documents</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── MORE INFO STATE ─────────────────────────────── */}
        {screenState === 'more_info' && (
          <View style={styles.stateContainer}>
            <View style={[styles.iconCircle, { backgroundColor: '#ff9500' }]}>
              <Ionicons name="information" size={44} color="#fff" />
            </View>
            <Text style={styles.heading}>Additional information needed</Text>
            <Text style={styles.subheading}>
              We need a bit more information to verify your account.
            </Text>
            {!!reviewMessage && (
              <View style={styles.messageBox}>
                <Text style={styles.messageText}>{reviewMessage}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.primaryButton} onPress={handleReUpload}>
              <Text style={styles.primaryButtonText}>Upload additional documents</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
      {screenState !== 'approved' && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="#888" />
            <Text style={styles.logoutText}>{t('Log Out')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoRow: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  logo: { width: 110, height: 50 },

  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stepItem: { alignItems: 'center', flex: 1 },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepCircleActive: { backgroundColor: COLORS.primary },
  stepNumber: { fontSize: 13, fontWeight: '700', color: '#888' },
  stepNumberActive: { color: '#fff' },
  stepLabel: { fontSize: 11, color: '#888', textAlign: 'center' },
  stepLabelActive: { color: COLORS.primary, fontWeight: '700' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#e0e0e0', marginBottom: 20 },
  stepLineActive: { backgroundColor: COLORS.primary },

  scroll: { padding: 20, paddingBottom: 48 },

  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: 14,
    color: '#6a6a6a',
    lineHeight: 20,
    marginBottom: 24,
  },
  hint: {
    fontSize: 13,
    color: '#aaa',
    lineHeight: 18,
    marginBottom: 24,
    fontStyle: 'italic',
  },

  docCard: {
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  docInfo: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  docText: { flex: 1 },
  docLabel: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  docHint: { fontSize: 12, color: '#888' },
  uploadedRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  docThumb: { width: 56, height: 56, borderRadius: 8, backgroundColor: '#eee' },
  rePickBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  rePickText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: '#EEF2FF',
  },
  uploadBtnText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },

  primaryButton: {
    height: 54,
    backgroundColor: COLORS.primary,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  primaryButtonDisabled: { opacity: 0.6 },
  primaryButtonText: { fontSize: 17, fontWeight: '600', color: '#fff' },

  outlineButton: {
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingHorizontal: 32,
  },
  outlineButtonText: { fontSize: 17, fontWeight: '600', color: COLORS.primary },

  stateContainer: { alignItems: 'center', paddingTop: 32 },
  stateIcon: { marginBottom: 24 },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  messageBox: {
    backgroundColor: '#fff8ec',
    borderWidth: 1,
    borderColor: '#ffd580',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    width: '100%',
  },
  messageText: { fontSize: 14, color: '#333', lineHeight: 20 },
  footer: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  logoutText: {
    fontSize: 15,
    color: '#888',
    fontWeight: '600',
  },
});

export default BusinessVerificationScreen;
