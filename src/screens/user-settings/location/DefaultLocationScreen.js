import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../context/TranslationContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';
import { advertisementService } from '../../../services';
import LocationDisclaimerModal from '../../../components/LocationDisclaimerModal';
import SuggestionsFooter from '../../../components/SuggestionsFooter';
import Hyperlink from '../../../components/common/Hyperlink';

const DefaultLocationScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locations, setLocations] = useState([]);
  const [disclaimerModalVisible, setDisclaimerModalVisible] = useState(false);

  // Get membership plan from user data
  const getMembershipPlan = () => {
    console.log('DEBUG: User object:', JSON.stringify(user, null, 2));
    if (!user?.subscription_plan_slug) {
      console.log('DEBUG: No subscription_plan_slug found');
      return 'green';
    }
    const slug = user.subscription_plan_slug.toLowerCase();
    console.log('DEBUG: Plan slug:', slug);
    if (slug.includes('gold')) return 'gold';
    if (slug.includes('orange')) return 'orange';
    return 'green';
  };

  const membershipPlan = getMembershipPlan();

  const getMaxLocations = () => {
    switch (membershipPlan) {
      case 'gold': return 5;
      case 'orange': return 3;
      default: return 1;
    }
  };

  const maxLocations = getMaxLocations();

  // Fetch user locations on component mount
  useEffect(() => {
    fetchUserLocations();
  }, []);

  const fetchUserLocations = async () => {
    try {
      setLoading(true);
      const response = await advertisementService.getUserLocations();
      if (response.success) {
        setLocations(response.data.locations);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      Alert.alert(t('Error'), t('Failed to load locations'));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSetLocation = (locationType, existingLocation = null) => {
    navigation.navigate('SetLocationMap', {
      locationType,
      membershipPlan,
      existingLocation,
      onSave: async (locationData) => {
        try {
          setSaving(true);

          // Prepare location data for API
          const locationPayload = {
            name: locationData.name || getLocationName(locationType),
            street: locationData.address,
            city: locationData.city || 'Unknown',
            region: locationData.region || '',
            country: locationData.country || 'Unknown',
            zip_code: locationData.zipCode || '',
            latitude: locationData.coordinates.latitude,
            longitude: locationData.coordinates.longitude,
            is_default: locationType === 'centrePoint' || locations.length === 0,
          };

          let response;
          if (existingLocation) {
            // Update existing location
            response = await advertisementService.updateLocation(existingLocation.id, locationPayload);
          } else {
            // Create new location
            response = await advertisementService.createLocation(locationPayload);
          }

          if (response.success) {
            // Refresh locations
            await fetchUserLocations();
            Alert.alert(
              t('Success'),
              t('Location saved successfully!'),
              [
                { text: t('OK'), onPress: () => navigation.goBack() }
              ]
            );
          } else {
            Alert.alert(t('Error'), response.message || t('Failed to save location'));
          }
        } catch (error) {
          console.error('Error saving location:', error);
          Alert.alert(t('Error'), t('Failed to save location'));
        } finally {
          setSaving(false);
        }
      }
    });
  };

  const getLocationName = (locationType) => {
    switch (locationType) {
      case 'centrePoint':
        return 'Default Location & Product Location (centre-point)';
      case 'productLocation2':
        return 'Product Location 2';
      case 'productLocation3':
        return 'Product Location 3';
      case 'productLocation4':
        return 'Product Location 4';
      case 'productLocation5':
        return 'Product Location 5';
      default:
        return 'Location';
    }
  };

  const getExistingLocation = (locationType) => {
    // Map location types to database entries
    // Assuming locations are stored/returned in order of creation or can be identified by name/metadata
    // For now, simpler mapping based on index if the backend returns them in consistent order

    // Better strategy: try to match by name first, or fall back to index if needed
    // But since names can be edited, index is safer IF we guarantee order.
    // Given the previous code used index, we will stick to index mapping for now.

    const typeMapping = {
      centrePoint: 0,
      productLocation2: 1,
      productLocation3: 2,
      productLocation4: 3,
      productLocation5: 4,
    };

    const index = typeMapping[locationType];
    return locations[index] || null;
  };

  const handleUpgrade = () => {
    navigation.navigate('ExtensionShop');
  };

  const renderLocationButton = (title, description, locationType, disabled = false) => {
    const existingLocation = getExistingLocation(locationType);
    const hasLocation = existingLocation !== null;

    return (
      <View style={styles.locationSection} key={locationType}>
        {!!description && (
          <>
            <Text style={styles.locationTitle}>{title}</Text>
            <Text style={styles.locationDescription}>{description}</Text>
            {locationType === 'centrePoint' && (
              <Text style={styles.locationNote}>{t('Both Centre-point and Product location 1 are located in the same spot!')}</Text>
            )}
            <Hyperlink
              linkKey="location_info_link"
              containerStyle={styles.infoLink}
              style={[styles.infoLinkText, styles.clickHereText]}
              activeOpacity={0.7}
            >
              {t('Learn more about ')} {t('Locations')}
              <Ionicons name="information-circle-outline" size={20} color="#505050" style={styles.infoIcon} />
            </Hyperlink>
          </>
        )}

        {/* Show existing location info */}
        {hasLocation && (
          <View style={styles.existingLocationInfo}>
            <Ionicons name="location" size={20} color={COLORS.primary} />
            <View style={styles.locationDetails}>
              <Text style={styles.locationName}>{existingLocation.name}</Text>
              <Text style={styles.locationAddress}>
                {existingLocation.city}, {existingLocation.country}
              </Text>
            </View>
            {existingLocation.is_default && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>{t('Default')}</Text>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.setLocationButton, disabled && styles.setLocationButtonDisabled]}
          onPress={() => !disabled && handleSetLocation(locationType, existingLocation)}
          activeOpacity={0.7}
          disabled={disabled || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.setLocationButtonText}>
              {hasLocation ? 'Edit Location' : `Set ${getLocationName(locationType)}`}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {membershipPlan === 'green' ? 'Set Your Location' : 'Set Your Locations'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>{t('Loading your locations...')}</Text>
          </View>
        ) : (
          <>
            {/* Info Section */}
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>{t('Your default location has two functions:')}</Text>

              <View style={styles.infoItem}>
                <Text style={styles.infoItemTitle}>{t('Centre-point')}</Text>
                <Text style={styles.infoItemText}>{t('For safety, an imprecise home address, and a spot to Buy around.')}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoItemTitle}>{t('Product location 1')}</Text>
                <Text style={styles.infoItemText}>{t('The spot you advertise and Sell your own products.')}</Text>
              </View>
            </View>

            {/* Centre-point & Product Location 1 - Always Show */}
            {renderLocationButton(
              '',
              '',
              'centrePoint'
            )}

            {/* Additional locations based on membership plan */}
            {(membershipPlan === 'orange' || membershipPlan === 'gold') && [
              renderLocationButton(
                t('Product Location 2'),
                t('Your secondary spot to advertise the products you want to Sell e.g. near to work.'),
                'productLocation2'
              ),
              renderLocationButton(
                t('Product Location 3'),
                t('Your third spot to advertise the products you want to Sell.'),
                'productLocation3'
              )
            ]}

            {membershipPlan === 'gold' && [
              renderLocationButton(
                t('Product Location 4'),
                t('Your fourth spot to advertise the products you want to Sell.'),
                'productLocation4'
              ),
              renderLocationButton(
                t('Product Location 5'),
                t('Your fifth spot to advertise the products you want to Sell.'),
                'productLocation5'
              )
            ]}
          </>
        )}

        {/* Note / Upgrade Section */}
        {locations.length < 5 && (
          <View style={styles.noteSection}>
            <Text style={styles.noteTitle}>{t('Want to reach more buyers?')}</Text>
            <Text style={styles.noteText}>
              {t('Add more display locations to show your listings to buyers in different areas. Up to 5 locations available.')}
            </Text>
            <TouchableOpacity style={styles.upgradeLink} onPress={handleUpgrade} activeOpacity={0.7}>
              <Text style={styles.upgradeLinkText}>{t('Add more display locations')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade} activeOpacity={0.7}>
              <Text style={styles.upgradeButtonText}>{t('Purchase Display Locations')}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacer} />
        <View style={styles.bottomSpacer} />

        {/* Disclaimer Link */}
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            Our{' '}
            <Hyperlink
              linkKey="default_location_disclaimer"
              style={styles.disclaimerLink}
              onPress={() => setDisclaimerModalVisible(true)}
            >
              {t('Locations & Safety Disclaimer')}
            </Hyperlink>
          </Text>
        </View>

        <SuggestionsFooter sourceRoute="DefaultLocation" />
      </ScrollView>

      <LocationDisclaimerModal
        visible={disclaimerModalVisible}
        onClose={() => setDisclaimerModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  infoItem: {
    marginBottom: 12,
  },
  infoItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  infoItemText: {
    fontSize: 13,
    color: '#505050',
    lineHeight: 18,
  },
  locationSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  locationDescription: {
    fontSize: 13,
    color: '#505050',
    lineHeight: 18,
    marginBottom: 8,
  },
  locationNote: {
    fontSize: 12,
    color: '#505050',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  infoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoLinkText: {
    fontSize: 13,
    color: '#505050',
  },
  clickHereText: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  infoIcon: {
    marginLeft: 4,
  },
  setLocationButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  setLocationButtonDisabled: {
    backgroundColor: '#ccc',
  },
  setLocationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  noteSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 13,
    color: '#505050',
    lineHeight: 20,
    marginBottom: 12,
  },
  upgradeLink: {
    marginBottom: 16,
  },
  upgradeLinkText: {
    fontSize: 14,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  upgradeButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#505050',
  },
  existingLocationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  locationDetails: {
    flex: 1,
    marginLeft: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#505050',
  },
  defaultBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  bottomSpacer: {
    height: 40,
  },
  disclaimerContainer: {
    padding: 20,
    // backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  disclaimerText: {
    fontSize: 14,
    color: '#505050',
    lineHeight: 20,
  },
  disclaimerLink: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
});

export default DefaultLocationScreen;