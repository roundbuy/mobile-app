import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const HelpFAQScreen = ({ route, navigation }) => {
  const { category, title } = route?.params || {};
  const [searchText, setSearchText] = useState('');
  const [expandedItems, setExpandedItems] = useState({});

  const handleBack = () => {
    navigation.goBack();
  };

  const toggleItem = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // FAQ data based on category
  const faqData = {
    common: [
      {
        id: 1,
        question: 'What is RoundBuy?',
        answer: 'RoundBuy is a local marketplace platform that connects buyers and sellers in their local area for safe and convenient transactions.'
      },
      {
        id: 2,
        question: 'Why should I use it?',
        answer: 'RoundBuy offers a safe, local marketplace with verified users, secure payments, and community-focused features.'
      },
      {
        id: 3,
        question: 'Is it safe to use RoundBuy?',
        answer: 'Yes, RoundBuy implements multiple security features including user verification, secure payments, and content moderation.'
      },
      {
        id: 4,
        question: 'Where can I use RoundBuy?',
        answer: 'RoundBuy is available in multiple countries. Check the app for availability in your region.'
      },
      {
        id: 5,
        question: 'How much it costs to use it?',
        answer: 'Basic features are free. Premium memberships offer additional benefits at competitive prices.'
      },
      {
        id: 6,
        question: 'What can you advertise?',
        answer: 'You can advertise various items and services. Check our prohibited items policy for restrictions.'
      },
      {
        id: 7,
        question: 'Where can I get more help?',
        answer: 'Contact our support team through the Contact Support option or browse other help categories.'
      },
      {
        id: 8,
        question: 'Lost your username or password?',
        answer: 'Use the forgot password feature on the login screen to recover your account access.'
      },
    ],
    moderation: [
      {
        id: 1,
        question: 'Report content',
        answer: 'You can report content that violates our policies through the report button on any listing.'
      },
      {
        id: 2,
        question: 'Unlawful and permitted content?',
        answer: 'We prohibit illegal items and content that violates our community guidelines.'
      },
      {
        id: 3,
        question: 'What content is forbidden?',
        answer: 'Prohibited content includes illegal items, counterfeit goods, and inappropriate material.'
      },
      {
        id: 4,
        question: 'RoundBuy follows EU and USA sanctions?',
        answer: 'Yes, RoundBuy complies with all applicable international sanctions and regulations.'
      },
      {
        id: 5,
        question: 'What to know when you make an Ad?',
        answer: 'Ensure your ad follows our guidelines, includes accurate information, and appropriate images.'
      },
      {
        id: 6,
        question: 'You found an Ad with forbidden content?',
        answer: 'Report it immediately using the report button. Our team will review and take appropriate action.'
      },
      {
        id: 7,
        question: 'Do you suspect fraud or identity theft?',
        answer: 'Contact support immediately and do not proceed with any transactions.'
      },
      {
        id: 8,
        question: 'Some example behaviour and content to report?',
        answer: 'Report scams, inappropriate content, counterfeit items, or suspicious behavior.'
      },
      {
        id: 9,
        question: 'Advantages of reporting forbidden content?',
        answer: 'Reporting helps keep the community safe and ensures a trustworthy marketplace for all users.'
      },
      {
        id: 10,
        question: 'Your Ad was deleted without acceptable reason?',
        answer: 'Contact support to appeal the decision and provide additional information.'
      },
    ],
    login: [
      {
        id: 1,
        question: 'Password & Login issues',
        answer: 'Use the forgot password feature or contact support for login assistance.'
      },
      {
        id: 2,
        question: 'Fraudulent Emails & scams',
        answer: 'Never share your login credentials. Report phishing attempts to support.'
      },
      {
        id: 3,
        question: 'Security',
        answer: 'Enable two-factor authentication and use strong, unique passwords for your account.'
      },
      {
        id: 4,
        question: 'See Paypal!!!!!',
        answer: 'RoundBuy integrates with PayPal for secure payments. Check your PayPal account for transaction details.'
      },
    ],
    account: [],
    locations: [],
    payments: [],
    disputes: [],
    forbidden: [],
    safe: [],
  };

  const questions = faqData[category] || faqData.common;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title || 'Help'}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="How can we help?"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* FAQ Items */}
        {questions.map((item) => (
          <View key={item.id} style={styles.faqItem}>
            <TouchableOpacity
              style={styles.questionContainer}
              onPress={() => toggleItem(item.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.questionText}>{item.question}</Text>
              <Ionicons
                name={expandedItems[item.id] ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#000"
              />
            </TouchableOpacity>
            
            {expandedItems[item.id] && (
              <View style={styles.answerContainer}>
                <Text style={styles.answerText}>{item.answer}</Text>
              </View>
            )}
          </View>
        ))}

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
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#000',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  questionText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '400',
    flex: 1,
    marginRight: 12,
  },
  answerContainer: {
    paddingBottom: 16,
    paddingRight: 32,
  },
  answerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default HelpFAQScreen;