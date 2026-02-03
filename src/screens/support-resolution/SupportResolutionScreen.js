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
    Platform,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';
import supportService from '../../services/supportService';
import disputeService from '../../services/disputeService';
import claimService from '../../services/claimService';
import GlobalHeader from '../../components/GlobalHeader';
import SuggestionsFooter from '../../components/SuggestionsFooter';

const SupportResolutionScreen = ({ navigation }) => {
    const { t } = useTranslation();
    // Main tab state (My support / Resolution center)
    const [activeMainTab, setActiveMainTab] = useState('support');

    // Support sub-tabs state
    const [activeSupportTab, setActiveSupportTab] = useState('all');

    // Resolution center sub-tabs state
    const [activeResolutionTab, setActiveResolutionTab] = useState('all');

    const [loading, setLoading] = useState(true);
    const [supportData, setSupportData] = useState([]);
    const [resolutionData, setResolutionData] = useState([]);

    useEffect(() => {
        loadData();
    }, [activeMainTab, activeSupportTab, activeResolutionTab]);

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

    const loadResolutionData = async () => {
        try {
            let response;
            switch (activeResolutionTab) {
                case 'exchanges':
                    response = await disputeService.getExchanges();
                    break;
                case 'issues':
                    response = await disputeService.getIssues();
                    break;
                case 'disputes':
                    response = await disputeService.getDisputes();
                    break;
                case 'claims':
                    response = await claimService.getClaims();
                    break;
                case 'ended':
                    response = await disputeService.getEndedCases();
                    break;
                default:
                    response = await disputeService.getAllResolution();
            }
            setResolutionData(response.data || []);
        } catch (error) {
            console.error('Error loading resolution data:', error);
            setResolutionData([]);
        }
    };

    const renderSupportItem = ({ item }) => (
        <TouchableOpacity
            style={styles.listItem}
            onPress={() => {
                if (activeSupportTab === 'deleted') {
                    // Navigate to deleted ads screen with the ad data
                    navigation.navigate('DeletedAds');
                } else if (activeSupportTab === 'appeals') {
                    // Navigate to appeal status screen
                    navigation.navigate('AppealStatus', { appealId: item.id });
                } else if (activeSupportTab === 'tickets') {
                    // Navigate to ticket detail screen
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

    const renderResolutionItem = ({ item }) => (
        <TouchableOpacity
            style={styles.listItem}
            onPress={() => {
                // Navigate based on active tab
                if (activeResolutionTab === 'disputes') {
                    navigation.navigate('DisputeDetail', { disputeId: item.id });
                } else if (activeResolutionTab === 'issues') {
                    navigation.navigate('IssueDetail', { issueId: item.id });
                } else if (activeResolutionTab === 'claims') {
                    navigation.navigate('ClaimDetail', { claimId: item.id });
                } else if (activeResolutionTab === 'exchanges') {
                    navigation.navigate('ExchangeDetail', { exchangeId: item.id });
                } else {
                    // For 'all' and 'ended', use item type if available
                    const itemType = item.type || 'issue';
                    if (itemType === 'claim') {
                        navigation.navigate('ClaimDetail', { claimId: item.id });
                    } else if (itemType === 'dispute') {
                        navigation.navigate('DisputeDetail', { disputeId: item.id });
                    } else if (itemType === 'exchange') {
                        navigation.navigate('ExchangeDetail', { exchangeId: item.id });
                    } else {
                        navigation.navigate('IssueDetail', { issueId: item.id });
                    }
                }
            }}
        >
            <View style={styles.itemIcon}>
                <Feather
                    name={activeResolutionTab === 'exchanges' ? 'repeat' : 'alert-circle'}
                    size={24}
                    color="#4169E1"
                />
            </View>
            <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>
                    {item.claim_number ? item.claim_number :
                        item.dispute_number ? item.dispute_number :
                            item.issue_number ? item.issue_number :
                                (typeof item.title === 'string' ? item.title :
                                    typeof item.title === 'object' && item.title?.label ? item.title.label : 'Resolution Item')}
                </Text>
                <Text style={styles.itemDescription} numberOfLines={2}>
                    {item.problem_description || item.issue_description ||
                        (typeof item.description === 'string' ? item.description :
                            typeof item.description === 'object' && item.description?.label ? item.description.label : 'No description')}
                </Text>
            </View>
            <Text style={styles.itemTime}>
                {typeof item.time === 'string' ? item.time :
                    typeof item.time === 'object' && item.time?.label ? item.time.label : ''}
            </Text>
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

            {/* Sub Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.subTabsContainer}
                contentContainerStyle={styles.subTabsContent}
            >
                {activeMainTab === 'support' ? (
                    <>
                        <TouchableOpacity
                            key="support-all"
                            style={[
                                styles.subTab,
                                activeSupportTab === 'all' && styles.subTabActive,
                            ]}
                            onPress={() => setActiveSupportTab('all')}
                        >
                            <Text
                                style={[
                                    styles.subTabText,
                                    activeSupportTab === 'all' && styles.subTabTextActive,
                                ]}
                            >{t('All')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            key="support-deleted"
                            style={[
                                styles.subTab,
                                activeSupportTab === 'deleted' && styles.subTabActive,
                            ]}
                            onPress={() => setActiveSupportTab('deleted')}
                        >
                            <Text
                                style={[
                                    styles.subTabText,
                                    activeSupportTab === 'deleted' && styles.subTabTextActive,
                                ]}
                            >{t('Deleted ads')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            key="support-appeals"
                            style={[
                                styles.subTab,
                                activeSupportTab === 'appeals' && styles.subTabActive,
                            ]}
                            onPress={() => setActiveSupportTab('appeals')}
                        >
                            <Text
                                style={[
                                    styles.subTabText,
                                    activeSupportTab === 'appeals' && styles.subTabTextActive,
                                ]}
                            >{t('Ads appeals')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            key="support-tickets"
                            style={[
                                styles.subTab,
                                activeSupportTab === 'tickets' && styles.subTabActive,
                            ]}
                            onPress={() => setActiveSupportTab('tickets')}
                        >
                            <Text
                                style={[
                                    styles.subTabText,
                                    activeSupportTab === 'tickets' && styles.subTabTextActive,
                                ]}
                            >{t('Tickets')}</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <TouchableOpacity
                            key="resolution-all"
                            style={[
                                styles.subTab,
                                activeResolutionTab === 'all' && styles.subTabActive,
                            ]}
                            onPress={() => setActiveResolutionTab('all')}
                        >
                            <Text
                                style={[
                                    styles.subTabText,
                                    activeResolutionTab === 'all' && styles.subTabTextActive,
                                ]}
                            >{t('All')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            key="resolution-exchanges"
                            style={[
                                styles.subTab,
                                activeResolutionTab === 'exchanges' && styles.subTabActive,
                            ]}
                            onPress={() => setActiveResolutionTab('exchanges')}
                        >
                            <Text
                                style={[
                                    styles.subTabText,
                                    activeResolutionTab === 'exchanges' && styles.subTabTextActive,
                                ]}
                            >{t('Exchanges')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            key="resolution-issues"
                            style={[
                                styles.subTab,
                                activeResolutionTab === 'issues' && styles.subTabActive,
                            ]}
                            onPress={() => setActiveResolutionTab('issues')}
                        >
                            <Text
                                style={[
                                    styles.subTabText,
                                    activeResolutionTab === 'issues' && styles.subTabTextActive,
                                ]}
                            >{t('Issues')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            key="resolution-disputes"
                            style={[
                                styles.subTab,
                                activeResolutionTab === 'disputes' && styles.subTabActive,
                            ]}
                            onPress={() => setActiveResolutionTab('disputes')}
                        >
                            <Text
                                style={[
                                    styles.subTabText,
                                    activeResolutionTab === 'disputes' && styles.subTabTextActive,
                                ]}
                            >{t('Disputes')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            key="resolution-claims"
                            style={[
                                styles.subTab,
                                activeResolutionTab === 'claims' && styles.subTabActive,
                            ]}
                            onPress={() => setActiveResolutionTab('claims')}
                        >
                            <Text
                                style={[
                                    styles.subTabText,
                                    activeResolutionTab === 'claims' && styles.subTabTextActive,
                                ]}
                            >{t('Claims')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            key="resolution-ended"
                            style={[
                                styles.subTab,
                                activeResolutionTab === 'ended' && styles.subTabActive,
                            ]}
                            onPress={() => setActiveResolutionTab('ended')}
                        >
                            <Text
                                style={[
                                    styles.subTabText,
                                    activeResolutionTab === 'ended' && styles.subTabTextActive,
                                ]}
                            >{t('Ended')}</Text>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>

            {/* Content List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={activeMainTab === 'support' ? supportData : resolutionData}
                    renderItem={
                        activeMainTab === 'support' ? renderSupportItem : renderResolutionItem
                    }
                    keyExtractor={(item, index) => {
                        if (item.claim_number) return `claim-${item.claim_number}`;
                        if (item.dispute_number) return `dispute-${item.dispute_number}`;
                        if (item.issue_number) return `issue-${item.issue_number}`;
                        if (item.id) return `item-${item.id}-${index}`;
                        return `item-${index}`;
                    }}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Feather name="inbox" size={64} color="#CCC" />
                            <Text style={styles.emptyText}>{t('No items found')}</Text>
                        </View>
                    }
                />
            )}

            {/* Footer Info */}
            <View style={styles.footer}>
                <Feather name="info" size={16} color="#666" />
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
                        // Navigate to Create Ticket
                        navigation.navigate('CreateTicket');
                    } else {
                        // Resolution center - show options for Issue or Dispute
                        if (activeResolutionTab === 'issues' || activeResolutionTab === 'all') {
                            navigation.navigate('CreateIssue');
                        } else if (activeResolutionTab === 'disputes') {
                            navigation.navigate('DisputeInformation');
                        } else {
                            // Default to create issue
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
        color: '#999',
    },
    mainTabTextActive: {
        color: '#000',
        fontWeight: '600',
    },
    subTabsContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        maxHeight: 50,
    },
    subTabsContent: {
        paddingHorizontal: 16,
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
        color: '#999',
    },
    subTabTextActive: {
        color: '#000',
        fontWeight: '600',
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
        color: '#666',
        lineHeight: 20,
    },
    itemTime: {
        fontSize: 12,
        color: '#999',
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
        color: '#999',
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
        color: '#666',
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
