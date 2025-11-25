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

const CustomerSupportScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');

  const handleBack = () => {
    navigation.goBack();
  };

  const supportCategories = [
    { id: 1, title: 'Common questions', screen: 'HelpFAQ', category: 'common' },
    { id: 2, title: 'Moderation', screen: 'HelpFAQ', category: 'moderation' },
    { id: 3, title: 'Login & security', screen: 'HelpFAQ', category: 'login' },
    { id: 4, title: 'My Account', screen: 'HelpFAQ', category: 'account' },
    { id: 5, title: 'My locations', screen: 'HelpFAQ', category: 'locations' },
    { id: 6, title: 'Payments', screen: 'HelpFAQ', category: 'payments' },
    { id: 7, title: 'Disputes and Limitations', screen: 'HelpFAQ', category: 'disputes' },
    { id: 8, title: 'Forbidden Products', screen: 'HelpFAQ', category: 'forbidden' },
    { id: 9, title: 'Safe Business', screen: 'HelpFAQ', category: 'safe' },
    { id: 10, title: 'Contact support', screen: 'ContactSupport' },
  ];

  const handleCategoryPress = (item) => {
    if (item.screen === 'ContactSupport') {
      navigation.navigate('ContactSupport');
    } else {
      navigation.navigate('HelpFAQ', {
        category: item.category,
        title: item.title,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help</Text>
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

        {/* Support Categories */}
        <View style={styles.categoriesContainer}>
          {supportCategories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.categoryItem}
              onPress={() => handleCategoryPress(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.categoryText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
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
  categoriesContainer: {
    marginBottom: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '400',
    flex: 1,
  },
});

export default CustomerSupportScreen;