
import React, { useState } from 'react';
import { useTranslation } from '../../../context/TranslationContext';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const FAQListScreen = ({ route, navigation }) => {
    const { t } = useTranslation();
    const { subcategoryId, subcategoryName, faqs } = route.params;
    const [expandedFaqs, setExpandedFaqs] = useState({});

    const handleBack = () => {
        navigation.goBack();
    };

    const toggleFaq = (faqId) => {
        setExpandedFaqs(prev => ({
            ...prev,
            [faqId]: !prev[faqId]
        }));
    };

    // Helper to remove HTML tags if answer contains HTML
    const stripHtml = (html) => {
        if (!html) return '';
        return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{subcategoryName || t('FAQs')}</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Search Bar - Visual placeholder */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                    <Text style={styles.searchPlaceholder}>{t('Search questions...')}</Text>
                </View>

                <View style={styles.listContainer}>
                    {faqs && faqs.length > 0 ? (
                        faqs.map((item) => (
                            <View key={item.id} style={styles.faqItem}>
                                <TouchableOpacity
                                    style={styles.questionContainer}
                                    onPress={() => toggleFaq(item.id)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.questionText}>{item.question}</Text>
                                    <Ionicons
                                        name={expandedFaqs[item.id] ? 'chevron-up' : 'chevron-down'}
                                        size={20}
                                        color="#000"
                                    />
                                </TouchableOpacity>

                                {expandedFaqs[item.id] && (
                                    <View style={styles.answerContainer}>
                                        <Text style={styles.answerText}>{stripHtml(item.answer)}</Text>
                                    </View>
                                )}
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>{t('No questions found in this topic.')}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.bottomSpacer} />
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
    listContainer: {
        marginTop: 0,
    },
    faqItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    questionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 4,
    },
    questionText: {
        fontSize: 15,
        color: '#000',
        fontWeight: '400',
        flex: 1,
        marginRight: 12,
    },
    answerContainer: {
        paddingBottom: 20,
        paddingHorizontal: 4,
        paddingRight: 12,
    },
    answerText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
    },
    emptyContainer: {
        marginTop: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
        fontSize: 15,
    },
    bottomSpacer: {
        height: 40,
    },
});

export default FAQListScreen;
