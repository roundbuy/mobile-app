import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
// Onboarding screens
import SplashScreen from '../screens/onboarding/SplashScreen';
import SplashAlternative2Screen from '../screens/onboarding/SplashAlternative2Screen';
import SplashAlternative3Screen from '../screens/onboarding/SplashAlternative3Screen';
import ATTPromptScreen from '../screens/onboarding/ATTPromptScreen';
import CookiesConsentScreen from '../screens/onboarding/CookiesConsentScreen';
import CookieSettingsScreen from '../screens/onboarding/CookieSettingsScreen';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';

// Legal screens
import LicenseAgreementScreen from '../screens/legal/LicenseAgreementScreen';
import LegalAgreementsScreen from '../screens/legal/LegalAgreementsScreen';
import PolicySelectionScreen from '../screens/legal/PolicySelectionScreen';
import PolicyDetailScreen from '../screens/legal/PolicyDetailScreen';

// Auth screens
import RegistrationScreen from '../screens/auth/RegistrationScreen';
import SocialLoginScreen from '../screens/auth/SocialLoginScreen';
import CreateAccountScreen from '../screens/auth/CreateAccountScreen';
import PasswordGuidelinesScreen from '../screens/auth/PasswordGuidelinesScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';
import AccountVerifiedScreen from '../screens/auth/AccountVerifiedScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ForgotPasswordCheckEmailScreen from '../screens/auth/ForgotPasswordCheckEmailScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

// Home/Search screens
import SearchScreen from '../screens/home/SearchScreen';
import FilterScreen from '../screens/home/FilterScreen';
import ActivityFilterScreen from '../screens/home/ActivityFilterScreen';
import CategoryFilterScreen from '../screens/home/CategoryFilterScreen';
import DistanceFilterScreen from '../screens/home/DistanceFilterScreen';
import PriceFilterScreen from '../screens/home/PriceFilterScreen';

// Membership screens
import AllMembershipsScreen from '../screens/memberships/AllMembershipsScreen';
import GreenMembershipScreen from '../screens/memberships/GreenMembershipScreen';
import GoldMembershipScreen from '../screens/memberships/GoldMembershipScreen';
import VioletMembershipScreen from '../screens/memberships/VioletMembershipScreen';

// Cart screens
import CartScreen from '../screens/cart/CartScreen';
import PaymentMethodScreen from '../screens/cart/PaymentMethodScreen';
import TransactionStatusScreen from '../screens/cart/TransactionStatusScreen';

// Advertisement screens
import MakeAnAdScreen from '../screens/advertisements/MakeAnAdScreen';
import ChooseFiltersScreen from '../screens/advertisements/ChooseFiltersScreen';
import ChooseRestFiltersScreen from '../screens/advertisements/ChooseRestFiltersScreen';
import PreviewAdScreen from '../screens/advertisements/PreviewAdScreen';
import AdPaymentMethodScreen from '../screens/advertisements/AdPaymentMethodScreen';
import AdCartScreen from '../screens/advertisements/AdCartScreen';
import AdTransactionScreen from '../screens/advertisements/AdTransactionScreen';
import PublishAdScreen from '../screens/advertisements/PublishAdScreen';

// Product screens
import ProductDetailsScreen from '../screens/products/ProductDetailsScreen';
import ProductChatScreen from '../screens/products/ProductChatScreen';

