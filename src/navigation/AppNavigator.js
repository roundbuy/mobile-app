import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Import screens
// Onboarding screens
import SplashScreen from '../screens/onboarding/SplashScreen';
import SplashAlternative2Screen from '../screens/onboarding/SplashAlternative2Screen';
import SplashAlternative3Screen from '../screens/onboarding/SplashAlternative3Screen';
import ATTPromptScreen from '../screens/onboarding/ATTPromptScreen';
import NotificationPermissionScreen from '../screens/onboarding/NotificationPermissionScreen';
import CookiesConsentScreen from '../screens/onboarding/CookiesConsentScreen';
import CookieSettingsScreen from '../screens/onboarding/CookieSettingsScreen';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import RoundBuyInfoScreen from '../screens/onboarding/RoundBuyInfoScreen';
import OnboardingDemoScreen from '../screens/onboarding/DemoScreen';
import LaunchOnboardingScreen from '../screens/onboarding/LaunchOnboardingScreen';

// Legal screens
import LicenseAgreementScreen from '../screens/legal/LicenseAgreementScreen';
import LegalAgreementsScreen from '../screens/legal/LegalAgreementsScreen';
import PolicySelectionScreen from '../screens/legal/PolicySelectionScreen';
import PolicyDetailScreen from '../screens/legal/PolicyDetailScreen';
import PatentPendingScreen from '../screens/legal/PatentPendingScreen';
import PolicyUpdatesScreen from '../screens/legal/PolicyUpdatesScreen';

// Auth screens
import RegistrationScreen from '../screens/auth/RegistrationScreen';
import SocialLoginScreen from '../screens/auth/SocialLoginScreen';
import CreateAccountScreen from '../screens/auth/CreateAccountScreen';
import BusinessCreateAccountScreen from '../screens/auth/BusinessCreateAccountScreen';
import BusinessVerificationScreen from '../screens/auth/BusinessVerificationScreen';
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
import ServiceListScreen from '../screens/home/ServiceListScreen';
import ServiceDetailsScreen from '../screens/products/ServiceDetailsScreen';

// Demo screen
import DemoScreen from '../screens/demo/DemoScreen';
import DemoProductDetailsScreen from '../screens/demo/DemoProductDetailsScreen';

// Membership screens
import AllMembershipsScreen from '../screens/memberships/AllMembershipsScreen';
import GreenMembershipScreen from '../screens/memberships/GreenMembershipScreen';
import GoldMembershipScreen from '../screens/memberships/GoldMembershipScreen';
import VioletMembershipScreen from '../screens/memberships/VioletMembershipScreen';

// Cart screens
import CartScreen from '../screens/cart/CartScreen';
import PaymentMethodScreen from '../screens/cart/PaymentMethodScreen';
import TransactionStatusScreen from '../screens/cart/TransactionStatusScreen';

// Payment screens
// import PaddlePaymentScreen from '../screens/payments/PaddlePaymentScreen';

// Advertisement screens
import MakeAnAdScreen from '../screens/advertisements/MakeAnAdScreen';
import ChooseFiltersScreen from '../screens/advertisements/ChooseFiltersScreen';
import ChooseRestFiltersScreen from '../screens/advertisements/ChooseRestFiltersScreen';
import PreviewAdScreen from '../screens/advertisements/PreviewAdScreen';
import AdCreationSuccessScreen from '../screens/advertisements/AdCreationSuccessScreen';
import AdPaymentMethodScreen from '../screens/advertisements/AdPaymentMethodScreen';
import AdCartScreen from '../screens/advertisements/AdCartScreen';
import AdTransactionScreen from '../screens/advertisements/AdTransactionScreen';
import PublishAdScreen from '../screens/advertisements/PublishAdScreen';
import SellServiceScreen from '../screens/advertisements/SellServiceScreen';
import MyServicesScreen from '../screens/user-settings/purchase-visibility/MyServicesScreen';

// Product screens
import ProductDetailsScreen from '../screens/products/ProductDetailsScreen';
import ProductChatScreen from '../screens/products/ProductChatScreen';
import UserListingsScreen from '../screens/products/UserListingsScreen';
import UserFeedbacksScreen from '../screens/products/UserFeedbacksScreen';

// Messages screens
import ConversationsListScreen from '../screens/messages/ConversationsListScreen';

