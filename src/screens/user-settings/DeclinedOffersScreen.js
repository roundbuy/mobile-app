import React from 'react';
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
import { COLORS } from '../../constants/theme';

const DeclinedOffersScreen = ({ navigation }) => {
  const offers = [
    {
      id: 1,
      productTitle: 'Armchair',
      type: 'SELL',
      declinedPrice: '£200.00',
      date: '24.10.2025',
      message: 'You Declined the offer at 24.10.2025. You can initiate a new counteroffer. Read more, Here',
      image: require('../../../assets/chair1.png'),
    },
    {
      id: 2,
      productTitle: 'Work chair',
      type: 'SELL',
      declinedPrice: '£150.00',
      date: '24.10.2025',
      message: 'You Declined the offer at 24.10.2025. You can initiate a new counteroffer. Read more, Here',
      image: require('../../../assets/chair2.png'),
    },
  ];

  const handleBack = () => {
    navigation.goBack();
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
          <Text style={styles.declinedText}>
            You <Text style={styles.boldText}>Declined</Text> the offer at {item.date}.
          </Text>
          <Text style={styles.offerMessage}>{item.message}</Text>
        </View>
      </View>

      <View style={styles.declinedBadge}>
        <Text style={styles.declinedBadgeText}>Declined</Text>
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
        <Text style={styles.headerTitle}>Declined offers</Text>
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
    marginBottom: 12,
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
  declinedText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  boldText: {
    fontWeight: '700',
    color: '#000',
  },
  offerMessage: {
    fontSize: 12,
    color: '#999',
    lineHeight: 16,
  },
  declinedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffebee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  declinedBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#c62828',
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

export default DeclinedOffersScreen;