// User Account screens
import UserAccountScreen from '../screens/user-account/UserAccountScreen';
import PersonalInformationScreen from '../screens/user-account/personal-information/PersonalInformationScreen';
import PrivacyAccountScreen from '../screens/user-account/privacy-account/PrivacyAccountScreen';
import LoginSecurityScreen from '../screens/user-account/login-security/LoginSecurityScreen';
import ChangePasswordScreen from '../screens/user-account/login-security/ChangePasswordScreen';
import BillingPaymentsScreen from '../screens/user-account/billing-payments/BillingPaymentsScreen';
import LegalInfoScreen from '../screens/user-account/legal-info/LegalInfoScreen';
import CountrySettingsScreen from '../screens/user-account/country-settings/CountrySettingsScreen';
import CurrencySelectionScreen from '../screens/user-account/country-settings/CurrencySelectionScreen';
import LanguageSelectionScreen from '../screens/user-account/country-settings/LanguageSelectionScreen';
import CustomerSupportScreen from '../screens/user-account/customer-support/CustomerSupportScreen';
import HelpFAQScreen from '../screens/user-account/customer-support/HelpFAQScreen';
import ContactSupportScreen from '../screens/user-account/customer-support/ContactSupportScreen';
import NotificationsScreen from '../screens/user-account/notifications/NotificationsScreen';
import NotificationsListScreen from '../screens/user-account/notifications/NotificationsListScreen';
import CreateSearchNotificationScreen from '../screens/user-account/notifications/CreateSearchNotificationScreen';
import NotificationSettingsScreen from '../screens/user-account/notifications/NotificationSettingsScreen';