// User Account screens
import UserAccountScreen from '../screens/user-account/UserAccountScreen';
import PersonalInformationScreen from '../screens/user-account/personal-information/PersonalInformationScreen';
import PrivacyAccountScreen from '../screens/user-account/privacy-account/PrivacyAccountScreen';
import ATTTrackingSettingsScreen from '../screens/user-account/privacy-account/ATTTrackingSettingsScreen';
import ConfirmAccessRightsScreen from '../screens/user-account/privacy-account/ConfirmAccessRightsScreen';
import PrivacyEmailVerificationScreen from '../screens/user-account/privacy-account/PrivacyEmailVerificationScreen';
import AccessRightsConfirmationScreen from '../screens/user-account/privacy-account/AccessRightsConfirmationScreen';
import DataRequestFormScreen from '../screens/user-account/privacy-account/DataRequestFormScreen';
import LoginSecurityScreen from '../screens/user-account/login-security/LoginSecurityScreen';
import ChangePasswordScreen from '../screens/user-account/login-security/ChangePasswordScreen';
import EditUsernameScreen from '../screens/user-account/login-security/EditUsernameScreen';
import BillingPaymentsScreen from '../screens/user-account/billing-payments/BillingPaymentsScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import WalletTopupScreen from '../screens/wallet/WalletTopupScreen';
import WalletTransactionsScreen from '../screens/wallet/WalletTransactionsScreen';
import WalletWithdrawalScreen from '../screens/wallet/WalletWithdrawalScreen';
import LegalInfoScreen from '../screens/user-account/legal-info/LegalInfoScreen';
import CountrySettingsScreen from '../screens/user-account/country-settings/CountrySettingsScreen';
import MeasurementSettingsScreen from '../screens/user-account/MeasurementSettingsScreen';
import InterestScreen from '../screens/user-account/interests/InterestScreen';
import CurrencySelectionScreen from '../screens/user-account/country-settings/CurrencySelectionScreen';
import LanguageSelectionScreen from '../screens/user-account/country-settings/LanguageSelectionScreen';
import CountrySelectionScreen from '../screens/user-account/country-settings/CountrySelectionScreen';
import CustomerSupportScreen from '../screens/user-account/customer-support/CustomerSupportScreen';
import HelpFAQScreen from '../screens/user-account/customer-support/HelpFAQScreen';
import FAQSubCategoriesScreen from '../screens/user-account/customer-support/FAQSubCategoriesScreen';
import FAQListScreen from '../screens/user-account/customer-support/FAQListScreen';
import ContactSupportScreen from '../screens/user-account/customer-support/ContactSupportScreen';
import NotificationsScreen from '../screens/user-account/notifications/NotificationsScreen';
import NotificationsListScreen from '../screens/user-account/notifications/NotificationsListScreen';
import CreateSearchNotificationScreen from '../screens/user-account/notifications/CreateSearchNotificationScreen';
import NotificationSettingsScreen from '../screens/user-account/notifications/NotificationSettingsScreen';
import NotificationCenterScreen from '../screens/notifications/NotificationCenterScreen';

// User Settings screens
import ManageOffersScreen from '../screens/user-settings/manage-offers/ManageOffersScreen';
import OfferHistoryScreen from '../screens/user-settings/manage-offers/OfferHistoryScreen';
import ReceivedOffersScreen from '../screens/user-settings/manage-offers/ReceivedOffersScreen';
import AcceptedOffersScreen from '../screens/user-settings/manage-offers/AcceptedOffersScreen';
import DeclinedOffersScreen from '../screens/user-settings/manage-offers/DeclinedOffersScreen';
import MakeCounterofferScreen from '../screens/user-settings/manage-offers/MakeCounterofferScreen';
import MakeAnOfferScreen from '../screens/user-settings/manage-offers/MakeAnOfferScreen';

