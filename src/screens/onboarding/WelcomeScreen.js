import React from 'react';
import { IMAGES } from '../../assets/images';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';

const WelcomeScreen = ({ navigation }) => {
    const { t } = useTranslation();
  const handleTryDemo = () => {
    console.log('Navigate to Demo');
    navigation.navigate('Demo');
  };

  const handleChoosePlan = () => {
    navigation.navigate('AllMemberships');
  };

  const handlePatentInfo = () => {
    navigation.navigate('PatentPending');
  };

  return (
    <SafeScreenContainer>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Logo and Patent Info */}
        <View style={styles.logoContainer}>
          <Image
            source={IMAGES.logoMain}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.patentText}>{t('Patent Pending')}</Text>
          <TouchableOpacity onPress={handlePatentInfo}>
            <Text style={styles.infoLink}>
              for more information{' '}
              <Text style={styles.clickHere}>{t('click here')}</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Welcome Title */}
        <Text style={styles.title}>{t('Welcome to RoundBuy')}</Text>

        {/* Test Demo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Test the Demosite')}</Text>
          <Text style={styles.sectionDescription}>
            Try the service in four test cities: London,{'\n'}Paris, New York and Tokyo
          </Text>

          <TouchableOpacity
            style={styles.demoButton}
            onPress={handleTryDemo}
          >
            <Text style={styles.demoButtonText}>{t('Try the Demo')}</Text>
          </TouchableOpacity>
        </View>

        {/* Membership Plan Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Select membership plan')}</Text>
          <Text style={styles.sectionDescription}>{t('For safety, you must choose a plan to proceed')}</Text>

          <TouchableOpacity
            style={styles.planButton}
            onPress={handleChoosePlan}
          >
            <Text style={styles.planButtonText}>{t('Choose Your Plan')}</Text>
          </TouchableOpacity>
        </View>

        {/* Copyright */}
        <Text style={styles.copyright}>{t('© 2020-2026 RoundBuy Inc ®')}</Text>
      </ScrollView>
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: 'left',
    marginTop: 40,
    marginBottom: 30,
  },
  logo: {
    width: 160,
    height: 70,
  },
  patentText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 12,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  infoLink: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6a6a6a',
    letterSpacing: -0.1,
  },
  clickHere: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 50,
    letterSpacing: -0.3,
  },
  section: {
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  sectionDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6a6a6a',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
    letterSpacing: -0.1,
  },
  demoButton: {
    height: 54,
    backgroundColor: '#f5f5f5',
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1a1a1a',
    letterSpacing: 0.2,
  },
  planButton: {
    height: 54,
    backgroundColor: COLORS.primary,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  planButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  copyright: {
    fontSize: 11,
    fontWeight: '400',
    color: '#8a8a8a',
    textAlign: 'center',
    marginTop: 20,
    letterSpacing: -0.1,
  },
});

export default WelcomeScreen;