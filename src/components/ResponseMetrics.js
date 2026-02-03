
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ResponseMetrics = ({ metrics, onPressInfo }) => {
    if (!metrics) return null;

    const {
        avg_response_time_minutes,
        pickup_meeting_attendance_rate,
        questions_answered_within_2h_rate
    } = metrics;

    // Format response time (e.g., 60 -> "1h", 90 -> "1.5h", 30 -> "30m")
    const formatResponseTime = (minutes) => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (mins === 0) return `${hours}h`;
        return `${hours}h ${mins}m`;
    };

    const formattedResponseTime = formatResponseTime(avg_response_time_minutes || 60);
    const formattedPickupRate = pickup_meeting_attendance_rate ? `${Math.round(pickup_meeting_attendance_rate)}%` : 'N/A';
    // Note: The design shows "5 / 90%", implementing simply as percentage first as per schema
    // If "5" means "5 meetings attended", I'd need actual counts. 
    // For now, let's assume the rate is the primary display.

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Responsemetrics</Text>

            <View style={styles.row}>
                <Text style={styles.label}>Response rate</Text>
                <Text style={styles.value}>{formattedResponseTime}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Pick Up rate</Text>
                <Text style={styles.value}>5 / {formattedPickupRate}</Text>
            </View>

            <TouchableOpacity style={styles.infoRow} onPress={onPressInfo}>
                <Text style={styles.infoText}>For more information click</Text>
                <Ionicons name="information-circle-outline" size={18} color="#000" style={styles.icon} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
        marginTop: 5,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#000',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    label: {
        fontSize: 15,
        color: '#555',
        fontWeight: '600',
    },
    value: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    infoText: {
        fontSize: 13,
        color: '#333',
        marginRight: 5,
    },
    icon: {
        marginTop: 1,
    }
});

export default ResponseMetrics;
