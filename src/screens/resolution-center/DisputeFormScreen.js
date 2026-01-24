import React, { useState } from 'react';
import { useTranslation } from '../../context/TranslationContext';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import SafeScreenContainer from '../../components/SafeScreenContainer';

const DisputeFormScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { category, order, problem } = route.params;
  const [formData, setFormData] = useState({
    description: '',
    expectedResolution: '',
    additionalInfo: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Please describe the issue';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    if (!formData.expectedResolution.trim()) {
      newErrors.expectedResolution = 'Please describe your expected resolution';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      navigation.navigate('UploadEvidence', {
        category,
        order,
        problem,
        formData,
      });
    }
  };

  return (
    <SafeScreenContainer>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('Dispute Details')}</Text>
          <Text style={styles.subtitle}>{t('Provide detailed information about your issue')}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{t('Summary')}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('Category:')}</Text>
            <Text style={styles.summaryValue}>{category.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('Problem:')}</Text>
            <Text style={styles.summaryValue}>{problem.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('Order:')}</Text>
            <Text style={styles.summaryValue}>#{order.order_number}</Text>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>
            Describe the Issue <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.hint}>{t('Provide as much detail as possible (minimum 50 characters)')}</Text>
          <TextInput
            style={[
              styles.textArea,
              errors.description && styles.inputError,
            ]}
            multiline
            numberOfLines={6}
            placeholder={t('Example: I received the product but it was damaged during shipping. The box was intact, but the item inside had visible scratches and dents...')}
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
          />
          {errors.description && (
            <Text style={styles.errorText}>{errors.description}</Text>
          )}
          <Text style={styles.characterCount}>
            {formData.description.length} characters
          </Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>
            Expected Resolution <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.hint}>{t('What would you like to happen?')}</Text>
          <TextInput
            style={[
              styles.textArea,
              errors.expectedResolution && styles.inputError,
            ]}
            multiline
            numberOfLines={4}
            placeholder={t('Example: I would like a full refund of $XX.XX or a replacement product sent at no additional cost...')}
            value={formData.expectedResolution}
            onChangeText={(text) =>
              setFormData({ ...formData, expectedResolution: text })
            }
          />
          {errors.expectedResolution && (
            <Text style={styles.errorText}>{errors.expectedResolution}</Text>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>{t('Additional Information')}</Text>
          <Text style={styles.hint}>{t('Any other details that might help resolve this issue (optional)')}</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            placeholder={t("Example: I've tried contacting the seller but received no response. The product was advertised as new but appears to be used...")}
            value={formData.additionalInfo}
            onChangeText={(text) =>
              setFormData({ ...formData, additionalInfo: text })
            }
          />
        </View>

        <View style={styles.infoCard}>
          <Feather name="info" size={20} color="#4169E1" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>{t('Tips for Success')}</Text>
            <Text style={styles.infoText}>
              • Be clear and specific{'\n'}
              • Include relevant dates and details{'\n'}
              • Stay professional and fact-based{'\n'}
              • You'll upload evidence in the next step
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>{t('Continue to Evidence Upload')}</Text>
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
  summaryCard: {
    backgroundColor: '#FFF',
    padding: 15,
    margin: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4169E1',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
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
  textArea: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 120,
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
  continueButton: {
    backgroundColor: '#4169E1',
    padding: 18,
    margin: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DisputeFormScreen;