// Pickup screens
import SchedulePickUpScreen from '../screens/pickups/SchedulePickUpScreen';
import PickUpExchangeScreen from '../screens/pickups/PickUpExchangeScreen';
import PickUpStatusScreen from '../screens/pickups/PickUpStatusScreen';
import UnpaidPickUpFeesScreen from '../screens/pickups/UnpaidPickUpFeesScreen';
import PaidPickUpFeesScreen from '../screens/pickups/PaidPickUpFeesScreen';
import ScheduledPickUpDetailScreen from '../screens/pickups/ScheduledPickUpDetailScreen';
import PickUpPaymentScreen from '../screens/pickups/PickUpPaymentScreen';
import ReschedulePickUpScreen from '../screens/pickups/ReschedulePickUpScreen';
import MyAdsScreen from '../screens/user-settings/my-ads/MyAdsScreen';
import MyServicesListScreen from '../screens/user-settings/my-ads/MyServicesListScreen';
import MyAdsDetailScreen from '../screens/user-settings/my-ads/MyAdsDetailScreen';
import EditAdLocationsScreen from '../screens/user-settings/my-ads/EditAdLocationsScreen';
import ExtensionShopScreen from '../screens/user-settings/purchase-visibility/ExtensionShopScreen';
import PurchaseVisibilityScreen from '../screens/user-settings/purchase-visibility/PurchaseVisibilityScreen';
import PurchaseVisibilityAdsListScreen from '../screens/user-settings/purchase-visibility/PurchaseVisibilityAdsListScreen';
import VisibilityAdChoicesScreen from '../screens/user-settings/purchase-visibility/VisibilityAdChoicesScreen';
import ShowcaseProductSelectorScreen from '../screens/user-settings/purchase-visibility/ShowcaseProductSelectorScreen';
import VisibilityCartScreen from '../screens/user-settings/purchase-visibility/VisibilityCartScreen';
import VisibilityPaymentScreen from '../screens/user-settings/purchase-visibility/VisibilityPaymentScreen';
import ExtensionCheckoutScreen from '../screens/user-settings/purchase-visibility/ExtensionCheckoutScreen';
import ExtensionLocationsScreen from '../screens/user-settings/purchase-visibility/ExtensionLocationsScreen';
import ExtensionSocialClubsScreen from '../screens/user-settings/purchase-visibility/ExtensionSocialClubsScreen';
import ExtensionBoostsScreen from '../screens/user-settings/purchase-visibility/ExtensionBoostsScreen';
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
import MyMembershipScreen from '../screens/user-settings/membership/MyMembershipScreen';
import ReferralCodeScreen from '../screens/user-settings/rewards/ReferralCodeScreen';
import ReferralStatusScreen from '../screens/user-settings/rewards/ReferralStatusScreen';
import RedeemRewardScreen from '../screens/user-settings/rewards/RedeemRewardScreen';
import RewardSuccessScreen from '../screens/user-settings/rewards/RewardSuccessScreen';
import LotteryWinnersScreen from '../screens/user-settings/rewards/LotteryWinnersScreen';
import LotteryCreditStatusScreen from '../screens/user-settings/rewards/LotteryCreditStatusScreen';
import LotteryGuideScreen from '../screens/user-settings/rewards/LotteryGuideScreen';
import MostPopularSearchesScreen from '../screens/user-settings/rewards/MostPopularSearchesScreen';
import RewardsLevelScreen from '../screens/user-settings/rewards/RewardsLevelScreen';
import RewardLevelDetailScreen from '../screens/user-settings/rewards/RewardLevelDetailScreen';
import ReviewScreen from '../screens/user-settings/review/ReviewScreen';
import ReviewRoundBuyScreen from '../screens/user-settings/review/ReviewRoundBuyScreen';
import ReviewAppFormScreen from '../screens/user-settings/review/ReviewAppFormScreen';
import ReviewSiteFormScreen from '../screens/user-settings/review/ReviewSiteFormScreen';
import AppReviewsScreen from '../screens/user-settings/review/AppReviewsScreen';
import SiteReviewsScreen from '../screens/user-settings/review/SiteReviewsScreen';
import ShareScreen from '../screens/user-settings/share/ShareScreen';
import SuggestionScreen from '../screens/suggestions/SuggestionScreen';
import SuggestionSuccessScreen from '../screens/suggestions/SuggestionSuccessScreen';

// Resolution Center screens
import ResolutionCenterHomeScreen from '../screens/resolution-center/ResolutionCenterHomeScreen';
import DisputeListScreen from '../screens/resolution-center/DisputeListScreen';
import DisputeCategoryScreen from '../screens/resolution-center/DisputeCategoryScreen';
import SelectProductScreen from '../screens/resolution-center/SelectProductScreen';
import SelectProblemScreen from '../screens/resolution-center/SelectProblemScreen';
import ReviewEligibilityScreen from '../screens/resolution-center/ReviewEligibilityScreen';
import DisputeConfirmationScreen from '../screens/resolution-center/DisputeConfirmationScreen';
import DisputeMessagingScreen from '../screens/resolution-center/DisputeMessagingScreen';

// Buyer-Seller Process screens
import ActionCenterScreen from '../screens/buyer-seller-process/ActionCenterScreen';
import ActionCenterMessagesScreen from '../screens/buyer-seller-process/ActionCenterMessagesScreen';
import InboxScreen from '../screens/buyer-seller-process/InboxScreen';
import Step1EnquiryScreen from '../screens/buyer-seller-process/Step1EnquiryScreen';
import ChatUploadImagesScreen from '../screens/buyer-seller-process/ChatUploadImagesScreen';
import ProductImageGalleryScreen from '../screens/buyer-seller-process/ProductImageGalleryScreen';
import Step2OfferScreen from '../screens/buyer-seller-process/Step2OfferScreen';
import Step3DeliverySelectionScreen from '../screens/buyer-seller-process/Step3DeliverySelectionScreen';
import ShippingAddressScreen from '../screens/buyer-seller-process/ShippingAddressScreen';
import PaymentSuccessScreen from '../screens/buyer-seller-process/PaymentSuccessScreen';
import BuyerSellerPaymentMethodScreen from '../screens/buyer-seller-process/PaymentMethodScreen';
import Step4ScheduleScreen from '../screens/buyer-seller-process/Step4ScheduleScreen';
import Step5DealConfirmationScreen from '../screens/buyer-seller-process/Step5DealConfirmationScreen';
import SingleItemActionScreen from '../screens/buyer-seller-process/SingleItemActionScreen';

