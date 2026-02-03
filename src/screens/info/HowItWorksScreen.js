import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../context/TranslationContext';
import { COLORS } from '../../constants/theme';
import GlobalHeader from '../../components/GlobalHeader';
import { Ionicons } from '@expo/vector-icons';

const HowItWorksScreen = ({ navigation }) => {
    const { t } = useTranslation();

    const categories = [
        {
            id: 'shop',
            title: t('Shop around you'),
            description: t('Lorem ipsum dolores est'),
            steps: [
                {
                    title: t('1. Set location'),
                    text: t('Get RoundBuy app for free! Register, and set your imprecise location. This is your centre-point, you buy & sell from here.')
                },
                {
                    title: t('2. Search & Offer'),
                    text: t("Perform a search, to see what's available in walking distance. View the search results, either in the product gallery, or, on the map.")
                },
                {
                    title: t('3. Pick It Up Yourself'),
                    text: t("Great find! Schedule an exchange at sellers imprecise location. Walk or cycle, and inspect. If it's good, buy it! Enjoy the bargain!")
                }
            ]
        },
        {
            id: 'sell',
            title: t('Sell'),
            description: t('Lorem ipsum dolores est'),
            steps: [
                {
                    title: t('1. List your item'),
                    text: t('Just a few clicks, and you are done! Take few photos, give a title & description, and choose filters, publish! Second-hand is useful!')
                },
                {
                    title: t('2. Offer & Sell'),
                    text: t('Chat, and get an offer accepted. Sell it, but no need to pack and ship! Buyer charged £1.00 for the buy. Seller pays nothing!')
                },
                {
                    title: t('3. Exchange & Cash day'),
                    text: t('Forget waiting, walk there! Schedule a meeting, and Pick It Up Yourself, from walking distance! Seller is paid, as Buyer confirms!')
                }
            ]
        },
        {
            id: 'buy',
            title: t('Buy'),
            description: t('Lorem ipsum dolores est'),
            steps: [
                {
                    title: t('1. Discover'),
                    text: t('Just a few clicks, and you are done! See the photos, read the descriptions, and details. Ask questions, and negotiate in the chat.')
                },
                {
                    title: t('2. Offer & Buy'),
                    text: t('Chat, and get an offer accepted. Buy it, and we hold the cash until all confirmed! Buyer charged £1.00 for the buy. Seller pays nothing!')
                },
                {
                    title: t('3. Exchange & Cash day'),
                    text: t('Forget waiting, walk there! Schedule a meeting, and Pick It Up Yourself, from walking distance! Seller is paid, as Buyer confirms!')
                }
            ]
        },
        {
            id: 'pickup',
            title: t('Pick it Up'),
            description: t('Lorem ipsum dolores est'),
            steps: [
                {
                    title: t('1. Schedule Exchange'),
                    text: t('Agree on a time and safe place to meet. The app helps you coordinate without sharing your precise home address.')
                },
                {
                    title: t('2. Inspect Item'),
                    text: t("Meet in person and check the item. Make sure it matches the description and photos. You have the right to inspect before finalising.")
                },
                {
                    title: t('3. Confirm & Go'),
                    text: t("Happy with it? Confirm the pickup in the app. The funds are released to the seller, and the item is yours!")
                }
            ]
        }
    ];

    const handleCategoryPress = (category) => {
        navigation.navigate('HowItWorksDetail', {
            category: category.id,
            title: category.title,
            steps: category.steps,
            // Pass standard benefits or specific ones if needed
            benefits: [
                { title: 'Lorem ipsum', text: 'Dolores est 100%' },
                { title: 'Lorem ipsum', text: 'Dolores est 100%' },
                { title: 'Lorem ipsum', text: 'Dolores est 100%' }
            ]
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <GlobalHeader
                title={t('How it Works')}
                navigation={navigation}
                showBackButton={true}
            />

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.mainTitle}>
                    {t('RoundBuy Lorem ipsum dolores lorem ipsum dolores est lorem ipsum est')}
                </Text>
                <Text style={styles.mainDescription}>
                    {t('RoundBuy Lorem ipsum dolores lorem ipsum dolores est lorem ipsum est')}
                </Text>
                <Text style={styles.mainDescription}>
                    {t('Choose one from below:')}
                </Text>

                <View style={styles.listContainer}>
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={styles.categoryCard}
                            onPress={() => handleCategoryPress(category)}
                        >
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{category.title}</Text>
                                {/* <Text style={styles.cardDescription}>{category.description}</Text> */}
                                {/* <Text style={styles.cardDescription}>{category.description}</Text> */}
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

export default HowItWorksScreen;
