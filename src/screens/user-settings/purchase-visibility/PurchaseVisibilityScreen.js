import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';
import SuggestionsFooter from '../../../components/SuggestionsFooter';
import { userService } from '../../../services';

const PurchaseVisibilityScreen = ({ navigation }) => {
  const { user } = useAuth();
  const isBusiness = user?.user_type === 'business';
  const servicePriceStr = isBusiness ? '£5.00 / 6 months' : '£2.00 / 6 months';

  const [extensions, setExtensions] = useState({});

  useFocusEffect(
    React.useCallback(() => {
      fetchExtensions();
    }, [])
  );

  const fetchExtensions = async () => {
    try {
      const res = await userService.getSocialClubExtensionStatus();
      if (res?.success && res?.data) {
        setExtensions(res.data);
      }
    } catch (e) {
      console.log('Error loading extensions for PurchaseVisibilityScreen:', e);
    }
  };

  const EXTENSIONS = [
    {
      key: 'locations',
      icon: 'location',
      title: 'Display Locations',
      description: 'Add more locations to reach buyers in different areas',
      price: 'From £2.50 / 6 months',
      route: 'ExtensionLocations',
    },
    {
      key: 'social',
      icon: 'people',
      title: 'Social Clubs, Events & Garage Sales',
      description: 'Unlock gallery listings for community features',
      price: '£2.00 each / 6 months',
      route: 'ExtensionSocialClubs',
    },
    {
      key: 'service_listings',
      icon: 'construct',
      title: 'Service Listings',
      description: 'Unlock the ability to list your professional skills and services',
      price: servicePriceStr,
      route: 'ExtensionShop',
      params: { initialExtension: 'service_listings' }
    },
    {
      key: 'boosts',
      icon: 'rocket',
      title: 'Visibility Boost',
      description: 'Rise to top, TopSpot, ShowCasing and more to promote your listings',
      price: 'From £1.00 / listing',
      route: 'ExtensionBoosts',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Extensions</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Choose how you want to grow your reach</Text>

        {EXTENSIONS.map((ext) => (
          <TouchableOpacity
            key={ext.key}
            style={styles.card}
            onPress={() => {
              if (ext.key === 'service_listings' && extensions.service_listings_active) {
                navigation.navigate('MyServices');
              } else {
                navigation.navigate(ext.route, ext.params);
              }
            }}
            activeOpacity={0.8}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={ext.icon} size={24} color={COLORS.primary} />
            </View>

            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{ext.title}</Text>
              <Text style={styles.cardDesc}>{ext.description}</Text>
              <Text style={styles.cardPrice}>{ext.price}</Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#aaa" />
          </TouchableOpacity>
        ))}

        <SuggestionsFooter sourceRoute="PurchaseVisibility" />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  headerRight: { width: 32 },

  scroll: { padding: 20, gap: 14, paddingBottom: 48 },

  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#fff',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  cardText: { flex: 1 },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 3,
  },
  cardDesc: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
    marginBottom: 5,
  },
  cardPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default PurchaseVisibilityScreen;
