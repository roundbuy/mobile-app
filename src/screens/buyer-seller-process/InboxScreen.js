import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';
import { useAuth } from '../../context/AuthContext';
import ActionCardComponent from './ActionCardComponent';
import api from '../../services/api';
import { getFullImageUrl } from '../../utils/imageUtils';

const BUYING_FILTERS  = ['All', 'Active', 'Offers', 'Bought', 'Scheduled', 'Picked up', 'Enquiry', 'Finished', 'Unread', 'Archived'];
const SELLING_FILTERS = ['All', 'Active', 'Offers', 'Sold',   'Scheduled', 'Picked up', 'Enquiry', 'Finished', 'Unread', 'Archived'];

const InboxScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { userCurrency } = useAuth();
  const initialTab = route?.params?.initialTab || 'inbox';

  const [mainTab,     setMainTab]     = useState(initialTab);
  const [buyingTab,   setBuyingTab]   = useState('buying');
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading,     setLoading]     = useState(false);
  const [buyerMessages,  setBuyerMessages]  = useState([]);
  const [sellerMessages, setSellerMessages] = useState([]);

  const currencySymbol = userCurrency === 'USD' ? '$' : userCurrency === 'EUR' ? '€' : '£';

  useEffect(() => { fetchMessages(); }, [buyingTab]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/buyer-seller/action-center?type=${buyingTab}`);
      if (res.data?.success) {
        buyingTab === 'buying'
          ? setBuyerMessages(res.data.data)
          : setSellerMessages(res.data.data);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const handleMainTab = (tab) => { setMainTab(tab); setActiveFilter('All'); };
  const handleSubTab  = (tab) => { setBuyingTab(tab); setActiveFilter('All'); };

  const handleCardPress = (item) => navigation.navigate('SingleItemActionScreen', {
    conversationId: item.conversationId,
    advertisementId: item.advertisementId,
    itemTitle: item.itemTitle,
    itemPrice: item.itemPrice,
    itemImage: item.itemImage,
    otherUserName: item.username,
    type: buyingTab,
  });

  const handleActionPress = (item) => navigation.navigate('SingleItemActionScreen', {
    conversationId: item.conversationId,
    advertisementId: item.advertisementId,
    itemTitle: item.itemTitle,
    itemPrice: item.itemPrice,
    itemImage: item.itemImage,
    otherUserName: item.username,
    type: buyingTab,
  });

  const resolveActionText = (text) => {
    let out = (text || '').replace('Action: ', '');
    if (out === 'Provide item info!')   out = 'Answer buyer enquiry';
    if (out === 'Make a new Offer!')    out = 'Make a buyer offer';
    if (out === 'See Offer!')           out = 'Review incoming offer';
    if (out === 'Pay to confirm Deal!') out = 'Purchase item';
    return out;
  };

  const allMessages     = buyingTab === 'buying' ? buyerMessages : sellerMessages;
  const currentFilters  = buyingTab === 'buying' ? BUYING_FILTERS : SELLING_FILTERS;
  const filteredMessages = allMessages.filter(msg =>
    activeFilter === 'All' || msg.filterCategories?.includes(activeFilter)
  );

  // ─── Reusable sub-tabs + filter row ───────────────────────────────────────
  const renderSubTabs = () => (
    <View style={styles.subTabBar}>
      {['buying', 'selling'].map((tab) => {
        const count   = (tab === 'buying' ? buyerMessages : sellerMessages).length;
        const isActive = buyingTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            style={[styles.subTab, isActive && styles.subTabActive]}
            onPress={() => handleSubTab(tab)}
            activeOpacity={0.7}
          >
            <View style={styles.subTabInner}>
              {/* unread dot — show when there are messages and NOT the active sub-tab */}
              {count > 0 && !isActive && <View style={styles.unreadDot} />}
              <Text style={[styles.subTabText, isActive && styles.subTabTextActive]}>
                {tab === 'buying' ? 'Buying' : 'Selling'}
              </Text>
              <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                <Text style={[styles.countBadgeText, isActive && styles.countBadgeTextActive]}>
                  {count}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderFilterChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterRow}
      style={styles.filterScroll}
    >
      {currentFilters.map((f) => (
        <TouchableOpacity
          key={f}
          style={[styles.chip, activeFilter === f && styles.chipActive]}
          onPress={() => setActiveFilter(f)}
        >
          <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // ─── Inbox message card ────────────────────────────────────────────────────
  const renderInboxCard = ({ item }) => (
    <TouchableOpacity style={styles.msgCard} onPress={() => handleCardPress(item)} activeOpacity={0.8}>
      {/* Item thumbnail */}
      <Image
        source={item.itemImage ? { uri: getFullImageUrl(item.itemImage) } : { uri: 'https://via.placeholder.com/100' }}
        style={styles.msgThumb}
        resizeMode="cover"
      />

      {/* User avatar overlapping thumb */}
      {item.userAvatar ? (
        <Image source={{ uri: getFullImageUrl(item.userAvatar) }} style={styles.msgAvatar} />
      ) : (
        <View style={[styles.msgAvatar, styles.msgAvatarFallback]}>
          <Ionicons name="person" size={12} color="#fff" />
        </View>
      )}

      {/* Content */}
      <View style={styles.msgContent}>
        <View style={styles.msgTopRow}>
          <Text style={styles.msgTitle} numberOfLines={1}>{item.itemTitle || 'Item'}</Text>
          <Text style={styles.msgTime}>{item.timestamp || ''}</Text>
        </View>
        <Text style={styles.msgUser} numberOfLines={1}>@{item.username}</Text>
        <View style={styles.msgBottomRow}>
          <View style={[styles.statusPill, getStatusColor(item.statusText)]}>
            <Text style={styles.statusPillText}>{item.statusText || 'Active'}</Text>
          </View>
          {item.actionText ? (
            <Text style={styles.msgAction} numberOfLines={1}>{item.actionText}</Text>
          ) : null}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#ccc" style={styles.msgChevron} />
    </TouchableOpacity>
  );

  // ─── Action card ───────────────────────────────────────────────────────────
  const renderActionCard = ({ item }) => (
    <TouchableOpacity style={styles.actionCard} onPress={() => handleActionPress(item)} activeOpacity={0.8}>
      <Image
        source={item.itemImage ? { uri: getFullImageUrl(item.itemImage) } : { uri: 'https://via.placeholder.com/100' }}
        style={styles.actionThumb}
        resizeMode="cover"
      />
      <View style={styles.actionContent}>
        <View style={styles.actionTopRow}>
          <Text style={styles.actionTitle} numberOfLines={1}>{item.itemTitle || 'Item'}</Text>
          <Text style={styles.actionStep}>{item.stepNumber}</Text>
        </View>
        <Text style={styles.actionPrice}>{currencySymbol}{item.itemPrice || '0.00'}</Text>
        <View style={styles.actionStatusRow}>
          <Ionicons name="flash" size={13} color={COLORS.primary} />
          <Text style={styles.actionStatusText} numberOfLines={2}>
            {resolveActionText(item.actionText)}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#ccc" />
    </TouchableOpacity>
  );

  // ─── Empty states ──────────────────────────────────────────────────────────
  const EmptyInbox = () => (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name="mail-open-outline" size={40} color="#ccc" />
      </View>
      <Text style={styles.emptyTitle}>No messages yet</Text>
      <Text style={styles.emptySubtitle}>
        {buyingTab === 'buying'
          ? 'Messages from sellers will appear here when you make an enquiry or offer.'
          : 'Messages from buyers will appear here when someone is interested in your listings.'}
      </Text>
    </View>
  );

  const EmptyActions = () => (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name="checkmark-circle-outline" size={40} color="#ccc" />
      </View>
      <Text style={styles.emptyTitle}>All clear!</Text>
      <Text style={styles.emptySubtitle}>
        {buyingTab === 'buying'
          ? 'Items you\'re buying that need action will appear here.'
          : 'Items you\'re selling that need action will appear here.'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inbox</Text>
        <TouchableOpacity style={styles.composeBtn} onPress={() => {}}>
          <Ionicons name="create-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Sub-tabs */}
      {renderSubTabs()}

      {/* Filter chips */}
      {renderFilterChips()}

      {/* Content */}
      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredMessages}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderInboxCard}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<EmptyInbox />}
        />
      )}
    </SafeAreaView>
  );
};

// Helper: status pill colour
const getStatusColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'active':    return { backgroundColor: '#e8f5e9' };
    case 'sold':
    case 'bought':    return { backgroundColor: '#e3f2fd' };
    case 'offers':    return { backgroundColor: '#fff3e0' };
    case 'scheduled': return { backgroundColor: '#f3e5f5' };
    default:          return { backgroundColor: '#f5f5f5' };
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn:     { padding: 4 },
  composeBtn:  { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },

  // ── Main tabs ───────────────────────────────────────────────────────────────
  mainTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mainTab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  mainTabActive:     { borderBottomColor: COLORS.primary },
  mainTabText:       { fontSize: 15, fontWeight: '600', color: '#aaa' },
  mainTabTextActive: { color: '#000' },

  // ── Sub-tabs ────────────────────────────────────────────────────────────────
  subTabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  subTab: {
    flex: 1,
    paddingBottom: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subTabActive:  { borderBottomColor: COLORS.primary },
  subTabInner:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  subTabText:    { fontSize: 14, fontWeight: '600', color: '#aaa' },
  subTabTextActive: { color: '#000' },
  unreadDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  countBadge: {
    backgroundColor: '#eee',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: 'center',
  },
  countBadgeActive:     { backgroundColor: COLORS.primary },
  countBadgeText:       { fontSize: 11, fontWeight: '700', color: '#888' },
  countBadgeTextActive: { color: '#fff' },

  // ── Filter chips ────────────────────────────────────────────────────────────
  filterScroll: { maxHeight: 52 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  chipActive:     { backgroundColor: COLORS.primary },
  chipText:       { fontSize: 13, fontWeight: '500', color: '#555' },
  chipTextActive: { color: '#fff', fontWeight: '600' },

  // ── List ────────────────────────────────────────────────────────────────────
  list:      { paddingVertical: 8 },
  separator: { height: 1, backgroundColor: '#f5f5f5', marginLeft: 84 },
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // ── Inbox message card ───────────────────────────────────────────────────────
  msgCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  msgThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  msgAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    position: 'absolute',
    left: 46,
    top: 44,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#ddd',
  },
  msgAvatarFallback: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgContent:  { flex: 1, marginLeft: 14, marginRight: 8 },
  msgTopRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  msgTitle:    { fontSize: 14, fontWeight: '700', color: '#1a1a1a', flex: 1, marginRight: 8 },
  msgTime:     { fontSize: 11, color: '#aaa' },
  msgUser:     { fontSize: 12, color: '#888', marginBottom: 6 },
  msgBottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusPill:  {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusPillText: { fontSize: 11, fontWeight: '600', color: '#333' },
  msgAction:   { fontSize: 12, color: '#888', flex: 1 },
  msgChevron:  { marginLeft: 4 },

  // ── Action card ──────────────────────────────────────────────────────────────
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  actionThumb: {
    width: 68,
    height: 68,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    flexShrink: 0,
  },
  actionContent:  { flex: 1 },
  actionTopRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  actionTitle:    { fontSize: 14, fontWeight: '700', color: '#1a1a1a', flex: 1, marginRight: 8 },
  actionStep:     { fontSize: 12, color: '#aaa' },
  actionPrice:    { fontSize: 16, fontWeight: '800', color: '#000', marginBottom: 6 },
  actionStatusRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 5 },
  actionStatusText: { fontSize: 13, fontWeight: '600', color: COLORS.primary, flex: 1, lineHeight: 18 },

  // ── Empty states ─────────────────────────────────────────────────────────────
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle:    { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#aaa', textAlign: 'center', lineHeight: 20 },
});

export default InboxScreen;
