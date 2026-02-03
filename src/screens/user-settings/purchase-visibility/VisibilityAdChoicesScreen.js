import React, { useState, useEffect } from 'react';
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
  const { planType, plans, distancePlans } = route.params;

  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedDistanceId, setSelectedDistanceId] = useState(null);

  // Sort plans (durations)
  const sortedPlans = [...plans].sort((a, b) => a.duration_days - b.duration_days);

  // Sort distance plans
  const sortedDistances = [...(distancePlans || [])].sort((a, b) => a.sort_order - b.sort_order);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleContinue = () => {
    if (!selectedPlanId || (sortedDistances.length > 0 && !selectedDistanceId)) {
      alert('Please select all options');
      return;
    }

    const selectedPlan = sortedPlans.find(p => p.id === selectedPlanId);
    const selectedDistance = sortedDistances.find(d => d.id === selectedDistanceId);

    navigation.navigate('PurchaseVisibilityAdsList', {
      planType,
      selectedPlan,
      selectedDistance
    });
  };

  const getCurrencySymbol = (code) => {
    return code === 'GBP' ? '£' : (code === 'USD' ? '$' : code);
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
            {sortedPlans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.optionButton,
                  selectedPlanId === plan.id && styles.optionButtonSelected
                ]}
                onPress={() => setSelectedPlanId(plan.id)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.optionButtonText,
                  selectedPlanId === plan.id && styles.optionButtonTextSelected
                ]}>
                  {plan.duration_label || `${plan.duration_days} ${t('days')}`}
                </Text>
                <Text style={[
                  styles.optionPriceText,
                  selectedPlanId === plan.id && styles.optionButtonTextSelected
                ]}>
                  {getCurrencySymbol('GBP')}{plan.discounted_price}
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
        {sortedDistances.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Choose radius (distance):')}</Text>
            <Text style={styles.sectionSubtitle}>{t('By setting the radius or distance you decide how far your Ad will be displayed.')}</Text>

            <View style={styles.buttonGrid}>
              {sortedDistances.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionButton,
                    selectedDistanceId === option.id && styles.optionButtonSelected
                  ]}
                  onPress={() => setSelectedDistanceId(option.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.optionButtonText,
                    selectedDistanceId === option.id && styles.optionButtonTextSelected
                  ]}>
                    {option.is_unlimited ? t('Unlimited') : `< ${option.distance_km} km`}
                  </Text>
                  <Text style={[
                    styles.optionPriceText,
                    selectedDistanceId === option.id && styles.optionButtonTextSelected
                  ]}>
                    {getCurrencySymbol('GBP')}{option.discounted_price}
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
        )}

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedPlanId || (sortedDistances.length > 0 && !selectedDistanceId)) && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          activeOpacity={0.7}
          disabled={!selectedPlanId || (sortedDistances.length > 0 && !selectedDistanceId)}
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
    marginBottom: 4
  },
  optionPriceText: {
    fontSize: 14,
    color: '#666',
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