import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../../constants/theme';

const PurchaseVisibilityScreen = ({ navigation }) => {
  const handleBack = () => {
    navigation.goBack();
  };

  const visibilityTypes = [
    {
      id: 1,
      title: 'Partner Visibility Ad',
      route: 'PurchaseVisibilityAdsList',
      params: { type: 'partner' }
    },
    {
      id: 2,
      title: 'Purchase+Targeted Ad',
      route: 'PurchaseVisibilityAdsList',
      params: { type: 'targeted' }
    },
    {
      id: 3,
      title: 'Purchase+Fast Ad',
      route: 'PurchaseVisibilityAdsList',
      params: { type: 'fast' }
    },
  ];

  const handleVisibilityPress = (item) => {
    navigation.navigate(item.route, item.params);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Purchase Visibility</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {visibilityTypes.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              index === visibilityTypes.length - 1 && styles.lastMenuItem
            ]}
            onPress={() => handleVisibilityPress(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.menuItemText}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}
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
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
});

export default PurchaseVisibilityScreen;