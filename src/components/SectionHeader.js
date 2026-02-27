import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * SectionHeader Component
 * Displays section titles
 * Parent component should add horizontal lines before and after
 */
const SectionHeader = ({ title }) => {
    if (!title) {
        return null;
    }

    return (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionContainer: {
        marginVertical: 8,
        paddingHorizontal: 5,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#e0e0e0ff',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});

export default SectionHeader;
