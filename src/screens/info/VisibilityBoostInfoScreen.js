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
            description: t('Lorem ipsum dolores est'),
            steps: [
                {
                    title: t('1. Feature 1'),
                    text: t('Description for Rise to Top feature 1.')
                },
                {
                    title: t('2. Feature 2'),
                    text: t('Description for Rise to Top feature 2.')
                },
                {
                    title: t('3. Feature 3'),
                    text: t('Description for Rise to Top feature 3.')
                }
            ]
        },
        {
            id: 'top_spot',
            title: t('Top Spot'),
            description: t('Lorem ipsum dolores est'),
            steps: [
                {
                    title: t('1. Feature 1'),
                    text: t('Description for Top Spot feature 1.')
                },
                {
                    title: t('2. Feature 2'),
                    text: t('Description for Top Spot feature 2.')
                },
                {
                    title: t('3. Feature 3'),
                    text: t('Description for Top Spot feature 3.')
                }
            ]
        },
        {
            id: 'targeted_ad',
            title: t('Targeted ad'),
            description: t('Lorem ipsum dolores est'),
            steps: [
                {
                    title: t('1. Feature 1'),
                    text: t('Description for Targeted ad feature 1.')
                },
                {
                    title: t('2. Feature 2'),
                    text: t('Description for Targeted ad feature 2.')
                },
                {
                    title: t('3. Feature 3'),
                    text: t('Description for Targeted ad feature 3.')
                }
            ]
        },
        {
            id: 'fast_ad',
            title: t('Fast ad'),
            description: t('Lorem ipsum dolores est'),
            steps: [
                {
                    title: t('1. Feature 1'),
                    text: t('Description for Fast ad feature 1.')
                },
                {
                    title: t('2. Feature 2'),
                    text: t('Description for Fast ad feature 2.')
                },
                {
                    title: t('3. Feature 3'),
                    text: t('Description for Fast ad feature 3.')
                }
            ]
        },
        {
            id: 'show_casing',
            title: t('Show casing'),
            description: t('Lorem ipsum dolores est'),
            steps: [
                {
                    title: t('1. Feature 1'),
                    text: t('Description for Show casing feature 1.')
                },
                {
                    title: t('2. Feature 2'),
                    text: t('Description for Show casing feature 2.')
                },
                {
                    title: t('3. Feature 3'),
                    text: t('Description for Show casing feature 3.')
                }
            ]
        }
    ];

    const handleBoostPress = (boost) => {
        navigation.navigate('HowItWorksDetail', {
            category: boost.id,
            title: boost.title,
            steps: boost.steps,
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
                title={t('Visibility Boosts')}
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
