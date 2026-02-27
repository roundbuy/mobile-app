import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { COLORS } from '../constants/theme';
import { getFullImageUrl } from '../utils/imageUtils';

const { width } = Dimensions.get('window');
// A typical grid card width is ~170. This makes 2.something cards visible in the row at a given time.
const SELLER_CONTAINER_WIDTH = 170;

/**
 * InnerUserCarousel Component
 * Displays a horizontal scrollable carousel for a single user's products
 */
const InnerUserCarousel = ({ user, userIndex, onProductPress }) => {
    const { products, tier, seller_name } = user;

    // Auto-scroll logic scoped per user
    const flatListRef = useRef(null);
    const CARD_WIDTH = SELLER_CONTAINER_WIDTH; // no outer margin on the cards themselves

    // Provide a vast data array for "infinite" scroll behavior
    const isMultiple = products && products.length > 1;
    const extendedData = isMultiple
        ? Array(100).fill(products).flat().map((p, i) => ({ ...p, _uniqueIndex: i }))
        : (products || []);

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Only auto-scroll if there are multiple products
        if (!isMultiple) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % extendedData.length;

                if (flatListRef.current) {
                    flatListRef.current.scrollToIndex({
                        index: nextIndex,
                        animated: true
                    });
                }

                return nextIndex;
            });
        }, 3000); // 1.5 seconds

        return () => clearInterval(interval);
    }, [isMultiple, extendedData.length]);

    if (!products || products.length === 0) return null;

    const renderItem = ({ item, index }) => {
        // Find original product index for the press handler
        const originalIndex = index % products.length;

        return (
            <TouchableOpacity
                style={styles.productCard}
                onPress={() => onProductPress(item, userIndex, originalIndex, tier)}
                activeOpacity={0.7}
            >
                <View style={styles.labelContainerInner}>
                    <Text style={styles.label}>GarageSale {item.seller_name}</Text>
                </View>
                {/* Image Container */}
                <View style={styles.imageContainer}>
                    {item.images && item.images.length > 0 ? (
                        <Image
                            source={{ uri: getFullImageUrl(item.images[0]) }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.image, styles.placeholder]}>
                            <Text style={styles.placeholderText}>No Image</Text>
                        </View>
                    )}
                </View>

                {/* Product Info */}
                <View style={styles.itemInfo}>
                    <Text style={styles.title} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={styles.distanceText} numberOfLines={1}>
                        Distance: 0 m / 0 min walk
                    </Text>
                    <Text style={styles.priceText}>
                        £{parseFloat(item.price).toFixed(2)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.innerCarouselContainer}>
            {/* The user specifically wanted the "by [name]" text removed */}
            <FlatList
                ref={flatListRef}
                data={extendedData}
                renderItem={renderItem}
                keyExtractor={(item) => item._uniqueIndex !== undefined ? `item-${item._uniqueIndex}` : `item-${item.id}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.innerScrollContent}
                decelerationRate="fast"
                scrollEnabled={isMultiple}
                pagingEnabled
                getItemLayout={(data, index) => ({
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
 * Displays a horizontal list of horizontal carousels of HomeMarket sellers
 */
const HomeMarketCarousel = ({ homemarketGroup, onProductPress }) => {
    if (!homemarketGroup || !homemarketGroup.users || homemarketGroup.users.length === 0) {
        return null;
    }

    const { users } = homemarketGroup;

    return (
        <View style={styles.homemarketContainer}>
            {/* HomeMarket Label */}
            <View style={styles.labelContainer}>
                <Text style={styles.mainLabel}>HomeMarket</Text>
            </View>

            {/* Top Border */}
            <View style={styles.topBorder} />

            {/* Render a master horizontal scroll view for sellers */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.masterScrollContent}
                decelerationRate="fast"
                snapToInterval={SELLER_CONTAINER_WIDTH + 16} // Width + marginRight
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

            {/* Bottom Border */}
            {/* <View style={styles.bottomBorder} /> */}
        </View>
    );
};

const styles = StyleSheet.create({
    homemarketContainer: {
        marginVertical: 1,
        paddingVertical: 1,
        backgroundColor: 'transparent',
    },
    innerCarouselContainer: {
        width: SELLER_CONTAINER_WIDTH,
        marginRight: 16, // Space between different sellers
        marginBottom: 16,
    },
    topBorder: {
        height: 2,
        backgroundColor: '#e0e0e0ff',
        marginHorizontal: 5,
        marginBottom: 12,
        marginLeft: -10,
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
    labelContainerInner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
        marginTop: 12,
    },
    mainLabel: {
        fontSize: 16,
        color: '#e0e0e0ff',
        fontWeight: '700',
        marginLeft: 0,
    },
    label: {
        fontSize: 14,
        color: '#e0e0e0ff',
        fontWeight: '600',
        marginLeft: 0,
    },
    masterScrollContent: {
        paddingLeft: 16,
        paddingRight: 16, // Extra padding at end
    },
    innerScrollContent: {
        paddingLeft: 0,
        paddingRight: 0,
    },
    productCard: {
        width: SELLER_CONTAINER_WIDTH, // Exactly one column width
        marginRight: 0, // No margin for inner items because they span standard column
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
});

export default HomeMarketCarousel;
