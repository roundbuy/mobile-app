import React from 'react';
import { IMAGES } from '../../assets/images';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';
import { ONBOARDING_THEME } from '../../constants/theme';
import OnboardingModal from '../../components/onboarding/OnboardingModal';
import Hyperlink from '../../components/common/Hyperlink';

// Placeholder images
const PRODUCT_IMAGES = [
  'https://cdn-icons-png.flaticon.com/512/892/892458.png', // Shopping
  'https://cdn-icons-png.flaticon.com/512/681/681494.png', // Jacket
  'https://cdn-icons-png.flaticon.com/512/833/833472.png', // Bag
  'https://cdn-icons-png.flaticon.com/512/124/124034.png', // Ball
  'https://cdn-icons-png.flaticon.com/512/681/681494.png', // Boots
  'https://cdn-icons-png.flaticon.com/512/892/892458.png', // Baby Bottle
];

const WelcomeScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  // Extract userEmail from route params to pass it forward
  const { userEmail } = route.params || {};

  /* User requested onboarding to NOT open automatically. 
     Keeping the check for route params but ensuring it defaults to false or only logic to true if explicitly passed AND desired. 
     User said: "now on welcome screen it open automatic" -> implying current behavior is unwanted.
     So forcing false default. 
  */
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const handleTryDemo = () => {
    console.log('Navigate to Demo');
    navigation.navigate('Demo');
  };

  const handleChoosePlan = () => {
    navigation.navigate('AllMemberships', { userEmail });
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
        {/* <View style={styles.logoContainer}>
          <Image
            source={IMAGES.logoMain}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.patentText}>{t('Patents Pending')}</Text>
          <Hyperlink
            onPress={handlePatentInfo}
            linkKey="welcome_patents"
            style={[styles.infoLink, { color: ONBOARDING_THEME.colors.link }]}
          >
            {t('Read more about')} {t('patents')}
          </Hyperlink>
        </View> */}

        {/* Top Section: Split View 3 Columns */}
        <View style={styles.topSection}>
          {/* Column 1: Info + 1 Image + Demo */}
          <View style={styles.column1}>
            <View style={styles.infoContainer}>

              <Text style={styles.greenTitle}>{t('Make Future Green!')}</Text>
              <Text style={styles.greenSubtitle}>{t('Find out what we offer to you?')}</Text>

              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• {t('Lorem ipsum')}</Text>
                <Text style={styles.listItem}>• {t('Lorem ipsum')}</Text>
                <Text style={styles.listItem}>• {t('Lorem ipsum')}</Text>
              </View>

              <TouchableOpacity
                style={styles.findOutButton}
                onPress={() => setShowOnboarding(true)}
              >
                <Text style={styles.findOutButtonText}>{t('Find out!')}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ marginTop: 250 }}>
              {/* Red Bag Image */}
              <View style={styles.productCard}>
                <Image source={{ uri: PRODUCT_IMAGES[2] }} style={styles.productImage} />
              </View>

              <Hyperlink
                onPress={handleTryDemo}
                linkKey="welcome_demo"
                containerStyle={{ marginTop: 10 }}
                style={styles.demoLinkBlue}
                unvisitedColor="#0056b3"
              >
                Try the Demo
              </Hyperlink>
            </View>
          </View>

          {/* Column 2: 2 Vertical Images */}
          <View style={styles.column2}>
            <View style={styles.productCard}>
              <Image source={{ uri: PRODUCT_IMAGES[0] }} style={styles.productImage} />
            </View>
            <View style={styles.productCard}>
              <Image source={{ uri: PRODUCT_IMAGES[1] }} style={styles.productImage} />
            </View>
          </View>

          {/* Column 3: 3 Vertical Images */}
          <View style={styles.column3}>
            <View style={styles.productCard}>
              <Image source={{ uri: PRODUCT_IMAGES[3] }} style={styles.productImage} />
            </View>
            <View style={styles.productCard}>
              <Image source={{ uri: PRODUCT_IMAGES[4] }} style={styles.productImage} />
            </View>
            <View style={styles.productCard}>
              <Image source={{ uri: PRODUCT_IMAGES[5] }} style={styles.productImage} />
            </View>
          </View>
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



        <OnboardingModal
          visible={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          tourId="welcome_tour"
          onFinish={() => {
            setShowOnboarding(false);
            navigation.navigate('AllMemberships', { userEmail });
          }}
          title="RoundBuy"
          slides={[
            {
              title: 'Onboard 1',
              heading: 'Welcome Location',
              description: 'Location: Lorem ipsum dolores est. Lorem ipsum dolores est. Default location is your... Product location...',
              // Image can be added if assets exist
            },
            {
              title: 'Onboard 2',
              heading: 'Create Listings',
              description: 'Listing: Lorem ipsum dolores est. Lorem ipsum dolores est.'
            },
            {
              title: 'Onboard 3',
              heading: 'Start Shopping',
              description: 'Shopping: Lorem ipsum dolores est. Lorem ipsum dolores est. Sell & Buy around you. Up to 5 locations.'
            },
            {
              title: 'Onboard 4',
              heading: 'Schedule Exchanges',
              description: 'Schedule Exchange: Lorem ipsum dolores est. Lorem ipsum dolores est.'
            },
            {
              title: 'Onboard 5',
              heading: 'Flexible Pickup',
              description: 'Pick it Up Yourself: Lorem ipsum dolores est. Lorem ipsum dolores est.',
              buttonText: 'Choose your plan'
            }
          ]}
        />

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
    paddingHorizontal: 20,
  },
  topSection: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
  },
  column1: {
    flex: 1,
    alignItems: 'flex-start',
  },
  column2: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 30,
    paddingTop: 140,
  },
  column3: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
  },
  demoLink: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginTop: 5,
  },
  demoLinkBlue: {
    color: '#0056b3',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  productCard: {
    width: 100,
    height: 160,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  productImage: {
    width: 100,
    height: 160,
    resizeMode: 'contain',
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
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  section: {
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 5,
    letterSpacing: -0.3,
  },
  sectionDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6a6a6a',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 5,
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
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  learnBasicsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 10,
  },
  learnBasicsSubtitle: {
    fontSize: 14,
    color: '#7CB342', // Light green
    textAlign: 'center',
    marginBottom: 10,
  },
  startNowText: {
    fontSize: 16,
    color: '#2196F3',
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginBottom: 20,
    fontWeight: '600',
  },
  infoContainer: {
    position: 'absolute',
    top: 0,
    width: 200,
    left: 0,
    right: 0,
    bottom: 0,
  },
  findOutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00a82d', // Darker Green
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  findOutSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#76ff03', // Lighter Green / Lime
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  findOutButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: '#eee',
    width: '25%',
    alignItems: 'center',
    justifyContent: 'center',

  },
  findOutButtonText: {
    fontSize: 15,
    color: '#0056b3', // Blue text
    fontWeight: '600',
  },
  greenTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#7BFB2D',
    marginBottom: 5,
    lineHeight: 26,
  },
  greenSubtitle: {
    fontSize: 13,
    color: '#7BFB2D',
    marginBottom: 10,
    fontWeight: '700',
  },
  listContainer: {
    marginBottom: 15,
  },
  listItem: {
    fontSize: 13,
    color: '#7BFB2D',
    marginBottom: 2,
    fontWeight: '600',
  },
  findOutButton: {
    backgroundColor: '#7BFB2D',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
    width: '110',
  },
  findOutButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
});

export default WelcomeScreen;