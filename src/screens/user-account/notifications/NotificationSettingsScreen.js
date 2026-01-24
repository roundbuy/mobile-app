import React, { useState } from 'react';
import { IMAGES } from '../../../assets/images';
import { useTranslation } from '../../../context/TranslationContext';
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
    const { t } = useTranslation();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [marketingNotifications, setMarketingNotifications] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSaveChoices = () => {
    console.log('Saving notification preferences:', {
      pushNotifications,
      marketingNotifications,
    });
    navigation.goBack();
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
          <Text style={styles.logoText}>{t('RoundBuy')}</Text>
        </View>

        <Text style={styles.title}>{t('Notifications settings')}</Text>
        <Text style={styles.subtitle}>{t('We would like your permission to use your data for the following purposes:')}</Text>

        {/* Push Notifications */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingTitle}>{t('Push Notifications')}</Text>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: '#d0d0d0', true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </View>
        <Text style={styles.settingDescription}>{t('Allow or disable push notifications. You can control whether you receive notifications on your device.')}</Text>

        {/* In-App Notifications */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingTitle}>{t('In-App Notifications')}</Text>
            <View style={styles.alwaysOnBadge}>
              <Text style={styles.alwaysOnText}>{t('Always On')}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </View>
        <Text style={styles.settingDescription}>{t('In-app notifications are always enabled to ensure you receive important updates and messages while using the app.')}</Text>

        {/* Marketing Notifications */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingTitle}>{t('Marketing Notifications')}</Text>
            <Switch
              value={marketingNotifications}
              onValueChange={setMarketingNotifications}
              trackColor={{ false: '#d0d0d0', true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </View>
        <Text style={styles.settingDescription}>{t('Receive marketing communications including push notifications, in-app notifications, and emails about promotions, recommendations, and special offers. We need your permission to send you marketing content.')}</Text>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>{t('Marketing notifications include push notifications, in-app messages, and emails about our latest offers and recommendations.')}</Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChoices}>
          <Text style={styles.saveButtonText}>{t('Save my Choices')}</Text>
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
  alwaysOnBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  alwaysOnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
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