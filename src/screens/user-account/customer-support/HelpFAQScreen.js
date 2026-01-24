import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../context/TranslationContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import faqService from '../../../services/faqService';

const HelpFAQScreen = ({ route, navigation }) => {
    const { t } = useTranslation();
  const { category, title } = route?.params || {};
  const [searchText, setSearchText] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
  const [expandedFaqs, setExpandedFaqs] = useState({});
  const [faqData, setFaqData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchFaqs();
  }, []);

  useEffect(() => {
    if (searchText.length >= 2) {
      handleSearch();
    } else {
      setSearchResults([]);
      setSearching(false);
    }
  }, [searchText]);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const response = await faqService.getAllFaqs();
      if (response.success) {
        setFaqData(response.data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async () => {
    if (searchText.length < 2) return;

    try {
      setSearching(true);
      const response = await faqService.searchFaqs(searchText);
      if (response.success) {
        setSearchResults(response.data.results || []);
      }
    } catch (error) {
      console.error('Error searching FAQs:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFaqs();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const toggleSubcategory = (subcategoryId) => {
    setExpandedSubcategories(prev => ({
      ...prev,
      [subcategoryId]: !prev[subcategoryId]
    }));
  };

  const toggleFaq = (faqId) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [faqId]: !prev[faqId]
    }));
  };

  const renderSearchResults = () => {
    if (searching) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{t('Searching...')}</Text>
        </View>
      );
    }

    if (searchResults.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="search-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>{t('No results found')}</Text>
          <Text style={styles.emptySubtext}>{t('Try different keywords')}</Text>
        </View>
      );
    }

    return (
      <View style={styles.searchResultsContainer}>
        <Text style={styles.resultsCount}>
          {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
        </Text>
        {searchResults.map((item) => (
          <View key={item.id} style={styles.faqItem}>
            <TouchableOpacity
              style={styles.questionContainer}
              onPress={() => toggleFaq(item.id)}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.questionText}>{item.question}</Text>
                <Text style={styles.categoryBadge}>
                  {item.category_name} › {item.subcategory_name}
                </Text>
              </View>
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
        ))}
      </View>
    );
  };

  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
  };

  const renderFaqContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{t('Loading FAQs...')}</Text>
        </View>
      );
    }

    if (faqData.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="help-circle-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>{t('No FAQs available')}</Text>
          <Text style={styles.emptySubtext}>{t('Check back later')}</Text>
        </View>
      );
    }

    return faqData.map((category) => (
      <View key={category.id} style={styles.categoryContainer}>
        {/* Category Header */}
        <TouchableOpacity
          style={styles.categoryHeader}
          onPress={() => toggleCategory(category.id)}
          activeOpacity={0.7}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.categoryTitle}>{category.name}</Text>
            {category.description && (
              <Text style={styles.categoryDescription}>{category.description}</Text>
            )}
          </View>
          <View style={styles.categoryBadgeContainer}>
            <Text style={styles.categoryCount}>{category.total_faqs}</Text>
            <Ionicons
              name={expandedCategories[category.id] ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#000"
              style={{ marginLeft: 8 }}
            />
          </View>
        </TouchableOpacity>

        {/* Subcategories */}
        {expandedCategories[category.id] && category.subcategories && (
          <View style={styles.subcategoriesContainer}>
            {category.subcategories.map((subcategory) => (
              <View key={subcategory.id} style={styles.subcategoryContainer}>
                {/* Subcategory Header */}
                <TouchableOpacity
                  style={styles.subcategoryHeader}
                  onPress={() => toggleSubcategory(subcategory.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.subcategoryTitle}>{subcategory.name}</Text>
                  <View style={styles.subcategoryBadgeContainer}>
                    <Text style={styles.subcategoryCount}>{subcategory.faq_count}</Text>
                    <Ionicons
                      name={expandedSubcategories[subcategory.id] ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#666"
                      style={{ marginLeft: 4 }}
                    />
                  </View>
                </TouchableOpacity>

                {/* FAQs */}
                {expandedSubcategories[subcategory.id] && subcategory.faqs && (
                  <View style={styles.faqsContainer}>
                    {subcategory.faqs.map((faq) => (
                      <View key={faq.id} style={styles.faqItem}>
                        <TouchableOpacity
                          style={styles.questionContainer}
                          onPress={() => toggleFaq(faq.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.questionText}>{faq.question}</Text>
                          <Ionicons
                            name={expandedFaqs[faq.id] ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color="#000"
                          />
                        </TouchableOpacity>

                        {expandedFaqs[faq.id] && (
                          <View style={styles.answerContainer}>
                            <Text style={styles.answerText}>{stripHtml(faq.answer)}</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Help & FAQs')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('Search FAQs...')}
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {searchText.length >= 2 ? renderSearchResults() : renderFaqContent()}

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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#000',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#666',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#999',
  },
  categoryContainer: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  categoryDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  categoryBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  subcategoriesContainer: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  subcategoryContainer: {
    marginTop: 8,
  },
  subcategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  subcategoryTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  subcategoryBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subcategoryCount: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  faqsContainer: {
    marginTop: 4,
    paddingLeft: 8,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  questionText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '400',
    flex: 1,
    marginRight: 12,
  },
  answerContainer: {
    paddingBottom: 14,
    paddingHorizontal: 8,
    paddingRight: 32,
  },
  answerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  searchResultsContainer: {
    marginTop: 8,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  categoryBadge: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default HelpFAQScreen;