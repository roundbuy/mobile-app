import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, SafeAreaView, TouchableOpacity } from 'react-native';
import { useTranslation } from '../../context/TranslationContext';
import GlobalHeader from '../../components/GlobalHeader';
import { COLORS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const HowItWorksDetailScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { category, title, steps, benefits } = route.params;
    const [activeIndex, setActiveIndex] = useState(0);

    const handleScroll = (event) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);
        setActiveIndex(roundIndex);
    };

    const renderStepSlide = (step, index) => (
        <View key={index} style={styles.slide}>
            <View style={styles.imagePlaceholder} />
            <View style={styles.contentContainer}>
                <Text style={styles.stepNumber}>{index + 1}. {step.title}</Text>
                <Text style={styles.stepDescription}>{step.text}</Text>
            </View>
        </View>
    );

    const renderBenefitsSlide = () => (
        <View style={styles.slide}>
            <View style={styles.benefitsContainer}>
                {/* <Text style={styles.benefitsTitle}>{t('Benefits')}</Text> */}
                {/* Title is in header, design shows content centered */}

                <View style={styles.benefitsContent}>
                    {benefits ? benefits.map((benefit, index) => (
                        <View key={index} style={styles.benefitItem}>
                            <Text style={styles.benefitTextTitle}>{t('Lorem ipsum')}</Text>
                            <Text style={styles.benefitTextSubtitle}>{t('Dolores est')}</Text>
                            <Text style={styles.benefitTextValue}>{t('100%')}</Text>
                        </View>
                    )) : (
                        [1, 2, 3].map((_, index) => (
                            <View key={index} style={styles.benefitItem}>
                                <Text style={styles.benefitTextTitle}>{t('Lorem ipsum')}</Text>
                                <Text style={styles.benefitTextSubtitle}>{t('Dolores est')}</Text>
                                <Text style={styles.benefitTextValue}>{t('100%')}</Text>
                            </View>
                        ))
                    )}
                </View>
            </View>
        </View>
    );

    // Combine steps and benefits for the carousel
    // Steps are 0, 1, 2. Benefits is index 3.
    const totalSlides = (steps ? steps.length : 0) + 1;

    return (
        <SafeAreaView style={styles.container}>
            <GlobalHeader
                title={title}
                navigation={navigation}
                showBackButton={true}
            />

            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                {steps && steps.map((step, index) => renderStepSlide(step, index))}
                {renderBenefitsSlide()}
            </ScrollView>

            <View style={styles.pagination}>
                {Array.from({ length: totalSlides }).map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.paginationDot,
                            activeIndex === index ? styles.paginationDotActive : styles.paginationDotInactive,
                        ]}
                    />
                ))}
            </View>

            <View style={styles.bottomArrowContainer}>
                <Ionicons name="chevron-down" size={24} color="#000" />
            </View>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        // height: '100%',
    },
    slide: {
        width: width,
        padding: 20,
        // justifyContent: 'center', 
    },
    imagePlaceholder: {
        width: '100%',
        height: 400, // Large distinct area as per design Green box
        backgroundColor: '#E6F4EA', // Light green as per design
        borderRadius: 0,
        marginBottom: 30,
    },
    contentContainer: {
        paddingHorizontal: 10,
    },
    stepNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
    },
    stepDescription: {
        fontSize: 14,
        color: '#333',
        lineHeight: 22,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: '#555',
    },
    paginationDotInactive: {
        backgroundColor: '#ccc',
    },
    bottomArrowContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    // Benefits Styles
    benefitsContainer: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center', // Center vertically if needed, or just top padded
        paddingTop: 40,
        alignItems: 'center',
    },
    benefitsContent: {
        alignItems: 'center',
        width: '100%',
    },
    benefitItem: {
        alignItems: 'center',
        marginBottom: 40,
    },
    benefitTextTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#7CB342', // Light Green
        marginBottom: 4,
        textAlign: 'center',
    },
    benefitTextSubtitle: {
        fontSize: 14,
        color: '#000',
        marginBottom: 4,
        textAlign: 'center',
        fontWeight: '500',
    },
    benefitTextValue: {
        fontSize: 32,
        fontWeight: '900', // Extra bold
        color: '#000',
        textAlign: 'center',
    }
});

export default HowItWorksDetailScreen;
