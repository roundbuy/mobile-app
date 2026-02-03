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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { feedbackService } from '../../../services';
import { getFullImageUrl } from '../../../utils/imageUtils';

const GiveFeedbackFormScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { transaction, advertisementId, offerId, reviewedUserId, transactionType, isEdit, feedback, images } = route.params;

  const [experienceType, setExperienceType] = useState('positive'); // 'positive', 'negative', 'neutral'
  const [rating, setRating] = useState(feedback ? feedback.rating : 0);
  const [feedbackText, setFeedbackText] = useState(feedback ? feedback.comment : '');
  const [submitting, setSubmitting] = useState(false);

  // Extract product details
  const productTitle = feedback?.advertisement?.title || transaction?.title || t('Product');
  // Order of precedence: images param > feedback.advertisement.images > transaction.images
  const rawImages = images || feedback?.advertisement?.images || transaction?.images || [];
  const productImage = rawImages.length > 0 ? getFullImageUrl(rawImages[0]) : null;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      Alert.alert(t('Error'), t('Please rate the user'));
      return;
    }
    if (feedbackText.trim().length === 0) {
      Alert.alert(t('Error'), t('Please write a feedback text'));
      return;
    }

    try {
      setSubmitting(true);

      let response;
      if (isEdit && feedback?.id) {
        response = await feedbackService.updateFeedback(feedback.id, {
          rating,
          comment: feedbackText.trim()
        });
      } else {
        const feedbackData = {
          advertisementId,
          offerId: offerId || null,
          reviewedUserId,
          rating,
          comment: feedbackText.trim(),
          transactionType: transactionType || 'sell'
        };
        response = await feedbackService.createFeedback(feedbackData);
      }

      if (response.success) {
        Alert.alert(
          t('Success'),
          t(isEdit ? 'Your feedback has been updated successfully!' : 'Your feedback has been submitted successfully!'),
          [
            {
              text: t('OK'),
              onPress: () => {
                // Navigate back
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        Alert.alert(t('Error'), response.message || t('Failed to submit feedback'));
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert(
        t('Error'),
        error.message || t('Failed to submit feedback. Please try again.')
      );
    } finally {
      setSubmitting(false);
    }
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
        <Text style={styles.headerTitle}>{t(isEdit ? 'Edit Feedback' : 'Give Feedback')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Info */}
        <View style={styles.productSection}>
          {productImage ? (
            <Image source={{ uri: productImage }} style={styles.productImage} />
          ) : (
            <View style={[styles.productImage, styles.placeholderImage]}>
              <Ionicons name="image-outline" size={40} color="#ccc" />
            </View>
          )}
          <Text style={styles.productTitle} numberOfLines={2}>
            {productTitle}
          </Text>
        </View>

        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <FontAwesome name="user-circle" size={50} color="#666" />
          </View>
          <Text style={styles.username}>
            {feedback?.reviewedUser?.name || transaction?.otherParty?.name || t('User')}
          </Text>
        </View>

        {/* Rate the Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Rate the Experience:')}</Text>
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
              ]}>{t('Positive')}</Text>
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
              ]}>{t('Negative')}</Text>
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
              ]}>{t('Neutral')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rate the User */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Rate the User:')}</Text>
          {renderStars()}
        </View>

        {/* Feedback Text */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Write a short Feedback text:')}</Text>
          <TextInput
            style={styles.textArea}
            placeholder={t('Please write a feedback here! Max 50 characters!')}
            placeholderTextColor="#999"
            multiline
            maxLength={50}
            value={feedbackText}
            onChangeText={setFeedbackText}
            textAlignVertical="top"
          />
          <Text style={styles.warningText}>{t('Please note! Do not give any unfair feedback, it can lead to sanctions!')}</Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmitFeedback}
          activeOpacity={0.7}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>{t(isEdit ? 'Update Feedback' : 'Send your Feedback')}</Text>
          )}
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
    paddingVertical: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginRight: 16,
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  productTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
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
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
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