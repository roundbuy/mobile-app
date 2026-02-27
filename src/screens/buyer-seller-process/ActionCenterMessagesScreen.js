import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';
import ActionCardComponent from './ActionCardComponent';
import api from '../../services/api';

const ActionCenterMessagesScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('buying'); // 'buying' or 'selling'
    const [activeFilter, setActiveFilter] = useState('All');
    const [buyerMessages, setBuyerMessages] = useState([]);
    const [sellerMessages, setSellerMessages] = useState([]);

    const sellingFilters = ['All', 'Active', 'Offers', 'Sold', 'Scheduled', 'Picked up', 'Enquiry', 'Finished', 'Unread', 'Archived'];
    const buyingFilters = ['All', 'Active', 'Offers', 'Bought', 'Scheduled', 'Picked up', 'Enquiry', 'Finished', 'Unread', 'Archived'];

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

    const currentFilters = activeTab === 'buying' ? buyingFilters : sellingFilters;
    const allMessagesList = activeTab === 'buying' ? buyerMessages : sellerMessages;

    const activeMessages = allMessagesList.filter(msg => {
        if (activeFilter === 'All') return true;
        return msg.filterCategories?.includes(activeFilter);
    });

    const handleBack = () => navigation.goBack();

    const handleCardPress = (item) => {
        navigation.navigate('SingleItemActionScreen', { actionItem: item, activeTab });
    };

    const renderFilterChips = () => (
        <View style={styles.filterWrapper}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScroll}
                bounces={true}
            >
                {currentFilters.map((filter) => (
                    <TouchableOpacity
                        key={filter}
                        style={[styles.filterChip, activeFilter === filter && styles.activeFilterChip]}
                        onPress={() => setActiveFilter(filter)}
                    >
                        <Text style={[styles.filterChipText, activeFilter === filter && styles.activeFilterChipText]}>
                            {filter}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                    <Text style={styles.headerTitle}>{t('Action center')}</Text>
                </TouchableOpacity>
            </View>

            {/* Segmented Tab Navigation */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'selling' && styles.activeTab]}
                    onPress={() => {
                        setActiveTab('selling');
                        setActiveFilter('All');
                    }}
                >
                    <View style={styles.tabContentRow}>
                        {activeTab === 'selling' && <View style={styles.activeTabDot} />}
                        <Text style={[styles.tabText, activeTab === 'selling' && styles.activeTabText]}>
                            {t('Selling')} ({sellerMessages.length})
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'buying' && styles.activeTab]}
                    onPress={() => {
                        setActiveTab('buying');
                        setActiveFilter('All');
                    }}
                >
                    <View style={styles.tabContentRow}>
                        {activeTab === 'buying' && <View style={styles.activeTabDot} />}
                        <Text style={[styles.tabText, activeTab === 'buying' && styles.activeTabText]}>
                            {t('Buying')} ({buyerMessages.length})
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Filter Chips */}
            {renderFilterChips()}

            {/* List */}
            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
            ) : (
                <FlatList
                    data={activeMessages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ActionCardComponent
                            itemImage={item.itemImage}
                            userAvatar={item.userAvatar}
                            itemTitle={item.itemTitle}
                            username={item.username}
                            statusText={item.statusText}
                            stepNumber={item.stepNumber}
                            actionText={item.actionText}
                            timestamp={item.timestamp}
                            onPress={() => handleCardPress(item)}
                        />
                    )}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>{t('No items match this filter.')}</Text>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginLeft: 8,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: COLORS.primary,
    },
    tabText: {
        fontSize: 16,
        color: '#888',
        fontWeight: '600',
    },
    activeTabText: {
        color: '#000', // Making text black like the picture usually shows for active tabs
    },
    tabContentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTabDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF3B30',
        marginRight: 6,
    },
    filterWrapper: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    filterScroll: {
        paddingHorizontal: 16,
        gap: 8,
        flexDirection: 'row',
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 8,
    },
    activeFilterChip: {
        backgroundColor: COLORS.primary,
    },
    filterChipText: {
        fontSize: 14,
        color: '#444',
        fontWeight: '500',
    },
    activeFilterChipText: {
        color: '#fff',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 16,
    },
    emptyContainer: {
        padding: 24,
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
    },
});

export default ActionCenterMessagesScreen;
