import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';

const ShareScreen = ({ navigation }) => {
  const handleBack = () => {
    navigation.goBack();
  };

  const shareMessage = 'Check out RoundBuy - the best marketplace app! Download now and start buying, selling, and trading.';
  const appUrl = 'https://roundbuy.com';

  const handleShare = async (platform) => {
    try {
      await Share.share({
        message: `${shareMessage}\n${appUrl}`,
        title: 'Share RoundBuy',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share');
    }
  };

  const socialPlatforms = [
    {
      id: '1',
      name: 'WhatsApp',
      icon: 'whatsapp',
      iconLibrary: 'FontAwesome',
      color: '#25D366',
    },
    {
      id: '2',
      name: 'Gmail',
      icon: 'envelope',
      iconLibrary: 'FontAwesome',
      color: '#EA4335',
    },
    {
      id: '3',
      name: 'Messenger',
      icon: 'facebook-messenger',
      iconLibrary: 'FontAwesome',
      color: '#0084FF',
    },
    {
      id: '4',
      name: 'Instagram',
      icon: 'instagram',
      iconLibrary: 'FontAwesome',
      color: '#E4405F',
    },
    {
      id: '5',
      name: 'Facebook',
      icon: 'facebook',
      iconLibrary: 'FontAwesome',
      color: '#1877F2',
    },
    {
      id: '6',
      name: 'X',
      icon: 'logo-twitter',
      iconLibrary: 'Ionicons',
      color: '#000',
    },
    {
      id: '7',
      name: 'Pinterest',
      icon: 'pinterest',
      iconLibrary: 'FontAwesome',
      color: '#E60023',
    },
    {
      id: '8',
      name: 'etc.',
      icon: 'ellipsis-horizontal',
      iconLibrary: 'Ionicons',
      color: '#666',
    },
  ];

  const renderIcon = (platform) => {
    if (platform.iconLibrary === 'FontAwesome') {
      return <FontAwesome name={platform.icon} size={32} color="#fff" />;
    } else {
      return <Ionicons name={platform.icon} size={32} color="#fff" />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Text */}
        <Text style={styles.infoText}>
          Share with your friends and connections.
        </Text>

        {/* Share With Section */}
        <Text style={styles.sectionTitle}>Share with</Text>

        {/* Social Icons Grid */}
        <View style={styles.socialGrid}>
          {socialPlatforms.map((platform) => (
            <TouchableOpacity
              key={platform.id}
              style={styles.platformItem}
              onPress={() => handleShare(platform.name)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: platform.color }]}>
                {renderIcon(platform)}
              </View>
              <Text style={styles.platformName}>{platform.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  contentContainer: {
    padding: 20,
  },
  infoText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  platformItem: {
    alignItems: 'center',
    marginBottom: 32,
    width: '25%',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  platformName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
  },
});

export default ShareScreen;