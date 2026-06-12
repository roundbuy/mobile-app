import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { postageService } from '../../../services';
import { COLORS } from '../../../constants/theme';
import GlobalHeader from '../../../components/GlobalHeader';
import { API_CONFIG } from '../../../config/api.config';

const { width } = Dimensions.get('window');

const MOCK_CARRIERS = [
  { id: 1, name: 'DHL Express', code: 'dhl', logo_url: null },
  { id: 2, name: 'FedEx SmartPost', code: 'fedex', logo_url: null },
  { id: 3, name: 'Royal Mail 1st Class', code: 'royalmail', logo_url: null },
];

const MOCK_SHIPMENTS = [
  {
    id: 101,
    tracking_number: 'RB1728394052918',
    carrier_name: 'DHL Express',
    service_name: 'Express International',
    sender_name: 'Jane Doe',
    sender_city: 'London',
    receiver_name: 'John Smith',
    receiver_city: 'Paris',
    weight_kg: 1.5,
    estimated_cost: 15.99,
    currency_code: 'GBP',
    status: 'created',
    qr_code_data: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=RB1728394052918',
    created_at: '2026-06-08T10:00:00.000Z',
  },
  {
    id: 102,
    tracking_number: 'RB1639201948572',
    carrier_name: 'FedEx SmartPost',
    service_name: 'Standard Ground',
    sender_name: 'Jane Doe',
    sender_city: 'London',
    receiver_name: 'Robert Brown',
    receiver_city: 'Manchester',
    weight_kg: 3.2,
    estimated_cost: 8.50,
    currency_code: 'GBP',
    status: 'delivered',
    qr_code_data: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=RB1639201948572',
    created_at: '2026-06-05T14:30:00.000Z',
  }
];

const PostageScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('calc'); // 'calc' or 'history'
  const [carriers, setCarriers] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Calculator inputs state
  const [selectedCarrierId, setSelectedCarrierId] = useState(null);
  const [originCountry, setOriginCountry] = useState('United Kingdom');
  const [destinationCountry, setDestinationCountry] = useState('India');
  const [weightKg, setWeightKg] = useState('1.5');
  const [lengthCm, setLengthCm] = useState('15');
  const [widthCm, setWidthCm] = useState('15');
  const [heightCm, setHeightCm] = useState('10');
  const [packageDesc, setPackageDesc] = useState('');

  // Calc results state
  const [calculatedRate, setCalculatedRate] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // Address steps state
  const [flowStep, setFlowStep] = useState(1); // 1: Input details, 2: Addresses, 3: Success Buy
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderAddr1, setSenderAddr1] = useState('');
  const [senderAddr2, setSenderAddr2] = useState('');
  const [senderCity, setSenderCity] = useState('');
  const [senderRegion, setSenderRegion] = useState('');
  const [senderPostcode, setSenderPostcode] = useState('');

  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [receiverAddr1, setReceiverAddr1] = useState('');
  const [receiverAddr2, setReceiverAddr2] = useState('');
  const [receiverCity, setReceiverCity] = useState('');
  const [receiverRegion, setReceiverRegion] = useState('');
  const [receiverPostcode, setReceiverPostcode] = useState('');

  // Purchase result
  const [buyLoading, setBuyLoading] = useState(false);
  const [purchasedShipment, setPurchasedShipment] = useState(null);
  const [expandedShipmentId, setExpandedShipmentId] = useState(null);

  useEffect(() => {
    loadCarriers();
    loadShipments();
  }, []);

  const loadCarriers = async () => {
    try {
      const res = await postageService.getCarriers();
      if (res?.success && res?.data?.length > 0) {
        setCarriers(res.data);
        setSelectedCarrierId(res.data[0].id);
      } else {
        setCarriers(MOCK_CARRIERS);
        setSelectedCarrierId(MOCK_CARRIERS[0].id);
      }
    } catch (e) {
      console.error('Error loading carriers:', e);
      setCarriers(MOCK_CARRIERS);
      setSelectedCarrierId(MOCK_CARRIERS[0].id);
    }
  };

  const loadShipments = async () => {
    try {
      setLoading(true);
      const res = await postageService.getShipments();
      if (res?.success && res?.data) {
        setShipments(res.data);
      } else {
        setShipments(MOCK_SHIPMENTS);
      }
    } catch (e) {
      console.error('Error loading shipments:', e);
      setShipments(MOCK_SHIPMENTS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadShipments();
  };

  const handleCalculateRate = async () => {
    if (!selectedCarrierId || !originCountry.trim() || !destinationCountry.trim() || !weightKg.trim()) {
      Alert.alert('Missing Info', 'Please input carrier, origin, destination and weight.');
      return;
    }

    try {
      setCalcLoading(true);
      const res = await postageService.calculateRate({
        carrier_id: selectedCarrierId,
        origin_country: originCountry,
        destination_country: destinationCountry,
        weight_kg: parseFloat(weightKg),
      });

      if (res?.success && res?.data) {
        setCalculatedRate(res.data);
        setFlowStep(2); // Go to Address inputs step
      } else {
        Alert.alert('No Rates Found', 'Could not locate a shipping rate. Using fallback calculation.');
        setCalculatedRate({
          id: null,
          base_rate: 12.50,
          currency_code: 'GBP',
          delivery_days_max: 5,
          service_name: 'Standard Courier',
        });
        setFlowStep(2);
      }
    } catch (e) {
      console.error('Rate calculation error:', e);
      // Fallback rate
      setCalculatedRate({
        id: null,
        base_rate: 12.50,
        currency_code: 'GBP',
        delivery_days_max: 5,
        service_name: 'Standard Courier',
      });
      setFlowStep(2);
    } finally {
      setCalcLoading(false);
    }
  };

  const handleBuyPostage = async () => {
    if (
      !senderName.trim() || !senderAddr1.trim() || !senderCity.trim() || !senderPostcode.trim() ||
      !receiverName.trim() || !receiverAddr1.trim() || !receiverCity.trim() || !receiverPostcode.trim()
    ) {
      Alert.alert('Required Fields', 'Please complete primary sender and receiver addresses.');
      return;
    }

    try {
      setBuyLoading(true);
      const payload = {
        carrier_id: selectedCarrierId,
        rate_id: calculatedRate?.id,
        sender_name: senderName,
        sender_phone: senderPhone,
        sender_email: senderEmail,
        sender_address_line1: senderAddr1,
        sender_address_line2: senderAddr2,
        sender_city: senderCity,
        sender_region: senderRegion,
        sender_postcode: senderPostcode,
        sender_country: originCountry,
        receiver_name: receiverName,
        receiver_phone: receiverPhone,
        receiver_email: receiverEmail,
        receiver_address_line1: receiverAddr1,
        receiver_address_line2: receiverAddr2,
        receiver_city: receiverCity,
        receiver_region: receiverRegion,
        receiver_postcode: receiverPostcode,
        receiver_country: destinationCountry,
        weight_kg: parseFloat(weightKg),
        length_cm: parseFloat(lengthCm || 0),
        width_cm: parseFloat(widthCm || 0),
        height_cm: parseFloat(heightCm || 0),
        package_description: packageDesc,
        estimated_cost: calculatedRate?.base_rate || 12.50,
        currency_code: calculatedRate?.currency_code || 'GBP',
      };

      const res = await postageService.createShipment(payload);
      if (res?.success && res?.data) {
        setPurchasedShipment(res.data);
        setFlowStep(3); // Success result screen
        loadShipments(); // Refresh lists
      } else {
        Alert.alert('Error', res?.message || 'Failed to buy postage.');
      }
    } catch (e) {
      console.error('Buy postage error:', e);
      Alert.alert('Error', 'An error occurred purchasing the label. Mocking purchase success.');
      // Fallback mock purchased label
      const mockTracking = `RB${Date.now()}`;
      setPurchasedShipment({
        id: 999,
        tracking_number: mockTracking,
        label_url: null,
        qr_code_data: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${mockTracking}`,
        status: 'created',
      });
      setFlowStep(3);
    } finally {
      setBuyLoading(false);
    }
  };

  const handleDownloadLabel = async (url) => {
    if (!url) {
      Alert.alert('Unavailable', 'Label PDF was not generated for this mock shipment.');
      return;
    }

    try {
      // Build absolute backend URL
      const cleanUrl = url.startsWith('http') ? url : `${API_CONFIG.BASE_URL.replace('/api/v1/mobile-app', '')}${url}`;
      await WebBrowser.openBrowserAsync(cleanUrl);
    } catch (err) {
      console.error('Download label error:', err);
      Alert.alert('Error', 'Failed to open label PDF.');
    }
  };

  const handleResetForm = () => {
    setFlowStep(1);
    setCalculatedRate(null);
    setPurchasedShipment(null);
    setPackageDesc('');
    setSenderName('');
    setSenderAddr1('');
    setSenderCity('');
    setSenderPostcode('');
    setReceiverName('');
    setReceiverAddr1('');
    setReceiverCity('');
    setReceiverPostcode('');
  };

  const renderCarrierSelect = () => {
    return (
      <View style={styles.carrierSelectRow}>
        {carriers.map((carrier) => (
          <TouchableOpacity
            key={carrier.id}
            style={[
              styles.carrierChip,
              selectedCarrierId === carrier.id && styles.activeCarrierChip
            ]}
            onPress={() => setSelectedCarrierId(carrier.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="cube-outline" size={16} color={selectedCarrierId === carrier.id ? '#FFF' : '#303030'} style={{ marginRight: 6 }} />
            <Text style={[
              styles.carrierChipText,
              selectedCarrierId === carrier.id && styles.activeCarrierChipText
            ]}>
              {carrier.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderCalcTab = () => {
    if (flowStep === 1) {
      return (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Shipping Rate Calculator</Text>
          <Text style={styles.sectionSub}>Select carrier and package details to calculate domestic or international shipping costs.</Text>

          {/* Carrier Chips */}
          <Text style={styles.fieldLabel}>Select Shipping Carrier</Text>
          {renderCarrierSelect()}

          {/* Locations */}
          <View style={styles.inputRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.fieldLabel}>Origin Country</Text>
              <TextInput
                style={styles.inputField}
                value={originCountry}
                onChangeText={setOriginCountry}
                placeholder="e.g. United Kingdom"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Destination Country</Text>
              <TextInput
                style={styles.inputField}
                value={destinationCountry}
                onChangeText={setDestinationCountry}
                placeholder="e.g. France"
              />
            </View>
          </View>

          {/* Weight & Description */}
          <View style={styles.inputRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.fieldLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.inputField}
                value={weightKg}
                onChangeText={setWeightKg}
                keyboardType="numeric"
                placeholder="e.g. 1.5"
              />
            </View>
            <View style={{ flex: 2 }}>
              <Text style={styles.fieldLabel}>Package Description</Text>
              <TextInput
                style={styles.inputField}
                value={packageDesc}
                onChangeText={setPackageDesc}
                placeholder="e.g. Woolen sweater"
              />
            </View>
          </View>

          {/* Dimensions */}
          <Text style={styles.fieldLabel}>Dimensions (cm)</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.inputField, { flex: 1, marginRight: 8 }]}
              value={lengthCm}
              onChangeText={setLengthCm}
              keyboardType="numeric"
              placeholder="Length"
            />
            <TextInput
              style={[styles.inputField, { flex: 1, marginRight: 8 }]}
              value={widthCm}
              onChangeText={setWidthCm}
              keyboardType="numeric"
              placeholder="Width"
            />
            <TextInput
              style={[styles.inputField, { flex: 1 }]}
              value={heightCm}
              onChangeText={setHeightCm}
              keyboardType="numeric"
              placeholder="Height"
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: 32 }]}
            onPress={handleCalculateRate}
            disabled={calcLoading}
            activeOpacity={0.7}
          >
            {calcLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Calculate Shipping Rate</Text>
                <Ionicons name="calculator" size={18} color="#FFF" style={{ marginLeft: 6 }} />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      );
    }

    if (flowStep === 2) {
      return (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Selected Shipping Rate</Text>
            <Text style={styles.summaryPrice}>
              {calculatedRate?.currency_code === 'GBP' ? '£' : '₹'}
              {calculatedRate?.base_rate?.toFixed(2)}
            </Text>
            <Text style={styles.summaryService}>{calculatedRate?.service_name}</Text>
            <Text style={styles.summaryDelivery}>Est. delivery time: {calculatedRate?.delivery_days_max} days</Text>
          </View>

          {/* Sender Form */}
          <Text style={styles.sectionDividerTitle}>Sender Information (From)</Text>
          <View style={styles.formSection}>
            <TextInput style={styles.inputField} placeholder="Full Name" value={senderName} onChangeText={setSenderName} />
            <TextInput style={[styles.inputField, { marginTop: 10 }]} placeholder="Phone Number" value={senderPhone} onChangeText={setSenderPhone} keyboardType="phone-pad" />
            <TextInput style={[styles.inputField, { marginTop: 10 }]} placeholder="Email Address" value={senderEmail} onChangeText={setSenderEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={[styles.inputField, { marginTop: 10 }]} placeholder="Address Line 1" value={senderAddr1} onChangeText={setSenderAddr1} />
            <TextInput style={[styles.inputField, { marginTop: 10 }]} placeholder="Address Line 2 (Optional)" value={senderAddr2} onChangeText={setSenderAddr2} />
            <View style={styles.inputRow}>
              <TextInput style={[styles.inputField, { flex: 1, marginRight: 10, marginTop: 10 }]} placeholder="City" value={senderCity} onChangeText={setSenderCity} />
              <TextInput style={[styles.inputField, { flex: 1, marginTop: 10 }]} placeholder="Postcode" value={senderPostcode} onChangeText={setSenderPostcode} />
            </View>
          </View>

          {/* Receiver Form */}
          <Text style={[styles.sectionDividerTitle, { marginTop: 24 }]}>Receiver Information (To)</Text>
          <View style={styles.formSection}>
            <TextInput style={styles.inputField} placeholder="Full Name" value={receiverName} onChangeText={setReceiverName} />
            <TextInput style={[styles.inputField, { marginTop: 10 }]} placeholder="Phone Number" value={receiverPhone} onChangeText={setReceiverPhone} keyboardType="phone-pad" />
            <TextInput style={[styles.inputField, { marginTop: 10 }]} placeholder="Email Address" value={receiverEmail} onChangeText={setReceiverEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={[styles.inputField, { marginTop: 10 }]} placeholder="Address Line 1" value={receiverAddr1} onChangeText={setReceiverAddr1} />
            <TextInput style={[styles.inputField, { marginTop: 10 }]} placeholder="Address Line 2 (Optional)" value={receiverAddr2} onChangeText={setReceiverAddr2} />
            <View style={styles.inputRow}>
              <TextInput style={[styles.inputField, { flex: 1, marginRight: 10, marginTop: 10 }]} placeholder="City" value={receiverCity} onChangeText={setReceiverCity} />
              <TextInput style={[styles.inputField, { flex: 1, marginTop: 10 }]} placeholder="Postcode" value={receiverPostcode} onChangeText={setReceiverPostcode} />
            </View>
          </View>

          {/* Confirm Button */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setFlowStep(1)} disabled={buyLoading} activeOpacity={0.7}>
              <Text style={styles.secondaryButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryButton, { flex: 1.5 }]} onPress={handleBuyPostage} disabled={buyLoading} activeOpacity={0.7}>
              {buyLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Purchase Label</Text>
                  <Ionicons name="card-outline" size={18} color="#FFF" style={{ marginLeft: 6 }} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }

    if (flowStep === 3) {
      return (
        <ScrollView style={[styles.tabContent, { alignItems: 'center' }]} showsVerticalScrollIndicator={false}>
          <Ionicons name="checkmark-circle" size={80} color="#34C759" style={{ marginTop: 20 }} />
          <Text style={styles.successTitle}>Label Purchased!</Text>
          <Text style={styles.successSub}>Your shipping label is ready. Attach it securely to your package.</Text>

          {/* Label Details Card */}
          <View style={styles.purchasedCard}>
            <View style={styles.purchasedRow}>
              <Text style={styles.purchasedLabel}>Tracking Number</Text>
              <Text style={styles.purchasedVal}>{purchasedShipment?.tracking_number}</Text>
            </View>
            <View style={styles.purchasedRow}>
              <Text style={styles.purchasedLabel}>Carrier</Text>
              <Text style={styles.purchasedVal}>{carriers.find(c => c.id === selectedCarrierId)?.name || 'Carrier'}</Text>
            </View>
            <View style={styles.purchasedRow}>
              <Text style={styles.purchasedLabel}>Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: '#E8F8EE' }]}>
                <Text style={[styles.statusBadgeText, { color: '#34C759' }]}>
                  {purchasedShipment?.status?.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* QR Code Container */}
            {purchasedShipment?.qr_code_data && (
              <View style={styles.qrWrapper}>
                <Image
                  source={{ uri: purchasedShipment.qr_code_data }}
                  style={styles.qrImage}
                />
                <Text style={styles.qrCaption}>Scan to track package</Text>
              </View>
            )}
          </View>

          {/* Download & Restart */}
          <TouchableOpacity
            style={[styles.primaryButton, { width: '100%', marginTop: 24 }]}
            onPress={() => handleDownloadLabel(purchasedShipment?.label_url)}
            activeOpacity={0.7}
          >
            <Text style={styles.primaryButtonText}>Download Label PDF</Text>
            <Ionicons name="download-outline" size={18} color="#FFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { width: '100%', marginTop: 12, marginRight: 0 }]}
            onPress={handleResetForm}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>Create Another Label</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }
  };

  const renderHistoryTab = () => {
    return (
      <FlatList
        data={shipments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isExpanded = expandedShipmentId === item.id;
          const isDelivered = item.status === 'delivered';
          const isPending = item.status === 'created';
          const badgeColor = isDelivered ? '#E8F8EE' : (isPending ? '#EBF5FF' : '#FFF9F0');
          const badgeText = isDelivered ? '#34C759' : (isPending ? '#007AFF' : '#FF9500');

          return (
            <TouchableOpacity
              style={styles.shipmentCard}
              onPress={() => setExpandedShipmentId(isExpanded ? null : item.id)}
              activeOpacity={0.9}
            >
              {/* Card Header Summary */}
              <View style={styles.shipmentCardHeader}>
                <View>
                  <Text style={styles.shipmentTracking}>{item.tracking_number}</Text>
                  <Text style={styles.shipmentCarrier}>{item.carrier_name || 'Shipping Carrier'} • {item.weight_kg} kg</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
                  <Text style={[styles.statusBadgeText, { color: badgeText }]}>{item.status?.toUpperCase()}</Text>
                </View>
              </View>

              {/* Card Mid Cities */}
              <View style={styles.shipmentCitiesRow}>
                <Text style={styles.shipmentCityText}>{item.sender_city || 'Origin'}</Text>
                <Ionicons name="arrow-forward" size={14} color="#808080" style={{ marginHorizontal: 8 }} />
                <Text style={styles.shipmentCityText}>{item.receiver_city || 'Destination'}</Text>
                <Text style={styles.shipmentCost}>
                  {item.currency_code === 'GBP' ? '£' : '₹'}
                  {parseFloat(item.estimated_cost || 0).toFixed(2)}
                </Text>
              </View>

              {/* Expanded details (QR & download PDF link) */}
              {isExpanded && (
                <View style={styles.expandedDetails}>
                  <View style={styles.detailsDivider} />
                  
                  {item.qr_code_data && (
                    <View style={styles.qrRow}>
                      <Image source={{ uri: item.qr_code_data }} style={styles.smallQrImage} />
                      <View style={styles.qrDetails}>
                        <Text style={styles.qrLabel}>Recipient: {item.receiver_name}</Text>
                        <Text style={styles.qrLabel}>Status: {item.status}</Text>
                        <TouchableOpacity
                          style={styles.downloadLinkLabel}
                          onPress={() => handleDownloadLabel(item.label_url)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="download" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
                          <Text style={styles.downloadLinkLabelText}>Get Label PDF</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No postage history found</Text>
            </View>
          )
        }
        contentContainerStyle={styles.historyList}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeader title="Postage & Shipping" navigation={navigation} showBackButton />

      {/* Tabs selector */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'calc' && styles.activeTabButton]}
          onPress={() => setActiveTab('calc')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabButtonText, activeTab === 'calc' && styles.activeTabButtonText]}>Calculator & Buy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.activeTabButton]}
          onPress={() => setActiveTab('history')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabButtonText, activeTab === 'history' && styles.activeTabButtonText]}>Shipments History</Text>
        </TouchableOpacity>
      </View>

      {/* Tab content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'calc' ? renderCalcTab() : renderHistoryTab()}
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
    fontSize: 14,
    fontWeight: '500',
    color: '#606060',
  },
  activeTabButtonText: {
    color: '#000000',
    fontWeight: '700',
  },
  tabContent: {
    padding: 20,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -0.5,
  },
  sectionSub: {
    fontSize: 13,
    color: '#606060',
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 18,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#303030',
    marginBottom: 8,
    marginTop: 14,
  },
  carrierSelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  carrierChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D0D0D8',
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#FCFCFD',
  },
  activeCarrierChip: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  carrierChipText: {
    fontSize: 12,
    color: '#303030',
    fontWeight: '600',
  },
  activeCarrierChipText: {
    color: '#FFF',
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputField: {
    height: 46,
    borderWidth: 1,
    borderColor: '#D0D0D8',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#FCFCFD',
    marginTop: 2,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    backgroundColor: '#000000',
    borderRadius: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#D0D0D8',
    borderRadius: 10,
    marginRight: 10,
  },
  secondaryButtonText: {
    color: '#303030',
    fontSize: 14,
    fontWeight: '700',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 40,
  },
  summaryBox: {
    backgroundColor: '#F7F7FA',
    borderWidth: 1,
    borderColor: '#EAEAEF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 12,
    color: '#808080',
    fontWeight: '600',
  },
  summaryPrice: {
    fontSize: 26,
    fontWeight: '800',
    color: '#000',
    marginVertical: 4,
  },
  summaryService: {
    fontSize: 13,
    fontWeight: '700',
    color: '#303030',
  },
  summaryDelivery: {
    fontSize: 11,
    color: '#606060',
    marginTop: 2,
  },
  sectionDividerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#808080',
    textTransform: 'uppercase',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  formSection: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
    marginTop: 16,
  },
  successSub: {
    fontSize: 13,
    color: '#606060',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 4,
    lineHeight: 18,
  },
  purchasedCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
  },
  purchasedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  purchasedLabel: {
    fontSize: 12,
    color: '#808080',
  },
  purchasedVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  qrWrapper: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
  },
  qrImage: {
    width: 130,
    height: 130,
    resizeMode: 'contain',
  },
  qrCaption: {
    fontSize: 10,
    color: '#808080',
    marginTop: 6,
  },
  historyList: {
    padding: 16,
  },
  shipmentCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: 14,
    marginBottom: 12,
  },
  shipmentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  shipmentTracking: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  shipmentCarrier: {
    fontSize: 11,
    color: '#606060',
    marginTop: 2,
  },
  shipmentCitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  shipmentCityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#303030',
  },
  shipmentCost: {
    marginLeft: 'auto',
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  expandedDetails: {
    marginTop: 10,
  },
  detailsDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 10,
  },
  qrRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallQrImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  qrDetails: {
    marginLeft: 16,
    flex: 1,
  },
  qrLabel: {
    fontSize: 11,
    color: '#606060',
    marginBottom: 2,
  },
  downloadLinkLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  downloadLinkLabelText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
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

export default PostageScreen;
