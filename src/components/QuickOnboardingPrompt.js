import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const PROMPT_CONFIG = {
  location: {
    icon: 'location-outline',
    title: 'Set your location',
    subtitle: 'See items near you and discover local sellers',
    ctaLabel: 'Set location',
  },
  profile: {
    icon: 'person-circle-outline',
    title: 'Add a profile photo',
    subtitle: 'Help buyers and sellers recognise you',
    ctaLabel: 'Add photo',
  },
  payment: {
    icon: 'rocket-outline',
    title: 'Purchase Display Locations',
    subtitle: 'Reach buyers in more areas by adding extra display locations',
    ctaLabel: 'View plans',
  },
};

const QuickOnboardingPrompt = ({ prompt, onPress, onDismiss }) => {
  const config = PROMPT_CONFIG[prompt];
  if (!config) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.dismissButton} onPress={onDismiss} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <Ionicons name="close" size={18} color="#888" />
      </TouchableOpacity>

      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <Ionicons name={config.icon} size={26} color={COLORS.primary} />
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.subtitle} numberOfLines={2}>{config.subtitle}</Text>
        </View>

        <TouchableOpacity style={styles.ctaButton} onPress={onPress} activeOpacity={0.8}>
          <Text style={styles.ctaText}>{config.ctaLabel}</Text>
        </TouchableOpacity>
      </View>

      {/* Step dots */}
      <View style={styles.dots}>
        {['location', 'profile', 'payment'].map((key) => (
          <View
            key={key}
            style={[styles.dot, prompt === key && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 110,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  dismissButton: {
    position: 'absolute',
    top: 10,
    right: 12,
    zIndex: 1,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 20,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#6a6a6a',
    lineHeight: 16,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    flexShrink: 0,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e0e0e0',
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 18,
  },
});

export default QuickOnboardingPrompt;
