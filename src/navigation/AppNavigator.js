import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import SplashScreen from '../screens/SplashScreen';
import SplashAlternative2Screen from '../screens/SplashAlternative2Screen';
import SplashAlternative3Screen from '../screens/SplashAlternative3Screen';
import LicenseAgreementScreen from '../screens/LicenseAgreementScreen';
import LegalAgreementsScreen from '../screens/LegalAgreementsScreen';
import PolicySelectionScreen from '../screens/PolicySelectionScreen';
import PolicyDetailScreen from '../screens/PolicyDetailScreen';
import ATTPromptScreen from '../screens/ATTPromptScreen';
import CookiesConsentScreen from '../screens/CookiesConsentScreen';
import CookieSettingsScreen from '../screens/CookieSettingsScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import SocialLoginScreen from '../screens/SocialLoginScreen';
import CreateAccountScreen from '../screens/CreateAccountScreen';
import PasswordGuidelinesScreen from '../screens/PasswordGuidelinesScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import AccountVerifiedScreen from '../screens/AccountVerifiedScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ForgotPasswordCheckEmailScreen from '../screens/ForgotPasswordCheckEmailScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import SearchScreen from '../screens/SearchScreen';
import FilterScreen from '../screens/FilterScreen';
import ActivityFilterScreen from '../screens/ActivityFilterScreen';
import CategoryFilterScreen from '../screens/CategoryFilterScreen';
import DistanceFilterScreen from '../screens/DistanceFilterScreen';
import PriceFilterScreen from '../screens/PriceFilterScreen';
import AllMembershipsScreen from '../screens/AllMembershipsScreen';
import GreenMembershipScreen from '../screens/GreenMembershipScreen';
import GoldMembershipScreen from '../screens/GoldMembershipScreen';
import VioletMembershipScreen from '../screens/VioletMembershipScreen';
import CartScreen from '../screens/CartScreen';
import PaymentMethodScreen from '../screens/PaymentMethodScreen';
import TransactionStatusScreen from '../screens/TransactionStatusScreen';
import MakeAnAdScreen from '../screens/MakeAnAdScreen';
import ChooseFiltersScreen from '../screens/ChooseFiltersScreen';
import ChooseRestFiltersScreen from '../screens/ChooseRestFiltersScreen';
import PreviewAdScreen from '../screens/PreviewAdScreen';
import AdPaymentMethodScreen from '../screens/AdPaymentMethodScreen';
import AdCartScreen from '../screens/AdCartScreen';
import AdTransactionScreen from '../screens/AdTransactionScreen';
import PublishAdScreen from '../screens/PublishAdScreen';

const Stack = createNativeStackNavigator();
 
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SearchScreen"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        {/* Onboarding Flow */}
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen}
          options={{
            animationEnabled: false,
          }}
        />
        <Stack.Screen
          name="SplashAlternative2"
          component={SplashAlternative2Screen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="SplashAlternative3"
          component={SplashAlternative3Screen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="LicenseAgreement"
          component={LicenseAgreementScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen 
          name="LegalAgreements" 
          component={LegalAgreementsScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen 
          name="PolicySelection" 
          component={PolicySelectionScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen 
          name="PolicyDetail" 
          component={PolicyDetailScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen 
          name="ATTPrompt" 
          component={ATTPromptScreen}
          options={{
            animationEnabled: true,
            presentation: 'transparentModal',
          }}
        />
        <Stack.Screen 
          name="CookiesConsent" 
          component={CookiesConsentScreen}
          options={{
            animationEnabled: true,
            presentation: 'transparentModal',
          }}
        />
        <Stack.Screen 
          name="CookieSettings" 
          component={CookieSettingsScreen}
          options={{
            animationEnabled: true,
          }}
        />

        {/* Registration Flow */}
        <Stack.Screen 
          name="Registration" 
          component={RegistrationScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen 
          name="SocialLogin" 
          component={SocialLoginScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen 
          name="CreateAccount" 
          component={CreateAccountScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen 
          name="PasswordGuidelines" 
          component={PasswordGuidelinesScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen 
          name="EmailVerification" 
          component={EmailVerificationScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen 
          name="AccountVerified" 
          component={AccountVerifiedScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="ForgotPasswordCheckEmail"
          component={ForgotPasswordCheckEmailScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="SearchScreen"
          component={SearchScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="FilterScreen"
          component={FilterScreen}
          options={{
            animationEnabled: true,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="ActivityFilter"
          component={ActivityFilterScreen}
          options={{
            animationEnabled: true,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="CategoryFilter"
          component={CategoryFilterScreen}
          options={{
            animationEnabled: true,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="DistanceFilter"
          component={DistanceFilterScreen}
          options={{
            animationEnabled: true,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="PriceFilter"
          component={PriceFilterScreen}
          options={{
            animationEnabled: true,
            presentation: 'modal',
          }}
        />

        {/* Membership Flow */}
        <Stack.Screen
          name="AllMemberships"
          component={AllMembershipsScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="GreenMembership"
          component={GreenMembershipScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="GoldMembership"
          component={GoldMembershipScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="VioletMembership"
          component={VioletMembershipScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="PaymentMethod"
          component={PaymentMethodScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="TransactionStatus"
          component={TransactionStatusScreen}
          options={{
            animationEnabled: true,
          }}
        />

        {/* Make an Ad Flow */}
        <Stack.Screen
          name="MakeAnAd"
          component={MakeAnAdScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="ChooseFilters"
          component={ChooseFiltersScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="ChooseRestFilters"
          component={ChooseRestFiltersScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="PreviewAd"
          component={PreviewAdScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="AdPaymentMethod"
          component={AdPaymentMethodScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="AdCart"
          component={AdCartScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="AdTransaction"
          component={AdTransactionScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="PublishAd"
          component={PublishAdScreen}
          options={{
            animationEnabled: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;