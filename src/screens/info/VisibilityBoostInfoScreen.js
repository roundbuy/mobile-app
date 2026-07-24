import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../context/TranslationContext';
import { COLORS } from '../../constants/theme';
import GlobalHeader from '../../components/GlobalHeader';
import { Ionicons } from '@expo/vector-icons';

const VisibilityBoostInfoScreen = ({ navigation }) => {
    const { t } = useTranslation();

    const boosts = [
        {
            id: 'rise_to_top',
            title: t('Rise to Top'),
            description: t('Move your item back to the top'),
            steps: [
                {
                    title: t('1. Select Item'),
                    text: t('Choose the active listing you want to boost.')
                },
                {
                    title: t('2. One-Tap Boost'),
                    text: t('Instantly move your item to the top of the search gallery.')
                },
                {
                    title: t('3. Maximum Visibility'),
                    text: t('Your item will appear as a fresh listing to local buyers.')
                }
            ]
        },
        {
            id: 'top_spot',
            title: t('Top Spot'),
            description: t('Keep your item at the very top'),
            steps: [
                {
                    title: t('1. Premium Placement'),
                    text: t('Secure a dedicated slot at the top of your category.')
                },
                {
                    title: t('2. Extended Duration'),
                    text: t('Stay visible in the top spot for a fixed duration.')
                },
                {
                    title: t('3. Higher Click-through'),
                    text: t('Items in Top Spots receive significantly more views.')
                }
            ]
        },
        {
            id: 'targeted_ad',
            title: t('Targeted ad'),
            description: t('Reach the right buyers'),
            steps: [
                {
                    title: t('1. Smart Matching'),
                    text: t('We show your ad to users searching for similar items.')
                },
                {
                    title: t('2. Local Targeting'),
                    text: t('Focus on buyers within your specified walking distance.')
                },
                {
                    title: t('3. Better Conversion'),
                    text: t('Connect with buyers who are already interested.')
                }
            ]
        },
        {
            id: 'fast_ad',
            title: t('Fast ad'),
            description: t('Sell your item quickly'),
            steps: [
                {
                    title: t('1. Rapid Promotion'),
                    text: t('Get your listing processed and promoted instantly.')
                },
                {
                    title: t('2. High Intensity'),
                    text: t('Increased frequency of display in search results.')
                },
                {
                    title: t('3. Quick Turnaround'),
                    text: t('Ideal for items you need to sell today.')
                }
            ]
        },
        {
            id: 'show_casing',
            title: t('Show casing'),
            description: t('Feature your item prominently'),
            steps: [
                {
                    title: t('1. Gallery Feature'),
                    text: t('Your item appears in the home page showcase gallery.')
                },
                {
                    title: t('2. Visual Highlight'),
                    text: t('Stand out with a premium border and highlight.')
                },
                {
                    title: t('3. Brand Exposure'),
                    text: t('Build trust with a professional-looking listing.')
                }
            ]
        },
    ];

    const handleBoostPress = (boost) => {
        navigation.navigate('HowItWorksDetail', {
            category: boost.id,
            title: boost.title,
            steps: boost.steps,
            benefits: [
                { title: t('Increased reach'), text: t('Reach up to 10x more potential buyers.') },
                { title: t('Faster sales'), text: t('Most boosted items sell within 48 hours.') },
                { title: t('Priority display'), text: t('Stand out from the crowd with a premium badge.') }
            ]
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <GlobalHeader
                title={t('Extensions & Boosts')}
                navigation={navigation}
                showBackButton={true}
            />

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.mainTitle}>
                    {t('Boost your visibility and sell faster.')}
                </Text>
                <Text style={styles.mainDescription}>
                    {t('Choose from our premium options to get your items in front of more local buyers.')}
                </Text>
                <Text style={styles.mainDescription}>
                    {t('Choose one from below:')}
                </Text>

                <View style={styles.listContainer}>
                    {boosts.map((boost) => (
                        <TouchableOpacity
                            key={boost.id}
                            style={styles.categoryCard}
                            onPress={() => handleBoostPress(boost)}
                        >
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{boost.title}</Text>
                            </View>
                            {/* <Ionicons name="chevron-down" size={24} color="#000" /> */}
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    mainTitle: {
        fontSize: 24,
        color: '#000',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    mainDescription: {
        fontSize: 14,
        color: '#000',
        marginBottom: 30,
        fontWeight: 'bold',
    },
    listContainer: {
        gap: 0,
        backgroundColor: '#f1f8e9', // Light green similar to image provided by user (or #dcedc8)
        minHeight: '70%',
    },
    categoryCard: {
        // Light green similar to image provided by user (or #dcedc8)
        // borderRadius: 8,
        padding: 20,
        minHeight: 15,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardContent: {
        width: '100%',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2E7D32', // Green text
        marginBottom: 0,
    },
    cardDescription: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2E7D32', // Green text
        marginBottom: 4,
    }
});

export default VisibilityBoostInfoScreen;
