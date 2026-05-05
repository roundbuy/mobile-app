import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/TranslationContext';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Platform,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';
import { API_CONFIG } from '../../config/api.config';
import api from '../../services/api';
import supportService from '../../services/supportService';
import GlobalHeader from '../../components/GlobalHeader';
import SuggestionsFooter from '../../components/SuggestionsFooter';
import ActionCardComponent from '../buyer-seller-process/ActionCardComponent';

const SupportResolutionScreen = ({ navigation }) => {
    const { t } = useTranslation();
    // Main tab state (My support / Resolution center)
    const [activeMainTab, setActiveMainTab] = useState('support');

    // Support sub-tabs state
    const [activeSupportTab, setActiveSupportTab] = useState('all');

    // Resolution center sub-tabs: only issue | dispute | claim
    const [activeResolutionTab, setActiveResolutionTab] = useState('issue');

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [supportData, setSupportData] = useState([]);
    // Resolution data split by type (like ResolutionInboxScreen)
    const [resolutionData, setResolutionData] = useState({ issue: [], dispute: [], claim: [] });

    useEffect(() => {
        loadData();
    }, [activeMainTab, activeSupportTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeMainTab === 'support') {
                await loadSupportData();
            } else {
                await loadResolutionData();
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadSupportData = async () => {
        try {
            let response;
            switch (activeSupportTab) {
                case 'deleted':
                    response = await supportService.getDeletedAds();
                    break;
                case 'appeals':
                    response = await supportService.getAdAppeals();
                    break;
                case 'tickets':
                    response = await supportService.getSupportTickets();
                    break;
                default:
                    response = await supportService.getAllSupport();
            }
            setSupportData(response.data || []);
        } catch (error) {
            console.error('Error loading support data:', error);
            setSupportData([]);
        }
    };

    // Load from /resolution-inbox and split by type (same as ResolutionInboxScreen)
    const loadResolutionData = async () => {
        try {
            const response = await api.get('/resolution-inbox');
            if (response.data?.success) {
                setResolutionData(response.data.data); // { issue: [], dispute: [], claim: [] }
            } else {
                setResolutionData({ issue: [], dispute: [], claim: [] });
            }
        } catch (error) {
            console.error('Error loading resolution data:', error);
            setResolutionData({ issue: [], dispute: [], claim: [] });
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    // Helper to format image URLs
    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const baseUrl = API_CONFIG.BASE_URL.split('/api/v1')[0];
        return `${baseUrl}/${path.replace(/^\//, '')}`;
    };

    const timeAgo = (date) => {
        const diff = Math.floor((new Date() - new Date(date)) / 60000);
        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff}m`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h`;
        return `${Math.floor(diff / 1440)}d ago`;
    };

    const navigateToDetail = (item) => {
        if (item.type === 'issue') {
            navigation.navigate('IssueDetail', { issueId: item.ref_id });
        } else if (item.type === 'dispute') {
            navigation.navigate('DisputeDetail', { disputeId: item.ref_id });
        } else if (item.type === 'claim') {
            navigation.navigate('ClaimDetail', { claimId: item.ref_id });
        }
    };

    const renderSupportItem = ({ item }) => (
        <TouchableOpacity
            style={styles.listItem}
            onPress={() => {
                if (activeSupportTab === 'deleted') {
                    navigation.navigate('DeletedAds');
                } else if (activeSupportTab === 'appeals') {
                    navigation.navigate('AppealStatus', { appealId: item.id });
                } else if (activeSupportTab === 'tickets') {
                    navigation.navigate('TicketDetail', { ticketId: item.id });
                }
            }}
        >
            <View style={styles.itemIcon}>
                <Feather
                    name={activeSupportTab === 'deleted' ? 'alert-triangle' : 'file-text'}
                    size={24}
                    color="#FF5252"
                />
            </View>
            <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDescription} numberOfLines={2}>
                    {item.description}
                </Text>
            </View>
            <Text style={styles.itemTime}>{item.time}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Global Header */}
            <GlobalHeader
                title={t('Support & Resolution')}
                navigation={navigation}
                showBackButton={true}
                showIcons={true}
            />

            {/* Main Tabs: My support | Resolution center */}
            <View style={styles.mainTabsContainer}>
                <TouchableOpacity
                    style={[
                        styles.mainTab,
                        activeMainTab === 'support' && styles.mainTabActive,
                    ]}
                    onPress={() => setActiveMainTab('support')}
                >
                    <Text
                        style={[
                            styles.mainTabText,
                            activeMainTab === 'support' && styles.mainTabTextActive,
                        ]}
                    >{t('My support')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.mainTab,
                        activeMainTab === 'resolution' && styles.mainTabActive,
                    ]}
                    onPress={() => setActiveMainTab('resolution')}
                >
                    <Text
                        style={[
                            styles.mainTabText,
                            activeMainTab === 'resolution' && styles.mainTabTextActive,
                        ]}
                    >{t('Resolution center')}</Text>
                </TouchableOpacity>
            </View>

            {/* Sub Tabs for My Support (horizontal scroll) */}
            {activeMainTab === 'support' && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.subTabsContainer}
                    contentContainerStyle={styles.subTabsContent}
                >
                    <TouchableOpacity
                        key="support-all"
                        style={[styles.subTab, activeSupportTab === 'all' && styles.subTabActive]}
                        onPress={() => setActiveSupportTab('all')}
                    >
                        <Text style={[styles.subTabText, activeSupportTab === 'all' && styles.subTabTextActive]}>
                            {t('All')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        key="support-deleted"
                        style={[styles.subTab, activeSupportTab === 'deleted' && styles.subTabActive]}
                        onPress={() => setActiveSupportTab('deleted')}
                    >
                        <Text style={[styles.subTabText, activeSupportTab === 'deleted' && styles.subTabTextActive]}>
                            {t('Deleted ads')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        key="support-appeals"
                        style={[styles.subTab, activeSupportTab === 'appeals' && styles.subTabActive]}
                        onPress={() => setActiveSupportTab('appeals')}
                    >
                        <Text style={[styles.subTabText, activeSupportTab === 'appeals' && styles.subTabTextActive]}>
                            {t('Ads appeals')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        key="support-tickets"
                        style={[styles.subTab, activeSupportTab === 'tickets' && styles.subTabActive]}
                        onPress={() => setActiveSupportTab('tickets')}
                    >
                        <Text style={[styles.subTabText, activeSupportTab === 'tickets' && styles.subTabTextActive]}>
                            {t('Tickets')}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            )}

            {/* Sub Tabs for Resolution Center — 3 full-width tabs */}
            {activeMainTab === 'resolution' && (
                <View style={styles.resTabsRow}>
                    {['issue', 'dispute', 'claim'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.resTab, activeResolutionTab === tab && styles.resTabActive]}
                            onPress={() => setActiveResolutionTab(tab)}
                        >
                            <Text style={[styles.resTabText, activeResolutionTab === tab && styles.resTabTextActive]}>
                                {t(tab.charAt(0).toUpperCase() + tab.slice(1))} ({resolutionData[tab]?.length || 0})
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Content List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : activeMainTab === 'support' ? (
                <FlatList
                    data={supportData}
                    renderItem={renderSupportItem}
                    keyExtractor={(item, index) => `support-${item.id || index}`}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Feather name="inbox" size={64} color="#CCC" />
                            <Text style={styles.emptyText}>{t('No items found')}</Text>
                        </View>
                    }
                />
            ) : (
                // Resolution center — ActionCardComponent list
                <FlatList
                    data={resolutionData[activeResolutionTab] || []}
                    keyExtractor={(item, index) => `${activeResolutionTab}-${item.ref_id}-${index}`}
                    renderItem={({ item }) => (
                        <ActionCardComponent
                            itemImage={getImageUrl(item.ad_image)}
                            userAvatar={getImageUrl(item.actor_avatar)}
                            itemTitle={item.ad_title}
                            username={item.actor_name}
                            statusText={item.message}
                            stepNumber={item.stage}
                            actionText={'View Details'}
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
                            <Feather name="inbox" size={64} color="#CCC" />
                            <Text style={styles.emptyText}>{t(`No ${activeResolutionTab}s found`)}</Text>
                        </View>
                    }
                />
            )}

            {/* Footer Info */}
            <View style={styles.footer}>
                <Feather name="info" size={16} color="#505050" />
                <Text style={styles.footerText}>
                    More information on Deleted ads,{' '}
                    <Text style={styles.footerLink}>{t('click here')}</Text>
                </Text>
            </View>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => {
                    if (activeMainTab === 'support') {
                        navigation.navigate('CreateTicket');
                    } else {
                        if (activeResolutionTab === 'issue') {
                            navigation.navigate('CreateIssue');
                        } else if (activeResolutionTab === 'dispute') {
                            navigation.navigate('DisputeInformation');
                        } else {
                            navigation.navigate('CreateIssue');
                        }
                    }
                }}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={32} color="#FFF" />
            </TouchableOpacity>
            <SuggestionsFooter sourceRoute="SupportResolution" />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },

    mainTabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 2,
        borderBottomColor: '#E0E0E0',
    },
    mainTab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    mainTabActive: {
        borderBottomColor: '#000',
    },
    mainTabText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#303234',
    },
    mainTabTextActive: {
        color: '#000',
        fontWeight: '600',
    },
    subTabsContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        minHeight: 50,
        maxHeight: 50,
    },
    subTabsContent: {
        flexDirection: 'row',
        paddingHorizontal: 6,
        paddingVertical: 8,
    },
    subTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    subTabActive: {
        borderBottomColor: '#000',
    },
    subTabText: {
        fontSize: 14,
        color: '#303234',
    },
    subTabTextActive: {
        color: '#000',
        fontWeight: '600',
    },
    // Resolution 3-tab row
    resTabsRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    resTab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    resTabActive: {
        borderBottomColor: COLORS.primary,
    },
    resTabText: {
        fontSize: 14,
        color: '#888',
        fontWeight: '600',
    },
    resTabTextActive: {
        color: '#000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 16,
    },
    listItem: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        alignItems: 'center',
    },
    itemIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    itemDescription: {
        fontSize: 14,
        color: '#505050',
        lineHeight: 20,
    },
    itemTime: {
        fontSize: 12,
        color: '#303234',
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#303234',
        marginTop: 16,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F9F9F9',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    footerText: {
        fontSize: 14,
        color: '#505050',
        marginLeft: 8,
        flex: 1,
    },
    footerLink: {
        color: COLORS.primary,
        textDecorationLine: 'underline',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 80,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4169E1',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
});

export default SupportResolutionScreen;
