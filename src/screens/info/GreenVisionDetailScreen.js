import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, SafeAreaView } from 'react-native';
import { useTranslation } from '../../context/TranslationContext';
import GlobalHeader from '../../components/GlobalHeader';
import { COLORS } from '../../constants/theme';

const { width } = Dimensions.get('window');

const GreenVisionDetailScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { category, title, pages } = route.params;
    const [activeIndex, setActiveIndex] = useState(0);

    const handleScroll = (event) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);
        setActiveIndex(roundIndex);
    };

    const renderPage = (page, index) => (
        <View key={index} style={styles.slide}>
            <View style={styles.contentContainer}>
                {/* Back arrow and title */}
                <Text style={styles.pageTitle}>{'< ' + page.title}</Text>

                {/* Pagination dots */}
                <View style={styles.paginationContainer}>
                    {pages.map((_, idx) => (
                        <View
                            key={idx}
                            style={[
                                styles.paginationDot,
                                activeIndex === idx ? styles.paginationDotActive : styles.paginationDotInactive
                            ]}
                        />
                    ))}
                </View>

                {/* First page has green list items */}
                {page.items && (
                    <View style={styles.itemsContainer}>
                        {page.items.map((item, idx) => (
                            <Text key={idx} style={styles.greenListItem}>{item}</Text>
                        ))}
                    </View>
                )}

                {/* Other pages have content paragraph */}
                {page.content && (
                    <Text style={styles.contentText}>{page.content}</Text>
                )}

                {/* Bottom items (green text) */}
                {page.bottomItems && (
                    <View style={styles.bottomItemsContainer}>
                        {page.bottomItems.map((item, idx) => (
                            <Text key={idx} style={styles.bottomItem}>{item}</Text>
                        ))}
                    </View>
                )}

                {/* Bottom text for first page */}
                {page.bottomText && (
                    <Text style={styles.bottomText}>{page.bottomText}</Text>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <GlobalHeader
                title={t('Green Vision')}
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
                {pages && pages.map((page, index) => renderPage(page, index))}
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
    scrollContent: {},
    slide: {
        width: width,
        padding: 20,
        paddingTop: 30,
    },
    contentContainer: {
        flex: 1,
    },
    pageTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2E7D32', // Dark green
        marginBottom: 20,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
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
    itemsContainer: {
        marginBottom: 30,
    },
    greenListItem: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E7D32', // Dark green
        marginBottom: 20,
        lineHeight: 24,
    },
    contentText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 22,
        marginBottom: 30,
    },
    bottomItemsContainer: {
        marginTop: 20,
    },
    bottomItem: {
        fontSize: 14,
        color: '#7CB342', // Light green
        marginBottom: 10,
        lineHeight: 20,
    },
    bottomText: {
        fontSize: 14,
        color: '#7CB342', // Light green
        marginTop: 20,
        lineHeight: 20,
    },
});

export default GreenVisionDetailScreen;
