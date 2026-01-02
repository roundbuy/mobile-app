import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import disputeService from '../../services/disputeService';

const MySupportScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('tickets');
    const [tickets, setTickets] = useState([]);
    const [deletedAds, setDeletedAds] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);

            if (activeTab === 'tickets' || activeTab === 'all') {
                const ticketsResponse = await disputeService.getSupportTickets();
                setTickets(ticketsResponse.data || []);
            }

            if (activeTab === 'deleted_ads' || activeTab === 'all') {
                const deletedAdsResponse = await disputeService.getDeletedAds();
                setDeletedAds(deletedAdsResponse.data || []);
            }

            const statsResponse = await disputeService.getSupportStats();
            setStats(statsResponse.data || {});
        } catch (error) {
            console.error('Load data error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const getStatusColor = (status) => {
        const colors = {
            open: '#4169E1',
            pending: '#FFA500',
            resolved: '#32CD32',
            closed: '#999',
        };
        return colors[status] || '#999';
    };

    const renderTicketCard = (ticket) => (
        <TouchableOpacity
            key={ticket.id}
            style={styles.card}
            onPress={() => navigation.navigate('TicketDetail', { ticketId: ticket.id })}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.ticketNumber}>{ticket.ticket_number}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) }]}>
                    <Text style={styles.statusText}>{ticket.status?.toUpperCase()}</Text>
                </View>
            </View>
            <Text style={styles.ticketSubject}>{ticket.subject}</Text>
            <View style={styles.cardFooter}>
                <View style={styles.categoryBadge}>
                    <Ionicons name="pricetag" size={14} color="#666" />
                    <Text style={styles.categoryText}>{ticket.category}</Text>
                </View>
                <Text style={styles.dateText}>
                    {new Date(ticket.created_at).toLocaleDateString()}
                </Text>
            </View>
            {ticket.last_message && (
                <Text style={styles.lastMessage} numberOfLines={1}>
                    {ticket.last_message}
                </Text>
            )}
        </TouchableOpacity>
    );

    const renderDeletedAdCard = (ad) => (
        <TouchableOpacity
            key={ad.id}
            style={styles.card}
            onPress={() => navigation.navigate('DeletedAdDetail', { adId: ad.id })}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.adTitle}>{ad.title}</Text>
                {ad.appeal_status && (
                    <View style={[styles.statusBadge, { backgroundColor: '#FFA500' }]}>
                        <Text style={styles.statusText}>APPEAL</Text>
                    </View>
                )}
            </View>
            <Text style={styles.deletionReason}>
                Reason: {ad.deletion_reason || 'Not specified'}
            </Text>
            <View style={styles.cardFooter}>
                <Text style={styles.dateText}>
                    Deleted: {new Date(ad.deleted_at).toLocaleDateString()}
                </Text>
                {!ad.appeal_status && (
                    <TouchableOpacity
                        style={styles.appealButton}
                        onPress={() => navigation.navigate('CreateAppeal', { adId: ad.id })}
                    >
                        <Text style={styles.appealButtonText}>Appeal</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4169E1" />
                </View>
            );
        }

        if (activeTab === 'all') {
            return (
                <View>
                    {tickets.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Tickets ({tickets.length})</Text>
                            {tickets.slice(0, 3).map(renderTicketCard)}
                            {tickets.length > 3 && (
                                <TouchableOpacity
                                    style={styles.viewAllButton}
                                    onPress={() => setActiveTab('tickets')}
                                >
                                    <Text style={styles.viewAllText}>View All Tickets</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                    {deletedAds.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Deleted Ads ({deletedAds.length})</Text>
                            {deletedAds.slice(0, 3).map(renderDeletedAdCard)}
                            {deletedAds.length > 3 && (
                                <TouchableOpacity
                                    style={styles.viewAllButton}
                                    onPress={() => setActiveTab('deleted_ads')}
                                >
                                    <Text style={styles.viewAllText}>View All Deleted Ads</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                    {tickets.length === 0 && deletedAds.length === 0 && (
                        <View style={styles.emptyState}>
                            <Ionicons name="folder-open-outline" size={64} color="#CCC" />
                            <Text style={styles.emptyText}>No support items</Text>
                        </View>
                    )}
                </View>
            );
        }

        if (activeTab === 'tickets') {
            return (
                <View>
                    {tickets.map(renderTicketCard)}
                    {tickets.length === 0 && (
                        <View style={styles.emptyState}>
                            <Ionicons name="ticket-outline" size={64} color="#CCC" />
                            <Text style={styles.emptyText}>No tickets yet</Text>
                            <Text style={styles.emptySubtext}>Create a ticket to get support</Text>
                        </View>
                    )}
                </View>
            );
        }

        if (activeTab === 'deleted_ads') {
            return (
                <View>
                    {deletedAds.map(renderDeletedAdCard)}
                    {deletedAds.length === 0 && (
                        <View style={styles.emptyState}>
                            <Ionicons name="trash-outline" size={64} color="#CCC" />
                            <Text style={styles.emptyText}>No deleted ads</Text>
                        </View>
                    )}
                </View>
            );
        }

        if (activeTab === 'appeals') {
            const appeals = deletedAds.filter(ad => ad.appeal_status);
            return (
                <View>
                    {appeals.map(renderDeletedAdCard)}
                    {appeals.length === 0 && (
                        <View style={styles.emptyState}>
                            <Ionicons name="document-text-outline" size={64} color="#CCC" />
                            <Text style={styles.emptyText}>No appeals</Text>
                        </View>
                    )}
                </View>
            );
        }
    };

    return (
        <SafeScreenContainer>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back" size={28} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Support</Text>
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => navigation.navigate('CreateTicket')}
                    >
                        <Ionicons name="add-circle" size={28} color="#4169E1" />
                    </TouchableOpacity>
                </View>

                {/* Statistics */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{stats.total_tickets || 0}</Text>
                        <Text style={styles.statLabel}>Total Tickets</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{stats.open_tickets || 0}</Text>
                        <Text style={styles.statLabel}>Open</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{stats.deleted_ads || 0}</Text>
                        <Text style={styles.statLabel}>Deleted Ads</Text>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                        onPress={() => setActiveTab('all')}
                    >
                        <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
                            All
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'tickets' && styles.activeTab]}
                        onPress={() => setActiveTab('tickets')}
                    >
                        <Text style={[styles.tabText, activeTab === 'tickets' && styles.activeTabText]}>
                            Tickets
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'deleted_ads' && styles.activeTab]}
                        onPress={() => setActiveTab('deleted_ads')}
                    >
                        <Text style={[styles.tabText, activeTab === 'deleted_ads' && styles.activeTabText]}>
                            Deleted ads
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'appeals' && styles.activeTab]}
                        onPress={() => setActiveTab('appeals')}
                    >
                        <Text style={[styles.tabText, activeTab === 'appeals' && styles.activeTabText]}>
                            Appeals
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <ScrollView
                    style={styles.content}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {renderContent()}
                </ScrollView>
            </View>
        </SafeScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    createButton: {
        padding: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4169E1',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#4169E1',
    },
    tabText: {
        fontSize: 14,
        color: '#666',
    },
    activeTabText: {
        color: '#4169E1',
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    card: {
        backgroundColor: '#FFF',
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    ticketNumber: {
        fontSize: 14,
        fontWeight: '700',
        color: '#4169E1',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFF',
    },
    ticketSubject: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    categoryText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    dateText: {
        fontSize: 12,
        color: '#999',
    },
    lastMessage: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        fontStyle: 'italic',
    },
    adTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        flex: 1,
    },
    deletionReason: {
        fontSize: 14,
        color: '#DC143C',
        marginBottom: 8,
    },
    appealButton: {
        backgroundColor: '#4169E1',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    appealButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFF',
    },
    viewAllButton: {
        alignItems: 'center',
        paddingVertical: 12,
        marginHorizontal: 16,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4169E1',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#999',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#CCC',
        marginTop: 8,
    },
});

export default MySupportScreen;
