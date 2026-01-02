// Example: How to apply GlobalHeader to any screen

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlobalHeader from '../../components/GlobalHeader';

const YourScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Global Header - Replace your custom header with this */}
            <GlobalHeader
                title="Your Screen Title"
                navigation={navigation}
                showBackButton={true}  // Set to false if you don't want back button
                showIcons={true}       // Set to false to hide notification/email/menu icons
            />

            {/* Your screen content */}
            <ScrollView style={styles.content}>
                <Text>Your content here...</Text>
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
        padding: 20,
    },
});

export default YourScreen;
