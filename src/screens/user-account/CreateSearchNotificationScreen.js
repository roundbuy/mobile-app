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
import { COLORS } from '../../constants/theme';

const CreateSearchNotificationScreen = ({ navigation }) => {
  const [activity, setActivity] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [keywords, setKeywords] = useState('');
  const [condition, setCondition] = useState('');
  const [price, setPrice] = useState('');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCreate = () => {
    console.log('Creating search notification:', {
      activity,
      category,
      subcategory,
      keywords,
      condition,
      price,
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Search Notification</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Create a Search Notification for a product you want to find. When such a product is put on sale online, you will receive a notification.
        </Text>

        {/* Activity */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Activity</Text>
          <TextInput
            style={styles.input}
            value={activity}
            onChangeText={setActivity}
            placeholder="Select activity"
            placeholderTextColor="#999"
          />
        </View>

        {/* Category */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="Select category"
            placeholderTextColor="#999"
          />
        </View>

        {/* Subcategory */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Subcategory</Text>
          <TextInput
            style={styles.input}
            value={subcategory}
            onChangeText={setSubcategory}
            placeholder="Select subcategory"
            placeholderTextColor="#999"
          />
        </View>

        {/* Keywords */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Keyword(s)</Text>
          <TextInput
            style={styles.input}
            value={keywords}
            onChangeText={setKeywords}
            placeholder="Enter keywords"
            placeholderTextColor="#999"
          />
        </View>

        {/* Condition */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Condition</Text>
          <TextInput
            style={styles.input}
            value={condition}
            onChangeText={setCondition}
            placeholder="Select condition"
            placeholderTextColor="#999"
          /> </View>

        {/* Price */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="Enter price range"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        {/* Create Button */}
        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createButtonText}>Create a Search Notification</Text>
        </TouchableOpacity>

        {/* Copyright */}
        <Text style={styles.copyright}>© 2020-2025 RoundBuy Inc ®</Text>

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
  intro: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#000',
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  copyright: {
    fontSize: 11,
    fontWeight: '400',
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default CreateSearchNotificationScreen;