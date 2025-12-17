import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import disputeService from '../../services/disputeService';

const DisputeConfirmationScreen = ({ navigation, route }) => {
  const { category, order, problem, formData, files = [] } = route.params;
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const disputeData = {
        order_id: order.id,
        category_id: category.id,
        problem_id: problem.id,
        description: formData.description,
        expected_resolution: formData.expectedResolution,
        additional_info: formData.additionalInfo,
      };

      // Create dispute
      const response = await disputeService.createDispute(disputeData);
      const disputeId = response.data.id;

      // Upload files if any
      if (files.length > 0) {
        for (const file of files) {
          await disputeService.uploadEvidence(disputeId, file);
        }
      }

      Alert.alert(
        'Dispute Created',
        'Your dispute has been submitted successfully. We will review it within 24 hours.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('DisputeDetail', { disputeId }),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit dispute. Please try again.');
      console.error('Error submitting dispute:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeScreenContainer>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Review & Confirm</Text>
          <Text style={styles.subtitle}>
            Please review your dispute before submitting
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <View style={styles.card}>
            <InfoRow label="Order Number" value={`#${order.order_number}`} />
            <InfoRow label="Product" value={order.product_name} />
            <InfoRow label="Amount" value={`$${order.total_amount}`} />
            <InfoRow 
              label="Order Date" 
              value={new Date(order.order_date).toLocaleDateString()} 
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dispute Details</Text>
          <View style={styles.card}>
            <InfoRow label="Category" value={category.name} />
            <InfoRow label="Problem" value={problem.name} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Description</Text>
          <View style={styles.card}>
            <Text style={styles.descriptionText}>{formData.description}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expected Resolution</Text>
          <View style={styles.card}>
            <Text style={styles.descriptionText}>
              {formData.expectedResolution}
            </Text>
          </View>
        </View>

        {formData.additionalInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <View style={styles.card}>
              <Text style={styles.descriptionText}>
                {formData.additionalInfo}
              </Text>
            </View>
          </View>
        )}

        {files.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Evidence Files</Text>
            <View style={styles.card}>
              <Text style={styles.filesCount}>
                {files.length} file{files.length > 1 ? 's' : ''} attached
              </Text>
              {files.map((file, index) => (
                <View key={index} style={styles.fileItem}>
                  <Feather 
                    name={file.type === 'image' ? 'image' : 'file-text'} 
                    size={20} 
                    color="#4169E1" 
                  />
                  <Text style={styles.fileName} numberOfLines={1}>
                    {file.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.warningCard}>
          <Feather name="alert-circle" size={20} color="#FFA500" />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Important Notice</Text>
            <Text style={styles.warningText}>
              • You'll have 3 days to negotiate with the seller{'\n'}
              • Disputes cannot be edited after submission{'\n'}
              • False claims may result in account suspension{'\n'}
              • Response time: Up to 24 hours
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={submitting}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Dispute</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeScreenContainer>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

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
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  filesCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  fileName: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
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
  buttonContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  backButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#4169E1',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default DisputeConfirmationScreen;