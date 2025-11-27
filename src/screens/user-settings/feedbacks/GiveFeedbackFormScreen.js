import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';

const GiveFeedbackFormScreen = ({ navigation, route }) => {
  const { product } = route.params;
  
  const [experienceType, setExperienceType] = useState('positive'); // 'positive', 'negative', 'neutral'
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSubmitFeedback = () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please rate the user');
      return;
    }
    if (feedbackText.trim().length === 0) {
      Alert.alert('Error', 'Please write a feedback text');
      return;
    }

    // Submit feedback
    Alert.alert(
      'Success',
      'Your feedback has been submitted successfully!',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('FeedbackStatus', { product }),
        },
      ]
    );
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[...Array(10)].map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setRating(index + 1)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={index < rating ? 'star' : 'star-outline'}
              size={28}
              color={index < rating ? '#FFD700' : '#ccc'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Give Feedback</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <FontAwesome name="user-circle" size={50} color="#666" />
          </View>
          <Text style={styles.username}>jonnie12</Text>
        </View>

        {/* Rate the Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rate the Experience:</Text>
          <View style={styles.experienceButtons}>
            <TouchableOpacity
              style={[
                styles.experienceButton,
                experienceType === 'positive' && styles.experienceButtonSelected
              ]}
              onPress={() => setExperienceType('positive')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.experienceButtonText,
                experienceType === 'positive' && styles.experienceButtonTextSelected
              ]}>
                Positive
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.experienceButton,
                experienceType === 'negative' && styles.experienceButtonSelected
              ]}
              onPress={() => setExperienceType('negative')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.experienceButtonText,
                experienceType === 'negative' && styles.experienceButtonTextSelected
              ]}>
                Negative
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.experienceButton,
                experienceType === 'neutral' && styles.experienceButtonSelected
              ]}
              onPress={() => setExperienceType('neutral')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.experienceButtonText,
                experienceType === 'neutral' && styles.experienceButtonTextSelected
              ]}>
                Neutral
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rate the User */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rate the User:</Text>
          {renderStars()}
        </View>

        {/* Feedback Text */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Write a short Feedback text:</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Please write a feedback here! Max 50 characters!"
            placeholderTextColor="#999"
            multiline
            maxLength={50}
            value={feedbackText}
            onChangeText={setFeedbackText}
            textAlignVertical="top"
          />
          <Text style={styles.warningText}>
            Please note! Do not give any unfair feedback, it can lead to sanctions!
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitFeedback}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>Send your Feedback</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    marginBottom: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  experienceButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  experienceButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  experienceButtonSelected: {
    backgroundColor: '#999',
  },
  experienceButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  experienceButtonTextSelected: {
    color: '#fff',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000',
    minHeight: 120,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default GiveFeedbackFormScreen;