// My Support screens
import MySupportHomeScreen from '../screens/my-support/MySupportHomeScreen';
import SupportTicketListScreen from '../screens/my-support/SupportTicketListScreen';
import TicketMessagingScreen from '../screens/my-support/TicketMessagingScreen';
import DeletedAdsScreen from '../screens/my-support/DeletedAdsScreen';
import AdAppealScreen from '../screens/my-support/AdAppealScreen';
import AppealStatusScreen from '../screens/my-support/AppealStatusScreen';

// Combined Support & Resolution screen
import SupportResolutionScreen from '../screens/support-resolution/SupportResolutionScreen';
import ResolutionInboxScreen from '../screens/resolutions/ResolutionInboxScreen';

// Issue screens
import CreateIssueScreen from '../screens/issues/CreateIssueScreen';
import IssueDetailScreen from '../screens/issues/IssueDetailScreen';
import DisputeDetailScreen from '../screens/disputes/DisputeDetailScreen';
import AttachEvidenceScreen from '../screens/issues/AttachEvidenceScreen';

// Claim screens
import ClaimDetailScreen from '../screens/claims/ClaimDetailScreen';
import CreateClaimScreen from '../screens/claims/CreateClaimScreen';

import IssueDisputeInfoScreen from '../screens/issues/IssueDisputeInfoScreen';
import IssueDisputeBuyerReasonsScreen from '../screens/issues/IssueDisputeBuyerReasonsScreen';
import IssueDisputeSellerReasonsScreen from '../screens/issues/IssueDisputeSellerReasonsScreen';
import IssueDisputeEligibilityScreen from '../screens/issues/IssueDisputeEligibilityScreen';
import IssueDisputeFormScreen from '../screens/issues/IssueDisputeFormScreen';
import ClaimInformationScreen from '../screens/claims/ClaimInformationScreen';

// Dispute Flow screens
import DisputeInformationScreen from '../screens/dispute-flow/DisputeInformationScreen';
import DisputeTypeSelectionScreen from '../screens/dispute-flow/DisputeTypeSelectionScreen';
import ProblemSelectionScreen from '../screens/dispute-flow/ProblemSelectionScreen';
import ReviewEligibility1Screen from '../screens/dispute-flow/ReviewEligibility1Screen';
import ReviewEligibility2Screen from '../screens/dispute-flow/ReviewEligibility2Screen';
import DisputeFormScreen from '../screens/dispute-flow/DisputeFormScreen';
import UploadEvidenceScreen from '../screens/dispute-flow/UploadEvidenceScreen';
import ResolutionRecommendationScreen from '../screens/disputes/ResolutionRecommendationScreen';

// Support Ticket screens
import MySupportScreen from '../screens/support/MySupportScreen';
import TicketDetailScreen from '../screens/support/TicketDetailScreen';
import CreateTicketScreen from '../screens/support/CreateTicketScreen';

// Info screens
import AboutUsScreen from '../screens/info/AboutUsScreen';
import HowItWorksScreen from '../screens/info/HowItWorksScreen';
import HowItWorksDetailScreen from '../screens/info/HowItWorksDetailScreen';
import QualityInfoScreen from '../screens/info/QualityInfoScreen';
import VisibilityBoostInfoScreen from '../screens/info/VisibilityBoostInfoScreen';
import GenericInfoScreen from '../screens/info/GenericInfoScreen';
import PlatformMenuScreen from '../screens/info/PlatformMenuScreen';
import GreenVisionScreen from '../screens/info/GreenVisionScreen';
import GreenVisionDetailScreen from '../screens/info/GreenVisionDetailScreen';

// New mobile parity screens
import TrendingHubScreen from '../screens/home/TrendingHubScreen';
import TrendingGalleryScreen from '../screens/home/TrendingGalleryScreen';
import ProductDirectionsScreen from '../screens/products/ProductDirectionsScreen';
import KYCVerificationScreen from '../screens/user-account/kyc/KYCVerificationScreen';
import PostageScreen from '../screens/user-account/postage/PostageScreen';
import SocialClubsScreen from '../screens/social-clubs/SocialClubsScreen';
import EventRoomScreen from '../screens/social-clubs/EventRoomScreen';

