
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../context/TranslationContext';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import faqService from '../../../services/faqService';
import { COLORS } from '../../../constants/theme';

const FAQSubCategoriesScreen = ({ route, navigation }) => {
    const { t } = useTranslation();
    const { categoryId, categoryName } = route.params;
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubcategories();
    }, [categoryId]);

    const fetchSubcategories = async () => {
        try {
            setLoading(true);
            const response = await faqService.getFaqsByCategory(categoryId);
            if (response.success && response.data.category) {
                setSubcategories(response.data.category.subcategories || []);
            }
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const handleSubcategoryPress = (subcategory) => {
        navigation.navigate('FAQList', {
            subcategoryId: subcategory.id,
            subcategoryName: subcategory.name,
            faqs: subcategory.faqs || [],
        });
    };

    const handleSearch = () => {
        // Navigate to global search? Or show input?
        // User said "search will work on all screen".
        // I will put a search input that navigates to HelpFAQ with search param or handles it here.
        // For simplicity matching CustomerSupportScreen, I'll put a readonly search input that focuses or stays local.
        // Since this is a drill-down, maybe local search isn't needed if the global search is good.
        // But user wants "dynamic with search".
        // I'll add the same search bar as CustomerSupportScreen.
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{categoryName || t('Support')}</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Search Bar - Visual only for now, or could implement local filter */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                    <Text style={styles.searchPlaceholder}>{t('Search questions...')}</Text>
                </View>

                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        {subcategories.length === 0 ? (
                            <Text style={styles.emptyText}>{t('No topics found.')}</Text>
                        ) : (
                            subcategories.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.item}
                                    onPress={() => handleSubcategoryPress(item)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.itemText}>{item.name}</Text>
                                    <View style={styles.badgeContainer}>
                                        {/* <Text style={styles.countText}>{item.faq_count || 0}</Text> */}
                                        <Ionicons name="chevron-forward" size={20} color="#999" style={{ marginLeft: 8 }} />
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    headerRight: {
        width: 32,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchPlaceholder: {
        fontSize: 15,
        color: '#999',
    },
    loaderContainer: {
        marginTop: 40,
        alignItems: 'center',
    },
    listContainer: {
        marginBottom: 20,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemText: {
        fontSize: 15,
        color: '#000',
        fontWeight: '400',
        flex: 1,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    countText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        marginTop: 20,
    }
});

export default FAQSubCategoriesScreen;
