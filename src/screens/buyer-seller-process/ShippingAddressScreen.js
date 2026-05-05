import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import api from '../../services/api';

const ShippingAddressScreen = ({ navigation, route }) => {
    const { savedAddress, onSave } = route?.params || {};

    const [loading, setLoading] = useState(false);

    const [fullName, setFullName] = useState(savedAddress?.fullName || '');
    const [phone, setPhone] = useState(savedAddress?.phone || '');
    const [addressLine1, setAddressLine1] = useState(savedAddress?.addressLine1 || '');
    const [addressLine2, setAddressLine2] = useState(savedAddress?.addressLine2 || '');
    const [postcode, setPostcode] = useState(savedAddress?.postcode || '');
    const [city, setCity] = useState(savedAddress?.city || '');
    const [country, setCountry] = useState(savedAddress?.country || 'United Kingdom');

    const handleSave = async () => {
        if (!fullName || !phone || !addressLine1 || !postcode || !city) {
            Alert.alert('Required Fields', 'Please fill in all mandatory fields including your phone number.');
            return;
        }

        try {
            setLoading(true);
            const addressData = {
                fullName,
                phone,
                addressLine1,
                addressLine2,
                postcode,
                city,
                country
            };

            const response = await api.post('/checkout/save-address', addressData);

            if (response.data.success) {
                if (onSave) {
                    onSave(addressData);
                }
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error saving address:', error);
            Alert.alert('Error', 'Failed to save address details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Shipping address</Text>
                </View>

                <ScrollView contentContainerStyle={styles.content}>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="i.e. John Hart"
                            placeholderTextColor="#999"
                            value={fullName}
                            onChangeText={setFullName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="+ Your phone number"
                            placeholderTextColor="#999"
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={setPhone}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Address line 1</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="i.e. Piccadilly Circus 57"
                            placeholderTextColor="#999"
                            value={addressLine1}
                            onChangeText={setAddressLine1}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Address line 2</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="i.e. Second Floor"
                            placeholderTextColor="#999"
                            value={addressLine2}
                            onChangeText={setAddressLine2}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Postcode</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="i.e. W1J 9HP"
                            placeholderTextColor="#999"
                            autoCapitalize="characters"
                            value={postcode}
                            onChangeText={setPostcode}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>City</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="i.e. London"
                            placeholderTextColor="#999"
                            value={city}
                            onChangeText={setCity}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Country</Text>
                        <View style={styles.pickerFake}>
                            <Text style={styles.pickerFakeText}>{country}</Text>
                            <Ionicons name="chevron-down" size={20} color="#000" />
                        </View>
                        {/* Currently keeping country static/fake dropdown for layout match. A true picker can be added later. */}
                    </View>

                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.saveButton, loading && styles.disabledButton]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save address</Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.disclaimerLink}>
                        <Text style={styles.disclaimerText}>Our <Text style={styles.disclaimerLinkText}>Location & Safety Disclaimers</Text></Text>
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
        padding: 16,
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 4,
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    content: {
        padding: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 12,
        fontSize: 14,
        color: '#000',
        backgroundColor: '#fff',
    },
    pickerFake: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 12,
        backgroundColor: '#fff',
    },
    pickerFakeText: {
        fontSize: 14,
        color: '#000',
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
        backgroundColor: '#fff',
    },
    saveButton: {
        backgroundColor: '#001A5C', // Dark exact blue from design
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.7,
    },
    disclaimerLink: {
        alignItems: 'center',
    },
    disclaimerText: {
        fontSize: 12,
        color: '#666',
    },
    disclaimerLinkText: {
        color: COLORS.primary,
        textDecorationLine: 'underline',
    }
});

export default ShippingAddressScreen;
