import React, { useState } from 'react';
import { useTranslation } from '../../../context/TranslationContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../../constants/theme';

const VisibilityAdChoicesScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
  const { ad, type } = route.params;
  
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [selectedDistance, setSelectedDistance] = useState(null);

  const handleBack = () => {
    navigation.goBack();
  };

  const durationOptions = [
    { id: 1, label: '3 days', value: 3 },
    { id: 2, label: '7 days', value: 7 },
    { id: 3, label: '10 days', value: 10 },
    { id: 4, label: '14 days', value: 14 },
  ];

  const distanceOptions = [
    { id: 1, label: '< 2,5 km', price: '£7.00', value: 2.5 },
    { id: 2, label: '< 5 km', price: '£10.00', value: 5 },
    { id: 3, label: '< 7,5 km', price: '£12.00', value: 7.5 },
    { id: 4, label: '< 10 km', price: '£15.00', value: 10 },
  ];

  const handleContinue = () => {
    if (!selectedDuration || !selectedDistance) {
      alert('Please select both duration and distance options');
      return;
    }

    const selectedDurationOption = durationOptions.find(opt => opt.id === selectedDuration);
    const selectedDistanceOption = distanceOptions.find(opt => opt.id === selectedDistance);

    navigation.navigate('VisibilityCart', {
      ad,
      type,
      duration: selectedDurationOption,
      distance: selectedDistanceOption,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Visibility Ad Choices')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Choose display time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Choose display time:')}</Text>
          
          <View style={styles.buttonGrid}>
            {durationOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  selectedDuration === option.id && styles.optionButtonSelected
                ]}
                onPress={() => setSelectedDuration(option.id)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.optionButtonText,
                  selectedDuration === option.id && styles.optionButtonTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.infoLink} activeOpacity={0.7}>
            <Text style={styles.infoLinkText}>{t('For more information,')}</Text>
            <Text style={[styles.infoLinkText, styles.clickHereText]}>{t('click here')}</Text>
            <Ionicons name="information-circle-outline" size={20} color="#666" style={styles.infoIcon} />
          </TouchableOpacity>
        </View>

        {/* Choose radius (distance) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Choose radius (distance):')}</Text>
          <Text style={styles.sectionSubtitle}>{t('By setting the radius or distance you decide how far your Ad will be displayed.')}</Text>
          
          <View style={styles.buttonGrid}>
            {distanceOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  selectedDistance === option.id && styles.optionButtonSelected
                ]}
                onPress={() => setSelectedDistance(option.id)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.optionButtonText,
                  selectedDistance === option.id && styles.optionButtonTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.infoLink} activeOpacity={0.7}>
            <Text style={styles.infoLinkText}>{t('For more information, about prices')}</Text>
            <Text style={[styles.infoLinkText, styles.clickHereText]}>{t('click here')}</Text>
            <Ionicons name="information-circle-outline" size={20} color="#666" style={styles.infoIcon} />
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedDuration || !selectedDistance) && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          activeOpacity={0.7}
          disabled={!selectedDuration || !selectedDistance}
        >
          <Text style={styles.continueButtonText}>{t('Continue')}</Text>
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
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 12,
  },
  optionButton: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionButtonSelected: {
    backgroundColor: COLORS.primary,
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  optionButtonTextSelected: {
    color: '#fff',
  },
  infoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoLinkText: {
    fontSize: 14,
    color: '#666',
  },
  clickHereText: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  infoIcon: {
    marginLeft: 4,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    marginTop: 40,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default VisibilityAdChoicesScreen;