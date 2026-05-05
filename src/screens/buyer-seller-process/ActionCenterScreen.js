import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    SafeAreaView,
    TouchableOpacity,
    Image,
    Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { getFullImageUrl } from '../../utils/imageUtils';

const ActionCenterScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const { userCurrency } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('buying'); // 'buying' or 'selling'
    const [buyerMessages, setBuyerMessages] = useState([]);
    const [sellerMessages, setSellerMessages] = useState([]);

    const currencySymbol = userCurrency === 'USD' ? '$' :
        userCurrency === 'EUR' ? '€' : '£';

    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/buyer-seller/action-center?type=${activeTab}`);
                if (response.data?.success) {
                    if (activeTab === 'buying') {
                        setBuyerMessages(response.data.data);
                    } else {
                        setSellerMessages(response.data.data);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch action center messages', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [activeTab]);

    const handleItemPress = (item) => {
        navigation.navigate('SingleItemActionScreen', {
            conversationId: item.conversationId,
            advertisementId: item.advertisementId,
            itemTitle: item.itemTitle,
            itemPrice: item.itemPrice,
            itemImage: item.itemImage,
            otherUserName: item.username,
            type: activeTab
        });
    };

    const renderActionCard = ({ item }) => {
        // Handle Action Text mapping based on the mockups.
        // We replace "Action: " with nothing, just use the raw text and color it green.
        let dynamicActionText = item.actionText.replace('Action: ', '');

        // Custom mapping to match screenshot exactly
        if (dynamicActionText === 'Provide item info!') dynamicActionText = 'Answer Buyer enquiries!';
        if (dynamicActionText === 'Make a new Offer!') dynamicActionText = 'Make a Buyer Offer!';
        if (dynamicActionText === 'See Offer!') dynamicActionText = 'Make a Buyer Offer!';
        if (dynamicActionText === 'Pay to confirm Deal!') dynamicActionText = 'Purchase Item!';

        return (
            <TouchableOpacity style={styles.cardContainer} onPress={() => handleItemPress(item)}>
                <Image
                    source={item.itemImage ? { uri: getFullImageUrl(item.itemImage) } : { uri: 'https://via.placeholder.com/100' }}
                    style={styles.cardImage}
                    resizeMode="cover"
                />

                <View style={styles.cardContent}>
                    <View style={styles.cardTopRow}>
                        <Text style={styles.itemTitle} numberOfLines={1}>{item.itemTitle || 'Item'}</Text>
                        <Text style={styles.stepText}>{item.stepNumber}</Text>
                    </View>

                    <View style={styles.cardMiddleRow}>
                        <Text style={styles.itemPrice}>{currencySymbol}{item.itemPrice || '0.00'}</Text>
                        <Ionicons name="chevron-forward" size={24} color="#000" style={styles.chevronIcon} />
                    </View>

                    <Text style={styles.statusLabel}>Current action status:</Text>
                    <Text style={styles.actionText}>{dynamicActionText}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const dataToRender = activeTab === 'buying' ? buyerMessages : sellerMessages;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                    <Text style={styles.headerTitle}>Action Center</Text>
                </TouchableOpacity>
            </View>

            {/* Segmented Tab Navigation */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'buying' && styles.activeTab]}
                    onPress={() => setActiveTab('buying')}
                >
                    <Text style={[styles.tabText, activeTab === 'buying' && styles.activeTabText]}>
                        Buying
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'selling' && styles.activeTab]}
                    onPress={() => setActiveTab('selling')}
                >
                    <Text style={[styles.tabText, activeTab === 'selling' && styles.activeTabText]}>
                        Selling
                    </Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={dataToRender}
                    renderItem={renderActionCard}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="folder-open-outline" size={60} color="#ccc" />
                            <Text style={styles.emptyText}>
                                {t('No active items in Action Center.')}
                            </Text>
                        </View>
                    }
                    ListFooterComponent={
                        dataToRender.length > 0 && (
                            <View style={styles.footerContainer}>
                                <Text style={styles.footerText}>
                                    Read our <Text style={styles.footerLink} onPress={() => {/* link */ }}>Safety Guidelines & Disclaimers</Text>
                                </Text>
                            </View>
                        )
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginLeft: 8,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#000',
    },
    tabText: {
        fontSize: 16,
        color: '#888',
        fontWeight: '700',
    },
    activeTabText: {
        color: '#000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
    },
    cardContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 4,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        overflow: 'hidden',
    },
    cardImage: {
        width: 100,
        height: '100%',
        backgroundColor: '#f5f5f5',
    },
    cardContent: {
        flex: 1,
        padding: 12,
        paddingRight: 4,
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#000',
        flex: 1,
    },
    stepText: {
        fontSize: 14,
        color: '#666',
        marginRight: 8,
    },
    cardMiddleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    itemPrice: {
        fontSize: 15,
        fontWeight: '800',
        color: '#000',
    },
    chevronIcon: {
        marginRight: 4,
    },
    statusLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000', // Bright green from user's other screens / designs
    },
    actionStatus: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        color: '#888',
    },
    footerContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    footerText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#000',
    },
    footerLink: {
        color: '#007AFF', // Standard iOS blue or custom blue
        textDecorationLine: 'underline',
    }
});

export default ActionCenterScreen;
