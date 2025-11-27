import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const ProductChatScreen = ({ route, navigation }) => {
  const { product, mode } = route?.params || {};
  const [message, setMessage] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [showOfferInput, setShowOfferInput] = useState(mode === 'makeOffer');
  const scrollViewRef = useRef(null);

  // Mock chat messages - replace with actual data
  const [messages, setMessages] = useState([
    {
      id: 1,
      userId: 'jonnmk85598',
      username: 'jonnmk85598',
      text: 'I like the chair! 😊❤️ Is it sturdy?',
      timestamp: '12:51',
      isCurrentUser: false,
    },
    {
      id: 2,
      userId: 'susanSmit',
      username: 'susanSmit',
      text: 'It is very sturdy!',
      timestamp: '12:52',
      isCurrentUser: true,
    },
    {
      id: 3,
      userId: 'jonnmk85598',
      username: 'jonnmk85598',
      text: 'I am ready to make an offer. Here it is.',
      timestamp: '12:54',
      isCurrentUser: false,
    },
  ]);

  // Offer status - can be: null, 'pending', 'accepted', 'declined'
  const [offerStatus, setOfferStatus] = useState(null);
  const [currentOffer, setCurrentOffer] = useState(null);

  const productData = product || {
    title: 'Wooden Chair',
    price: '£300',
    distance: '26.2m / 15 km walk',
    image: IMAGES.chair1,
    seller: {
      username: 'susanSmit',
    },
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now(),
        userId: 'currentUser',
        username: 'You',
        text: message,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        isCurrentUser: true,
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Scroll to bottom after sending message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleMakeOffer = () => {
    if (offerAmount.trim()) {
      setCurrentOffer(offerAmount);
      setOfferStatus('pending');
      setShowOfferInput(false);
      
      const offerMessage = {
        id: Date.now(),
        type: 'offer',
        amount: offerAmount,
        status: 'pending',
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      };
      
      setMessages([...messages, offerMessage]);
      setOfferAmount('');
    }
  };

  const handleAcceptOffer = () => {
    setOfferStatus('accepted');
  };

  const handleDeclineOffer = () => {
    setOfferStatus('declined');
  };

  const renderMessage = ({ item }) => {
    // Render offer message
    if (item.type === 'offer') {
      return (
        <View style={styles.offerMessageContainer}>
          <View style={styles.offerCard}>
            <Text style={styles.offerSuccessText}>An offer made successfully!</Text>
            <View style={styles.offerDetails}>
              <Text style={styles.offerUsername}>jonnmk85598</Text>
              <Text style={styles.offerText}>has made an offer for</Text>
              <Text style={styles.offerAmount}>{item.amount}</Text>
            </View>
            
            {offerStatus === 'accepted' && (
              <View style={styles.acceptedContainer}>
                <Text style={styles.acceptedTitle}>Accepted for {item.amount}</Text>
                <Text style={styles.acceptedSubtext}>
                  Now schedule a Pick up Exchange!
                </Text>
                <Text style={styles.acceptedDescription}>
                  Arrange a meet up with the seller want to inspect the product immediately.
                </Text>
                <TouchableOpacity style={styles.scheduleButton}>
                  <Text style={styles.scheduleButtonText}>Schedule a Pick Up</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {offerStatus === 'declined' && (
              <View style={styles.declinedContainer}>
                <Text style={styles.declinedText}>Declined</Text>
                <Text style={styles.declinedSubtext}>
                  Apologies! Declined Just few days from the Design and share you-
                </Text>
              </View>
            )}
            
            {offerStatus === 'pending' && (
              <View style={styles.offerActions}>
                <Text style={styles.offerActionText}>
                  susanSmit will either Accept, Decline or Make an offer to you.
                </Text>
                <View style={styles.offerButtonsRow}>
                  <TouchableOpacity 
                    style={styles.declineButton}
                    onPress={handleDeclineOffer}
                  >
                    <Text style={styles.declineButtonText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.acceptButton}
                    onPress={handleAcceptOffer}
                  >
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.makeOfferLink}>
                  <Text style={styles.makeOfferLinkText}>Make an Offer</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      );
    }

    // Render regular message
    return (
      <View
        style={[
          styles.messageContainer,
          item.isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
        ]}
      >
        <View style={styles.messageHeader}>
          <View style={styles.avatarContainer}>
            <FontAwesome name="user-circle" size={24} color="#666" />
          </View>
          <View style={styles.messageContent}>
            <View style={styles.messageTop}>
              <Text style={styles.username}>{item.username}</Text>
              <Text style={styles.timestamp}>{item.timestamp}</Text>
            </View>
            <Text style={styles.messageText}>{item.text}</Text>
            {!item.isCurrentUser && (
              <View style={styles.reactionContainer}>
                <Text style={styles.reactionText}>❤️ Is it sturdy?</Text>
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
          <Text style={styles.headerTitle}>Product Chat: {productData.title}</Text>
        </View>

        {/* Product Info Card */}
        <View style={styles.productCard}>
          <Image source={productData.image} style={styles.productImage} />
          <View style={styles.productInfo}>
            <View style={styles.productHeader}>
              <Text style={styles.productTitle}>{productData.title}</Text>
              <Text style={styles.productPrice}>{productData.price}</Text>
            </View>
            <Text style={styles.productDistance}>
              Distance: {productData.distance}
            </Text>
            <View style={styles.offerPriceContainer}>
              <TextInput
                style={styles.offerPriceInput}
                placeholder="£ 0.00"
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

        <Text style={styles.dateHeader}>12 October 2025</Text>

        {/* Messages List */}
        <FlatList
          ref={scrollViewRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        />

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
              placeholder="Enter offer amount (e.g., £250.00)"
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
            placeholder="Send a message"
            placeholderTextColor="#999"
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Ionicons name="send" size={24} color={COLORS.primary} />
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
});

export default ProductChatScreen;