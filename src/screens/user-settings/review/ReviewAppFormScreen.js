import React, { useState } from 'react';
import { useTranslation } from '../../../context/TranslationContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { platformReviewService } from '../../../services';
import { useAuth } from '../../../context/AuthContext';

const ReviewAppFormScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [experience, setExperience] = useState('');
  const [improvements, setImprovements] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const username = user?.username || user?.full_name || t('User');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert(t('Rating Required'), t('Please provide a rating before submitting.'));
      return;
    }

    try {
      setSubmitting(true);
      await platformReviewService.submitReview({
        type: 'app',
        rating,
        experience,
        improvements
      });

      Alert.alert(
        t('Success'),
        t('Thank you for your review!'),
        [
          {
            text: t('OK'),
            onPress: () => navigation.navigate('AppReviews'), // Or go back? Usually go back or to list
          },
        ]
      );
    } catch (error) {
      console.error('Review error:', error);
      Alert.alert(t('Error'), t('Failed to submit review. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const renderStar = (index) => {
    const isFilled = index < rating;
    return (
      <TouchableOpacity
        key={index}
        onPress={() => setRating(index + 1)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isFilled ? 'star' : 'star-outline'}
          size={40}
          color={isFilled ? '#FFD700' : '#ccc'}
          style={styles.star}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Review the App')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.userAvatar}>
            <Ionicons name="person-circle" size={48} color="#666" />
          </View>
          <Text style={styles.username}>{username}</Text>
        </View>

        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Rate Your Experience:')}</Text>
          <View style={styles.starsContainer}>
            {[0, 1, 2, 3, 4].map((index) => renderStar(index))}
          </View>
        </View>

        {/* Experience Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Please provide us feedback, your experiences, or suggestions of improvement:')}</Text>
          <TextInput
            style={styles.textArea}
            placeholder={t('Share more about your experience')}
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={experience}
            onChangeText={setExperience}
            textAlignVertical="top"
          />
        </View>

        {/* Satisfaction Check */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Are you satisfied with the service?')}</Text>
          {/* This could be a Yes/No toggle or additional input */}
        </View>

        {/* Improvements Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Tell us how we can improve...')}</Text>
          <TextInput
            style={styles.textArea}
            placeholder={t('Your suggestions here...')}
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={improvements}
            onChangeText={setImprovements}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>{t('Send your review')}</Text>
          )}
        </TouchableOpacity>
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
    fontWeight: '600',
    color: '#000',
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  userSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  userAvatar: {
    marginBottom: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    lineHeight: 22,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 4,
  },
  textArea: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#000',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  }
});

export default ReviewAppFormScreen;