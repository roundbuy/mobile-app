import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../context/TranslationContext';
import { COLORS } from '../../constants/theme';
import GlobalHeader from '../../components/GlobalHeader';

const GreenVisionScreen = ({ navigation }) => {
    const { t } = useTranslation();

    const categories = [
        {
            id: 'used-goods',
            title: t('Used goods'),
            description: t('Give items a second life'),
            pages: [
                {
                    title: t('Used goods'),
                    items: [
                        t('Reduce landfill waste'),
                        t('Save raw materials'),
                        t('Lower manufacturing energy'),
                        t('Promote reuse culture')
                    ],
                    bottomText: t('Every second-hand purchase helps the planet.')
                },
                {
                    title: t('Quality & Value'),
                    content: t('RoundBuy is committed to creating a world where every item has a second home. By choosing used goods, you are directly reducing the carbon footprint of manufacturing and shipping new products. Our platform makes it easy to find quality items in your neighborhood, fostering a culture of reuse and sustainability.'),
                    bottomItems: [
                        t('Eco-friendly choices'),
                        t('Sustainable living'),
                        t('Carbon footprint reduction')
                    ]
                },
                {
                    title: t('Sustainability'),
                    content: t('Sustainability is at the heart of everything we do. We believe that by connecting buyers and sellers locally, we can significantly reduce the environmental impact of commerce. Our mission is to provide the tools and community support needed to make sustainable shopping the most attractive option for everyone.'),
                    bottomItems: [
                        t('Support local'),
                        t('Reduce waste'),
                        t('Community action')
                    ]
                },
                {
                    title: t('Impact'),
                    content: t('The impact of your choices on RoundBuy is real and measurable. Every transaction helps divert items from landfills and conserves the energy required to produce new goods. Together, we are building a more resilient and sustainable local economy that benefits both people and the planet.'),
                    bottomItems: [
                        t('Measurable change'),
                        t('Environment first'),
                        t('Global vision, local action')
                    ]
                }
            ]
        },
        {
            id: 'get-yourself',
            title: t('Get yourself'),
            description: t('Personal growth and community impact'),
            pages: [
                {
                    title: t('Get yourself'),
                    items: [
                        t('Build local connections'),
                        t('Develop sustainable habits'),
                        t('Support circular economy'),
                        t('Earn green rewards')
                    ],
                    bottomText: t('Small actions lead to big changes.')
                },
                {
                    title: t('Personal Growth'),
                    content: t('Sustainable living is a journey of personal growth. By being mindful of your consumption and choosing to reuse, you are developing habits that lead to a more fulfilling and responsible lifestyle. RoundBuy is here to support you with resources and a community of like-minded individuals.'),
                    bottomItems: [
                        t('Mindful consumption'),
                        t('Responsible lifestyle'),
                        t('Habit formation')
                    ]
                },
                {
                    title: t('Your Journey'),
                    content: t('Your journey with RoundBuy is about more than just buying and selling. It is about becoming an active participant in your local economy and a steward of the environment. Every trade you make is a step towards a more sustainable and connected future for yourself and your neighborhood.'),
                    bottomItems: [
                        t('Active participation'),
                        t('Environmental stewardship'),
                        t('Local connection')
                    ]
                },
                {
                    title: t('Join Us'),
                    content: t('We invite you to join us in this mission. By using RoundBuy, you are joining a movement of thousands of people who believe that a better, more sustainable way of living is possible. Together, we can make local reuse the new standard for a greener world.'),
                    bottomItems: [
                        t('Global movement'),
                        t('Sustainable standard'),
                        t('Greener world')
                    ]
                }
            ]
        },
        {
            id: 'shop-around-you',
            title: t('Shop around you'),
            description: t('Reduce carbon footprint by shopping local'),
            pages: [
                {
                    title: t('Shop around you'),
                    items: [
                        t('Minimize transport distance'),
                        t('Zero packaging waste'),
                        t('Support local livelihoods'),
                        t('Strengthen neighborhood bonds')
                    ],
                    bottomText: t('Shopping local is shopping green.')
                },
                {
                    title: t('Local Shopping'),
                    content: t('Shopping locally on RoundBuy means you are supporting your neighbors and reducing the environmental cost of long-distance shipping. Our platform connects you with sellers within walking distance, making it easy to find what you need without the need for cars or heavy transport.'),
                    bottomItems: [
                        t('Zero shipping'),
                        t('Walking distance'),
                        t('Local support')
                    ]
                },
                {
                    title: t('Community'),
                    content: t('A strong community is a sustainable community. By trading locally, you are building trust and connections with the people who live near you. RoundBuy is designed to strengthen these bonds, creating a network of support that goes beyond just commerce.'),
                    bottomItems: [
                        t('Build trust'),
                        t('Local network'),
                        t('Stronger bonds')
                    ]
                },
                {
                    title: t('Get Started'),
                    content: t('Getting started on RoundBuy is easy and rewarding. Simply set your location, browse the items near you, and start making sustainable choices today. Whether you are buying or selling, every action you take contributes to a greener and more connected community.'),
                    bottomItems: [
                        t('Easy to use'),
                        t('Instant rewards'),
                        t('Start today')
                    ]
                }
            ]
        }
    ];

    const handleCategoryPress = (category) => {
        navigation.navigate('GreenVisionDetail', {
            category: category.id,
            title: category.title,
            pages: category.pages
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <GlobalHeader
                title={t('Green Vision')}
                navigation={navigation}
                showBackButton={true}
            />

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.mainTitle}>
                    {t('Our commitment to a sustainable future.')}
                </Text>
                <Text style={styles.mainDescription}>
                    {t('RoundBuy is built on the principles of the circular economy. We believe in extending the life of products and reducing waste.')}
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
                            </View>
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
        backgroundColor: '#f1f8e9',
        minHeight: '70%',
    },
    categoryCard: {
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
        color: '#2E7D32',
        marginBottom: 0,
    },
});

export default GreenVisionScreen;
