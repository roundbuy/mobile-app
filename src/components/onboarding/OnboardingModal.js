import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView, Animated } from 'react-native';
import { useTranslation } from '../../context/TranslationContext';
import { COLORS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants'; // For device ID if needed, or use a package
import api from '../../services/api'; // Import centralized API service

const { width, height } = Dimensions.get('window');

const OnboardingModal = ({ visible, onClose, slides, tourId, onFinish, navigation, title = 'Back' }) => {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef(null);
    const startTimeRef = useRef(Date.now());

    // ... (keep trackEvent and useEffect)

    // Tracking function (mock for now, replace with actual API call)
    const trackEvent = async (action, stepIndex = currentIndex) => {
        try {
            const payload = {
                tour_id: tourId,
                step_index: stepIndex + 1, // 1-based index for analytics
                action,
                session_id: 'device-id-placeholder', // Replace with actual device ID logic
                device_type: 'ios', // Dynamic
                user_id: null // Pass if available
            };

            await api.post('/onboarding/track', payload);

        } catch (error) {
            console.error('Failed to track onboarding event:', error);
        }
    };

    useEffect(() => {
        if (visible) {
            setCurrentIndex(0);
            startTimeRef.current = Date.now();
            trackEvent('view', 0);
        }
    }, [visible]);

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            const nextIndex = currentIndex + 1;
            slidesRef.current.scrollTo({ x: nextIndex * width, animated: true });
            setCurrentIndex(nextIndex);
            trackEvent('next', currentIndex);
        } else {
            handleFinish();
        }
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            slidesRef.current.scrollTo({ x: prevIndex * width, animated: true });
            setCurrentIndex(prevIndex);
            trackEvent('back', currentIndex);
        } else {
            handleSkip(); // Close if on first slide (acts as Back to app)
        }
    };

    const handleFinish = () => {
        trackEvent('finish', currentIndex);
        onFinish();
    };

    const handleSkip = () => {
        trackEvent('skip', currentIndex);
        onClose();
    };

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: false }
    );

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true} // Changed back to true to support animation properly, but container is white
            onRequestClose={handleSkip}
        >
            <View style={styles.container}>
                <View style={styles.modalContent}>
                    {/* Slides */}
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        bounces={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={32}
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={viewConfig}
                        ref={slidesRef}
                    >
                        {slides.map((slide, index) => (
                            <View key={index} style={styles.slide}>
                                {/* Header inside the slide */}
                                <View style={styles.header}>
                                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                                        <Ionicons name="chevron-back" size={28} color="#000" />
                                        <Text style={styles.headerTitle}>{t(slide.title)}</Text>
                                    </TouchableOpacity>
                                    <View style={{ width: 40 }} />
                                </View>

                                <View style={styles.slideContent}>
                                    {/* Image Placeholder - Increased Height */}
                                    <View style={[styles.imagePlaceholder, { backgroundColor: '#dcedc8' }]}>
                                        {/* You can add icons or images here based on slide.image prop */}
                                    </View>

                                    <ScrollView style={styles.textScrollView} showsVerticalScrollIndicator={false}>
                                        <View style={styles.textContainer}>
                                            {/* Display heading key after image */}
                                            {slide.heading && <Text style={styles.title}>{t(slide.heading)}</Text>}
                                            <Text style={styles.description}>{t(slide.description)}</Text>
                                            {/* Value Propositions List if present */}
                                            {slide.list && slide.list.map((item, i) => (
                                                <Text key={i} style={styles.listItem}>• {t(item)}</Text>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Pagination Dots */}
                    <View style={styles.pagination}>
                        {slides.map((_, index) => {
                            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
                            const dotWidth = scrollX.interpolate({
                                inputRange,
                                outputRange: [10, 20, 10],
                                extrapolate: 'clamp',
                            });
                            const opacity = scrollX.interpolate({
                                inputRange,
                                outputRange: [0.3, 1, 0.3],
                                extrapolate: 'clamp',
                            });
                            return (
                                <Animated.View key={index} style={[styles.dot, { width: dotWidth, opacity }]} />
                            );
                        })}
                    </View>

                    {/* Footer / Buttons */}
                    <View style={styles.footer}>
                        {currentIndex === slides.length - 1 ? (
                            <TouchableOpacity style={styles.button} onPress={handleFinish}>
                                <Text style={styles.buttonText}>{t(slides[currentIndex].buttonText || 'Get Started')}</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.textButton} onPress={handleNext}>
                                <Text style={styles.textButtonLabel}>{t('Continue')}</Text>
                                <Ionicons name="chevron-down" size={24} color="#fff" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalContent: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60, // Increased for safe area
        paddingBottom: 10,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        color: '#000',
        fontWeight: '600',
        marginLeft: 5,
    },
    slide: {
        width: width,
        padding: 0, // Removed padding to let image be full width if needed, or controlled by inner view
    },
    slideContent: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
    },
    imagePlaceholder: {
        width: '100%', // Full width
        height: height * 0.5, // 50% of screen height (Increased)
        marginBottom: 20,
        // Removed borderRadius to look more like a cover image if intended
    },
    textScrollView: {
        width: '100%',
        paddingHorizontal: 30, // Add side padding for text
    },
    textContainer: {
        width: '100%',
        paddingBottom: 20,
    },
    title: {
        fontSize: 26, // Larger title
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15,
        textAlign: 'center',
    },
    description: {
        fontSize: 18, // Larger description
        color: '#555',
        lineHeight: 26,
        marginBottom: 20,
        textAlign: 'center',
    },
    listItem: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
        fontWeight: '500',
        paddingLeft: 10,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
        marginHorizontal: 4,
    },
    footer: {
        padding: 20,
        alignItems: 'center',
        paddingBottom: 50,
    },
    button: {
        backgroundColor: '#f5f5f5',
        paddingVertical: 18,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    textButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 18,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    textButtonLabel: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        marginRight: 8,
    },
});

export default OnboardingModal;
