import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, SafeAreaView, Image } from 'react-native';
import { useTranslation } from '../../context/TranslationContext';
import GlobalHeader from '../../components/GlobalHeader';
import { COLORS } from '../../constants/theme';
import { IMAGES } from '../../assets/images';

const { width } = Dimensions.get('window');

const AboutUsScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollViewRef = useRef(null);

    const slides = [
        { id: 'founder', title: t('About Us') }, // Slide 1
        { id: 'journey', title: t('Journey') },   // Slide 2
        { id: 'mission', title: t('Our Mission') }, // Slide 3
        { id: 'values', title: t('Value propositions') } // Slide 4
    ];

    const handleScroll = (event) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);
        setActiveIndex(roundIndex);
    };

    const renderPagination = () => (
        <View style={styles.paginationContainer}>
            {slides.map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.paginationDot,
                        activeIndex === index ? styles.paginationDotActive : styles.paginationDotInactive
                    ]}
                />
            ))}
        </View>
    );

    // SLIDE 1: Founder & Director
    const renderFounderSlide = () => (
        <View style={styles.slide}>
            <View style={styles.contentContainer}>
                {/* Image Placeholder */}
                <Image
                    source={IMAGES.manSketch}
                    style={styles.founderImage}
                    resizeMode="contain"
                />

                <Text style={styles.textParagraph}>
                    {t('Edward Bonny founded RoundBuy with a simple yet powerful vision: to make local, sustainable shopping the norm rather than the exception.')}
                </Text>
                <Text style={styles.textParagraph}>
                    {t('With years of experience in the circular economy, Edward is committed to building a platform that empowers communities to reduce waste and save money.')}
                </Text>

                <View style={styles.signatureContainer}>
                    <Text style={styles.signatureTitle}>{t('Founder & Director')}</Text>
                    {/* Fallback for signature image/font */}
                    <Text style={styles.signatureText}>Edward Bonny</Text>
                </View>
            </View>
        </View>
    );

    // SLIDE 2: Journey
    const renderJourneySlide = () => (
        <View style={styles.slide}>
            <View style={styles.contentContainer}>
                <Text style={styles.textParagraph}>
                    {t('Our journey began in a small neighborhood, noticing how many perfectly good items were being discarded simply because there was no easy way to find a local buyer.')}
                </Text>
                <Text style={styles.textParagraph}>
                    {t('We started with a prototype that focused on walking-distance transactions, eliminating the need for expensive shipping and wasteful packaging.')}
                </Text>
                <Text style={styles.textParagraph}>
                    {t('Today, RoundBuy is a growing movement of people who care about their local environment and their neighbors.')}
                </Text>
                <Text style={styles.textParagraph}>
                    {t('We continue to innovate with features like our patent-pending location system that protects your privacy while enabling local trades.')}
                </Text>
                <Text style={styles.textParagraph}>
                    {t('Every item listed on RoundBuy is a step towards a cleaner, more connected world.')}
                </Text>

                <Text style={styles.highlightText}>
                    {t('RoundBuy: Built for the community, by the community, for a sustainable future.')}
                </Text>
            </View>
        </View>
    );

    // SLIDE 3: Our Mission
    const renderMissionSlide = () => (
        <View style={styles.slide}>
            <View style={styles.contentContainer}>
                <Text style={styles.textParagraph}>
                    {t('To accelerate the transition to a circular economy by making local reuse the most convenient and rewarding way to shop.')}
                </Text>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>100%</Text>
                        <Text style={styles.statLabel}>{t('Local')}</Text>
                        <Text style={styles.statSubLabel}>{t('Neighborhood focused')}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>0%</Text>
                        <Text style={styles.statLabel}>{t('Waste')}</Text>
                        <Text style={styles.statSubLabel}>{t('Circular economy')}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>100%</Text>
                        <Text style={styles.statLabel}>{t('Secure')}</Text>
                        <Text style={styles.statSubLabel}>{t('Privacy protected')}</Text>
                    </View>
                </View>

                <Text style={styles.bottomHighlightText}>
                    {t('Joining RoundBuy means joining a global community committed to local change.')}
                </Text>

            </View>
        </View>
    );

    // SLIDE 4: Value Propositions
    const renderValuesSlide = () => (
        <View style={styles.slide}>
            <View style={styles.contentContainer}>
                {/* List of values */}
                <Text style={styles.greenListText}>
                    {t('Convenience: Shop and sell within walking distance.')}
                </Text>
                <Text style={styles.greenListText}>
                    {t('Sustainability: Reduce your carbon footprint with every trade.')}
                </Text>
                <Text style={styles.greenListText}>
                    {t('Trust: Verified users and secure, in-person exchanges.')}
                </Text>
                <Text style={styles.greenListText}>
                    {t('Savings: Find incredible deals right in your neighborhood.')}
                </Text>

                <Text style={styles.textParagraph, { fontWeight: 'bold', marginTop: 20 }}>
                    {t('Our Value to You')}
                </Text>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>100%</Text>
                        <Text style={styles.statLabel}>{t('Growth')}</Text>
                        <Text style={styles.statSubLabel}>{t('Community expansion')}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>100%</Text>
                        <Text style={styles.statLabel}>{t('Impact')}</Text>
                        <Text style={styles.statSubLabel}>{t('Waste reduction')}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>100%</Text>
                        <Text style={styles.statLabel}>{t('Savings')}</Text>
                        <Text style={styles.statSubLabel}>{t('Local bargains')}</Text>
                    </View>
                </View>

                {/* Additional Stats Row if needed or just single stat block as per image */}
                <View style={styles.singleStatContainer}>
                    <Text style={styles.statValueSmall}>100%</Text>
                    <Text style={styles.statLabelSmall}>{t('Committed')}</Text>
                    <Text style={styles.statSubLabelSmall}>{t('To a green planet')}</Text>
                </View>

                <Text style={styles.bottomHighlightTextSmall}>
                    {t('Join Edward and the RoundBuy team in making local trading sustainable for everyone.')}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <GlobalHeader
                title={slides[activeIndex].title}
                navigation={navigation}
                showBackButton={true}
            />

            {renderPagination()}

            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                {renderFounderSlide()}
                {renderJourneySlide()}
                {renderMissionSlide()}
                {renderValuesSlide()}
            </ScrollView>
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
        // flexGrow: 1, // Ensure content stretches
    },
    slide: {
        width: width,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    contentContainer: {
        flex: 1,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 10,
    },
    paginationDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: '#555',
    },
    paginationDotInactive: {
        backgroundColor: '#ccc',
    },
    // Common Text Styles
    textParagraph: {
        fontSize: 18,
        color: '#333',
        marginBottom: 15,
        lineHeight: 20,
        fontWeight: '700',
    },
    // Founder Slide Styles
    founderImage: {
        width: 300,
        height: 380,
        alignSelf: 'center',
        marginBottom: 30,
    },
    greenPlaceholder: {
        // Using a light green/hollow style for the sketch feel
        borderWidth: 1,
        borderColor: '#7CB342',
        borderRadius: 0,
        backgroundColor: '#fff',
    },
    placeholderText: {
        color: '#7CB342', // Green
        textAlign: 'center',
    },
    signatureContainer: {
        marginTop: 20,
        marginBottom: 40,
    },
    signatureTitle: {
        fontSize: 20,
        fontWeight: '400',
        color: '#000',
        marginBottom: 10,
    },
    signatureText: {
        fontSize: 32,
        color: '#4285F4', // Blue signature color
        fontFamily: 'Signatie', // Custom font
        fontStyle: 'italic', // Removed italic as Zapfino is already script-like
    },
    // Journey Slide Styles
    highlightText: {
        fontSize: 20,
        color: '#7CB342', // Green text
        fontStyle: 'italic',
        marginTop: 10,
        lineHeight: 20,
    },
    // Mission & Values Stats
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 40,
        marginBottom: 30,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 16,
        color: '#7CB342', // Green
        fontWeight: 'bold',
        marginBottom: 2,
    },
    statSubLabel: {
        fontSize: 12,
        color: '#000',
        fontWeight: '500',
    },
    bottomHighlightText: {
        fontSize: 12,
        color: '#7CB342', // Green
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 20,
        paddingHorizontal: 10,
    },
    // Values Slide Styles
    greenListText: {
        fontSize: 18,
        color: '#2E7D32', // Darker Green for list items
        marginBottom: 15,
        lineHeight: 20,
        fontWeight: '700',
    },
    singleStatContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    statValueSmall: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    statLabelSmall: {
        fontSize: 12,
        color: '#7CB342',
        fontWeight: 'bold',
    },
    statSubLabelSmall: {
        fontSize: 10,
        color: '#000',
    },
    bottomHighlightTextSmall: {
        fontSize: 10,
        color: '#7CB342', // Green
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 20,
    },
});

export default AboutUsScreen;
