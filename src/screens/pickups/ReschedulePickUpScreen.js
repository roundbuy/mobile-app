import React, { useState } from 'react';
import { useTranslation } from '../../context/TranslationContext';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { COLORS } from '../../constants/theme';
import pickupService from '../../services/pickupService';

const ReschedulePickUpScreen = ({ route, navigation }) => {
    const { t } = useTranslation();
    const { pickupId, currentDate, currentTime } = route.params;

    const [selectedDate, setSelectedDate] = useState(currentDate || '');
    const [selectedTime, setSelectedTime] = useState(currentTime || '');
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Time slots from 9:00 AM to 6:00 PM
    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
    ];

    // Get minimum date (tomorrow)
    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    // Get maximum date (3 months from now)
    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        return maxDate.toISOString().split('T')[0];
    };

    const handleDateSelect = (day) => {
        setSelectedDate(day.dateString);
    };

    const handleTimeSelect = (time) => {
        setSelectedTime(time);
        setShowTimePicker(false);
    };

    const handleReschedule = async () => {
        // Validation
        if (!selectedDate) {
            Alert.alert(t('Error'), t('Please select a new pickup date'));
            return;
        }

        if (!selectedTime) {
            Alert.alert(t('Error'), t('Please select a new pickup time'));
            return;
        }

        if (!reason.trim()) {
            Alert.alert(t('Error'), t('Please provide a reason for rescheduling'));
            return;
        }

        try {
            setIsLoading(true);

            const response = await pickupService.reschedulePickup(pickupId, {
                scheduled_date: selectedDate,
                scheduled_time: selectedTime,
                reschedule_reason: reason.trim()
            });

            if (response.success) {
                Alert.alert(
                    t('Success'),
                    t('Pickup rescheduled successfully! The other party has been notified.'),
                    [
                        {
                            text: t('OK'),
                            onPress: () => navigation.goBack()
                        }
                    ]
                );
            }
        } catch (error) {
            console.error('Reschedule pickup error:', error);
            Alert.alert(
                t('Error'),
                error.message || t('Failed to reschedule pickup. Please try again.')
            );
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Reschedule Pick Up')}</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Current Schedule Info */}
                <View style={styles.currentSchedule}>
                    <Text style={styles.currentScheduleTitle}>{t('Current Schedule')}</Text>
                    <View style={styles.currentScheduleRow}>
                        <Ionicons name="calendar-outline" size={16} color="#666" />
                        <Text style={styles.currentScheduleText}>
                            {new Date(currentDate).toLocaleDateString('en-GB', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </Text>
                    </View>
                    <View style={styles.currentScheduleRow}>
                        <Ionicons name="time-outline" size={16} color="#666" />
                        <Text style={styles.currentScheduleText}>
                            {formatTime(currentTime)}
                        </Text>
                    </View>
                </View>

                {/* Calendar */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('Select New Date')}</Text>
                    <Calendar
                        minDate={getMinDate()}
                        maxDate={getMaxDate()}
                        onDayPress={handleDateSelect}
                        markedDates={{
                            [selectedDate]: {
                                selected: true,
                                selectedColor: COLORS.primary,
                            },
                        }}
                        theme={{
                            todayTextColor: COLORS.primary,
                            arrowColor: COLORS.primary,
                            selectedDayBackgroundColor: COLORS.primary,
                            selectedDayTextColor: '#ffffff',
                            textDayFontWeight: '500',
                            textMonthFontWeight: 'bold',
                            textDayHeaderFontWeight: '600',
                        }}
                    />
                    {selectedDate && (
                        <Text style={styles.selectedDateText}>
                            Selected: {new Date(selectedDate).toLocaleDateString('en-GB', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </Text>
                    )}
                </View>

                {/* Time Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('Select New Time')}</Text>
                    <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => setShowTimePicker(!showTimePicker)}
                    >
                        <Ionicons name="time-outline" size={20} color="#666" />
                        <Text style={styles.timeButtonText}>
                            {selectedTime ? formatTime(selectedTime) : 'Choose a time'}
                        </Text>
                        <Ionicons
                            name={showTimePicker ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color="#666"
                        />
                    </TouchableOpacity>

                    {showTimePicker && (
                        <View style={styles.timePickerContainer}>
                            <ScrollView style={styles.timeSlotsList} nestedScrollEnabled>
                                {timeSlots.map((time) => (
                                    <TouchableOpacity
                                        key={time}
                                        style={[
                                            styles.timeSlot,
                                            selectedTime === time && styles.selectedTimeSlot
                                        ]}
                                        onPress={() => handleTimeSelect(time)}
                                    >
                                        <Text
                                            style={[
                                                styles.timeSlotText,
                                                selectedTime === time && styles.selectedTimeSlotText
                                            ]}
                                        >
                                            {formatTime(time)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>

                {/* Reason */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('Reason for Rescheduling *')}</Text>
                    <TextInput
                        style={styles.reasonInput}
                        placeholder={t('Please explain why you need to reschedule...')}
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={4}
                        value={reason}
                        onChangeText={setReason}
                        maxLength={500}
                    />
                    <Text style={styles.characterCount}>{reason.length}/500</Text>
                </View>
            </ScrollView>

            {/* Bottom Button */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={[styles.rescheduleButton, isLoading && styles.rescheduleButtonDisabled]}
                    onPress={handleReschedule}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.rescheduleButtonText}>{t('Confirm Reschedule')}</Text>
                    )}
                </TouchableOpacity>
            </View>
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
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    headerRight: {
        width: 32,
    },
    content: {
        flex: 1,
    },
    currentSchedule: {
        backgroundColor: '#FFF3E0',
        padding: 16,
        margin: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FFE0B2',
    },
    currentScheduleTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#E65100',
        marginBottom: 12,
    },
    currentScheduleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    currentScheduleText: {
        fontSize: 14,
        color: '#666',
    },
    section: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 12,
    },
    selectedDateText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '500',
    },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    timeButtonText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#000',
    },
    timePickerContainer: {
        marginTop: 12,
        maxHeight: 200,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    timeSlotsList: {
        maxHeight: 200,
    },
    timeSlot: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    selectedTimeSlot: {
        backgroundColor: COLORS.primary,
    },
    timeSlotText: {
        fontSize: 16,
        color: '#000',
    },
    selectedTimeSlotText: {
        color: '#fff',
        fontWeight: '600',
    },
    reasonInput: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#000',
        minHeight: 100,
        textAlignVertical: 'top',
    },
    characterCount: {
        marginTop: 8,
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
    },
    bottomContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    rescheduleButton: {
        backgroundColor: '#9C27B0',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    rescheduleButtonDisabled: {
        opacity: 0.6,
    },
    rescheduleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

export default ReschedulePickUpScreen;
