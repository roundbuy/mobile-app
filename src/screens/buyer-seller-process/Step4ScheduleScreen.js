import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, ActivityIndicator, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { Calendar } from 'react-native-calendars';
import api from '../../services/api';
import { getFullImageUrl } from '../../utils/imageUtils';

const Step4ScheduleScreen = ({ navigation, route }) => {
    const { advertisementId, offerId, role, otherUserName, offerAmount } = route?.params || {};

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [pickupId, setPickupId] = useState(null);
    const [activePickup, setActivePickup] = useState(null);

    const [selectedDate, setSelectedDate] = useState('');
    const [timeInput, setTimeInput] = useState('9:00');
    const [amPm, setAmPm] = useState('am');
    const [notes, setNotes] = useState('');
    const [scheduleStatus, setScheduleStatus] = useState('propose'); // 'propose', 'confirmed'

    useEffect(() => {
        fetchExistingPickup();
    }, []);

    const fetchExistingPickup = async () => {
        if (!advertisementId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await api.get(`/pickups?advertisement_id=${advertisementId}`);
            if (response.data.success && response.data.pickups && response.data.pickups.length > 0) {
                // Find active pickup
                const active = response.data.pickups.find(p => p.status !== 'cancelled');
                if (active) {
                    setActivePickup(active);
                    setPickupId(active.id);
                    setScheduleStatus('confirmed');

                    if (active.scheduled_date) {
                        try {
                            const d = new Date(active.scheduled_date);
                            setSelectedDate(d.toISOString().split('T')[0]);
                        } catch (e) { }
                    }
                    if (active.scheduled_time) {
                        const [hours, minutes] = active.scheduled_time.split(':');
                        let h = parseInt(hours);
                        const isPm = h >= 12;
                        setAmPm(isPm ? 'pm' : 'am');
                        h = h > 12 ? h - 12 : (h === 0 ? 12 : h);
                        setTimeInput(`${h}:${minutes}`);
                    }
                    if (active.description) {
                        setNotes(active.description);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching pickup:', error);
        } finally {
            setLoading(false);
        }
    };

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

    const formatDbTime = () => {
        const [hourStr, minStr] = timeInput.split(':');
        let hour = parseInt(hourStr || '9');
        const min = minStr || '00';

        if (amPm === 'pm' && hour < 12) hour += 12;
        if (amPm === 'am' && hour === 12) hour = 0;

        return `${hour.toString().padStart(2, '0')}:${min.padStart(2, '0')}:00`;
    };

    const handleProposeSchedule = async () => {
        if (!selectedDate || !timeInput) {
            Alert.alert('Error', 'Please select a date and enter a time.');
            return;
        }

        try {
            setSubmitting(true);

            if (scheduleStatus === 'confirmed' && pickupId) {
                // Reschedule
                const response = await api.put(`/pickups/${pickupId}/reschedule`, {
                    scheduled_date: selectedDate,
                    scheduled_time: formatDbTime(),
                    description: notes
                });

                if (response.data.success) {
                    Alert.alert('Success', 'Schedule updated successfully!');
                    fetchExistingPickup();
                }
            } else {
                // Create new
                const response = await api.post('/pickups/schedule', {
                    advertisement_id: advertisementId,
                    offer_id: offerId || 1,
                    scheduled_date: selectedDate,
                    scheduled_time: formatDbTime(),
                    description: notes
                });

                if (response.data.success) {
                    Alert.alert('Success', 'Pickup proposed successfully!');
                    fetchExistingPickup();
                }
            }
        } catch (error) {
            console.error('Schedule pickup error:', error.response?.data || error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to schedule pickup.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelPickup = async () => {
        Alert.alert(
            'Cancel Pick Up',
            'Are you sure you want to cancel this scheduled pick up?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        if (!pickupId) return;
                        try {
                            setSubmitting(true);
                            await api.delete(`/pickups/${pickupId}/cancel`);
                            Alert.alert('Success', 'Pick up cancelled.');
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to cancel pick up.');
                        } finally {
                            setSubmitting(false);
                        }
                    }
                }
            ]
        );
    };

    const renderCustomArrow = (direction) => {
        return (
            <View style={styles.calendarArrowContainer}>
                <Ionicons
                    name={direction === 'left' ? 'chevron-back' : 'chevron-forward'}
                    size={20}
                    color="#000"
                />
            </View>
        );
    };

    const formattedDateDisplay = () => {
        if (!selectedDate) return 'Pending Date';
        const d = new Date(selectedDate);
        return `${d.getDate()} ${d.toLocaleDateString('en-GB', { month: 'long' })} - ${timeInput} ${amPm}`;
    };

    const getOppositePartyAvatar = () => {
        if (!activePickup) return null;
        if (role === 'selling') return activePickup.buyer_avatar;
        return activePickup.seller_avatar;
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                    <Text style={styles.headerTitle}>Schedule a Pick Up</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Calendar Redesign */}
                <View style={styles.calendarWrapper}>
                    <Calendar
                        minDate={getMinDate()}
                        maxDate={getMaxDate()}
                        onDayPress={handleDateSelect}
                        renderArrow={renderCustomArrow}
                        hideExtraDays={true}
                        disableMonthChange={true}
                        firstDay={1}
                        theme={{
                            backgroundColor: '#ffffff',
                            calendarBackground: '#ffffff',
                            textSectionTitleColor: '#666',
                            selectedDayBackgroundColor: 'transparent',
                            selectedDayTextColor: '#000',
                            todayTextColor: COLORS.primary,
                            dayTextColor: '#2d4150',
                            textDisabledColor: '#d9e1e8',
                            dotColor: '#00adf5',
                            selectedDotColor: '#ffffff',
                            arrowColor: '#000',
                            monthTextColor: '#000',
                            indicatorColor: 'blue',
                            textDayFontWeight: '500',
                            textMonthFontWeight: 'bold',
                            textDayHeaderFontWeight: '600',
                            textDayFontSize: 14,
                            textMonthFontSize: 16,
                            textDayHeaderFontSize: 12,
                            'stylesheet.day.basic': {
                                selected: {
                                    backgroundColor: 'transparent',
                                    borderWidth: 1,
                                    borderColor: '#000',
                                    borderRadius: 20,
                                }
                            }
                        }}
                        markedDates={{
                            [selectedDate]: {
                                selected: true,
                            },
                        }}
                    />
                </View>

                {/* Inline Time Selector */}
                <View style={styles.timeSection}>
                    <Text style={styles.timeLabel}>Time</Text>
                    <TextInput
                        style={styles.timeInput}
                        value={timeInput}
                        onChangeText={setTimeInput}
                        keyboardType="numeric"
                        maxLength={5}
                    />
                    <View style={styles.amPmToggle}>
                        <TouchableOpacity
                            style={[styles.amPmBtn, styles.amPmBtnLeft, amPm === 'am' && styles.amPmBtnActive]}
                            onPress={() => setAmPm('am')}
                        >
                            <Text style={styles.amPmText}>am</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.amPmBtn, styles.amPmBtnRight, amPm === 'pm' && styles.amPmBtnActive]}
                            onPress={() => setAmPm('pm')}
                        >
                            <Text style={styles.amPmText}>pm</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Questions Input Box */}
                <View style={styles.questionsSection}>
                    <Text style={styles.questionsLabel}>Questions</Text>
                    <TextInput
                        style={styles.questionsInput}
                        placeholder="Write questions or concerns here! For your safety, don't share any personal data!"
                        placeholderTextColor="#999"
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                    />
                </View>

                {/* Light Blue Summary Card */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryTop}>
                        <View style={styles.summaryUser}>
                            {getOppositePartyAvatar() ? (
                                <Image source={{ uri: getFullImageUrl(getOppositePartyAvatar()) }} style={styles.summaryAvatar} />
                            ) : (
                                <View style={styles.summaryAvatarFallback}>
                                    <Ionicons name="person" size={20} color="#fff" />
                                </View>
                            )}
                            <Text style={styles.summaryUsername}>{otherUserName || 'User'}</Text>
                        </View>
                        <Text style={styles.summaryOffer}>
                            Your offer <Text style={styles.summaryOfferPrice}>£{offerAmount || '0.00'}</Text>
                        </Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryBottom}>
                        <Ionicons name="calendar-outline" size={20} color="#000" />
                        <Text style={styles.summaryDateText}>{formattedDateDisplay()}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleProposeSchedule}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>
                            {scheduleStatus === 'confirmed' ? 'Reschedule' : 'Suggest a date'}
                        </Text>
                    )}
                </TouchableOpacity>

                {scheduleStatus === 'confirmed' && (
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancelPickup}
                        disabled={submitting}
                    >
                        <Text style={styles.cancelButtonText}>Cancel Pick Up</Text>
                    </TouchableOpacity>
                )}

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    content: {
        padding: 20,
        paddingTop: 10,
    },
    calendarWrapper: {
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 20,
    },
    calendarArrowContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    timeLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 20,
    },
    timeInput: {
        width: 80,
        textAlign: 'center',
        fontSize: 16,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        marginRight: 20,
    },
    amPmToggle: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 4,
    },
    amPmBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    amPmBtnLeft: {
        borderRightWidth: 1,
        borderRightColor: '#000',
    },
    amPmBtnRight: {},
    amPmBtnActive: {
        backgroundColor: '#f0f0f0', // Slight highlight for active state
    },
    amPmText: {
        fontSize: 14,
        fontWeight: '600',
    },
    questionsSection: {
        marginBottom: 30,
    },
    questionsLabel: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 10,
    },
    questionsInput: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 16,
        minHeight: 100,
        textAlignVertical: 'top',
        fontSize: 14,
    },
    summaryCard: {
        backgroundColor: '#DEE8F5',
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
    },
    summaryTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    summaryUser: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10,
    },
    summaryAvatarFallback: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#999',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    summaryUsername: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    summaryOffer: {
        fontSize: 12,
        color: '#555',
    },
    summaryOfferPrice: {
        fontWeight: 'bold',
        color: '#000',
        fontSize: 14,
    },
    summaryDivider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginBottom: 12,
    },
    summaryBottom: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryDateText: {
        marginLeft: 10,
        fontSize: 14,
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#003399',
        paddingVertical: 16,
        borderRadius: 24, // Fully rounded matching mockup
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#F5F5F5',
        paddingVertical: 16,
        borderRadius: 24,
        alignItems: 'center',
        marginTop: 12,
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default Step4ScheduleScreen;
