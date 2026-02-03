import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../context/TranslationContext';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { rewardsService } from '../../../services/rewardsService';

const LotteryWinnersScreen = ({ navigation }) => {
    const { t } = useTranslation();

    // Dummy winners data
    const [loading, setLoading] = useState(true);
    const [winners, setWinners] = useState([]);
    const [jackpot, setJackpot] = useState('100.00');

    useEffect(() => {
        fetchLotteryInfo();
    }, []);

    const fetchLotteryInfo = async () => {
        try {
            setLoading(true);
            const data = await rewardsService.getLotteryInfo();
            setWinners(data.data.winners);
            if (data.data.jackpot) {
                setJackpot(data.data.jackpot.toFixed(2));
            }
        } catch (error) {
            console.error('Error fetching lottery info:', error);
            // Keep dummy data on error or show alert
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const renderWinnerItem = ({ item, index }) => (
        <View style={styles.winnerItem}>
            <Text style={styles.winnerIndex}>{index + 1}.</Text>
            <Text style={styles.winnerName}>{item.username}</Text>
            <Text style={styles.winnerAmount}>£{item.amount}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Monthly Lottery Winners')}</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Jackpot Image Placeholder */}
                <View style={styles.jackpotContainer}>
                    <View style={styles.jackpotPlaceholder}>
                        <Ionicons name="trophy" size={64} color="#FFD700" />
                        <Text style={styles.jackpotText}>JACKPOT</Text>
                        <Text style={{ color: '#FFD700', fontSize: 16, fontWeight: 'bold' }}>£{jackpot}</Text>
                    </View>
                </View>

                <Text style={styles.title}>{t('The Winners of Lottery')}</Text>

                <View style={styles.winnersList}>
                    {winners.map((item, index) => (
                        <View key={item.id} style={styles.winnerItem}>
                            <Text style={styles.winnerIndex}>{index + 1}.</Text>
                            <Text style={styles.winnerName}>{item.username}</Text>
                            <Text style={styles.winnerAmount}>£{item.amount}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.disclaimer}>
                    {t('Please note, the lottery credit worth of £100.00, is non refundable and only usable at Roundbuy for Visibilty Ads.')}
                </Text>

                <TouchableOpacity style={styles.moreInfo}>
                    <Text style={styles.moreInfoText}>{t('More information on Rewards & Credits, click here')}</Text>
                    <Ionicons name="information-circle-outline" size={20} color="#666" />
                </TouchableOpacity>

                <Text style={styles.footerText}>{t('© 2024-2026 RoundBuy Inc ®')}</Text>
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
        padding: 20,
        alignItems: 'center',
    },
    jackpotContainer: {
        marginBottom: 24,
        alignItems: 'center',
    },
    jackpotPlaceholder: {
        width: 200,
        height: 120,
        backgroundColor: '#000',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFD700',
    },
    jackpotText: {
        color: '#FFD700',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 20,
    },
    winnersList: {
        width: '100%',
        marginBottom: 24,
    },
    winnerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    winnerIndex: {
        fontSize: 16,
        fontWeight: '600',
        width: 30,
    },
    winnerName: {
        fontSize: 16,
        flex: 1,
    },
    winnerAmount: {
        fontSize: 16,
        fontWeight: '700',
    },
    disclaimer: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 18,
    },
    moreInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
    },
    moreInfoText: {
        fontSize: 12,
        color: '#666',
        marginRight: 6,
        textDecorationLine: 'underline',
    },
    footerText: {
        fontSize: 10,
        color: '#999',
        marginTop: 'auto',
    },
});

export default LotteryWinnersScreen;
