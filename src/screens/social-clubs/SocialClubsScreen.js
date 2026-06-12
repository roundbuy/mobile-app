import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { eventService } from '../../services';
import { COLORS } from '../../constants/theme';
import GlobalHeader from '../../components/GlobalHeader';

const MOCK_EVENTS = [
  {
    id: 1,
    title: 'Sneaker Head Bidding Room',
    heading: 'Featuring rare retro Jordans and Dunks',
    description: 'Join SoleSupply to bid on limited-run sneakers and street accessories. Livestream bidding is active!',
    thumbnail_url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=400&q=80',
    category_tag: 'Footwear',
    start_time: new Date().toISOString(),
    status: 'live',
    allow_bidding: 1,
    subscriber_count: 124,
    follower_count: 82,
    live_participant_count: 54,
    is_subscribed: false,
    is_followed: false,
  },
  {
    id: 2,
    title: 'Vintage & Streetwear Thrift Pop-up',
    heading: '90s streetwear and denim jackets',
    description: 'Thrifting live stream. We are showcasing hand-picked jackets, vintage band tees, and hats.',
    thumbnail_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80',
    category_tag: 'Apparel',
    start_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    status: 'upcoming',
    allow_bidding: 1,
    subscriber_count: 45,
    follower_count: 30,
    live_participant_count: 0,
    is_subscribed: true,
    is_followed: false,
  },
  {
    id: 3,
    title: 'Retro Denim & Accessories Auction',
    heading: 'Ended auction event',
    description: 'Thank you for participating! Check out our social club page for future weekly auctions.',
    thumbnail_url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=400&q=80',
    category_tag: 'Vintage',
    start_time: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    status: 'finished',
    allow_bidding: 0,
    subscriber_count: 95,
    follower_count: 60,
    live_participant_count: 0,
    is_subscribed: false,
    is_followed: true,
  }
];

const SocialClubsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'live', 'upcoming', 'ended'
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await eventService.getAllEvents();
      if (res?.success && res?.data?.events) {
        setEvents(res.data.events);
      } else {
        setEvents(MOCK_EVENTS);
      }
    } catch (e) {
      console.error('Error fetching events:', e);
      setEvents(MOCK_EVENTS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const handleSubscribeToggle = async (event) => {
    const id = event.id;
    if (actionLoading[id]) return;

    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      if (event.is_subscribed) {
        await eventService.unsubscribeEvent(id);
        setEvents(prev => prev.map(e => e.id === id ? { ...e, is_subscribed: false, subscriber_count: Math.max(0, e.subscriber_count - 1) } : e));
      } else {
        await eventService.subscribeEvent(id);
        setEvents(prev => prev.map(e => e.id === id ? { ...e, is_subscribed: true, subscriber_count: e.subscriber_count + 1 } : e));
      }
    } catch (err) {
      console.error('Toggle subscription error:', err);
      // Toggle locally for mock items
      const target = events.find(e => e.id === id);
      if (target) {
        const nextSub = !target.is_subscribed;
        setEvents(prev => prev.map(e => e.id === id ? {
          ...e,
          is_subscribed: nextSub,
          subscriber_count: nextSub ? e.subscriber_count + 1 : Math.max(0, e.subscriber_count - 1)
        } : e));
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleFollowToggle = async (event) => {
    const id = event.id;
    if (actionLoading[id]) return;

    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      if (event.is_followed) {
        await eventService.unfollowEvent(id);
        setEvents(prev => prev.map(e => e.id === id ? { ...e, is_followed: false, follower_count: Math.max(0, e.follower_count - 1) } : e));
      } else {
        await eventService.followEvent(id);
        setEvents(prev => prev.map(e => e.id === id ? { ...e, is_followed: true, follower_count: e.follower_count + 1 } : e));
      }
    } catch (err) {
      console.error('Toggle follow error:', err);
      // Toggle locally for mock items
      const target = events.find(e => e.id === id);
      if (target) {
        const nextFollow = !target.is_followed;
        setEvents(prev => prev.map(e => e.id === id ? {
          ...e,
          is_followed: nextFollow,
          follower_count: nextFollow ? e.follower_count + 1 : Math.max(0, e.follower_count - 1)
        } : e));
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleJoinRoom = async (event) => {
    try {
      await eventService.joinLiveRoom(event.id);
      navigation.navigate('EventRoom', { eventId: event.id, event });
    } catch (err) {
      console.warn('Failed API join, trying room directly for mock event:', err.message);
      navigation.navigate('EventRoom', { eventId: event.id, event });
    }
  };

  const getFilteredEvents = () => {
    if (activeTab === 'all') return events;
    if (activeTab === 'live') return events.filter(e => e.status === 'live');
    if (activeTab === 'upcoming') return events.filter(e => e.status === 'upcoming');
    if (activeTab === 'ended') return events.filter(e => e.status === 'finished');
    return events;
  };

  const formatTime = (timeStr) => {
    const d = new Date(timeStr);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const renderEventItem = ({ item }) => {
    const isLive = item.status === 'live';
    const isUpcoming = item.status === 'upcoming';
    const isFinished = item.status === 'finished';

    return (
      <View style={styles.eventCard}>
        {/* Thumbnail */}
        <View style={styles.thumbnailContainer}>
          <Image source={{ uri: item.thumbnail_url || 'https://placehold.co/400' }} style={styles.thumbnail} />
          <View style={styles.overlayBadgeRow}>
            {isLive && (
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
            {isUpcoming && (
              <View style={[styles.statusIndicatorBadge, { backgroundColor: '#FF9500' }]}>
                <Text style={styles.indicatorBadgeText}>UPCOMING</Text>
              </View>
            )}
            {isFinished && (
              <View style={[styles.statusIndicatorBadge, { backgroundColor: '#8E8E93' }]}>
                <Text style={styles.indicatorBadgeText}>ENDED</Text>
              </View>
            )}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category_tag || 'Club'}</Text>
            </View>
          </View>
        </View>

        {/* Info */}
        <View style={styles.eventDetails}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventHeading} numberOfLines={1}>{item.heading}</Text>
          <Text style={styles.eventDesc} numberOfLines={2}>{item.description}</Text>

          {/* Stats Bar */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={14} color="#808080" />
              <Text style={styles.statVal}>{item.subscriber_count} Subs</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={14} color="#808080" />
              <Text style={styles.statVal}>{item.follower_count} Follows</Text>
            </View>
            {isLive && (
              <View style={styles.statItem}>
                <Ionicons name="eye-outline" size={14} color="#E53935" />
                <Text style={[styles.statVal, { color: '#E53935', fontWeight: '700' }]}>
                  {item.live_participant_count} viewing
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.timeText}>
            <Ionicons name="calendar-outline" size={12} color="#606060" /> {formatTime(item.start_time)}
          </Text>

          {/* Actions Bar */}
          <View style={styles.actionsRow}>
            {!isFinished && (
              <>
                <TouchableOpacity
                  style={[styles.actionBtn, item.is_subscribed && styles.activeActionBtn]}
                  onPress={() => handleSubscribeToggle(item)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={item.is_subscribed ? "notifications" : "notifications-outline"}
                    size={16}
                    color={item.is_subscribed ? "#FFF" : "#303030"}
                  />
                  <Text style={[styles.actionBtnText, item.is_subscribed && styles.activeActionBtnText]}>
                    {item.is_subscribed ? 'Subscribed' : 'Subscribe'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, item.is_followed && styles.activeActionBtn]}
                  onPress={() => handleFollowToggle(item)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={item.is_followed ? "heart" : "heart-outline"}
                    size={16}
                    color={item.is_followed ? "#FFF" : "#303030"}
                  />
                  <Text style={[styles.actionBtnText, item.is_followed && styles.activeActionBtnText]}>
                    {item.is_followed ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {isLive && (
              <TouchableOpacity
                style={styles.joinBtn}
                onPress={() => handleJoinRoom(item)}
                activeOpacity={0.8}
              >
                <Text style={styles.joinBtnText}>Join Room</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFF" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeader title="Social Clubs" navigation={navigation} showBackButton />

      {/* Tabs list */}
      <View style={styles.tabBar}>
        {['all', 'live', 'upcoming', 'ended'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
              {tab === 'all' ? 'All' : (tab === 'live' ? 'Live Now' : (tab === 'upcoming' ? 'Upcoming' : 'Ended'))}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Fetching social clubs...</Text>
          </View>
        ) : (
          <FlatList
            data={getFilteredEvents()}
            renderItem={renderEventItem}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No events found in this category</Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: '#000000',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#606060',
  },
  activeTabButtonText: {
    color: '#000000',
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#606060',
    marginTop: 8,
  },
  listContent: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  thumbnailContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#303030',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlayBadgeRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  statusIndicatorBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  indicatorBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  categoryBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  eventDetails: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  eventHeading: {
    fontSize: 14,
    fontWeight: '500',
    color: '#505050',
    marginTop: 2,
  },
  eventDesc: {
    fontSize: 12,
    color: '#808080',
    marginTop: 6,
    lineHeight: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statVal: {
    fontSize: 11,
    color: '#606060',
    fontWeight: '500',
    marginLeft: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#404040',
    fontWeight: '600',
    marginTop: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'space-between',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D0D0D8',
    backgroundColor: '#FCFCFD',
    marginRight: 8,
    flex: 1,
  },
  activeActionBtn: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#303030',
    marginLeft: 6,
  },
  activeActionBtnText: {
    color: '#FFF',
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
    flex: 1.2,
  },
  joinBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 14,
    color: '#808080',
    marginTop: 8,
  },
});

export default SocialClubsScreen;
