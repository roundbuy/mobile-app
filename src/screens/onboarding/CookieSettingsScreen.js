import React, { useState } from 'react';
import { IMAGES } from '../../assets/images';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Image, ScrollView } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../../constants/theme';

const CookieSettingsScreen = ({ navigation }) => {
  const [necessary, setNecessary] = useState(true); // Always on
  const [functional, setFunctional] = useState(false);
  const [performance, setPerformance] = useState(false);
  const [advertising, setAdvertising] = useState(false);

  const handleSaveChoices = () => {
    console.log('Cookie preferences saved:', {
      necessary,
      functional,
      performance,
      advertising,
    });
    navigation.goBack();
  };

  const CookieOption = ({ title, description, value, onValueChange, disabled }) => (
    <View style={styles.cookieSection}>
      <View style={styles.cookieHeader}>
        <Text style={styles.cookieTitle}>{title}</Text>
        <View style={styles.cookieRight}>
          <Switch
            value={value}
            onValueChange={onValueChange}
            disabled={disabled}
            trackColor={{ false: '#d1d1d6', true: COLORS.primary }}
            thumbColor='#ffffff'
            ios_backgroundColor="#d1d1d6"
          />
          <Text style={styles.arrow}>›</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <Text style={styles.cookieDescription}>{description}</Text>
    </View>
  );

  return (
    <SafeScreenContainer>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image
            source={IMAGES.logoMain}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Cookies settings</Text>

        {/* Description */}
        <Text style={styles.description}>
          We would like your permission to use your data for the following purposes:
        </Text>

        {/* Cookie Options */}
        <CookieOption
          title="Necessary"
          description="These cookies are required for good functionality of our service and can't be switched off in our system."
          value={necessary}
          disabled={true}
        />

        <CookieOption
          title="Performance"
          description="We use these cookies to provide statistical information about our website - they are used for performance measurement and improvement."
          value={performance}
          onValueChange={setPerformance}
        />

        <CookieOption
          title="Functional"
          description="We use these cookies to enhance functionality and allow for personalisation, such as live chats, videos and the use of social media."
          value={functional}
          onValueChange={setFunctional}
        />

        <CookieOption
          title="Advertising"
          description="These cookies are set through our site by our advertising partners."
          value={advertising}
          onValueChange={setAdvertising}
        />

        {/* View All Partners */}
        <TouchableOpacity style={styles.viewPartnersButton}>
          <Text style={styles.viewPartnersText}>View All Partners</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveChoices}
        >
          <Text style={styles.saveButtonText}>Save my Choices</Text>
        </TouchableOpacity>
      </View>
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 10,
    marginTop: 10,
  },
  logo: {
    width: 140,
    height: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000ff',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000ff',
    marginBottom: 4,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  cookieSection: {
    marginBottom: 2,
  },
  cookieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  cookieTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    letterSpacing: -0.2,
  },
  cookieRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrow: {
    fontSize: 24,
    fontWeight: '400',
    color: '#000000ff',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 8,
    marginBottom: 1,
  },
  cookieDescription: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000ff',
    lineHeight: 19,
    letterSpacing: -0.1,
  },
  viewPartnersButton: {
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  viewPartnersText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000ff',
    letterSpacing: -0.1,
  },
  footer: {
    paddingTop: 16,
    paddingBottom: 2,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  saveButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
});

export default CookieSettingsScreen;