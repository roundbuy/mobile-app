import React from 'react';
import { IMAGES } from '../../../assets/images';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';

const ReceivedOffersScreen = ({ navigation }) => {
  const offers = [
    {
      id: 1,
      productTitle: 'Wooden chair',
      type: 'RENT',
      offer: '£250.00',
      date: '12 October 2025',
      message: 'You have an offer at 24.10.2025. Please see list as decline...',
      image: IMAGES.chair1,
    },
    {
      id: 2,
      productTitle: 'Couny chair',
      type: 'BUY',
      offer: '£180.00',
      date: '12 October 2025',
      message: 'You have an offer at 24.10.2025. Please see list as decline...',
      image: IMAGES.chair2,
    },
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAccept = (offer) => {
    console.log('Accept offer:', offer);
  };

  const handleDecline = (offer) => {
    console.log('Decline offer:', offer);
  };

  const renderOffer = ({ item }) => (
    <View style={styles.offerCard}>
      <View style={styles.offerHeader}>
        <Image source={item.image} style={styles.productImage} />
        <View style={styles.productInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.productTitle}>{item.productTitle}</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{item.type}</Text>
            </View>
          </View>
          <Text style={styles.offerText}>
            You have an offer at {item.date.split(' ')[0]}.{item.date.split(' ')[1]}.{item.date.split(' ')[2]}. Please see list as decline...
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

      <FlatList
        data={offers}
        renderItem={renderOffer}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

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
});

export default ReceivedOffersScreen;