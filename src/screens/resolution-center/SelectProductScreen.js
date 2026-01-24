import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/TranslationContext';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import disputeService from '../../services/disputeService';

const SelectProductScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { category } = route.params;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await disputeService.getEligibleOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (order) => {
    navigation.navigate('SelectProblem', {
      category,
      order
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
          <Text style={styles.title}>{t('Select Product')}</Text>
          <Text style={styles.subtitle}>{t('Choose the product you want to dispute')}</Text>
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>{t('No Eligible Orders')}</Text>
            <Text style={styles.emptyText}>{t("You don't have any orders eligible for disputes at this time.")}</Text>
          </View>
        ) : (
          <View style={styles.ordersContainer}>
            {orders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => handleSelectProduct(order)}
              >
                <Image
                  source={{ uri: order.product_image }}
                  style={styles.productImage}
                />
                <View style={styles.orderContent}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {order.product_name}
                  </Text>
                  <Text style={styles.orderNumber}>
                    Order #{order.order_number}
                  </Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.order_date).toLocaleDateString()}
                  </Text>
                  <Text style={styles.orderPrice}>
                    ${order.total_amount}
                  </Text>
                </View>
                <Feather name="chevron-right" size={24} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.infoCard}>
          <Feather name="info" size={20} color="#4169E1" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>{t('Eligibility')}</Text>
            <Text style={styles.infoText}>{t("Only orders from the past 30 days are eligible for disputes. If you don't see your order, it may not be eligible.")}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeScreenContainer>
  );
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
  ordersContainer: {
    padding: 15,
  },
  orderCard: {
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
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  orderContent: {
    flex: 1,
    marginLeft: 15,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  orderNumber: {
    fontSize: 14,
    color: '#4169E1',
    marginTop: 5,
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#32CD32',
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
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

export default SelectProductScreen;