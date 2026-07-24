import React from 'react';
import { IMAGES } from '../../assets/images';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS, SPACING } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';
import OnboardingModal from '../../components/onboarding/OnboardingModal';
import Hyperlink from '../../components/common/Hyperlink';

const { width } = Dimensions.get('window');

// Placeholder images since no assets were provided
const PRODUCT_IMAGES = [
  'https://cdn-icons-png.flaticon.com/512/892/892458.png', // Shopping
  'https://cdn-icons-png.flaticon.com/512/681/681494.png', // Jacket
  'https://cdn-icons-png.flaticon.com/512/833/833472.png', // Bag
  'https://cdn-icons-png.flaticon.com/512/124/124034.png', // Ball
  'https://cdn-icons-png.flaticon.com/512/681/681494.png', // Boots
  'https://cdn-icons-png.flaticon.com/512/892/892458.png', // Baby Bottle
];

const RegistrationScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  const handleSignIn = () => {
    navigation.navigate('SocialLogin');
  };

  const handleRegister = () => {
    navigation.navigate('CreateAccount');
  };

  const handleTestDemo = () => {
    navigation.navigate('Demo');
  };

  return (
    <SafeScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Section: Split View 3 Columns */}
        <View style={styles.topSection}>
          {/* Column 1: Info + 1 Image + Demo */}
          <View style={styles.column1}>
            <View style={styles.infoContainer}>

              <Text style={styles.greenTitle}>{t('Make Future Green!')}</Text>
              <Text style={styles.greenSubtitle}>{t('Find out what we offer to you?')}</Text>

              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• {t('Buy & sell second-hand locally')}</Text>
                <Text style={styles.listItem}>• {t('Reduce waste, protect the planet')}</Text>
                <Text style={styles.listItem}>• {t('Connect with buyers near you')}</Text>
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
                onPress={handleTestDemo}
                linkKey="registration_demo"
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

        {/* Middle Heading */}
        <Text style={styles.mainHeading}>{t('Sell & Buy second-hand\naround you fast')}</Text>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
              <Text style={styles.signInButtonText}>{t('Sign in')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerButtonText}>{t('Register')}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.businessLink}
            onPress={() => navigation.navigate('BusinessCreateAccount')}
          >
            <Text style={styles.businessLinkText}>{t('Pro Seller & Business Ads')}</Text>
          </TouchableOpacity>

          <Text style={styles.copyright}>{t('© 2020-2026 RoundBuy Inc ®')}</Text>
        </View>

        <OnboardingModal
          visible={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          tourId="registration_tour"
          onFinish={() => {
            setShowOnboarding(false);
            navigation.navigate('CreateAccount');
          }}
          title="Registration"
          slides={[
            {
              title: 'Onboard 1',
              heading: 'Location Benefits',
              description: 'RoundBuy connects you with buyers and sellers in your neighbourhood. Your location helps surface the most relevant listings right around you.',
              list: ['Shop locally, save on delivery', 'Find items available today', 'Support your local community'],
            },
            {
              title: 'Onboard 2',
              heading: 'Listing Features',
              description: 'Selling is quick and easy. Create a listing in under a minute — add photos, a description, and your asking price.',
              list: ['List in under 60 seconds', 'Reach local buyers instantly', 'Manage all your listings in one place'],
            },
            {
              title: 'Onboard 3',
              heading: 'Our Mission',
              description: 'RoundBuy is built to extend the life of everyday items. Every second-hand sale is a step toward a more sustainable future.',
              buttonText: 'Sign Up now!',
            }
          ]}
        />
      </ScrollView>
    </SafeScreenContainer >
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    paddingTop: 40,
  },
  topSection: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center', // Top alignment
    gap: 10,
  },
  // Column 1 styles
  column1: {
    flex: 1, // Wider for text
    // paddingRight: 10,
    alignItems: 'flex-start',
  },
  // Column 2 styles
  column2: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 30, // Vertical gap
    paddingTop: 140, // Offset
  },
  // Column 3 styles
  column3: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40, // Offset
    // gap: 10, // Vertical gap
    // marginTop: -20, // Negative margin to start higher or offset differently? Or just 0.
    // Let's assume standard alignment but maybe different gap or starting point?
    // Screenshot shows staggered. Column 2 starts lower than Column 3?
    // User said "column 2 middle vertical" and "column 3 middle vertical".
    // I'll align them top for now with gaps.
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
  mainHeading: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 30,
    paddingHorizontal: 10,
  },
  footer: {
    marginTop: 'auto',
    width: '100%',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 30,
    width: '100%',
    justifyContent: 'center',
  },
  signInButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    minWidth: 120,
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#0056b3',
    fontSize: 18,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#001C64',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  businessLink: {
    marginBottom: 16,
  },
  businessLinkText: {
    fontSize: 14,
    color: '#0056b3',
    textDecorationLine: 'underline',
    fontWeight: '500',
    textAlign: 'center',
  },
  copyright: {
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  infoContainer: {
    position: 'absolute',
    top: 0,
    width: '200',
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default RegistrationScreen;