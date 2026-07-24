import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { getFullImageUrl } from '../../utils/imageUtils';

const ActionCenterScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { userCurrency } = useAuth();
  const [buyingTab, setBuyingTab] = useState('buying');
  const [loading, setLoading] = useState(false);
  const [buyerMessages, setBuyerMessages] = useState([]);
  const [sellerMessages, setSellerMessages] = useState([]);

  const currencySymbol = userCurrency === 'USD' ? '$' : userCurrency === 'EUR' ? '€' : '£';

  useEffect(() => {
    fetchMessages();
  }, [buyingTab]);

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

  const handleSubTab = (tab) => {
    setBuyingTab(tab);
  };

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

  const getUniqueItems = (messages) => {
    const unique = [];
    const seen = new Set();
    for (const item of messages) {
      if (!seen.has(item.advertisementId)) {
        seen.add(item.advertisementId);
        unique.push(item);
      }
    }
    return unique;
  };

  const uniqueBuyerItems = getUniqueItems(buyerMessages);
  const uniqueSellerItems = getUniqueItems(sellerMessages);
  const activeUniqueItems = buyingTab === 'buying' ? uniqueBuyerItems : uniqueSellerItems;

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

  // ─── Sub-tabs ──────────────────────────────────────────────────────────────
  const renderSubTabs = () => (
    <View style={styles.subTabBar}>
      {['buying', 'selling'].map((tab) => {
        const count = tab === 'buying' ? uniqueBuyerItems.length : uniqueSellerItems.length;
        const isActive = buyingTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            style={[styles.subTab, isActive && styles.subTabActive]}
            onPress={() => handleSubTab(tab)}
            activeOpacity={0.7}
          >
            <View style={styles.subTabInner}>
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
        </View>
        <Text style={styles.actionPrice}>{currencySymbol}{item.itemPrice || '0.00'}</Text>
        <View style={styles.actionStatusRow}>
          <View style={[styles.statusPill, getStatusColor(item.statusText)]}>
            <Text style={styles.statusPillText}>{item.statusText || 'Active'}</Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#ccc" />
    </TouchableOpacity>
  );

  const EmptyActions = () => (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name="checkmark-circle-outline" size={40} color="#ccc" />
      </View>
      <Text style={styles.emptyTitle}>All clear!</Text>
      <Text style={styles.emptySubtitle}>
        {buyingTab === 'buying'
          ? "Items you're buying that need action will appear here."
          : "Items you're selling that need action will appear here."}
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
        <Text style={styles.headerTitle}>Action Center</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Sub-tabs */}
      {renderSubTabs()}

      {/* Content */}
      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={activeUniqueItems}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderActionCard}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<EmptyActions />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },

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
  subTabActive: { borderBottomColor: COLORS.primary },
  subTabInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  subTabText: { fontSize: 14, fontWeight: '600', color: '#aaa' },
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
  countBadgeActive: { backgroundColor: COLORS.primary },
  countBadgeText: { fontSize: 11, fontWeight: '700', color: '#888' },
  countBadgeTextActive: { color: '#fff' },

  list: { paddingVertical: 8 },
  separator: { height: 1, backgroundColor: '#f5f5f5', marginLeft: 84 },
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

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
  actionContent: { flex: 1 },
  actionTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  actionTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', flex: 1, marginRight: 8 },
  actionStep: { fontSize: 12, color: '#aaa' },
  actionPrice: { fontSize: 16, fontWeight: '800', color: '#000', marginBottom: 6 },
  actionStatusRow: { flexDirection: 'row', alignItems: 'center' },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },

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
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#aaa', textAlign: 'center', lineHeight: 20 },
});

export default ActionCenterScreen;
