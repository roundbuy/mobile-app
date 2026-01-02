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
import GlobalHeader from '../../../components/GlobalHeader';

const LoginSecurityScreen = ({ navigation }) => {
  const handleBack = () => {
    navigation.goBack();
  };

  const handleUsername = () => {
    console.log('Navigate to Username');
    // Future: Navigate to username change screen
  };

  const handlePassword = () => {
    navigation.navigate('ChangePassword');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader
        title="Login and security"
        navigation={navigation}
        showBackButton={true}
        showIcons={true}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Username */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleUsername}
          activeOpacity={0.7}
        >
          <Text style={styles.menuItemText}>Username</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        {/* Password */}
        <TouchableOpacity
          style={[styles.menuItem, styles.menuItemLast]}
          onPress={handlePassword}
          activeOpacity={0.7}
        >
          <Text style={styles.menuItemText}>Password</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
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
});

export default LoginSecurityScreen;