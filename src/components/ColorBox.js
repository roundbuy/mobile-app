import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ColorBox = ({ colorName, hexCode, size = 'medium', showName = true, style }) => {
    const sizeMap = {
        small: 20,
        medium: 30,
        large: 40,
    };

    const boxSize = sizeMap[size] || sizeMap.medium;

    return (
        <View style={[styles.container, style]}>
            <View
                style={[
                    styles.colorBox,
                    {
                        width: boxSize,
                        height: boxSize,
                        backgroundColor: hexCode || '#ccc',
                    }
                ]}
            />
            {showName && colorName && (
                <Text style={styles.colorName}>{colorName}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    colorBox: {
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    colorName: {
        fontSize: 14,
        color: '#333',
        marginLeft: 8,
    },
});

export default ColorBox;
