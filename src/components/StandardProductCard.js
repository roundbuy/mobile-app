import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { getFullImageUrl } from '../utils/imageUtils';
import { COLORS } from '../constants/theme';

const getBadgeConfig = (badge) => {
    const level = badge.level?.toLowerCase();
    const type = badge.type?.toLowerCase();

    // Membership Badges
    if (type === 'membership') {
        switch (level) {
            case 'gold': return { color: '#FFD700', icon: 'star', label: 'Gold' };
            case 'green': return { color: '#4CAF50', icon: 'shield', label: 'Member' };
            case 'orange': return { color: '#FF9800', icon: 'flash', label: 'Member' };
            default: return { color: COLORS.primary, icon: 'user', label: 'Member' };
        }
    }

    // Reward Badges
    if (type === 'reward') {
        switch (level) {
            case 'lottery': return { color: '#9C27B0', icon: 'ticket', label: 'Lottery' };
            case 'top_search': return { color: '#2196F3', icon: 'search', label: 'Top Search' };
            case 'diligent': return { color: '#2196F3', icon: 'star', label: 'Diligent' };
            default: return { color: COLORS.primary, icon: 'gift', label: 'Reward' };
        }
    }

    // Visibility Plans
    switch (level) {
        case 'rise_to_top': return { color: '#FF5722', icon: 'rocket', label: 'Rise Up' };
        case 'top_spot': return { color: '#E91E63', icon: 'trophy', label: 'Top Spot' };
        case 'targeted': return { color: '#00BCD4', icon: 'navigate', label: 'Targeted' };
        case 'fast': return { color: '#FFC107', icon: 'flash', label: 'Fast' };
        case 'fast_ad': return { color: '#FFC107', icon: 'flash', label: 'Fast' };
        case 'urgent': return { color: '#FF4500', icon: 'alert-circle', label: 'Urgent' };
        case 'featured': return { color: '#9370DB', icon: 'star', label: 'Featured' };
        default: return null;
    }
};

const StandardProductCard = ({ products, onProductPress }) => {
    const [favorites, setFavorites] = useState(new Set());

    if (!products || products.length === 0) {
        return null;
    }

    const renderProducts = ({ item }) => {
        return (
            <TouchableOpacity
                style={styles.gridItem}
                onPress={() => onProductPress(item)}
                activeOpacity={0.7}
            >
                <View style={styles.imageContainer}>
                    {(() => {
                        let images = item.images;
                        if (typeof images === 'string') {
                            try {
                                images = JSON.parse(images);
                            } catch (e) {
                                images = [];
                            }
                        }

                        if (images && images.length > 0) {
                            return (
                                <Image
                                    source={{ uri: getFullImageUrl(images[0]) }}
                                    style={styles.image}
                                />
                            );
                        } else {
                            return (
                                <View style={[styles.image, styles.placeholder]}>
                                    <Text style={styles.placeholderText}>No Image</Text>
                                </View>
                            );
                        }
                    })()}
                    <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            setFavorites(prev => {
                                const newFavorites = new Set(prev);
                                if (newFavorites.has(item.id)) {
                                    newFavorites.delete(item.id);
                                } else {
                                    newFavorites.add(item.id);
                                }
                                return newFavorites;
                            });
                        }}
                    >
                        <FontAwesome
                            name={favorites.has(item.id) ? "heart" : "heart-o"}
                            size={24}
                            color="#333"
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.itemInfo}>
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.distanceText} numberOfLines={1}>
                        Distance: {Math.round((item.distance || 0) * 1000)} m / {Math.round((item.distance || 0) * 20)} min walk
                    </Text>
                    <Text style={styles.priceText}>£{item.price}</Text>
                </View>
            </TouchableOpacity>
        )
    };

    return (
        <View style={styles.container}>
            <View style={styles.labelContainer}>
                <Text style={styles.label}>Standard</Text>
            </View>
            {/* Top Border */}
            <View style={styles.topBorder} />

            <View style={styles.gridContainer}>
                {products.map((item) => (
                    <React.Fragment key={item.id}>
                        {renderProducts({ item })}
                    </React.Fragment>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '90%',
        paddingHorizontal: 16,
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
        paddingHorizontal: 1,
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        color: '#e0e0e0ff',
        fontWeight: '600',
        marginLeft: 6,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 0,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '42%',
        marginBottom: 16,
        marginLeft: 10,
        marginRight: 12,
        backgroundColor: '#f9f9f9', // DEBUG: distinguish from white spacing
        // borderRadius: 12,
        // overflow: 'hidden',
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 4,
        // elevation: 3,
        // borderWidth: 2,         // DEBUG: verify item boundary
        // borderColor: 'red',     // DEBUG: verify item boundary
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: '100%',
        height: 150,
        // backgroundColor: '#f0f0f0',
        borderRadius: 8,
        margin: 8,
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 14,
        // color: '#888888',
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
        marginBottom: 4,
    },
    favoriteButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 8,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 1,
        alignSelf: 'flex-start',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    badgesWrapper: {
        position: 'absolute',
        top: 8,
        left: 8,
        flexDirection: 'column',
        gap: 0,
    },
    badgesWrapperBottomLeft: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        flexDirection: 'column',
        gap: 0,
    },
});

export default StandardProductCard;
