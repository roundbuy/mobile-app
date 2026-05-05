import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Image,
    Dimensions,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';
import { getFullImageUrl } from '../../utils/imageUtils';
import apiClient from '../../services/api';

const { width, height } = Dimensions.get('window');

const ProductImageGalleryScreen = ({ navigation, route }) => {
    const { advertisementId, images: initialImages } = route.params;
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [images, setImages] = useState(initialImages || []);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (initialImages && initialImages.length > 0) {
            setImages(initialImages);
            setLoading(false);
        } else if (advertisementId) {
            fetchAdvertisementImages();
        } else {
            setLoading(false);
        }
    }, [advertisementId, initialImages]);

    const fetchAdvertisementImages = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get(`/advertisements/${advertisementId}`);
            if (res.data && res.data.data && res.data.data.advertisement) {
                let parsedImages = [];
                const adImages = res.data.data.advertisement.images;
                try {
                    if (typeof adImages === 'string') {
                        parsedImages = JSON.parse(adImages);
                    } else if (Array.isArray(adImages)) {
                        parsedImages = adImages;
                    }
                } catch (e) { console.log(e); }
                setImages(parsedImages || []);
            }
        } catch (error) {
            console.error('Failed to load images:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleScroll = (event) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);
        if (roundIndex !== activeIndex) {
            setActiveIndex(roundIndex);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.white} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={28} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {images.length > 0 ? `${activeIndex + 1} / ${images.length}` : t('No Images')}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.sliderContainer}>
                {images.length > 0 ? (
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                    >
                        {images.map((img, index) => (
                            <View key={index} style={styles.slide}>
                                <Image
                                    source={{ uri: getFullImageUrl(img) }}
                                    style={styles.image}
                                    resizeMode="contain"
                                />
                            </View>
                        ))}
                    </ScrollView>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="images-outline" size={64} color="#666" />
                        <Text style={styles.emptyText}>{t('No images available')}</Text>
                    </View>
                )}
            </View>

            {images.length > 1 && (
                <View style={styles.pagination}>
                    {images.map((_, idx) => (
                        <View
                            key={idx}
                            style={[
                                styles.dot,
                                activeIndex === idx ? styles.activeDot : null
                            ]}
                        />
                    ))}
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.white,
    },
    closeButton: {
        padding: 5,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sliderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    slide: {
        width,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: width,
        height: height * 0.7,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: '#666',
        marginTop: 16,
        fontSize: 16,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 40,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: COLORS.white,
        width: 10,
        height: 10,
        borderRadius: 5,
    }
});

export default ProductImageGalleryScreen;
