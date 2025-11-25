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

const PersonalInformationScreen = ({ navigation }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: 'John Gerald Rogerson',
    email: 'john.rogersens@gmail.com',
    phone: '+44 20 765345554',
    billingAddress: '119 Regent Street, London, WW1 XZ, UK',
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleSave = () => {
    // Save logic here
    console.log('Saving changes:', formData);
    setIsEditMode(false);
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? 'Edit my personal information' : 'My personal information'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Your Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={[styles.input, !isEditMode && styles.inputDisabled]}
            value={formData.name}
            onChangeText={(text) => updateField('name', text)}
            editable={isEditMode}
            placeholder="Enter your name"
            placeholderTextColor="#999"
          />
        </View>

        {/* Email Address */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={[styles.input, !isEditMode && styles.inputDisabled]}
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
            editable={isEditMode}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Phone Number */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Phone number</Text>
          <TextInput
            style={[styles.input, !isEditMode && styles.inputDisabled]}
            value={formData.phone}
            onChangeText={(text) => updateField('phone', text)}
            editable={isEditMode}
            placeholder="Enter your phone number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>

        {/* Billing Address */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Billing address</Text>
          <TextInput
            style={[styles.input, !isEditMode && styles.inputDisabled]}
            value={formData.billingAddress}
            onChangeText={(text) => updateField('billingAddress', text)}
            editable={isEditMode}
            placeholder="Enter your billing address"
            placeholderTextColor="#999"
            multiline
          />
        </View>

        {/* Info Note */}
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={20} color="#666" />
          <Text style={styles.infoText}>
            Please note! The billing address is only used for billing, and it is not shared at the service with other users, and it's neither centre-point nor product location address.
          </Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.actionButton, isEditMode && styles.saveButton]}
          onPress={isEditMode ? handleSave : handleEdit}
        >
          <Text style={[styles.actionButtonText, isEditMode && styles.saveButtonText]}>
            {isEditMode ? 'Save changes' : 'Edit'}
          </Text>
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
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
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
    minHeight: 48,
  },
  inputDisabled: {
    backgroundColor: '#f8f8f8',
    color: '#666',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginLeft: 8,
  },
  actionButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    color: '#fff',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default PersonalInformationScreen;