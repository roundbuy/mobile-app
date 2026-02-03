import React from 'react';
import { useTranslation } from '../../../context/TranslationContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GlobalHeader from '../../../components/GlobalHeader';
import SuggestionsFooter from '../../../components/SuggestionsFooter';
import { COLORS } from '../../../constants/theme';

const PrivacyAccountScreen = ({ navigation }) => {
  const { t } = useTranslation();

  const handleBack = () => {
    navigation.goBack();
  };

  const menuItems = [
    { id: 1, title: 'Privacy policy', section: 'top' },
    { id: 2, title: 'ATT tracking preferences', section: 'top' },
    { id: 3, title: 'Cookies preferences', section: 'top' },
    { id: 4, title: 'Request Deletion of User Data', section: 'top' },
    { id: 5, title: 'Download your Personal Data as PDF', section: 'top' },
    { id: 6, title: 'Delete personal data', section: 'bottom' },
    { id: 7, title: 'Delete Account', section: 'bottom', isDanger: true },
  ];

  const handleMenuPress = (item) => {
    console.log('Selected:', item.title);

    switch (item.id) {
      case 1: // Privacy policy
        navigation.navigate('PolicyDetail', { policyType: 'privacy' });
        break;
      case 2: // ATT tracking preferences
        navigation.navigate('ATTTrackingSettings');
        break;
      case 3: // Cookies preferences
        navigation.navigate('CookieSettings');
        break;
      case 4: // Request Deletion of User Data
        navigation.navigate('ConfirmAccessRights', {
          requestType: 'deletion',
          title: 'Request Deletion of User Data'
        });
        break;
      case 5: // Download your Personal Data as PDF
        navigation.navigate('ConfirmAccessRights', {
          requestType: 'download',
          title: 'Download Personal Data'
        });
        break;
      case 6: // Delete personal data
        navigation.navigate('ConfirmAccessRights', {
          requestType: 'delete_data',
          title: 'Delete Personal Data'
        });
        break;
      case 7: // Delete Account
        navigation.navigate('ConfirmAccessRights', {
          requestType: 'delete_account',
          title: 'Delete Account'
        });
        break;
      default:
        break;
    }
  };

  const renderMenuItem = (item, index, isLastInSection) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.menuItem,
        isLastInSection && styles.menuItemLast,
      ]}
      onPress={() => handleMenuPress(item)}
      activeOpacity={0.7}
    >
      <Text style={[styles.menuItemText, item.isDanger && styles.dangerText]}>
        {item.title}
      </Text>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  const topSectionItems = menuItems.filter(item => item.section === 'top');
  const bottomSectionItems = menuItems.filter(item => item.section === 'bottom');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader
        title={t('Privacy & Account')}
        navigation={navigation}
        showBackButton={true}
        showIcons={true}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top Section */}
        <View style={styles.section}>
          {topSectionItems.map((item, index) =>
            renderMenuItem(item, index, index === topSectionItems.length - 1)
          )}
        </View>

        {/* Bottom Section */}
        <View style={[styles.section, styles.sectionSpacing]}>
          {bottomSectionItems.map((item, index) =>
            renderMenuItem(item, index, index === bottomSectionItems.length - 1)
          )}
        </View>
        <SuggestionsFooter sourceRoute="PrivacyAccount" />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 8,
  },
  sectionSpacing: {
    marginTop: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '400',
    flex: 1,
  },
  dangerText: {
    color: '#d32f2f',
  },
});

export default PrivacyAccountScreen;