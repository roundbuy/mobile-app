import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { getFullImageUrl } from '../utils/imageUtils';

/**
 * ShowcaseCarousel Component
 * Displays a horizontal scrollable carousel of products using the exact same design as SearchScreen product cards
 */
const ShowcaseCarousel = ({ showcase, onProductPress }) => {
    if (!showcase || !showcase.products || showcase.products.length < 4) {
        return null;
    }

    const { products, seller_name, showcase_group_id } = showcase;
    console.log('Showcase Carousel Products:', products);
    return (
        <View style={styles.showcaseContainer}>
            {/* Showcase Label */}
            <View style={styles.labelContainer}>
                {/* <Ionicons name="diamond" size={16} color="#673AB7" /> */}
                <Text style={styles.label}>ShowCasing</Text>
            </View>
            {/* Top Border */}
            <View style={styles.topBorder} />
            {/* Seller Name */}
            <View style={styles.labelContainer}>
                {seller_name && (
                    <Text style={styles.sellerNameBelow}>by {seller_name}</Text>
                )}
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
                        style={styles.productCard}
                        onPress={() => onProductPress(product, index, showcase_group_id)}
                        activeOpacity={0.7}
                    >
                        {/* Image Container - Exact copy from SearchScreen */}
                        <View style={styles.imageContainer}>
                            {product.images && product.images.length > 0 ? (
                                <Image
                                    source={{ uri: getFullImageUrl(product.images[0]) }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={[styles.image, styles.placeholder]}>
                                    <Text style={styles.placeholderText}>No Image</Text>
                                </View>
                            )}

                            {/* ShowCase Badge - replaces visibility badges */}
                            {/* <View style={styles.badgesWrapper}>
                                <View style={styles.showcaseBadge}>
                                    <Ionicons name="diamond" size={10} color="#fff" style={{ marginRight: 4 }} />
                                    <Text style={styles.badgeText}>SHOWCASE</Text>
                                </View>
                            </View> */}
                        </View>

                        {/* Product Info - Exact copy from SearchScreen */}
                        <View style={styles.itemInfo}>
                            <Text style={styles.title} numberOfLines={1}>
                                {product.title}
                            </Text>
                            <Text style={styles.distanceText} numberOfLines={1}>
                                Distance: 0 m / 0 min walk
                            </Text>
                            <Text style={styles.priceText}>
                                £{parseFloat(product.price).toFixed(2)}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Bottom Border */}
            {/* <View style={styles.bottomBorder} /> */}
        </View>
    );
};

const styles = StyleSheet.create({
    showcaseContainer: {
        marginVertical: 1,
        paddingVertical: 1,
        backgroundColor: 'transparent',
    },
    topBorder: {
        height: 2,
        backgroundColor: '#e0e0e0ff',
        marginHorizontal: 5,
        marginBottom: 12,
        width: 395,
    },
    bottomBorder: {
        height: 2,
        backgroundColor: '#e0e0e0ff',
        marginTop: 12,
        marginHorizontal: 5,
        marginBottom: 12,
        width: 395,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        color: '#e0e0e0ff',
        fontWeight: '600',
        marginLeft: 16,
    },
    sellerName: {
        fontSize: 12,
        color: '#e0e0e0ff',
        marginLeft: 8,
        fontStyle: 'italic',
    },
    sellerNameBelow: {
        fontSize: 12,
        color: '#888',
        marginLeft: 16,
        marginBottom: 8,
        fontStyle: 'italic',
    },
    scrollContent: {
        paddingLeft: 16,
        paddingRight: 16,
    },
    // EXACT COPY OF SearchScreen gridItem styles
    productCard: {
        width: 170, // Fixed width for horizontal scroll
        marginHorizontal: 8,
        marginBottom: 0,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: '100%',
        height: 150,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        margin: 8,
        width: 'calc(100% - 16px)',
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 14,
        color: '#888888',
    },
    itemInfo: {
        padding: 8,
        paddingTop: 0,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    priceText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    distanceText: {
        color: '#303234',
        fontSize: 12,
        marginBottom: 4,
    },
    badgesWrapper: {
        position: 'absolute',
        top: 16,
        left: 16,
        flexDirection: 'column',
        gap: 4,
    },
    showcaseBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 1,
        backgroundColor: '#a5a5a5ff',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
});

export default ShowcaseCarousel;
