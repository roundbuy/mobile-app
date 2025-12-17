import React, { useState, useRef, useEffect, useContext } from 'react';
import { IMAGES } from '../../assets/images';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { messagingService } from '../../services';
import { AuthContext } from '../../context/AuthContext';

const ProductChatScreen = ({ route, navigation }) => {
  // Accept both 'advertisement' and 'product' parameter names for compatibility
  const { advertisement, product, mode } = route?.params || {};
  
  // Get current user from AuthContext (with fallback)
  let currentUserId = null;
  let userCurrency = 'INR';
  
  try {
    const authContext = useContext(AuthContext);
    currentUserId = authContext?.user?.id;
    userCurrency = authContext?.user?.currency_code || 'INR';
  } catch (error) {
    console.log('AuthContext not available, using fallback values');
  }
  
  const [message, setMessage] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [showOfferInput, setShowOfferInput] = useState(mode === 'makeOffer');
  const scrollViewRef = useRef(null);

  // API state
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingOffers, setLoadingOffers] = useState(false);

  // Offer status - can be: null, 'pending', 'accepted', 'declined'
  const [offerStatus, setOfferStatus] = useState(null);
  const [currentOffer, setCurrentOffer] = useState(null);

  // Store advertisement data from route params (accept both parameter names) or conversation
  const [advertisementData, setAdvertisementData] = useState(advertisement || product || null);
  
  // Get currency symbol from user preferences or default
  const currencySymbol = userCurrency === 'USD' ? '$' :
                         userCurrency === 'EUR' ? '€' :
                         userCurrency === 'GBP' ? '£' : '₹';

  // Load conversation and messages on mount
  useEffect(() => {
    loadConversationAndMessages();
  }, []);

  const loadConversationAndMessages = async () => {
    try {
      setLoading(true);

      // First, try to find existing conversation
      const conversationsResponse = await messagingService.getConversations();
      if (conversationsResponse.data && conversationsResponse.data.success && conversationsResponse.data.conversations) {
        const existingConversation = conversationsResponse.data.conversations.find(
          conv => conv.advertisement_id === (advertisementData?.id || advertisement?.id || product?.id)
        );

        if (existingConversation) {
          setConversation(existingConversation);
          
          // Update advertisement data from conversation if not fully populated
          if (!advertisementData || !advertisementData.title) {
            setAdvertisementData({
              id: existingConversation.advertisement_id,
              title: existingConversation.advertisement_title,
              price: existingConversation.advertisement_price,
              images: existingConversation.advertisement_images ? JSON.parse(existingConversation.advertisement_images) : [],
            });
          }
          
          await loadMessages(existingConversation.id);
          await loadOffers(existingConversation.id);
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      // Don't show error alert here as it's not critical for first-time chat
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      setLoadingMessages(true);
      const response = await messagingService.getConversationMessages(conversationId);
      if (response.data && response.data.success) {
        const conversationData = response.data.conversation;
        setConversation(conversationData);
        setMessages(response.data.messages || []);
        
        // Update advertisement data from conversation if not provided
        if (!advertisementData && conversationData) {
          setAdvertisementData({
            id: conversationData.advertisement_id,
            title: conversationData.advertisement_title,
            price: conversationData.advertisement_price,
            images: conversationData.advertisement_images ? JSON.parse(conversationData.advertisement_images) : [],
          });
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadOffers = async (conversationId) => {
    try {
      setLoadingOffers(true);
      const response = await messagingService.getConversationOffers(conversationId);
      if (response.data && response.data.success) {
        setOffers(response.data.offers || []);
        // Set current offer status based on latest offer
        const latestOffer = response.data.offers?.[0];
        if (latestOffer) {
          setCurrentOffer(latestOffer);
          setOfferStatus(latestOffer.status);
        }
      }
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setLoadingOffers(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSendMessage = async () => {
    console.log('Send message sending:', sending);
    console.log('Send message message:', message);
    console.log('Advertisement data:', advertisementData);
    console.log('Advertisement from params:', advertisement);
    console.log('Product from params:', product);
    
    if (message.trim() && !sending) {
      // Validate we have an advertisement ID (check all possible sources)
      const adId = advertisementData?.id || advertisement?.id || product?.id;
      if (!adId) {
        Alert.alert('Error', 'Advertisement information is missing. Please go back and try again.');
        return;
      }

      try {
        setSending(true);

        const messageData = {
          advertisement_id: adId,
          message: message.trim()
        };
        console.log('Send message messageData:', messageData);

        const response = await messagingService.sendMessage(messageData);

        if (response.data && response.data.success) {
          // Add the message to local state
          const newMessage = {
            id: response.data.message.id,
            sender_id: response.data.message.sender_id,
            receiver_id: response.data.message.receiver_id,
            message: response.data.message.message,
            is_read: response.data.message.is_read,
            created_at: response.data.message.created_at,
            sender_name: response.data.message.sender_name,
            sender_avatar: response.data.message.sender_avatar,
            isCurrentUser: true,
          };

          setMessages(prev => [...prev, newMessage]);
          setMessage('');

          // Update conversation if it was just created
          if (response.data.conversation_id && !conversation) {
            setConversation({ id: response.data.conversation_id });
            console.log('Conversation set with ID:', response.data.conversation_id);
          }

          // Scroll to bottom after sending message
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        } else {
          Alert.alert('Error', response.data?.message || 'Failed to send message');
        }
      } catch (error) {
        console.error('Send message error:', error);
        Alert.alert('Error', error.message || 'Failed to send message. Please try again.');
      } finally {
        setSending(false);
      }
    }
  };

  const handleMakeOffer = async () => {
    if (offerAmount.trim() && !sending) {
      // Validate we have an advertisement ID (check all possible sources)
      const adId = advertisementData?.id || advertisement?.id || product?.id;
      if (!adId) {
        Alert.alert('Error', 'Advertisement information is missing. Please go back and try again.');
        return;
      }

      try {
        setSending(true);

        // First, ensure we have a conversation
        let conversationId = conversation?.id;

        if (!conversationId) {
          // Send a message first to create conversation
          const messageResponse = await messagingService.sendMessage({
            advertisement_id: adId,
            message: `I'm interested in this item and would like to make an offer of ${currencySymbol}${offerAmount}`
          });

          if (messageResponse.data && messageResponse.data.success) {
            // Extract conversation_id from response
            conversationId = messageResponse.data.conversation_id;
            
            // Validate conversation_id was received
            if (!conversationId) {
              console.error('Full message response:', JSON.stringify(messageResponse.data, null, 2));
              throw new Error('No conversation ID received from server');
            }
            
            console.log('Conversation created with ID:', conversationId);
            setConversation({ id: conversationId });
            await loadMessages(conversationId);
          } else {
            throw new Error(messageResponse.data?.message || 'Failed to create conversation');
          }
        }

        // Validate we have a valid conversation_id before making offer
        if (!conversationId) {
          throw new Error('No conversation ID available. Please try sending a message first.');
        }

        // Now make the offer
        const offerData = {
          conversation_id: parseInt(conversationId),
          offered_price: parseFloat(offerAmount),
          message: `Offer: ${currencySymbol}${offerAmount}`
        };

        console.log('Making offer with data:', offerData);

        const response = await messagingService.makeOffer(offerData);

        if (response.data && response.data.success) {
          setCurrentOffer(response.data.offer);
          setOfferStatus('pending');
          setShowOfferInput(false);
          setOfferAmount('');

          // Reload offers to get updated status
          await loadOffers(conversationId);

          // Add offer message to display
          const offerMessage = {
            id: `offer_${response.data.offer.id}`,
            type: 'offer',
            amount: offerAmount,
            status: 'pending',
            offer_id: response.data.offer.id,
            sender_name: response.data.offer.sender_name,
            created_at: response.data.offer.created_at,
          };

          setMessages(prev => [...prev, offerMessage]);
          Alert.alert('Success', 'Offer sent successfully!');
        } else {
          Alert.alert('Error', response.data?.message || 'Failed to send offer');
        }
      } catch (error) {
        console.error('Make offer error:', error);
        Alert.alert('Error', error.message || 'Failed to send offer. Please try again.');
      } finally {
        setSending(false);
      }
    }
  };

  const handleAcceptOffer = async () => {
    if (!currentOffer || !conversation) return;

    try {
      setSending(true);
      const response = await messagingService.respondToOffer(currentOffer.id, {
        action: 'accept'
      });

      if (response.data && response.data.success) {
        setOfferStatus('accepted');
        await loadOffers(conversation.id);
        Alert.alert('Success', 'Offer accepted successfully!');
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to accept offer');
      }
    } catch (error) {
      console.error('Accept offer error:', error);
      Alert.alert('Error', error.message || 'Failed to accept offer. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleDeclineOffer = async () => {
    if (!currentOffer || !conversation) return;

    try {
      setSending(true);
      const response = await messagingService.respondToOffer(currentOffer.id, {
        action: 'reject'
      });

      if (response.data && response.data.success) {
        setOfferStatus('rejected');
        await loadOffers(conversation.id);
        Alert.alert('Success', 'Offer declined.');
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to decline offer');
      }
    } catch (error) {
      console.error('Decline offer error:', error);
      Alert.alert('Error', error.message || 'Failed to decline offer. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    // Render offer message
    if (item.type === 'offer') {
      const offer = offers.find(o => o.id === item.offer_id) || currentOffer;
      const isOfferFromCurrentUser = offer?.sender_id === currentUserId;

      return (
        <View style={styles.offerMessageContainer}>
          <View style={styles.offerCard}>
            <Text style={styles.offerSuccessText}>
              {isOfferFromCurrentUser ? 'You made an offer!' : 'An offer was made!'}
            </Text>
            <View style={styles.offerDetails}>
              <Text style={styles.offerUsername}>{item.sender_name || 'User'}</Text>
              <Text style={styles.offerText}>offered</Text>
              <Text style={styles.offerAmount}>{currencySymbol}{item.amount || offer?.offered_price}</Text>
            </View>

            {offer?.status === 'accepted' && (
              <View style={styles.acceptedContainer}>
                <Text style={styles.acceptedTitle}>Accepted for {currencySymbol}{offer.offered_price}</Text>
                <Text style={styles.acceptedSubtext}>
                  Now schedule a Pick up Exchange!
                </Text>
                <Text style={styles.acceptedDescription}>
                  Arrange a meet up with the seller to inspect the product immediately.
                </Text>
                <TouchableOpacity style={styles.scheduleButton}>
                  <Text style={styles.scheduleButtonText}>Schedule a Pick Up</Text>
                </TouchableOpacity>
              </View>
            )}

            {offer?.status === 'rejected' && (
              <View style={styles.declinedContainer}>
                <Text style={styles.declinedText}>Declined</Text>
                <Text style={styles.declinedSubtext}>
                  The seller has declined this offer.
                </Text>
              </View>
            )}

            {offer?.status === 'pending' && !isOfferFromCurrentUser && (
              <View style={styles.offerActions}>
                <Text style={styles.offerActionText}>
                  {advertisementData.seller?.full_name || 'Seller'} will either Accept, Decline or Make a counter offer.
                </Text>
                <View style={styles.offerButtonsRow}>
                  <TouchableOpacity
                    style={[styles.declineButton, sending && styles.buttonDisabled]}
                    onPress={handleDeclineOffer}
                    disabled={sending}
                  >
                    <Text style={styles.declineButtonText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.acceptButton, sending && styles.buttonDisabled]}
                    onPress={handleAcceptOffer}
                    disabled={sending}
                  >
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.makeOfferLink}>
                  <Text style={styles.makeOfferLinkText}>Make a Counter Offer</Text>
                </TouchableOpacity>
              </View>
            )}

            {offer?.status === 'pending' && isOfferFromCurrentUser && (
              <View style={styles.pendingOfferContainer}>
                <Text style={styles.pendingOfferText}>
                  Waiting for {advertisementData.seller?.full_name || 'seller'} to respond...
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    // Render regular message
    const isCurrentUser = item.sender_id === currentUserId || item.isCurrentUser;
    const timestamp = item.created_at ?
      new Date(item.created_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }) : item.timestamp;

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
        ]}
      >
        <View style={styles.messageHeader}>
          <View style={styles.avatarContainer}>
            <FontAwesome name="user-circle" size={24} color="#666" />
          </View>
          <View style={styles.messageContent}>
            <View style={styles.messageTop}>
              <Text style={styles.username}>{item.sender_name || item.username || 'User'}</Text>
              <Text style={styles.timestamp}>{timestamp}</Text>
            </View>
            <Text style={styles.messageText}>{item.message || item.text}</Text>
            {!isCurrentUser && (
              <View style={styles.reactionContainer}>
                <Text style={styles.reactionText}>❤️</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Chat: {advertisementData?.title || 'Loading...'}</Text>
        </View>

        {/* Product Info Card */}
        <View style={styles.productCard}>
          <Image
            source={advertisementData?.images?.[0] || advertisementData?.image || IMAGES.chair1}
            style={styles.productImage}
          />
          <View style={styles.productInfo}>
            <View style={styles.productHeader}>
              <Text style={styles.productTitle}>{advertisementData?.title || 'Product'}</Text>
              <Text style={styles.productPrice}>{currencySymbol}{advertisementData?.price || '0'}</Text>
            </View>
            {advertisementData?.distance && (
              <Text style={styles.productDistance}>
                Distance: {advertisementData.distance} km
              </Text>
            )}
            {advertisementData?.location && (
              <Text style={styles.productLocation}>
                Location: {typeof advertisementData.location === 'string'
                  ? advertisementData.location
                  : `${advertisementData.location.city || ''}, ${advertisementData.location.country || ''}`.trim().replace(/^,\s*|,\s*$/g, '')}
              </Text>
            )}
            <View style={styles.offerPriceContainer}>
              <TextInput
                style={styles.offerPriceInput}
                placeholder={`${currencySymbol} 0.00`}
                placeholderTextColor="#999"
                value={offerAmount}
                onChangeText={setOfferAmount}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.makeOfferButton}
          onPress={handleMakeOffer}
        >
          <Text style={styles.makeOfferButtonText}>Make an offer</Text>
        </TouchableOpacity>

        {messages.length > 0 && messages[0]?.created_at && (
          <Text style={styles.dateHeader}>
            {new Date(messages[0].created_at).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </Text>
        )}

        {/* Loading Messages */}
        {loadingMessages && (
          <View style={styles.loadingMessagesContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingMessagesText}>Loading messages...</Text>
          </View>
        )}

        {/* Messages List */}
        {!loadingMessages && (
          <FlatList
            ref={scrollViewRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            contentContainerStyle={styles.messagesContainer}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              !loading ? (
                <View style={styles.emptyMessagesContainer}>
                  <Text style={styles.emptyMessagesText}>
                    No messages yet. Start the conversation!
                  </Text>
                </View>
              ) : null
            }
          />
        )}

        {/* Warning Text */}
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            Stay safe in RoundBuy: Don't share personal data, click on external
            links, or scan codes. More safety info
          </Text>
        </View>

        {/* Offer Input (if making an offer) */}
        {showOfferInput && (
          <View style={styles.offerInputContainer}>
            <TextInput
              style={styles.offerInput}
              placeholder={`Enter offer amount (e.g., ${currencySymbol}250.00)`}
              placeholderTextColor="#999"
              value={offerAmount}
              onChangeText={setOfferAmount}
              keyboardType="decimal-pad"
            />
            <TouchableOpacity
              style={styles.sendOfferButton}
              onPress={handleMakeOffer}
            >
              <Text style={styles.sendOfferButtonText}>Send Offer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder={
              !advertisementData?.id && !advertisement?.id && !product?.id
                ? "Advertisement data missing..."
                : "Send a message"
            }
            placeholderTextColor="#999"
            value={message}
            onChangeText={setMessage}
            multiline
            editable={!sending && (advertisementData?.id || advertisement?.id || product?.id)}
          />
          <TouchableOpacity
            style={[styles.sendButton, sending && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={sending || !message.trim() || (!advertisementData?.id && !advertisement?.id && !product?.id)}
          >
            {sending ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Ionicons name="send" size={24} color={message.trim() && (advertisementData?.id || advertisement?.id || product?.id) ? COLORS.primary : '#ccc'} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  productCard: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'flex-start',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginLeft: 8,
  },
  productDistance: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  productLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  offerPriceContainer: {
    marginTop: 4,
  },
  offerPriceInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  makeOfferButton: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  makeOfferButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  dateHeader: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
  },
  currentUserMessage: {
    alignItems: 'flex-end',
  },
  otherUserMessage: {
    alignItems: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    maxWidth: '85%',
  },
  avatarContainer: {
    marginRight: 8,
  },
  messageContent: {
    flex: 1,
  },
  messageTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginLeft: 8,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  reactionContainer: {
    marginTop: 4,
  },
  reactionText: {
    fontSize: 12,
    color: '#666',
  },
  offerMessageContainer: {
    marginVertical: 12,
  },
  offerCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  offerSuccessText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  offerDetails: {
    marginBottom: 12,
  },
  offerUsername: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  offerText: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  offerAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
  },
  offerActions: {
    marginTop: 8,
  },
  offerActionText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  offerButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  makeOfferLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  makeOfferLinkText: {
    fontSize: 13,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  acceptedContainer: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  acceptedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2e7d32',
    marginBottom: 4,
  },
  acceptedSubtext: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  acceptedDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  scheduleButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  scheduleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  declinedContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  declinedText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#c62828',
    marginBottom: 4,
  },
  declinedSubtext: {
    fontSize: 12,
    color: '#666',
  },
  warningContainer: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  warningText: {
    fontSize: 11,
    color: '#856404',
    textAlign: 'center',
  },
  offerInputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8,
  },
  offerInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
  },
  sendOfferButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendOfferButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  pendingOfferContainer: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  pendingOfferText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
  },
  loadingMessagesContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingMessagesText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyMessagesContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyMessagesText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default ProductChatScreen;