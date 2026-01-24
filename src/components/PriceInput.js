import React from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
} from 'react-native';
import { COLORS } from '../constants/theme';

const PriceInput = ({ price, onPriceChange, label = 'Price' }) => {
    const handlePriceChange = (text) => {
        // Only allow numeric input
        const numericValue = text.replace(/[^0-9]/g, '');
        onPriceChange(numericValue);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                value={price}
                onChangeText={handlePriceChange}
                placeholder="Enter price"
                keyboardType="numeric"
                placeholderTextColor="#999"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 16,
    },
    label: {
        fontSize: 15,
        color: '#000',
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 15,
        color: '#000',
    },
});

export default PriceInput;
