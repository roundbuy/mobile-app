import React, { useState } from 'react';
import { useTranslation } from '../../../context/TranslationContext';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';

const LotteryCreditStatusScreen = ({ navigation }) => {
    const { t } = useTranslation();
    // Dummy data - in real app this would come from backend
    const [creditBalance, setCreditBalance] = useState(100.00);
    const [history] = useState([
        { id: '1', date: '9 days ago', amount: '-24.50', type: 'Visibility-ad' }
    ]);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleBuyAd = () => {
        // Navigate to purchase visibility ad screen
        navigation.navigate('PurchaseVisibility');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Lottery Credit Status')}</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Jackpot Logo */}
                <View style={styles.jackpotContainer}>
                    <View style={styles.jackpotLogo}>
                        <Text style={styles.jackpotLogoText}>JACKPOT</Text>
                        <View style={styles.starsRow}>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Ionicons name="star" size={16} color="#FFD700" />
                        </View>
                    </View>
                </View>

                <Text style={styles.balanceAmount}>£{creditBalance.toFixed(2)}</Text>
                <Text style={styles.balanceLabel}>{t('Your available credits above!')}</Text>

                {/* Conditional history view if balance is not full */}
                {creditBalance < 100 && (
                    <View style={styles.historyContainer}>
                        <Text style={styles.historyTitle}>{t('Your purchase history:')}</Text>
                        {history.map(item => (
                            <View key={item.id} style={styles.historyItem}>
                                <Text style={styles.historyType}>{item.type}</Text>
                                <Text style={styles.historyDate}>{item.date}</Text>
                                <Text style={styles.historyAmount}>{item.amount}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <TouchableOpacity
                    style={styles.buyButton}
                    onPress={handleBuyAd}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buyButtonText}>{t('Redeem a Visbility ad')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.moreInfo}>
                    <Text style={styles.moreInfoText}>{t('More information on Rewards & Credits, click here')}</Text>
                    <Ionicons name="information-circle-outline" size={20} color="#666" />
                </TouchableOpacity>

                {/* Only show this note if balance > 0 or specific condition */}
                <Text style={styles.noteText}>
                    {t('Note! If the Winner buyer has no Standard ads, he will get a message on standard ads to boost! Go ahead n create first a free standard ad.')}
                </Text>

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
        marginBottom: 30,
    },
    jackpotLogo: {
        backgroundColor: '#D32F2F', // Red color
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 10,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFD700',
    },
    jackpotLogoText: {
        color: '#FFD700',
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    starsRow: {
        flexDirection: 'row',
        marginTop: 4,
    },
    balanceAmount: {
        fontSize: 36,
        fontWeight: '700',
        color: '#000',
        marginBottom: 8,
    },
    balanceLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 40,
    },
    historyContainer: {
        width: '100%',
        marginBottom: 30,
    },
    historyTitle: {
        fontSize: 12,
        color: '#999',
        marginBottom: 10,
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    historyType: {
        fontSize: 14,
        fontWeight: '500',
    },
    historyDate: {
        fontSize: 12,
        color: '#666',
    },
    historyAmount: {
        fontSize: 14,
        fontWeight: '600',
    },
    buyButton: {
        backgroundColor: '#f8f9fa',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 25,
        width: '100%',
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    buyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
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
    noteText: {
        fontSize: 11,
        color: 'red',
        textAlign: 'center',
        lineHeight: 16,
    },
});

export default LotteryCreditStatusScreen;
