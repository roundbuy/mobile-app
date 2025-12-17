import React, { useState } from 'react';
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

const MyAdsDetailScreen = ({ navigation, route }) => {
  const { ad } = route.params;
  const [adStatus, setAdStatus] = useState(ad.status);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleModify = () => {
    // Navigate to edit ad screen - assuming MakeAnAdScreen can handle editing
    navigation.navigate('MakeAnAd', {
      editMode: true,
      adData: ad
    });
  };

  const handleToggleStatus = async () => {
    const currentStatus = adStatus === 'published' ? 'active' : 'inactive';
    const newStatus = currentStatus === 'active' ? 'draft' : 'published';
    const action = currentStatus === 'active' ? 'Inactivate' : 'Activate';

    Alert.alert(
      `${action} Ad`,
      `Are you sure you want to ${action.toLowerCase()} this ad?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: action,
          onPress: async () => {
            try {
              setIsLoadingStatus(true);

              const response = await advertisementService.updateAdvertisement(ad.id, {
                status: newStatus
              });

              if (response.success) {
                setAdStatus(newStatus);
                Alert.alert('Success', `Ad ${action.toLowerCase()}d successfully`);
              } else {
                throw new Error(response.message || 'Failed to update ad status');
              }
            } catch (error) {
              console.error('Error updating ad status:', error);
              Alert.alert('Error', error.message || 'Failed to update ad status. Please try again.');
            } finally {
              setIsLoadingStatus(false);
            }
          },
        },
      ]
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
          Modify {adStatus === 'active' ? 'Active' : 'Inactive'} Ad
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={ad.image} style={styles.productImage} />
          
          {/* Image Indicators */}
          <View style={styles.imageIndicators}>
            <View style={[styles.indicator, styles.activeIndicator]} />
            <View style={styles.indicator} />
            <View style={styles.indicator} />
          </View>
        </View>

        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            adStatus === 'active' ? styles.activeBadge : styles.inactiveBadge
          ]}>
            <Text style={styles.statusBadgeText}>
              {adStatus === 'active' ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        {/* Product Title and Price */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <Text style={styles.productTitle}>{ad.title}</Text>
            <Text style={styles.priceText}>BUY £300</Text>
          </View>
          
          <Text style={styles.distanceText}>Distance: {ad.distance}</Text>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            A wonderful armchair with brown covering and black legs. Hardly used. Massive wood.{' '}
            <Text style={styles.readMoreText}>Read more...</Text>
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.modifyButton}
            onPress={handleModify}
            activeOpacity={0.7}
          >
            <Text style={styles.modifyButtonText}>Modify</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusButton,
              (adStatus === 'published' ? styles.inactivateButton : styles.activateButton),
              isLoadingStatus && styles.disabledButton
            ]}
            onPress={handleToggleStatus}
            activeOpacity={0.7}
            disabled={isLoadingStatus}
          >
            {isLoadingStatus ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.statusButtonText}>
                {adStatus === 'published' ? 'Inactivate' : 'Activate'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MakeAnAd')}>
          <Ionicons name="add-circle" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Messages')}>
          <Ionicons name="mail" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('UserAccount')}>
          <Ionicons name="person" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
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
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: '#fff',
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statusBadge: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeBadge: {
    backgroundColor: '#E8F5E9',
  },
  inactiveBadge: {
    backgroundColor: '#F5F5F5',
  },
  statusBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginLeft: 16,
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
  },
  descriptionSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  readMoreText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  modifyButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  statusButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  inactivateButton: {
    backgroundColor: '#f5f5f5',
  },
  activateButton: {
    backgroundColor: COLORS.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  statusButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  bottomSpacer: {
    height: 40,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  navItem: {
    padding: 8,
  },
});

export default MyAdsDetailScreen;