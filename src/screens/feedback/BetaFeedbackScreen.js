import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../../constants/theme';
import { apiRequest } from '../../services/api';

const BetaFeedbackScreen = ({ navigation }) => {
  const [round, setRound] = useState('');
  const [platform, setPlatform] = useState('android');
  const [rating, setRating] = useState(0);
  const [isPositive, setIsPositive] = useState(true);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!round) {
      Alert.alert('Selection Required', 'Please select your active testing phase.');
      return;
    }

    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a usability star rating.');
      return;
    }

    try {
      setSubmitting(true);
      await apiRequest('POST', '/../surveys/beta-feedback', {
        round: parseInt(round),
        platform,
        rating,
        isPositive,
        feedbackText
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting beta feedback:', error);
      Alert.alert('Error', 'Failed to submit beta log. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>🏆</Text>
          <Text style={styles.successTitle}>Log Submitted!</Text>
          <Text style={styles.successText}>
            Thank you for helping us test and build a better marketplace. Your bug reports will be reviewed.
          </Text>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Beta Tester Feedback</Text>
          <Text style={styles.subtitle}>
            Submit your feedback and bugs directly to the development team.
          </Text>
        </View>

        {/* Round Picker */}
        <Text style={styles.sectionLabel}>1. Active Testing Phase</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={round}
            onValueChange={(itemValue) => setRound(itemValue)}
            style={styles.picker}
          >
            <option value="">-- Choose Testing Phase --</option>
            <option value="1">Round 1: Signup & Onboarding</option>
            <option value="2">Round 2: Search, Map & Filters</option>
            <option value="3">Round 3: Checkout & Payments</option>
            <option value="4">Round 4: Wallet & Disputes</option>
          </Picker>
        </View>

        {/* Platform Selection */}
        <Text style={styles.sectionLabel}>2. Device Platform</Text>
        <View style={styles.platformContainer}>
          {[
            { key: 'android', label: 'Android App' },
            { key: 'ios', label: 'iOS App' },
            { key: 'web', label: 'Website' }
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.platformBtn,
                platform === item.key && styles.platformBtnActive
              ]}
              onPress={() => setPlatform(item.key)}
            >
              <Text
                style={[
                  styles.platformBtnText,
                  platform === item.key && styles.platformBtnTextActive
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Rating */}
        <Text style={styles.sectionLabel}>3. Experience & Usability</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Text style={[styles.starIcon, rating >= star && styles.starIconFilled]}>
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sentiment Switch */}
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setIsPositive(!isPositive)}
          >
            <View style={[styles.checkbox, isPositive && styles.checkboxChecked]}>
              {isPositive && <Text style={styles.checkboxCheckmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              Increment positive sentiment score (No major bugs)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notes */}
        <Text style={styles.sectionLabel}>4. Bug Description & Comments</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="List replication steps, OS version, or any feature notes here..."
          placeholderTextColor="#94a3b8"
          value={feedbackText}
          onChangeText={setFeedbackText}
          multiline
          numberOfLines={6}
          maxLength={1000}
        />

        {/* Submit */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Beta feedback</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  scrollContent: {
    padding: 24
  },
  header: {
    marginBottom: 28
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 10,
    marginTop: 12
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    marginBottom: 16,
    overflow: 'hidden'
  },
  picker: {
    height: 50,
    width: '100%'
  },
  platformContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20
  },
  platformBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center'
  },
  platformBtnActive: {
    borderColor: '#1e3a8a',
    backgroundColor: '#1e3a8a'
  },
  platformBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569'
  },
  platformBtnTextActive: {
    color: '#ffffff',
    fontWeight: 'bold'
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20
  },
  starIcon: {
    fontSize: 36,
    color: '#cbd5e1'
  },
  starIconFilled: {
    color: '#fbbf24'
  },
  checkboxContainer: {
    marginBottom: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  checkboxChecked: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a'
  },
  checkboxCheckmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
    flex: 1
  },
  commentInput: {
    height: 120,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#0f172a',
    textAlignVertical: 'top',
    marginBottom: 28
  },
  submitBtn: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff'
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  successIcon: {
    fontSize: 54,
    marginBottom: 20
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12
  },
  successText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32
  },
  closeBtn: {
    height: 48,
    width: 200,
    borderRadius: 8,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff'
  }
});

export default BetaFeedbackScreen;