// User Settings screens
import ManageOffersScreen from '../screens/user-settings/manage-offers/ManageOffersScreen';
import ReceivedOffersScreen from '../screens/user-settings/manage-offers/ReceivedOffersScreen';
import AcceptedOffersScreen from '../screens/user-settings/manage-offers/AcceptedOffersScreen';
import DeclinedOffersScreen from '../screens/user-settings/manage-offers/DeclinedOffersScreen';
import MakeCounterofferScreen from '../screens/user-settings/manage-offers/MakeCounterofferScreen';
import MakeAnOfferScreen from '../screens/user-settings/manage-offers/MakeAnOfferScreen';
import MyAdsScreen from '../screens/user-settings/my-ads/MyAdsScreen';
import MyAdsDetailScreen from '../screens/user-settings/my-ads/MyAdsDetailScreen';
import PurchaseVisibilityScreen from '../screens/user-settings/purchase-visibility/PurchaseVisibilityScreen';
import PurchaseVisibilityAdsListScreen from '../screens/user-settings/purchase-visibility/PurchaseVisibilityAdsListScreen';
import VisibilityAdChoicesScreen from '../screens/user-settings/purchase-visibility/VisibilityAdChoicesScreen';
import VisibilityCartScreen from '../screens/user-settings/purchase-visibility/VisibilityCartScreen';
import VisibilityPaymentScreen from '../screens/user-settings/purchase-visibility/VisibilityPaymentScreen';
import VisibilityTransactionSuccessScreen from '../screens/user-settings/purchase-visibility/VisibilityTransactionSuccessScreen';
import DefaultLocationScreen from '../screens/user-settings/location/DefaultLocationScreen';
import SetLocationMapScreen from '../screens/user-settings/location/SetLocationMapScreen';
import FeedbacksScreen from '../screens/user-settings/feedbacks/FeedbacksScreen';
import MyFeedbacksScreen from '../screens/user-settings/feedbacks/MyFeedbacksScreen';
import GiveFeedbackListScreen from '../screens/user-settings/feedbacks/GiveFeedbackListScreen';
import GiveFeedbackFormScreen from '../screens/user-settings/feedbacks/GiveFeedbackFormScreen';
import FeedbackStatusScreen from '../screens/user-settings/feedbacks/FeedbackStatusScreen';
import FavouritesScreen from '../screens/user-settings/favourites/FavouritesScreen';
import RewardsScreen from '../screens/user-settings/rewards/RewardsScreen';
import RewardCategoryDetailScreen from '../screens/user-settings/rewards/RewardCategoryDetailScreen';
import EarnMembershipDetailsScreen from '../screens/user-settings/membership/EarnMembershipDetailsScreen';
import ReferralCodeScreen from '../screens/user-settings/rewards/ReferralCodeScreen';
import ReferralStatusScreen from '../screens/user-settings/rewards/ReferralStatusScreen';
import RedeemRewardScreen from '../screens/user-settings/rewards/RedeemRewardScreen';
import RewardSuccessScreen from '../screens/user-settings/rewards/RewardSuccessScreen';
import ReviewScreen from '../screens/user-settings/review/ReviewScreen';
import ReviewRoundBuyScreen from '../screens/user-settings/review/ReviewRoundBuyScreen';
import ReviewAppFormScreen from '../screens/user-settings/review/ReviewAppFormScreen';
import ReviewSiteFormScreen from '../screens/user-settings/review/ReviewSiteFormScreen';
import AppReviewsScreen from '../screens/user-settings/review/AppReviewsScreen';
import SiteReviewsScreen from '../screens/user-settings/review/SiteReviewsScreen';
import ShareScreen from '../screens/user-settings/share/ShareScreen';

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
        <Stack.Screen
          name="ProductDetails"
          component={ProductDetailsScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="ProductChat"
          component={ProductChatScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="UserAccount"
          component={UserAccountScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="PersonalInformation"
          component={PersonalInformationScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="PrivacyAccount"
          component={PrivacyAccountScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="LoginSecurity"
          component={LoginSecurityScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePasswordScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="BillingPayments"
          component={BillingPaymentsScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="LegalInfo"
          component={LegalInfoScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="CountrySettings"
          component={CountrySettingsScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="CurrencySelection"
          component={CurrencySelectionScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="LanguageSelection"
          component={LanguageSelectionScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="CustomerSupport"
          component={CustomerSupportScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="HelpFAQ"
          component={HelpFAQScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="ContactSupport"
          component={ContactSupportScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="NotificationsList"
          component={NotificationsListScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="CreateSearchNotification"
          component={CreateSearchNotificationScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="NotificationSettings"
          component={NotificationSettingsScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="ManageOffers"
          component={ManageOffersScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="ReceivedOffers"
          component={ReceivedOffersScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="AcceptedOffers"
          component={AcceptedOffersScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="DeclinedOffers"
          component={DeclinedOffersScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="MakeCounteroffer"
          component={MakeCounterofferScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="MakeAnOffer"
          component={MakeAnOfferScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="MyAds"
          component={MyAdsScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="MyAdsDetail"
          component={MyAdsDetailScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="PurchaseVisibility"
          component={PurchaseVisibilityScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="PurchaseVisibilityAdsList"
          component={PurchaseVisibilityAdsListScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="VisibilityAdChoices"
          component={VisibilityAdChoicesScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="VisibilityCart"
          component={VisibilityCartScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="VisibilityPayment"
          component={VisibilityPaymentScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="VisibilityTransactionSuccess"
          component={VisibilityTransactionSuccessScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="DefaultLocation"
          component={DefaultLocationScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="SetLocationMap"
          component={SetLocationMapScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="Feedbacks"
          component={FeedbacksScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="MyFeedbacks"
          component={MyFeedbacksScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="GiveFeedbackList"
          component={GiveFeedbackListScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="GiveFeedbackForm"
          component={GiveFeedbackFormScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="FeedbackStatus"
          component={FeedbackStatusScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="Favourites"
          component={FavouritesScreen}
          options={{
            animationEnabled: true,
          }}
        />

        {/* Rewards Flow */}
        <Stack.Screen
          name="Rewards"
          component={RewardsScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="RewardCategoryDetail"
          component={RewardCategoryDetailScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="EarnMembershipDetails"
          component={EarnMembershipDetailsScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="ReferralCode"
          component={ReferralCodeScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="ReferralStatus"
          component={ReferralStatusScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="RedeemReward"
          component={RedeemRewardScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="RewardSuccess"
          component={RewardSuccessScreen}
          options={{
            animationEnabled: true,
          }}
        />

        {/* Review Flow */}
        <Stack.Screen
          name="Review"
          component={ReviewScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="ReviewRoundBuy"
          component={ReviewRoundBuyScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="ReviewAppForm"
          component={ReviewAppFormScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="ReviewSiteForm"
          component={ReviewSiteFormScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="AppReviews"
          component={AppReviewsScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="SiteReviews"
          component={SiteReviewsScreen}
          options={{
            animationEnabled: true,
          }}
        />

        {/* Share Screen */}
        <Stack.Screen
          name="Share"
          component={ShareScreen}
          options={{
            animationEnabled: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;