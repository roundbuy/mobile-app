import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { advertisementService } from '../../../services';
import { useTranslation } from '../../../context/TranslationContext';

const EditAdLocationsScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { adData } = route.params;

    const [userLocations, setUserLocations] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Initialize selected locations from ad data
        if (adData && adData.locations) {
            setSelectedLocations(adData.locations.map(loc => loc.id));
        }
        loadUserLocations();
    }, [adData]);

    const loadUserLocations = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await advertisementService.getUserLocations();
            if (response.success) {
                setUserLocations(response.data.locations || []);
            } else {
                setError(t('Failed to load your locations'));
            }
        } catch (err) {
            console.error('Error loading user locations:', err);
            setError(t('Failed to load your locations'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const toggleLocation = (locationId) => {
        setSelectedLocations(prev => {
            if (prev.includes(locationId)) {
                return prev.filter(id => id !== locationId);
            } else {
                return [...prev, locationId];
            }
        });
    };

    const handleSave = async () => {
        if (selectedLocations.length === 0) {
            Alert.alert(t('Validation Error'), t('Please select at least one location for your advertisement.'));
            return;
        }

        try {
            setIsSaving(true);
            const response = await advertisementService.updateAdvertisement(adData.id, {
                location_ids: selectedLocations
            });

            if (response.success) {
                // Send back updated locations
                const updatedLocationData = userLocations.filter(loc => selectedLocations.includes(loc.id));
                Alert.alert(t('Success'), t('Advertisement locations updated successfully'), [
                    {
                        text: t('OK'),
                        onPress: () => {
                            // Usually we might update route params or use a callback, or rely on screen fetching
                            // Here we will navigate back and pass the new locations
                            navigation.navigate('MyAdsDetail', {
                                updatedAd: {
                                    ...adData,
                                    locations: updatedLocationData
                                }
                            });
                        }
                    }
                ]);
            } else {
                throw new Error(response.message || 'Failed to update locations');
            }
        } catch (error) {
            console.error('Error updating ad locations:', error);
            Alert.alert(t('Error'), error.message || t('Failed to update locations. Please try again.'));
        } finally {
            setIsSaving(false);
        }
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="chevron-back" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('Edit Locations')}</Text>
            <View style={{ width: 28 }} />
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {renderHeader()}

            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>{t('Loading your locations...')}</Text>
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadUserLocations}>
                        <Text style={styles.retryButtonText}>{t('Retry')}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <Text style={styles.subtitle}>
                        {t('Select the locations where this advertisement should be visible.')}
                    </Text>

                    {userLocations.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>{t('No locations found')}</Text>
                            <Text style={styles.emptyStateSubtext}>{t('Please add a location in your account settings first')}</Text>
                        </View>
                    ) : (
                        <View style={styles.locationsList}>
                            {userLocations.map((location) => {
                                const isSelected = selectedLocations.includes(location.id);
                                const addressParts = [
                                    location.street,
                                    location.street2,
                                    location.city,
                                    location.region,
                                    location.country,
                                    location.zip_code
                                ].filter(Boolean).join(', ');

                                return (
                                    <TouchableOpacity
                                        key={location.id}
                                        style={[
                                            styles.locationItem,
                                            isSelected && styles.locationItemSelected
                                        ]}
                                        onPress={() => toggleLocation(location.id)}
                                    >
                                        <View style={styles.locationInfoContainer}>
                                            <View style={styles.locationHeader}>
                                                <Text style={[
                                                    styles.locationName,
                                                    isSelected && styles.locationNameSelected
                                                ]}>
                                                    {location.name}
                                                </Text>
                                            </View>
                                            <Text style={styles.locationAddress}>
                                                {addressParts}
                                            </Text>
                                            {location.is_default ? (
                                                <View style={styles.defaultBadge}>
                                                    <Text style={styles.defaultBadgeText}>{t('Default')}</Text>
                                                </View>
                                            ) : null}
                                        </View>

                                        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                            {isSelected ? <Text style={styles.checkmark}>✓</Text> : null}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}

                    <View style={styles.bottomSpacer} />
                </ScrollView>
            )}

            {/* Footer */}
            {!isLoading && !error && userLocations.length > 0 && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.saveButton, (isSaving || selectedLocations.length === 0) && styles.disabledButton]}
                        onPress={handleSave}
                        disabled={isSaving || selectedLocations.length === 0}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Text style={styles.saveButtonText}>
                                {t('Save Locations')} ({selectedLocations.length})
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    content: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#505050',
    },
    errorText: {
        fontSize: 16,
        color: '#FF4444',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 14,
        color: '#505050',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    locationsList: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    locationItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    locationItemSelected: {
        borderColor: COLORS.primary,
        backgroundColor: '#F0F8FF',
    },
    locationInfoContainer: {
        flex: 1,
        marginRight: 10,
    },
    locationHeader: {
        marginBottom: 4,
    },
    locationName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    locationNameSelected: {
        color: COLORS.primary,
    },
    locationAddress: {
        fontSize: 14,
        color: '#505050',
        lineHeight: 20,
    },
    defaultBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    defaultBadgeText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#C0C0C0',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    checkboxSelected: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary,
        borderWidth: 0,
    },
    checkmark: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    emptyState: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#505050',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#303234',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledButton: {
        backgroundColor: '#CCC',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    bottomSpacer: {
        height: 20,
    },
});

export default EditAdLocationsScreen;
