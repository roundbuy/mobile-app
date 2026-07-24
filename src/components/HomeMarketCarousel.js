import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFullImageUrl } from '../utils/imageUtils';

// Shared card dimensions — must match ShowcaseCarousel
const CARD_WIDTH = 160;
const IMAGE_HEIGHT = 155;

/**
 * InnerUserCarousel
 * Auto-scrolling horizontal carousel for a single seller's products.
 */
const InnerUserCarousel = ({ user, userIndex, onProductPress }) => {
    const { products, tier, seller_name } = user;

    const flatListRef = useRef(null);
    const isMultiple = products && products.length > 1;

    // Create extended data for "infinite" auto-scroll
    const extendedData = isMultiple
        ? Array(100).fill(products).flat().map((p, i) => ({ ...p, _uniqueIndex: i }))
        : (products || []);

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!isMultiple) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => {
                const next = (prev + 1) % extendedData.length;
                if (flatListRef.current) {
                    flatListRef.current.scrollToIndex({ index: next, animated: true });
                }
                return next;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, [isMultiple, extendedData.length]);

    if (!products || products.length === 0) return null;

    const renderItem = ({ item, index }) => {
        const originalIndex = index % products.length;
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => onProductPress(item, userIndex, originalIndex, tier)}
                activeOpacity={0.75}
            >
                {/* Image */}
                <View style={styles.imageWrap}>
                    {item.images && item.images.length > 0 ? (
                        <Image
                            source={{ uri: getFullImageUrl(item.images[0]) }}
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
                    <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                    {item.distance != null && (
                        <Text style={styles.distance}>
                            {Math.round((item.distance || 0) * 1000)}m away
                        </Text>
                    )}
                    <Text style={styles.price}>£{parseFloat(item.price).toFixed(2)}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.innerContainer}>
            {seller_name ? (
                <Text style={styles.sellerLabel} numberOfLines={1}>{seller_name}</Text>
            ) : null}
            <FlatList
                ref={flatListRef}
                data={extendedData}
                renderItem={renderItem}
                keyExtractor={(item) =>
                    item._uniqueIndex !== undefined
                        ? `hm-${item._uniqueIndex}`
                        : `hm-${item.id}`
                }
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.innerScrollContent}
                decelerationRate="fast"
                scrollEnabled={isMultiple}
                pagingEnabled
                getItemLayout={(_, index) => ({
                    length: CARD_WIDTH,
                    offset: CARD_WIDTH * index,
                    index,
                })}
            />
        </View>
    );
};

/**
 * HomeMarketCarousel Component
 * Horizontal list of seller carousels for HomeMarket listings.
 * Card size: 160 × 155px image — matches ShowcaseCarousel.
 */
const HomeMarketCarousel = ({ homemarketGroup, onProductPress }) => {
    if (!homemarketGroup || !homemarketGroup.users || homemarketGroup.users.length === 0) {
        return null;
    }

    const { users } = homemarketGroup;

    return (
        <View style={styles.container}>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>Home Market</Text>
            </View>

            {/* Master horizontal scroll — one slot per seller */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.masterScrollContent}
                decelerationRate="fast"
                snapToInterval={CARD_WIDTH + 10}   // card + gap
                snapToAlignment="start"
            >
                {users.map((user, index) => (
                    <InnerUserCarousel
                        key={`hm-user-${user.seller_id || index}`}
                        user={user}
                        userIndex={index}
                        onProductPress={onProductPress}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    // ── Outer container ──────────────────────────────────────────────────────
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
        backgroundColor: '#2196F3',
        marginRight: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
        letterSpacing: -0.3,
    },
    masterScrollContent: {
        paddingLeft: 16,
        paddingRight: 8,
        paddingBottom: 8,
    },

    // ── Per-seller inner carousel ──────────────────────────────────────────
    innerContainer: {
        width: CARD_WIDTH,
        marginRight: 10,
    },
    sellerLabel: {
        fontSize: 11,
        color: '#888',
        fontStyle: 'italic',
        marginBottom: 6,
        paddingHorizontal: 2,
    },
    innerScrollContent: {
        // no extra padding; FlatList is already sized to CARD_WIDTH
    },

    // ── Product card ─────────────────────────────────────────────────────────
    card: {
        width: CARD_WIDTH,
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

export default HomeMarketCarousel;
