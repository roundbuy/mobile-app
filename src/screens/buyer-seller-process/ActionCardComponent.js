import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const ActionCardComponent = ({ itemImage, userAvatar, itemTitle, username, statusText, stepNumber, actionText, timestamp, onPress }) => {
    return (
        <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
            {/* Left section: Image and Avatar */}
            <View style={styles.imageSection}>
                {itemImage ? (
                    <Image source={{ uri: itemImage }} style={styles.productImage} />
                ) : (
                    <View style={[styles.productImage, styles.imagePlaceholder]} />
                )}
                {userAvatar ? (
                    <Image source={{ uri: userAvatar }} style={styles.userAvatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person" size={14} color="#fff" />
                    </View>
                )}
            </View>

            {/* Middle section: Titles and Status */}
            <View style={styles.infoSection}>
                <Text style={styles.itemTitle} numberOfLines={1}>{itemTitle}</Text>
                <Text style={styles.username} numberOfLines={1}>{username}</Text>
                <Text style={styles.statusText} numberOfLines={2}>{statusText}</Text>
                <Text style={styles.stepNumber}>{stepNumber}</Text>
            </View>

            {/* Right section: Timestamp and Action Link */}
            <View style={styles.actionSection}>
                <Text style={styles.timestamp}>{timestamp}</Text>
                <Text style={styles.actionPrompt}>{actionText}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    imageSection: {
        width: 70,
        height: 70,
        marginRight: 12,
        position: 'relative',
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
    },
    imagePlaceholder: {
        backgroundColor: '#e0e0e0',
    },
    userAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        position: 'absolute',
        bottom: 2,
        right: 2,
        borderWidth: 2,
        borderColor: '#fff',
        backgroundColor: '#ccc',
    },
    avatarPlaceholder: {
        width: 28,
        height: 28,
        borderRadius: 14,
        position: 'absolute',
        bottom: 2,
        right: 2,
        borderWidth: 2,
        borderColor: '#fff',
        backgroundColor: '#888',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoSection: {
        flex: 1,
        justifyContent: 'center',
    },
    itemTitle: {
        fontSize: 14,
        color: '#444',
    },
    username: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
        marginTop: 2,
    },
    statusText: {
        fontSize: 13,
        color: '#444',
        marginTop: 4,
    },
    stepNumber: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    actionSection: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginLeft: 8,
    },
    timestamp: {
        fontSize: 12,
        color: '#222',
        fontWeight: '500',
    },
    actionPrompt: {
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});

export default ActionCardComponent;
