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
import { COLORS } from '../../constants/theme';
import { apiRequest } from '../../services/api';

const NPSSurveyScreen = ({ route, navigation }) => {
  const defaultRole = route?.params?.role || 'buyer';
  const [score, setScore] = useState(null);
  const [comment, setComment] = useState('');
  const [role, setRole] = useState(defaultRole);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (score === null) {
      Alert.alert('Selection Required', 'Please select a score between 0 and 10.');
      return;
    }

    try {
      setSubmitting(true);
      await apiRequest('POST', '/../surveys/nps', {
        score,
        comment,
        role
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting NPS:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>Thank You!</Text>
          <Text style={styles.successText}>
            Your feedback has been received. We appreciate you taking the time to help us build a better RoundBuy!
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
          <Text style={styles.title}>Platform Feedback</Text>
          <Text style={styles.subtitle}>
            How likely are you to recommend RoundBuy to a friend or colleague?
          </Text>
        </View>

        {/* Rating Grid */}
        <View style={styles.scoreGrid}>
          {[...Array(11).keys()].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.scoreBtn,
                score === num && styles.scoreBtnSelected
              ]}
              onPress={() => setScore(num)}
            >
              <Text
                style={[
                  styles.scoreText,
                  score === num && styles.scoreTextSelected
                ]}
              >
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.scaleLabels}>
          <Text style={styles.scaleLabel}>Not likely at all</Text>
          <Text style={styles.scaleLabel}>Extremely likely</Text>
        </View>

        {/* Role Selector */}
        <Text style={styles.sectionLabel}>I primarly use the platform as a:</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'buyer' && styles.roleBtnActive]}
            onPress={() => setRole('buyer')}
          >
            <Text style={[styles.roleBtnText, role === 'buyer' && styles.roleBtnTextActive]}>
              Buyer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'seller' && styles.roleBtnActive]}
            onPress={() => setRole('seller')}
          >
            <Text style={[styles.roleBtnText, role === 'seller' && styles.roleBtnTextActive]}>
              Seller
            </Text>
          </TouchableOpacity>
        </View>

        {/* Comment Field */}
        <Text style={styles.sectionLabel}>What is the primary reason for your score?</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="Tell us what you like or how we can improve..."
          placeholderTextColor="#94a3b8"
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
          maxLength={500}
        />

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
            disabled={submitting}
          >
            <Text style={styles.cancelBtnText}>Maybe Later</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Feedback</Text>
            )}
          </TouchableOpacity>
        </View>
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
    marginBottom: 28,
    alignItems: 'center'
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
    textAlign: 'center',
    lineHeight: 20
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8
  },
  scoreBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  scoreBtnSelected: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a'
  },
  scoreText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#475569'
  },
  scoreTextSelected: {
    color: '#ffffff'
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 32
  },
  scaleLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500'
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 10
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24
  },
  roleBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center'
  },
  roleBtnActive: {
    borderColor: '#1e3a8a',
    backgroundColor: 'rgba(30, 58, 138, 0.05)'
  },
  roleBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569'
  },
  roleBtnTextActive: {
    color: '#1e3a8a',
    fontWeight: 'bold'
  },
  commentInput: {
    height: 100,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#0f172a',
    textAlignVertical: 'top',
    marginBottom: 32
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b'
  },
  submitBtn: {
    flex: 1.5,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center'
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

export default NPSSurveyScreen;