const Stack = createNativeStackNavigator();

const NavigationGuard = () => {
  const { isAuthenticated, user } = useAuth();
  const navigation = useNavigation();
  // Ref to prevent redirect storms when user state is updating
  const isRedirectingRef = React.useRef(false);
  const redirectTimerRef = React.useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const isBusiness = user.user_type === 'business' || 
                       (user.subscription_plan_slug && 
                        (user.subscription_plan_slug.toLowerCase().includes('business') || 
                         user.subscription_plan_slug.toLowerCase().includes('pro')));
    const isVerified = user.kyc_status === 'verified' || user.kyc_status === 'approved' || user.kyc_completed === 1;

    // If user is now verified or not a business user, clear any redirect lock and bail
    if (!isBusiness || isVerified) {
      isRedirectingRef.current = false;
      return;
    }

    const checkAndRedirect = () => {
      // Skip if we're already in the middle of a redirect to avoid loops
      if (isRedirectingRef.current) return;
      try {
        const state = navigation.getState();
        if (!state) return;
        const currentRouteName = state.routes[state.index]?.name;
        const allowedRoutes = ['BusinessVerification', 'EmailVerification', 'AccountVerified', 'PatentPending'];
        if (currentRouteName && !allowedRoutes.includes(currentRouteName)) {
          console.log(`🔒 NavigationGuard: Redirecting unverified business user from ${currentRouteName} to BusinessVerification`);
          isRedirectingRef.current = true;
          navigation.reset({
            index: 0,
            routes: [{ name: 'BusinessVerification' }],
          });
          // Release the redirect lock after navigation settles
          redirectTimerRef.current = setTimeout(() => {
            isRedirectingRef.current = false;
          }, 1000);
        }
      } catch (err) {
        console.error('Error in checkAndRedirect:', err);
      }
    };

    // Run check initially (with small delay to let navigation settle after user state update)
    redirectTimerRef.current = setTimeout(checkAndRedirect, 100);

    // Listen for navigation state changes
    const unsubscribe = navigation.addListener('state', checkAndRedirect);
    return () => {
      unsubscribe();
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, [isAuthenticated, user, navigation]);

  return null;
};

