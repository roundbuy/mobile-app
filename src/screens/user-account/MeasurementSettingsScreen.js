import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/TranslationContext';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/theme';
import GlobalHeader from '../../components/GlobalHeader';
import SuggestionsFooter from '../../components/SuggestionsFooter';

const MEASUREMENT_UNITS = [
    { id: 'km', label: 'Kilometers (km)', description: 'Metric system - Default' },
    { id: 'mi', label: 'Miles (mi)', description: 'Imperial system' },
    { id: 'm', label: 'Meters (m)', description: 'Metric system - Short distances' },
];

const MeasurementSettingsScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [selectedUnit, setSelectedUnit] = useState('km'); // Default to kilometers
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMeasurementUnit();
    }, []);

    const loadMeasurementUnit = async () => {
        try {
            const savedUnit = await AsyncStorage.getItem('measurementUnit');
            if (savedUnit) {
                setSelectedUnit(savedUnit);
            }
        } catch (error) {
            console.error('Error loading measurement unit:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveMeasurementUnit = async (unit) => {
        try {
            await AsyncStorage.setItem('measurementUnit', unit);
            setSelectedUnit(unit);
            Alert.alert(
                t('Success'),
                `Measurement unit changed to ${MEASUREMENT_UNITS.find(u => u.id === unit)?.label}`,
                [{ text: 'OK' }]
            );
        } catch (error) {
            console.error('Error saving measurement unit:', error);
            Alert.alert(t('Error'), t('Failed to save measurement unit. Please try again.'));
        }
    };

    const handleSelectUnit = (unit) => {
        if (unit !== selectedUnit) {
            Alert.alert(
                t('Change Measurement Unit'),
                `Change to ${MEASUREMENT_UNITS.find(u => u.id === unit)?.label}?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Change', onPress: () => saveMeasurementUnit(unit) },
                ]
            );
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <GlobalHeader
                title={t('Measurement Unit')}
                navigation={navigation}
                showBackButton={true}
            />

            <ScrollView style={styles.content}>
                <Text style={styles.description}>{t('Select your preferred unit of measurement for distances. This will be used throughout the app.')}</Text>

                <View style={styles.optionsContainer}>
                    {MEASUREMENT_UNITS.map((unit) => (
                        <TouchableOpacity
                            key={unit.id}
                            style={[
                                styles.optionItem,
                                selectedUnit === unit.id && styles.selectedOption,
                            ]}
                            onPress={() => handleSelectUnit(unit.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.optionContent}>
                                <View style={styles.optionTextContainer}>
                                    <Text style={styles.optionLabel}>{unit.label}</Text>
                                    <Text style={styles.optionDescription}>{unit.description}</Text>
                                </View>
                                {selectedUnit === unit.id && (
                                    <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.infoText}>{t('This setting affects distance displays in search results, filters, and maps.')}</Text>
                </View>
                <SuggestionsFooter sourceRoute="MeasurementSettings" />
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
    },
    description: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
        marginTop: 20,
        marginBottom: 24,
    },
    optionsContainer: {
        marginBottom: 24,
    },
    optionItem: {
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    selectedOption: {
        borderColor: COLORS.primary,
        backgroundColor: '#f5f8ff',
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    optionTextContainer: {
        flex: 1,
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: 14,
        color: '#666',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#f5f8ff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginLeft: 12,
    },
});

export default MeasurementSettingsScreen;
