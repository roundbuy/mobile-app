import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import disputeService from '../../services/disputeService';

const ReviewEligibilityScreen = ({ navigation, route }) => {
  const { category, order, problem } = route.params;
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkEligibility();
  }, []);

  const checkEligibility = async () => {
    try {
      const response = await disputeService.checkEligibility(order.id);
      setEligibility(response.data);
    } catch (error) {
      console.error('Error checking eligibility:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigation.navigate('DisputeForm', {
      category,
      order,
      problem,
    });
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
          <Text style={styles.title}>Review Eligibility</Text>
          <Text style={styles.subtitle}>
            Let's review if you can proceed with this dispute
          </Text>
        </View>

        {eligibility?.is_eligible ? (
          <View style={styles.eligibleCard}>
            <View style={styles.statusIcon}>
              <Feather name="check-circle" size={48} color="#32CD32" />
            </View>
            <Text style={styles.statusTitle}>You're Eligible!</Text>
            <Text style={styles.statusText}>
              Your order meets all requirements to open a dispute.
            </Text>
          </View>
        ) : (
          <View style={styles.ineligibleCard}>
            <View style={styles.statusIcon}>
              <Feather name="x-circle" size={48} color="#FF4444" />
            </View>
            <Text style={styles.statusTitle}>Not Eligible</Text>
            <Text style={styles.statusText}>
              {eligibility?.reason || 'This order does not meet the requirements for a dispute.'}
            </Text>
          </View>
        )}

        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Order Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Number:</Text>
            <Text style={styles.detailValue}>#{order.order_number}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Date:</Text>
            <Text style={styles.detailValue}>
              {new Date(order.order_date).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Days Since Order:</Text>
            <Text style={styles.detailValue}>
              {eligibility?.days_since_order || 0} days
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValue}>${order.total_amount}</Text>
          </View>
        </View>

        <View style={styles.requirementsCard}>
          <Text style={styles.requirementsTitle}>Requirements</Text>
          
          <View style={styles.requirementRow}>
            <Feather 
              name={eligibility?.within_time_limit ? "check-circle" : "x-circle"} 
              size={20} 
              color={eligibility?.within_time_limit ? "#32CD32" : "#FF4444"} 
            />
            <Text style={styles.requirementText}>
              Order within 30 days
            </Text>
          </View>

          <View style={styles.requirementRow}>
            <Feather 
              name={eligibility?.no_existing_dispute ? "check-circle" : "x-circle"} 
              size={20} 
              color={eligibility?.no_existing_dispute ? "#32CD32" : "#FF4444"} 
            />
            <Text style={styles.requirementText}>
              No existing dispute for this order
            </Text>
          </View>

          <View style={styles.requirementRow}>
            <Feather 
              name={eligibility?.order_completed ? "check-circle" : "x-circle"} 
              size={20} 
              color={eligibility?.order_completed ? "#32CD32" : "#FF4444"} 
            />
            <Text style={styles.requirementText}>
              Order marked as received
            </Text>
          </View>
        </View>

        {eligibility?.is_eligible && (
          <View style={styles.infoCard}>
            <Feather name="info" size={20} color="#4169E1" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Next Steps</Text>
              <Text style={styles.infoText}>
                • Provide detailed information about your issue{'\n'}
                • Upload supporting evidence (photos, documents){'\n'}
                • Review and submit your dispute{'\n'}
                • You'll have 3 days to negotiate with the seller
              </Text>
            </View>
          </View>
        )}

        {eligibility?.is_eligible ? (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue to Dispute Form</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        )}
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
  eligibleCard: {
    backgroundColor: '#FFF',
    padding: 30,
    margin: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#32CD32',
  },
  ineligibleCard: {
    backgroundColor: '#FFF',
    padding: 30,
    margin: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF4444',
  },
  statusIcon: {
    marginBottom: 15,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  detailsCard: {
    backgroundColor: '#FFF',
    padding: 20,
    margin: 15,
    marginTop: 0,
    borderRadius: 12,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  requirementsCard: {
    backgroundColor: '#FFF',
    padding: 20,
    margin: 15,
    marginTop: 0,
    borderRadius: 12,
  },
  requirementsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  requirementText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  infoCard: {
    backgroundColor: '#FFF',
    padding: 15,
    margin: 15,
    marginTop: 0,
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
  backButton: {
    backgroundColor: '#FFF',
    padding: 18,
    margin: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  backButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ReviewEligibilityScreen;