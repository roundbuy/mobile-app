import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import disputeService from '../../services/disputeService';

const DisputeCategoryScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await disputeService.getDisputeCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = (category) => {
    navigation.navigate('SelectProduct', { category });
  };

  if (loading) {
    return (
      <SafeScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4169E1" />
        </View>
      </SafeScreenContainer>
    );
  }

  return (
    <SafeScreenContainer>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Dispute Type</Text>
          <Text style={styles.subtitle}>
            Select the category that best describes your issue
          </Text>
        </View>

        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleSelectCategory(category)}
            >
              <View style={styles.categoryIcon}>
                <Feather 
                  name={getCategoryIcon(category.slug)} 
                  size={32} 
                  color="#4169E1" 
                />
              </View>
              <View style={styles.categoryContent}>
                <Text style={styles.categoryTitle}>{category.name}</Text>
                <Text style={styles.categoryDescription}>
                  {category.description}
                </Text>
              </View>
              <Feather name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Feather name="info" size={20} color="#4169E1" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Need Help?</Text>
            <Text style={styles.infoText}>
              If you're unsure which category to choose, select the one that most closely matches your situation. You can provide more details in the next steps.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeScreenContainer>
  );
};

const getCategoryIcon = (slug) => {
  const icons = {
    'item-not-received': 'package',
    'item-not-as-described': 'alert-triangle',
    'damaged-item': 'shield-off',
    'seller-communication': 'message-circle',
    'refund-issue': 'dollar-sign',
    'other': 'help-circle',
  };
  return icons[slug] || 'help-circle';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  categoriesContainer: {
    padding: 15,
  },
  categoryCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContent: {
    flex: 1,
    marginLeft: 15,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  infoCard: {
    backgroundColor: '#FFF',
    padding: 15,
    margin: 15,
    borderRadius: 12,
    flexDirection: 'row',
    borderLeftWidth: 4,
    borderLeftColor: '#4169E1',
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});

export default DisputeCategoryScreen;