const AppNavigator = React.forwardRef((props, ref) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Determine initial route based on authentication status
  const getInitialRouteName = () => {
    console.log('🧭 AppNavigator: Determining initial route...');
    console.log('   isLoading:', isLoading);
    console.log('   isAuthenticated:', isAuthenticated);

    if (isLoading) {
      console.log('   → Showing Splash (loading)');
      return 'Splash';
    }

    if (!isAuthenticated) {
      console.log('   → Showing Registration (not authenticated)');
      return 'Registration';
    }

    const isBusiness = user?.user_type === 'business' || 
                       (user?.subscription_plan_slug && 
                        (user.subscription_plan_slug.toLowerCase().includes('business') || 
                         user.subscription_plan_slug.toLowerCase().includes('pro')));
    const isVerified = user?.kyc_status === 'verified' || user?.kyc_status === 'approved' || user?.kyc_completed === 1;

    if (isBusiness && !isVerified) {
      console.log('   → Showing BusinessVerification (restricted business user)');
      return 'BusinessVerification';
    }

    console.log('   → Showing SearchScreen (authenticated)');
    return 'SearchScreen';
  };

  return (
    <NavigationContainer ref={ref}>
      <NavigationGuard />
      <Stack.Navigator
        initialRouteName={getInitialRouteName()}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        {/* Onboarding Flow */}

        {/* Buyer-Seller Process Routes */}
        <Stack.Screen
          name="ActionCenterScreen"
          component={ActionCenterScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ActionCenterMessagesScreen"
          component={ActionCenterMessagesScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Inbox"
          component={InboxScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SingleItemActionScreen"
          component={SingleItemActionScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Step1EnquiryScreen"
          component={Step1EnquiryScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ChatUploadImagesScreen"
          component={ChatUploadImagesScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="ProductImageGalleryScreen"
          component={ProductImageGalleryScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="Step2OfferScreen"
          component={Step2OfferScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Step3DeliverySelectionScreen"
          component={Step3DeliverySelectionScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ShippingAddressScreen"
          component={ShippingAddressScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="BuyerSellerPaymentMethodScreen"
          component={BuyerSellerPaymentMethodScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="PaymentSuccessScreen"
          component={PaymentSuccessScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Step4ScheduleScreen"
          component={Step4ScheduleScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Step5DealConfirmationScreen"
          component={Step5DealConfirmationScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Splash"
          component={SplashAlternative3Screen}
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
          name="PatentPending"
          component={PatentPendingScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="PolicyUpdates"
          component={PolicyUpdatesScreen}
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
          name="NotificationPermission"
          component={NotificationPermissionScreen}
          options={{
            animationEnabled: true,
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
        <Stack.Screen
          name="RoundBuyInfo"
          component={RoundBuyInfoScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="OnboardingDemo"
          component={OnboardingDemoScreen}
          options={{
            animationEnabled: true,
          }}
        />

        <Stack.Screen
          name="LaunchOnboarding"
          component={LaunchOnboardingScreen}
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
          name="BusinessCreateAccount"
          component={BusinessCreateAccountScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="BusinessVerification"
          component={BusinessVerificationScreen}
          options={{
            animationEnabled: true,
            gestureEnabled: false,
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

        {/* Demo Screen - Public Access */}
        <Stack.Screen
          name="Demo"
          component={DemoScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
          }}
        />

        {/* Demo Product Details - Public Access */}
        <Stack.Screen
          name="DemoProductDetails"
          component={DemoProductDetailsScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="SearchScreen"
          component={SearchScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
          }}
          listeners={({ navigation }) => ({
            beforeRemove: (e) => {
              // Prevent going back from SearchScreen if authenticated
              // User should use logout instead
              if (isAuthenticated) {
                e.preventDefault();
              }
            },
          })}
        />
        <Stack.Screen
          name="ServiceList"
          component={ServiceListScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ServiceDetails"
          component={ServiceDetailsScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="TrendingHub"
          component={TrendingHubScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="TrendingGallery"
          component={TrendingGalleryScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ProductDirections"
          component={ProductDirectionsScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="KYCVerification"
          component={KYCVerificationScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Postage"
          component={PostageScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SocialClubs"
          component={SocialClubsScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="EventRoom"
          component={EventRoomScreen}
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
        {/* Paddle Payment Screen - Removed as unused/deprecated
        <Stack.Screen
          name="PaddlePayment"
          component={PaddlePaymentScreen}
          options={{
            animationEnabled: true,
            presentation: 'modal',
          }}
        />
        */}

        {/* Make an Ad Flow */}
        <Stack.Screen
          name="MakeAnAd"
          component={MakeAnAdScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="SellService"
          component={SellServiceScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="EditAnAd"
          component={require('../screens/advertisements/EditAnAdScreen').default}
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
          name="Suggestion"
          component={SuggestionScreen}
          options={{
            animationEnabled: true,
            presentation: 'modal', // Modal presentation feels right for feedback
          }}
        />
        <Stack.Screen
          name="SuggestionSuccess"
          component={SuggestionSuccessScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
            gestureEnabled: false, // Prevent swiping back
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
          name="AdCreationSuccess"
          component={AdCreationSuccessScreen}
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
          name="UserListings"
          component={UserListingsScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="UserFeedbacks"
          component={UserFeedbacksScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="ConversationsList"
          component={ConversationsListScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
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
          name="ATTTrackingSettings"
          component={ATTTrackingSettingsScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="ConfirmAccessRights"
          component={ConfirmAccessRightsScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="PrivacyEmailVerification"
          component={PrivacyEmailVerificationScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="AccessRightsConfirmation"
          component={AccessRightsConfirmationScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="DataRequestForm"
          component={DataRequestFormScreen}
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
          name="EditUsername"
          component={EditUsernameScreen}
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
          name="Wallet"
          component={WalletScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="WalletTopup"
          component={WalletTopupScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="HowItWorksDetail"
          component={HowItWorksDetailScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="VisibilityBoostInfo"
          component={VisibilityBoostInfoScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="WalletTransactions"
          component={WalletTransactionsScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="WalletWithdrawal"
          component={WalletWithdrawalScreen}
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
          name="FAQSubCategories"
          component={FAQSubCategoriesScreen}
          options={{
            animationEnabled: true,
          }}
        />

        {/* Info Screens */}
        <Stack.Screen
          name="QualityInfo"
          component={QualityInfoScreen}
          options={{ animationEnabled: true }}
        />
        <Stack.Screen
          name="AboutUs"
          component={AboutUsScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="HowItWorks"
          component={HowItWorksScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="GenericInfo"
          component={GenericInfoScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="PlatformMenu"
          component={PlatformMenuScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="ResolutionInbox"
          component={ResolutionInboxScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="GreenVision"
          component={GreenVisionScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="GreenVisionDetail"
          component={GreenVisionDetailScreen}
          options={{
            animationEnabled: true,
          }}
        />

        <Stack.Screen
          name="FAQList"
          component={FAQListScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="MeasurementSettings"
          component={MeasurementSettingsScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="Interests"
          component={InterestScreen}
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
          name="CountrySelection"
          component={CountrySelectionScreen}
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
          name="NotificationCenter"
          component={NotificationCenterScreen}
          options={{
            animationEnabled: true,
            headerShown: false,
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
          name="OfferHistory"
          component={OfferHistoryScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="SchedulePickUp"
          component={SchedulePickUpScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="PickUpExchange"
          component={PickUpExchangeScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="PickUpStatus"
          component={PickUpStatusScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="UnpaidPickUpFees"
          component={UnpaidPickUpFeesScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="PaidPickUpFees"
          component={PaidPickUpFeesScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="ScheduledPickUpDetail"
          component={ScheduledPickUpDetailScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="PickUpPayment"
          component={PickUpPaymentScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="ReschedulePickUp"
          component={ReschedulePickUpScreen}
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
          name="MyServicesList"
          component={MyServicesListScreen}
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
          name="EditAdLocations"
          component={EditAdLocationsScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="ExtensionShop"
          component={ExtensionShopScreen}
          options={{ animationEnabled: true }}
        />
        <Stack.Screen
          name="MyServices"
          component={MyServicesScreen}
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
          name="ShowcaseProductSelector"
          component={ShowcaseProductSelectorScreen}
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
          name="ExtensionCheckout"
          component={ExtensionCheckoutScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="ExtensionLocations"
          component={ExtensionLocationsScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="ExtensionSocialClubs"
          component={ExtensionSocialClubsScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="ExtensionBoosts"
          component={ExtensionBoostsScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="LotteryWinners"
          component={LotteryWinnersScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="LotteryCreditStatus"
          component={LotteryCreditStatusScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="LotteryGuide"
          component={LotteryGuideScreen}
          options={{ title: 'Lottery Guide' }}
        />
        <Stack.Screen
          name="MostPopularSearches"
          component={MostPopularSearchesScreen}
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
          component={RewardsLevelScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="RewardsLevel"
          component={RewardsLevelScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="RewardLevelDetail"
          component={RewardLevelDetailScreen}
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
          name="MyMembership"
          component={MyMembershipScreen}
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

        {/* Resolution Center Flow */}
        <Stack.Screen
          name="ResolutionCenter"
          component={ResolutionCenterHomeScreen}
          options={{
            animationEnabled: true,
            title: 'Resolution Center',
          }}
        />
        <Stack.Screen
          name="DisputeList"
          component={DisputeListScreen}
          options={{
            animationEnabled: true,
            title: 'My Disputes',
          }}
        />
        <Stack.Screen
          name="DisputeCategory"
          component={DisputeCategoryScreen}
          options={{
            animationEnabled: true,
            title: 'Choose Dispute Type',
          }}
        />
        <Stack.Screen
          name="SelectProduct"
          component={SelectProductScreen}
          options={{
            animationEnabled: true,
            title: 'Select Product',
          }}
        />
        <Stack.Screen
          name="SelectProblem"
          component={SelectProblemScreen}
          options={{
            animationEnabled: true,
            title: 'Select Problem',
          }}
        />
        <Stack.Screen
          name="ReviewEligibility"
          component={ReviewEligibilityScreen}
          options={{
            animationEnabled: true,
            title: 'Review Eligibility',
          }}
        />
        <Stack.Screen
          name="DisputeForm"
          component={DisputeFormScreen}
          options={{
            animationEnabled: true,
            title: 'Dispute Details',
          }}
        />
        <Stack.Screen
          name="UploadEvidence"
          component={UploadEvidenceScreen}
          options={{
            animationEnabled: true,
            title: 'Upload Evidence',
          }}
        />
        <Stack.Screen
          name="DisputeConfirmation"
          component={DisputeConfirmationScreen}
          options={{
            animationEnabled: true,
            title: 'Review & Confirm',
          }}
        />
        <Stack.Screen
          name="DisputeMessaging"
          component={DisputeMessagingScreen}
          options={{
            animationEnabled: true,
            title: 'Dispute Chat',
          }}
        />

        {/* Combined Support & Resolution Screen */}
        <Stack.Screen
          name="SupportResolution"
          component={SupportResolutionScreen}
          options={{
            headerShown: false,
            animationEnabled: true,
          }}
        />

        {/* Issue Screens */}
        <Stack.Screen
          name="CreateIssue"
          component={CreateIssueScreen}
          options={{
            headerShown: false,
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="IssueDetail"
          component={IssueDetailScreen}
          options={{
            headerShown: false,
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="AttachEvidence"
          component={AttachEvidenceScreen}
          options={{
            headerShown: false,
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="DisputeDetail"
          component={DisputeDetailScreen}
          options={{
            headerShown: false,
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="ClaimDetail"
          component={ClaimDetailScreen}
          options={{
            headerShown: false,
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="CreateClaim"
          component={CreateClaimScreen}
          options={{
            headerShown: false,
            animationEnabled: true,
          }}
        />

        <Stack.Screen
          name="ClaimInformation"
          component={ClaimInformationScreen}
          options={{
            headerShown: false,
            animationEnabled: true,
          }}
        />

        <Stack.Screen
          name="IssueDisputeInfo"
          component={IssueDisputeInfoScreen}
          options={{
            headerShown: false,
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="IssueDisputeBuyerReasons"
          component={IssueDisputeBuyerReasonsScreen}
          options={{
            headerShown: false,
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="IssueDisputeSellerReasons"
          component={IssueDisputeSellerReasonsScreen}
          options={{
            headerShown: false,
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="IssueDisputeEligibility"
          component={IssueDisputeEligibilityScreen}
          options={{
            headerShown: false,
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="IssueDisputeForm"
          component={IssueDisputeFormScreen}
          options={{
            headerShown: false,
            animationEnabled: true,
          }}
        />

        {/* Dispute Flow - 5 Steps */}
        <Stack.Screen
          name="DisputeInformation"
          component={DisputeInformationScreen}
          options={{ headerShown: false, animationEnabled: true }}
        />
        <Stack.Screen
          name="DisputeTypeSelection"
          component={DisputeTypeSelectionScreen}
          options={{ headerShown: false, animationEnabled: true }}
        />
        <Stack.Screen
          name="ProblemSelection"
          component={ProblemSelectionScreen}
          options={{ headerShown: false, animationEnabled: true }}
        />
        <Stack.Screen
          name="ReviewEligibility1"
          component={ReviewEligibility1Screen}
          options={{ headerShown: false, animationEnabled: true }}
        />
        <Stack.Screen
          name="ReviewEligibility2"
          component={ReviewEligibility2Screen}
          options={{ headerShown: false, animationEnabled: true }}
        />
        <Stack.Screen
          name="DisputeFormScreen"
          component={DisputeFormScreen}
          options={{ headerShown: false, animationEnabled: true }}
        />
        <Stack.Screen
          name="UploadEvidenceScreen"
          component={UploadEvidenceScreen}
          options={{ headerShown: false, animationEnabled: true }}
        />
        <Stack.Screen
          name="ResolutionRecommendation"
          component={ResolutionRecommendationScreen}
          options={{ headerShown: false, animationEnabled: true }}
        />

        {/* Support Ticket Screens */}
        <Stack.Screen
          name="MySupport"
          component={MySupportScreen}
          options={{
            headerShown: false,
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="TicketDetail"
          component={TicketDetailScreen}
          options={{
            headerShown: false,
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="CreateTicket"
          component={CreateTicketScreen}
          options={{
            headerShown: false,
            animationEnabled: true,
          }}
        />

        {/* My Support Flow (Old) - Renamed to avoid duplicates */}
        <Stack.Screen
          name="MySupportHome"
          component={MySupportHomeScreen}
          options={{
            animationEnabled: true,
            title: 'My Support',
          }}
        />
        <Stack.Screen
          name="SupportTicketList"
          component={SupportTicketListScreen}
          options={{
            animationEnabled: true,
            title: 'Support Tickets',
          }}
        />
        <Stack.Screen
          name="CreateTicketOld"
          component={CreateTicketScreen}
          options={{
            animationEnabled: true,
            title: 'Create Support Ticket',
          }}
        />
        <Stack.Screen
          name="TicketDetailOld"
          component={TicketDetailScreen}
          options={{
            animationEnabled: true,
            title: 'Ticket Details',
          }}
        />
        <Stack.Screen
          name="TicketMessaging"
          component={TicketMessagingScreen}
          options={{
            animationEnabled: true,
            title: 'Ticket Chat',
          }}
        />
        <Stack.Screen
          name="DeletedAds"
          component={DeletedAdsScreen}
          options={{
            animationEnabled: true,
            title: 'Deleted Ads',
          }}
        />
        <Stack.Screen
          name="AdAppeal"
          component={AdAppealScreen}
          options={{
            animationEnabled: true,
            title: 'Appeal Ad Deletion',
          }}
        />
        <Stack.Screen
          name="AppealStatus"
          component={AppealStatusScreen}
          options={{
            animationEnabled: true,
            title: 'Appeal Status',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
});

export default AppNavigator;