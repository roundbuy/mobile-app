import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ActivityIndicator,
    Image,
    Alert
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import ActionCardComponent from './ActionCardComponent';
import { messagingService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/TranslationContext';
import { getFullImageUrl } from '../../utils/imageUtils';
import ChatRestrictionsModal from '../../components/ChatRestrictionsModal';

const Step1EnquiryScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { advertisementId, title, conversationId: initialConversationId, offerAmount: initialOfferAmount } = route?.params || {};

    const [message, setMessage] = useState('');
    const [offerAmount, setOfferAmount] = useState(initialOfferAmount || '');
    const [messages, setMessages] = useState([]);
    const [offers, setOffers] = useState([]);
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [conversation, setConversation] = useState(null);
    const [conversationId, setConversationId] = useState(initialConversationId);
    const [chatRestrictionsModalVisible, setChatRestrictionsModalVisible] = useState(false);

    const scrollViewRef = useRef(null);

    // Combine messages and offers into a single timeline
    const combinedMessages = React.useMemo(() => {
        const offerMessages = offers.map(offer => ({
            ...offer,
            type: 'offer',
            offer_id: offer.id,
            created_at: offer.created_at,
            sender_id: offer.sender_id,
            sender_name: offer.sender_name,
            amount: offer.offered_price,
            status: offer.status
        }));

        const allItems = [...messages, ...offerMessages];

        // Sort by created_at ascending (oldest first, newest at bottom)
        return allItems.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }, [messages, offers]);

    const { user } = useAuth();
    const currentUserId = user?.id || null;
    const userCurrency = user?.currency_code || 'GBP';

    const currencySymbol = userCurrency === 'USD' ? '$' :
        userCurrency === 'EUR' ? '€' :
            userCurrency === 'GBP' ? '£' : '£';

    useEffect(() => {
        loadConversationAndMessages();
    }, [conversationId, advertisementId]);

    const loadConversationAndMessages = async () => {
        try {
            setLoading(true);

            // If we have a conversationId directly from routing (Common Action Center case)
            if (conversationId) {
                await Promise.all([
                    loadMessages(conversationId),
                    loadOffers(conversationId)
                ]);
                return;
            }

            // Fallback: Find conversation by advertisement ID if conversationId is missing
            if (advertisementId) {
                const conversationsResponse = await messagingService.getConversations();
                if (conversationsResponse.data?.success && conversationsResponse.data.conversations) {
                    const existingConversation = conversationsResponse.data.conversations.find(
                        conv => conv.advertisement_id === advertisementId
                    );

                    if (existingConversation) {
                        setConversationId(existingConversation.id);
                        setConversation(existingConversation);
                        await Promise.all([
                            loadMessages(existingConversation.id),
                            loadOffers(existingConversation.id)
                        ]);
                    } else {
                        setLoading(false); // New conversation
                    }
                } else {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error('Error loading conversation:', error);
            setLoading(false);
        }
    };

    const loadMessages = async (id) => {
        try {
            const response = await messagingService.getConversationMessages(id);
            if (response.data && response.data.success) {
                setConversation(response.data.conversation);
                // We don't sort here anymore, combinedMessages handles sorting
                setMessages(response.data.messages || []);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadOffers = async (id) => {
        try {
            const response = await messagingService.getConversationOffers(id);
            if (response.data && response.data.success) {
                setOffers(response.data.offers || []);
            }
        } catch (error) {
            console.error('Error loading offers:', error);
        }
    };

    const handleSend = async () => {
        if (!message.trim() || sending) return;

        if (!advertisementId && !conversation?.advertisement_id) {
            Alert.alert(t('Error'), t('Product information is missing.'));
            return;
        }

        try {
            setSending(true);
            const adId = advertisementId || conversation?.advertisement_id;

            const messageData = {
                advertisement_id: adId,
                message: message.trim()
            };

            const response = await messagingService.sendMessage(messageData);

            if (response.data && response.data.success) {
                const newMessage = {
                    id: response.data.message.id,
                    sender_id: response.data.message.sender_id,
                    message: response.data.message.message,
                    created_at: response.data.message.created_at,
                    sender_name: response.data.message.sender_name,
                    sender_avatar: response.data.message.sender_avatar,
                    isCurrentUser: true,
                };

                setMessages(prev => [...prev, newMessage]);
                setMessage('');

                // Update conversation if it was just created
                if (response.data.conversation_id && !conversationId) {
                    setConversationId(response.data.conversation_id);
                    setConversation({ id: response.data.conversation_id });
                }

                setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
            } else {
                Alert.alert(t('Error'), response.data?.message || t('Failed to send message'));
            }
        } catch (error) {
            console.error('Send message error:', error);
            Alert.alert(t('Error'), t('Failed to send message. Please try again.'));
        } finally {
            setSending(false);
        }
    };

    const handleMakeOffer = async () => {
        if (!offerAmount.trim() || sending) return;

        const adId = advertisementId || conversation?.advertisement_id;
        if (!adId) {
            Alert.alert(t('Error'), t('Product information is missing.'));
            return;
        }

        try {
            setSending(true);
            let activeConvId = conversationId;

            // If no conversation yet, create one by sending an initial message
            if (!activeConvId) {
                const messageResponse = await messagingService.sendMessage({
                    advertisement_id: adId,
                    message: `I'm interested in this item and would like to make an offer of ${currencySymbol}${offerAmount}`
                });

                if (messageResponse.data && messageResponse.data.success) {
                    activeConvId = messageResponse.data.conversation_id;
                    setConversationId(activeConvId);
                    setConversation({ id: activeConvId });
                    await loadMessages(activeConvId);
                } else {
                    throw new Error(messageResponse.data?.message || 'Failed to start conversation');
                }
            }

            if (!activeConvId) throw new Error('No active conversation ID.');

            // Make the offer
            const offerData = {
                conversation_id: parseInt(activeConvId),
                offered_price: parseFloat(offerAmount),
                message: `Offer: ${currencySymbol}${offerAmount}`
            };

            const response = await messagingService.makeOffer(offerData);

            if (response.data && response.data.success) {
                setOfferAmount('');
                await loadOffers(activeConvId);
                Alert.alert(t('Success'), t('Offer sent successfully!'));
            } else {
                Alert.alert(t('Error'), response.data?.message || t('Failed to send offer'));
            }

            // Also reload messages to capture the system generated 'Offer: X' text message if desired
            if (activeConvId) {
                await loadMessages(activeConvId);
            }

        } catch (error) {
            console.error('Make offer error:', error);
            Alert.alert(t('Error'), t('Failed to send offer. Please try again.'));
        } finally {
            setSending(false);
        }
    };

    const handleRespondToOffer = async (offerId, action) => {
        if (!offerId || !conversationId) return;

        try {
            setSending(true);
            const response = await messagingService.respondToOffer(offerId, {
                action: action // 'accept' or 'reject'
            });

            if (response.data && response.data.success) {
                // Reload offers to get updated status
                await loadOffers(conversationId);
                const actionText = action === 'accept' ? 'accepted' : 'declined';
                Alert.alert(t('Success'), `Offer ${actionText} successfully!`);
            } else {
                Alert.alert(t('Error'), response.data?.message || `Failed to ${action} offer`);
            }
        } catch (error) {
            console.error(`${action} offer error:`, error);
            Alert.alert(t('Error'), `Failed to ${action} offer. Please try again.`);
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item }) => {
        const isCurrentUser = item.sender_id === currentUserId || item.isCurrentUser;

        const timestamp = item.created_at ?
            new Date(item.created_at).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            }) : '';

        const isCurrentUserSeller = conversation?.seller_id === currentUserId;

        if (item.type === 'offer') {
            const isOfferFromCurrentUser = item.sender_id === currentUserId;

            return (
                <View style={styles.messageRow}>
                    <View style={styles.avatarContainer}>
                        {item.sender_avatar ? (
                            <Image source={{ uri: getFullImageUrl(item.sender_avatar) }} style={styles.avatarImage} resizeMode="cover" />
                        ) : (
                            <View style={styles.defaultAvatarContainer}>
                                <FontAwesome name="user-circle" size={40} color="#000" />
                                <View style={styles.activeDot} />
                            </View>
                        )}
                    </View>

                    <View style={styles.messageContent}>
                        <View style={styles.messageHeaderRow}>
                            <Text style={styles.senderName}>{item.sender_name || 'User'}</Text>
                            <Text style={styles.timestampText}>{timestamp}</Text>
                        </View>
                        <Text style={styles.messageText}>
                            {isOfferFromCurrentUser ? 'I am ready to make an offer. Here it is.' : 'Almost there! Just few days fixing the Design and there you have it.'}
                        </Text>

                        {/* Offer Card embedded below the text */}
                        <View style={styles.offerCardInner}>
                            {isOfferFromCurrentUser && item.status === 'pending' && (
                                <Text style={styles.offerHeadline}>An offer made succesfully!</Text>
                            )}

                            <View style={styles.offerDetailsRow}>
                                <Text style={styles.offerUsernameBold}>{item.sender_name} </Text>
                                <Text style={styles.offerDetailsText}>{isOfferFromCurrentUser ? 'You made an offer:' : 'made an offer:'}</Text>
                                <Text style={styles.offerAmountBold}>{currencySymbol}{item.amount}</Text>
                            </View>

                            {item.status === 'pending' && isOfferFromCurrentUser && (
                                <Text style={styles.offerContextText}>
                                    <Text style={{ fontWeight: 'bold' }}>{conversation?.seller_name || 'The seller'}</Text> will either Accept, Decline or Make an Offer to you.
                                </Text>
                            )}

                            {item.status === 'pending' && isCurrentUserSeller && !isOfferFromCurrentUser && (
                                <View style={styles.offerActionButtons}>
                                    <View style={styles.offerButtonsRow}>
                                        <TouchableOpacity
                                            style={[styles.offerDeclineBtn, sending && styles.offerBtnDisabled]}
                                            onPress={() => handleRespondToOffer(item.offer_id, 'reject')}
                                            disabled={sending}
                                        >
                                            <Text style={styles.offerDeclineBtnText}>Decline</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.offerCounterBtn, sending && styles.offerBtnDisabled]}
                                            onPress={handleMakeOffer}
                                            disabled={sending}
                                        >
                                            <Text style={styles.offerCounterBtnText}>Make an Offer</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.offerAcceptBtn, sending && styles.offerBtnDisabled]}
                                        onPress={() => handleRespondToOffer(item.offer_id, 'accept')}
                                        disabled={sending}
                                    >
                                        <Text style={styles.offerAcceptBtnText}>Accept</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {item.status === 'accepted' && (
                                <View style={styles.offerStatusBoxAccepted}>
                                    <Text style={styles.offerStatusTextWhite}>Accepted</Text>
                                </View>
                            )}

                            {item.status === 'rejected' && (
                                <View style={styles.offerStatusBoxDeclined}>
                                    <Text style={styles.offerStatusTextWhite}>Declined</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            );
        }

        // NEW UI REQUIREMENT: No grey chat bubbles, larger text, larger avatars
        return (
            <View style={styles.messageRow}>
                <View style={styles.avatarContainer}>
                    {item.sender_avatar ? (
                        <Image
                            source={{ uri: getFullImageUrl(item.sender_avatar) }}
                            style={styles.avatarImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.defaultAvatarContainer}>
                            <FontAwesome name="user-circle" size={40} color="#000" />
                            {/* Green dot for active status overlay */}
                            <View style={styles.activeDot} />
                        </View>
                    )}
                </View>

                <View style={styles.messageContent}>
                    <View style={styles.messageHeaderRow}>
                        <Text style={styles.senderName}>{item.sender_name || 'User'}</Text>
                        <Text style={styles.timestampText}>{timestamp}</Text>
                    </View>
                    <Text style={styles.messageText}>{item.message}</Text>
                </View>
            </View>
        );
    };

    const adImage = conversation?.advertisement_images ?
        JSON.parse(conversation.advertisement_images)[0] : null;

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Product Chat: {title || conversation?.advertisement_title || 'Enquiry'}</Text>
                </View>

                {/* Main Content Area */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                ) : (
                    <View style={styles.chatContainer}>

                        {/* Top Info Bar: Product & Make Offer Option */}
                        <View style={styles.productTopBar}>
                            <Image
                                source={adImage ? { uri: getFullImageUrl(adImage) } : { uri: 'https://via.placeholder.com/60' }}
                                style={styles.topBarImage}
                            />
                            <View style={styles.topBarDetails}>
                                <View style={styles.topBarTitleRow}>
                                    <Text style={styles.topBarTitle} numberOfLines={1}>{title || conversation?.advertisement_title || 'Product'}</Text>
                                    <Text style={styles.topBarPrice}>{currencySymbol}{conversation?.advertisement_price || '0.00'}</Text>
                                </View>

                                <Text style={styles.topBarDistance}>Distance: 750 m / 15 min walk</Text>

                                {/* Make an Offer Form */}
                                {console.log('conversation', currentUserId, conversation?.buyer_id, currentUserId == conversation?.buyer_id)}
                                {(currentUserId == conversation?.buyer_id || !conversation) && (
                                    <View style={styles.offerFormContainer}>
                                        <View style={styles.offerInputWrapper}>
                                            <Text style={styles.offerInputCurrency}>{currencySymbol}</Text>
                                            <TextInput
                                                style={styles.offerInputBox}
                                                placeholder="0.00"
                                                placeholderTextColor="#999"
                                                keyboardType="decimal-pad"
                                                value={offerAmount}
                                                onChangeText={setOfferAmount}
                                                editable={!sending}
                                            />
                                        </View>
                                        <View style={styles.actionButtonsRow}>
                                            <TouchableOpacity
                                                style={[styles.offerBtnHalf, (!offerAmount || sending) && styles.makeOfferBtnDisabled]}
                                                onPress={handleMakeOffer}
                                                disabled={!offerAmount || sending}
                                            >
                                                <Text style={styles.offerBtnTextBlack}>Offer</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.buyBtnHalf, sending && styles.makeOfferBtnDisabled]}
                                                onPress={() => {
                                                    // Handle buy action here - possibly navigating to Step 3 Delivery Selection directly with full price
                                                    navigation.navigate('Step3DeliverySelectionScreen', {
                                                        conversationId: conversation?.id,
                                                        advertisementId: conversation?.advertisement_id,
                                                        title: title || conversation?.advertisement_title,
                                                        offerAmount: conversation?.advertisement_price || '0.00' // full price
                                                    });
                                                }}
                                                disabled={sending}
                                            >
                                                <Text style={styles.buyBtnTextWhite}>Buy</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Date Divider (Fake for UI similarity to screenshot) */}
                        <View style={styles.dateDivider}>
                            <Text style={styles.dateText}>12 October 2025</Text>
                            {/* In reality we would dynamically group by date, leaving static to match layout */}
                        </View>

                        {/* Message Stream */}
                        <FlatList
                            ref={scrollViewRef}
                            data={combinedMessages}
                            keyExtractor={(item, index) => item.type === 'offer' ? `offer-${item.id}` : `msg-${item.id}`}
                            style={styles.messageList}
                            contentContainerStyle={styles.messageListContent}
                            renderItem={renderMessage}
                            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                            ListEmptyComponent={
                                <View style={styles.emptyMessagesContainer}>
                                    <Text style={styles.emptyMessagesText}>{t('No messages yet. Start the enquiry!')}</Text>
                                </View>
                            }
                        />

                        {/* Input Area */}
                        <View style={styles.bottomSection}>
                            <View style={styles.warningContainer}>
                                <Text style={styles.warningText}>
                                    Stay safe in RoundBuy. Don't share personal data, click on external links, or scan codes.
                                    <Text style={styles.warningLink} onPress={() => setChatRestrictionsModalVisible(true)}> Read more on Safety Guidelines</Text>
                                </Text>
                            </View>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Send a message"
                                    placeholderTextColor="#999"
                                    value={message}
                                    onChangeText={setMessage}
                                    multiline
                                />
                                <TouchableOpacity
                                    style={styles.sendButton}
                                    onPress={handleSend}
                                    disabled={!message.trim() || sending}
                                >
                                    {sending ? (
                                        <ActivityIndicator size="small" color="#000" />
                                    ) : (
                                        <Text style={{ fontSize: 24, color: message.trim() ? '#000' : '#ccc' }}>{'>'}</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            </KeyboardAvoidingView>

            <ChatRestrictionsModal
                visible={chatRestrictionsModalVisible}
                onClose={() => setChatRestrictionsModalVisible(false)}
            />
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
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 4,
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        color: '#000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    productTopBar: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    topBarImage: {
        width: 80,
        height: 100,
        borderRadius: 8,
        backgroundColor: '#e0e0e0',
    },
    topBarDetails: {
        flex: 1,
        marginLeft: 12,
    },
    topBarTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    topBarTitle: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
        flex: 1,
    },
    topBarPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
    },
    topBarDistance: {
        fontSize: 12,
        color: '#666',
        marginBottom: 12,
    },
    offerFormContainer: {
        marginTop: 4,
    },
    offerInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginBottom: 8,
        justifyContent: 'center',
    },
    offerInputCurrency: {
        fontSize: 18,
        color: '#000',
        marginRight: 6,
        fontWeight: '500',
    },
    offerInputBox: {
        fontSize: 18,
        color: '#000',
        minWidth: 80,
        textAlign: 'left',
    },
    actionButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 12, // For react-native 0.71+
    },
    offerBtnHalf: {
        backgroundColor: '#f5f5f5',
        flex: 1,
        paddingVertical: 12,
        borderRadius: 24,
        alignItems: 'center',
    },
    offerBtnTextBlack: {
        fontSize: 18,
        fontWeight: '500',
        color: '#000',
    },
    buyBtnHalf: {
        backgroundColor: '#001C64', // Dark blue from the screenshot
        flex: 1,
        paddingVertical: 12,
        borderRadius: 24,
        alignItems: 'center',
    },
    buyBtnTextWhite: {
        fontSize: 18,
        fontWeight: '500',
        color: '#fff',
    },
    makeOfferBtnDisabled: {
        opacity: 0.5,
    },
    dateDivider: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    dateText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    messageList: {
        flex: 1,
    },
    messageListContent: {
        padding: 16,
        paddingTop: 4,
    },
    emptyMessagesContainer: {
        padding: 30,
        alignItems: 'center',
    },
    emptyMessagesText: {
        color: '#666',
        fontSize: 16,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 24, // Added more spacing
        alignItems: 'flex-start',
    },
    avatarContainer: {
        marginRight: 12,
    },
    defaultAvatarContainer: {
        position: 'relative',
    },
    avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    activeDot: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 12,
        height: 12,
        backgroundColor: '#32CD32',
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#fff',
    },
    messageContent: {
        flex: 1,
    },
    messageHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    senderName: {
        fontSize: 16, // Enchanced as requested
        fontWeight: 'bold',
        color: '#000',
        marginRight: 8,
    },
    timestampText: {
        fontSize: 12,
        color: '#666',
    },
    messageText: {
        fontSize: 16, // Enchanced as requested
        color: '#000',
        lineHeight: 22,
    },
    bottomSection: {
        padding: 16,
        paddingTop: 8,
        backgroundColor: '#fff',
    },
    warningContainer: {
        marginBottom: 12,
    },
    warningText: {
        fontSize: 11,
        color: '#666',
        lineHeight: 16,
    },
    warningLink: {
        color: COLORS.primary,
        textDecorationLine: 'underline',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        minHeight: 40,
        maxHeight: 100,
        color: '#000',
    },
    sendButton: {
        padding: 8,
        marginLeft: 8,
    },
    offerCardInner: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        width: '100%',
        marginTop: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    offerHeadline: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 12,
    },
    offerDetailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    offerUsernameBold: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#000',
    },
    offerDetailsText: {
        fontSize: 14,
        color: '#333',
        marginRight: 'auto',
    },
    offerAmountBold: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#000',
        marginLeft: 8,
    },
    offerContextText: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
        lineHeight: 18,
    },
    offerActionButtons: {
        marginTop: 16,
    },
    offerButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    offerDeclineBtn: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        borderRadius: 24,
        paddingVertical: 12,
        alignItems: 'center',
        marginRight: 6,
    },
    offerDeclineBtnText: {
        fontSize: 16,
        color: '#000',
    },
    offerCounterBtn: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        borderRadius: 24,
        paddingVertical: 12,
        alignItems: 'center',
        marginLeft: 6,
    },
    offerCounterBtnText: {
        fontSize: 16,
        color: '#000',
    },
    offerAcceptBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 24,
        paddingVertical: 12,
        alignItems: 'center',
    },
    offerAcceptBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    offerBtnDisabled: {
        opacity: 0.5,
    },
    offerStatusBoxAccepted: {
        marginTop: 12,
        backgroundColor: '#32CD32',
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    offerStatusBoxDeclined: {
        marginTop: 12,
        backgroundColor: '#FF3B30',
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    offerStatusTextWhite: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    }
});

export default Step1EnquiryScreen;
