import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

const RedeemRewardScreen = ({ navigation, route }) => {
  const { category, referralData } = route.params;

  // State for selected items
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Dummy membership plans data
  const membershipPlans = [
    {
      id: 'green',
      name: 'Green',
      color: '#4CAF50',
      description: 'Basic membership',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
    },
    {
      id: 'gold',
      name: 'Gold',
      color: '#FFD700',
      description: 'Premium membership',
      features: ['All Green features', 'Feature 4', 'Feature 5'],
    },
  ];

  // Dummy user products data
  const userProducts = [
    {
      id: '1',
      name: 'Armchair',
      distance: '1000 m / 25 min walk',
      image: require('../../../assets/chair1.png'),
    },
    {
      id: '2',
      name: 'Wooden Chair',
      distance: '750 m / 15 min walk',
      image: require('../../../assets/chair2.png'),
    },
    {
      id: '3',
      name: 'Work-chair',
      distance: '250 m / 5 min walk',
      image: require('../../../assets/chair3.png'),
    },
    {
      id: '4',
      name: 'Cosy Chair',
      distance: '500 m / 10 min walk',
      image: require('../../../assets/chair1.png'),
    },
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleToggleProduct = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      // Limit selection based on reward (e.g., 2x visibility ads)
      const maxSelection = 2;
      if (selectedProducts.length < maxSelection) {
        setSelectedProducts([...selectedProducts, productId]);
      } else {
        Alert.alert('Limit Reached', `You can only select up to ${maxSelection} items.`);
      }
    }
  };

  const handleRedeem = () => {
    if (category.type === 'plan_upgrade') {
      if (!selectedPlan) {
        Alert.alert('Selection Required', 'Please select a membership plan.');
        return;
      }
    } else if (category.type === 'visibility_upgrade') {
      if (selectedProducts.length === 0) {
        Alert.alert('Selection Required', 'Please select at least one product.');
        return;
      }
    }

    navigation.navigate('RewardSuccess', { 
      category, 
      selectedPlan, 
      selectedProducts 
    });
  };

  const renderPlanOption = (plan) => (
    <TouchableOpacity
      key={plan.id}
      style={[
        styles.planCard,
        selectedPlan === plan.id && styles.planCardSelected,
      ]}
      onPress={() => setSelectedPlan(plan.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.planColorBar, { backgroundColor: plan.color }]} />
      <View style={styles.planContent}>
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          <View style={styles.radioButton}>
            {selectedPlan === plan.id && (
              <View style={styles.radioButtonInner} />
            )}
          </View>
        </View>
        <Text style={styles.planDescription}>{plan.description}</Text>
        <View style={styles.planFeatures}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={16} color={plan.color} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderProductItem = (product) => {
    const isSelected = selectedProducts.includes(product.id);
    
    return (
      <TouchableOpacity
        key={product.id}
        style={[
          styles.productCard,
          isSelected && styles.productCardSelected,
        ]}
        onPress={() => handleToggleProduct(product.id)}
        activeOpacity={0.7}
      >
        <Image source={product.image} style={styles.productImage} />
        <View style={styles.productContent}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productDistance}>Distance: {product.distance}</Text>
        </View>
        <View style={styles.checkbox}>
          {isSelected && (
            <Ionicons name="checkmark" size={20} color="#fff" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {category.type === 'plan_upgrade' ? 'Membership plans' : 'Redeem rewards'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Reward Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerTitle}>
            {category.type === 'plan_upgrade' 
              ? '1 x Visibility Ad' 
              : '2 x Visibility Ads'}
          </Text>
          <Text style={styles.infoBannerText}>
            {category.type === 'plan_upgrade'
              ? 'You have earned one Visibility Ad for free. Click below to choose the plan you want to use the ad. Please note you cannot cancel a choice!'
              : 'You have earned 2 Visibility Ads for free. Click below to choose the Ads you want to use them. Please note you cannot cancel a choice!'}
          </Text>
        </View>

        {/* Conditional Content */}
        {category.type === 'plan_upgrade' ? (
          <View style={styles.plansContainer}>
            <Text style={styles.sectionTitle}>Select a membership plan</Text>
            {membershipPlans.map(renderPlanOption)}
          </View>
        ) : (
          <View style={styles.productsContainer}>
            <Text style={styles.sectionTitle}>
              Select ads ({selectedProducts.length}/2 selected)
            </Text>
            {userProducts.map(renderProductItem)}
          </View>
        )}

        {/* Redeem Button */}
        <TouchableOpacity
          style={[
            styles.redeemButton,
            (category.type === 'plan_upgrade' ? !selectedPlan : selectedProducts.length === 0) 
              && styles.redeemButtonDisabled
          ]}
          onPress={handleRedeem}
          activeOpacity={0.8}
          disabled={category.type === 'plan_upgrade' ? !selectedPlan : selectedProducts.length === 0}
        >
          <Text style={styles.redeemButtonText}>Redeem Your Reward</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footerText}>© 2024-2025 RoundBuy Inc ®</Text>
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
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginRight: 36,
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  infoBanner: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  infoBannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  infoBannerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  plansContainer: {
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  planCardSelected: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  planColorBar: {
    height: 8,
  },
  planContent: {
    padding: 16,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  planFeatures: {
    marginTop: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  productsContainer: {
    marginBottom: 24,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  productCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '05',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  productContent: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  productDistance: {
    fontSize: 12,
    color: '#666',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  redeemButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  redeemButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  redeemButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default RedeemRewardScreen;