import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { advertisementService } from '../../../services';
import { getFullImageUrl } from '../../../utils/imageUtils';
import { useTranslation } from '../../../context/TranslationContext';

const ShowcaseProductSelectorScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { planType, selectedPlan, selectedDistance } = route.params;

    const [loading, setLoading] = useState(true);
    const [userAds, setUserAds] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);

    const MIN_PRODUCTS = 7;
    const MAX_PRODUCTS = 10;

    useEffect(() => {
        fetchUserAds();
    }, []);

    const fetchUserAds = async () => {
        try {
            setLoading(true);
            const response = await advertisementService.getUserAdvertisements();

            if (response.success) {
                // Filter only published ads
                const publishedAds = response.data.advertisements.filter(
                    ad => ad.status === 'published'
                );
                setUserAds(publishedAds);
            }
        } catch (error) {
            console.error('Error fetching user ads:', error);
            Alert.alert(t('Error'), t('Failed to load your advertisements'));
        } finally {
            setLoading(false);
        }
    };

    const handleProductToggle = (product) => {
        const isSelected = selectedProducts.some(p => p.id === product.id);

        if (isSelected) {
            // Remove from selection
            setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
        } else {
            // Add to selection if not at max
            if (selectedProducts.length >= MAX_PRODUCTS) {
                Alert.alert(
                    t('Maximum Reached'),
                    t(`You can select up to ${MAX_PRODUCTS} products for your showcase`)
                );
                return;
            }
            setSelectedProducts([...selectedProducts, product]);
        }
    };

    const handleContinue = () => {
        if (selectedProducts.length < MIN_PRODUCTS) {
            Alert.alert(
                t('Minimum Required'),
                t(`Please select at least ${MIN_PRODUCTS} products for your showcase`)
            );
            return;
        }

        // Navigate to cart with selected products
        navigation.navigate('VisibilityCart', {
            planType,
            selectedPlan,
            selectedDistance,
            selectedProducts: selectedProducts.map(p => p.id),
            showcaseProductIds: selectedProducts.map(p => p.id)
        });
    };

    const renderProduct = ({ item }) => {
        const isSelected = selectedProducts.some(p => p.id === item.id);
        const selectionIndex = selectedProducts.findIndex(p => p.id === item.id);

        return (
            <TouchableOpacity
                style={[styles.productCard, isSelected && styles.productCardSelected]}
                onPress={() => handleProductToggle(item)}
                activeOpacity={0.7}
            >
                {/* Selection Badge */}
                {isSelected && (
                    <View style={styles.selectionBadge}>
                        <Text style={styles.selectionBadgeText}>{selectionIndex + 1}</Text>
                    </View>
                )}

                {/* Product Image */}
                <View style={styles.imageContainer}>
                    {item.images && item.images.length > 0 ? (
                        <Image
                            source={{ uri: getFullImageUrl(item.images[0]) }}
                            style={styles.productImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Ionicons name="image-outline" size={40} color="#ccc" />
                        </View>
                    )}
                </View>

                {/* Product Info */}
                <View style={styles.productInfo}>
                    <Text style={styles.productTitle} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <Text style={styles.productPrice}>£{item.price}</Text>
                </View>

                {/* Checkbox */}
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Ionicons name="checkmark" size={18} color="#fff" />}
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>{t('Loading your products...')}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Select Products')}</Text>
                <View style={styles.headerRight} />
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
                <View style={styles.instructionRow}>
                    <Ionicons name="diamond" size={20} color="#673AB7" />
                    <Text style={styles.instructionsText}>
                        {t(`Select ${MIN_PRODUCTS}-${MAX_PRODUCTS} products for your ShowCase`)}
                    </Text>
                </View>
                <View style={styles.counterContainer}>
                    <Text style={styles.counterText}>
                        {selectedProducts.length} / {MAX_PRODUCTS} {t('selected')}
                    </Text>
                    {selectedProducts.length < MIN_PRODUCTS && (
                        <Text style={styles.minRequiredText}>
                            ({MIN_PRODUCTS - selectedProducts.length} {t('more needed')})
                        </Text>
                    )}
                </View>
            </View>

            {/* Product List */}
            {userAds.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="cube-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>{t('No published products found')}</Text>
                    <Text style={styles.emptySubtext}>
                        {t('Create some advertisements first to use ShowCasing')}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={userAds}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={styles.productList}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Continue Button */}
            {userAds.length > 0 && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.continueButton,
                            selectedProducts.length < MIN_PRODUCTS && styles.continueButtonDisabled
                        ]}
                        onPress={handleContinue}
                        disabled={selectedProducts.length < MIN_PRODUCTS}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.continueButtonText}>
                            {t('Continue')} ({selectedProducts.length})
                        </Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#505050',
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
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    headerRight: {
        width: 32,
    },
    instructionsContainer: {
        backgroundColor: '#F5F3FF',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    instructionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    instructionsText: {
        fontSize: 14,
        color: '#673AB7',
        fontWeight: '600',
        marginLeft: 8,
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    counterText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#673AB7',
    },
    minRequiredText: {
        fontSize: 14,
        color: '#303234',
        marginLeft: 8,
    },
    productList: {
        padding: 8,
    },
    productCard: {
        flex: 1,
        margin: 8,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    productCardSelected: {
        borderColor: '#673AB7',
        borderWidth: 3,
    },
    selectionBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#673AB7',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    selectionBadgeText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    imageContainer: {
        width: '100%',
        height: 140,
        backgroundColor: '#f5f5f5',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    productInfo: {
        padding: 12,
    },
    productTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
        lineHeight: 18,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#673AB7',
    },
    checkbox: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#673AB7',
        borderColor: '#673AB7',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#505050',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#303234',
        marginTop: 8,
        textAlign: 'center',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    continueButton: {
        backgroundColor: '#673AB7',
        paddingVertical: 16,
        borderRadius: 28,
        alignItems: 'center',
    },
    continueButtonDisabled: {
        backgroundColor: '#ccc',
    },
    continueButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
});

export default ShowcaseProductSelectorScreen;
