import React, { useState, useEffect } from 'react';
import { IMAGES } from '../../../assets/images';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { offersService } from '../../../services';

const ReceivedOffersScreen = ({ navigation }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReceivedOffers();
  }, []);

  const fetchReceivedOffers = async () => {
    try {
      setLoading(true);
      const response = await offersService.getReceivedOffers();
      if (response && response.data) {
        setOffers(response.data.offers || []);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      Alert.alert('Error', 'Failed to load offers. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReceivedOffers();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAccept = async (offer) => {
    try {
      Alert.alert(
        'Accept Offer',
        `Are you sure you want to accept the offer of ${offer.currency_code || '₹'}${offer.offered_price} for "${offer.ad_title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Accept',
            onPress: async () => {
              try {
                const response = await offersService.acceptOffer(offer.id);
                if (response && response.success) {
                  Alert.alert('Success', 'Offer accepted successfully!');
                  // Remove the offer from the list
                  setOffers(prevOffers => prevOffers.filter(o => o.id !== offer.id));
                } else {
                  Alert.alert('Error', response?.message || 'Failed to accept offer.');
                }
              } catch (error) {
                console.error('Accept offer error:', error);
                Alert.alert('Error', error.message || 'Failed to accept offer. Please try again.');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to accept offer. Please try again.');
    }
  };

  const handleDecline = async (offer) => {
    try {
      Alert.alert(
        'Decline Offer',
        `Are you sure you want to decline the offer of ${offer.currency_code || '₹'}${offer.offered_price} for "${offer.ad_title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Decline',
            style: 'destructive',
            onPress: async () => {
              try {
                const response = await offersService.declineOffer(offer.id);
                if (response && response.success) {
                  Alert.alert('Success', 'Offer declined successfully!');
                  // Remove the offer from the list
                  setOffers(prevOffers => prevOffers.filter(o => o.id !== offer.id));
                } else {
                  Alert.alert('Error', response?.message || 'Failed to decline offer.');
                }
              } catch (error) {
                console.error('Decline offer error:', error);
                Alert.alert('Error', error.message || 'Failed to decline offer. Please try again.');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to decline offer. Please try again.');
    }
  };

  const renderOffer = ({ item }) => (
    <View style={styles.offerCard}>
      <View style={styles.offerHeader}>
        <Image
          source={item.ad_images && item.ad_images.length > 0 ? { uri: item.ad_images[0] } : IMAGES.chair1}
          style={styles.productImage}
        />
        <View style={styles.productInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.productTitle}>{item.ad_title}</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{item.activity_name || 'BUY'}</Text>
            </View>
          </View>
          <Text style={styles.offerText}>
            {item.buyer_name} offered {item.currency_code || '₹'}{item.offered_price}
          </Text>
          <Text style={styles.dateText}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.offerActions}>
        <TouchableOpacity
          style={styles.declineButton}
          onPress={() => handleDecline(item)}
        >
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAccept(item)}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>First offers</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading offers...</Text>
        </View>
      ) : (
        <FlatList
          data={offers}
          renderItem={renderOffer}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="megaphone-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No offers received yet</Text>
            </View>
          }
        />
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <FontAwesome name="home" size={26} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <FontAwesome name="bell" size={26} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.addButton]}>
          <FontAwesome name="plus" size={26} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <FontAwesome name="envelope" size={26} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <FontAwesome name="user" size={26} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
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
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  offerCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  offerHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  typeBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
  },
  offerText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  offerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    height: 70,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 10,
    paddingTop: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default ReceivedOffersScreen;