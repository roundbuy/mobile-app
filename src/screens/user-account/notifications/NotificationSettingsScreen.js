import React, { useState } from 'react';
import { IMAGES } from '../../../assets/images';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';

const NotificationSettingsScreen = ({ navigation }) => {
  const [searchNotifications, setSearchNotifications] = useState(true);
  const [fastAds, setFastAds] = useState(false);
  const [targetedAds, setTargetedAds] = useState(false);
  const [recommendations, setRecommendations] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSaveChoices = () => {
    console.log('Saving notification preferences:', {
      searchNotifications,
      fastAds,
      targetedAds,
      recommendations,
    });
    navigation.goBack();
  };

  const handleViewPartners = () => {
    console.log('View partners');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={IMAGES.logoMain}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>RoundBuy</Text>
        </View>

        <Text style={styles.title}>Notifications settings</Text>
        <Text style={styles.subtitle}>
          We would like your permission to use your data for the following purposes:
        </Text>

        {/* Search Notifications */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingTitle}>Search Notifications</Text>
            <Switch
              value={searchNotifications}
              onValueChange={setSearchNotifications}
              trackColor={{ false: '#d0d0d0', true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </View>
        <Text style={styles.settingDescription}>
          Set this on if you wish to receive notifications for the created search notifications.
        </Text>

        {/* Fast Ads */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingTitle}>Fast Ads</Text>
            <Switch
              value={fastAds}
              onValueChange={setFastAds}
              trackColor={{ false: '#d0d0d0', true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </View>
        <Text style={styles.settingDescription}>
          Set this on if you wish to send and receive Fast ads. Please note, this is only possible if it is on.
        </Text>

        {/* Targeted Ads */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingTitle}>Targeted Ads</Text>
            <Switch
              value={targetedAds}
              onValueChange={setTargetedAds}
              trackColor={{ false: '#d0d0d0', true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </View>
        <Text style={styles.settingDescription}>
          Set this on if you wish to send and receive Fast ads. Please note, this is only possible if it is on.
        </Text>

        {/* Recommendations & Promos */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingTitle}>Recommendations & Promos</Text>
            <Switch
              value={recommendations}
              onValueChange={setRecommendations}
              trackColor={{ false: '#d0d0d0', true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </View>
        <Text style={styles.settingDescription}>
          Receive the best recommendations and promotions from us, to improve sales.
        </Text>

        {/* View Partners */}
        <TouchableOpacity 
          style={styles.partnersLink}
          onPress={handleViewPartners}
        >
          <Text style={styles.partnersLinkText}>View All Partners.</Text>
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChoices}>
          <Text style={styles.saveButtonText}>Save my Choices</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
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
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 16,
  },
  partnersLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  partnersLinkText: {
    fontSize: 14,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default NotificationSettingsScreen;