import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { Calendar } from 'react-native-calendars';
import ActionCardComponent from './ActionCardComponent';

const Step4ScheduleScreen = ({ navigation }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [notes, setNotes] = useState('');
    const [scheduleStatus, setScheduleStatus] = useState('propose'); // 'propose', 'confirmed', 'reschedule'

    // Time slots from 9:00 AM to 6:00 PM
    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
    ];

    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

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

    const formatTime = (time) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const handleProposeSchedule = () => {
        setScheduleStatus('confirmed');
    };

    const handleReschedule = () => {
        setScheduleStatus('reschedule');
    };

    const renderScheduleContent = () => {
        // Mock flag to simulate that the other user suggested this time, triggering the lockout.
        const isSuggestedByOtherUser = true;

        if (scheduleStatus === 'confirmed') {
            return (
                <View style={styles.statusCard}>
                    <Ionicons name="calendar-outline" size={64} color={COLORS.primary} style={styles.statusIcon} />
                    <Text style={styles.statusTitle}>Pick Up Proposed!</Text>
                    <Text style={styles.statusDetail}>
                        {selectedDate ? new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Date Pending'}
                    </Text>
                    <Text style={styles.statusDetailTime}>
                        at {selectedTime ? formatTime(selectedTime) : 'Time Pending'}
                    </Text>

                    {isSuggestedByOtherUser ? (
                        <View style={styles.actionRow}>
                            <Text style={{ textAlign: 'center', color: 'red', marginBottom: 16, fontWeight: 'bold' }}>
                                You cannot propose a new time. You must accept or decline.
                            </Text>
                            <TouchableOpacity style={styles.secondaryButton} onPress={() => setScheduleStatus('propose')}>
                                <Text style={styles.secondaryButtonText}>Decline</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={() => navigation.navigate('Step5DealConfirmationScreen')}
                            >
                                <Text style={styles.primaryButtonText}>Accept Schedule</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.secondaryButton} onPress={handleReschedule}>
                                <Text style={styles.secondaryButtonText}>Reschedule Pick Up</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={() => navigation.navigate('Step5DealConfirmationScreen')}
                            >
                                <Text style={styles.primaryButtonText}>Proceed to Deal</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            );
        }

        // 'propose' or 'reschedule' view
        return (
            <View style={styles.formCard}>
                <Text style={styles.formTitle}>
                    {scheduleStatus === 'reschedule' ? 'Reschedule Pick Up' : 'Schedule a Pick Up'}
                </Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Select Date</Text>
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

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Select Time</Text>
                    <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowTimePicker(!showTimePicker)}>
                        <Ionicons name="time" size={20} color="#666" style={styles.inputIcon} />
                        <Text style={styles.dateText}>{selectedTime ? formatTime(selectedTime) : 'Choose a time'}</Text>
                        <View style={{ flex: 1 }} />
                        <Ionicons name={showTimePicker ? 'chevron-up' : 'chevron-down'} size={20} color="#666" />
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

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Location / Note (Optional)</Text>
                    <TextInput
                        style={styles.noteInput}
                        placeholder="e.g. Meet in front of the coffee shop"
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                    />
                </View>

                <TouchableOpacity style={styles.primaryButtonBlock} onPress={handleProposeSchedule}>
                    <Text style={styles.primaryButtonTextBlock}>Propose Schedule</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Schedule Pick Up</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <ActionCardComponent
                    itemImage="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa"
                    userAvatar="https://randomuser.me/api/portraits/women/68.jpg"
                    itemTitle="Boots winter"
                    username="Robin37"
                    statusText="Schedule a Pick Up"
                    stepNumber="Step 4"
                    actionText="Action: Schedule a Pick Up!"
                    timestamp="2min"
                    onPress={() => { }}
                />
                {renderScheduleContent()}
            </ScrollView>
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
    },
    content: {
        padding: 24,
    },
    statusCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    statusIcon: {
        marginBottom: 16,
    },
    statusTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 16,
    },
    statusDetail: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    statusDetailTime: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
    },
    actionRow: {
        width: '100%',
        gap: 12,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
    },
    secondaryButtonText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 24,
        color: '#1a1a1a',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontWeight: '600',
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
    },
    inputIcon: {
        marginRight: 12,
    },
    selectedDateText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '500',
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
    dateText: {
        fontSize: 16,
        color: '#333',
    },
    noteInput: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        minHeight: 100,
        textAlignVertical: 'top',
        fontSize: 16,
    },
    primaryButtonBlock: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    primaryButtonTextBlock: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Step4ScheduleScreen;
