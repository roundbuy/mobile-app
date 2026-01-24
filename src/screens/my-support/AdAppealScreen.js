import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/TranslationContext';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import supportService from '../../services/supportService';

const AdAppealScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
  const { adId } = route.params;
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    reason: '',
    explanation: '',
  });
  const [evidence, setEvidence] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadAdDetails();
  }, []);

  const loadAdDetails = async () => {
    try {
      const response = await supportService.getDeletedAdById(adId);
      setAd(response.data);
    } catch (error) {
      console.error('Error loading ad:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    Alert.alert(
      t('Feature Coming Soon'),
      t('Image upload functionality requires expo-image-picker package. You can proceed without uploading evidence for now.'),
      [{ text: t('OK') }]
    );
  };

  const pickDocument = async () => {
    Alert.alert(
      t('Feature Coming Soon'),
      t('Document upload functionality requires expo-document-picker package. You can proceed without uploading evidence for now.'),
      [{ text: t('OK') }]
    );
  };

  const removeEvidence = (index) => {
    setEvidence(evidence.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.reason.trim()) {
      newErrors.reason = 'Please provide a reason for appeal';
    } else if (formData.reason.length < 20) {
      newErrors.reason = 'Reason must be at least 20 characters';
    }

    if (!formData.explanation.trim()) {
      newErrors.explanation = 'Please provide a detailed explanation';
    } else if (formData.explanation.length < 100) {
      newErrors.explanation = 'Explanation must be at least 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const appealData = {
        ad_id: adId,
        reason: formData.reason,
        explanation: formData.explanation,
      };

      // Create appeal
      const response = await supportService.createAdAppeal(appealData);
      const appealId = response.data.id;

      // Upload evidence if any
      if (evidence.length > 0) {
        for (const file of evidence) {
          await supportService.uploadAppealEvidence(appealId, file);
        }
      }

      Alert.alert(
        t('Appeal Submitted'),
        t('Your appeal has been submitted successfully. We will review it within 48-72 hours.'),
        [
          {
            text: t('OK'),
            onPress: () => navigation.replace('AppealStatus', { appealId }),
          },
        ]
      );
    } catch (error) {
      Alert.alert(t('Error'), t('Failed to submit appeal. Please try again.'));
      console.error('Error submitting appeal:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4169E1" />
        </View>
      </SafeScreenContainer>
    );
  }

  if (!ad) {
    return (
      <SafeScreenContainer>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color="#FF4444" />
          <Text style={styles.errorText}>{t('Ad not found')}</Text>
        </View>
      </SafeScreenContainer>
    );
  }

  return (
    <SafeScreenContainer>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('Appeal Ad Deletion')}</Text>
          <Text style={styles.subtitle}>{t('Provide evidence to support your appeal')}</Text>
        </View>

        {/* Ad Info */}
        <View style={styles.adCard}>
          <View style={styles.adHeader}>
            <Image source={{ uri: ad.image_url }} style={styles.adImage} />
            <View style={styles.adInfo}>
              <Text style={styles.adTitle} numberOfLines={2}>
                {ad.title}
              </Text>
              <Text style={styles.violationType}>
                Violation: {ad.violation_type}
              </Text>
            </View>
          </View>
          <View style={styles.reasonBox}>
            <Text style={styles.reasonLabel}>{t('Reason for Deletion:')}</Text>
            <Text style={styles.reasonText}>{ad.reason}</Text>
          </View>
        </View>

        {/* Appeal Form */}
        <View style={styles.formSection}>
          <Text style={styles.label}>
            Reason for Appeal <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.hint}>{t('Brief summary (minimum 20 characters)')}</Text>
          <TextInput
            style={[styles.input, errors.reason && styles.inputError]}
            placeholder={t('Example: This was a misunderstanding, the item complies with all policies')}
            value={formData.reason}
            onChangeText={(text) => setFormData({ ...formData, reason: text })}
            maxLength={200}
          />
          {errors.reason && <Text style={styles.errorText}>{errors.reason}</Text>}
          <Text style={styles.characterCount}>
            {formData.reason.length}/200 characters
          </Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>
            Detailed Explanation <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.hint}>{t('Explain why this decision should be reversed (minimum 100 characters)')}</Text>
          <TextInput
            style={[styles.textArea, errors.explanation && styles.inputError]}
            multiline
            numberOfLines={8}
            placeholder={t('Provide detailed information about why you believe this ad should be restored. Include any relevant context, evidence, or clarifications...')}
            value={formData.explanation}
            onChangeText={(text) =>
              setFormData({ ...formData, explanation: text })
            }
            maxLength={2000}
          />
          {errors.explanation && (
            <Text style={styles.errorText}>{errors.explanation}</Text>
          )}
          <Text style={styles.characterCount}>
            {formData.explanation.length}/2000 characters
          </Text>
        </View>

        {/* Evidence Upload */}
        <View style={styles.formSection}>
          <Text style={styles.label}>{t('Supporting Evidence (Optional)')}</Text>
          <Text style={styles.hint}>{t('Upload screenshots, documents, or photos that support your case')}</Text>

          <View style={styles.uploadButtons}>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Feather name="image" size={24} color="#4169E1" />
              <Text style={styles.uploadButtonText}>{t('Add Photos')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
              <Feather name="file" size={24} color="#4169E1" />
              <Text style={styles.uploadButtonText}>{t('Add Documents')}</Text>
            </TouchableOpacity>
          </View>

          {evidence.length > 0 && (
            <View style={styles.evidenceList}>
              {evidence.map((file, index) => (
                <View key={index} style={styles.evidenceItem}>
                  <Feather
                    name={file.type === 'image' ? 'image' : 'file-text'}
                    size={20}
                    color="#4169E1"
                  />
                  <Text style={styles.evidenceName} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <TouchableOpacity onPress={() => removeEvidence(index)}>
                    <Feather name="x" size={20} color="#FF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.warningCard}>
          <Feather name="alert-circle" size={20} color="#FFA500" />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>{t('Important Notice')}</Text>
            <Text style={styles.warningText}>
              • Appeals are reviewed within 48-72 hours{'\n'}
              • False appeals may result in account restrictions{'\n'}
              • Provide honest and accurate information{'\n'}
              • Multiple violations may limit appeal rights
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>{t('Submit Appeal')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
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
  adCard: {
    backgroundColor: '#FFF',
    padding: 15,
    margin: 15,
    borderRadius: 12,
  },
  adHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  adImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  adInfo: {
    flex: 1,
    marginLeft: 15,
  },
  adTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  violationType: {
    fontSize: 14,
    color: '#FF4444',
    marginTop: 5,
    fontWeight: '600',
  },
  reasonBox: {
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF4444',
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  reasonText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  formSection: {
    padding: 15,
    paddingTop: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  required: {
    color: '#FF4444',
  },
  hint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 150,
  },
  inputError: {
    borderColor: '#FF4444',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    marginTop: 5,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
  },
  uploadButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  uploadButton: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 14,
    color: '#4169E1',
    fontWeight: '600',
    marginTop: 8,
  },
  evidenceList: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 12,
  },
  evidenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  evidenceName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  warningCard: {
    backgroundColor: '#FFF',
    padding: 15,
    margin: 15,
    borderRadius: 12,
    flexDirection: 'row',
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
  },
  warningContent: {
    flex: 1,
    marginLeft: 15,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  submitButton: {
    backgroundColor: '#4169E1',
    padding: 18,
    margin: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default AdAppealScreen;