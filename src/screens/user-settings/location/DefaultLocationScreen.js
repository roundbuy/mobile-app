import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../../constants/theme';

const DefaultLocationScreen = ({ navigation }) => {
  // Dummy data - will be dynamic based on user's membership plan
  const [membershipPlan, setMembershipPlan] = useState('green'); // 'green' or 'gold'
  
  const [locations, setLocations] = useState({
    centrePoint: null,
    productLocation2: null,
    productLocation3: null,
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSetLocation = (locationType) => {
    navigation.navigate('SetLocationMap', {
      locationType,
      membershipPlan,
      onSave: (locationData) => {
        setLocations(prev => ({
          ...prev,
          [locationType]: locationData
        }));
      }
    });
  };

  const handleUpgradeToGold = () => {
    navigation.navigate('AllMemberships');
  };

  const renderLocationButton = (title, description, locationType, disabled = false) => (
    <View style={styles.locationSection} key={locationType}>
      {description && (
        <>
          <Text style={styles.locationTitle}>{title}</Text>
          <Text style={styles.locationDescription}>{description}</Text>
          <Text style={styles.locationNote}>
            Both Centre-point and Product location 1 are located in the same spot!
          </Text>
          <TouchableOpacity style={styles.infoLink} activeOpacity={0.7}>
            <Text style={styles.infoLinkText}>For more information </Text>
            <Text style={[styles.infoLinkText, styles.clickHereText]}>click here</Text>
            <Ionicons name="information-circle-outline" size={20} color="#666" style={styles.infoIcon} />
          </TouchableOpacity>
        </>
      )}
      
      <TouchableOpacity
        style={[styles.setLocationButton, disabled && styles.setLocationButtonDisabled]}
        onPress={() => !disabled && handleSetLocation(locationType)}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <Text style={styles.setLocationButtonText}>
          {locationType === 'centrePoint' 
            ? 'Set Centre-point &\nProduct Location 1'
            : locationType === 'productLocation2'
            ? 'Set Product Location 2'
            : 'Set Product Location 3'}
        </Text>
      </TouchableOpacity>
    </View>
  );

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
        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Your default location has two functions:</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoItemTitle}>Centre-point</Text>
            <Text style={styles.infoItemText}>
              For safety, an imprecise home address, and a spot to Buy around.
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoItemTitle}>Product location 1</Text>
            <Text style={styles.infoItemText}>
              The spot you advertise and Sell your own products.
            </Text>
          </View>
        </View>

        {/* Centre-point & Product Location 1 */}
        {renderLocationButton(
          '',
          '',
          'centrePoint'
        )}

        {/* Additional locations for Gold membership */}
        {membershipPlan === 'gold' && (
          <>
            <View style={styles.locationSection}>
              <Text style={styles.locationTitle}>Product Location 2</Text>
              <Text style={styles.locationDescription}>
                Your secondary spot to advertise the products you want to Sell e.g. near to work.
              </Text>
              <TouchableOpacity style={styles.infoLink} activeOpacity={0.7}>
                <Text style={styles.infoLinkText}>For more information </Text>
                <Text style={[styles.infoLinkText, styles.clickHereText]}>click here</Text>
                <Ionicons name="information-circle-outline" size={20} color="#666" style={styles.infoIcon} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.setLocationButton}
                onPress={() => handleSetLocation('productLocation2')}
                activeOpacity={0.7}
              >
                <Text style={styles.setLocationButtonText}>Set Product Location 2</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.locationSection}>
              <Text style={styles.locationTitle}>Product Location 3</Text>
              <Text style={styles.locationDescription}>
                Your secondary spot to advertise the products you want to Sell e.g. second home.
              </Text>
              <TouchableOpacity style={styles.infoLink} activeOpacity={0.7}>
                <Text style={styles.infoLinkText}>For more information </Text>
                <Text style={[styles.infoLinkText, styles.clickHereText]}>click here</Text>
                <Ionicons name="information-circle-outline" size={20} color="#666" style={styles.infoIcon} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.setLocationButton}
                onPress={() => handleSetLocation('productLocation3')}
                activeOpacity={0.7}
              >
                <Text style={styles.setLocationButtonText}>Set Product Location 3</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Note for Green membership */}
        {membershipPlan === 'green' && (
          <View style={styles.noteSection}>
            <Text style={styles.noteTitle}>Note:</Text>
            <Text style={styles.noteText}>
              With the Green membership you have 1x centre-point, and 1x product locations, while with the Gold membership you have 1x centre-point, and 3x product locations.
            </Text>
            <TouchableOpacity style={styles.upgradeLink} onPress={handleUpgradeToGold} activeOpacity={0.7}>
              <Text style={styles.upgradeLinkText}>
                Upgrade now to Gold membership for discounted prices!
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgradeToGold} activeOpacity={0.7}>
              <Text style={styles.upgradeButtonText}>Upgrade to Gold</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    color: '#666',
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
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  locationNote: {
    fontSize: 12,
    color: '#666',
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
    color: '#666',
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
    color: '#666',
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
  bottomSpacer: {
    height: 40,
  },
});

export default DefaultLocationScreen;