import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import GlobalHeader from '../../../components/GlobalHeader';

const BillingPaymentsScreen = ({ navigation }) => {
  const [savedCards, setSavedCards] = useState([
    {
      id: 1,
      lastFour: '3251',
      expiryMonth: '12',
      expiryYear: '25',
      country: 'United Kingdom',
      zip: '',
    },
  ]); // Empty array means no saved cards
  const [showAddCard, setShowAddCard] = useState(false);
  const [saveCard, setSaveCard] = useState(false);

  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    country: 'United Kingdom',
    zip: '',
  });

  const handleBack = () => {
    if (showAddCard) {
      setShowAddCard(false);
    } else {
      navigation.goBack();
    }
  };

  const handleRemoveCard = (cardId) => {
    setSavedCards(savedCards.filter(card => card.id !== cardId));
  };

  const handleAddNewCard = () => {
    setShowAddCard(true);
  };

  const handleContinue = () => {
    // Save card logic
    console.log('Saving new card:', newCard);
    if (saveCard) {
      const newCardData = {
        id: Date.now(),
        lastFour: newCard.cardNumber.slice(-4),
        expiryMonth: newCard.expiryDate.split('/')[0],
        expiryYear: newCard.expiryDate.split('/')[1],
        country: newCard.country,
        zip: newCard.zip,
      };
      setSavedCards([...savedCards, newCardData]);
    }
    setShowAddCard(false);
    setNewCard({
      cardNumber: '',
      expiryDate: '',
      cvc: '',
      country: 'United Kingdom',
      zip: '',
    });
  };

  const renderSavedCard = (card) => (
    <View key={card.id} style={styles.savedCardContainer}>
      <Text style={styles.sectionTitle}>My Payment method</Text>

      <View style={styles.cardInfo}>
        <Text style={styles.label}>Card information</Text>
        <View style={styles.cardNumberRow}>
          <Text style={styles.cardNumber}>xxx xxxx xxxx {card.lastFour}</Text>
          <FontAwesome name="credit-card" size={20} color="#666" />
        </View>

        <View style={styles.expiryRow}>
          <View style={styles.expiryField}>
            <Text style={styles.fieldLabel}>Expiry date</Text>
            <Text style={styles.fieldValue}>{card.expiryMonth}/{card.expiryYear}</Text>
          </View>
          <View style={styles.cvcField}>
            <Text style={styles.fieldLabel}>CVC</Text>
            <Text style={styles.fieldValue}>xxx</Text>
          </View>
        </View>
      </View>

      <View style={styles.countrySection}>
        <Text style={styles.label}>Country or region</Text>
        <Text style={styles.countryValue}>{card.country}</Text>
      </View>

      <View style={styles.zipSection}>
        <Text style={styles.label}>ZIP</Text>
        <TextInput
          style={styles.zipInput}
          value={card.zip}
          placeholder="Enter ZIP"
          placeholderTextColor="#999"
          editable={false}
        />
      </View>

      <Text style={styles.savedNotice}>
        This card has been saved for future RoundBuy payments
      </Text>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveCard(card.id)}
      >
        <Text style={styles.removeButtonText}>Remove Card</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.addNewButton}
        onPress={handleAddNewCard}
      >
        <Text style={styles.addNewButtonText}>+ Add New Card</Text>
      </TouchableOpacity>
    </View>
  );

  const renderNoCards = () => (
    <View style={styles.noCardsContainer}>
      <Text style={styles.sectionTitle}>My Payment method</Text>

      <View style={styles.cardInfo}>
        <Text style={styles.label}>Card information</Text>
        <View style={styles.noneSelected}>
          <Text style={styles.noneSelectedText}>None selected!</Text>
        </View>
      </View>

      <View style={styles.countrySection}>
        <Text style={styles.label}>Country or region</Text>
        <Text style={styles.countryValue}>United Kingdom</Text>
      </View>

      <View style={styles.zipSection}>
        <Text style={styles.label}>ZIP</Text>
        <TextInput
          style={styles.zipInput}
          placeholder="Enter ZIP"
          placeholderTextColor="#999"
          editable={false}
        />
      </View>

      <Text style={styles.noCardsNotice}>
        You don't have any cards saved
      </Text>

      <TouchableOpacity
        style={styles.addNewButtonPrimary}
        onPress={handleAddNewCard}
      >
        <Text style={styles.addNewButtonPrimaryText}>+ Add New Card</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAddCard = () => (
    <View style={styles.addCardContainer}>
      <Text style={styles.sectionTitle}>Choose a payment method</Text>

      {/* Google Pay */}
      <TouchableOpacity style={styles.googlePayButton}>
        <Image
          source={{ uri: 'https://www.gstatic.com/images/branding/googlelogo/1x/googlelogo_color_74x24dp.png' }}
          style={styles.googlePayIcon}
          resizeMode="contain"
        />
        <Text style={styles.googlePayText}>Pay</Text>
      </TouchableOpacity>

      <Text style={styles.orPayText}>Or pay using</Text>

      {/* Payment Icons */}
      <View style={styles.paymentIcons}>
        <View style={styles.paymentIcon}>
          <FontAwesome name="credit-card" size={24} color="#000" />
        </View>
        <View style={styles.paymentIcon}>
          <FontAwesome name="cc-mastercard" size={24} color="#EB001B" />
        </View>
        <View style={styles.paymentIcon}>
          <FontAwesome name="cc-visa" size={24} color="#1A1F71" />
        </View>
        <View style={styles.paymentIcon} />
      </View>

      {/* Card Form */}
      <View style={styles.cardInfo}>
        <Text style={styles.label}>Card information</Text>
        <View style={styles.cardNumberRow}>
          <TextInput
            style={styles.cardInput}
            placeholder="Card number"
            placeholderTextColor="#999"
            value={newCard.cardNumber}
            onChangeText={(text) => setNewCard({ ...newCard, cardNumber: text })}
            keyboardType="numeric"
            maxLength={19}
          />
          <FontAwesome name="credit-card" size={20} color="#666" />
        </View>

        <View style={styles.expiryRow}>
          <TextInput
            style={[styles.cardInput, styles.expiryInput]}
            placeholder="MM/YY"
            placeholderTextColor="#999"
            value={newCard.expiryDate}
            onChangeText={(text) => setNewCard({ ...newCard, expiryDate: text })}
            maxLength={5}
          />
          <TextInput
            style={[styles.cardInput, styles.cvcInput]}
            placeholder="CVC"
            placeholderTextColor="#999"
            value={newCard.cvc}
            onChangeText={(text) => setNewCard({ ...newCard, cvc: text })}
            keyboardType="numeric"
            maxLength={4}
          />
        </View>
      </View>

      <View style={styles.countrySection}>
        <Text style={styles.label}>Country or region</Text>
        <Text style={styles.countryValue}>{newCard.country}</Text>
      </View>

      <View style={styles.zipSection}>
        <Text style={styles.label}>ZIP</Text>
        <TextInput
          style={styles.zipInput}
          value={newCard.zip}
          onChangeText={(text) => setNewCard({ ...newCard, zip: text })}
          placeholder="Enter ZIP"
          placeholderTextColor="#999"
        />
      </View>

      <TouchableOpacity
        style={styles.saveCheckbox}
        onPress={() => setSaveCard(!saveCard)}
      >
        <View style={[styles.checkbox, saveCard && styles.checkboxChecked]}>
          {saveCard && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
        <Text style={styles.checkboxLabel}>
          Save for future RoundBuy payments
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={handleContinue}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader
        title={showAddCard ? 'Choose a payment method' : 'Billing & Payments'}
        navigation={navigation}
        showBackButton={true}
        showIcons={true}
        onBackPress={handleBack}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {showAddCard ? renderAddCard() : (
          savedCards.length > 0 ? savedCards.map(renderSavedCard) : renderNoCards()
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  savedCardContainer: {
    marginBottom: 20,
  },
  noCardsContainer: {
    marginBottom: 20,
  },
  addCardContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 16,
  },
  cardInfo: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  cardNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  cardNumber: {
    flex: 1,
    fontSize: 15,
    color: '#000',
  },
  cardInput: {
    flex: 1,
    fontSize: 15,
    color: '#000',
  },
  expiryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  expiryField: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cvcField: {
    width: 100,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  expiryInput: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cvcInput: {
    width: 100,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 15,
    color: '#000',
  },
  countrySection: {
    marginBottom: 20,
  },
  countryValue: {
    fontSize: 15,
    color: '#000',
    paddingVertical: 12,
  },
  zipSection: {
    marginBottom: 20,
  },
  zipInput: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#000',
  },
  savedNotice: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
  },
  noCardsNotice: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  removeButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  addNewButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addNewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  addNewButtonPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addNewButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  noneSelected: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingVertical: 40,
    alignItems: 'center',
  },
  noneSelectedText: {
    fontSize: 15,
    color: '#999',
  },
  googlePayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 16,
  },
  googlePayIcon: {
    width: 50,
    height: 20,
    marginRight: 4,
  },
  googlePayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  orPayText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  paymentIcons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  paymentIcon: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d0d0d0',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default BillingPaymentsScreen;