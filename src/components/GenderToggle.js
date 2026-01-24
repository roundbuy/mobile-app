import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { COLORS } from '../constants/theme';

const GenderToggle = ({ selected, onChange, options = ['Men', 'Women', 'Children'], style }) => {
    return (
        <View style={[styles.container, style]}>
            {options.map((option) => (
                <TouchableOpacity
                    key={option}
                    style={[
                        styles.button,
                        selected === option && styles.buttonSelected
                    ]}
                    onPress={() => onChange(option)}
                    activeOpacity={0.7}
                >
                    <Text style={[
                        styles.buttonText,
                        selected === option && styles.buttonTextSelected
                    ]}>
                        {option}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 4,
    },
    button: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonSelected: {
        backgroundColor: COLORS.primary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    buttonTextSelected: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default GenderToggle;
