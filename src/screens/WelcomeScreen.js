import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import SafeScreenContainer from '../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../constants/theme';

const WelcomeScreen = ({ navigation }) => {
  const handleTryDemo = () => {
    console.log('Navigate to Demo');
    // Navigate to demo mode
  };

  const handleChoosePlan = () => {
    navigation.navigate('AllMemberships');
  };

  return (
    <SafeScreenContainer>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/Logo-main.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Welcome Title */}
        <Text style={styles.title}>Welcome to RoundBuy</Text>

        {/* Test Demo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test the Demosite</Text>
          <Text style={styles.sectionDescription}>
            Try the service in four test cities: London,{'\n'}Paris, New York and Tokyo
          </Text>
          
          <TouchableOpacity
            style={styles.demoButton}
            onPress={handleTryDemo}
          >
            <Text style={styles.demoButtonText}>Try the Demo</Text>
          </TouchableOpacity>
        </View>

        {/* Membership Plan Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select membership plan</Text>
          <Text style={styles.sectionDescription}>
            For safety, you must choose a plan to proceed
          </Text>
          
          <TouchableOpacity
            style={styles.planButton}
            onPress={handleChoosePlan}
          >
            <Text style={styles.planButtonText}>Choose Your Plan</Text>
          </TouchableOpacity>
        </View>

        {/* Copyright */}
        <Text style={styles.copyright}>
          © 2020-2025 RoundBuy Inc ®
        </Text>
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