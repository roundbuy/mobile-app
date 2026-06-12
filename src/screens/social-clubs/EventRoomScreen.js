import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { eventService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/theme';
import GlobalHeader from '../../components/GlobalHeader';

const { width } = Dimensions.get('window');

// Premium mocks in case API has no active items/chats
const MOCK_CHAT_MESSAGES = [
  { id: 1, full_name: 'Alex Johnson', message: 'Wow, those Jordans look clean!', is_system: 0, created_at: new Date(Date.now() - 60000).toISOString() },
  { id: 2, full_name: 'System', message: 'Sarah Miller placed a bid of ₹8,000.00', is_system: 1, created_at: new Date(Date.now() - 40000).toISOString() },
  { id: 3, full_name: 'David Ward', message: 'Is it size 9 or 10?', is_system: 0, created_at: new Date(Date.now() - 20000).toISOString() }
];

const MOCK_ITEMS = [
  {
    id: 99,
    title: 'Air Jordan 1 Retro High OG Chicago',
    description: 'Condition 9/10, original box included. Iconic Chicago colorway.',
    starting_price: 6500.00,
    current_highest_bid: 8000.00,
    current_highest_bidder_id: 2,
    images: '["https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=400&q=80"]',
    uploaded_by: 12, // Seller user ID
    status: 'active',
  }
];

const MOCK_BIDS = [
  {
    id: 501,
    bid_amount: 8000.00,
    bidder_name: 'Sarah Miller',
    item_title: 'Air Jordan 1 Retro High OG Chicago',
    item_status: 'active',
    item_owner_id: 12,
    item_id: 99,
    is_winning_bid: 1,
    created_at: new Date(Date.now() - 40000).toISOString(),
  },
  {
    id: 502,
    bid_amount: 7000.00,
    bidder_name: 'Alex Johnson',
    item_title: 'Air Jordan 1 Retro High OG Chicago',
    item_status: 'active',
    item_owner_id: 12,
    item_id: 99,
    is_winning_bid: 0,
    created_at: new Date(Date.now() - 80000).toISOString(),
  }
];

const EventRoomScreen = ({ route, navigation }) => {
  const { eventId, event } = route.params || {};
  const { user } = useAuth();

  // Tab State
  const [activePanel, setActivePanel] = useState('chat'); // 'chat' or 'bidding'

  // Data States
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState(event || {});
  const [chatMessages, setChatMessages] = useState([]);
  const [items, setItems] = useState([]);
  const [bids, setBids] = useState([]);

  // Inputs
  const [chatText, setChatText] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const chatListRef = useRef(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    fetchInitialRoomState();

    // Start 3-second polling to simulate real-time room streaming updates
    pollingRef.current = setInterval(() => {
      pollRoomUpdates();
    }, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [eventId]);

  const fetchInitialRoomState = async () => {
    try {
      setLoading(true);
      const res = await eventService.getRoomState(eventId);
      if (res?.success && res?.data) {
        setEventData(res.data.event);
        setItems(res.data.items || []);
      } else {
        setItems(MOCK_ITEMS);
      }

      await pollRoomUpdates();
    } catch (e) {
      console.error('Error fetching initial room state:', e);
      setItems(MOCK_ITEMS);
      setChatMessages(MOCK_CHAT_MESSAGES);
      setBids(MOCK_BIDS);
    } finally {
      setLoading(false);
    }
  };

  const pollRoomUpdates = async () => {
    try {
      // 1. Get chat messages
      const chatRes = await eventService.getChat(eventId);
      if (chatRes?.success && chatRes?.data?.messages) {
        setChatMessages(chatRes.data.messages);
      } else if (chatMessages.length === 0) {
        setChatMessages(MOCK_CHAT_MESSAGES);
      }

      // 2. Get room bids
      const bidsRes = await eventService.getRoomBids(eventId);
      if (bidsRes?.success && bidsRes?.data?.bids) {
        setBids(bidsRes.data.bids);
      } else if (bids.length === 0) {
        setBids(MOCK_BIDS);
      }

      // 3. Refresh items to capture updated bids
      const itemsRes = await eventService.getItems(eventId);
      if (itemsRes?.success && itemsRes?.data?.items) {
        setItems(itemsRes.data.items);
      }
    } catch (err) {
      console.log('Error polling updates:', err.message);
    }
  };

  const handleSendChat = async () => {
    if (!chatText.trim()) return;

    try {
      const text = chatText;
      setChatText('');
      
      const res = await eventService.sendChat(eventId, text);
      if (res?.success) {
        pollRoomUpdates();
      }
    } catch (e) {
      console.error('Send chat error:', e);
      // Append locally for mock usage
      const localMsg = {
        id: Date.now(),
        full_name: user?.full_name || 'Me',
        message: chatText,
        is_system: 0,
        user_id: user?.id,
        created_at: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, localMsg]);
      setChatText('');
    }
  };

  const handlePlaceBid = async (item) => {
    if (!bidAmount.trim()) {
      Alert.alert('Invalid Amount', 'Please type a bid amount.');
      return;
    }

    const amt = parseFloat(bidAmount);
    const highestBid = parseFloat(item.current_highest_bid || item.starting_price || 0);

    if (amt <= highestBid) {
      Alert.alert('Invalid Bid', `Your bid must be higher than current highest bid (₹${highestBid.toFixed(2)})`);
      return;
    }

    try {
      setSubmitLoading(true);
      const res = await eventService.placeBid(eventId, item.id, amt);
      if (res?.success) {
        Alert.alert('Bid Placed', `Successfully bid ₹${amt.toFixed(2)} on ${item.title}`);
        setBidAmount('');
        pollRoomUpdates();
      } else {
        Alert.alert('Failed', res?.message || 'Failed to place bid.');
      }
    } catch (err) {
      console.error('Place bid error:', err);
      // Fallback local update
      setBids(prev => [
        {
          id: Date.now(),
          bid_amount: amt,
          bidder_name: user?.full_name || 'Me',
          item_title: item.title,
          item_status: 'active',
          item_owner_id: item.uploaded_by,
          item_id: item.id,
          is_winning_bid: 1,
          created_at: new Date().toISOString()
        },
        ...prev.map(b => ({ ...b, is_winning_bid: 0 }))
      ]);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, current_highest_bid: amt } : i));
      setBidAmount('');
      Alert.alert('Bid Placed (Mock)', `Local bid recorded at ₹${amt.toFixed(2)}.`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAcceptBid = async (bid) => {
    Alert.alert(
      'Accept Bid',
      `Are you sure you want to sell ${bid.item_title} to ${bid.bidder_name} for ₹${parseFloat(bid.bid_amount).toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept & Sell',
          style: 'default',
          onPress: async () => {
            try {
              const res = await eventService.acceptBid(eventId, bid.id);
              if (res?.success) {
                Alert.alert('Success', 'Item marked as sold.');
                pollRoomUpdates();
              }
            } catch (err) {
              console.error('Accept bid error:', err);
              // Fallback accept
              setItems(prev => prev.map(i => i.id === bid.item_id ? { ...i, status: 'sold' } : i));
              setBids(prev => prev.map(b => b.id === bid.id ? { ...b, item_status: 'sold', is_winning_bid: 1 } : b));
              Alert.alert('Success (Mock)', 'Marked item as sold locally.');
            }
          }
        }
      ]
    );
  };

  const handleDeclineBid = async (bid) => {
    Alert.alert(
      'Decline Bid',
      `Are you sure you want to decline this bid of ₹${parseFloat(bid.bid_amount).toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await eventService.declineBid(eventId, bid.id);
              if (res?.success) {
                Alert.alert('Declined', 'Bid declined successfully.');
                pollRoomUpdates();
              }
            } catch (err) {
              console.error('Decline bid error:', err);
              setBids(prev => prev.filter(b => b.id !== bid.id));
              Alert.alert('Declined (Mock)', 'Bid removed locally.');
            }
          }
        }
      ]
    );
  };

  const renderActiveProduct = () => {
    const activeItem = items.find(i => i.status === 'active');
    if (!activeItem) {
      return (
        <View style={styles.noActiveProduct}>
          <Text style={styles.noProductText}>No active items currently featured for bidding.</Text>
        </View>
      );
    }

    let parsedImages = [];
    try {
      parsedImages = JSON.parse(activeItem.images || '[]');
    } catch (e) {
      parsedImages = [activeItem.images];
    }
    const imageUrl = parsedImages[0] || 'https://placehold.co/400';

    return (
      <View style={styles.productCard}>
        <Image source={{ uri: imageUrl }} style={styles.productThumbnail} />
        <View style={styles.productDetails}>
          <Text style={styles.productTitle} numberOfLines={1}>{activeItem.title}</Text>
          <Text style={styles.productPriceText}>
            Starting: ₹{parseFloat(activeItem.starting_price || 0).toFixed(2)}
          </Text>
          <Text style={styles.highestBidText}>
            Highest Bid: ₹{parseFloat(activeItem.current_highest_bid || activeItem.starting_price || 0).toFixed(2)}
          </Text>

          {/* Place Bid Inputs */}
          {activeItem.uploaded_by !== user?.id && (
            <View style={styles.bidActionContainer}>
              <TextInput
                style={styles.bidInput}
                value={bidAmount}
                onChangeText={setBidAmount}
                keyboardType="numeric"
                placeholder="₹ Amount"
              />
              <TouchableOpacity
                style={styles.bidBtn}
                onPress={() => handlePlaceBid(activeItem)}
                disabled={submitLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.bidBtnText}>Place Bid</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderChatBubble = ({ item }) => {
    const isSystem = item.is_system;
    if (isSystem) {
      return (
        <View style={styles.systemBubble}>
          <Text style={styles.systemText}>{item.message}</Text>
        </View>
      );
    }

    const isMe = item.sender_id === user?.id;
    return (
      <View style={[styles.chatRow, isMe && styles.myChatRow]}>
        {!isMe && (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{item.full_name?.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={[styles.chatBubble, isMe ? styles.myChatBubble : styles.otherChatBubble]}>
          {!isMe && <Text style={styles.chatSenderName}>{item.full_name}</Text>}
          <Text style={[styles.chatMessageText, isMe && styles.myChatMessageText]}>{item.message}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeader title={eventData.title || 'Live Stream'} navigation={navigation} showBackButton />

      {/* Mock Livestream Video Wrapper */}
      <View style={styles.videoPlayerContainer}>
        <Image
          source={{ uri: eventData.cover_url || eventData.thumbnail_url || 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80' }}
          style={styles.videoMockBackground}
        />
        <View style={styles.videoOverlay}>
          <View style={styles.videoHeaderBadgeRow}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <View style={styles.viewersBadge}>
              <Ionicons name="eye-outline" size={14} color="#FFF" />
              <Text style={styles.viewersCountText}>{eventData.live_participant_count || 12} viewing</Text>
            </View>
          </View>
          <View style={styles.videoFooterDetails}>
            <Text style={styles.videoTitle}>{eventData.title}</Text>
            <Text style={styles.videoOrganizer}>by {eventData.organizer || 'Seller'}</Text>
          </View>
        </View>
      </View>

      {/* Navigation tabs for panels */}
      <View style={styles.panelTabs}>
        <TouchableOpacity
          style={[styles.panelTabBtn, activePanel === 'chat' && styles.activePanelTabBtn]}
          onPress={() => setActivePanel('chat')}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={activePanel === 'chat' ? '#000' : '#808080'} />
          <Text style={[styles.panelTabBtnText, activePanel === 'chat' && styles.activePanelTabBtnText]}>Live Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.panelTabBtn, activePanel === 'bidding' && styles.activePanelTabBtn]}
          onPress={() => setActivePanel('bidding')}
        >
          <Ionicons name="cash-outline" size={18} color={activePanel === 'bidding' ? '#000' : '#808080'} />
          <Text style={[styles.panelTabBtnText, activePanel === 'bidding' && styles.activePanelTabBtnText]}>Bidding & Bids</Text>
        </TouchableOpacity>
      </View>

      {/* Panels content */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {activePanel === 'chat' ? (
          // LIVE CHAT FEED
          <View style={{ flex: 1 }}>
            <FlatList
              ref={chatListRef}
              data={chatMessages}
              renderItem={renderChatBubble}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.chatListContainer}
              onContentSizeChange={() => chatListRef.current?.scrollToEnd({ animated: true })}
            />

            {/* Chat Input Bar */}
            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInput}
                value={chatText}
                onChangeText={setChatText}
                placeholder="Send a live message..."
                placeholderTextColor="#A0A0A0"
              />
              <TouchableOpacity style={styles.sendChatBtn} onPress={handleSendChat} activeOpacity={0.8}>
                <Ionicons name="send" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // BIDDING & BIDS LIST PANEL
          <ScrollView style={styles.biddingPanel} showsVerticalScrollIndicator={false}>
            {/* Active Product featured */}
            <Text style={styles.sectionHeaderTitle}>Featured Product</Text>
            {renderActiveProduct()}

            {/* Bids Log list */}
            <Text style={[styles.sectionHeaderTitle, { marginTop: 24 }]}>Bids History</Text>
            <View style={styles.bidsLogContainer}>
              {bids.length === 0 ? (
                <Text style={styles.noBidsText}>No bids placed yet. Be the first to bid!</Text>
              ) : (
                bids.map((bid) => {
                  const isWinning = bid.is_winning_bid;
                  const isDeclined = bid.declined;
                  // If item owner, user can accept or decline this bid
                  const isSeller = bids[0]?.item_owner_id === user?.id || eventData.user_id === user?.id;
                  const isItemActive = bid.item_status === 'active';

                  return (
                    <View key={bid.id} style={[styles.bidLogItem, isWinning && styles.winningBidLogItem]}>
                      <View style={styles.bidLogDetails}>
                        <Text style={styles.bidLogUser}>{bid.bidder_name}</Text>
                        <Text style={styles.bidLogItemTitle} numberOfLines={1}>{bid.item_title}</Text>
                        <Text style={styles.bidLogTime}>{new Date(bid.created_at).toLocaleTimeString()}</Text>
                      </View>
                      
                      <View style={styles.bidLogRight}>
                        <Text style={[styles.bidLogPrice, isWinning && styles.winningBidLogPrice]}>
                          ₹{parseFloat(bid.bid_amount).toFixed(2)}
                        </Text>
                        
                        {isWinning && <Text style={styles.winningBadge}>HIGHEST</Text>}
                        {isDeclined && <Text style={styles.declinedBadge}>DECLINED</Text>}

                        {/* Seller accept/decline action panel */}
                        {isSeller && isItemActive && !isDeclined && (
                          <View style={styles.sellerActionsRow}>
                            <TouchableOpacity
                              style={[styles.sellerBtn, styles.sellerDeclineBtn]}
                              onPress={() => handleDeclineBid(bid)}
                            >
                              <Text style={styles.sellerBtnText}>Decline</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.sellerBtn, styles.sellerAcceptBtn]}
                              onPress={() => handleAcceptBid(bid)}
                            >
                              <Text style={styles.sellerBtnText}>Accept</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  videoPlayerContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
    position: 'relative',
  },
  videoMockBackground: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'space-between',
    padding: 12,
  },
  videoHeaderBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E53935',
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
  viewersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewersCountText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  videoFooterDetails: {
    marginBottom: 4,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 4,
  },
  videoOrganizer: {
    fontSize: 12,
    color: '#E0E0E0',
    marginTop: 2,
    fontWeight: '600',
  },
  panelTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  panelTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  activePanelTabBtn: {
    borderBottomWidth: 3,
    borderBottomColor: '#000',
  },
  panelTabBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#808080',
    marginLeft: 6,
  },
  activePanelTabBtnText: {
    color: '#000',
  },
  chatListContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  chatRow: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  myChatRow: {
    justifyContent: 'flex-end',
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#505050',
  },
  chatBubble: {
    borderRadius: 12,
    padding: 10,
    maxWidth: width * 0.7,
  },
  otherChatBubble: {
    backgroundColor: '#F2F2F7',
  },
  myChatBubble: {
    backgroundColor: '#007AFF',
  },
  chatSenderName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#606060',
    marginBottom: 2,
  },
  chatMessageText: {
    fontSize: 13,
    color: '#303030',
    lineHeight: 18,
  },
  myChatMessageText: {
    color: '#FFF',
  },
  systemBubble: {
    alignSelf: 'center',
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginVertical: 8,
  },
  systemText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E65100',
    textAlign: 'center',
  },
  chatInputRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#D0D0D8',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#F9F9F9',
  },
  sendChatBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  biddingPanel: {
    flex: 1,
    padding: 16,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#808080',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  noActiveProduct: {
    backgroundColor: '#F9F9FC',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAEAEF',
  },
  noProductText: {
    fontSize: 13,
    color: '#808080',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: 12,
    alignItems: 'center',
  },
  productThumbnail: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  productDetails: {
    flex: 1,
    marginLeft: 14,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#303030',
  },
  productPriceText: {
    fontSize: 12,
    color: '#606060',
    marginTop: 4,
  },
  highestBidText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#E53935',
    marginTop: 2,
  },
  bidActionContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  bidInput: {
    width: 90,
    height: 36,
    borderWidth: 1,
    borderColor: '#D0D0D8',
    borderRadius: 8,
    paddingHorizontal: 8,
    fontSize: 13,
    color: '#000',
    backgroundColor: '#F9F9F9',
    marginRight: 8,
  },
  bidBtn: {
    flex: 1,
    height: 36,
    backgroundColor: '#000',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bidBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bidsLogContainer: {
    paddingBottom: 40,
  },
  noBidsText: {
    fontSize: 13,
    color: '#808080',
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  bidLogItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  winningBidLogItem: {
    backgroundColor: '#F4FBF7',
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  bidLogDetails: {
    flex: 1.2,
  },
  bidLogUser: {
    fontSize: 13,
    fontWeight: '700',
    color: '#303030',
  },
  bidLogItemTitle: {
    fontSize: 11,
    color: '#707070',
    marginTop: 1,
  },
  bidLogTime: {
    fontSize: 9,
    color: '#A0A0A0',
    marginTop: 2,
  },
  bidLogRight: {
    alignItems: 'flex-end',
    flex: 1,
  },
  bidLogPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#505050',
  },
  winningBidLogPrice: {
    color: '#2E7D32',
    fontWeight: '800',
  },
  winningBadge: {
    fontSize: 8,
    fontWeight: '800',
    color: '#2E7D32',
    backgroundColor: '#E8F8EE',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
  },
  declinedBadge: {
    fontSize: 8,
    fontWeight: '800',
    color: '#C62828',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
  },
  sellerActionsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  sellerBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 6,
  },
  sellerDeclineBtn: {
    backgroundColor: '#FFEBEE',
  },
  sellerAcceptBtn: {
    backgroundColor: '#E8F8EE',
  },
  sellerBtnText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#333',
  },
});

export default EventRoomScreen;
