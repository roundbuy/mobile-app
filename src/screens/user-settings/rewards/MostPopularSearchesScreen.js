import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../context/TranslationContext';
import { useAuth } from '../../../context/AuthContext';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { rewardsService } from '../../../services/rewardsService';
import { ActivityIndicator } from 'react-native';

const MostPopularSearchesScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const { user } = useAuth();

    // Dummy popular searches data
    const [loading, setLoading] = useState(true);
    const [popularSearches, setPopularSearches] = useState([]);

    useEffect(() => {
        fetchSearches();
    }, []);

    const fetchSearches = async () => {
        try {
            setLoading(true);
            const data = await rewardsService.getPopularSearches();
            setPopularSearches(data.data);
        } catch (error) {
            console.error('Error fetching popular searches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const handleMakeAd = (item) => {
        console.log('📱 MostPopularSearches: Navigating with user:', user);
        console.log('📱 MostPopularSearches: Referral Code:', user?.referral_code);
        // Navigate to make ad screen with pre-filled title and referral code
        navigation.navigate('MakeAnAd', {
            initialTitle: item.name,
            initialReferralCode: user?.referral_code || ''
        });
    };

    const renderItem = ({ item, index }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.itemIndex}>{index + 1}.</Text>
            <Text style={styles.itemName}>{item.query || item.name}</Text>
            <TouchableOpacity
                style={styles.makeAdButton}
                onPress={() => handleMakeAd(item)}
            >
                <Text style={styles.makeAdText}>{t('Make an Ad')}</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Most Popular Searches Now')}</Text>
                <View style={styles.headerRight} />
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={popularSearches}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={
                        <>
                            <Text style={styles.title}>{t('Most Popular Searches')}<Text style={styles.asterisk}>*</Text></Text>
                        </>
                    }
                    ListFooterComponent={
                        <View style={styles.footerContainer}>
                            <Text style={styles.footnote}>
                                *{t('These are most popularly searched items at RoundBuy. The statistics is based on last 7 days average.')}
                            </Text>

                            <TouchableOpacity style={styles.moreInfo}>
                                <Text style={styles.moreInfoText}>{t('More information on Rewards & Credits, click here')}</Text>
                                <Ionicons name="information-circle-outline" size={20} color="#666" />
                            </TouchableOpacity>

                            <Text style={styles.copyrightText}>{t('© 2024-2026 RoundBuy Inc ®')}</Text>
                        </View>
                    }
                />
            )}
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
    listContent: {
        padding: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 20,
    },
    asterisk: {
        color: COLORS.primary,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemIndex: {
        fontSize: 14,
        fontWeight: '600',
        width: 30,
    },
    itemName: {
        fontSize: 14,
        flex: 1,
    },
    makeAdButton: {

    },
    makeAdText: {
        fontSize: 14,
        color: '#000',
        textDecorationLine: 'underline',
    },
    footerContainer: {
        marginTop: 30,
    },
    footnote: {
        fontSize: 10,
        color: '#666',
        marginBottom: 20,
        lineHeight: 14,
    },
    moreInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    moreInfoText: {
        fontSize: 12,
        color: '#666',
        marginRight: 6,
        textDecorationLine: 'underline',
    },
    copyrightText: {
        fontSize: 10,
        color: '#999',
        textAlign: 'center',
    },
});

export default MostPopularSearchesScreen;
