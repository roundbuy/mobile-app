import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView, Animated, Platform, Image } from 'react-native';
import { useTranslation } from '../../context/TranslationContext';
import { COLORS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants'; // For device ID if needed, or use a package
import api from '../../services/api'; // Import centralized API service
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const LaunchOnboardingModal = ({ visible, onClose, slides, tourId, onFinish, navigation, title = 'Back', embed = false }) => {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef(null);
    const startTimeRef = useRef(Date.now());
    const [deviceId, setDeviceId] = useState('initializing-session-id');

    // Tracking function
    const trackEvent = async (action, stepIndex = currentIndex, explicitId = null) => {
        try {
            const currentDeviceId = explicitId || deviceId || 'unknown-session';
            const payload = {
                tour_id: tourId,
                step_index: stepIndex + 1, // 1-based index for analytics
                action,
                session_id: currentDeviceId,
                device_type: Platform.OS,
                user_id: null,
                duration: Math.round((Date.now() - startTimeRef.current) / 1000) // Duration in seconds
            };

            await api.post('/onboarding/track', payload);

        } catch (error) {
            console.error('Failed to track onboarding event:', error);
        }
    };

    useEffect(() => {
        if (visible) {
            // Generate a new session ID each time the modal opens
            const newSessionId = 'session_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
            setDeviceId(newSessionId);

            setCurrentIndex(0);
            startTimeRef.current = Date.now();

            // Pass new ID explicitly to ensure 'view' event uses it immediately
            trackEvent('view', 0, newSessionId);
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
            if (embed) {
                // If embedded and on first slide, maybe do nothing or call onClose?
                // For Launch Onboarding, first slide has "Skip" which calls onClose.
                // Back button on first slide usually not needed or disabled.
            } else {
                handleSkip(); // Close if on first slide (acts as Back to app)
            }
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

    const renderContent = () => (
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
                        <View key={index} style={[styles.slide, { backgroundColor: slide.backgroundColor || '#fff' }]}>
                            {/* Slide Content based on Type */}
                            {slide.type === 'welcome' ? (
                                <View style={[styles.welcomeContainer, { justifyContent: slide.align === 'left' ? 'flex-start' : 'center' }]}>
                                    <View style={[styles.welcomeHeader, { alignItems: slide.align === 'left' ? 'flex-start' : 'center' }]}>
                                        {slide.image && (
                                            <Image
                                                source={slide.image}
                                                style={styles.welcomeLogo}
                                                resizeMode="contain"
                                            />
                                        )}
                                    </View>
                                    <View style={[styles.welcomeContent, { alignItems: slide.align === 'left' ? 'flex-start' : 'center' }]}>
                                        {slide.heading && <Text style={[styles.welcomeHeading, { textAlign: slide.align === 'left' ? 'left' : 'center' }]}>{slide.heading}</Text>}

                                        {/* List */}
                                        {slide.list && slide.list.map((item, i) => (
                                            <Text key={i} style={[styles.welcomeListItem, { textAlign: slide.align === 'left' ? 'left' : 'center' }]}>{t(item)}</Text>
                                        ))}

                                        {slide.description && <Text style={[styles.welcomeDescription, { textAlign: slide.align === 'left' ? 'left' : 'center', fontWeight: 'bold', marginTop: 15 }]}>{slide.description}</Text>}
                                    </View>
                                    <View style={styles.welcomeFooter}>
                                        {slide.buttons && slide.buttons.map((btn, i) => (
                                            <TouchableOpacity
                                                key={i}
                                                style={[styles.welcomeButton, { backgroundColor: btn.backgroundColor }]}
                                                onPress={btn.action === 'next' ? handleNext : handleSkip}
                                            >
                                                <Text style={[styles.welcomeButtonText, { color: btn.textColor }]}>{t(btn.text)}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.stepContainer}>
                                    {/* Image Top Center */}
                                    <View style={styles.stepImageContainer}>
                                        {slide.image && (
                                            <Image
                                                source={slide.image}
                                                style={styles.stepImage}
                                                resizeMode="contain"
                                            />
                                        )}
                                    </View>

                                    {/* Header: Step Number & Title */}
                                    <View style={styles.stepHeader}>
                                        <Text style={styles.stepLabel}>{slide.stepLabel}</Text>
                                        <Text style={styles.stepTitle}>{slide.title}</Text>
                                    </View>

                                    {/* List */}
                                    <View style={styles.stepListContainer}>
                                        {slide.list && slide.list.map((item, i) => (
                                            <View key={i} style={styles.stepListItemRow}>
                                                <View style={styles.bulletPoint} />
                                                <Text style={styles.stepListItem}>{t(item)}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {/* Footer (Dots + Buttons) */}
                                    <View style={styles.stepFooter}>
                                        {/* Pagination Dots */}
                                        <View style={styles.pagination}>
                                            {slides.map((slide, i) => {
                                                if (slide.type === 'welcome') return null; // Skip dot for welcome slide
                                                const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                                                const dotWidth = scrollX.interpolate({
                                                    inputRange,
                                                    outputRange: [14, 14, 14], // Fixed width dots for this design
                                                    extrapolate: 'clamp',
                                                });
                                                const opacity = scrollX.interpolate({
                                                    inputRange,
                                                    outputRange: [0.3, 1, 0.9],
                                                    extrapolate: 'clamp',
                                                });
                                                // Specific dot color for white bg slides usually green
                                                return (
                                                    <Animated.View
                                                        key={i}
                                                        style={[
                                                            styles.dot,
                                                            { width: dotWidth, opacity, backgroundColor: '#7BFB2D' }
                                                        ]}
                                                    />
                                                );
                                            })}
                                        </View>

                                        {/* Buttons */}
                                        <View style={styles.stepButtonsContainer}>
                                            <TouchableOpacity
                                                style={styles.stepPrimaryButton}
                                                onPress={index === slides.length - 1 ? handleFinish : handleNext}
                                            >
                                                <Text style={styles.stepPrimaryButtonText}>
                                                    {index === slides.length - 1 ? t("Let's get Started") : t('Continue')}
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity style={styles.stepBackButton} onPress={handleBack}>
                                                <Text style={styles.stepBackButtonText}>{t('Back')}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>
            </View>
        </View>
    );

    if (embed) {
        return renderContent();
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleSkip}
        >
            {renderContent()}
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
    },
    slide: {
        width: width,
        height: '100%',
    },

    // Welcome Slide Styles
    welcomeContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 60,
        // justifyContent: 'center', // REMOVED to allow top alignment if needed, or controlled by props
    },
    welcomeHeader: {
        marginBottom: 20,
        // alignItems: 'center', // Controlled by dynamic style
    },
    welcomeLogo: {
        width: 180,
        height: 70,
        marginLeft: -15,
    },
    logoPlaceholder: {
        width: 150,
        height: 50,
        backgroundColor: 'rgba(255,255,255,0.2)', // Visual placeholder
        borderRadius: 8,
    },
    welcomeContent: {
        flex: 1,
        // alignItems: 'center', // Controlled by dynamic style
    },
    welcomeHeading: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 20,
        marginTop: 20,
        // textAlign: 'center', // Controlled by dynamic style
    },
    welcomeDescription: {
        fontSize: 20,
        color: '#FFFFFF',
        marginBottom: 15,
        lineHeight: 22,
        fontWeight: '900',
        marginVertical: 20,
        // textAlign: 'center', // Controlled by dynamic style
    },
    welcomeListItem: {
        fontSize: 20,
        color: '#FFFFFF',
        marginBottom: 15,
        fontWeight: '900', // Bold as requested
        marginVertical: 20,
        // textAlign: 'center', // Controlled by dynamic style
    },
    welcomeFooter: {
        marginBottom: 50,
        gap: 15,
        width: '100%',
        alignItems: 'center',
    },
    welcomeButton: {
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        width: '100%',
    },
    welcomeButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },

    // Step Slide Styles
    stepContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 100,
    },
    stepImageContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    stepImage: {
        width: 180,
        height: 70,
    },
    imagePlaceholder: {
        width: 180,
        height: 70,
        borderRadius: 75, // Circular placeholder? Or keep rect?
        // Let's stick to user request "top all center: Image"
    },
    stepHeader: {
        alignItems: 'center',
        marginBottom: 40,
    },
    stepLabel: {
        fontSize: 30,
        fontWeight: '900',
        color: '#001C64', // Green usually
        marginBottom: 5,
    },
    stepTitle: {
        fontSize: 30,
        fontWeight: '900',
        color: '#001C64',
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    stepListContainer: {
        paddingHorizontal: 60,
        width: '100%',
    },
    stepListItemRow: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    bulletPoint: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#000',
        marginTop: 8,
        marginRight: 10,
    },
    stepListItem: {
        fontSize: 20,
        color: '#333333',
        lineHeight: 20,
        flex: 1,
        fontWeight: '500',
    },
    stepFooter: {
        marginTop: 'auto',
        width: '100%',
        paddingBottom: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    pagination: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    dot: {
        height: 14,
        borderRadius: 7,
        marginHorizontal: 3,
    },
    stepButtonsContainer: {
        width: '100%',
        gap: 12,
    },
    stepPrimaryButton: {
        backgroundColor: '#001C64', // Dark Blue
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        width: '100%',
    },
    stepPrimaryButtonText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    stepBackButton: {
        backgroundColor: '#F5F5F5',
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        width: '100%',
    },
    stepBackButtonText: {
        color: '#000000',
        fontSize: 20,
        fontWeight: '500',
    },
});

export default LaunchOnboardingModal;
