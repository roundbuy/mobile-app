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
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import supportService from '../../services/supportService';

const CreateTicketScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    subject: '',
    description: '',
    priority: 'medium',
  });
  const [errors, setErrors] = useState({});
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await supportService.getSupportCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category_id) {
      newErrors.category_id = 'Please select a category';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Please enter a subject';
    } else if (formData.subject.length < 10) {
      newErrors.subject = 'Subject must be at least 10 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please describe your issue';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const response = await supportService.createSupportTicket(formData);
      const ticketId = response.data.id;

      Alert.alert(
        t('Ticket Created'),
        t('Your support ticket has been created successfully. Our team will respond within 24 hours.'),
        [
          {
            text: t('OK'),
            onPress: () => navigation.replace('TicketDetail', { ticketId }),
          },
        ]
      );
    } catch (error) {
      Alert.alert(t('Error'), t('Failed to create ticket. Please try again.'));
      console.error('Error creating ticket:', error);
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

  return (
    <SafeScreenContainer>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('Create Support Ticket')}</Text>
          <Text style={styles.subtitle}>{t("Tell us about your issue and we'll help you resolve it")}</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>
            Category <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.pickerButton, errors.category_id && styles.inputError]}
            onPress={() => setShowCategoryPicker(true)}
          >
            <Text style={[styles.pickerButtonText, !formData.category_id && styles.placeholderText]}>
              {formData.category_id
                ? categories.find(c => c.id === formData.category_id)?.name
                : 'Select a category'}
            </Text>
            <Feather name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
          {errors.category_id && (
            <Text style={styles.errorText}>{errors.category_id}</Text>
          )}
        </View>

        {/* Category Picker Modal */}
        <Modal
          visible={showCategoryPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCategoryPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('Select Category')}</Text>
                <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                  <Feather name="x" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalList}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.modalItem,
                      formData.category_id === category.id && styles.modalItemSelected,
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, category_id: category.id });
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        formData.category_id === category.id && styles.modalItemTextSelected,
                      ]}
                    >
                      {category.name}
                    </Text>
                    {formData.category_id === category.id && (
                      <Feather name="check" size={20} color="#4169E1" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <View style={styles.formSection}>
          <Text style={styles.label}>
            Priority <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.priorityButtons}>
            {['low', 'medium', 'high', 'urgent'].map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.priorityButton,
                  formData.priority === priority && styles.priorityButtonActive,
                  formData.priority === priority &&
                  styles[`priority_${priority}`],
                ]}
                onPress={() => setFormData({ ...formData, priority })}
              >
                <Text
                  style={[
                    styles.priorityButtonText,
                    formData.priority === priority && styles.priorityButtonTextActive,
                  ]}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>
            Subject <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.hint}>{t('Brief description (minimum 10 characters)')}</Text>
          <TextInput
            style={[styles.input, errors.subject && styles.inputError]}
            placeholder={t('Example: Unable to upload product images')}
            value={formData.subject}
            onChangeText={(text) => setFormData({ ...formData, subject: text })}
            maxLength={100}
          />
          {errors.subject && (
            <Text style={styles.errorText}>{errors.subject}</Text>
          )}
          <Text style={styles.characterCount}>
            {formData.subject.length}/100 characters
          </Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>
            Description <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.hint}>{t('Detailed explanation (minimum 50 characters)')}</Text>
          <TextInput
            style={[styles.textArea, errors.description && styles.inputError]}
            multiline
            numberOfLines={8}
            placeholder={t("Please describe your issue in detail. Include any error messages, steps to reproduce the problem, and what you've already tried...")}
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
            maxLength={1000}
          />
          {errors.description && (
            <Text style={styles.errorText}>{errors.description}</Text>
          )}
          <Text style={styles.characterCount}>
            {formData.description.length}/1000 characters
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Feather name="info" size={20} color="#4169E1" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>{t('Response Time')}</Text>
            <Text style={styles.infoText}>
              • Low/Medium priority: Within 24-48 hours{'\n'}
              • High priority: Within 12 hours{'\n'}
              • Urgent: Within 4 hours
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
            <Text style={styles.submitButtonText}>{t('Create Ticket')}</Text>
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
  formSection: {
    padding: 15,
    paddingTop: 0,
    marginTop: 15,
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
  pickerButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalItemTextSelected: {
    color: '#4169E1',
    fontWeight: '600',
  },
  priorityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginHorizontal: 3,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  priorityButtonActive: {
    borderWidth: 2,
  },
  priority_low: {
    borderColor: '#32CD32',
    backgroundColor: '#E8F5E9',
  },
  priority_medium: {
    borderColor: '#FFA500',
    backgroundColor: '#FFF3E0',
  },
  priority_high: {
    borderColor: '#FF6347',
    backgroundColor: '#FFEBEE',
  },
  priority_urgent: {
    borderColor: '#FF0000',
    backgroundColor: '#FFCDD2',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  priorityButtonTextActive: {
    color: '#333',
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

export default CreateTicketScreen;