import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/TranslationContext';
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

const SelectProblemScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
  const { category, order } = route.params;
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    try {
      const response = await disputeService.getDisputeProblems(category.id);
      setProblems(response.data);
    } catch (error) {
      console.error('Error loading problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProblem = (problem) => {
    navigation.navigate('ReviewEligibility', {
      category,
      order,
      problem,
    });
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
          <Text style={styles.title}>{t('Select Problem')}</Text>
          <Text style={styles.subtitle}>{t("Choose the specific issue you're experiencing")}</Text>
        </View>

        <View style={styles.selectedInfo}>
          <Text style={styles.selectedLabel}>{t('Category:')}</Text>
          <Text style={styles.selectedValue}>{category.name}</Text>
          <Text style={styles.selectedLabel}>{t('Product:')}</Text>
          <Text style={styles.selectedValue} numberOfLines={2}>
            {order.product_name}
          </Text>
        </View>

        <View style={styles.problemsContainer}>
          {problems.map((problem) => (
            <TouchableOpacity
              key={problem.id}
              style={styles.problemCard}
              onPress={() => handleSelectProblem(problem)}
            >
              <View style={styles.problemIcon}>
                <Feather 
                  name={getProblemIcon(problem.slug)} 
                  size={24} 
                  color="#4169E1" 
                />
              </View>
              <View style={styles.problemContent}>
                <Text style={styles.problemTitle}>{problem.name}</Text>
                <Text style={styles.problemDescription}>
                  {problem.description}
                </Text>
              </View>
              <Feather name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Feather name="info" size={20} color="#FFA500" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>{t('Important')}</Text>
            <Text style={styles.infoText}>{t('Choose the problem that best describes your situation. This helps us route your dispute to the right team for faster resolution.')}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeScreenContainer>
  );
};

const getProblemIcon = (slug) => {
  const icons = {
    'wrong-item': 'x-circle',
    'missing-parts': 'alert-triangle',
    'defective': 'tool',
    'not-working': 'power',
    'damaged': 'shield-off',
    'counterfeit': 'alert-octagon',
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
  selectedInfo: {
    backgroundColor: '#FFF',
    padding: 15,
    marginTop: 10,
    marginHorizontal: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#32CD32',
  },
  selectedLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  selectedValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  problemsContainer: {
    padding: 15,
  },
  problemCard: {
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
  problemIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  problemContent: {
    flex: 1,
    marginLeft: 15,
  },
  problemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  problemDescription: {
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
    borderLeftColor: '#FFA500',
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

export default SelectProblemScreen;