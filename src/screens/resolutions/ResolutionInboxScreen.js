import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    SafeAreaView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';
import ActionCardComponent from '../buyer-seller-process/ActionCardComponent';
import api from '../../services/api';
import { API_CONFIG } from '../../config/api.config';

const ResolutionInboxScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('issue'); // 'issue', 'dispute', 'claim'
    const [data, setData] = useState({ issue: [], dispute: [], claim: [] });

    // Helper to format image URLs
    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        // API_CONFIG.BASE_URL is http://localhost:5001/api/v1/mobile-app
        const baseUrl = API_CONFIG.BASE_URL.split('/api/v1')[0];
        return `${baseUrl}/${path.replace(/^\//, '')}`;
    };

    const fetchInbox = async () => {
        try {
            const response = await api.get('/resolution-inbox');
            if (response.data?.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch resolution inbox', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchInbox();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchInbox();
    };

    const handleBack = () => navigation.goBack();

    const navigateToDetail = (item) => {
        if (item.type === 'issue') {
            navigation.navigate('IssueDetail', { issueId: item.ref_id });
        } else if (item.type === 'dispute') {
            navigation.navigate('DisputeDetail', { disputeId: item.ref_id });
        } else if (item.type === 'claim') {
            navigation.navigate('ClaimDetail', { claimId: item.ref_id });
        }
    };

    const timeAgo = (date) => {
        const diff = Math.floor((new Date() - new Date(date)) / 60000);
        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff} min`;
        if (diff < 1440) return `${Math.floor(diff / 60)} h`;
        return `${Math.floor(diff / 1440)} d`;
    };

    const activeMessages = data[activeTab] || [];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                    <Text style={styles.headerTitle}>RESOLUTION MESSAGES</Text>
                </TouchableOpacity>
            </View>

            {/* Segmented Tab Navigation */}
            <View style={styles.tabContainer}>
                {['issue', 'dispute', 'claim'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <View style={styles.tabContentRow}>
                            {activeTab === tab && <View style={styles.activeTabDot} />}
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                {t(tab.charAt(0).toUpperCase() + tab.slice(1))} ({data[tab]?.length || 0})
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
            ) : (
                <FlatList
                    data={activeMessages}
                    keyExtractor={(item, index) => `${activeTab}-${item.ref_id}-${index}`}
                    renderItem={({ item }) => (
                        <ActionCardComponent
                            itemImage={getImageUrl(item.ad_image)}
                            userAvatar={getImageUrl(item.actor_avatar)}
                            itemTitle={item.ad_title}
                            username={item.actor_name}
                            statusText={item.message}
                            stepNumber={item.stage}
                            actionText={item.action_text}
                            timestamp={timeAgo(item.created_at)}
                            onPress={() => navigateToDetail(item)}
                            cardType={item.type}
                            statusBadge={item.status}
                        />
                    )}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No {activeTab} messages found.</Text>
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
        fontWeight: '900',
        color: '#000',
        marginLeft: 8,
        letterSpacing: 0.5,
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
        fontSize: 14,
        color: '#888',
        fontWeight: '600',
    },
    activeTabText: {
        color: '#000',
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
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 16,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
    },
});

export default ResolutionInboxScreen;
