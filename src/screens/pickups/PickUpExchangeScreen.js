import React from 'react';
import { useTranslation } from '../../context/TranslationContext';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import GlobalHeader from '../../components/GlobalHeader';

const PickUpExchangeScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const menuItems = [
        {
            id: 1,
            title: 'Schedule a Pick Up & Exchange',
            icon: 'calendar-outline',
            screen: 'PickUpStatus',
            description: 'View and manage your scheduled pickups',
            color: COLORS.primary
        },
        {
            id: 2,
            title: 'Status of Pick Ups',
            icon: 'list-outline',
            screen: 'PickUpStatus',
            description: 'Track all your pickup statuses',
            color: '#4CAF50'
        },
        {
            id: 3,
            title: 'Unpaid Pick Up & Safe Service Fees',
            icon: 'card-outline',
            screen: 'UnpaidPickUpFees',
            description: 'View and pay pending fees',
            color: '#FF9800'
        },
        {
            id: 4,
            title: 'Paid Pick Up & Safe Service Fees',
            icon: 'checkmark-circle-outline',
            screen: 'PaidPickUpFees',
            description: 'View payment history',
            color: '#2196F3'
        },
    ];

    const handleMenuPress = (screen) => {
        navigation.navigate(screen);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <GlobalHeader
                title={t('Pick Ups & Exchanges')}
                navigation={navigation}
                showBackButton={true}
                showIcons={true}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.menuContainer}>
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuItem}
                            onPress={() => handleMenuPress(item.screen)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}15` }]}>
                                <Ionicons name={item.icon} size={28} color={item.color} />
                            </View>
                            <View style={styles.menuTextContainer}>
                                <Text style={styles.menuTitle}>{item.title}</Text>
                                <Text style={styles.menuDescription}>{item.description}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#999" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Safety Info */}
                <View style={styles.safetyInfo}>
                    <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.safetyText}>
                        Stay safe in RoundBuy. Don't share personal data, click on external links, or scan codes.{' '}
                        <Text style={styles.safetyLink}>{t('More safety info')}</Text>
                    </Text>
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
    content: {
        flex: 1,
    },
    menuContainer: {
        padding: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    menuIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    menuDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    safetyInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        padding: 16,
        margin: 16,
        backgroundColor: '#f5f8ff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e3f2fd',
    },
    safetyText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        lineHeight: 20,
    },
    safetyLink: {
        color: COLORS.primary,
        fontWeight: '600',
    },
});

export default PickUpExchangeScreen;
