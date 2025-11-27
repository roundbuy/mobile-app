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
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';

const ReviewAppFormScreen = ({ navigation }) => {
  const [rating, setRating] = useState(0);
  const [experience, setExperience] = useState('');
  const [improvements, setImprovements] = useState('');
  const username = 'jonnie12';

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please provide a rating before submitting.');
      return;
    }
    
    Alert.alert(
      'Success',
      'Thank you for your review!',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('AppReviews'),
        },
      ]
    );
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
        <Text style={styles.headerTitle}>Review the App</Text>
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
          <Text style={styles.sectionTitle}>Rate Your Experience:</Text>
          <View style={styles.starsContainer}>
            {[0, 1, 2, 3, 4].map((index) => renderStar(index))}
          </View>
        </View>

        {/* Experience Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Please provide us feedback, your experiences, or suggestions of improvement:
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Share more about your experience"
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
          <Text style={styles.sectionTitle}>Are you satisfied with the service?</Text>
          {/* This could be a Yes/No toggle or additional input */}
        </View>

        {/* Improvements Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tell us how we can improve...</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Your suggestions here..."
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
          style={styles.submitButton}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Send your review</Text>
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
});

export default ReviewAppFormScreen;