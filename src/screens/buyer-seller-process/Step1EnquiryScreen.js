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
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import ActionCardComponent from './ActionCardComponent';
import { messagingService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/TranslationContext';
import { getFullImageUrl } from '../../utils/imageUtils';
import ChatRestrictionsModal from '../../components/ChatRestrictionsModal';
import { uploadImages } from '../../services/advertisementService';

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

    // Check if the current user is the seller of the advertisement related to this conversation
    const isCurrentUserSeller = conversation?.seller_id === currentUserId;

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

    const handleSelectImage = () => {
        const adId = advertisementId || conversation?.advertisement_id;
        navigation.navigate('ChatUploadImagesScreen', {
            advertisementId: adId,
            conversationId: conversationId || conversation?.id
        });
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

        if (item.type === 'offer') {
            const isOfferFromCurrentUser = item.sender_id === currentUserId;

            return (
                <View style={[styles.messageRow, { marginLeft: 0 }]}>
                    <View style={styles.messageContent}>
                        {/* Offer Content matching Mockup design */}
                        {item.status === 'pending' && (
                            <View style={styles.offerCardInnerBordered}>
                                <Text style={styles.offerHeadline}>
                                    {isCurrentUserSeller && !isOfferFromCurrentUser ? 'New offer' : 'Offer made'}
                                </Text>

                                <View style={styles.offerTextRow}>
                                    <Text style={styles.offerActionText}>
                                        <Text style={styles.offerUsernameBold}>{item.sender_name}</Text>{' '}
                                        made an offer to <Text style={styles.offerUsernameBold}>{isOfferFromCurrentUser ? (conversation?.seller_name || 'the seller') : 'you'}</Text>:
                                    </Text>
                                    <Text style={styles.offerAmountBoldRight}>{currencySymbol}{item.amount}</Text>
                                </View>

                                {isOfferFromCurrentUser ? (
                                    <Text style={styles.offerContextText}>
                                        Your offer shall be Accepted, or Declined.
                                    </Text>
                                ) : null}

                                {isCurrentUserSeller && !isOfferFromCurrentUser && (
                                    <View style={styles.offerActionContainer}>
                                        <Text style={styles.offerRespondLabel}>Respond</Text>
                                        <View style={styles.offerButtonsRow}>
                                            <TouchableOpacity
                                                style={[styles.offerDeclineBtn, sending && styles.offerBtnDisabled]}
                                                onPress={() => handleRespondToOffer(item.offer_id, 'reject')}
                                                disabled={sending}
                                            >
                                                <Text style={styles.offerDeclineBtnText}>Decline</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.offerAcceptBtn, sending && styles.offerBtnDisabled]}
                                                onPress={() => handleRespondToOffer(item.offer_id, 'accept')}
                                                disabled={sending}
                                            >
                                                <Text style={styles.offerAcceptBtnText}>Accept</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}

                        {item.status === 'accepted' && (
                            <View style={styles.offerCardInnerBordered}>
                                <Text style={styles.offerHeadline}>Offer Accepted for {currencySymbol}{item.amount}</Text>
                                <Text style={styles.offerResolvedSubTitle}>
                                    <Text style={styles.offerUsernameBold}>{isOfferFromCurrentUser ? (conversation?.seller_name || 'The seller') : 'You'}</Text> accepted <Text style={styles.offerUsernameBold}>{item.sender_name}</Text> offer.
                                </Text>
                                <Text style={styles.offerResolvedNote}>
                                    It has priority, until inspection and decision, for 3 days.
                                </Text>
                            </View>
                        )}

                        {item.status === 'rejected' && (
                            <View style={styles.offerCardInnerBordered}>
                                <Text style={styles.offerHeadline}>Offer Declined for {currencySymbol}{item.amount}</Text>
                                <Text style={styles.offerResolvedSubTitle}>
                                    <Text style={styles.offerUsernameBold}>{isOfferFromCurrentUser ? (conversation?.seller_name || 'The seller') : 'You'}</Text> declined <Text style={styles.offerUsernameBold}>{item.sender_name}</Text> offer.
                                </Text>
                                <Text style={styles.offerResolvedNote}>
                                    Try negotiating the price or offering more!
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            );
        }

        // NEW UI REQUIREMENT: No grey chat bubbles, larger text, larger avatars
        const isProductUpdateLink = item.message === '[PRODUCT_IMAGES_UPDATE]';

        let imageLinks = null;
        if (isProductUpdateLink) {
            try {
                if (conversation?.advertisement_images) {
                    imageLinks = JSON.parse(conversation.advertisement_images);
                    if (!Array.isArray(imageLinks)) imageLinks = [imageLinks];
                }
            } catch (e) { }
        } else if (item.message) {
            const trimmedMessage = item.message.trim();
            const urlRegex = /(https?:\/\/[^\s,]+)/gi;
            const matches = trimmedMessage.match(urlRegex);
            if (matches && matches.length > 0) {
                // Check if the message is *only* URLs (ignoring spaces and commas)
                const textWithoutUrls = trimmedMessage.replace(urlRegex, '').replace(/[\s,]+/g, '');
                if (textWithoutUrls.length === 0) {
                    // Make sure they look like images (heuristic)
                    const isAllImages = matches.every(url => url.match(/\.(jpeg|jpg|gif|png|webp|heic)(\?.*)?$/i) || url.includes('cloudinary') || url.includes('firebasestorage'));
                    // If we can't be sure, we'll try to render them anyway if the string is ONLY urls
                    imageLinks = matches;
                }
            }
        }

        const renderImageGrid = (images) => {
            if (!images || images.length === 0) return null;

            const handlePress = () => {
                navigation.navigate('ProductImageGalleryScreen', {
                    advertisementId: advertisementId || conversation?.advertisement_id,
                    images: images
                });
            };

            if (images.length === 1) {
                return (
                    <TouchableOpacity style={styles.imageGridSingle} onPress={handlePress}>
                        <Image source={{ uri: getFullImageUrl(images[0]) }} style={styles.imageGridItemFull} resizeMode="cover" />
                    </TouchableOpacity>
                );
            } else if (images.length === 2) {
                return (
                    <TouchableOpacity style={[styles.imageGridDouble, { flexDirection: 'row', gap: 4 }]} onPress={handlePress}>
                        <Image source={{ uri: getFullImageUrl(images[0]) }} style={styles.imageGridItemHalf} resizeMode="cover" />
                        <Image source={{ uri: getFullImageUrl(images[1]) }} style={styles.imageGridItemHalf} resizeMode="cover" />
                    </TouchableOpacity>
                );
            } else if (images.length === 3) {
                return (
                    <TouchableOpacity style={[styles.imageGridTriple, { gap: 4 }]} onPress={handlePress}>
                        <View style={{ flexDirection: 'row', gap: 4, height: 120 }}>
                            <Image source={{ uri: getFullImageUrl(images[0]) }} style={styles.imageGridItemHalf} resizeMode="cover" />
                            <Image source={{ uri: getFullImageUrl(images[1]) }} style={styles.imageGridItemHalf} resizeMode="cover" />
                        </View>
                        <Image source={{ uri: getFullImageUrl(images[2]) }} style={[styles.imageGridItemFull, { height: 120 }]} resizeMode="cover" />
                    </TouchableOpacity>
                );
            } else {
                // 4 or more
                const remainingCount = images.length - 4;
                return (
                    <TouchableOpacity style={[styles.imageGridQuad, { gap: 4 }]} onPress={handlePress}>
                        <View style={{ flexDirection: 'row', gap: 4, height: 120 }}>
                            <Image source={{ uri: getFullImageUrl(images[0]) }} style={styles.imageGridItemHalf} resizeMode="cover" />
                            <Image source={{ uri: getFullImageUrl(images[1]) }} style={styles.imageGridItemHalf} resizeMode="cover" />
                        </View>
                        <View style={{ flexDirection: 'row', gap: 4, height: 120 }}>
                            <Image source={{ uri: getFullImageUrl(images[2]) }} style={styles.imageGridItemHalf} resizeMode="cover" />
                            <View style={[styles.imageGridItemHalf, { position: 'relative' }]}>
                                <Image source={{ uri: getFullImageUrl(images[3]) }} style={{ width: '100%', height: '100%', borderRadius: 8 }} resizeMode="cover" />
                                {remainingCount > 0 && (
                                    <View style={styles.imageGridOverlay}>
                                        <Text style={styles.imageGridOverlayText}>+{remainingCount}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            }
        };

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
                    {imageLinks && imageLinks.length > 0 ? (
                        <View style={styles.imageGalleryPreviewContainer}>
                            {isProductUpdateLink && <Text style={styles.galleryPreviewLabel}>Product Images Updated</Text>}
                            {renderImageGrid(imageLinks)}
                        </View>
                    ) : (
                        <Text style={styles.messageText}>{item.message}</Text>
                    )}
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
                    <Text style={[styles.headerTitle, { fontSize: 22, fontWeight: 'bold' }]}>Chat: {title || conversation?.advertisement_title || 'Enquiry'}</Text>
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

                        {/* Date Divider & Offer History Link */}
                        <View style={styles.dateDivider}>
                            <Text style={styles.dateText}>12 October 2025</Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('OfferHistory', {
                                    advertisementId: conversation?.advertisement_id,
                                    advertisementTitle: title || conversation?.advertisement_title
                                })}
                            >
                                <Text style={styles.offerHistoryText}>Offer history</Text>
                            </TouchableOpacity>
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
                            <View style={styles.inputContainer}>
                                {isCurrentUserSeller && (
                                    <TouchableOpacity
                                        style={styles.cameraButton}
                                        onPress={handleSelectImage}
                                        disabled={sending}
                                    >
                                        <Ionicons name="camera-outline" size={24} color="#666" />
                                    </TouchableOpacity>
                                )}
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

                            <View style={styles.warningContainer}>
                                <Text style={styles.warningText}>
                                    Stay safe in RoundBuy. Don't share personal data, click on external links, or scan codes.
                                    <Text style={styles.warningLink} onPress={() => setChatRestrictionsModalVisible(true)}> Read more on Safety Guidelines</Text>
                                </Text>
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
        padding: 12,
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    topBarImage: {
        width: 100,
        height: 120,
        borderRadius: 4,
        backgroundColor: '#f5f5f5',
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
        marginBottom: 2,
    },
    offerFormContainer: {
        marginTop: 2,
    },
    offerInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
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
        gap: 8, // For react-native 0.71+
    },
    offerBtnHalf: {
        backgroundColor: '#f5f5f5',
        flex: 1,
        paddingVertical: 10,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    offerBtnTextBlack: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    buyBtnHalf: {
        backgroundColor: '#001C64', // Dark blue from the screenshot
        flex: 1,
        paddingVertical: 10,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buyBtnTextWhite: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    makeOfferBtnDisabled: {
        opacity: 0.5,
    },
    dateDivider: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    dateText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    offerHistoryText: {
        fontSize: 14,
        color: '#0066FF',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
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
    galleryLinkButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    galleryLinkText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    bottomSection: {
        padding: 16,
        paddingTop: 8,
        backgroundColor: '#fff',
    },
    warningContainer: {
        marginTop: 12,
    },
    warningText: {
        fontSize: 11,
        color: '#666',
        lineHeight: 16,
        textAlign: 'center',
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
        paddingVertical: 4,
    },
    input: {
        flex: 1,
        fontSize: 16,
        minHeight: 40,
        maxHeight: 100,
        color: '#000',
    },
    cameraButton: {
        padding: 8,
        marginRight: 4,
    },
    sendButton: {
        padding: 8,
        marginLeft: 8,
    },
    offerCardInner: {
        width: '100%',
    },
    offerCardInnerBordered: {
        width: '100%',
        marginTop: 2,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 8,
        borderWidth: 1,
        borderColor: '#cececeff',
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
        marginBottom: 8,
    },
    offerTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    offerActionText: {
        fontSize: 14,
        color: '#000',
        flex: 1,
    },
    offerUsernameBold: {
        fontWeight: 'bold',
    },
    offerAmountBoldRight: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#000',
        marginLeft: 8,
    },
    offerActionContainer: {
        marginTop: 16,
    },
    offerRespondLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 12,
    },
    offerButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    offerDeclineBtn: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 24,
        paddingVertical: 12,
        alignItems: 'center',
    },
    offerDeclineBtnText: {
        fontSize: 16,
        color: '#000',
        fontWeight: 'bold',
    },
    offerAcceptBtn: {
        flex: 1,
        backgroundColor: '#001C64', // Dark blue
        borderRadius: 24,
        paddingVertical: 12,
        alignItems: 'center',
    },
    offerAcceptBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    offerBtnDisabled: {
        opacity: 0.5,
    },
    offerResolvedContainer: {
        marginTop: 8,
    },
    offerResolvedTitle: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    offerResolvedSubTitle: {
        color: '#666',
        fontSize: 14,
        marginBottom: 4,
    },
    offerResolvedNote: {
        color: '#999',
        fontSize: 12,
        fontStyle: 'italic',
    },
    imageGalleryPreviewContainer: {
        marginTop: 8,
    },
    galleryPreviewLabel: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 6,
    },
    galleryPreviewTouchable: {
        width: 200,
        height: 150,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
    },
    galleryPreviewImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f5f5f5',
    },
    galleryPreviewOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    galleryPreviewOverlayText: {
        color: '#fff',
        fontWeight: 'bold',
        marginTop: 4,
    },
    imageGridSingle: {
        width: 280,
        height: 240,
        borderRadius: 8,
        overflow: 'hidden',
    },
    imageGridItemFull: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
    },
    imageGridDouble: {
        width: 280,
    },
    imageGridTriple: {
        width: 280,
    },
    imageGridQuad: {
        width: 280,
    },
    imageGridItemHalf: {
        flex: 1,
        height: '100%',
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
    },
    imageGridOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    imageGridOverlayText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    }
});

export default Step1EnquiryScreen;
