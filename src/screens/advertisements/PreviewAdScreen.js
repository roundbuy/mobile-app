import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';
import { advertisementService } from '../../services';
import { useTranslation } from '../../context/TranslationContext';

const PreviewAdScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);

  // Extract advertisement data from route params
  const {
    title = '',
    description = '',
    images = [],
    category_id,
    subcategory_id,
    activity_id,
    condition_id,
    age_id,
    size_id,
    color_id,
    gender_id,
    price,
    location_id,
    displayTime = '60days'
  } = route.params || {};

  const handleSave = async () => {
    if (!title || !description) {
      Alert.alert(t('Error'), t('Title and description are required'));
      return;
    }

    setIsSaving(true);

    try {
      // Prepare advertisement data
      const adData = {
        title,
        description,
        images,
        category_id,
        subcategory_id,
        activity_id,
        condition_id,
        gender_id,
        age_id,
        size_id,
        color_id,
        price: price || 0,
        location_id,
        display_duration_days: displayTime === '60days' ? 60 : null, // null for continuous
      };

      // Create advertisement
      const response = await advertisementService.createAdvertisement(adData);

      if (response.success) {
        // Navigate to success screen
        navigation.navigate('AdCreationSuccess', {
          advertisement: response.data.advertisement,
        });
      } else {
        Alert.alert(t('Error'), response.message || t('Failed to create advertisement'));
      }
    } catch (error) {
      console.error('Save advertisement error:', error);
      Alert.alert(t('Error'), error.message || t('Failed to save advertisement'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinue = () => {
    navigation.navigate('AdPaymentMethod', {
      ...route.params,
    });
  };

  return (
    <SafeScreenContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('Preview and Check')}</Text>
          {/* <Text style={styles.stepIndicator}>4/8</Text> */}
        </View>

        {/* Product Image */}
        <View style={styles.imageContainer}>
          {images && images.length > 0 ? (
            <View style={styles.imagePlaceholder}>
              <Image
                source={{ uri: images[0].startsWith('http') ? images[0] : `http://localhost:5001${images[0]}` }}
                style={styles.imageBox}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <View style={[styles.imageBox, styles.placeholderBox]}>
                <Text style={styles.placeholderText}>{t('No Image')}</Text>
              </View>
            </View>
          )}
          {/* Image Dots */}
          <View style={styles.dotsContainer}>
            {images && images.length > 0 ? (
              images.slice(0, 3).map((_, index) => (
                <View key={index} style={[styles.dot, index === 0 && styles.dotActive]} />
              ))
            ) : (
              <>
                <View style={[styles.dot, styles.dotActive]} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </>
            )}
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <View style={styles.productLeft}>
              <Text style={styles.productTitle}>{title || 'Untitled Ad'}</Text>
              <Text style={styles.productDistance}>
                Display Time: {displayTime === '60days' ? '60 days' : 'Continuous'}
              </Text>
            </View>
            {price && (
              <View style={styles.priceContainer}>
                <Text style={styles.priceText}>£{price}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>{t('Description')}</Text>
            <Text style={styles.descriptionText}>
              {description || 'No description provided.'}
              {description && description.length > 100 && (
                <Text style={styles.readMore}>{t('Read more...')}</Text>
              )}
            </Text>
          </View>

          {/* Filter Information */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>{t('Advertisement Details')}</Text>

            <View style={styles.filterGrid}>
              {/* Category */}
              {route.params?.categoryName && (
                <View style={styles.filterItem}>
                  <Text style={styles.filterLabel}>{t('Category:')}</Text>
                  <Text style={styles.filterValue}>{route.params.categoryName}</Text>
                </View>
              )}

              {/* Subcategory */}
              {route.params?.subcategoryName && (
                <View style={styles.filterItem}>
                  <Text style={styles.filterLabel}>{t('Subcategory:')}</Text>
                  <Text style={styles.filterValue}>{route.params.subcategoryName}</Text>
                </View>
              )}

              {/* Activity */}
              {route.params?.activityName && (
                <View style={styles.filterItem}>
                  <Text style={styles.filterLabel}>{t('Activity:')}</Text>
                  <Text style={styles.filterValue}>{route.params.activityName}</Text>
                </View>
              )}

              {/* Price */}
              {route.params?.price && (
                <View style={styles.filterItem}>
                  <Text style={styles.filterLabel}>{t('Price:')}</Text>
                  <Text style={styles.filterValue}>£{route.params.price}</Text>
                </View>
              )}

              {/* Condition */}
              {route.params?.conditionName && (
                <View style={styles.filterItem}>
                  <Text style={styles.filterLabel}>{t('Condition:')}</Text>
                  <Text style={styles.filterValue}>{route.params.conditionName}</Text>
                </View>
              )}

              {/* Gender */}
              {route.params?.genderName && (
                <View style={styles.filterItem}>
                  <Text style={styles.filterLabel}>{t('Gender:')}</Text>
                  <Text style={styles.filterValue}>{route.params.genderName}</Text>
                </View>
              )}

              {/* Age */}
              {route.params?.ageName && (
                <View style={styles.filterItem}>
                  <Text style={styles.filterLabel}>{t('Age:')}</Text>
                  <Text style={styles.filterValue}>{route.params.ageName}</Text>
                </View>
              )}

              {/* Size */}
              {route.params?.sizeName && (
                <View style={styles.filterItem}>
                  <Text style={styles.filterLabel}>{t('Size:')}</Text>
                  <Text style={styles.filterValue}>{route.params.sizeName}</Text>
                </View>
              )}

              {/* Color */}
              {route.params?.colorName && (
                <View style={styles.filterItem}>
                  <Text style={styles.filterLabel}>{t('Color:')}</Text>
                  <Text style={styles.filterValue}>{route.params.colorName}</Text>
                </View>
              )}

              {/* Location */}
              {route.params?.location && (
                <View style={[styles.filterItem, styles.filterItemFull]}>
                  <Text style={styles.filterLabel}>{t('Location:')}</Text>
                  <Text style={styles.filterValue}>
                    {route.params.location.name}
                    {'\n'}
                    <Text style={styles.filterSubValue}>
                      {[
                        route.params.location.street,
                        route.params.location.city,
                        route.params.location.region,
                        route.params.location.country,
                        route.params.location.zip_code
                      ].filter(Boolean).join(', ')}
                    </Text>
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.saveButtonText}>{t('Saving...')}</Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>{t('Save The Ad')}</Text>
            )}
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={[styles.actionButton, styles.continueButton]}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>{t('Continue to Payment')}</Text>
          </TouchableOpacity> */}
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  backButton: {
    fontSize: 28,
    color: '#000',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    flex: 1,
    marginLeft: 16,
  },
  stepIndicator: {
    fontSize: 16,
    color: '#666',
  },
  imageContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  imageBox: {
    width: '100%',
    height: '100%',
  },
  placeholderBox: {
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D0D0D0',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#666',
  },
  productInfo: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  productLeft: {
    flex: 1,
    marginRight: 12,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  productDistance: {
    fontSize: 13,
    color: '#666',
  },
  priceContainer: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  descriptionSection: {
    marginTop: 8,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  readMore: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  buttonContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#4CAF50', // Green for save
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: COLORS.primary,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  filterItem: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  filterItemFull: {
    width: '100%',
  },
  filterLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  filterValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  filterSubValue: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666',
    lineHeight: 18,
  },
  bottomSpace: {
    height: 30,
  },
});

export default PreviewAdScreen;