import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../context/TranslationContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { advertisementService } from '../../../services';
import { getFullImageUrl } from '../../../utils/imageUtils';
import { IMAGES } from '../../../assets/images';
import SuggestionsFooter from '../../../components/SuggestionsFooter';
import Hyperlink from '../../../components/common/Hyperlink';

const MyAdsDetailScreen = ({ navigation, route }) => {
  const { t } = useTranslation();

  const initialAd = route.params?.ad || route.params?.updatedAd;

  // Use state to hold the current ad data to allow updates
  const [currentAd, setCurrentAd] = useState(initialAd);
  const [adStatus, setAdStatus] = useState(initialAd?.status || 'published');
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState('modify'); // 'modify' | 'statistics'
  const [removeReason, setRemoveReason] = useState(null);

  // Listen for updates from other screens (e.g. EditAdLocations)
  useEffect(() => {
    if (route.params?.updatedAd) {
      setCurrentAd(route.params.updatedAd);
      // Clear the param so it doesn't trigger again
      navigation.setParams({ updatedAd: undefined });
    }
  }, [route.params?.updatedAd, navigation]);

  const ad = currentAd;

  if (!ad) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  // Parse images
  let adImages = [];
  try {
    if (typeof ad.images === 'string') {
      adImages = JSON.parse(ad.images);
    } else if (Array.isArray(ad.images)) {
      adImages = ad.images;
    }
  } catch (e) {
    console.error('Error parsing images:', e);
  }

  const imageUrl = adImages.length > 0 ? getFullImageUrl(adImages[0]) : null;
  const primaryImage = imageUrl ? { uri: imageUrl } : IMAGES.chair1;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleModify = () => {
    navigation.navigate('EditAnAd', { adData: ad });
  };

  const handleToggleStatus = async () => {
    const currentStatus = adStatus === 'published' ? 'active' : 'inactive';
    const newStatus = currentStatus === 'active' ? 'draft' : 'published';
    const action = currentStatus === 'active' ? 'Inactivate' : 'Activate';

    Alert.alert(
      `${action} Ad`,
      `Are you sure you want to ${action.toLowerCase()} this ad?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action,
          onPress: async () => {
            try {
              setIsLoadingStatus(true);
              const response = await advertisementService.updateAdvertisement(ad.id, { status: newStatus });
              if (response.success) {
                setAdStatus(newStatus);
                Alert.alert(t('Success'), `Ad ${action.toLowerCase()}d successfully`);
              } else {
                throw new Error(response.message || 'Failed to update ad status');
              }
            } catch (error) {
              console.error('Error updating ad status:', error);
              Alert.alert(t('Error'), error.message || t('Failed to update ad status. Please try again.'));
            } finally {
              setIsLoadingStatus(false);
            }
          },
        },
      ]
    );
  };

  const handleRemoveListing = () => {
    if (!removeReason) {
      Alert.alert(t('Error'), t('Please select a reason for removing the listing.'));
      return;
    }
    Alert.alert(
      t('Remove Listing'),
      t('Are you sure you want to permanently remove this listing?'),
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Remove'),
          style: 'destructive',
          onPress: () => {
            Alert.alert(t('Success'), t('Listing removed (Mocked).'));
            navigation.goBack();
          }
        }
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('My Listings')}</Text>
        <View style={{ width: 28 }} />
      </View>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'modify' && styles.activeTabButton]}
          onPress={() => setActiveTab('modify')}
        >
          <Text style={[styles.tabText, activeTab === 'modify' && styles.activeTabText]}>
            {t('Modify Listing')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'statistics' && styles.activeTabButton]}
          onPress={() => setActiveTab('statistics')}
        >
          <Text style={[styles.tabText, activeTab === 'statistics' && styles.activeTabText]}>
            {t('Listing Statistics')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProductInfo = () => (
    <View style={styles.productInfoContainer}>
      <View style={styles.imageWrapper}>
        <Image source={primaryImage} style={styles.productImage} />
        <View style={styles.imageIndicators}>
          <View style={[styles.indicator, styles.activeIndicator]} />
          <View style={styles.indicator} />
          <View style={styles.indicator} />
        </View>
      </View>
      <View style={styles.titleRow}>
        <Text style={styles.productTitle}>{ad.title || 'Product Title'}</Text>
        <Text style={styles.priceText}>£{ad.price || ad.budget || 0}</Text>
      </View>
    </View>
  );

  const removeReasonsList = [
    'The product or service got sold',
    'I received no offers',
    'Item no longer available',
    'Policy Violation',
    'Other reason'
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderProductInfo()}

        {activeTab === 'modify' ? (
          <View style={styles.tabContent}>
            {/* Rows */}
            <View style={styles.infoRow}>
              <View style={styles.infoRowLeft}>
                <Text style={styles.productTitle}>{t('Quick edit')}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoRowLeft}>
                <Text style={styles.infoRowLabel}>{t('Displayed at Locations')}</Text>
                <Text style={styles.infoRowValue}>{ad.locations && ad.locations.length > 0 ? ad.locations.map((_, index) => index + 1).join(', ') : (ad.location_id ? '1' : '0')}</Text>
              </View>
              <TouchableOpacity
                style={styles.roundedButton}
                onPress={() => navigation.navigate('EditAdLocations', { adData: ad })}
              >
                <Text style={styles.roundedButtonText}>{t('Edit Locations')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoRowLeft}>
                <Text style={styles.infoRowLabel}>{t('Listing Status')}</Text>
                <Text style={styles.infoRowValue}>{adStatus === 'published' ? 'Active' : 'Inactive'}</Text>
              </View>
              <TouchableOpacity
                style={[styles.roundedButton, isLoadingStatus && { opacity: 0.6 }]}
                onPress={handleToggleStatus}
                disabled={isLoadingStatus}
              >
                {isLoadingStatus ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={styles.roundedButtonText}>
                    {adStatus === 'published' ? t('Inactivate') : t('Activate')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoRowLeft}>
                <Text style={styles.infoRowLabel}>{t('Validity')}</Text>
                <Text style={styles.infoRowValue}>{t('Continuous')}</Text>
              </View>
              <TouchableOpacity style={styles.roundedButton} onPress={handleModify}>
                <Text style={styles.roundedButtonText}>{t('Edit')}</Text>
              </TouchableOpacity>
            </View>

            {/* Modify Listing Button */}
            <TouchableOpacity style={styles.modifyMainButton} onPress={handleModify}>
              <Text style={styles.modifyMainButtonText}>{t('Modify Listing')}</Text>
            </TouchableOpacity>

            {/* Remove Listing Section */}
            <View style={styles.removeSection}>
              <Text style={styles.removeSectionTitle}>{t('Remove a Listing')}</Text>
              <Text style={styles.removeSectionSubtitle}>
                {t('Should you wish to remove a listing, please choose one from below, and then tap "Remove Listing":')}
              </Text>

              <View style={styles.reasonsList}>
                {removeReasonsList.map((reason, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.reasonOption}
                    onPress={() => setRemoveReason(reason)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.reasonText}>{t(reason)}</Text>
                    <Ionicons
                      name={removeReason === reason ? "checkbox" : "square-outline"}
                      size={24}
                      color={removeReason === reason ? "#000" : "#999"}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.removeActionButton} onPress={handleRemoveListing}>
                <Text style={styles.removeActionButtonText}>{t('Remove Listing')}</Text>
              </TouchableOpacity>

              <View style={styles.readOnContainer}>
                <Text style={styles.readOnText}>{t('Read on: ')}</Text>
                <Hyperlink
                  linkKey="myads_safety_guidelines"
                  style={styles.safetyLink}
                  unvisitedColor={COLORS.primary}
                >
                  {t('Safety Guidelines & Disclaimers')}
                </Hyperlink>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.tabContent}>
            {/* Statistics */}
            <Text style={styles.statsTitle}>{t('Statistics')}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="heart-outline" size={24} color="#000" />
                <View style={styles.statValueRow}>
                  <Text style={styles.statValue}>19</Text>
                </View>
                <Text style={styles.statLabel}>{t('Favourites')}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="eye-outline" size={24} color="#000" />
                <View style={styles.statValueRow}>
                  <Text style={styles.statValue}>7</Text>
                </View>
                <Text style={styles.statLabel}>{t('Views')}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="hand-left-outline" size={24} color="#000" />
                <View style={styles.statValueRow}>
                  <Text style={styles.statValue}>5</Text>
                </View>
                <Text style={styles.statLabel}>{t('Clicks')}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="mail-outline" size={24} color="#000" />
                <View style={styles.statValueRow}>
                  <Text style={styles.statValue}>10</Text>
                </View>
                <Text style={styles.statLabel}>{t('Contacts')}</Text>
              </View>
            </View>

            <View style={styles.learnMoreContainer}>
              <Text style={styles.learnMoreText}>{t('Learn more about ')}</Text>
              <Hyperlink
                linkKey="myads_statistics_info"
                style={styles.learnMoreLink}
                unvisitedColor={COLORS.primary}
              >
                {t('Statistics')}
              </Hyperlink>
              <Ionicons name="information-circle-outline" size={16} color="#000" style={{ marginLeft: 4 }} />
            </View>

            {/* Tips section */}
            <View style={styles.tipsSection}>
              <Text style={styles.tipsTitle}>{t('How to get more interested Buyers?')}</Text>
              <Text style={styles.tipItem}>• <Text style={styles.tipBold}>{t('Images: ')}</Text>{t('make sure you have 3 well taken images')}</Text>
              <Text style={styles.tipItem}>• <Text style={styles.tipBold}>{t('Boosts: ')}</Text>{t('make sure to buy visibility boost to get views')}</Text>
              <Text style={styles.tipItem}>• <Text style={styles.tipBold}>{t('Keywords: ')}</Text>{t('choose such as used by potential buyers')}</Text>
            </View>

            <View style={styles.disclaimerContainer}>
              <Text style={styles.disclaimerText}>{t('Our ')}</Text>
              <Hyperlink
                linkKey="myads_safety_disclaimers"
                style={styles.disclaimerLink}
                unvisitedColor={COLORS.primary}
              >
                {t('Safety Disclaimers')}
              </Hyperlink>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
        <SuggestionsFooter sourceRoute="MyAdsDetail" />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    backgroundColor: '#fff',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  productInfoContainer: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  imageWrapper: {
    width: 250,
    height: 250,
    position: 'relative',
    marginBottom: 16,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  activeIndicator: {
    backgroundColor: '#000',
  },
  titleRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  tabContent: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoRowLeft: {
    flex: 1,
  },
  infoRowLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoRowValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  roundedButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 120,
    alignItems: 'center',
  },
  roundedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  modifyMainButton: {
    backgroundColor: '#001C64', // Dark blue per mock
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  modifyMainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  removeSection: {
    marginTop: 10,
  },
  removeSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  removeSectionSubtitle: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    marginBottom: 16,
  },
  reasonsList: {
    marginBottom: 20,
  },
  reasonOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  reasonText: {
    fontSize: 14,
    color: '#000',
  },
  removeActionButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'center',
    width: '60%',
    marginBottom: 20,
  },
  removeActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  readOnContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  readOnText: {
    fontSize: 12,
    color: '#666',
  },
  safetyLink: {
    fontSize: 12,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  learnMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 30,
  },
  learnMoreText: {
    fontSize: 12,
    color: '#666',
  },
  learnMoreLink: {
    fontSize: 12,
  },
  tipsSection: {
    marginBottom: 40,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  tipItem: {
    fontSize: 13,
    color: '#000',
    marginBottom: 8,
    lineHeight: 18,
  },
  tipBold: {
    fontWeight: '700',
  },
  disclaimerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#666',
  },
  disclaimerLink: {
    fontSize: 12,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default MyAdsDetailScreen;