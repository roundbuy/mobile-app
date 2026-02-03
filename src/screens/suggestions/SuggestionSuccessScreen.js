import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';

const SuggestionSuccessScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={COLORS.black} />
                </TouchableOpacity>
                <View style={{ width: 28 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="checkmark-circle-outline" size={80} color={COLORS.success} />
                </View>
                <Text style={styles.title}>Thank you for the suggestions & feedback!</Text>
                <Text style={styles.subtitle}>We make every effort to meet you expectations.</Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.pop(2)}
                >
                    <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        paddingTop: 44, // Safe area
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 50,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    iconContainer: {
        marginBottom: 24,
    },
    title: {
        ...TYPOGRAPHY.styles.h2,
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        ...TYPOGRAPHY.styles.bodyMedium,
        color: COLORS.grayMedium,
        textAlign: 'center',
        marginBottom: 48,
    },
    button: {
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: COLORS.grayLight,
        borderRadius: 24,
    },
    buttonText: {
        ...TYPOGRAPHY.styles.button,
        color: COLORS.black,
    }
});

export default SuggestionSuccessScreen;
