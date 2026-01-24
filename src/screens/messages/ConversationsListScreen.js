import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { useTranslation } from '../../context/TranslationContext';
import { messagingService } from '../../services';
import { getFullImageUrl } from '../../utils/imageUtils';
import { IMAGES } from '../../assets/images';
import { COLORS } from '../../constants/theme';

const ConversationsListScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'buying', 'selling'

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        try {
            setLoading(true);
            const response = await messagingService.getConversations();

            if (response.data && response.data.success) {
                setConversations(response.data.conversations || []);
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadConversations();
        setRefreshing(false);
    };

    const handleConversationPress = (conversation) => {
        // Navigate to ProductChatScreen with the conversation data
        navigation.navigate('ProductChat', {
            advertisement: {
                id: conversation.advertisement_id,
                title: conversation.advertisement_title,
                price: conversation.advertisement_price,
                images: conversation.advertisement_images
                    ? JSON.parse(conversation.advertisement_images)
                    : [],
            },
            conversationId: conversation.id,
        });
    };

    const getFilteredConversations = () => {
        if (activeTab === 'buying') {
            return conversations.filter(conv => conv.buyer_id === user?.id);
        } else if (activeTab === 'selling') {
            return conversations.filter(conv => conv.seller_id === user?.id);
        }
        return conversations;
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';

        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
    };

    const renderConversationItem = ({ item }) => {
        const isBuyer = item.buyer_id === user?.id;
        const otherPartyName = isBuyer ? item.seller_name : item.buyer_name;
        const otherPartyAvatar = isBuyer ? item.seller_avatar : item.buyer_avatar;
        const hasUnread = item.last_message_sender_id !== user?.id && !item.is_read;

        // Parse images
        let productImage = IMAGES.chair1;
        try {
            const images = item.advertisement_images
                ? JSON.parse(item.advertisement_images)
                : [];
            if (images.length > 0) {
                productImage = getFullImageUrl(images[0]);
            }
        } catch (e) {
            console.error('Error parsing images:', e);
        }

        return (
            <TouchableOpacity
                style={styles.conversationItem}
                onPress={() => handleConversationPress(item)}
                activeOpacity={0.7}
            >
                {/* Product Image */}
                <Image
                    source={productImage}
                    style={styles.productImage}
                    resizeMode="cover"
                />

                {/* Conversation Details */}
                <View style={styles.conversationContent}>
                    <View style={styles.conversationHeader}>
                        <Text style={styles.productTitle} numberOfLines={1}>
                            {item.advertisement_title || 'Product'}
                        </Text>
                        <Text style={styles.timestamp}>
                            {formatTimestamp(item.last_message_at)}
                        </Text>
                    </View>

                    {/* User info with avatar */}
                    <View style={styles.userInfoRow}>
                        <View style={styles.userAvatar}>
                            {otherPartyAvatar ? (
                                <Image
                                    source={{ uri: getFullImageUrl(otherPartyAvatar) }}
                                    style={styles.userAvatarImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <Ionicons name="person" size={16} color="#999" />
                            )}
                        </View>
                        <Text style={styles.otherPartyName} numberOfLines={1}>
                            {isBuyer ? 'Seller' : 'Buyer'}: {otherPartyName || 'User'}
                        </Text>
                    </View>

                    {item.last_message && (
                        <Text
                            style={[
                                styles.lastMessage,
                                hasUnread && styles.unreadMessage
                            ]}
                            numberOfLines={1}
                        >
                            {item.last_message}
                        </Text>
                    )}

                    <Text style={styles.productPrice}>
                        ₹{item.advertisement_price || '0'}
                    </Text>
                </View>

                {/* Unread Indicator */}
                {hasUnread && <View style={styles.unreadDot} />}

                {/* Chevron */}
                <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>{t('No conversations yet')}</Text>
            <Text style={styles.emptySubtext}>
                {activeTab === 'buying'
                    ? 'Start chatting with sellers about products you\'re interested in'
                    : activeTab === 'selling'
                        ? 'Buyers will appear here when they message you about your products'
                        : 'Your conversations will appear here'}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Messages')}</Text>
                <View style={styles.headerRight} />
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                    onPress={() => setActiveTab('all')}
                >
                    <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>{t('All')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'buying' && styles.activeTab]}
                    onPress={() => setActiveTab('buying')}
                >
                    <Text style={[styles.tabText, activeTab === 'buying' && styles.activeTabText]}>{t('Buying')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'selling' && styles.activeTab]}
                    onPress={() => setActiveTab('selling')}
                >
                    <Text style={[styles.tabText, activeTab === 'selling' && styles.activeTabText]}>{t('Selling')}</Text>
                </TouchableOpacity>
            </View>

            {/* Conversations List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={getFilteredConversations()}
                    renderItem={renderConversationItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                    }
                    ListEmptyComponent={renderEmptyState}
                    showsVerticalScrollIndicator={false}
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
        fontWeight: '700',
        color: '#000',
    },
    headerRight: {
        width: 36,
    },
    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: '#fff',
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
        fontSize: 15,
        fontWeight: '500',
        color: '#666',
    },
    activeTabText: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingVertical: 8,
    },
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    conversationContent: {
        flex: 1,
    },
    conversationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    productTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
        flex: 1,
        marginRight: 8,
    },
    timestamp: {
        fontSize: 12,
        color: '#999',
    },
    userInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    userAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    userAvatarImage: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    otherPartyName: {
        fontSize: 13,
        color: '#666',
        flex: 1,
    },
    lastMessage: {
        fontSize: 14,
        color: '#999',
        marginBottom: 4,
    },
    unreadMessage: {
        color: '#000',
        fontWeight: '600',
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
        marginRight: 8,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
        paddingHorizontal: 32,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
        textAlign: 'center',
    },
});

export default ConversationsListScreen;
