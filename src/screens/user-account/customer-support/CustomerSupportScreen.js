import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../context/TranslationContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import faqService from '../../../services/faqService';
import { COLORS } from '../../../constants/theme';
import SuggestionsFooter from '../../../components/SuggestionsFooter';

const CustomerSupportScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  // Separate state to track if we show search results or main content
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchText.length >= 2) {
      handleSearch();
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchText]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await faqService.getCategories();
      if (response.success) {
        setCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching FAQ categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setSearching(true);
      setShowResults(true);
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

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCategoryPress = (category) => {
    navigation.navigate('FAQSubCategories', {
      categoryId: category.id,
      categoryName: category.name,
    });
  };

  const handleContactOptionPress = (option) => {
    // Navigate to ContactSupportScreen, potentially with a pre-filled topic
    // Map options to topics if needed
    let topic = 'General inquiry';
    if (option === 'technical') topic = 'Technical support';
    if (option === 'resolution') topic = 'Report content'; // Or generic contact

    navigation.navigate('ContactSupport', { initialTopic: topic });
  };

  // Helper to remove HTML tags
  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
  };

  const renderSearchResults = () => {
    if (searching) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
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
      <View style={styles.searchResultsList}>
        <Text style={styles.resultsCount}>
          {searchResults.length} {t('results found')}
        </Text>
        {searchResults.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.searchResultItem}
            /* Navigate to a detail view or expand. 
               Since we don't have a single FAQ detail screen, 
               we might need to reuse FAQList or create a simple modal.
               For now, let's navigate to FAQList with just this item?
               Or easier: Expand in place? No, this is a search list.
               Let's navigate to FAQList with a synthetic subcategory containing just this result.
            */
            onPress={() => navigation.navigate('FAQList', {
              subcategoryId: item.subcategory_id,
              subcategoryName: item.subcategory_name,
              faqs: [item] // Show just this result or maybe fetch all for context? User likely wants the answer.
            })}
          >
            <Text style={styles.resultQuestion}>{item.question}</Text>
            <Text style={styles.resultPath}>
              {item.category_name} › {item.subcategory_name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Customer support')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('Search questions, keywords or topics')}
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
            autoCorrect={false}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchText(''); setShowResults(false); }}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {showResults ? (
          renderSearchResults()
        ) : (
          <>
            {/* Dynamic Categories */}
            {/* <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('Marketplace & Service info')}</Text>
            </View> */}

            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
              <View style={styles.categoriesContainer}>
                {categories.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.categoryItem}
                    onPress={() => handleCategoryPress(item)}
                    activeOpacity={0.7}
                  >
                    <Text autoCapitalize='words' style={styles.categoryText}>{item.name}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* We can also help with section */}
            <View style={styles.helpSection}>
              <Text style={styles.helpSectionTitle}>{t('We can also help with')}</Text>

              <View style={styles.cardsRow}>
                {/* Resolution Center */}
                <TouchableOpacity
                  style={styles.helpCard}
                  onPress={() => handleContactOptionPress('resolution')}
                  activeOpacity={0.8}
                >
                  <View style={styles.iconCircle}>
                    <Ionicons name="pricetag-outline" size={24} color="#000" />
                  </View>
                  <Text style={styles.cardTitle}>{t('Resolution center')}</Text>
                  <Text style={styles.cardSubtitle}>{t('Need help with Disputes')}</Text>
                </TouchableOpacity>

                {/* Contact Us */}
                <TouchableOpacity
                  style={styles.helpCard}
                  onPress={() => handleContactOptionPress('contact')}
                  activeOpacity={0.8}
                >
                  <View style={styles.iconCircle}>
                    <Ionicons name="headset-outline" size={24} color="#000" />
                  </View>
                  <Text style={styles.cardTitle}>{t('Contact Us')}</Text>
                  <Text style={styles.cardSubtitle}>{t('Do you have questions')}</Text>
                </TouchableOpacity>

                {/* Technical Issues */}
                <TouchableOpacity
                  style={styles.helpCard}
                  onPress={() => handleContactOptionPress('technical')}
                  activeOpacity={0.8}
                >
                  <View style={styles.iconCircle}>
                    <Ionicons name="construct-outline" size={24} color="#000" />
                  </View>
                  <Text style={styles.cardTitle}>{t('Technical issues')}</Text>
                  <Text style={styles.cardSubtitle}>{t('Any problems')}</Text>
                </TouchableOpacity>
              </View>

              {/* Privacy & Security - Optional 4th one if needed to match screenshot grid if it was 2x2. 
                  But user said "three button". I will stick to 3.
                  Wait, standard grid often has 4 or scrollable.
                  I'll check if I should add a 4th dummy or just 3.
                  User: "add the three button". Okay.
              */}
            </View>

            <View style={styles.bottomSpacer} />
          </>
        )}
        <SuggestionsFooter sourceRoute="CustomerSupport" />
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
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    flex: 1,
    textAlign: 'left',
    marginLeft: 12,
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    height: '100%',
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  categoriesContainer: {
    marginBottom: 30,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    flex: 1,
    textTransform: 'capitalize',
  },
  helpSection: {
    marginTop: 10,
    backgroundColor: '#f9f9f9',
    marginHorizontal: -16, // Extend to edges
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  helpSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // gap: 10, // gap not supported in older RN, use percentage width
  },
  helpCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    width: '32%', // 3 column
    alignItems: 'flex-start', // Left align text as in screenshot typically
    borderWidth: 1,
    borderColor: '#eee',
    // Shadow for "card" feel
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconCircle: {
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 10, // Small text
    color: '#666',
    lineHeight: 14,
  },
  bottomSpacer: {
    height: 40,
  },
  // Search Results Styles
  centerContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  emptySubtext: {
    marginTop: 5,
    color: '#999',
  },
  searchResultsList: {
    marginTop: 10,
  },
  resultsCount: {
    marginBottom: 10,
    color: '#666',
    fontSize: 12,
  },
  searchResultItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultQuestion: {
    fontSize: 15,
    color: '#007AFF', // Link color
    marginBottom: 4,
  },
  resultPath: {
    fontSize: 12,
    color: '#999',
  }
});

export default CustomerSupportScreen;