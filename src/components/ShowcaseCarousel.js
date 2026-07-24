import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFullImageUrl } from '../utils/imageUtils';

// Shared card dimensions — keep in sync with HomeMarketCarousel
const CARD_WIDTH = 160;
const IMAGE_HEIGHT = 155;

/**
 * ShowcaseCarousel Component
 * Horizontal scrollable carousel for ShowCasing listings.
 * Card size: 160 × 155px image, matching HomeMarketCarousel.
 */
const ShowcaseCarousel = ({ showcase, onProductPress }) => {
    if (!showcase || !showcase.products || showcase.products.length < 4) {
        return null;
    }

    const { products, seller_name, showcase_group_id } = showcase;

    return (
        <View style={styles.container}>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>ShowCasing</Text>
                {seller_name ? (
                    <Text style={styles.sellerName}>  by {seller_name}</Text>
                ) : null}
            </View>

            {/* Horizontal Carousel */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                decelerationRate="fast"
            >
                {products.map((product, index) => (
                    <TouchableOpacity
                        key={product.id}
                        style={styles.card}
                        onPress={() => onProductPress(product, index, showcase_group_id)}
                        activeOpacity={0.75}
                    >
                        {/* Image */}
                        <View style={styles.imageWrap}>
                            {product.images && product.images.length > 0 ? (
                                <Image
                                    source={{ uri: getFullImageUrl(product.images[0]) }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={[styles.image, styles.imageFallback]}>
                                    <Ionicons name="image-outline" size={28} color="#ccc" />
                                </View>
                            )}
                        </View>

                        {/* Product Info */}
                        <View style={styles.info}>
                            <Text style={styles.title} numberOfLines={2}>
                                {product.title}
                            </Text>
                            {product.distance != null && (
                                <Text style={styles.distance}>
                                    {Math.round((product.distance || 0) * 1000)}m away
                                </Text>
                            )}
                            <Text style={styles.price}>
                                £{parseFloat(product.price).toFixed(2)}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 6,
        paddingVertical: 4,
        backgroundColor: '#fff',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    sectionAccent: {
        width: 4,
        height: 20,
        borderRadius: 2,
        backgroundColor: '#673AB7',
        marginRight: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
        letterSpacing: -0.3,
    },
    sellerName: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
        marginLeft: 4,
        flex: 1,
    },
    scrollContent: {
        paddingLeft: 16,
        paddingRight: 8,
        paddingBottom: 8,
    },
    card: {
        width: CARD_WIDTH,
        marginRight: 10,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    imageWrap: {
        width: '100%',
        height: IMAGE_HEIGHT,
    },
    image: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f5f5f5',
    },
    imageFallback: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: {
        padding: 10,
    },
    title: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
        lineHeight: 18,
    },
    distance: {
        fontSize: 11,
        color: '#888',
        marginBottom: 4,
    },
    price: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1a1a1a',
    },
});

export default ShowcaseCarousel;
