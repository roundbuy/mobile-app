import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { getFullImageUrl } from '../utils/imageUtils';
import { COLORS } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PAD = 16;      // matches PromotionsGrid
const CARD_GAP = 10;   // matches PromotionsGrid
const CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - CARD_GAP) / 2;
const IMAGE_HEIGHT = Math.round(CARD_WIDTH * 1.15);

const getBadgeConfig = (badge) => {
    const level = badge.level?.toLowerCase();
    const type = badge.type?.toLowerCase();
    if (type === 'membership') {
        switch (level) {
            case 'gold': return { color: '#FFD700', icon: 'star', label: 'Gold' };
            case 'green': return { color: '#4CAF50', icon: 'shield', label: 'Member' };
            case 'orange': return { color: '#FF9800', icon: 'flash', label: 'Member' };
            default: return { color: COLORS.primary, icon: 'user', label: 'Member' };
        }
    }
    if (type === 'reward') {
        switch (level) {
            case 'lottery': return { color: '#9C27B0', icon: 'ticket', label: 'Lottery' };
            case 'top_search': return { color: '#2196F3', icon: 'search', label: 'Top Search' };
            case 'diligent': return { color: '#2196F3', icon: 'star', label: 'Diligent' };
            default: return { color: COLORS.primary, icon: 'gift', label: 'Reward' };
        }
    }
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

const parseImages = (images) => {
    if (typeof images === 'string') {
        try { return JSON.parse(images); } catch { return []; }
    }
    return Array.isArray(images) ? images : [];
};

const StandardProductCard = ({ products, onProductPress }) => {
    const [favorites, setFavorites] = useState(new Set());

    const toggleFavorite = (id) => {
        setFavorites(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    // Empty-state: always render the section (never return null)
    const isEmpty = !products || products.length === 0;

    const renderCard = (item, index) => {
        const images = parseImages(item.images);
        return (
            <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => onProductPress(item)}
                activeOpacity={0.8}
            >
                <View style={styles.imageWrap}>
                    {images.length > 0 ? (
                        <Image
                            source={{ uri: getFullImageUrl(images[0]) }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.image, styles.imageFallback]}>
                            <FontAwesome name="image" size={32} color="#ccc" />
                        </View>
                    )}
                    <TouchableOpacity
                        style={styles.heartBtn}
                        onPress={() => toggleFavorite(item.id)}
                        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                    >
                        <FontAwesome
                            name={favorites.has(item.id) ? 'heart' : 'heart-o'}
                            size={16}
                            color={favorites.has(item.id) ? '#E91E63' : '#fff'}
                        />
                    </TouchableOpacity>
                    {item.badges && item.badges
                        .filter(b => b.type === 'visibility')
                        .map((badge, i) => {
                            const cfg = getBadgeConfig(badge);
                            if (!cfg) return null;
                            return (
                                <View key={i} style={[styles.badge, { backgroundColor: cfg.color, top: 8 + i * 22 }]}>
                                    <Ionicons name={cfg.icon} size={9} color="#fff" style={{ marginRight: 3 }} />
                                    <Text style={styles.badgeText}>{cfg.label}</Text>
                                </View>
                            );
                        })}
                </View>
                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>£{parseFloat(item.price || 0).toFixed(2)}</Text>
                        {item.distance != null && (
                            <Text style={styles.distance}>{Math.round((item.distance || 0) * 1000)}m</Text>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // Build rows of 2
    const rows = [];
    if (!isEmpty) {
        for (let i = 0; i < products.length; i += 2) {
            rows.push(products.slice(i, i + 2));
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.sectionHeader}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>Standard Listings</Text>
            </View>
            {isEmpty ? (
                <View style={styles.emptyState}>
                    <Ionicons name="search-outline" size={36} color="#ccc" />
                    <Text style={styles.emptyTitle}>No listings yet</Text>
                    <Text style={styles.emptySubtitle}>Check back soon — new items are added regularly near you.</Text>
                </View>
            ) : (
                rows.map((row, rowIdx) => (
                    <View key={rowIdx} style={styles.row}>
                        {row.map((item, colIdx) => renderCard(item, rowIdx * 2 + colIdx))}
                        {row.length === 1 && <View style={{ width: CARD_WIDTH }} />}
                    </View>
                ))
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: SCREEN_WIDTH,
        paddingHorizontal: H_PAD,
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: '#fff',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sectionAccent: {
        width: 4,
        height: 20,
        borderRadius: 2,
        backgroundColor: '#1a73e8',
        marginRight: 10,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1a1a1a',
        letterSpacing: -0.3,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 5,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#efefef',
    },
    imageWrap: {
        position: 'relative',
        width: '100%',
        height: IMAGE_HEIGHT,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageFallback: {
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heartBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        left: 8,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '700',
    },
    info: {
        padding: 10,
    },
    title: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 6,
        lineHeight: 18,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    price: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1a1a1a',
    },
    distance: {
        fontSize: 11,
        color: '#888',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
        paddingHorizontal: 24,
    },
    emptyTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#aaa',
        marginTop: 12,
        marginBottom: 6,
    },
    emptySubtitle: {
        fontSize: 13,
        color: '#bbb',
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default StandardProductCard;
