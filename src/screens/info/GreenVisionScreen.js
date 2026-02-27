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
            description: t('Lorem ipsum dolores est'),
            pages: [
                {
                    title: t('Used goods'),
                    items: [
                        t('Lorem ipsum dolores'),
                        t('Lorem ipsum dolores'),
                        t('Lorem ipsum dolores'),
                        t('Lorem ipsum dolores')
                    ],
                    bottomText: t('Lorem ipsum est')
                },
                {
                    title: t('Quality & Value'),
                    content: t('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do. Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis. Nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu. Nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do. Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis. Nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'),
                    bottomItems: [
                        t('Lorem ipsum est'),
                        t('Lorem ipsum est'),
                        t('Lorem ipsum est')
                    ]
                },
                {
                    title: t('Sustainability'),
                    content: t('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do. Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis. Nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu. Nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do. Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis. Nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'),
                    bottomItems: [
                        t('Lorem ipsum est'),
                        t('Lorem ipsum est'),
                        t('Lorem ipsum est')
                    ]
                },
                {
                    title: t('Impact'),
                    content: t('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do. Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis. Nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu. Nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do. Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis. Nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'),
                    bottomItems: [
                        t('Lorem ipsum est'),
                        t('Lorem ipsum est'),
                        t('Lorem ipsum est')
                    ]
                }
            ]
        },
        {
            id: 'get-yourself',
            title: t('Get yourself'),
            description: t('Lorem ipsum dolores est'),
            pages: [
                {
                    title: t('Get yourself'),
                    items: [
                        t('Lorem ipsum dolores'),
                        t('Lorem ipsum dolores'),
                        t('Lorem ipsum dolores'),
                        t('Lorem ipsum dolores')
                    ],
                    bottomText: t('Lorem ipsum est')
                },
                {
                    title: t('Personal Growth'),
                    content: t('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do. Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis. Nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu. Nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do. Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis. Nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'),
                    bottomItems: [
                        t('Lorem ipsum est'),
                        t('Lorem ipsum est'),
                        t('Lorem ipsum est')
                    ]
                },
                {
                    title: t('Your Journey'),
                    content: t('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do. Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis. Nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu. Nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do. Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis. Nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'),
                    bottomItems: [
                        t('Lorem ipsum est'),
                        t('Lorem ipsum est'),
                        t('Lorem ipsum est')
                    ]
                },
                {
                    title: t('Join Us'),
                    content: t('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do. Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis. Nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu. Nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do. Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis. Nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'),
                    bottomItems: [
                        t('Lorem ipsum est'),
                        t('Lorem ipsum est'),
                        t('Lorem ipsum est')
                    ]
                }
            ]
        },
        {
            id: 'shop-around-you',
            title: t('Shop around you'),
            description: t('Lorem ipsum dolores est'),
            pages: [
                {
                    title: t('Shop around you'),
                    items: [
                        t('Lorem ipsum dolores'),
                        t('Lorem ipsum dolores'),
                        t('Lorem ipsum dolores'),
                        t('Lorem ipsum dolores')
                    ],
                    bottomText: t('Lorem ipsum est')
                },
                {
                    title: t('Local Shopping'),
                    content: t('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do. Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis. Nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu. Nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do. Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis. Nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'),
                    bottomItems: [
                        t('Lorem ipsum est'),
                        t('Lorem ipsum est'),
                        t('Lorem ipsum est')
                    ]
                },
                {
                    title: t('Community'),
                    content: t('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do. Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis. Nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu. Nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do. Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis. Nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'),
                    bottomItems: [
                        t('Lorem ipsum est'),
                        t('Lorem ipsum est'),
                        t('Lorem ipsum est')
                    ]
                },
                {
                    title: t('Get Started'),
                    content: t('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do. Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis. Nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu. Nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do. Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis. Nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'),
                    bottomItems: [
                        t('Lorem ipsum est'),
                        t('Lorem ipsum est'),
                        t('Lorem ipsum est')
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
