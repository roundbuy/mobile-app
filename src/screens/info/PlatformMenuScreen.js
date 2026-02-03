import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../context/TranslationContext';
import { COLORS } from '../../constants/theme';
import GlobalHeader from '../../components/GlobalHeader';

const PlatformMenuScreen = ({ navigation }) => {
    const { t } = useTranslation();

    const menuItems = [
        {
            id: '1',
            title: t('Second-hand future'),
            icon: 'time-outline',
            sections: [
                { heading: t('The Future is Circular'), text: t('Why buy new when slightly used works perfectly? We are building a future where reuse is the norm.') },
                { heading: t('Economic Impact'), text: t('Supporting local sellers keeps money in the community and reduces reliance on global supply chains.') },
                { heading: t('Join the Movement'), text: t('Every item you buy or sell on RoundBuy contributes to this vision.') }
            ]
        },
        {
            id: '2',
            title: t('Pick it Up from walking distance'),
            icon: 'walk-outline',
            sections: [
                { heading: t('Local First'), text: t('Find treasures within walking distance. Save on shipping and emissions.') },
                { heading: t('Meet Your Neighbors'), text: t('Safe, local pickups foster community connections.') },
                { heading: t('Convenience'), text: t('No waiting for delivery trucks. Get it today.') }
            ]
        },
        {
            id: '3',
            title: t('Sell & Buy around you'),
            icon: 'location-outline',
            sections: [
                { heading: t('Hyper-local Marketplace'), text: t('Our filters let you see what is available right around the corner.') },
                { heading: t('Easy Selling'), text: t('Snap a picture, post it, and sell to someone nearby.') },
                { heading: t('Safety Features'), text: t('Verified profiles and rating systems ensure you trade with confidence.') }
            ]
        },
        {
            id: '4',
            title: t('Green future'),
            icon: 'leaf-outline',
            sections: [
                { heading: t('Less Waste'), text: t('Keep quality items out of landfills.') },
                { heading: t('Lower Carbon Footprint'), text: t('Local trade means less transportation pollution.') },
                { heading: t('Sustainable Lifestyle'), text: t('Make sustainability a daily habit.') }
            ]
        },
        {
            id: '5',
            title: t('Accessibility'),
            icon: 'accessibility-outline',
            sections: [
                { heading: t('Inclusive Design'), text: t('We strive to make RoundBuy usable for everyone, regardless of ability.') }
            ]
        },
        {
            id: '6',
            title: t('Sustainability'),
            icon: 'earth-outline',
            sections: [
                { heading: t('Our Pledge'), text: t('We are committed to reducing our environmental impact in every aspect of our business.') }
            ]
        },
        {
            id: '7',
            title: t('Visibility Boosts'),
            icon: 'rocket-outline',
            targetScreen: 'VisibilityBoostInfo'
        }
    ];

    const handlePress = (item) => {
        if (item.targetScreen) {
            navigation.navigate(item.targetScreen);
        } else {
            navigation.navigate('GenericInfo', {
                title: item.title,
                sections: item.sections
            });
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <GlobalHeader
                title={t('Platform Information')}
                navigation={navigation}
                showBackButton={true}
            />

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                {menuItems.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.menuItem}
                        onPress={() => handlePress(item)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconContainer}>
                            <Ionicons name={item.icon} size={24} color={COLORS.primary} />
                        </View>
                        <Text style={styles.menuTitle}>{item.title}</Text>
                        <Ionicons name="chevron-forward" size={24} color="#999" />
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
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    menuTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
});

export default PlatformMenuScreen;
